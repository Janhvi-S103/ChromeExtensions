let isPIPActive = false;
let lastFoundVideo = null;

// Function to find video element on the page, with special handling for Google Meet
function findVideoElement() {
    // First, check if we have a previously found video that's still valid
    if (lastFoundVideo && document.contains(lastFoundVideo)) {
        return lastFoundVideo;
    }

    // Try to find a standard video element
    let video = document.querySelector("video");
    
    // Check specifically for Google Meet videos
    if (!video) {
        // Google Meet specific selectors
        // The video element is often nested within specific divs
        const meetSelectors = [
            // Main meeting video
            'div[data-is-persistent-viewport="true"] video',
            // Shared content video
            'div[data-screencast-viewer] video',
            // General Google Meet video
            '.vjs-tech',
            // Try some broader selectors as fallback
            '[data-video-id] video',
            // Last resort - any video tag
            'video'
        ];
        
        for (const selector of meetSelectors) {
            video = document.querySelector(selector);
            if (video) break;
        }
    }
    
    // If we found a video, remember it for future use
    if (video) {
        lastFoundVideo = video;
    }
    
    return video;
}

function enablePIP() {
    let video = findVideoElement();

    if (!video) {
        if (!isPIPActive) {
            console.log("No video found on this page");
            // Using a more subtle notification instead of an alert
            showNotification("No video found on this page");
            isPIPActive = true;
            setTimeout(() => isPIPActive = false, 3000);
        }
        return;
    }

    // For Google Meet - ensure video is playing
    if (video.paused) {
        try {
            // Attempt to play the video if it's paused
            video.play().catch(() => {
                // Some videos might not play automatically due to autoplay policies
                console.log("Couldn't autoplay the video");
            });
        } catch (err) {
            console.log("Error playing video:", err);
        }
    }

    if (document.pictureInPictureElement) {
        document.exitPictureInPicture()
            .then(() => {
                console.log("Exited PiP mode");
                isPIPActive = false;
            })
            .catch(err => {
                console.error("Error exiting PiP:", err);
            });
        return;
    }

    // For Google Meet - ensure video readiness
    if (video.readyState === 0) {
        showNotification("Video is loading, please try again in a moment");
        return;
    }

    video.requestPictureInPicture()
        .then(() => {
            console.log("Video entered PiP mode successfully");
            isPIPActive = true;
        })
        .catch(err => {
            console.error("PIP request failed:", err);
            showNotification("PiP mode is not supported on this video");
            isPIPActive = true;
            setTimeout(() => isPIPActive = false, 3000);
        });
}

// Create a less intrusive notification instead of an alert
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.padding = '10px 15px';
    notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    notification.style.color = 'white';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '9999';
    notification.style.fontSize = '14px';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 2500);
}

// Listen for the message from `background.js`
chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "togglePIP") {
        enablePIP();
    }
});

// Scan for videos on page load and periodically
document.addEventListener('DOMContentLoaded', () => {
    findVideoElement();
});

// Periodically check for new videos
setInterval(findVideoElement, 5000);

// Monitor for video elements being added to the page
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        if (mutation.addedNodes.length) {
            findVideoElement();
        }
    }
});

// Start observing the document body for changes
observer.observe(document.body, { childList: true, subtree: true });