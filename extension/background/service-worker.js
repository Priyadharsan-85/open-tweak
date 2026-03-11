// background/service-worker.js
// Listens for tab updates and sends messages to content scripts

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url?.startsWith("http")) {
    // Notify popup that page has loaded (popup re-fetches fix count)
    chrome.action.setBadgeBackgroundColor({ color: "#4A90D9", tabId });
  }
});

// Listen for fix count updates from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "FIX_COUNT") {
    const count = message.count;
    const tabId = sender.tab?.id;
    if (tabId !== undefined) {
      chrome.action.setBadgeText({
        text: count > 0 ? String(count) : "",
        tabId
      });
    }
  }
  sendResponse({ ok: true });
});
