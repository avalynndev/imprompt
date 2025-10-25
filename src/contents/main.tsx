import { useEffect } from "react";

const site = (() => {
  if (location.hostname.includes("chatgpt.com")) return "ChatGPT";
  if (location.hostname.includes("claude.ai")) return "Claude";
  if (location.hostname.includes("gemini.google.com")) return "Gemini";
  return "Other";
})();

const isChatGPT = site === "ChatGPT";
const isGemini = site === "Gemini";
const isClaude = site === "Claude";

async function enhancePromptWithGemini(userPrompt: string) {
  const session = await (window as any).LanguageModel.create({
    systemPrompt: "You are an expert prompt engineer.",
    temperature: 0.7,
    topK: 3,
    outputLanguage: "en",
  });

  const platformPrompt = {
    ChatGPT: "Optimize the prompt for OpenAI's GPT-5 style of reasoning.",
    Claude: "Reframe the prompt for Claude's narrative clarity.",
    Gemini: "Refine for Gemini's multimodal reasoning and factuality.",
    Perplexity: "Optimize for Perplexity's search-augmented responses.",
    Other: "Optimize the prompt following general best practices.",
  }[site];

  const enhancementPrompt = `You are an expert prompt engineer. Improve the following user prompt according to these rules:
- Preserve the original meaning and purpose exactly.
- ${platformPrompt}
- Maintain **all code, markdown, formatting, and technical syntax exactly as provided** (do not delete, reformat, or modify code blocks, symbols, or indentation).
- If the input contains code, **do not rewrite or simplify the code** — only clarify the text parts surrounding it if needed.
- If the input is vague, incomplete, or random (like "asda"), return it unchanged.
- If the input is long and text-heavy, you may restructure or clarify the textual parts to make it more actionable — but never touch any code blocks or inline code.
- Never wrap your output in quotes or explanations — output only the improved prompt itself.

Original Prompt:
${userPrompt}

Improved Prompt:`;

  try {
    const response = await session.prompt(enhancementPrompt);
    await session.destroy();
    return response.trim();
  } catch (e) {
    console.error("LanguageModel Error:", e);
    await session.destroy();
    throw e;
  }
}

function Main() {
  useEffect(() => {
    if (!isChatGPT && !isGemini && !isClaude) return;

    const setupObserver = () => {
      let inputAreaContainers = [];

      if (isChatGPT) {
        const trailingContainers = document.querySelectorAll(
          'form.group\\/composer [grid-area="trailing"], form.group\\/composer .flex.items-center.gap-1\\.5',
        );
        inputAreaContainers = Array.from(trailingContainers);

        if (inputAreaContainers.length === 0) {
          const voiceButtons = document.querySelectorAll(
            '[data-testid="composer-speech-button"]',
          );
          voiceButtons.forEach((button) => {
            let parent = button.parentElement;
            while (parent && parent !== document.body) {
              if (
                parent.classList.contains("flex") &&
                parent.classList.contains("items-center")
              ) {
                inputAreaContainers.push(parent.parentElement || parent);
                break;
              }
              parent = parent.parentElement;
            }
          });
        }
      } else if (isClaude) {
        const sendButtons = document.querySelectorAll(
          'button[aria-label="Send message"]',
        );
        const modelSelectors = document.querySelectorAll(
          '[data-testid="model-selector-dropdown"]',
        );

        sendButtons.forEach((sendButton) => {
          let parent = sendButton.parentElement;
          while (parent && parent !== document.body) {
            if (
              parent.classList.contains("flex") &&
              parent.classList.contains("items-center")
            ) {
              inputAreaContainers.push(parent);
              break;
            }
            parent = parent.parentElement;
          }
        });
        modelSelectors.forEach((selector) => {
          let parent = selector.parentElement;
          while (parent && parent !== document.body) {
            if (
              parent.classList.contains("flex") &&
              parent.classList.contains("items-center")
            ) {
              if (!inputAreaContainers.includes(parent)) {
                inputAreaContainers.push(parent);
              }
              break;
            }
            parent = parent.parentElement;
          }
        });

        if (inputAreaContainers.length === 0) {
          const allFlexContainers = document.querySelectorAll("div.flex");
          allFlexContainers.forEach((container) => {
            if (
              container.querySelector('button[aria-label="Send message"]') ||
              container.querySelector('[data-testid="model-selector-dropdown"]')
            ) {
              inputAreaContainers.push(container);
            }
          });
        }
      } else {
        inputAreaContainers = Array.from(
          document.querySelectorAll(
            ".input-area-container, .chat-input, .composer, .PromptTextarea__Positioner",
          ),
        );
      }

      inputAreaContainers.forEach((container) => {
        if (container.querySelector(".imprompt-button")) return;

        let textarea = null;
        if (isChatGPT) {
          textarea = document.querySelector("#prompt-textarea");
        } else if (isClaude) {
          textarea = document.querySelector(
            ".ProseMirror[contenteditable='true']",
          );

          if (!textarea) {
            textarea = document.querySelector(
              '[role="textbox"][contenteditable="true"]',
            );
          }
        } else {
          textarea = container.querySelector(
            "textarea, [contenteditable='true'], [data-testid='chat-input'], .ql-editor",
          );
        }

        if (!textarea) {
          console.log("Textarea not found for platform:", {
            isChatGPT,
            isClaude,
            isGemini,
          });
          return;
        }

        let marginRight = "8px";
        if (isChatGPT) marginRight = "0px";
        if (isClaude) marginRight = "4px";

        const enhanceButton = document.createElement("button");
        enhanceButton.innerHTML = "✨";
        enhanceButton.className = "imprompt-button";
        enhanceButton.setAttribute("aria-label", "Imprompt");
        enhanceButton.setAttribute("title", "Imprompt");
        enhanceButton.type = "button";

        let buttonStyles = "";
        buttonStyles = `
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            border: 2px solid #27272a;
            cursor: pointer;
            background-color: #27272a;
            color: #ffffff;
            transition: all 0.2s ease;
            margin-right: ${marginRight};
            margin-left: 4px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          `;

        enhanceButton.style.cssText = buttonStyles;

        if (!document.getElementById("imprompt-spin-animation")) {
          const style = document.createElement("style");
          style.id = "imprompt-spin-animation";
          style.textContent = `
            @keyframes imprompt-spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(-360deg); }
            }
            .imprompt-spinning {
              animation: imprompt-spin 1s linear infinite;
            }
          `;
          document.head.appendChild(style);
        }

        enhanceButton.addEventListener("click", async (e) => {
          e.stopPropagation();
          e.preventDefault();

          let currentText = "";
          if ((isChatGPT || isClaude) && textarea) {
            currentText = textarea.textContent || textarea.innerText || "";
          } else if (textarea instanceof HTMLTextAreaElement) {
            currentText = textarea.value || "";
          } else if (textarea) {
            currentText = textarea.textContent || textarea.innerText || "";
          }

          if (!currentText.trim()) {
            alert("Please type something first!");
            return;
          }

          if (currentText.length > 5000) {
            alert("Prompt too long. Maximum 5000 characters allowed.");
            return;
          }

          enhanceButton.disabled = true;
          enhanceButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="imprompt-spinning">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
          `;
          enhanceButton.style.opacity = "0.7";
          enhanceButton.style.cursor = "not-allowed";

          try {
            const improvedText = await enhancePromptWithGemini(currentText);

            if ((isChatGPT || isClaude) && textarea) {
              textarea.textContent = improvedText;
              if (isClaude) {
                textarea.innerHTML = improvedText;
              }
            } else if (textarea instanceof HTMLTextAreaElement) {
              textarea.value = improvedText;
            } else if (textarea) {
              textarea.textContent = improvedText;
            }

            if (textarea) {
              textarea.dispatchEvent(new Event("input", { bubbles: true }));
              textarea.dispatchEvent(new Event("change", { bubbles: true }));
              if (isClaude) {
                textarea.dispatchEvent(
                  new KeyboardEvent("keydown", { bubbles: true }),
                );
                textarea.dispatchEvent(
                  new KeyboardEvent("keyup", { bubbles: true }),
                );
              }
            }

            enhanceButton.innerHTML = "✅";
            setTimeout(() => {
              enhanceButton.innerHTML = "✨";
            }, 2000);
          } catch (error) {
            console.error("Error enhancing prompt:", error);

            let errorMessage = "Error enhancing prompt. Please try again.";
            if (error.message && error.message.includes("API key not found")) {
              errorMessage =
                "Please set your Gemini API key in the extension popup first.";
            } else if (error.message && error.message.includes("API key")) {
              errorMessage =
                "Invalid API key. Please check your configuration in the extension popup.";
            } else if (error.message && error.message.includes("quota")) {
              errorMessage = "API quota exceeded. Please try again later.";
            }

            alert(errorMessage);
            enhanceButton.innerHTML = "❌";
            setTimeout(() => {
              enhanceButton.innerHTML = "✨";
            }, 2000);
          } finally {
            enhanceButton.disabled = false;
            enhanceButton.style.opacity = "1";
            enhanceButton.style.cursor = "pointer";
          }
        });

        try {
          if (isChatGPT) {
            container.insertBefore(enhanceButton, container.firstChild);
          } else if (isClaude) {
            container.appendChild(enhanceButton);
          } else {
            const sendButton = container.querySelector(
              ".send-button-container button.send-button, [data-testid='send-button'], .send-button",
            );
            if (
              sendButton &&
              sendButton.parentElement &&
              sendButton.parentElement.parentElement
            ) {
              const sendButtonContainer = sendButton.parentElement;
              const parentOfSendButtonContainer =
                sendButtonContainer.parentElement;
              parentOfSendButtonContainer.insertBefore(
                enhanceButton,
                sendButtonContainer,
              );
            } else {
              container.appendChild(enhanceButton);
            }
          }
        } catch (error) {
          console.error("Error inserting button:", error);
          try {
            container.appendChild(enhanceButton);
          } catch (fallbackError) {
            console.error(
              "Failed to add button even with fallback:",
              fallbackError,
            );
          }
        }
      });
    };

    setTimeout(setupObserver, 100);

    const observer = new MutationObserver(() => {
      setTimeout(setupObserver, 50);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  if (!isChatGPT && !isGemini && !isClaude) {
    return null;
  }

  return null;
}

export default Main;
