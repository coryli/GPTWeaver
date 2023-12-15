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
            renderHtmlContent(codeBlockContainer, htmlCode);
        });

        // Add the "Render" button to the new container
        buttonsContainer.appendChild(renderButton);

        // Add the new buttons container to the header
        headerDiv.appendChild(buttonsContainer);
    }
}

function renderHtmlContent(codeBlockContainer, htmlCode) {
    // Check if the rendered container already exists, and if so, remove it
    let existingRenderedContainer = codeBlockContainer.nextElementSibling;
    if (existingRenderedContainer && existingRenderedContainer.classList.contains('rendered-html-container')) {
        existingRenderedContainer.remove();
    }

    // Create a new container for the rendered HTML
    let renderedContainer = document.createElement('div');
    renderedContainer.className = 'rendered-html-container';
    renderedContainer.style.cssText = 'border: 1px solid #ddd; padding: 10px; margin-top: 10px; background-color: white;';

    // Use a sandbox iframe to isolate the HTML content
    let iframe = document.createElement('iframe');
    iframe.style.cssText = 'width: 100%; height: 300px; border: none;'; // Adjust height as needed
    iframe.srcdoc = htmlCode; // You might want to sanitize this HTML

    renderedContainer.appendChild(iframe);

    // Insert the rendered container after the code block container
    codeBlockContainer.parentNode.insertBefore(renderedContainer, codeBlockContainer.nextSibling);
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