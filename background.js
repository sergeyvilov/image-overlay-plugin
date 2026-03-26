if (typeof importScripts === "function") {
  importScripts("browser-polyfill.min.js");
}

function injectContentScript(tabId) {
  return Promise.all([
    browser.scripting.insertCSS({ target: { tabId }, files: ["content.css"] }),
    browser.scripting.executeScript({ target: { tabId }, files: ["browser-polyfill.min.js"] }),
  ]).then(() =>
    browser.scripting.executeScript({ target: { tabId }, files: ["content.js"] })
  );
}

function sendToTab(tabId, msg) {
  return browser.tabs.sendMessage(tabId, msg).catch(() =>
    injectContentScript(tabId).then(() =>
      browser.tabs.sendMessage(tabId, msg)
    )
  );
}

browser.runtime.onMessage.addListener((msg, sender) => {
  if (msg.action === "openFilePicker" || msg.action === "setOpacity" || msg.action === "setSize") {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      if (tabs.length) {
        sendToTab(tabs[0].id, msg);
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
