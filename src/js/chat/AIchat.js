import { fetchResults } from '../utils/utils.js';

const openChatPanelButton = document.getElementById("openChatPanel");
const closeChatPanelButton = document.getElementById("closeChatPanel");
const chatPanel = document.getElementById("chatPanel");
const chatInput = document.getElementById("chatInput");
const sendChatButton = document.getElementById("sendChatButton");
const chatResponseContainer = document.getElementById("chatResponseContainer");

openChatPanelButton.addEventListener("click", () => {
  chatPanel.classList.add("open");
  openChatPanelButton.classList.add("hidden");
});

closeChatPanelButton.addEventListener("click", () => {
  chatPanel.classList.remove("open");
  openChatPanelButton.classList.remove("hidden");
});

// Ensure the chat panel stays within the viewport when resized horizontally
chatPanel.addEventListener("resize", () => {
  const rect = chatPanel.getBoundingClientRect();
  if (rect.right > window.innerWidth) {
    chatPanel.style.width = `${window.innerWidth - rect.left}px`;
  }
});

// Add resize functionality
const resizeHandle = document.querySelector('.resize-handle');
let isResizing = false;
let startX, startWidth;

resizeHandle.addEventListener('mousedown', (e) => {
    isResizing = true;
    startX = e.clientX;
    startWidth = parseInt(getComputedStyle(chatPanel).width, 10);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', () => {
        isResizing = false;
        document.removeEventListener('mousemove', handleMouseMove);
    });
});

function handleMouseMove(e) {
    if (!isResizing) return;
    
    const width = startWidth + (startX - e.clientX);
    if (width >= 300 && width <= 800) { // Respect min and max width
        chatPanel.style.width = `${width}px`;
    }
}

const handleSendChat = async () => {
    const userInput = DOMPurify.sanitize(chatInput.value);
    if (!userInput) {
      alert("Please enter a message.");
      return;
    }

    // Display loading spinner
    sendChatButton.disabled = true;
    const loadingSpinner = document.createElement("div");
    loadingSpinner.className = "loading-spinner";
    sendChatButton.appendChild(loadingSpinner);

    try {
      const data = await fetchResults("3b1d3130-4233-4f17-9bf0-0f368211a63e/chat", userInput, null, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: "69b0ffe8-cb5a-434c-9688-afe6ab551fae",
          action: "sendMessage",
          chatInput: userInput,
        }),
      });

      displayChatResponse(data);
    } catch (error) {
      console.error("Error fetching chat response:", error);
      chatResponseContainer.innerHTML = "<p>Error fetching chat response. Please try again later.</p>";
    } finally {
      // Remove loading spinner
      sendChatButton.removeChild(loadingSpinner);
      sendChatButton.disabled = false;
    }
  };

sendChatButton.addEventListener("click", handleSendChat);

chatInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    handleSendChat();
  }
});

function displayChatResponse(data) {
  const responseElement = document.createElement("div");
  responseElement.className = "chat-response";

  // Use optional chaining (?.) for cleaner property access
  if (data?.response?.text) {
    responseElement.innerHTML = DOMPurify.sanitize(marked.parse(data.response.text));
  } else {
    responseElement.textContent = data?.response || "No response received"; // Add fallback text
  }

  chatResponseContainer.appendChild(responseElement);
  chatInput.value = ""; // Clear the input field
  responseElement.scrollIntoView({behavior: "smooth"}); // Scroll to the response
}
