const uploadBtn = document.getElementById("upload-btn");
const opacitySlider = document.getElementById("opacity-slider");
const opacityValue = document.getElementById("opacity-value");
const sizeSelect = document.getElementById("size-select");

// Restore saved settings when popup opens
browser.storage.local.get(["opacity", "imageSize"]).then((data) => {
  if (data.opacity != null) {
    const pct = Math.round(data.opacity * 100);
    opacitySlider.value = pct;
    opacityValue.textContent = pct + "%";
  }
  if (data.imageSize) {
    sizeSelect.value = data.imageSize;
  }
});

uploadBtn.addEventListener("click", () => {
  console.log("[Image Overlay] Requesting file picker in content script");
  browser.runtime.sendMessage({
    action: "openFilePicker"
  }).catch((err) => {
    console.error("[Image Overlay] sendMessage failed:", err);
  });
});

sizeSelect.addEventListener("change", () => {
  const val = sizeSelect.value;
  browser.storage.local.set({ imageSize: val });
  let width = null;
  let height = null;
  if (val !== "auto") {
    const parts = val.split("x");
    width = parseInt(parts[0], 10);
    height = parseInt(parts[1], 10);
  }
  browser.runtime.sendMessage({
    action: "setSize",
    width,
    height
  }).catch((err) => {
    console.error("[Image Overlay] Failed to send size:", err);
  });
});

opacitySlider.addEventListener("input", () => {
  const val = opacitySlider.value;
  const opacity = val / 100;
  opacityValue.textContent = val + "%";
  browser.storage.local.set({ opacity });
  browser.runtime.sendMessage({
    action: "setOpacity",
    opacity
  }).catch((err) => {
    console.error("[Image Overlay] Failed to send opacity:", err);
  });
});
