var button = document.createElement('button')
button.textContent = "Teleport"
button.addEventListener(
    "click", async () => {
        await chrome.runtime.sendMessage({data: 'START_TELEPORT'})
    }, false);

document.body.appendChild(button)