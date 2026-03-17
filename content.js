(() => {
  console.log("[Image Overlay] Content script loaded");

  let overlay = null;

  function createOverlay(dataUrl) {
    if (overlay) overlay.remove();

    overlay = document.createElement("div");
    overlay.className = "image-overlay-wrapper";

    const img = document.createElement("img");
    img.src = dataUrl;
    img.className = "image-overlay-img";
    img.draggable = false;

    overlay.appendChild(img);

    const edges = ["top", "bottom", "left", "right", "top-left", "top-right", "bottom-left", "bottom-right"];
    edges.forEach((edge) => {
      const h = document.createElement("div");
      h.className = "image-overlay-handle image-overlay-handle-" + edge;
      h.dataset.edge = edge;
      overlay.appendChild(h);
    });

    document.body.appendChild(overlay);
    console.log("[Image Overlay] Overlay added to DOM");

    // Apply persisted opacity
    browser.storage.local.get("opacity").then((data) => {
      if (data.opacity != null) overlay.style.opacity = data.opacity;
    });

    img.onload = () => {
      browser.storage.local.get("imageSize").then((data) => {
        let w, h;
        if (data.imageSize && data.imageSize !== "auto") {
          const parts = data.imageSize.split("x");
          w = parseInt(parts[0], 10);
          h = parseInt(parts[1], 10);
        } else {
          const vw = window.innerWidth;
          const vh = window.innerHeight;
          const targetArea = (vw * vh) / 2;
          const aspect = img.naturalWidth / img.naturalHeight;
          w = Math.sqrt(targetArea * aspect);
          h = w / aspect;
          const pad = 40;
          if (w > vw - pad) { w = vw - pad; h = w / aspect; }
          if (h > vh - pad) { h = vh - pad; w = h * aspect; }
        }
        overlay.style.width = w + "px";
        overlay.style.height = h + "px";
        overlay.style.left = (window.innerWidth - w) / 2 + "px";
        overlay.style.top = (window.innerHeight - h) / 2 + "px";
      });
    };

    setupDrag(overlay, img);
    setupResize(overlay);
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

  function setupResize(wrapper) {
    let resizing = false;
    let edge, startX, startY, startW, startH, startLeft, startTop;

    wrapper.addEventListener("mousedown", (e) => {
      if (!e.target.dataset.edge) return;
      resizing = true;
      edge = e.target.dataset.edge;
      startX = e.clientX;
      startY = e.clientY;
      const rect = wrapper.getBoundingClientRect();
      startW = rect.width;
      startH = rect.height;
      startLeft = rect.left;
      startTop = rect.top;
      e.preventDefault();
      e.stopPropagation();
    });

    document.addEventListener("mousemove", (e) => {
      if (!resizing) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      let newW = startW, newH = startH, newLeft = startLeft, newTop = startTop;

      if (edge.includes("left")) {
        newW = startW - dx;
        newLeft = startLeft + dx;
      }
      if (edge.includes("right")) {
        newW = startW + dx;
      }
      if (edge.startsWith("top")) {
        newH = startH - dy;
        newTop = startTop + dy;
      }
      if (edge.includes("bottom")) {
        newH = startH + dy;
      }

      if (newW < 50) { newW = 50; if (edge.includes("left")) newLeft = startLeft + startW - 50; }
      if (newH < 50) { newH = 50; if (edge.startsWith("top")) newTop = startTop + startH - 50; }

      wrapper.style.width = newW + "px";
      wrapper.style.height = newH + "px";
      wrapper.style.left = newLeft + "px";
      wrapper.style.top = newTop + "px";
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
    } else if (msg.action === "setSize") {
      if (overlay) {
        if (msg.width && msg.height) {
          overlay.style.width = msg.width + "px";
          overlay.style.height = msg.height + "px";
          overlay.style.left = (window.innerWidth - msg.width) / 2 + "px";
          overlay.style.top = (window.innerHeight - msg.height) / 2 + "px";
        } else {
          // Revert to auto-sizing based on the current image
          const img = overlay.querySelector(".image-overlay-img");
          if (img) {
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const targetArea = (vw * vh) / 2;
            const aspect = img.naturalWidth / img.naturalHeight;
            let w = Math.sqrt(targetArea * aspect);
            let h = w / aspect;
            const pad = 40;
            if (w > vw - pad) { w = vw - pad; h = w / aspect; }
            if (h > vh - pad) { h = vh - pad; w = h * aspect; }
            overlay.style.width = w + "px";
            overlay.style.height = h + "px";
            overlay.style.left = (vw - w) / 2 + "px";
            overlay.style.top = (vh - h) / 2 + "px";
          }
        }
      }
    } else if (msg.action === "removeImage") {
      if (overlay) {
        overlay.remove();
        overlay = null;
      }
    }
  });
})();
