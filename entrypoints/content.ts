// Area selection related variables
let isAreaCapturing = false;
let startX = 0;
let startY = 0;
let selectorOutlineElement: HTMLElement | null = null;
let overlayElement: HTMLElement | null = null;

function initialize() {
    // Listen for messages from popup
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'startCapturing') {
            // do a cleanup first anyway
            cleanupAreaSelection();
            // then create the overlay
            createOverlay();
            sendResponse({ ok: true });

            // notify background script, capture is started
            browser.runtime.sendMessage({
                action: 'captureStarted',
                stack: message.stack,
                srcUrl: window.location.href
            });
        } else if (message.action === 'cropArea') {
            // Crop the captured image
            cropScreenshot(message.image, message.area);
        }
    });

    // Cancel on escape key press
    window.addEventListener('keyup', (evt: KeyboardEvent) => {
        if (overlayElement && evt.key === 'Escape') {
            cleanupAreaSelection();
            browser.runtime.sendMessage({ action: 'captureCancelled' })
        }
    });
}

// Capture screenshot
function cropScreenshot(dataUrl: string, area: any) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
        // Set canvas size to selection area size
        canvas.width = area.width * area.devicePixelRatio;
        canvas.height = area.height * area.devicePixelRatio;

        if (ctx) {
            // Draw the cropped image
            ctx.drawImage(
                img,
                area.x * area.devicePixelRatio,
                area.y * area.devicePixelRatio,
                area.width * area.devicePixelRatio,
                area.height * area.devicePixelRatio,
                0,
                0,
                area.width * area.devicePixelRatio,
                area.height * area.devicePixelRatio
            );

            const croppedDataUrl = canvas.toDataURL('image/png');

            // Send the cropped image data
            browser.runtime.sendMessage({
                action: 'areaCropped',
                data: {
                    image: croppedDataUrl,
                    width: area.width,
                    height: area.height
                }
            });
        }
    };

    img.src = dataUrl;
}

// Create overlay
function createOverlay() {
    overlayElement = document.createElement('div');
    overlayElement.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.2);
        z-index: 2147483646;
        cursor: crosshair;
    `;
    overlayElement.addEventListener('mousedown', startAreaSelection);
    overlayElement.addEventListener('mousemove', updateSelection);
    overlayElement.addEventListener('mouseup', endAreaSelection);

    // Add a tooltip to the overlay to guide the user
    const tooltipElement = document.createElement('div');
    tooltipElement.style.cssText = `
        position: absolute;
        top: 10px;
        left: 50%;
        transform: translate(-50%, 0);
        padding: 10px 14px;
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        font-size: 16px;
        border-radius: 4px;
    `;
    tooltipElement.textContent = 'Select the UI on the page to clone. Press Esc to cancel.';

    // Append the tooltip to the overlay
    overlayElement.appendChild(tooltipElement);
    document.body.appendChild(overlayElement);
}

// Create selection box
function createSelectionArea() {
    selectorOutlineElement = document.createElement('div');
    selectorOutlineElement.style.cssText = `
    position: fixed;
    border: 2px solid #007AFF;
    background: rgba(0, 122, 255, 0.1);
    z-index: 2147483647;
    pointer-events: none;
  `;
    document.body.appendChild(selectorOutlineElement);
}

// Update selection box position and size
function updateSelection(e: MouseEvent) {
    if (!isAreaCapturing || !selectorOutlineElement) return;

    const currentX = e.clientX;
    const currentY = e.clientY;

    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);

    selectorOutlineElement.style.left = `${left}px`;
    selectorOutlineElement.style.top = `${top}px`;
    selectorOutlineElement.style.width = `${width}px`;
    selectorOutlineElement.style.height = `${height}px`;
}

// Start selection
function startAreaSelection(e: MouseEvent) {
    isAreaCapturing = true;
    startX = e.clientX;
    startY = e.clientY;
    createSelectionArea();
}

// Clean up selection elements
function cleanupAreaSelection() {
    if (selectorOutlineElement) {
        selectorOutlineElement.remove();
        selectorOutlineElement = null;
    }
    if (overlayElement) {
        overlayElement.remove();
        overlayElement = null;
    }
}

// End selection and capture screenshot
function endAreaSelection() {
    if (!isAreaCapturing || !selectorOutlineElement) return;

    isAreaCapturing = false;

    const rect = selectorOutlineElement.getBoundingClientRect();
    cleanupAreaSelection();

    // Add a small delay to prevent overlay from being included in the screenshot
    setTimeout(() => {
        // Send message to background for screenshot
        browser.runtime.sendMessage({
            action: 'captureArea',
            data: {
                area: {
                    x: rect.left,   // Don't add window.scrollX
                    y: rect.top,
                    width: rect.width,
                    height: rect.height,
                    devicePixelRatio: window.devicePixelRatio
                }
            }
        });
    }, 200);
}

function main() {
    initialize();
}

export default defineContentScript({
    matches: ['<all_urls>'],
    main,
});
