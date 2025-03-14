# GitHub Copilot Context for NAVi Search Project

## Project Overview
This is a unified search application that integrates results from multiple services including Google Drive, Jira, Asana, and Confluence Wiki. The project uses vanilla JavaScript with a modular structure.

## Key Files and Their Purpose

### Main Files
- [`src/js/search/search.js`](src/js/search/search.js): Core search functionality and UI handling
- [`src/js/utils/utils.js`](src/js/utils/utils.js): Utility functions for API calls and localStorage
- [`src/js/config.js`](src/js/config.js): Configuration settings for different environments

### Components
The search functionality is split into several display components:
- Google Drive results
- Jira issues
- Asana tasks
- Confluence Wiki pages

## Code Patterns to Follow

### API Calls
Use the `fetchResults` utility for all API calls:
```javascript
fetchResults(endpoint, query, displayFunction, options);
```

### State Management
Use localStorage for persistent data:
```javascript
saveToLocalStorage(key, data);
getFromLocalStorage(key);
```

### UI Components
Follow the established pattern for creating result items:
```javascript
function displayResults(container, headerText, results, logo, linkFn, textFn) {
  // ...existing code...
}
```

### Error Handling
Use the utility error handling functions:
```javascript
logError(error, context);
```

## Constants and Configuration
- Use the existing constants in config.js for API endpoints
- Follow MAX_* constants for limiting results and stored items
- Use the predefined HEADERS for API requests

## Testing
- Jest is configured for testing
- Test files should be placed in `/tests` directory
- Follow existing test patterns in `AIchat.test.js`

## CSS Guidelines
- Use existing classes from styles.css
- Follow BEM naming convention for new CSS classes
- Maintain responsive design patterns

## Best Practices
1. Always sanitize user input
2. Use async/await for API calls
3. Implement error handling for all async operations
4. Follow established event delegation patterns
5. Maintain modular component structure