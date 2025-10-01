(function () {
  // Main Cloudflare Pages URL for v2 widget with cache-busting
  const IFRAME_URL = "https://chatbot-widget-ui.pages.dev/?embed=1";

  // Mobile detection
  function isMobile() {
    return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // Responsive dimensions
  function getResponsiveDimensions() {
    const mobile = isMobile();
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    if (mobile) {
      if (screenWidth <= 360) {
        return {
          bubble: { size: 50, bottom: 15, right: 15 },
          iframe: { width: Math.floor(screenWidth * 0.95), height: Math.floor(screenHeight * 0.85), bottom: Math.floor(screenHeight * 0.075), right: Math.floor(screenWidth * 0.025) }
        };
      } else if (screenWidth <= 480) {
        return {
          bubble: { size: 55, bottom: 18, right: 18 },
          iframe: { width: Math.floor(screenWidth * 0.90), height: Math.floor(screenHeight * 0.80), bottom: Math.floor(screenHeight * 0.10), right: Math.floor(screenWidth * 0.05) }
        };
      } else {
        const width = Math.min(420, Math.floor(screenWidth * 0.85));
        const height = Math.floor(screenHeight * 0.75);
        const rightMargin = Math.floor(screenWidth * 0.075);
        return {
          bubble: { size: 60, bottom: 20, right: 20 },
          iframe: { width, height, bottom: Math.floor(screenHeight * 0.125), right: rightMargin }
        };
      }
    } else {
      return {
        bubble: { size: 60, bottom: 20, right: 20 },
        iframe: { width: 350, height: 500, bottom: 90, right: 20 }
      };
    }
  }

  // Create bubble button
  const bubble = document.createElement("div");
  bubble.innerText = "💬";
  bubble.setAttribute('aria-label', 'Open chat widget');
  bubble.setAttribute('role', 'button');
  bubble.setAttribute('tabindex', '0');

  function updateBubbleStyles() {
    const dims = getResponsiveDimensions();
    bubble.style.cssText = `
      position: fixed; bottom: ${dims.bubble.bottom}px; right: ${dims.bubble.right}px;
      width: ${dims.bubble.size}px; height: ${dims.bubble.size}px;
      border-radius: 50%; background: #4f46e5; color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: ${dims.bubble.size * 0.47}px; cursor: pointer; z-index: 999999;
      box-shadow: 0 4px 10px rgba(0,0,0,0.2);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      -webkit-tap-highlight-color: rgba(0,0,0,0.1);
    `;
  }
  updateBubbleStyles();
  document.body.appendChild(bubble);

  // Create iframe
  const iframe = document.createElement("iframe");
  iframe.src = IFRAME_URL;
  iframe.setAttribute('title', 'Luna Assistant Chat Widget');
  iframe.sandbox = "allow-scripts allow-forms allow-same-origin";

  function updateIframeStyles() {
    const dims = getResponsiveDimensions();
    const mobile = isMobile();
    const borderRadius = mobile ? '18px' : '10px';
    const shadow = mobile ? '0 8px 32px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.3)';
    
    iframe.style.cssText = `
      position: fixed; bottom: ${dims.iframe.bottom}px; right: ${dims.iframe.right}px;
      width: ${dims.iframe.width}px; height: ${dims.iframe.height}px;
      border: none; border-radius: ${borderRadius};
      display: none; z-index: 999999;
      box-shadow: ${shadow};
      transition: opacity 0.3s ease, transform 0.3s ease;
    `;
  }
  updateIframeStyles();
  document.body.appendChild(iframe);

  // Toggle widget
  function toggleWidget() {
    const isVisible = iframe.style.display !== "none";
    iframe.style.display = isVisible ? "none" : "block";
    bubble.style.transform = isVisible ? 'scale(1)' : 'scale(0.95)';
    setTimeout(() => bubble.style.transform = 'scale(1)', 150);

    if (!isVisible && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: "open" }, new URL(IFRAME_URL).origin);
    }
  }

  bubble.addEventListener("click", toggleWidget);
  bubble.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleWidget(); }
  });

  // Resize handling
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => { updateBubbleStyles(); updateIframeStyles(); }, 250);
  });
  window.addEventListener("orientationchange", () => {
    setTimeout(() => { updateBubbleStyles(); updateIframeStyles(); }, 500);
  });

  // Message listener
  window.addEventListener("message", (e) => {
    if (e.origin !== new URL(IFRAME_URL).origin) return;
    console.log("Widget host received:", e.data);
  });

  // Close on outside click for mobile
  if (isMobile()) {
    document.addEventListener("touchstart", (e) => {
      if (iframe.style.display !== "none" && !iframe.contains(e.target) && !bubble.contains(e.target)) {
        iframe.style.display = "none";
      }
    });
  }
})();
