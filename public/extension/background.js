chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "logic-vault-send-pdf",
    title: "Send to Logic Vault",
    contexts: ["link"],
    targetUrlPatterns: ["*://*/*.pdf*", "*://*/*.PDF*"]
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId !== "logic-vault-send-pdf" || !info.linkUrl) {
    return;
  }

  const url = new URL("https://logivault.org/api/convert");
  url.searchParams.set("source", info.linkUrl);
  chrome.tabs.create({ url: url.toString() });
});
