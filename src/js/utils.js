// ...existing code...

export async function initiateOAuthFlow(service) {
  const response = await fetch(`${config.API_BASE_URL}/auth/${service}`, {
    method: 'POST',
    headers: HEADERS
  });
  const data = await response.json();
  // Redirect to authorization URL
  window.location.href = data.authUrl;
}

// ...existing code...
