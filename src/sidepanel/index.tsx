import { useState } from "react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent } from "../components/ui/card";
import "../style.css"

function MarkdownContent({ content }: { content: string }) {
  const renderMarkdown = (text: string) => {
    const lines = text.split("\n");
    const elements: JSX.Element[] = [];
    let listItems: string[] = [];
    let inList = false;

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={elements.length} className="list-disc ml-4 mb-3">
            {listItems.map((item, i) => (
              <li key={i} className="mb-1">
                {processInlineMarkdown(item)}
              </li>
            ))}
          </ul>
        );
        listItems = [];
        inList = false;
      }
    };

    const processInlineMarkdown = (text: string) => {
      const parts: (string | JSX.Element)[] = [];
      let key = 0;

      const boldRegex = /\*\*(.+?)\*\*/g;
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          parts.push(text.substring(lastIndex, match.index));
        }
        parts.push(
          <strong key={key++} className="font-semibold">
            {match[1]}
          </strong>
        );
        lastIndex = match.index + match[0].length;
      }
      if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
      }

      return parts.length > 0 ? <>{parts}</> : text;
    };

    lines.forEach((line, idx) => {
      if (line.startsWith("### ")) {
        flushList();
        elements.push(
          <h3 key={idx} className="text-base font-bold mt-3 mb-2">
            {processInlineMarkdown(line.slice(4))}
          </h3>
        );
      } else if (line.startsWith("## ")) {
        flushList();
        elements.push(
          <h2 key={idx} className="text-lg font-bold mt-4 mb-2">
            {processInlineMarkdown(line.slice(3))}
          </h2>
        );
      } else if (line.startsWith("# ")) {
        flushList();
        elements.push(
          <h1 key={idx} className="text-xl font-bold mt-4 mb-3">
            {processInlineMarkdown(line.slice(2))}
          </h1>
        );
      }
      else if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        inList = true;
        listItems.push(line.trim().slice(2));
      }
      else if (line.trim() === "---") {
        flushList();
        elements.push(<hr key={idx} className="my-4 border-border" />);
      }
      else if (line.trim()) {
        flushList();
        elements.push(
          <p key={idx} className="mb-2">
            {processInlineMarkdown(line)}
          </p>
        );
      }
      else {
        flushList();
      }
    });

    flushList();
    return elements;
  };

  return <div className="space-y-1">{renderMarkdown(content)}</div>;
}

export default function SidePanel() {
  const [aiResponse, setAiResponse] = useState<string>("");
  const [userQuestion, setUserQuestion] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageContext, setPageContext] = useState<string>("");

  async function runGeminiPrompt(prompt: string) {
    console.log("🧠 Creating Gemini session...");
    const session = await (window as any).LanguageModel.create({
      systemPrompt:
        "You are an expert AI assistant that analyzes and answers questions about webpages. Always format your responses in clear, readable markdown.",
      temperature: 0.7,
      topK: 3,
      outputLanguage: "en",
    });

    try {
      console.log("⚡ Sending prompt to Gemini:", prompt.slice(0, 200) + "...");
      const response = await session.prompt(prompt);
      console.log("✅ Gemini response received.");
      await session.destroy();
      return response.trim();
    } catch (e) {
      console.error("❌ LanguageModel Error:", e);
      await session.destroy();
      throw e;
    }
  }

  async function analyzePage() {
    console.log("🚀 analyzePage triggered");
    setLoading(true);
    setError(null);
    setAiResponse("");

    try {
      console.log("📩 Getting active tab...");
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab?.id) {
        throw new Error("No active tab found");
      }

      console.log("💉 Executing script directly...");
      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const title = document.title;
          const url = location.href;

          const metaDesc = document.querySelector('meta[name="description"]');
          const desc = metaDesc ? (metaDesc as HTMLMetaElement).content : "";

          const metaKeywords = document.querySelector('meta[name="keywords"]');
          const keywords = metaKeywords
            ? (metaKeywords as HTMLMetaElement).content
            : "";

          const ogTitle = document.querySelector('meta[property="og:title"]');
          const openGraphTitle = ogTitle
            ? (ogTitle as HTMLMetaElement).content
            : "";

          const ogType = document.querySelector('meta[property="og:type"]');
          const pageType = ogType ? (ogType as HTMLMetaElement).content : "";

          const h1s = Array.from(document.querySelectorAll("h1"))
            .map((h) => h.textContent?.trim())
            .filter(Boolean);
          const h2s = Array.from(document.querySelectorAll("h2"))
            .map((h) => h.textContent?.trim())
            .filter(Boolean)
            .slice(0, 10);

          const links = Array.from(document.querySelectorAll("a[href]"))
            .map((a) => ({
              text: a.textContent?.trim(),
              href: (a as HTMLAnchorElement).href,
            }))
            .filter((l) => l.text && l.text.length > 0)
            .slice(0, 20);

          const images = Array.from(document.querySelectorAll("img[src]"))
            .map((img) => ({
              alt: (img as HTMLImageElement).alt,
              src: (img as HTMLImageElement).src,
            }))
            .slice(0, 10);

          const text = document.body.innerText.slice(0, 15000);

          const article = document.querySelector("article");
          const main = document.querySelector("main");
          const mainContent = article?.innerText || main?.innerText || "";

          return {
            title,
            url,
            desc,
            keywords,
            openGraphTitle,
            pageType,
            h1s,
            h2s: h2s.slice(0, 8),
            links: links.slice(0, 15),
            images: images.slice(0, 8),
            text,
            mainContent: mainContent.slice(0, 10000),
            hasArticle: !!article,
            hasMain: !!main,
          };
        },
      });

      const response = result[0].result;
      console.log("✅ Page context received:", response);

      const context = `
# Page Information
- **Title**: ${response.title}
- **URL**: ${response.url}
- **Description**: ${response.desc}
${response.keywords ? `- **Keywords**: ${response.keywords}` : ""}
${response.pageType ? `- **Type**: ${response.pageType}` : ""}

${response.h1s.length > 0 ? `## Main Headings\n${response.h1s.map((h) => `- ${h}`).join("\n")}` : ""}

${response.h2s.length > 0 ? `## Subheadings\n${response.h2s.map((h) => `- ${h}`).join("\n")}` : ""}

${response.mainContent ? `## Main Content\n${response.mainContent}` : `## Full Content\n${response.text}`}

${
  response.links.length > 0
    ? `## Key Links\n${response.links
        .slice(0, 10)
        .map((l) => `- [${l.text}](${l.href})`)
        .join("\n")}`
    : ""
}
`;

      setPageContext(context);

      const prompt = `
Analyze this webpage and provide:

## Summary
Write a 2-3 sentence overview of what this page is about.

## Key Topics
List the main topics, entities, or subjects discussed (bullet points).

## Page Intent
Identify the primary purpose (e.g., blog post, product page, documentation, news article, forum discussion, etc.).

## Notable Insights
Highlight 2-3 interesting or important takeaways from the content.

${context}`;

      console.log("🧠 Sending context to Gemini...");
      const aiResult = await runGeminiPrompt(prompt);
      setAiResponse(aiResult);
      console.log("✅ AI analysis complete.");
    } catch (e: any) {
      console.error("❌ analyzePage error:", e);
      setError(e.message || String(e));
    } finally {
      console.log("🏁 analyzePage finished");
      setLoading(false);
    }
  }

  async function askQuestion() {
    if (!userQuestion.trim()) {
      console.warn("⚠️ Tried to ask empty question.");
      return;
    }

    console.log("💬 Asking follow-up question:", userQuestion);
    setLoading(true);
    setError(null);

    try {
      const prompt = `
Based on the webpage analysis below, answer this question:

**Question**: ${userQuestion}

Provide a clear, factual answer using only the context provided. Format your response in markdown.

${pageContext}`;

      const response = await runGeminiPrompt(prompt);
      console.log("✅ Gemini follow-up response received.");

      setAiResponse(
        (prev) =>
          prev + `\n\n---\n\n### 💬 Question: ${userQuestion}\n\n${response}`
      );
      setUserQuestion("");
    } catch (e: any) {
      console.error("❌ askQuestion error:", e);
      setError(e.message || String(e));
    } finally {
      console.log("🏁 askQuestion finished");
      setLoading(false);
    }
  }

  return (
    <div className="p-4 w-full bg-background text-foreground h-full overflow-y-auto">
      <Card>
        <CardContent className="flex flex-col gap-4 p-4">
          <div>
            <h2 className="text-xl font-bold">AI Page Analyzer</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Analyze the current page using Gemini Nano
            </p>
          </div>

          <Button onClick={analyzePage} disabled={loading} className="w-full">
            {loading ? "Analyzing…" : "🔍 Analyze Current Page"}
          </Button>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          {aiResponse && (
            <div className="border rounded-lg p-4 bg-muted/30 max-h-[450px] overflow-y-auto text-sm">
              <MarkdownContent content={aiResponse} />
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2 border-t">
            <Textarea
              placeholder="Ask a follow-up question about this page..."
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              className="h-20 resize-none text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  askQuestion();
                }
              }}
            />
            <Button
              onClick={askQuestion}
              disabled={loading || !aiResponse}
              className="w-full"
            >
              {loading ? "Thinking…" : "💬 Ask Question"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
