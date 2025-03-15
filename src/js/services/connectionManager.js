import '../css/styles.css';  // Use relative path instead of alias
import { fetchResults, saveToLocalStorage, getFromLocalStorage, logError } from '../utils/utils.js';
import config from '../config.js';

const SUPPORTED_SERVICES = ['google'];
const CONNECTION_STATE_PREFIX = '_connection';
const TOKEN_PREFIX = '_token';

export class ConnectionManager {
  constructor() {
    this.headers = {
      'Content-Type': 'application/json'
    };
    this.initializeOAuthCallback();
  }

  initializeOAuthCallback() {
    // Check if there's an OAuth code in the URL (after Google redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state) {
      this.handleOAuthCallback('google', code)
        .then(result => {
          if (result.success) {
            this.showNotification('Successfully connected to Google Drive', 'success');
          } else {
            this.showNotification('Failed to connect to Google Drive', 'error');
          }
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch(error => {
          this.showNotification('Authentication failed', 'error');
          logError(error, { context: 'OAuth callback' });
        });
    }
  }

  async initiateOAuthFlow(serviceType) {
    if (!SUPPORTED_SERVICES.includes(serviceType)) {
      this.showNotification('Unsupported service type', 'error');
      throw new Error('Unsupported service type');
    }

    try {
      const response = await fetchResults(
        `${config.AUTH_ENDPOINTS[serviceType.toUpperCase()]}`,
        null,
        null,
        { 
          method: 'POST', 
          headers: this.headers,
          credentials: 'include' // Important for handling cookies
        }
      );

      if (response.authUrl) {
        // Store current state before redirect
        saveToLocalStorage('oauth_state', response.state);
        window.location.href = response.authUrl;
      } else {
        throw new Error('No auth URL received');
      }
    } catch (error) {
      this.showNotification('Failed to start authentication', 'error');
      logError(error, { service: serviceType });
      throw error;
    }
  }

  showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  async handleOAuthCallback(serviceType, code) {
    try {
      const response = await fetchResults(
        `${config.AUTH_ENDPOINTS[serviceType.toUpperCase()]}/callback`,
        null,
        null,
        {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify({ code })
        }
      );

      if (response.token) {
        saveToLocalStorage(`${serviceType}${TOKEN_PREFIX}`, response.token);
        saveToLocalStorage(`${serviceType}${CONNECTION_STATE_PREFIX}`, 'true');
        return { success: true };
      }
      return { success: false, error: 'Authentication failed' };
    } catch (error) {
      logError(error, { service: serviceType });
      return { success: false, error: 'Authentication failed' };
    }
  }

  isServiceConnected(serviceType) {
    return getFromLocalStorage(`${serviceType}${CONNECTION_STATE_PREFIX}`) === 'true';
  }

  async disconnectService(serviceType) {
    try {
      await fetchResults(
        `${config.AUTH_ENDPOINTS[serviceType.toUpperCase()]}`,
        null,
        null,
        { method: 'DELETE', headers: this.headers }
      );
      
      localStorage.removeItem(`${serviceType}${CONNECTION_STATE_PREFIX}`);
      localStorage.removeItem(`${serviceType}${TOKEN_PREFIX}`);
    } catch (error) {
      logError(error, { service: serviceType });
      throw new Error('Failed to disconnect service');
    }
  }

  async refreshToken(serviceType) {
    try {
      const response = await fetchResults(
        `${config.AUTH_ENDPOINTS[serviceType.toUpperCase()]}/refresh`,
        null,
        null,
        { 
          method: 'POST', 
          headers: this.headers,
          credentials: 'include'
        }
      );

      if (response.token) {
        saveToLocalStorage(`${serviceType}${TOKEN_PREFIX}`, response.token);
        return true;
      }
      return false;
    } catch (error) {
      logError(error, { service: serviceType });
      return false;
    }
  }
}

export function getConnectionStatus() {
  return fetchResults('connections/status', null, displayConnectionStatus);
}

export function displayConnectionStatus(services) {
  const container = document.getElementById('serviceConnectionsContainer');
  if (!container) return;
  
  container.innerHTML = `
    <h2>Connected Services</h2>
    <div class="services-grid"></div>
  `;
  
  const grid = container.querySelector('.services-grid');
  
  services.forEach(service => {
    const serviceElement = document.createElement('div');
    serviceElement.className = `service-connection ${service.connected ? 'connected' : 'disconnected'}`;
    
    serviceElement.innerHTML = `
      <div class="service-header">
        <span class="service-icon ${service.name.toLowerCase()}"></span>
        <span class="service-name">${service.name}</span>
      </div>
      <div class="service-status">
        <span class="connection-status">${service.connected ? 'Connected' : 'Not Connected'}</span>
        <button class="action-button ${service.connected ? 'disconnect' : 'connect'}"
                onclick="handleServiceConnection('${service.name}', ${service.connected})">
          ${service.connected ? 'Disconnect' : 'Connect'}
        </button>
      </div>
    `;
    
    grid.appendChild(serviceElement);
  });
}

// Add connection handling to window scope
window.handleServiceConnection = async (serviceName, isConnected) => {
  const connectionManager = new ConnectionManager();
  try {
    if (isConnected) {
      await connectionManager.disconnectService(serviceName.toLowerCase());
      connectionManager.showNotification(`Disconnected from ${serviceName}`, 'success');
    } else {
      await connectionManager.initiateOAuthFlow(serviceName.toLowerCase());
    }
    // Refresh the connection status display
    getConnectionStatus();
  } catch (error) {
    connectionManager.showNotification(`Failed to ${isConnected ? 'disconnect from' : 'connect to'} ${serviceName}`, 'error');
    logError(error, { context: 'handleServiceConnection' });
  }
};
