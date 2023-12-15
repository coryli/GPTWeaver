
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
    
    // Move the existing "Copy code" button into the new container
    let copyCodeButton = headerDiv.querySelector('button');
    if (copyCodeButton) {
        buttonsContainer.appendChild(copyCodeButton);
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

    // Remove the Zero Width Character from the HTML code
    htmlCode = htmlCode.replace(/\u200B$/, '');
    
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

function processCodeBlockForRendering(codeBlockContainer) {
    console.log("Processing for rendering"); // Console log for debugging
    let codeContent = codeBlockContainer.querySelector('code');
    console.log(codeContent);
    // Check for double return line as separator
    if (codeContent.textContent.includes('#*#*#')) {
        // Split the content at the first occurrence of double return line
        let parts = codeContent.textContent.split('#*#*#');
        let htmlCodeToRender = parts[0]; // Use the content before the separator for rendering

        renderHtmlContent(codeBlockContainer, htmlCodeToRender);

        // Optionally, remove the part after the separator from the displayed code
        codeContent.textContent = parts[0];
    }

}

function decodeHtmlEntities(text) {
    var textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
}
// MutationObserver callback
function mutationCallback(mutationsList) {
    console.log("Mutation callback"); // Console log for debugging
    for (let mutation of mutationsList) {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
                if (node.matches && node.matches('pre .bg-black')) {
                    processCodeBlockForRendering(node);
                }
            });
        }
    }
}

function monitorCodeBlocks() {
    document.querySelectorAll('pre .bg-black').forEach((codeBlockContainer) => {
        injectButtons(codeBlockContainer);
        processCodeBlockForRendering(codeBlockContainer);
    });
}

// Set up the MutationObserver
const observer = new MutationObserver(mutationCallback);
observer.observe(document.body, { childList: true, subtree: true });

// Initial processing and monitoring of code blocks
setTimeout(() => {
    monitorCodeBlocks();
}, 1000); // Delay set to 1 second
