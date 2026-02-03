const chatForm = document.querySelector("#chatForm");
const messageInput = document.querySelector("#messageInput");
const chatMessages = document.querySelector("#chatMessages");
const clearChat = document.querySelector("#clearChat");

const botReplies = [
  "That sounds great! Tell me more.",
  "I like where this is going.",
  "Noted! What would you like to do next?",
  "I'm here to help. Keep going!",
  "Thanks for sharing. Want a quick recap?",
];

const formatTime = (date = new Date()) =>
  date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const createMessage = ({ text, type }) => {
  const message = document.createElement("li");
  message.className = `message message--${type}`;

  const bubble = document.createElement("div");
  bubble.className = "message__bubble";
  bubble.textContent = text;

  const time = document.createElement("span");
  time.className = "message__time";
  time.textContent = formatTime();

  message.appendChild(bubble);
  message.appendChild(time);

  return message;
};

const scrollToBottom = () => {
  chatMessages.parentElement.scrollTop = chatMessages.parentElement.scrollHeight;
};

const sendBotReply = () => {
  const reply = botReplies[Math.floor(Math.random() * botReplies.length)];
  const message = createMessage({ text: reply, type: "bot" });
  chatMessages.appendChild(message);
  scrollToBottom();
};

const handleSubmit = (event) => {
  event.preventDefault();
  const text = messageInput.value.trim();

  if (!text) {
    return;
  }

  const userMessage = createMessage({ text, type: "user" });
  chatMessages.appendChild(userMessage);
  messageInput.value = "";
  scrollToBottom();

  window.setTimeout(sendBotReply, 600);
};

chatForm.addEventListener("submit", handleSubmit);

messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    chatForm.requestSubmit();
  }
});

clearChat.addEventListener("click", () => {
  chatMessages.innerHTML = "";
  const resetMessage = createMessage({
    text: "Chat cleared. Start a new conversation anytime.",
    type: "bot",
  });
  chatMessages.appendChild(resetMessage);
});
