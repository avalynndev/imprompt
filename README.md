# Imprompt

> **Enhance your AI prompts. Converse with any webpage. All in one Chrome extension.**

> This extention was made using chrome's build in AI. So this extention will not work for any other browser except chrome.

**Imprompt** transforms how you interact with AI and the web.  
It works with **ChatGPT**, **Claude**, and **Gemini**, by adding a button to **refine prompts** instantly.  
Beyond that, Imprompt also introduces an **AI-powered side panel** that lets you **ask questions about any webpage** — summaries, facts, insights, or ideas — directly within your browser.

# Two Powerful Features

### 1️⃣ Prompt Enhancer (for AI chat websites)

Adds an “**Enhance Prompt**” button directly on:

- [ChatGPT](https://chat.openai.com)
- [Claude](https://claude.ai)
- [Gemini](https://gemini.google.com)

**How it works:**

- You write a prompt as usual.
- Click **Enhance Prompt**.
- Imprompt refines it in real time — improving clarity, depth, and context.
- Submit the enhanced version to get smarter, more precise responses.

✨ _Example:_  
| Task | Before | After (with Imprompt) |
|------|---------|------------------------|
| Summarization | “Summarize this text.” | “Summarize this article focusing on tone, key arguments, and conclusion.” |
| Creative Writing | “Write a poem.” | “Write a short free-verse poem inspired by starlight and loneliness.” |

---

### 2️⃣ Site Analyzer (for any webpage)

Activate Imprompt’s **AI side panel** on any site.  
Ask natural questions like:

- “What’s the main point of this article?”
- “Summarize this page in 3 bullet points.”
- “List all dates and names mentioned.”
- “Turn this blog post into a LinkedIn caption.”

Imprompt reads visible content on the page and responds contextually — giving you insights, summaries, or rewrites without switching tabs.

# Features

- **Prompt Enhancer:** Rewrite prompts intelligently for better AI results.
- **Site Analyzer Panel:** Chat with webpages, get summaries, or extract structured info.
- **Smart Suggestions:** Real-time tips to improve clarity, tone, or creativity.
- **Context Memory:** Remembers your last interaction for continuity.
- **Multi-Platform:** Works across ChatGPT, Claude, and Gemini.
- **Privacy-Friendly:** 100% local — no servers, no tracking, no data collection.

# Installation

### From Zip

1. Head over to https://github.com/avalynndev/imprompt/releases, and download `chrome-mv3-prod.zip` from the latest version of imprompt.
2. Uncompress the zip then open Chrome and navigate to:
   ```
   chrome://extensions/
   ```

2. Enable **Developer mode**.
4. Click **Load unpacked** → select the `imprompt` folder that you unzipped.

### From Source

1. Clone the repository:

   ```bash
   git clone https://github.com/avalynndev/imprompt.git
   cd imprompt
   ```

2. Clone the repository:

   ```bash
   bun i
   bun run build
   ```

3. Open Chrome and navigate to:

   ```
   chrome://extensions/
   ```

4. Enable **Developer mode**.
5. Click **Load unpacked** → select the `imprompt` folder.

### From Chrome Web Store (coming soon)

Once live, you’ll be able to install Imprompt in one click from the Chrome Web Store.

# How to Use

### 🪄 Prompt Enhancer

1. Open ChatGPT, Claude, or Gemini.
2. Type your prompt as usual.
3. Click the **Imprompt button** inside the input box.
4. Review or edit the enhanced prompt before sending.

### 🧭 Site Analyzer

1. Click the **Imprompt extension icon** in your Chrome toolbar.
2. Click the **Analyze Page** button.
3. The **side panel** opens.
4. Ask questions about the current webpage — Imprompt responds instantly.

## Tech Stack

- **React + Plasmo** – Core extension framework
- **TypeScript** – Logic & content scripts, background service workers
- **Shadcn + Tailwindcss** – Minimal, modern interface styling
- **Chrome Manifest V3** – Secure, performant extension framework

## Permissions

| Permission                       | Purpose                                                   |
| -------------------------------- | --------------------------------------------------------- |
| `activeTab`, `tabs`, `scripting` | To analyze and interact with the current webpage.         |
| `storage`                        | To remember preferences, settings, and templates locally. |
| `sidePanel`                      | For the in-browser conversation UI.                       |

## To Do

- [ ] 🗣️ Add speech-to-text for prompt entry
- [ ] 🌍 Support for Perplexity, Copilot, and more AI tools

## License

Licensed under the **MIT License**.  
See [LICENSE](LICENSE) for more information.
