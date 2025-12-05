// popup.js
// This file controls the popup window

let currentTabId = null;

// Start when page loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadSettings();
        setupEventListeners();
        setupKeyboardAccessibility();
    } catch (error) {
        showError("Failed to initialize settings");
    }
});

// Load saved settings
async function loadSettings() {
    try {
        const result = await chrome.storage.sync.get({
            syncMode: 'percentage',
            enableSync: true
        });

        // Set sync mode radio button
        const syncModeInput = document.querySelector(`input[name="syncMode"][value="${result.syncMode}"]`);
        if (syncModeInput) {
            syncModeInput.checked = true;
        }

        // Set sync toggle
        const enableSyncInput = document.getElementById('enableSync');
        if (enableSyncInput) {
            enableSyncInput.checked = result.enableSync;
        }
    } catch (error) {
        throw new Error("Failed to load settings");
    }
}

// Set up button clicks and toggles
function setupEventListeners() {
    // Save button
    document.getElementById('saveBtn').addEventListener('click', saveSettings);

    // Close button
    document.getElementById('closeBtn').addEventListener('click', () => {
        window.close();
    });

    // Sync toggle switch
    document.getElementById('enableSync').addEventListener('change', updateSyncStatus);
}

// Keyboard accessibility setup
function setupKeyboardAccessibility() {
    // Enable pressing Enter key on radio buttons to select them
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                radio.checked = true;
                e.preventDefault();
            }
        });
    });

    // Enable pressing Enter key on checkbox to toggle it
    const enableSyncCheckbox = document.getElementById('enableSync');
    enableSyncCheckbox.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            enableSyncCheckbox.checked = !enableSyncCheckbox.checked;
            updateSyncStatus({ target: enableSyncCheckbox });
            e.preventDefault();
        }
    });

    // Enable pressing Enter key on buttons
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                button.click();
                e.preventDefault();
            }
        });
    });

    // Add focus indicators for keyboard navigation
    document.querySelectorAll('input, button').forEach(element => {
        element.addEventListener('focus', () => {
            element.style.outline = '2px solid var(--primary-color)';
        });
        element.addEventListener('blur', () => {
            element.style.outline = '';
        });
    });
}

// Save settings
async function saveSettings() {
    try {
        const syncModeInput = document.querySelector('input[name="syncMode"]:checked');
        const enableSyncInput = document.getElementById('enableSync');

        if (!syncModeInput || !enableSyncInput) {
            throw new Error("UI elements not found");
        }

        const syncMode = syncModeInput.value;
        const enableSync = enableSyncInput.checked;

        await chrome.storage.sync.set({
            syncMode,
            enableSync
        });

        // Tell all tabs about the new settings
        const tabs = await chrome.tabs.query({});
        for (const tab of tabs) {
            try {
                await chrome.tabs.sendMessage(tab.id, {
                    type: 'SETTINGS_UPDATED',
                    payload: { syncMode, enableSync }
                });
            } catch (error) {
                // Ignore errors for unloaded tabs
            }
        }

        // Show saved message and close popup
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            const originalText = saveBtn.textContent;
            saveBtn.textContent = '✓ Saved';
            saveBtn.style.backgroundColor = '#0d652d';

            setTimeout(() => {
                window.close();
            }, 500);
        }
    } catch (error) {
        showError("Failed to save settings");
    }
}

// Update sync status when toggle is changed
async function updateSyncStatus(e) {
    try {
        const enableSync = e.target.checked;
        await chrome.storage.sync.set({ enableSync });

        // Tell all tabs about the change
        const tabs = await chrome.tabs.query({});
        for (const tab of tabs) {
            try {
                await chrome.tabs.sendMessage(tab.id, {
                    type: 'SETTINGS_UPDATED',
                    payload: { enableSync }
                });
            } catch (error) {
                // Ignore errors for unloaded tabs
            }
        }
    } catch (error) {
        showError("Failed to update sync status");
    }
}

// Show error message
function showError(message) {
    const container = document.querySelector('.container');

    // Remove any existing error messages
    const existingError = document.getElementById('error-message');
    if (existingError) {
        existingError.remove();
    }

    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.id = 'error-message';
    errorDiv.style.backgroundColor = '#f8d7da';
    errorDiv.style.color = '#721c24';
    errorDiv.style.padding = '10px';
    errorDiv.style.marginTop = '10px';
    errorDiv.style.borderRadius = '4px';
    errorDiv.style.textAlign = 'center';
    errorDiv.textContent = message;

    // Add to container
    if (container) {
        container.appendChild(errorDiv);
    }

    // Auto remove after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}
