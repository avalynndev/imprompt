import { useState } from "react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent } from "../components/ui/card";
import "~style.css";

export default function SidePanel() {
  const [aiResponse, setAiResponse] = useState<string>("");
  const [userQuestion, setUserQuestion] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageContext, setPageContext] = useState<string>("");

  // 🔹 Function to call Gemini directly
  async function runGeminiPrompt(prompt: string) {
    console.log("🧠 Creating Gemini session...");
    const session = await (window as any).LanguageModel.create({
      systemPrompt:
        "You are an expert AI assistant that analyzes and answers questions about webpages.",
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

  // 🔹 Analyze current page
  async function analyzePage() {
    console.log("🚀 analyzePage triggered");
    setLoading(true);
    setError(null);
    setAiResponse("");

    try {
      console.log("📩 Sending message to background for page context...");
      const response = await new Promise<any>((resolve, reject) => {
        chrome.runtime.sendMessage({ action: "getPageContext" }, (res) => {
          if (chrome.runtime.lastError) {
            console.error("⚠️ Runtime error:", chrome.runtime.lastError);
            return reject(chrome.runtime.lastError.message);
          }
          if (!res?.success) {
            console.error("⚠️ Response failed:", res);
            return reject(res?.error || "Unknown error");
          }
          console.log("✅ Page context received from background:", res.data);
          resolve(res.data);
        });
      });

      const { title, url, desc, text } = response;
      const context = `Title: ${title}\nURL: ${url}\nDescription: ${desc}\n\nContent:\n${text}`;
      setPageContext(context);
      console.log("🧩 Page context set successfully.");

      const prompt = `
You are a smart webpage analyzer. Read the following page content and provide:
- A brief summary
- Key topics or entities mentioned
- The main intent (e.g., product, article, discussion)
- Any interesting insights or takeaways

${context}`;

      console.log("🧠 Sending context to Gemini...");
      const result = await runGeminiPrompt(prompt);
      setAiResponse(result);
      console.log("✅ AI analysis complete.");
    } catch (e: any) {
      console.error("❌ analyzePage error:", e);
      setError(e.message || String(e));
    } finally {
      console.log("🏁 analyzePage finished");
      setLoading(false);
    }
  }

  // 🔹 Ask follow-up questions
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
You previously analyzed a webpage with the following context:
${pageContext}

Now the user has a new question:
"${userQuestion}"

Answer clearly and factually using only that context.`;

      const response = await runGeminiPrompt(prompt);
      console.log("✅ Gemini follow-up response received.");

      setAiResponse(
        (prev) => prev + `\n\n💬 Q: ${userQuestion}\n🤖 ${response}`
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
    <div className="p-3 w-[380px] bg-background text-foreground h-full overflow-y-auto">
      <Card>
        <CardContent className="flex flex-col gap-3 p-3">
          <h2 className="text-lg font-semibold">AI Page Analyzer (Gemini)</h2>
          <p className="text-sm text-muted-foreground">
            Analyze the current page using Gemini, then ask more questions about
            it.
          </p>

          <Button onClick={analyzePage} disabled={loading}>
            {loading ? "Analyzing…" : "Analyze Current Page"}
          </Button>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <Textarea
            value={aiResponse}
            placeholder="AI output will appear here..."
            className="h-[300px]"
            readOnly
          />

          <div className="flex flex-col gap-2 mt-2">
            <Textarea
              placeholder="Ask a follow-up question..."
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              className="h-[80px]"
            />
            <Button onClick={askQuestion} disabled={loading}>
              {loading ? "Thinking…" : "Ask Gemini"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
