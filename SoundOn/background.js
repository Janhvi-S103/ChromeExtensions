// background.js

let currentSettings = {
    selectedSound: 'ping',
    volume: 50
};

const presetSounds = {
    ping: 'ping.mp3',
    ding: 'ding.mp3',
    chime: 'chime.mp3',
    fart: 'fart.mp3',
};

function loadSettings() {
    chrome.storage.sync.get(['selectedSound', 'volume', 'customSoundName'], function(result) {
        if (result.selectedSound) currentSettings.selectedSound = result.selectedSound;
        if (result.volume) currentSettings.volume = result.volume;
        if (result.customSoundName) currentSettings.customSoundName = result.customSoundName;
    });
}

chrome.runtime.onInstalled.addListener(loadSettings);

// Listen for new tabs
chrome.tabs.onCreated.addListener((tab) => {
    playSound(currentSettings.selectedSound, currentSettings.volume);
});

// Listen for tab updates (URL navigations)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Check if the tab has completed loading and it's not a new tab page
    if (changeInfo.status === 'complete' && tab.url !== 'chrome://newtab/') {
        playSound(currentSettings.selectedSound, currentSettings.volume);
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'updateSettings') {
        currentSettings = {...currentSettings, ...request};
        chrome.storage.sync.set(currentSettings);
    } else if (request.action === 'previewSound') {
        playSound(request.sound, request.volume);
    }
});

function playSound(sound, volume) {
    let audioSrc = presetSounds[sound];
    if (!audioSrc && sound === 'custom') {
        chrome.storage.local.get(['customSound'], function(result) {
            if (result.customSound) {
                const audio = new Audio(result.customSound);
                audio.volume = volume / 100;
                audio.play();
            }
        });
    } else if (audioSrc) {
        const audio = new Audio(audioSrc);
        audio.volume = volume / 100;
        audio.play();
    }
}

// Load settings when the background script starts
loadSettings();