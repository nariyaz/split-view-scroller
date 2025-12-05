// content.js
// This file runs on each webpage and watches for scroll events

// State management
const ScrollState = {
    isSyncing: false,      // Is this tab currently syncing from another tab?
    enableSync: true,      // Is sync turned on?
    syncMode: 'percentage', // Sync mode: 'percentage' or 'pixel'
    isScrollScheduled: false, // Is a scroll update already scheduled?
    syncTimeout: 50        // Milliseconds to wait after sync before enabling scroll events
};

// Configuration
const Config = {
    STORAGE_KEYS: {
        ENABLE_SYNC: 'enableSync',
        SYNC_MODE: 'syncMode'
    },
    MESSAGE_TYPES: {
        SCROLL_EVENT: 'SCROLL_EVENT',
        SYNC_SCROLL: 'SYNC_SCROLL',
        SETTINGS_UPDATED: 'SETTINGS_UPDATED'
    }
};

// Initialize the extension
function init() {
    loadSettings();
    setupEventListeners();
}

// Load user settings from storage
function loadSettings() {
    try {
        chrome.storage.sync.get([
            Config.STORAGE_KEYS.ENABLE_SYNC,
            Config.STORAGE_KEYS.SYNC_MODE
        ], (result) => {
            try {
                ScrollState.enableSync = result.enableSync !== undefined ? result.enableSync : true;
                ScrollState.syncMode = result.syncMode || 'percentage';
            } catch (error) {
                // Silent fail but use default settings
                ScrollState.enableSync = true;
                ScrollState.syncMode = 'percentage';
            }
        });
    } catch (error) {
        // Handle any unexpected errors in the outer try-catch
    }
}

// Setup event listeners for scrolling and messages
function setupEventListeners() {
    // User scroll event - optimized for smooth performance with passive listener
    window.addEventListener('scroll', () => {
        if (!ScrollState.isScrollScheduled) {
            ScrollState.isScrollScheduled = true;
            requestAnimationFrame(handleUserScroll);
        }
    }, { passive: true });

    // Listen for messages from other tabs/background
    chrome.runtime.onMessage.addListener(handleIncomingMessage);
}

// Handle scroll events from user (optimized to run smoothly)
function handleUserScroll() {
    // Don't send if sync is off or if we're currently syncing
    if (!ScrollState.enableSync || ScrollState.isSyncing) {
        ScrollState.isScrollScheduled = false;
        return;
    }

    // Calculate scroll metrics
    const scrollMetrics = calculateScrollMetrics();

    // Don't do anything if page has no scroll
    if (scrollMetrics === null) {
        ScrollState.isScrollScheduled = false;
        return;
    }

    // Send scroll event to other tabs
    sendScrollEvent(scrollMetrics);

    ScrollState.isScrollScheduled = false;
}

// Calculate current scroll metrics
function calculateScrollMetrics() {
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

    // Return null if page has no scroll
    if (scrollHeight <= 0) {
        return null;
    }

    return {
        percentage: window.scrollY / scrollHeight,
        pixel: window.scrollY
    };
}

// Send scroll event to background script
function sendScrollEvent(metrics) {
    chrome.runtime.sendMessage({
        type: Config.MESSAGE_TYPES.SCROLL_EVENT,
        payload: metrics
    }).catch(() => {
        // Handle errors silently in production
        // In a full error handling system, we might want to:
        // 1. Set a flag to stop trying to sync for a while
        // 2. Show a UI indicator that sync is having issues
    });
}

// Handle incoming messages from background script
function handleIncomingMessage(message) {
    switch (message.type) {
        case Config.MESSAGE_TYPES.SYNC_SCROLL:
            handleSyncScrollMessage(message);
            break;

        case Config.MESSAGE_TYPES.SETTINGS_UPDATED:
            handleSettingsUpdateMessage(message);
            break;
    }
}

// Handle scroll sync messages from other tabs
function handleSyncScrollMessage(message) {
    // Don't sync if sync is turned off
    if (!ScrollState.enableSync) {
        return;
    }

    // Set flag: "I'm scrolling because of sync, not user"
    ScrollState.isSyncing = true;

    // Calculate target scroll position based on sync mode
    const targetPixel = calculateTargetScrollPosition(message);

    // Move the scroll position
    window.scrollTo({
        top: targetPixel,
        behavior: 'auto' // Use 'auto' for best performance
    });

    // Turn off flag after a moment
    setTimeout(() => {
        ScrollState.isSyncing = false;
    }, ScrollState.syncTimeout);
}

// Calculate target scroll position based on sync mode
function calculateTargetScrollPosition(message) {
    const currentSyncMode = message.payload.syncMode || ScrollState.syncMode;

    if (currentSyncMode === 'percentage') {
        // Percentage mode: scroll to same relative position
        const targetPercentage = message.payload.percentage;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        return targetPercentage * scrollHeight;
    } else {
        // Pixel mode: scroll to exact pixel position
        return message.payload.pixel;
    }
}

// Handle settings update messages
function handleSettingsUpdateMessage(message) {
    // Update settings when they change
    if (message.payload.enableSync !== undefined) {
        ScrollState.enableSync = message.payload.enableSync;
    }
    if (message.payload.syncMode !== undefined) {
        ScrollState.syncMode = message.payload.syncMode;
    }
}

// Initialize on load
init();
