// background.js
// This file runs in the background and sends messages between tabs

// Main message handler
chrome.runtime.onMessage.addListener(async (message, sender) => {
    // Only work when message type is 'SCROLL_EVENT'
    if (message.type === 'SCROLL_EVENT') {
        await handleScrollEvent(message, sender);
    }
});

/**
 * Handle scroll events from tabs and relay to other tabs
 * @param {Object} message - The scroll event message
 * @param {Object} sender - Information about the sender tab
 */
async function handleScrollEvent(message, sender) {
    try {
        // Load all settings at once to reduce storage calls
        const settings = await getSettings();

        // Don't process if sync is disabled
        if (!settings.enableSync) return;

        // Get the sender's split view ID with cross-browser compatibility
        const senderSplitViewId = getSplitViewId(sender.tab);

        // Relay scroll event to other tabs in the same window and split view
        await relayScrollEventToTabs(message, sender, senderSplitViewId, settings.syncMode);
    } catch (error) {
        // Silent error handling in production
    }
}

/**
 * Get the split view ID with cross-browser compatibility
 * @param {Object} tab - The tab object
 * @returns {string|undefined} - The split view ID or group ID
 */
function getSplitViewId(tab) {
    // Use Chrome's splitViewId if available
    if (tab.splitViewId !== undefined) {
        return tab.splitViewId;
    }

    // Fallback to groupId for browsers that support tab groups (most Chromium-based)
    if (tab.groupId !== undefined) {
        return `group-${tab.groupId}`;
    }

    // Try to get tab position information for other browsers
    try {
        return `pos-${tab.index}`;
    } catch (error) {
        // Return undefined if all methods fail
        return undefined;
    }
}

/**
 * Get user settings from storage
 * @returns {Promise<Object>} - The user settings
 */
async function getSettings() {
    try {
        return await chrome.storage.sync.get({
            enableSync: true,
            syncMode: 'percentage'
        });
    } catch (error) {
        // Return defaults if storage fails
        return {
            enableSync: true,
            syncMode: 'percentage'
        };
    }
}

/**
 * Relay scroll event to other tabs in the same window and split view
 * @param {Object} message - The original scroll message
 * @param {Object} sender - The sender tab information
 * @param {string|undefined} senderSplitViewId - The split view ID of the sender
 * @param {string} syncMode - The current sync mode (percentage/pixel)
 */
async function relayScrollEventToTabs(message, sender, senderSplitViewId, syncMode) {
    try {
        // Get all tabs in the current window
        const tabs = await chrome.tabs.query({ windowId: sender.tab.windowId });

        // For each tab that's not the sender and is in the same split view
        for (const tab of tabs) {
            if (tab.id === sender.tab.id) continue;

            // Check if tabs are in the same split view
            // If no splitViewId, sync with all tabs
            if (isInSameSplitView(senderSplitViewId, tab.splitViewId)) {
                try {
                    // Send scroll info to other tab
                    await chrome.tabs.sendMessage(tab.id, {
                        type: 'SYNC_SCROLL',
                        payload: {
                            ...message.payload,
                            syncMode: syncMode
                        }
                    });
                } catch (error) {
                    // Ignore errors from closed or unloaded tabs
                }
            }
        }
    } catch (error) {
        // Silent error handling in production
    }
}

/**
 * Check if two tabs are in the same split view
 * @param {string|undefined} id1 - Split view ID of first tab
 * @param {string|undefined} id2 - Split view ID of second tab
 * @returns {boolean} - True if in same split view
 */
function isInSameSplitView(id1, id2) {
    // If browser doesn't support split views or tab groups
    if (id1 === undefined && id2 === undefined) {
        return true; // Consider all tabs part of the same view
    }

    // If one has ID and the other doesn't, they're not in the same view
    if ((id1 === undefined && id2 !== undefined) ||
        (id1 !== undefined && id2 === undefined)) {
        return false;
    }

    // If both have IDs, check if they're the same
    return id1 === id2;
}

/**
 * Detect the browser environment
 * @returns {Object} - Browser information
 */
function detectBrowser() {
    // Check for Chrome
    const isChrome = !!window.chrome &&
                    (!!window.chrome.webstore || !!window.chrome.runtime);

    // Check for Firefox
    const isFirefox = typeof InstallTrigger !== 'undefined';

    // Check for Edge (Chromium-based)
    const isEdgeChromium = isChrome &&
                          (navigator.userAgent.indexOf("Edg") != -1);

    return {
        isChrome,
        isFirefox,
        isEdgeChromium,
        isChromium: isChrome && !isEdgeChromium
    };
}
