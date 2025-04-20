let isPIPActive = false; // Prevents multiple execution

function enablePIP() {
    let video = document.querySelector("video");

    if (!video) {
        if (!isPIPActive) {
            alert("No video found on this page!");
            isPIPActive = true; // Prevents duplicate alerts
            setTimeout(() => isPIPActive = false, 3000);
        }
        return;
    }

    if (document.pictureInPictureElement) {
        document.exitPictureInPicture();
        return;
    }

    video.requestPictureInPicture()
        .then(() => {
            console.log("Video entered PiP mode successfully.");
            isPIPActive = true; // Mark as PiP active
            setTimeout(() => isPIPActive = false, 3000); // Reset after 3s
        })
        .catch(err => {
            console.error("PIP request failed:", err);
            if (!isPIPActive) {
                alert("PIP mode is not supported on this video.");
                isPIPActive = true;
                setTimeout(() => isPIPActive = false, 3000);
            }
        });
}

// Listen for the message from `background.js`
chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "togglePIP") {
        enablePIP();
    }
});
