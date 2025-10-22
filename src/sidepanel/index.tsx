import { useState, useRef, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Send, Sparkles } from "lucide-react";
import "~/style.css";

function MarkdownContent({ content }: { content: string }) {
  const renderMarkdown = (text: string) => {
    const lines = text.split("\n");
    const elements: JSX.Element[] = [];
    let listItems: string[] = [];

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
      } else if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        listItems.push(line.trim().slice(2));
      } else if (line.trim() === "---") {
        flushList();
        elements.push(<hr key={idx} className="my-4 border-border" />);
      } else if (line.trim()) {
        flushList();
        elements.push(
          <p key={idx} className="mb-2">
            {processInlineMarkdown(line)}
          </p>
        );
      } else {
        flushList();
      }
    });

    flushList();
    return elements;
  };

  return <div className="space-y-1">{renderMarkdown(content)}</div>;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function SidePanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userQuestion, setUserQuestion] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [pageContext, setPageContext] = useState<string>("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  async function runGeminiPrompt(prompt: string, retries = 2) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const session = await (window as any).LanguageModel.create({
          systemPrompt:
            "You are a helpful AI assistant analyzing webpages. Be precise and factual. CRITICAL: Only state information that is directly present in the provided context. If you cannot find specific information in the context, explicitly say so rather than making assumptions or generating plausible-sounding but unverified information. When discussing code, only mention code patterns and technologies that are explicitly shown in the provided code blocks.",
          temperature: 0.3,
          topK: 2,
        });

        try {
          const response = await session.prompt(prompt);
          await session.destroy();

          const lowerResponse = response.toLowerCase();
          if (
            lowerResponse.includes("i don't have enough") ||
            lowerResponse.includes("insufficient") ||
            lowerResponse.includes("cannot analyze") ||
            lowerResponse.includes("not enough information") ||
            lowerResponse.includes("unable to provide")
          ) {
            if (attempt < retries) {
              continue;
            }
            return "Based on the available information:\n\n" + response.trim();
          }

          return response.trim();
        } catch (e) {
          await session.destroy();
          throw e;
        }
      } catch (e) {
        if (attempt === retries) {
          throw new Error(
            "Failed to get response from Gemini. Please try again."
          );
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    throw new Error("Failed to get response from Gemini");
  }

  async function analyzePage() {
    setLoading(true);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: "Analyze this page" },
    ]);

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab?.id) {
        throw new Error("No active tab found");
      }

      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const title = document.title;
          const url = location.href;
          const lang = document.documentElement.lang || "en";

          const metaDesc = document.querySelector('meta[name="description"]');
          const desc = metaDesc ? (metaDesc as HTMLMetaElement).content : "";

          const metaKeywords = document.querySelector('meta[name="keywords"]');
          const keywords = metaKeywords
            ? (metaKeywords as HTMLMetaElement).content
            : "";

          const ogType = document.querySelector('meta[property="og:type"]');
          const pageType = ogType ? (ogType as HTMLMetaElement).content : "";

          const h1s = Array.from(document.querySelectorAll("h1"))
            .map((h) => h.textContent?.trim())
            .filter(Boolean);

          const h2s = Array.from(document.querySelectorAll("h2"))
            .map((h) => h.textContent?.trim())
            .filter(Boolean)
            .slice(0, 12);

          const links = Array.from(document.querySelectorAll("a[href]"))
            .map((a) => a.textContent?.trim())
            .filter((t) => t && t.length > 0)
            .slice(0, 20);

          const images = Array.from(document.querySelectorAll("img[alt]"))
            .map((img) => (img as HTMLImageElement).alt)
            .filter(Boolean)
            .slice(0, 15);

          const codeBlocks: Array<{ language: string; code: string }> = [];

          document.querySelectorAll("pre code, pre").forEach((el) => {
            const codeText = el.textContent?.trim();
            if (codeText && codeText.length > 15 && codeText.length < 3000) {
              const className =
                el.className || el.parentElement?.className || "";
              const langMatch = className.match(
                /language-(\w+)|lang-(\w+)|highlight-(\w+)/
              );
              const language = langMatch
                ? langMatch[1] || langMatch[2] || langMatch[3]
                : "code";

              codeBlocks.push({
                language,
                code: codeText.slice(0, 1200),
              });
            }
          });

          const text = document.body.innerText.slice(0, 12000);

          const article = document.querySelector("article");
          const main = document.querySelector("main");
          const mainContent = article?.innerText || main?.innerText || "";

          const paragraphs = Array.from(document.querySelectorAll("p"))
            .map((p) => p.textContent?.trim())
            .filter((p) => p && p.length > 40)
            .slice(0, 20);

          return {
            title,
            url,
            lang,
            desc,
            keywords,
            pageType,
            h1s,
            h2s,
            links,
            images,
            codeBlocks: codeBlocks.slice(0, 4),
            text,
            mainContent: mainContent.slice(0, 8000),
            paragraphs,
          };
        },
      });

      const response = result[0].result;

      const context = `
# Page: ${response.title}
URL: ${response.url}
${response.desc ? `Description: ${response.desc}` : ""}
${response.keywords ? `Keywords: ${response.keywords}` : ""}
${response.pageType ? `Type: ${response.pageType}` : ""}

${
  response.h1s.length > 0
    ? `## Headings\n${response.h1s
        .slice(0, 3)
        .map((h: string) => `- ${h}`)
        .join("\n")}`
    : ""
}

${
  response.h2s.length > 0
    ? `## Subheadings\n${response.h2s
        .slice(0, 6)
        .map((h: string) => `- ${h}`)
        .join("\n")}`
    : ""
}

${response.codeBlocks && response.codeBlocks.length > 0 ? `## Code Found\n${response.codeBlocks.map((block: any, i: number) => `Language: ${block.language}\n\`\`\`\n${block.code}\n\`\`\``).join("\n\n")}` : ""}

${
  response.paragraphs && response.paragraphs.length > 0
    ? `## Content\n${response.paragraphs
        .slice(0, 10)
        .map((p: string) => p.slice(0, 250))
        .join("\n\n")}`
    : ""
}

${response.mainContent ? response.mainContent.slice(0, 6000) : response.text.slice(0, 6000)}
`;

      setPageContext(context);

      const prompt = `Analyze this webpage. Provide ONLY information that is explicitly present in the context below. Do not infer, assume, or generate information that isn't directly stated.

## Summary
2-3 sentences about what this page contains based solely on the provided information.

## Key Topics
List topics that are explicitly mentioned in the content.

## Technical Details
ONLY if code is shown above: What language and what does the actual code do? Be specific about the code you can see.

## Notable Points
2-3 observations based strictly on the content provided.

Context:
${context}`;

      const aiResult = await runGeminiPrompt(prompt);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiResult },
      ]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${e.message || "Failed to analyze page"}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function askQuestion() {
    if (!userQuestion.trim() || !pageContext) return;

    const question = userQuestion.trim();
    setUserQuestion("");
    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: question }]);

    try {
      const prompt = `Answer this question using ONLY the information in the context below. If the answer is not in the context, say so explicitly.

Question: ${question}

Context:
${pageContext.slice(0, 10000)}`;

      const response = await runGeminiPrompt(prompt);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response },
      ]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${e.message || "Failed to get response"}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col w-full h-[100vh] dark:bg-gradient-to-br bg-background dark:from-[#1f1f2e] dark:via-[#2b2b3c] dark:to-[#1f1f2e]">
      <div className="flex-none p-4 border-b backdrop-blur-xl dark:border-white sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            <h2 className="text-lg font-semibold tracking-tight">
              Content Insights
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title="Toggle theme"
            className="h-8 w-8"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
              <path d="M12 3l0 18" />
              <path d="M12 9l4.65 -4.65" />
              <path d="M12 14.3l7.37 -7.37" />
              <path d="M12 19.6l8.85 -8.85" />
            </svg>
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Gain insights and interact with any page in real time.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground px-6">
            <Sparkles className="w-12 h-12 mb-4 opacity-40 animate-pulse" />
            <p className="text-sm max-w-sm">
              Click the{" "}
              <span className="font-medium text-primary">Analyze Page</span>{" "}
              button below to begin.
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end py-2" : "justify-start"} transition-all`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm transition-all duration-200 ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-none"
                  : "bg-muted text-foreground rounded-bl-none"
              }`}
            >
              {msg.role === "user" ? (
                <p className="text-sm leading-relaxed">{msg.content}</p>
              ) : (
                <div className="text-sm leading-relaxed">
                  <MarkdownContent content={msg.content} />
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-muted shadow-sm">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex gap-1">
                  <div
                    className="w-2 h-2 rounded-full bg-primary animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-2 h-2 rounded-full bg-primary animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2 h-2 rounded-full bg-primary animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="flex-none p-4 border-t dark:border-white backdrop-blur-xl">
        <div className="flex gap-2 mb-3">
          <Button
            onClick={analyzePage}
            disabled={loading}
            size="sm"
            className="flex-1 font-medium bg-[#202020] dark:bg-[#E3D6C6] text-white dark:text-black transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4 mr-2 animate-spin-slow" />
            {loading ? "Analyzing..." : "Analyze Page"}
          </Button>
        </div>

        <div className="relative">
          <Textarea
            placeholder="Ask a question about this page..."
            value={userQuestion}
            onChange={(e) => setUserQuestion(e.target.value)}
            className="pr-12 resize-none rounded-xl shadow-inner focus:ring-2 focus:ring-primary/30 transition-all"
            rows={2}
            disabled={!pageContext || loading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                askQuestion();
              }
            }}
          />
          <Button
            onClick={askQuestion}
            disabled={!userQuestion.trim() || !pageContext || loading}
            size="icon"
            className="absolute right-2 bottom-2 h-8 w-8 bg-[#202020] dark:bg-[#E3D6C6] text-white dark:text-black hover:scale-105 transition-all"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
