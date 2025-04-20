document.getElementById("pipButton").addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab) {
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content.js"]
        });

        chrome.tabs.sendMessage(tab.id, { action: "togglePIP" });
    }
});
