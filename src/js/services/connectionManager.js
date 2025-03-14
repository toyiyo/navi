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
  }

  async initiateOAuthFlow(serviceType) {
    if (!SUPPORTED_SERVICES.includes(serviceType)) {
      throw new Error('Unsupported service type');
    }

    try {
      const response = await fetchResults(
        `${config.AUTH_ENDPOINTS[serviceType.toUpperCase()]}`,
        null,
        null,
        { method: 'POST', headers: this.headers }
      );

      if (response.authUrl) {
        window.location.href = response.authUrl;
      } else {
        throw new Error('No auth URL received');
      }
    } catch (error) {
      logError(error, { service: serviceType });
      throw new Error('Failed to initiate OAuth flow');
    }
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
        { method: 'POST', headers: this.headers }
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
  
  container.innerHTML = '<h2>Connected Services</h2>';
  
  services.forEach(service => {
    const serviceElement = document.createElement('div');
    serviceElement.className = `service-connection ${service.connected ? 'connected' : 'disconnected'}`;
    
    const icon = document.createElement('span');
    icon.className = `service-icon ${service.name.toLowerCase()}`;
    
    const name = document.createElement('span');
    name.textContent = service.name;
    
    const status = document.createElement('span');
    status.className = 'connection-status';
    status.textContent = service.connected ? 'Connected' : 'Disconnected';
    
    const actionButton = document.createElement('button');
    actionButton.textContent = service.connected ? 'Disconnect' : 'Connect';
    actionButton.onclick = () => handleServiceConnection(service.name, service.connected);
    
    serviceElement.appendChild(icon);
    serviceElement.appendChild(name);
    serviceElement.appendChild(status);
    serviceElement.appendChild(actionButton);
    container.appendChild(serviceElement);
  });
}
