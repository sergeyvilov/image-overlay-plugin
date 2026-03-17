(() => {
  console.log("[Image Overlay] Content script loaded");

  let overlay = null;

  function createOverlay(dataUrl) {
    if (overlay) overlay.remove();

    overlay = document.createElement("div");
    overlay.className = "image-overlay-wrapper";
    overlay.style.left = "50px";
    overlay.style.top = "50px";
    overlay.style.width = "300px";

    const img = document.createElement("img");
    img.src = dataUrl;
    img.className = "image-overlay-img";
    img.draggable = false;

    const handle = document.createElement("div");
    handle.className = "image-overlay-resize-handle";

    overlay.appendChild(img);
    overlay.appendChild(handle);
    document.body.appendChild(overlay);
    console.log("[Image Overlay] Overlay added to DOM");

    setupDrag(overlay, img);
    setupResize(overlay, handle, img);
  }

  function setupDrag(wrapper, img) {
    let dragging = false;
    let offsetX, offsetY;

    img.addEventListener("mousedown", (e) => {
      dragging = true;
      offsetX = e.clientX - wrapper.getBoundingClientRect().left;
      offsetY = e.clientY - wrapper.getBoundingClientRect().top;
      e.preventDefault();
    });

    document.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      wrapper.style.left = (e.clientX - offsetX) + "px";
      wrapper.style.top = (e.clientY - offsetY) + "px";
    });

    document.addEventListener("mouseup", () => {
      dragging = false;
    });
  }

  function setupResize(wrapper, handle, img) {
    let resizing = false;
    let startX, startY, startW, startH;

    handle.addEventListener("mousedown", (e) => {
      resizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startW = wrapper.getBoundingClientRect().width;
      startH = wrapper.getBoundingClientRect().height;
      e.preventDefault();
      e.stopPropagation();
    });

    document.addEventListener("mousemove", (e) => {
      if (!resizing) return;
      const newW = startW + (e.clientX - startX);
      const newH = startH + (e.clientY - startY);
      wrapper.style.width = Math.max(50, newW) + "px";
      wrapper.style.height = Math.max(50, newH) + "px";
    });

    document.addEventListener("mouseup", () => {
      resizing = false;
    });
  }

  function openFilePicker() {
    // Remove any existing picker
    const existing = document.getElementById("image-overlay-filepicker");
    if (existing) existing.remove();

    // Full-screen overlay with a file input the user clicks
    const backdrop = document.createElement("div");
    backdrop.id = "image-overlay-filepicker";
    backdrop.className = "image-overlay-filepicker-backdrop";

    const label = document.createElement("label");
    label.className = "image-overlay-filepicker-label";
    label.textContent = "Click to select an image";

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.className = "image-overlay-filepicker-input";

    function cleanup() {
      backdrop.remove();
    }

    input.addEventListener("change", () => {
      const file = input.files[0];
      cleanup();
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          console.log("[Image Overlay] File read, creating overlay");
          createOverlay(reader.result);
        };
        reader.readAsDataURL(file);
      }
    });

    // Dismiss on clicking the backdrop (but not the label)
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) cleanup();
    });

    label.appendChild(input);
    backdrop.appendChild(label);
    document.body.appendChild(backdrop);
    console.log("[Image Overlay] File picker shown");
  }

  browser.runtime.onMessage.addListener((msg) => {
    console.log("[Image Overlay] Message received:", msg.action);
    if (msg.action === "openFilePicker") {
      openFilePicker();
    } else if (msg.action === "addImage") {
      createOverlay(msg.dataUrl);
    } else if (msg.action === "setOpacity") {
      if (overlay) overlay.style.opacity = msg.opacity;
    } else if (msg.action === "removeImage") {
      if (overlay) {
        overlay.remove();
        overlay = null;
      }
    }
  });
})();
