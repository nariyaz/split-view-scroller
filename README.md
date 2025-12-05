# Split View Scroller

A Chrome extension that synchronizes scrolling across tabs in split view with customizable sync modes.

## 📌 Features

- **Real-time Scroll Sync**: Automatically synchronizes scrolling between tabs in Chrome's split view
- **Two Sync Modes**: 
  - **Percentage Based (Recommended)**: Scrolls to the same relative position regardless of page length
  - **Pixel Based**: Scrolls to the exact pixel position
- **Dark Mode Support**: Automatically adapts to your system's color scheme
- **Keyboard Accessible**: Full keyboard navigation support with Enter key and tab focus
- **Performance Optimized**: Uses requestAnimationFrame for smooth, efficient scrolling
- **Error Handling**: Robust error handling with user-friendly error messages
- **Privacy Focused**: No data collection, everything runs locally

## 🛠 How It Works

### 1. Popup Interface (`popup.html`, `popup.js`, `popup.css`)
- Modern, accessible UI with dark mode support
- Keyboard navigation with Tab and Enter keys
- Toggle sync on/off with visual feedback
- Select between percentage or pixel-based sync modes
- Error handling with user-friendly messages
- Settings persist across browser sessions

### 2. Content Script (`content.js`)
- Injected into web pages to monitor scroll events
- Calculates scroll position (percentage and pixel)
- Sends scroll data to background service worker
- Receives and applies scroll synchronization from other tabs
- Prevents infinite loops with `isSyncing` flag
- Uses `requestAnimationFrame` for smooth performance

### 3. Background Service Worker (`background.js`)
- Receives scroll events from content scripts
- Identifies tabs in the same split view group
- Broadcasts scroll positions to other tabs in the group
- Respects user's sync enable/disable preference
- Handles errors gracefully for closed or unloaded tabs

## 📥 Installation

### From Chrome Web Store
*(Coming soon)*

### Developer Mode Installation

1. Download or clone this repository:
   ```bash
   git clone https://github.com/nariyaz/split-view-scroller.git
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" (toggle in top right corner)

4. Click "Load unpacked"

5. Select the project folder

6. The extension icon will appear in your toolbar

## 🚀 Usage

### Basic Usage
1. The extension works automatically after installation
2. Open multiple tabs in Chrome's split view (right-click tab → "Add to new group" or use split view)
3. Scroll in one tab and watch synchronized scrolling in other tabs!

### Configure Settings
1. Click the extension icon in the toolbar
2. **Enable Sync**: Toggle scrolling synchronization on/off
3. **Sync Mode**: 
   - **Percentage Based (Recommended)**: Best for pages with different lengths
   - **Pixel Based**: Scrolls to exact pixel position
4. Click "Save" to apply changes

### Keyboard Navigation
- Use **Tab** key to navigate between controls
- Press **Enter** to activate buttons, checkboxes, and radio buttons
- Press **Escape** to close the popup

## 📁 Project Structure

```
split-view-scroller/
├── manifest.json      # Extension manifest (v3) with permissions and settings
├── background.js      # Service worker for message routing between tabs
├── content.js         # Content script injected into web pages
├── popup.html         # Settings UI structure
├── popup.css          # Styles with dark mode support and CSS variables
├── popup.js           # Settings logic with error handling
├── icon16.png         # Extension icon (16x16)
├── icon48.png         # Extension icon (48x48)
├── icon128.png        # Extension icon (128x128)
└── README.md          # Documentation
```

## 🔧 Technical Details

### Technology Stack
- **Manifest V3**: Latest Chrome Extension API
- **Service Worker**: Background script for message routing
- **Content Scripts**: Injected into all HTTP/HTTPS pages
- **Chrome Storage API**: Persistent settings storage

### Permissions Used
- **`tabs`**: Identify tabs in split view groups
- **`scripting`**: Inject content scripts into web pages
- **`storage`**: Save user preferences locally
- **`host_permissions`**: Access web pages for scroll detection

### Security & Privacy
- ✅ **No data collection**: Extension doesn't collect any user data
- ✅ **No external requests**: All processing happens locally
- ✅ **Content Security Policy**: Strict CSP prevents code injection
- ✅ **Minimal permissions**: Only essential permissions requested

## 🔒 Privacy Policy

### Data Collection
**Split View Scroller does NOT collect, store, or transmit any personal user data.**

### What We Store (Locally Only)
The extension stores only the following preferences on your device using `chrome.storage.sync`:
- **Sync Mode**: Your preference for percentage-based or pixel-based scrolling
- **Enable/Disable State**: Whether scroll synchronization is turned on or off

This data:
- ✅ Stays on your device and your Chrome sync account (if enabled)
- ✅ Is never sent to external servers
- ✅ Contains no personal information
- ✅ Can be cleared by uninstalling the extension

### What We Access
The extension requires certain permissions to function:

#### `tabs` Permission
- **Purpose**: Identify tabs in the same split view group to enable scroll synchronization
- **Data Accessed**: Tab IDs and split view group information only
- **No Access To**: Tab content, browsing history, or personal information

#### `scripting` Permission
- **Purpose**: Inject scroll detection scripts into web pages
- **Data Accessed**: Scroll position (pixel/percentage) only
- **No Access To**: Page content, form data, passwords, or any personal information

#### `storage` Permission
- **Purpose**: Save your sync mode preference and enable/disable state
- **Data Stored**: Only the two settings mentioned above
- **No Access To**: Browsing history, cookies, or other browser data

#### `host_permissions` (http://*/*, https://*/*)
- **Purpose**: Enable scroll synchronization across all websites
- **Why Needed**: The extension must inject scripts into web pages to detect and sync scrolling
- **Data Accessed**: Scroll position only
- **No Access To**: Website content, credentials, or personal data

### Third-Party Services
- ❌ **No analytics services** (e.g., Google Analytics)
- ❌ **No crash reporting tools**
- ❌ **No advertising networks**
- ❌ **No external API calls**

### Data Transmission
**Zero data transmission.** All functionality operates entirely within your browser. No information is sent to any external servers or third parties.

### User Rights
You have full control over your data:
- View stored settings by inspecting `chrome.storage.sync` in your browser
- Clear all data by uninstalling the extension
- Disable the extension at any time from `chrome://extensions/`

### Children's Privacy
This extension does not knowingly collect data from anyone, including children under 13.

### Changes to Privacy Policy
Any changes to this privacy policy will be reflected in this README and in extension updates.

### Contact
For privacy concerns or questions:
- GitHub Issues: [https://github.com/nariyaz/split-view-scroller/issues](https://github.com/nariyaz/split-view-scroller/issues)
- Email: [Contact via GitHub profile]

**Last Updated**: December 5, 2025

## 💡 Key Implementation Details

### Infinite Loop Prevention
```javascript
let isSyncing = false;

window.addEventListener('scroll', () => {
    if (isSyncing) return; // Don't broadcast when receiving sync
    // Broadcast scroll position
});
```

### Dual Sync Modes
```javascript
// Percentage-based (recommended)
const scrollPercentage = window.scrollY / scrollHeight;
const targetY = scrollPercentage * otherTabScrollHeight;

// Pixel-based
const targetY = window.scrollY;
```

### Performance Optimization
```javascript
// Throttle scroll events with requestAnimationFrame
window.addEventListener('scroll', () => {
    if (!isScrollScheduled) {
        isScrollScheduled = true;
        requestAnimationFrame(handleScroll);
    }
}, { passive: true });
```

### Error Handling
```javascript
// Graceful error handling throughout
try {
    await chrome.storage.sync.set({ syncMode, enableSync });
} catch (error) {
    showError("Failed to save settings");
}
```

### Dark Mode Support
```css
@media (prefers-color-scheme: dark) {
    :root {
        --background: #202124;
        --text-color: #e8eaed;
        /* ... */
    }
}
```

## ⚠️ Limitations & Notes

- Content scripts inject after page load (`document_end`)
- Does not sync to closed or unloaded tabs (errors are caught gracefully)
- Requires Chrome/Chromium-based browsers with split view support
- Some sites may be excluded for compatibility (e.g., google.com)

## 🐛 Known Issues

None currently! Report issues on [GitHub Issues](https://github.com/nariyaz/split-view-scroller/issues)

## 🗺️ Roadmap

- [ ] Chrome Web Store publication
- [ ] Custom exclude list for specific domains
- [ ] Smooth scroll animation options
- [ ] Per-tab group sync settings
- [ ] Sync history/undo functionality

## 📝 Version History

### v1.0.1 (Current)
- Added dark mode support
- Improved keyboard accessibility
- Enhanced error handling
- Security improvements (CSP)
- Code refactoring and optimization

### v1.0.0
- Initial release
- Basic scroll synchronization
- Percentage and pixel sync modes
- Settings persistence

## 📄 License

MIT License - Free to use and modify

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Contact

- GitHub: [@nariyaz](https://github.com/nariyaz)
- Issues: [GitHub Issues](https://github.com/nariyaz/split-view-scroller/issues)

## 🙏 Acknowledgments

Built with Chrome Extension Manifest V3 APIs and modern web standards.
