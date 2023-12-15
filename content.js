function injectRenderButton(codeBlockContainer) {
    console.log("Injecting Render Button"); // Console log for debugging

    // Locate the header div where the "Copy code" button is
    let headerDiv = codeBlockContainer.querySelector('div.flex.items-center');

    // Check if the buttons container already exists to avoid duplicates
    if (!headerDiv.querySelector('.buttons-container')) {
        // Create a new div to contain both buttons
        let buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'flex gap-4 buttons-container';

        // Move the existing "Copy code" button into the new container
        let copyCodeButton = headerDiv.querySelector('button');
        if (copyCodeButton) {
            buttonsContainer.appendChild(copyCodeButton);
        }

        // Create the "Render" button element
        let renderButton = document.createElement('button');
        renderButton.className = 'flex gap-1 items-center';
        renderButton.textContent = 'Render';

        // Add event listener for the "Render" button
        renderButton.addEventListener('click', function() {
            let htmlCode = codeBlockContainer.querySelector('code').textContent;
            chrome.runtime.sendMessage({ action: "open_new_window", htmlCode: htmlCode });
        });

        // Add the "Render" button to the new container
        buttonsContainer.appendChild(renderButton);

        // Add the new buttons container to the header
        headerDiv.appendChild(buttonsContainer);
    }
}

// Function to process added nodes
function processAddedNodes(addedNodes) {
    addedNodes.forEach(node => {
        console.log("Processing added nodes"); // Console log for debugging
        // Check if the node is the type of element you want to modify
        if (node.matches && node.matches('pre .bg-black')) {
            injectRenderButton(node);
        }
    });
}

// MutationObserver callback
function mutationCallback(mutationsList) {
    for (let mutation of mutationsList) {
        if (mutation.type === 'childList') {
            processAddedNodes(mutation.addedNodes);
        }
    }
}

// Set up the MutationObserver
const observer = new MutationObserver(mutationCallback);
observer.observe(document.body, { childList: true, subtree: true });

// Delay the observation to ensure the page is fully loaded
setTimeout(() => {
    console.log("Starting MutationObserver"); // Console log for debugging

    observer.observe(document.body, { childList: true, subtree: true });
    document.querySelectorAll('pre .bg-black').forEach(injectRenderButton);
}, 1000); // Delay set to 1 second