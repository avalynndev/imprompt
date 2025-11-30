# Imprompt

**Better AI prompts + chat with any webpage. One Chrome extension.**

> Only works on Chrome btw (uses Chrome's built-in AI).

Imprompt does two things:
1. Makes your ChatGPT/Claude/Gemini prompts way better with one click
2. Lets you ask questions about any webpage you're on

## What It Does

### Prompt Enhancer

Adds an "Enhance" button to ChatGPT, Claude, and Gemini. Click it, your prompt gets better. That's it.

**Example:**
- You type: "Write a poem"
- Imprompt makes it: "Write a short free-verse poem inspired by starlight and loneliness"

### Chat with Webpages

Open the side panel, ask questions about whatever page you're on:
- "What's the main point here?"
- "Summarize this in 3 bullets"
- "Turn this into a tweet"

No tab switching needed.

## Cool Features

- **Prompt Enhancer** – Rewrites your prompts so AI gives you better answers
- **Site Analyzer Panel** – Have a conversation with any webpage
- **Smart Suggestions** – Get real-time tips to make your prompts clearer
- **Context Memory** – Remembers your last question so you can keep the conversation going
- **Works Everywhere** – ChatGPT, Claude, and Gemini all supported
- **Privacy First** – Everything runs locally on your computer—no servers, no tracking, zero data collection

## How to Install

### Option 1: Download the Zip

1. Go to https://github.com/avalynndev/imprompt/releases and grab `chrome-mv3-prod.zip` from the latest release
2. Unzip it somewhere on your computer
3. Open Chrome and type `chrome://extensions/` in the address bar
4. Turn on **Developer mode** (there's a toggle in the top right)
5. Click **Load unpacked** and choose the folder you just unzipped

### Option 2: Build from Source

If you're into that sort of thing:

```bash
git clone https://github.com/avalynndev/imprompt.git
cd imprompt
bun i
bun run build
```

Then follow steps 3-5 from above.

### Option 3: Chrome Web Store (Coming Soon!)

We're working on getting it listed in the Chrome Web Store so you can install it with one click. Stay tuned!

## How to Use It

### Making Your Prompts Better

1. Head to ChatGPT, Claude, or Gemini
2. Start typing your prompt
3. Click the Imprompt button that appears in the input box
4. Check out the enhanced version (you can still edit it if you want)
5. Hit send and enjoy the better response!

### Chatting with Webpages

1. Click the Imprompt icon in your Chrome toolbar
2. Hit the **Analyze Page** button
3. The side panel slides open
4. Ask away! The AI will answer based on what's on the current page

## What We Built It With

- **React + Plasmo** for the extension framework
- **TypeScript** for all the logic and scripts
- **Shadcn + Tailwind CSS** to make it look clean and modern
- **Chrome Manifest V3** because that's what Chrome wants these days

## Why Does It Need Permissions?

| Permission | Why we need it |
|------------|----------------|
| `activeTab`, `tabs`, `scripting` | So we can read and interact with the webpage you're looking at |
| `storage` | To save your preferences and settings on your computer |
| `sidePanel` | To show you the chat interface in your browser |

## What's Next?

- [ ] Add speech-to-text so you can just talk instead of type
- [ ] Make it work with Perplexity, Copilot, and other AI tools

## License

This project is licensed under the MIT License. Check out the [LICENSE](LICENSE) file if you want the details.

---

Found a bug? Have an idea? Feel free to open an issue or contribute on GitHub!
