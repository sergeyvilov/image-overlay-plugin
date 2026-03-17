browser.runtime.onMessage.addListener((msg, sender) => {
  if (msg.action === "openFilePicker" || msg.action === "setOpacity") {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      if (tabs.length) {
        browser.tabs.sendMessage(tabs[0].id, msg);
      }
    });
  }
});

browser.contextMenus.create({
  id: "close-overlay-image",
  title: "Close image",
  contexts: ["image"]
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "close-overlay-image") {
    browser.tabs.sendMessage(tab.id, { action: "removeImage" });
  }
});
