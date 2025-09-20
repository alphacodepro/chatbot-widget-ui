const messagesDiv = document.getElementById("messages");
const input = document.getElementById("input");
const sendBtn = document.getElementById("send");

function addMessage(role, text) {
  const el = document.createElement("div");
  el.textContent = `${role}: ${text}`;
  messagesDiv.appendChild(el);
}

// Send message to backend
sendBtn.addEventListener("click", async () => {
  const text = input.value.trim();
  if (!text) return;

  addMessage("You", text);
  input.value = "";

  try {
    const res = await fetch("https://chatbot-backend-1-ul5u.onrender.com/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });
    const data = await res.json();
    addMessage("Bot", data.reply);
    window.parent.postMessage({ type: "new-message", payload: data.reply }, "*");
  } catch (err) {
    addMessage("System", "Error: " + err.message);
  }
});

// Notify parent that iframe is ready
window.parent.postMessage({ type: "ready" }, "*");
