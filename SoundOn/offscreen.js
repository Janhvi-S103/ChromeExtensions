// offscreen.js

const presetSounds = {
    ping: 'ping.mp3',
    fart: 'fart.mp3',
    ding: 'ding.mp3',
    chime: 'chime.mp3',
};

// Log function for debugging
function debugLog(message, data) {
    console.log(`[Sound On Offscreen]: ${message}`, data || '');
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    debugLog('Message received:', request);

    if (request.action === 'playSound') {
        playSound(request.sound, request.volume);
        sendResponse({ status: 'Sound playback initiated' });
    }

    return true;
});

function playSound(sound, volume) {
    debugLog('Playing sound:', sound);

    try {
        let audioSrc = presetSounds[sound];

        if (audioSrc) {
            debugLog('Using preset sound:', audioSrc);
            const fullPath = chrome.runtime.getURL(audioSrc);
            playAudio(fullPath, volume);
        } else {
            debugLog('No valid audio source found for sound:', sound);
        }
    } catch (error) {
        debugLog('Sound playback error:', error);
    }
}

function playAudio(src, volume) {
    try {
        const audio = new Audio(src);
        audio.volume = volume / 100;

        audio.onloadeddata = () => {
            debugLog('Audio loaded successfully');
        };

        audio.onerror = (e) => {
            debugLog('Audio load error:', e);
        };

        const playPromise = audio.play();

        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    debugLog('Audio playback started successfully');
                })
                .catch(error => {
                    debugLog('Audio playback failed:', error);
                });
        }
    } catch (e) {
        debugLog('Error creating audio object:', e);
    }
}
