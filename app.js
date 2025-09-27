const messagesDiv = document.getElementById("messages");
const input = document.getElementById("input");
const sendBtn = document.getElementById("send");
const typingIndicator = document.getElementById("typing-indicator");
const breadcrumb = document.getElementById("breadcrumb");
const themeToggle = document.getElementById("theme-toggle");
const attachmentBtn = document.getElementById("attachment");

// Keep existing backend URL
const BACKEND_URL = "https://chatbot-backend-1-ul5u.onrender.com/message";

// Enhanced avatars and emojis
const BOT_AVATAR = "🤖";
const USER_AVATAR = "😊";

// Enhanced FAQ structure with emojis and context replies
const FAQ_CATEGORIES = {
  "📚 Admissions": [
    "How do I apply for admission?",
    "What is the admission fee?",
  ],
  "📖 Courses": [
    "What courses does the college offer?",
    "What is the cost for each course?",
  ],
  "📝 Exams": [
    "When is the next exam?",
    "Where can I get exam guidance?",
  ],
  "💰 Fees": [
    "What is the total fee structure?",
  ],
  "🆘 Help": [
    "How can I contact support?",
  ],
};

// Context-aware follow-ups
const CONTEXT_REPLIES = {
  "exam": ["📅 Exam schedule", "📋 Syllabus", "📍 Exam center", "🔙 Back"],
  "admission": ["📋 Requirements", "💳 Payment", "📞 Contact", "🔙 Back"],
  "course": ["📚 Course details", "💰 Fees", "⏰ Duration", "🔙 Back"],
  "fee": ["💳 Payment options", "📊 Fee breakdown", "🎓 Scholarships", "🔙 Back"],
  "help": ["📞 Phone support", "✉️ Email", "💬 Live chat", "🔙 Back"]
};

// Current navigation state
let currentContext = "main";

// Theme management
function initTheme() {
  const savedTheme = localStorage.getItem('chatbot-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('chatbot-theme', newTheme);
}

// Auto-resize textarea
function autoResize() {
  input.style.height = 'auto';
  input.style.height = Math.min(input.scrollHeight, 120) + 'px';
}

// Enhanced message with animations
function addMessage(role, text, animate = true) {
  const row = document.createElement("div");
  row.className = `row ${role}`;
  if (!animate) row.style.animation = 'none';

  const avatar = document.createElement("div");
  avatar.className = `avatar ${role === "bot" ? "avatar--bot" : "avatar--user"}`;
  avatar.textContent = role === "bot" ? BOT_AVATAR : USER_AVATAR;

  const bubble = document.createElement("div");
  bubble.className = "bubble message " + role;
  bubble.textContent = text;

  if (role === "bot") {
    row.appendChild(avatar);
    row.appendChild(bubble);
  } else {
    row.appendChild(bubble);
    row.appendChild(avatar);
  }

  messagesDiv.appendChild(row);
  // Immediate scroll for messages, then smooth scroll
  requestAnimationFrame(() => scrollToBottom());

  // Secure message to parent with origin validation
  if (role === "bot" && window.self !== window.top) {
    try {
      const parentOrigin = document.referrer ? new URL(document.referrer).origin : null;
      if (parentOrigin) {
        window.parent?.postMessage({ type: "new-message", payload: text }, parentOrigin);
      }
    } catch (e) {
      // Ignore postMessage errors for security
    }
  }
}

// Enhanced smooth scroll with better timing
function scrollToBottom(forceImmediate = false) {
  const doScroll = () => {
    if (messagesDiv) {
      messagesDiv.scrollTo({
        top: messagesDiv.scrollHeight,
        behavior: forceImmediate ? 'auto' : 'smooth'
      });
    }
  };
  
  if (forceImmediate) {
    doScroll();
  } else {
    // Use requestAnimationFrame for better timing
    requestAnimationFrame(() => {
      setTimeout(doScroll, 50);
    });
  }
}

// Enhanced typing with custom message
function showTyping(message = "Luna is typing") {
  if (typingIndicator) {
    const typingText = typingIndicator.querySelector('.typing-text');
    if (typingText) typingText.textContent = message;
    typingIndicator.style.display = "flex";
    scrollToBottom();
  }
}

function hideTyping() {
  if (typingIndicator) typingIndicator.style.display = "none";
}

// Enhanced breadcrumb navigation with clickable elements
function updateBreadcrumb(path) {
  if (!breadcrumb) return;
  
  breadcrumb.innerHTML = '';
  const parts = path.split(' > ');
  
  parts.forEach((part, index) => {
    const span = document.createElement('span');
    span.textContent = part;
    span.style.cursor = 'pointer';
    span.style.textDecoration = 'underline';
    
    // Make breadcrumb parts clickable
    if (part === 'Main Menu' || index === 0) {
      span.onclick = () => {
        if (currentContext !== 'main') {
          addMessage("user", "Back to Main Menu");
          addMessage("bot", "👋 How can I help you today? 😊");
          renderCategoryChips();
        }
      };
      span.style.color = 'var(--accent-color)';
    } else {
      span.style.color = 'var(--text-secondary)';
    }
    
    breadcrumb.appendChild(span);
    
    // Add separator arrow except for last item
    if (index < parts.length - 1) {
      const separator = document.createElement('span');
      separator.textContent = ' > ';
      separator.style.color = 'var(--text-muted)';
      separator.style.cursor = 'default';
      breadcrumb.appendChild(separator);
    }
  });
}

// Create enhanced chips with animations and context
function createChipsBlock(labels, onChipClick, delay = 0) {
  const chipsBlock = document.createElement("div");
  chipsBlock.className = "chips";
  chipsBlock.style.margin = "8px 36px 0 36px";
  chipsBlock.style.animationDelay = `${delay}ms`;

  labels.forEach((label, index) => {
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.textContent = label;
    chip.style.animationDelay = `${delay + (index * 100)}ms`;
    chip.onclick = () => onChipClick(label);
    chipsBlock.appendChild(chip);
  });

  return chipsBlock;
}

// Enhanced category rendering with context
function renderCategoryChips() {
  currentContext = "main";
  updateBreadcrumb("Main Menu");
  
  const categories = Object.keys(FAQ_CATEGORIES);
  const chipsBlock = createChipsBlock(categories, (category) => {
    addMessage("user", category);
    renderQuestionChips(category);
  }, 300);
  
  messagesDiv.appendChild(chipsBlock);
  // Delayed scroll for chips to account for animations
  setTimeout(() => scrollToBottom(), 150);
}

// Enhanced question chips with context-aware replies
function renderQuestionChips(category) {
  const cleanCategory = category.replace(/^[📚📖📝💰🆘]\s*/, '');
  currentContext = cleanCategory.toLowerCase();
  updateBreadcrumb(`Main Menu > ${cleanCategory}`);
  
  const qs = FAQ_CATEGORIES[category] || [];
  if (qs.length === 0) return;

  // Enhanced bot response with emoji
  addMessage("bot", `Here are ${cleanCategory} FAQs. Pick one: 😊`);

  // Add Back button + questions
  const options = ["🔙 Back to Main Menu", ...qs];
  const chipsBlock = createChipsBlock(options, async (option) => {
    if (option === "🔙 Back to Main Menu") {
      addMessage("user", "Back to Main Menu");
      addMessage("bot", "👋 How can I help you today? 😊");
      renderCategoryChips();
    } else {
      addMessage("user", option);
      await sendToBackend(option);
      // Add context-aware follow-up chips
      showContextReplies(currentContext);
    }
  }, 200);
  
  messagesDiv.appendChild(chipsBlock);
  // Delayed scroll for chips to account for animations
  setTimeout(() => scrollToBottom(), 150);
}

// Show context-aware follow-up replies
function showContextReplies(context) {
  const replies = CONTEXT_REPLIES[context];
  if (replies) {
    setTimeout(() => {
      const chipsBlock = createChipsBlock(replies, async (reply) => {
        if (reply === "🔙 Back") {
          addMessage("user", "Back");
          addMessage("bot", "👋 How can I help you today? 😊");
          renderCategoryChips();
        } else {
          addMessage("user", reply);
          await sendToBackend(reply);
        }
      }, 100);
      messagesDiv.appendChild(chipsBlock);
      // Delayed scroll for context chips
      setTimeout(() => scrollToBottom(), 200);
    }, 1000);
  }
}

// Enhanced backend communication
async function sendToBackend(text) {
  showTyping("Luna is thinking...");
  
  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });
    const data = await res.json();

    // Enhanced response delay for natural feel
    setTimeout(() => {
      hideTyping();
      addMessage("bot", data.reply || "Sorry, I couldn't process that. 😅");
    }, 800 + Math.random() * 400); // Variable delay 800-1200ms
    
  } catch (err) {
    hideTyping();
    addMessage("bot", "⚠️ Connection error. Please try again! 🔄");
  }
}

// Enhanced initialization with welcome animation
window.addEventListener("load", () => {
  initTheme();
  
  setTimeout(() => {
    addMessage("bot", "👋 Hello there! I'm Luna, your AI assistant. How can I help you today? 😊");
    setTimeout(() => {
      renderCategoryChips();
    }, 500);
  }, 300);
});

// Enhanced send functionality
async function handleSend() {
  const text = input.value.trim();
  if (!text) return;

  addMessage("user", text);
  input.value = "";
  autoResize();
  
  await sendToBackend(text);
}

// Event listeners
sendBtn.addEventListener("click", handleSend);
themeToggle.addEventListener("click", toggleTheme);

// Enhanced attachment button (placeholder)
attachmentBtn.addEventListener("click", () => {
  addMessage("bot", "📎 File upload coming soon! Stay tuned! 🚀");
});

// Enhanced input handling
input.addEventListener("input", autoResize);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
});

// Auto-focus input for better UX
input.addEventListener("blur", () => {
  setTimeout(() => input.focus(), 100);
});

// Secure parent notification with origin validation
if (window.self !== window.top) {
  try {
    const parentOrigin = document.referrer ? new URL(document.referrer).origin : null;
    if (parentOrigin) {
      window.parent.postMessage({ type: "ready" }, parentOrigin);
    }
  } catch (e) {
    // Ignore postMessage errors for security
  }
}

// Enhanced iframe detection and styling fix
function setupEmbeddedMode() {
  // Check for both iframe context and URL embed parameter
  const isInIframe = window.self !== window.top;
  const hasEmbedParam = new URLSearchParams(window.location.search).has('embed');
  
  if (isInIframe || hasEmbedParam) {
    // Mark body as embedded for CSS targeting
    document.body.classList.add('widget-embedded');
    
    // Remove all margins and padding
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    document.documentElement.style.height = '100%';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.height = '100%';
    document.body.style.overflow = 'hidden';
    
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
      chatContainer.style.width = '100%';
      chatContainer.style.maxWidth = '100%';
      chatContainer.style.margin = '0';
      chatContainer.style.borderRadius = '0';
      chatContainer.style.height = '100%';
      chatContainer.style.boxSizing = 'border-box';
    }
  }
}

// Run immediately and on DOM ready
setupEmbeddedMode();
document.addEventListener('DOMContentLoaded', setupEmbeddedMode);
