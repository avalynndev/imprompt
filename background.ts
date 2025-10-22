chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.name === "open_side_panel") {
    await chrome.sidePanel.open({ tabId: sender.tab.id });
    sendResponse({ success: true });
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "getPageContext") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab?.id) return;

      chrome.scripting
        .executeScript({
          target: { tabId: tab.id },
          func: () => {
            const title = document.title;
            const url = location.href;
            const metaDesc = document.querySelector('meta[name="description"]');
            const desc = metaDesc ? (metaDesc as HTMLMetaElement).content : "";
            const text = document.body.innerText.slice(0, 8000);
            return { title, url, desc, text };
          },
        })
        .then((result) =>
          sendResponse({ success: true, data: result[0].result })
        )
        .catch((error) =>
          sendResponse({ success: false, error: error.message })
        );
    });
    return true; // important for async response
  }
});

