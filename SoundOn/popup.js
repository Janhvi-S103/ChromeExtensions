// popup.js

document.addEventListener('DOMContentLoaded', function () {
    const soundSelect = document.getElementById('sound-select');
    const volumeSlider = document.getElementById('volume');
    const volumeValue = document.getElementById('volume-value');
    const saveButton = document.getElementById('save-settings');

    // Create debug info area
    const debugArea = document.createElement('div');
    debugArea.id = 'debug-info';
    debugArea.style.marginTop = '20px';
    debugArea.style.padding = '10px';
    debugArea.style.backgroundColor = '#f5f5f5';
    debugArea.style.border = '1px solid #ddd';
    debugArea.style.fontSize = '12px';
    debugArea.style.fontFamily = 'monospace';
    debugArea.style.maxHeight = '100px';
    debugArea.style.overflowY = 'auto';
    document.body.appendChild(debugArea);

    function logDebug(message) {
        const time = new Date().toLocaleTimeString();
        debugArea.innerHTML += `<div>[${time}] ${message}</div>`;
        debugArea.scrollTop = debugArea.scrollHeight;
    }

    // Load saved settings
    logDebug('Loading saved settings...');
    chrome.storage.sync.get(['selectedSound', 'customSoundName', 'volume'], function (result) {
        if (result.selectedSound) {
            soundSelect.value = result.selectedSound;
            logDebug(`Loaded sound setting: ${result.selectedSound}`);
        }
        if (result.volume) {
            volumeSlider.value = result.volume;
            if (volumeValue) volumeValue.textContent = `${result.volume}%`;
            logDebug(`Loaded volume: ${result.volume}`);
        }
    });

    // Update volume text on input
    volumeSlider.addEventListener('input', function () {
        if (volumeValue) volumeValue.textContent = `${this.value}%`;
    });



    // Handle save button click
    saveButton.addEventListener('click', function () {
        const selectedSound = soundSelect.value;
        const volume = volumeSlider.value;

        logDebug(`Saving settings: sound=${selectedSound}, volume=${volume}`);

        // Save settings
        chrome.storage.sync.set({
            selectedSound: selectedSound,
            volume: volume
        }, function () {
            // Notify the background script
            chrome.runtime.sendMessage({
                action: 'updateSettings',
                selectedSound: selectedSound,
                volume: volume
            }, response => {
                logDebug(`Background response: ${response?.status || 'No response'}`);
            });

            // Provide user feedback
            saveButton.textContent = 'Saved!';
            setTimeout(() => { saveButton.textContent = 'Save Settings'; }, 2000);
            logDebug('Settings saved successfully');
        });
    });

    // Preview sound
    soundSelect.addEventListener('change', function () {
        logDebug(`Selected sound: ${soundSelect.value}`);
        previewSound(soundSelect.value);
    });



    function previewSound(sound) {
        logDebug(`Requesting preview of sound: ${sound}`);
        chrome.runtime.sendMessage({
            action: 'previewSound',
            sound: sound,
            volume: volumeSlider.value
        }, response => {
            logDebug(`Preview response: ${response?.status || 'No response'}`);
        });
    }

    logDebug('Popup initialization complete');
});