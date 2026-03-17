const uploadBtn = document.getElementById("upload-btn");
const opacitySlider = document.getElementById("opacity-slider");
const opacityValue = document.getElementById("opacity-value");

uploadBtn.addEventListener("click", () => {
  console.log("[Image Overlay] Requesting file picker in content script");
  browser.runtime.sendMessage({
    action: "openFilePicker"
  }).catch((err) => {
    console.error("[Image Overlay] sendMessage failed:", err);
  });
});

opacitySlider.addEventListener("input", () => {
  const val = opacitySlider.value;
  opacityValue.textContent = val + "%";
  browser.runtime.sendMessage({
    action: "setOpacity",
    opacity: val / 100
  }).catch((err) => {
    console.error("[Image Overlay] Failed to send opacity:", err);
  });
});
