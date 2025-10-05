import { useEffect } from "react";

const isChatGPT = window.location.hostname.includes("chatgpt.com");
const isGemini = window.location.hostname.includes("gemini.google.com");
const isClaude = window.location.hostname.includes("claude.ai");

const BACKEND_URL =
  process.env.PLASMO_PUBLIC_BACKEND_URL || "http://localhost:3001";

function Main() {
  useEffect(() => {
    if (!isChatGPT && !isGemini && !isClaude) return;

    const setupObserver = () => {
      let inputAreaContainers = [];

      if (isChatGPT) {
        const composerTrailingActions = document.querySelectorAll(
          '[data-testid="composer-trailing-actions"]'
        );
        inputAreaContainers = Array.from(composerTrailingActions);
      } else if (isClaude) {
        const sendButtons = document.querySelectorAll(
          'button[aria-label="Send message"]'
        );
        const modelSelectors = document.querySelectorAll(
          '[data-testid="model-selector-dropdown"]'
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
            ".input-area-container, .chat-input, .composer, .PromptTextarea__Positioner"
          )
        );
      }

      inputAreaContainers.forEach((container) => {
        if (container.querySelector(".imprompt-button")) return;

        let textarea = null;
        if (isChatGPT) {
          textarea = document.querySelector("#prompt-textarea");
        } else if (isClaude) {
          textarea = document.querySelector(
            ".ProseMirror[contenteditable='true']"
          );

          if (!textarea) {
            textarea = document.querySelector(
              '[role="textbox"][contenteditable="true"]'
            );
          }
        } else {
          textarea = container.querySelector(
            "textarea, [contenteditable='true'], [data-testid='chat-input'], .ql-editor"
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

          enhanceButton.disabled = true;
          enhanceButton.innerHTML = "🔄";
          enhanceButton.style.opacity = "0.7";
          enhanceButton.style.cursor = "not-allowed";

          try {
            // Call your backend instead of directly using the API
            const response = await fetch(`${BACKEND_URL}/api/enhance-prompt`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                prompt: currentText,
              }),
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(
                errorData.error || `HTTP error! status: ${response.status}`
              );
            }

            // Handle streaming response
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let streamedText = "";

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const textPart = decoder.decode(value, { stream: true });
              streamedText += textPart;

              // Update textarea with streamed content
              if ((isChatGPT || isClaude) && textarea) {
                textarea.textContent = streamedText;
                // For Claude, also try setting innerHTML as backup
                if (isClaude) {
                  textarea.innerHTML = streamedText;
                }
              } else if (textarea instanceof HTMLTextAreaElement) {
                textarea.value = streamedText;
              } else if (textarea) {
                textarea.textContent = streamedText;
              }

              // Trigger input events
              if (textarea) {
                textarea.dispatchEvent(new Event("input", { bubbles: true }));
                textarea.dispatchEvent(new Event("change", { bubbles: true }));
                // Additional events for Claude
                if (isClaude) {
                  textarea.dispatchEvent(
                    new KeyboardEvent("keydown", { bubbles: true })
                  );
                  textarea.dispatchEvent(
                    new KeyboardEvent("keyup", { bubbles: true })
                  );
                }
              }
            }

            enhanceButton.innerHTML = "✅";
            setTimeout(() => {
              enhanceButton.innerHTML = "✨";
            }, 2000);
          } catch (error) {
            console.error("Error enhancing prompt:", error);

            let errorMessage = "Error enhancing prompt. Please try again.";
            if (error.message.includes("Rate limit")) {
              errorMessage =
                "Rate limit reached. Please wait before trying again.";
            } else if (error.message.includes("Failed to fetch")) {
              errorMessage =
                "Cannot connect to enhancement service. Please check your connection.";
              console.log(error);
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

        // Insert the enhance button in the correct place for each platform
        try {
          if (isChatGPT) {
            container.insertBefore(enhanceButton, container.firstChild);
          } else if (isClaude) {
            container.appendChild(enhanceButton);
          } else {
            const sendButton = container.querySelector(
              ".send-button-container button.send-button, [data-testid='send-button'], .send-button"
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
                sendButtonContainer
              );
            } else {
              container.appendChild(enhanceButton);
            }
          }
        } catch (error) {
          console.error("Error inserting button:", error);
          // Fallback: just append to container
          try {
            container.appendChild(enhanceButton);
          } catch (fallbackError) {
            console.error(
              "Failed to add button even with fallback:",
              fallbackError
            );
          }
        }
      });
    };

    // Run initially with a small delay to ensure DOM is ready
    setTimeout(setupObserver, 100);

    // Set up mutation observer to handle dynamic content
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

  return null; // The button is injected directly into the DOM
}

export default Main;
