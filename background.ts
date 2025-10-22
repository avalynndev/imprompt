chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.name === "open_side_panel") {
    await chrome.sidePanel.open({ tabId: sender.tab.id });
    sendResponse({ success: true });
  }
});
