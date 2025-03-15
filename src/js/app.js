import { setupRetryHandlers, getFromLocalStorage } from "./utils/utils";
import { initializeSearch } from "./search/search";
import { CONFIG } from "./config";
import "../css/styles.css";

const displayRecentQueries = (queries) => {
  const container = document.getElementById("recent-queries");
  if (!container) return;

  queries.slice(0, CONFIG.MAX_RECENT_QUERIES).forEach((query) => {
    const queryElement = document.createElement("div");
    queryElement.classList.add("recent-query");
    queryElement.textContent = query;
    container.appendChild(queryElement);
  });
};

const displayRecentAccessedLinks = (links) => {
  const container = document.getElementById("recent-links");
  if (!container) return;

  links.slice(0, CONFIG.MAX_RECENT_LINKS).forEach((link) => {
    const linkElement = document.createElement("a");
    linkElement.classList.add("recent-link");
    linkElement.href = link.url;
    linkElement.textContent = link.title;
    container.appendChild(linkElement);
  });
};

document.addEventListener("DOMContentLoaded", () => {
  setupRetryHandlers();
  initializeSearch();

  const recentQueries = getFromLocalStorage("recentQueries") || [];
  const recentLinks = getFromLocalStorage("recentLinks") || [];

  displayRecentQueries(recentQueries);
  displayRecentAccessedLinks(recentLinks);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
});
