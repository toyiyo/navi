// Constants
const API_BASE_URL = "http://localhost:8080/webhook";
const HEADERS = { "ngrok-skip-browser-warning": "69420" };
const MAX_RESULTS = 5;
const MAX_RECENT_QUERIES = 5;
const MAX_RECENT_LINKS = 4;

// Elements
const loadingSpinner = createLoadingSpinner();
const displayFunctionMap = new Map();

// Functions
export async function fetchResults(endpoint, query, displayFunction, options = {}) {
    const apiUrl = `${API_BASE_URL}/${endpoint}?search=${encodeURIComponent(query)}`;
    const container = document.getElementById(`${endpoint}Results`);
    let spinnerAppended = false;

    displayFunctionMap.set(endpoint, displayFunction);

    try {
        if (container) {
            container.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div><p>Searching...</p></div>';
            container.appendChild(loadingSpinner);
            spinnerAppended = true;
        }
        
        const response = await fetch(apiUrl, { headers: HEADERS, ...options });
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        if (displayFunction) {
            displayFunction(data.slice(0, MAX_RESULTS));
        }
        return data;
    } catch (error) {
        console.error(`Error fetching ${endpoint} results:`, error);
        if (container) {
            container.innerHTML = `
                <div class="error-container">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Sorry, something went wrong. Please try again later.</p>
                    <button onclick="retrySearch('${endpoint}', '${query}')" class="retry-button">
                        <i class="fas fa-redo"></i> Retry
                    </button>
                </div>`;
        }
        throw error;
    } finally {
        if (container && spinnerAppended && container.contains(loadingSpinner)) {
            container.removeChild(loadingSpinner);
        }
    }
}

function createLoadingSpinner() {
    const spinner = document.createElement("div");
    spinner.className = "loading-spinner";
    return spinner;
}

// Add support for local storage
export function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error('Error saving to localStorage:', e);
    }
}

export function getFromLocalStorage(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (e) {
        console.error('Error reading from localStorage:', e);
        return null;
    }
}

export function setupRetryHandlers() {
    document.addEventListener('click', function(event) {
        if (event.target.closest('.retry-button')) {
            const button = event.target.closest('.retry-button');
            const endpoint = button.dataset.endpoint;
            const query = button.dataset.query;
            
            const displayFunction = displayFunctionMap.get(endpoint);
            if (displayFunction) {
                fetchResults(endpoint, query, displayFunction);
            }
        }
    });
}