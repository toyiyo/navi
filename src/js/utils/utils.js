
// Constants
const API_BASE_URL = "http://localhost:8080/webhook";
const HEADERS = { "ngrok-skip-browser-warning": "69420" };
const MAX_RESULTS = 5;
const MAX_RECENT_QUERIES = 5;
const MAX_RECENT_LINKS = 4;

// Elements
const loadingSpinner = createLoadingSpinner();

// Functions
export async function fetchResults(endpoint, query, displayFunction, options = {}) {
    const apiUrl = `${API_BASE_URL}/${endpoint}?search=${encodeURIComponent(query)}`;
    const container = document.getElementById(`${endpoint}Results`);
    try {
        if (container) container.appendChild(loadingSpinner);
        const response = await fetch(apiUrl, { headers: HEADERS, ...options });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (displayFunction) displayFunction(data.slice(0, MAX_RESULTS));
        return data;
    } catch (error) {
        console.error(`Error fetching ${endpoint} results:`, error);
        if (container) container.innerHTML = "<p>No results found</p>";
        throw error;
    } finally {
        if (container) container.removeChild(loadingSpinner);
    }
}

function createLoadingSpinner() {
    const spinner = document.createElement("div");
    spinner.className = "loading-spinner";
    return spinner;
}