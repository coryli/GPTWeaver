chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "open_new_window") {
        // Create a new tab with the HTML content

        const width = 800;
        const height = 600;

        const sanitizedHtml = sanitizeHtml(request.htmlCode); // Ensure you implement a sanitizeHtml function
        const encodedHtml = encodeURIComponent(sanitizedHtml);
        const url = 'data:text/html;charset=utf-8,' + encodedHtml;

        chrome.windows.create({ 
            url: url,
            type: 'popup',
            width: width,
            height: height,
            left: 100,
            top: 100 
        });
    }
});

// Implement a basic HTML sanitization function or use a library like DOMPurify
function sanitizeHtml(html) {
    // Add sanitization logic here
    return html; // Return the sanitized HTML
}
