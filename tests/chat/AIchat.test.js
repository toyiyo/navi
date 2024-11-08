// Mock DOM elements
document.body.innerHTML = `
  <button id="openChatPanel">Chat with AI</button>
  <button id="closeChatPanel">&times;</button>
  <div id="chatPanel" class="chat-panel">
    <div class="resize-handle"></div>
    <div id="chatResponseContainer"></div>
    <input id="chatInput" type="text" />
    <button id="sendChatButton">Send</button>
  </div>
`;

// Mock external dependencies
global.DOMPurify = {
  sanitize: jest.fn(input => input)
};

global.marked = {
  parse: jest.fn(input => input)
};

// Import the code to test
require('../../src/js/chat/AIchat.js');

describe('Chat Panel UI Controls', () => {
  beforeEach(() => {
    // Reset DOM state before each test
    document.getElementById('chatPanel').classList.remove('open');
    document.getElementById('openChatPanel').classList.remove('hidden');
  });

  test('opens chat panel when open button is clicked', () => {
    const openButton = document.getElementById('openChatPanel');
    openButton.click();
    
    expect(document.getElementById('chatPanel').classList.contains('open')).toBe(true);
    expect(openButton.classList.contains('hidden')).toBe(true);
  });

  test('closes chat panel when close button is clicked', () => {
    const closeButton = document.getElementById('closeChatPanel');
    closeButton.click();
    
    expect(document.getElementById('chatPanel').classList.contains('open')).toBe(false);
    expect(document.getElementById('openChatPanel').classList.contains('hidden')).toBe(false);
  });
});

describe('Chat Panel Resizing', () => {
  let resizeHandle;
  
  beforeEach(() => {
    resizeHandle = document.querySelector('.resize-handle');
  });

  test('initializes resizing on mousedown', () => {
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: 500
    });
    
    resizeHandle.dispatchEvent(mouseEvent);
    expect(document.getElementById('chatPanel').style.width).toBeDefined();
  });

  test('respects minimum and maximum width constraints', () => {
    const chatPanel = document.getElementById('chatPanel');
    const mouseDownEvent = new MouseEvent('mousedown', { clientX: 500 });
    const mouseMoveEvent = new MouseEvent('mousemove', { clientX: 100 });
    
    chatPanel.style.width = '100px';
    resizeHandle.dispatchEvent(mouseDownEvent);
    document.dispatchEvent(mouseMoveEvent);
    
    // Simulate resizing to less than minimum width
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 800 }));
    let width = parseInt(chatPanel.style.width, 10);
    expect(width).toBeGreaterThanOrEqual(300);

    // Simulate resizing to more than maximum width
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 0 }));
    width = parseInt(chatPanel.style.width, 10);
    expect(width).toBeLessThanOrEqual(800);
  });
});

describe('Chat Functionality', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ 
          response: { 
            text: '**Bold text**' // Ensure the mock response returns the expected markdown text
          }
        })
      })
    );
  });

  test('sends chat message when button is clicked', async () => {
    const input = document.getElementById('chatInput');
    const button = document.getElementById('sendChatButton');
    
    input.value = 'Test message';
    await button.click();
    
    expect(fetch).toHaveBeenCalled();
    expect(DOMPurify.sanitize).toHaveBeenCalledWith('Test message');
  });

  test('displays error message on failed request', async () => {
    global.fetch = jest.fn(() => Promise.reject('API Error'));
    
    const input = document.getElementById('chatInput');
    const button = document.getElementById('sendChatButton');
    const container = document.getElementById('chatResponseContainer');
    
    input.value = 'Test message';
    await button.click();
    
    expect(container.innerHTML).toContain('Error fetching chat response');
  });

  test('handles Enter key press', async () => {
    const input = document.getElementById('chatInput');
    input.value = 'Test message';
    
    const enterEvent = new KeyboardEvent('keyup', { key: 'Enter' });
    input.dispatchEvent(enterEvent);
    
    expect(fetch).toHaveBeenCalled();
  });

  test('displays chat response with markdown parsing', async () => {
    const response = {
      response: {
        text: '**Bold text**'
      }
    };
    
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(response)
      })
    );
    
    const input = document.getElementById('chatInput');
    const button = document.getElementById('sendChatButton');
    
    input.value = 'Test message';
    await button.click();
    
    expect(marked.parse).toHaveBeenCalledWith('**Bold text**');
    expect(DOMPurify.sanitize).toHaveBeenCalled();
  });
});