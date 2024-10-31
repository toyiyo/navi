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

sendChatButton.addEventListener("click", async () => {
  const userInput = chatInput.value;
  if (!userInput) {
    alert("Please enter a message.");
    return;
  }

  // Display loading spinner
  const loadingSpinner = document.createElement("div");
  loadingSpinner.className = "loading-spinner";
  chatResponseContainer.appendChild(loadingSpinner);

  try {
    const response = await fetch(
      "https://2fff-2600-1700-1101-6de0-2105-cf27-50a6-4499.ngrok-free.app/webhook/d3666369-8f13-4076-81e8-11f32d91d6fa/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: "69b0ffe8-cb5a-434c-9688-afe6ab551fae",
          action: "sendMessage",
          chatInput: userInput,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    displayChatResponse(data);
  } catch (error) {
    console.error("Error fetching chat response:", error);
    chatResponseContainer.innerHTML =
      "<p>Error fetching chat response. Please try again later.</p>";
  } finally {
    // Remove loading spinner
    chatResponseContainer.removeChild(loadingSpinner);
  }
});

function displayChatResponse(data) {
  const responseElement = document.createElement("div");
  responseElement.className = "chat-response";

  // Check if the response contains rich text
  if (data.response && data.response.text) {
    responseElement.innerHTML = DOMPurify.sanitize(marked.parse(data.response.text));
  } else {
    responseElement.textContent = data.response; // Fallback to plain text
  }

  chatResponseContainer.appendChild(responseElement);
  chatInput.value = ""; // Clear the input field
}
