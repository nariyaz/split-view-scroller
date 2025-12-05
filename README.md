# Split View Scroller

A Chrome extension that syncs scrolling between tabs in split view.

## 📌 What It Does

- **Real-time Scroll Sync**: When you scroll in one tab, other tabs in the same split view scroll too
- **Two Sync Modes**: 
  - **Percentage Mode (Recommended)**: Scrolls to the same relative position on the page
  - **Pixel Mode**: Scrolls to the exact pixel position
- **Smart Performance**: Uses advanced tricks to keep your computer running smoothly
- **Easy Toggle**: Turn sync on or off anytime with one click

## 🛠 How It Works

### 1. Popup Window (`popup.html`, `popup.js`)
- Click the extension icon to open settings
- Choose between percentage or pixel sync mode
- Turn sync on or off
- Save your settings

### 2. Content Script (`content.js`)
- Watches for scrolling on each webpage
- Figures out how far down the page you are
- Sends this info to the background
- Gets scroll messages from other tabs and syncs to match
- Uses smart timing to keep everything smooth

### 3. Background Worker (`background.js`)
- Gets scroll messages from tabs
- Sends them to other tabs in the same split view
- Makes sure tabs don't send messages to themselves
- Checks if sync is turned on before sending

## 📥 How to Install

### Install in Developer Mode

1. Download or clone this project
   ```bash
   git clone [repository-url]
   ```

2. Open Chrome and go to `chrome://extensions/`

3. Turn on "Developer mode" (top right corner)

4. Click "Load unpacked"

5. Choose the project folder

## 🚀 How to Use

### Basic Use
1. After installing, the extension starts working automatically
2. Open tabs in split view
3. Scroll in one tab and watch the others scroll too!

### Change Sync Mode
1. Click the extension icon to open settings
2. Choose "Percentage Based" or "Pixel Based"
3. Click "Save"
4. The popup closes and your new mode is active

### Turn Sync On or Off
1. Click the extension icon
2. Toggle the "Enable Sync" switch
3. Click "Save"

## 📁 File Structure

```
scroll-sync/
├── manifest.json      # Extension settings file
├── background.js      # Background worker (sends messages between tabs)
├── content.js         # Content script (watches scroll on each page)
├── popup.html         # Popup window layout
├── popup.css          # Popup window styles
├── popup.js           # Popup window logic
└── README.md          # This file!
```

## 🔧 Technology

- **Manifest V3**: Latest Chrome Extension format
- **Chrome Extension APIs**: 
  - `chrome.runtime`: Sending messages
  - `chrome.tabs`: Working with tabs
  - `chrome.scripting`: Running code on pages
  - `chrome.storage`: Saving settings

## 💡 Cool Features

### No Infinite Loops
```javascript
let isSyncing = false; // Am I syncing right now?

window.addEventListener('scroll', () => {
    if (isSyncing) return; // Don't send messages if I'm syncing
    // ...
});
```

### Two Ways to Sync
```javascript
// Percentage mode
const scrollPercentage = window.scrollY / scrollHeight;
const targetPixel = targetPercentage * scrollHeight;

// Pixel mode
const scrollPixel = window.scrollY;
const targetPixel = message.payload.pixel;
```

### Smart Split View Detection
```javascript
// Only sync tabs in the same split view
const sameSplitView = (senderSplitViewId === tab.splitViewId);
if (sameSplitView) {
    chrome.tabs.sendMessage(tab.id, message);
}
```

### Smooth Performance
```javascript
// Use requestAnimationFrame to keep scrolling smooth
window.addEventListener('scroll', () => {
    if (!isScrollScheduled) {
        isScrollScheduled = true;
        requestAnimationFrame(handleScroll);
    }
}, { passive: true });
```

## ⚠️ Important Notes

- Only works after pages finish loading
- Won't sync to closed or loading tabs
- Only works in Chrome and Chromium browsers
- Works best with Chrome's built-in split view feature

## 🎨 Adding Icons (Optional)

You can add custom icons to the project folder:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

The extension works fine without them!

## 📝 License

Free to use!

## 🤝 Contributing

Found a bug? Have an idea? Let us know!
