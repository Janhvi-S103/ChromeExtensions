// popup.js

const presetSounds = {
    ping: 'ping.mp3',
    ding: 'ding.mp3',
    chime: 'chime.mp3',
    fart: 'fart.mp3',
};

document.addEventListener('DOMContentLoaded', function() {
    const soundSelect = document.getElementById('sound-select');
    const customSound = document.getElementById('custom-sound');
    const volumeSlider = document.getElementById('volume');
    const saveButton = document.getElementById('save-settings');

    // Load saved settings
    chrome.storage.sync.get(['selectedSound', 'customSoundName', 'volume'], function(result) {
        if (result.selectedSound) {
            soundSelect.value = result.selectedSound;
        }
        if (result.customSoundName) {
            customSound.nextElementSibling.textContent = result.customSoundName;
        }
        if (result.volume) {
            volumeSlider.value = result.volume;
        }
    });

    // Handle custom sound upload
    customSound.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                chrome.storage.local.set({ customSound: e.target.result, customSoundName: file.name });
            };
            reader.readAsDataURL(file);
            event.target.nextElementSibling.textContent = file.name;
        }
    });

    // Handle save button click
    saveButton.addEventListener('click', function() {
        const selectedSound = soundSelect.value;
        const volume = volumeSlider.value;

        // Save settings
        chrome.storage.sync.set({
            selectedSound: selectedSound,
            volume: volume
        }, function() {
            // Notify the background script
            chrome.runtime.sendMessage({
                action: 'updateSettings',
                selectedSound: selectedSound,
                volume: volume
            });

            // Provide user feedback
            saveButton.textContent = 'Saved!';
            setTimeout(() => { saveButton.textContent = 'Save Settings'; }, 2000);
        });
    });

    // Preview sound
    soundSelect.addEventListener('change', function() {
        previewSound(soundSelect.value);
    });

    function previewSound(sound) {
        chrome.runtime.sendMessage({
            action: 'previewSound',
            sound: sound,
            volume: volumeSlider.value
        });
    }
});
// background.js
let currentSettings = {
    selectedSound: 'ping',
    volume: 50
};

chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.get(['selectedSound', 'volume'], function(result) {
        if (result.selectedSound) currentSettings.selectedSound = result.selectedSound;
        if (result.volume) currentSettings.volume = result.volume;
    });
});

chrome.tabs.onCreated.addListener(function() {
    playSound(currentSettings.selectedSound, currentSettings.volume);
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'updateSettings') {
        currentSettings.selectedSound = request.selectedSound;
        currentSettings.volume = request.volume;
        chrome.storage.sync.set({
            selectedSound: currentSettings.selectedSound,
            volume: currentSettings.volume
        });
    } else if (request.action === 'previewSound') {
        playSound(request.sound, request.volume);
    }
});

function playSound(sound, volume) {
    let audioSrc = presetSounds[sound];
    if (!audioSrc) {
        chrome.storage.local.get(['customSound'], function(result) {
            if (result.customSound) {
                const audio = new Audio(result.customSound);
                audio.volume = volume / 100;
                audio.play();
            }
        });
    } else {
        const audio = new Audio(audioSrc);
        audio.volume = volume / 100;
        audio.play();
    }
}