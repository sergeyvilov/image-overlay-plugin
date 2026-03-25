# Image Overlay

Overlay an image on any webpage — drag, resize, adjust opacity, and remove via context menu.

## Features

- **Upload any image** from disk and display it as a floating overlay on the current page
- **Drag** the overlay to reposition it anywhere on the page
- **Resize** from 8 handles (4 edges + 4 corners, minimum 50px)
- **Opacity slider** (0–100%) in the popup toolbar
- **Size presets** dropdown with common resolutions — overlay auto-centers on change
- **Smart auto-sizing** fills roughly 50% of the viewport while preserving aspect ratio
- **Right-click "Close image"** context menu to remove the overlay
- **Persistent settings** — opacity and size selection are saved across sessions

## Installation

### Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on...**
3. Select the `manifest.json` file from this directory

### Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** and select this directory

## Usage

1. Click the extension icon in the toolbar
2. Press **Upload Image** and pick an image file
3. The image appears as a draggable, resizable overlay on the page
4. Use the **Size** dropdown to snap to a preset resolution or **Auto** for viewport-based sizing
5. Adjust the **Opacity** slider to make the overlay more or less transparent
6. Right-click the overlay and select **Close image** to remove it

## Size presets

| Preset | Width | Height |
|--------|------:|-------:|
| Auto | viewport-based | viewport-based |
| 2560x1440 | 2560 | 1440 |
| 1920x1080 | 1920 | 1080 |
| 1728x1117 | 1728 | 1117 |
| 1440x900 | 1440 | 900 |
| 768x1024 | 768 | 1024 |
| 568x320 | 568 | 320 |
| 357x667 | 357 | 667 |

## Project structure

```
image-plugin/
├── manifest.json            # Extension manifest (v2)
├── background.js            # Message relay + context menu
├── content.js               # Overlay logic (drag, resize, file picker)
├── content.css              # Overlay and file-picker styles
├── browser-polyfill.min.js  # Mozilla WebExtension polyfill for Chrome compat
├── popup/
│   ├── popup.html           # Popup UI markup
│   ├── popup.js             # Popup controls (upload, size, opacity)
│   └── popup.css            # Popup styles
└── icons/
    └── icon-48.svg          # Toolbar icon
```

## Browser compatibility

Built for **Firefox** using WebExtension Manifest V2. Works in **Chrome** via the bundled `browser-polyfill.min.js` (Mozilla WebExtension Polyfill v0.12.0), which maps the `browser.*` API to Chrome's `chrome.*` namespace.
