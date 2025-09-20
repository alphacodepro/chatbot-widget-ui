(function () {
  // Your live widget UI link from Cloudflare Pages
  const IFRAME_URL = "https://chatbot-widget-ui.pages.dev/index.html";  

  const bubble = document.createElement("div");
  bubble.innerText = "💬";
  bubble.style.cssText = `
    position: fixed; bottom: 20px; right: 20px;
    width: 60px; height: 60px;
    border-radius: 50%; background: #4f46e5; color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 28px; cursor: pointer; z-index: 999999;
    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  `;
  document.body.appendChild(bubble);

  const iframe = document.createElement("iframe");
  iframe.src = IFRAME_URL;
  iframe.style.cssText = `
    position: fixed; bottom: 90px; right: 20px;
    width: 350px; height: 500px;
    border: none; border-radius: 10px;
    display: none; z-index: 999999;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  `;
  iframe.sandbox = "allow-scripts allow-forms allow-same-origin";
  document.body.appendChild(iframe);

  bubble.addEventListener("click", () => {
    iframe.style.display = iframe.style.display === "none" ? "block" : "none";
    iframe.contentWindow &&
      iframe.contentWindow.postMessage(
        { type: iframe.style.display === "block" ? "open" : "close" },
        IFRAME_URL
      );
  });

  window.addEventListener("message", (e) => {
    if (e.origin !== new URL(IFRAME_URL).origin) return;
    console.log("Widget host received:", e.data);
  });
})();
