// Mock fetch globally
global.fetch = jest.fn();

// Mock DOMPurify
global.DOMPurify = {
  sanitize: jest.fn(input => input)
};

// Mock marked
global.marked = {
  parse: jest.fn(input => input)
};