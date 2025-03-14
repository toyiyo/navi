export const CONFIG = {
    API_BASE_URL: 'http://localhost:443/webhook',
    MAX_RESULTS: 5,
    MAX_RECENT_QUERIES: 5,
    MAX_RECENT_LINKS: 4,
    HEADERS: {
        'ngrok-skip-browser-warning': '69420'
    }
};

const config = {
  development: {
    API_BASE_URL: "http://localhost:8080/webhook",
    CHAT_API_ENDPOINT: "3b1d3130-4233-4f17-9bf0-0f368211a63e/chat",
    GOOGLE_DOCS_ENDPOINT: "api/docs",
    AUTH_ENDPOINTS: {
      GOOGLE: "auth/google",
      GOOGLE_DOCS: "api/docs",
      REFRESH: "auth/refresh",
    },
  },
  production: {
    API_BASE_URL: "https://api.yourproductionurl.com/webhook",
    CHAT_API_ENDPOINT: "3b1d3130-4233-4f17-9bf0-0f368211a63e/chat",
    GOOGLE_DOCS_ENDPOINT: "api/docs",
    AUTH_ENDPOINTS: {
      GOOGLE: "auth/google",
      GOOGLE_DOCS: "api/docs",
      REFRESH: "auth/refresh",
    },
  },
};

export default config[process.env.NODE_ENV || "development"];
