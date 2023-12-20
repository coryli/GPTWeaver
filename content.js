function injectButtons(codeBlockContainer) {    
    let headerDiv = codeBlockContainer.querySelector('div.flex.items-center');
    
    // Create and append the "Reduce" button with SVG icon
    let reduceButton = document.createElement('button');
    reduceButton.className = 'flex gap-1 items-center';
    reduceButton.innerHTML = getSvgIcon('expand'); // Start with 'expand' icon since the code will be hidden initially
    reduceButton.addEventListener('click', function () {
        toggleCodeBlockVisibility(codeBlockContainer, reduceButton);
    });
    
    // Find the "Copy code" button
    let copyCodeButton = headerDiv.querySelector('button');

    // Append the "Reduce" button to the existing buttons container
    headerDiv.insertBefore(reduceButton, copyCodeButton);
    
    // Initially hide the code block
    let codeContent = codeBlockContainer.querySelector('code');
    codeContent.style.display = 'none';
}

// Custom function to copy code to clipboard
function copyCodeToClipboard(codeBlockContainer) {
    try {
        const codeContent = codeBlockContainer.querySelector('code').textContent;
        navigator.clipboard.writeText(codeContent)
        .then(() => console.log("Code copied to clipboard!"))
        .catch(err => console.error("Failed to copy code: ", err));
    } catch (error) {
        console.error('Error copying code: ', error);
    }
}

function toggleCodeBlockVisibility(codeBlockContainer, reduceButton) {
    let codeContent = codeBlockContainer.querySelector('code');
    if (codeContent.style.display === 'none') {
        codeContent.style.display = ''; // Show the code
        reduceButton.innerHTML = getSvgIcon('reduce'); // Change button icon to "Reduce"
    } else {
        codeContent.style.display = 'none'; // Hide the code
        reduceButton.innerHTML = getSvgIcon('expand'); // Change button icon to "Expand"
    }
}

function getSvgIcon(state) {
    if (state === 'expand') {
        return `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="icon-sm">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M12 11V5H13V11H19V12H13V18H12V12H6V11H12Z"/>
        </svg>`;
    } else {
        return `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="icon-sm">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M6 11H18V13H6V11Z"/>
        </svg>`;
    }
}

function renderHtmlContent(codeBlockContainer, htmlCode) {
    try {

        // Create a new Blob with HTML only
        const blobContent = new Blob([htmlCode], { type: 'text/html' });

        // Create a new URL for the Blob
        const blobUrl = URL.createObjectURL(blobContent);

        // Create and append the iframe to render HTML and execute JavaScript
        let iframe = document.createElement('iframe');
        iframe.style.cssText = 'width: 100%; height: 500px; border: none; background-color: #343541'; // Adjust size as needed
        iframe.sandbox = "allow-scripts";
        iframe.src = blobUrl;

        // Remove existing rendered container if it exists
        let existingRenderedContainer = codeBlockContainer.nextElementSibling;
        if (existingRenderedContainer && existingRenderedContainer.classList.contains('rendered-html-container')) {
            existingRenderedContainer.remove();
        }

        // Create a new container for the iframe
        let renderedContainer = document.createElement('div');
        renderedContainer.className = 'rendered-html-container';
        renderedContainer.style.cssText = 'margin-top: 10px; background-color: rgb(52, 53, 65);';
        
        renderedContainer.appendChild(iframe);
        
        // Insert the rendered container after the code block container
        codeBlockContainer.parentNode.insertBefore(renderedContainer, codeBlockContainer.nextSibling);

        // Cleanup the Blob URL when no longer needed
        iframe.onload = () => {
            URL.revokeObjectURL(blobUrl);
        };

    } catch (error) {
        console.error('Error rendering HTML content: ', error);
    }
}

function processCodeBlockForRendering(codeBlockContainer) {
    // Check if this code block has already been processed
    if (codeBlockContainer.dataset.processed === 'true') {
        return; // Already processed, so skip it
    }

    let codeContent = codeBlockContainer.querySelector('code');
    if (codeContent.textContent.includes('</html>')) {
        let parts = codeContent.textContent.split('</html>');
        renderHtmlContent(codeBlockContainer, parts[0]);
        codeBlockContainer.dataset.processed = 'true'; // Mark as processed
    }
}

// MutationObserver callback
function mutationCallback(mutationsList) {
    mutationsList.forEach(mutation => {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
                if (node.matches && node.matches('pre .bg-black') && node.dataset.processed !== 'true') {
                    injectButtons(node);
                    processCodeBlockForRendering(node);
                }
                if (node.querySelectorAll) {
                    node.querySelectorAll('pre .bg-black').forEach(subNode => {
                        if (subNode.dataset.processed !== 'true') {
                            injectButtons(subNode);
                            processCodeBlockForRendering(subNode);
                        }
                    });
                }
            });
        }
    });
}


const debouncedProcessCodeBlocks = debounce(() => {
    document.querySelectorAll('pre .bg-black').forEach(codeBlockContainer => {
        processCodeBlockForRendering(codeBlockContainer);
    });
}, 500); // Adjust the time as needed

function debounce(func, wait) {
    let timeout;
    
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Set up the MutationObserver
const observer = new MutationObserver(mutationCallback);
observer.observe(document.body, { childList: true, subtree: true });
