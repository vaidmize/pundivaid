const chatToggleBtn = document.getElementById('chat-toggle-btn');
const closeChatBtn = document.getElementById('close-chat-btn');
const chatWindow = document.getElementById('chat-window');
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// Corrected Webhook URL (Using GET to avoid CORS preflight issues)
const WEBHOOK_URL = 'https://n8n.srv1319269.hstgr.cloud/webhook/ua9RHnSousQqwp2M';

let isChatOpen = false;

// Toggle Chat Window
function toggleChat() {
    isChatOpen = !isChatOpen;
    if (isChatOpen) {
        chatWindow.classList.remove('hidden');
        userInput.focus();
    } else {
        chatWindow.classList.add('hidden');
    }
}

chatToggleBtn.addEventListener('click', toggleChat);
closeChatBtn.addEventListener('click', toggleChat);

// Handle Enter Key
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

sendBtn.addEventListener('click', sendMessage);

// Message Handling
async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // Add User Message
    addMessage(text, 'user');
    userInput.value = '';

    // Show Typing Indicator
    const loadingId = showTypingIndicator();

    try {
        // Construct URL with query set for GET request
        // This avoids complex CORS preflight checks (OPTIONS) capable of blocking the request
        const url = new URL(WEBHOOK_URL);
        url.searchParams.append('text', text);

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server Error ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        // Remove Typing Indicator
        removeMessage(loadingId);

        // Add Bot Message
        const botReply = data.output || data.reply || data.text || JSON.stringify(data);
        addMessage(botReply, 'bot');

    } catch (error) {
        console.error('Error:', error);
        removeMessage(loadingId);
        // Show detailed error in chat for debugging
        addMessage(`Connection Error: ${error.message}. Please check n8n workflow or credentials.`, 'bot');
    }
}

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
    // Allow simple text but protect against injection if needed (textContent is safe)
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function showTypingIndicator() {
    const id = 'typing-' + Date.now();
    const loadingDiv = document.createElement('div');
    loadingDiv.classList.add('typing-indicator');
    loadingDiv.id = id;
    loadingDiv.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    chatMessages.appendChild(loadingDiv);
    scrollToBottom();
    return id;
}

function removeMessage(id) {
    const element = document.getElementById(id);
    if (element) {
        element.remove();
    }
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
