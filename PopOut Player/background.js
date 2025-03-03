chrome.action.onClicked.addListener(async (tab) => {
    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
    });

    chrome.tabs.sendMessage(tab.id, { action: "togglePIP" });
});

// Listen for the keyboard shortcut (Ctrl + Shift + Q)
chrome.commands.onCommand.addListener(async (command) => {
    if (command === "toggle_pip") {
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (tab) {
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["content.js"]
            });

            chrome.tabs.sendMessage(tab.id, { action: "togglePIP" });
        }
    }
});
