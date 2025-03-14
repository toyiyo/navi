import { ConnectionManager } from '../../src/js/services/connectionManager';
import config from '../../src/js/config';

// Mock fetch for testing
global.fetch = jest.fn();
global.window = Object.create(window);
Object.defineProperty(window, 'location', {
  value: {
    href: jest.fn()
  }
});

describe('ConnectionManager', () => {
  let connectionManager;

  beforeEach(() => {
    connectionManager = new ConnectionManager();
    // Clear all mocks before each test
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('OAuth Flow', () => {
    test('initiateOAuthFlow redirects to Google auth URL', async () => {
      const mockAuthUrl = 'https://accounts.google.com/oauth2/auth';
      fetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ authUrl: mockAuthUrl })
        })
      );

      await connectionManager.initiateOAuthFlow('google');

      expect(fetch).toHaveBeenCalledWith(
        `${config.API_BASE_URL}/${config.AUTH_ENDPOINTS.GOOGLE}`,
        expect.any(Object)
      );
      expect(window.location.href).toBe(mockAuthUrl);
    });

    test('handleOAuthCallback processes successful authentication', async () => {
      const mockToken = 'mock-oauth-token';
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ token: mockToken })
        })
      );

      const result = await connectionManager.handleOAuthCallback('google', 'mock-code');

      expect(fetch).toHaveBeenCalledWith(
        `${config.API_BASE_URL}/${config.AUTH_ENDPOINTS.GOOGLE}/callback`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ code: 'mock-code' })
        })
      );
      expect(result.success).toBe(true);
      expect(localStorage.getItem('google_connection')).toBeTruthy();
    });
  });

  describe('Connection Management', () => {
    test('isServiceConnected returns correct connection state', () => {
      localStorage.setItem('google_connection', 'true');
      expect(connectionManager.isServiceConnected('google')).toBe(true);
      expect(connectionManager.isServiceConnected('dropbox')).toBe(false);
    });

    test('disconnectService removes service connection', async () => {
      localStorage.setItem('google_connection', 'true');
      
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        })
      );

      await connectionManager.disconnectService('google');

      expect(fetch).toHaveBeenCalledWith(
        `${config.API_BASE_URL}/${config.AUTH_ENDPOINTS.GOOGLE}`,
        expect.objectContaining({
          method: 'DELETE'
        })
      );
      expect(localStorage.getItem('google_connection')).toBeNull();
    });
  });

  describe('Error Handling', () => {
    test('handles failed OAuth initiation', async () => {
      fetch.mockImplementationOnce(() => 
        Promise.reject(new Error('Network error'))
      );

      await expect(connectionManager.initiateOAuthFlow('google'))
        .rejects
        .toThrow('Failed to initiate OAuth flow');
    });

    test('handles invalid service type', async () => {
      await expect(connectionManager.initiateOAuthFlow('invalid-service'))
        .rejects
        .toThrow('Unsupported service type');
    });

    test('handles failed service disconnection', async () => {
      localStorage.setItem('google_connection', 'true');
      
      fetch.mockImplementationOnce(() => 
        Promise.reject(new Error('Network error'))
      );

      await expect(connectionManager.disconnectService('google'))
        .rejects
        .toThrow('Failed to disconnect service');
      
      // Connection state should remain unchanged on error
      expect(localStorage.getItem('google_connection')).toBe('true');
    });

    test('handles expired tokens', async () => {
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ error: 'Token expired' })
        })
      );

      const result = await connectionManager.handleOAuthCallback('google', 'mock-code');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication failed');
      expect(localStorage.getItem('google_connection')).toBeNull();
    });
  });

  describe('Token Management', () => {
    test('refreshes expired tokens automatically', async () => {
      const mockNewToken = 'new-mock-token';
      fetch
        .mockImplementationOnce(() => 
          Promise.resolve({
            ok: false,
            status: 401
          })
        )
        .mockImplementationOnce(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ token: mockNewToken })
          })
        );

      await connectionManager.refreshToken('google');

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(localStorage.getItem('google_token')).toBe(mockNewToken);
    });
  });
});
