// popup.js

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
                chrome.storage.local.set({ customSound: e.target.result });
                chrome.storage.sync.set({ customSoundName: file.name });
                soundSelect.value = 'custom';
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