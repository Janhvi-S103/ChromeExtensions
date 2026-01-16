// background.js

let currentSettings = {
    selectedSound: 'ping',
    volume: 50
};

const presetSounds = {
    ping: 'ping.mp3',
    fart: 'fart.mp3',
    ding: 'ding.mp3',
    chime: 'chime.mp3',
};

// Log function for debugging
function debugLog(message, data) {
    console.log(`[Sound On Debug]: ${message}`, data || '');
}

function loadSettings() {
    debugLog('Loading settings');
    chrome.storage.sync.get(['selectedSound', 'volume', 'customSoundName'], function (result) {
        if (result.selectedSound) currentSettings.selectedSound = result.selectedSound;
        if (result.volume) currentSettings.volume = result.volume;
        if (result.customSoundName) currentSettings.customSoundName = result.customSoundName;
        debugLog('Settings loaded:', currentSettings);
    });
}

chrome.runtime.onInstalled.addListener(() => {
    debugLog('Extension installed/updated');
    loadSettings();

    // Create offscreen document
    setupOffscreenDocument('offscreen.html');

    // Test sound playback on installation
    setTimeout(() => {
        debugLog('Testing sound playback on installation');
        playSound('ping', 100);
    }, 2000);
});

// Test function for audio playback
// testPlaySound removed, using playSound instead

// Listen for new tabs
chrome.tabs.onCreated.addListener((tab) => {
    debugLog('New tab created:', tab.id);
    playSound(currentSettings.selectedSound, currentSettings.volume);
});

// Listen for tab updates (URL navigations)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Check if the tab has completed loading and it's not a new tab page
    if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
        debugLog('Tab updated with URL:', tab.url);
        playSound(currentSettings.selectedSound, currentSettings.volume);
    }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    debugLog('Message received:', request);

    if (request.action === 'updateSettings') {
        debugLog('Updating settings with:', request);
        currentSettings = { ...currentSettings, ...request };
        chrome.storage.sync.set(currentSettings);
        sendResponse({ status: 'Settings updated' });
    } else if (request.action === 'previewSound') {
        debugLog('Preview sound requested:', request.sound);
        playSound(request.sound, request.volume);
        sendResponse({ status: 'Sound preview initiated' });
    }

    return true; // Keep the message channel open for async response
});

async function setupOffscreenDocument(path) {
    // Check if offscreen document already exists
    const existingContexts = await chrome.runtime.getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT'],
        documentUrls: [chrome.runtime.getURL(path)]
    });

    if (existingContexts.length > 0) {
        return;
    }

    // Create offscreen document
    await chrome.offscreen.createDocument({
        url: path,
        reasons: ['AUDIO_PLAYBACK'],
        justification: 'To play notification sounds for the extension',
    });
}

async function playSound(sound, volume) {
    debugLog('Playing sound delegator:', sound);
    try {
        await setupOffscreenDocument('offscreen.html');

        // Small delay to ensure offscreen is ready if just created
        // await new Promise(resolve => setTimeout(resolve, 100)); 

        chrome.runtime.sendMessage({
            action: 'playSound',
            sound: sound,
            volume: volume
        }).catch(err => {
            debugLog('Error sending message to offscreen (retrying):', err);
            // Retry once if failed
            setTimeout(() => {
                chrome.runtime.sendMessage({
                    action: 'playSound',
                    sound: sound,
                    volume: volume
                });
            }, 100);
        });
    } catch (e) {
        debugLog('Error playing sound:', e);
    }
}

// Keep service worker alive
function keepAlive() {
    debugLog('Keeping service worker alive');
    setTimeout(keepAlive, 20000);
}
keepAlive();

// Load settings when the background script starts
debugLog('Background script initialized');
loadSettings();