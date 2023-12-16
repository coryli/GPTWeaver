
function injectButtons(codeBlockContainer) {
    console.log("Injecting Reduce Button"); // Console log for debugging
    
    let headerDiv = codeBlockContainer.querySelector('div.flex.items-center');
    
    // Check if the buttons container already exists
    let buttonsContainer = headerDiv.querySelector('.buttons-container');
    if (!buttonsContainer) {
        // Create a new div to contain the buttons
        buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'flex gap-4 buttons-container';
        headerDiv.appendChild(buttonsContainer);
    }
    
     // Find and override the "Copy code" button
     let copyCodeButton = headerDiv.querySelector('button');
     if (copyCodeButton) {
         buttonsContainer.appendChild(copyCodeButton);
 
         // Override the click event of the "Copy code" button
         copyCodeButton.addEventListener('click', function(event) {
             event.preventDefault(); // Prevent the default action
             copyCodeToClipboard(codeBlockContainer); // Implement your custom copy logic
         }, true); // Use capture phase to ensure this runs before the original event
     }
    
    // Create and append the "Reduce" button with SVG icon
    let reduceButton = document.createElement('button');
    reduceButton.className = 'flex gap-1 items-center';
    reduceButton.innerHTML = getSvgIcon('expand'); // Start with 'expand' icon since the code will be hidden initially
    reduceButton.addEventListener('click', function () {
        toggleCodeBlockVisibility(codeBlockContainer, reduceButton);
    });
    
    // Append the "Reduce" button to the existing buttons container
    buttonsContainer.appendChild(reduceButton);
    
    // Initially hide the code block
    let codeContent = codeBlockContainer.querySelector('code');
    codeContent.style.display = 'none';
    
    headerDiv.appendChild(buttonsContainer);
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
    console.log("Render html content");
    try {
        // Process the HTML for dynamic content
        //htmlCode = processDynamicHtml(htmlCode);

        // Extract JavaScript code from the HTML code
        // const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
        // let scriptContent = "";
        // let match;
        // while ((match = scriptRegex.exec(htmlCode)) !== null) {
        //     scriptContent += match[1]; // match[1] contains the JavaScript code inside the script tag
        // }

        // // Remove the script tags from the HTML code
        // htmlCode = htmlCode.replace(scriptRegex, "");

        // // Append the click event script to the HTML content
        // htmlCode += scriptContent;

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
    
function processDynamicHtml(htmlContent) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // Assign unique identifiers and remove inline event handlers
    doc.querySelectorAll('*').forEach((element, index) => {
        element.setAttribute('data-dynamic-id', 'dynamic-element-' + index);

        // List of common inline event attributes to remove
        const inlineEventAttributes = [
            'onclick', 'onsubmit', 'onload', 'onmouseover', 'onmouseout', 
            'onkeydown', 'onkeyup', 'onkeypress', 'onchange', 'onblur', 'onfocus'
        ];

        // Remove inline event attributes
        inlineEventAttributes.forEach(attr => {
            if (element.hasAttribute(attr)) {
                element.removeAttribute(attr);
            }
        });
    });

    // Serialize the entire document, including <html>, <head>, and <body>
    const serializer = new XMLSerializer();
    return serializer.serializeToString(doc);
}

function processCodeBlockForRendering(codeBlockContainer) {
    console.log("Processing for rendering"); // Console log for debugging

    let codeContent = codeBlockContainer.querySelector('code');

    // Check for double return line as separator
    if (codeContent.textContent.includes('</html>')) {
        // Split the content at the first occurrence of double return line
        let parts = codeContent.textContent.split('</html>');
        let htmlCodeToRender = parts[0]; // Use the content before the separator for rendering

        renderHtmlContent(codeBlockContainer, htmlCodeToRender);

        codeContent.textContent = parts[0];
    }
}

// Function to send messages to the sandbox iframe
function sendMessageToSandbox(data) {
    console.log("Sending message to sandbox:", data);
    sandboxIframe.contentWindow.postMessage(data, '*');
}


function updateDynamicElement(dynamicId, payload) {
    try {
        console.log("Updating Dynamic Element: ", dynamicId);
        
        const element = document.querySelector(`[data-dynamic-id="${dynamicId}"]`);
        if (!element) return;
        
        // Example: Update element based on payload
        // This can be expanded to handle various properties and element types
        if (payload.textContent !== undefined) {
            element.textContent = payload.textContent;
        }
        if (payload.value !== undefined) {
            element.value = payload.value;
        }
        // Add more conditions as needed
    } catch (error) {
        console.error('Error updating dynamic element: ', error);
    }
}

// MutationObserver callback
function mutationCallback(mutationsList) {
    for (let mutation of mutationsList) {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
                // Check if the node itself matches the selector
                if (node.matches && node.matches('pre .bg-black')) {
                    injectButtons(node);
                }
                
                // Check for and process any matching child nodes
                if (node.querySelectorAll) {
                    node.querySelectorAll('pre .bg-black').forEach(subNode => {
                        injectButtons(subNode);
                    });
                }
            });
            
            // Call the debounced function for rendering
            debouncedProcessCodeBlocks();
        }
    }
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

// Listen for messages from the sandbox
window.addEventListener('message', (event) => {
    try {
        console.log("Received message: ", event.data);

        // Validate the origin of the message
        //if (event.origin !== window.location.origin) return;

        // Handle different types of messages
        if (event.data.type === 'clickEvent') {
            // Handle click information from iframe
            // Determine the action based on the clicked element
            const dynamicElementId = event.target.getAttribute('data-dynamic-id');
            //const actionScript = generateScriptForDynamicElement(dynamicElementId);

            sendMessageToSandbox(dynamicElementId);
        } else if (event.data.action === 'updateElement') {
            // Handle updates to dynamic elements
            const { dynamicId, payload } = event.data;
            updateDynamicElement(dynamicId, payload);
        }
    } catch (error) {
        console.error('Error handling message: ', error);
    }
});