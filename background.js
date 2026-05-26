chrome.action.onClicked.addListener(async (tab) => {
  chrome.tabs.sendMessage(tab.id, { type: "OPEN_FILE" });
});