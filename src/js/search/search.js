import {
  fetchResults,
  saveToLocalStorage,
  getFromLocalStorage,
} from "../utils/utils.js";
// Constants
const API_BASE_URL = "http://localhost:443/webhook";
const HEADERS = { "ngrok-skip-browser-warning": "69420" };
const MAX_RESULTS = 5;
const MAX_RECENT_QUERIES = 5;
const MAX_RECENT_LINKS = 4;

// Elements
const loadingSpinner = createLoadingSpinner();
const searchBox = document.getElementById("searchBox");
const wikiResultsContainer = document.getElementById("wikiResults");
const jiraResultsContainer = document.getElementById("jiraResults");
const asanaResultsContainer = document.getElementById("asanaResults");
const googleDriveResultsContainer =
  document.getElementById("googleDriveResults");
const recentQueryContainer = document.getElementById("recentQueryContainer");
const recentAccessedLinksContainer = document.getElementById(
  "recentAccessedLinksContainer"
);

// Logos
const googleDriveLogo = `<svg viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                          <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                          <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
                          <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
                          <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
                          <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
                          <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
                        </svg>`;
const asanaLogo = `<svg viewBox="0 0 751 495" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M115.339 475.157C115.961 482.186 121.575 491.1 131.304 491.1H137.004C139.211 491.1 141.011 489.3 141.011 487.093V361.929H140.989C140.882 359.829 139.125 358.136 137.004 358.136H119.346C117.204 358.136 115.468 359.829 115.361 361.929H115.339V372.107C104.518 358.779 87.4822 353.271 70.3822 353.271C31.5107 353.25 0.0107422 384.75 0.0107422 423.6C0.0107422 462.472 31.5107 493.972 70.3822 493.972C87.4607 493.972 106.104 487.35 115.339 475.157ZM70.4465 469.35C45.7393 469.35 25.7036 448.864 25.7036 423.6C25.7036 398.336 45.7393 377.871 70.4465 377.871C95.1536 377.871 115.189 398.357 115.189 423.6C115.189 448.864 95.1536 469.35 70.4465 469.35Z" fill="#0D0E10"/>
                  <path d="M402.868 475.157C403.489 482.186 409.103 491.1 418.832 491.1H424.532C426.739 491.1 428.539 489.3 428.539 487.093V361.929H428.518C428.411 359.829 426.653 358.136 424.532 358.136H406.875C404.732 358.136 402.996 359.829 402.868 361.929V361.929V372.107C392.046 358.779 375.011 353.271 357.911 353.271C319.061 353.271 287.539 384.771 287.539 423.643C287.539 462.514 319.039 494.014 357.911 494.014C375.011 493.971 393.653 487.35 402.868 475.157ZM357.996 469.35C333.289 469.35 313.253 448.864 313.253 423.6C313.253 398.336 333.289 377.871 357.996 377.871C382.703 377.871 402.739 398.357 402.739 423.6C402.739 448.864 382.703 469.35 357.996 469.35Z" fill="#0D0E10"/>
                  <path d="M724.319 475.157C724.94 482.186 730.555 491.1 740.283 491.1H745.983C748.19 491.1 750.012 489.3 750.012 487.093V361.929H749.99C749.883 359.829 748.126 358.136 746.005 358.136H728.347C726.205 358.136 724.469 359.829 724.362 361.929H724.34V372.107C713.519 358.779 696.483 353.271 679.383 353.271C640.512 353.271 609.012 384.771 609.012 423.643C609.012 462.514 640.512 494.014 679.383 494.014C696.462 493.971 715.083 487.35 724.319 475.157ZM679.426 469.35C654.719 469.35 634.683 448.864 634.683 423.6C634.683 398.336 654.719 377.871 679.426 377.871C704.133 377.871 724.169 398.357 724.169 423.6C724.19 448.864 704.155 469.35 679.426 469.35Z" fill="#0D0E10"/>
                  <path d="M586.683 479.444V414.665C586.683 378.151 563.647 353.529 526.918 353.529C509.39 353.529 493.34 363.579 489.933 372.386C488.84 365.572 485.218 358.415 474.011 358.415H468.29C466.083 358.415 464.283 360.215 464.283 362.444V475.458V475.479V487.393V487.608H464.304C464.411 489.708 466.168 491.401 468.29 491.401H480.247H485.947C486.226 491.401 486.483 491.379 486.74 491.315C486.847 491.293 486.976 491.251 487.083 491.208C487.211 491.165 487.34 491.143 487.468 491.079C487.618 491.015 487.768 490.929 487.918 490.843C487.983 490.801 488.068 490.758 488.133 490.715C488.304 490.608 488.476 490.458 488.626 490.329C488.647 490.308 488.69 490.286 488.711 490.265C488.883 490.093 489.054 489.901 489.183 489.708C489.633 489.108 489.89 488.379 489.933 487.586H489.954V487.372V479.422V477.343V413.658C489.954 394.051 505.854 378.151 525.461 378.151C545.068 378.151 560.968 394.051 560.968 413.658L560.99 475.458V475.436C560.99 475.501 560.99 475.543 560.99 475.608V487.372V487.586H561.011C561.118 489.686 562.876 491.379 564.997 491.379H576.954H582.654C582.933 491.379 583.19 491.358 583.447 491.293C583.554 491.272 583.64 491.229 583.747 491.208C583.897 491.165 584.047 491.122 584.175 491.079C584.325 491.015 584.454 490.929 584.583 490.865C584.668 490.822 584.754 490.779 584.84 490.736C585.011 490.629 585.161 490.501 585.29 490.372C585.333 490.329 585.375 490.308 585.397 490.286C585.568 490.115 585.718 489.943 585.847 489.772C585.847 489.751 585.868 489.751 585.868 489.729C586.297 489.129 586.576 488.401 586.618 487.629H586.64V487.415L586.683 479.444Z" fill="#0D0E10"/>
                  <path d="M183.182 457.221C194.968 465.386 207.825 469.35 220.189 469.35C231.954 469.35 244.125 463.243 244.125 452.614C244.125 438.429 217.597 436.221 200.947 430.564C184.275 424.907 169.918 413.186 169.918 394.243C169.918 365.229 195.761 353.25 219.889 353.25C235.168 353.25 250.939 358.286 261.182 365.507C264.697 368.186 262.554 371.25 262.554 371.25L252.782 385.2C251.689 386.764 249.761 388.136 247.018 386.421C244.254 384.729 234.611 377.893 219.889 377.893C205.168 377.893 196.297 384.686 196.297 393.107C196.297 403.221 207.825 406.393 221.325 409.843C244.854 416.186 270.504 423.814 270.504 452.636C270.504 478.2 246.589 493.993 220.168 493.993C200.132 493.993 183.097 488.293 168.804 477.793C165.825 474.814 167.904 472.05 167.904 472.05L177.611 458.186C179.604 455.571 182.089 456.471 183.182 457.221Z" fill="#0D0E10"/>
                  <path d="M436.875 61.7571C436.875 95.85 409.232 123.514 375.139 123.514C341.025 123.514 313.382 95.8714 313.382 61.7571C313.382 27.6429 341.025 0 375.139 0C409.232 0 436.875 27.6429 436.875 61.7571ZM294.91 138.943C260.818 138.943 233.153 166.586 233.153 200.679C233.153 234.771 260.796 262.436 294.91 262.436C329.025 262.436 356.668 234.793 356.668 200.679C356.668 166.586 329.025 138.943 294.91 138.943ZM455.346 138.943C421.232 138.943 393.589 166.586 393.589 200.7C393.589 234.814 421.232 262.457 455.346 262.457C489.439 262.457 517.103 234.814 517.103 200.7C517.103 166.586 489.46 138.943 455.346 138.943Z" fill="#F06A6A"/>
                  </svg>`;
const confluenceLogo = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32"><defs><linearGradient id="a" x1="28.607" y1="-60.825" x2="11.085" y2="-50.756" gradientTransform="matrix(1, 0, 0, -1, 0, -29.66)" gradientUnits="userSpaceOnUse"><stop offset="0.18" stop-color="#0052cc"/><stop offset="1" stop-color="#2684ff"/></linearGradient><linearGradient id="b" x1="621.442" y1="1817.567" x2="603.915" y2="1827.64" gradientTransform="matrix(-1, 0, 0, 1, 624.83, -1816.71)" xlink:href="#a"/></defs><title>file_type_confluence</title><path d="M3.015,23.087c-.289.472-.614,1.02-.891,1.456a.892.892,0,0,0,.3,1.212l5.792,3.564a.89.89,0,0,0,1.226-.29l.008-.013c.231-.387.53-.891.855-1.43,2.294-3.787,4.6-3.323,8.763-1.336l5.743,2.731A.892.892,0,0,0,26,28.559l.011-.024L28.766,22.3a.891.891,0,0,0-.445-1.167c-1.212-.57-3.622-1.707-5.792-2.754C14.724,14.586,8.09,14.831,3.015,23.087Z" style="fill:url(#a)"/><path d="M28.985,8.932c.289-.472.614-1.02.891-1.456a.892.892,0,0,0-.3-1.212L23.785,2.7a.89.89,0,0,0-1.236.241.584.584,0,0,0-.033.053c-.232.387-.53.891-.856,1.43-2.294,3.787-4.6,3.323-8.763,1.336L7.172,3.043a.89.89,0,0,0-1.187.421l-.011.024L3.216,9.726a.891.891,0,0,0,.445,1.167c1.212.57,3.622,1.706,5.792,2.753C17.276,17.433,23.91,17.179,28.985,8.932Z" style="fill:url(#b)"/></svg>`;
const jiraLogo = `<svg viewBox="0 0 76 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g id="logo-gradient-blue-jira">
                                        <g id="Jira">
                                        <path d="M38.8963 6.13371H41.7283V20.1309C41.7283 23.8217 40.0434 26.3983 36.1359 26.3983C34.6661 26.3983 33.5189 26.1546 32.7302 25.876V23.195C33.5906 23.5432 34.6302 23.7173 35.6698 23.7173C38.0717 23.7173 38.8963 22.3245 38.8963 20.305V6.13371Z" fill="#253858"/>
                                        <path d="M46.9266 5.05432C48.0379 5.05432 48.8266 5.71588 48.8266 6.89972C48.8266 8.04875 48.0379 8.74513 46.9266 8.74513C45.8152 8.74513 45.0266 8.08357 45.0266 6.89972C45.0266 5.7507 45.8152 5.05432 46.9266 5.05432ZM45.5285 10.9387H48.253V26.2591H45.5285V10.9387Z" fill="#253858"/>
                                        <path d="M54.9924 26.2591H52.3395V10.9387H54.9924V13.6198C55.9244 11.8092 57.5018 10.5209 60.5848 10.695V13.2716C57.1075 12.9234 54.9924 13.9331 54.9924 17.2061V26.2591Z" fill="#253858"/>
                                        <path d="M73.3112 23.5084C72.3075 25.5279 70.4075 26.5724 67.9697 26.5724C63.7754 26.5724 61.6603 23.1254 61.6603 18.5989C61.6603 14.2813 63.8829 10.6254 68.2924 10.6254C70.5867 10.6254 72.3792 11.6351 73.3112 13.6198V10.9387H76.0358V26.2591H73.3112V23.5084ZM68.6867 24.1351C71.1245 24.1351 73.2754 22.6379 73.2754 19.2256V18.007C73.2754 14.5947 71.3037 13.0975 68.9735 13.0975C65.9263 13.0975 64.349 15.0474 64.349 18.5989C64.3848 22.2897 65.8905 24.1351 68.6867 24.1351Z" fill="#253858"/>
                                        </g>
                                        <g id="Icon">
                                        <path id="Vector" d="M24.664 3H12.2603C12.2603 5.99443 14.7697 8.43176 17.8527 8.43176H20.147V10.5557C20.147 13.5501 22.6565 15.9875 25.7395 15.9875V4.04457C25.7395 3.45265 25.2735 3 24.664 3Z" fill="#2684FF"/>
                                        <path id="Vector_2" d="M18.5339 8.98877H6.13013C6.13013 11.9832 8.63956 14.4205 11.7226 14.4205H14.0169V16.5793C14.0169 19.5737 16.5264 22.0111 19.6094 22.0111V10.0333C19.6094 9.47623 19.1433 8.98877 18.5339 8.98877Z" fill="url(#paint0_linear)"/>
                                        <path id="Vector_3" d="M12.4038 15.0125H0C0 18.0069 2.50943 20.4442 5.59245 20.4442H7.88679V22.5682C7.88679 25.5626 10.3962 27.9999 13.4792 27.9999V16.057C13.4792 15.4651 12.9774 15.0125 12.4038 15.0125Z" fill="url(#paint1_linear)"/>
                                        </g>
                                        </g>
                                        <defs>
                                        <linearGradient id="paint0_linear" x1="19.3455" y1="9.01882" x2="14.2302" y2="14.45" gradientUnits="userSpaceOnUse">
                                        <stop offset="0.176" stop-color="#0052CC"/>
                                        <stop offset="1" stop-color="#2684FF"/>
                                        </linearGradient>
                                        <linearGradient id="paint1_linear" x1="13.5601" y1="15.0525" x2="7.63562" y2="20.9874" gradientUnits="userSpaceOnUse">
                                        <stop offset="0.176" stop-color="#0052CC"/>
                                        <stop offset="1" stop-color="#2684FF"/>
                                        </linearGradient>
                                        </defs>
                  </svg>`;

// State
let recentQuery = getFromLocalStorage("recentQueries") || [];
let recentAccessedLinks = getFromLocalStorage("recentLinks") || [];

// Event Listeners
searchBox.addEventListener("keyup", handleSearch);
document.addEventListener("click", handleLinkClick);

// Functions
function createLoadingSpinner() {
  const spinner = document.createElement("div");
  spinner.className = "loading-spinner";
  return spinner;
}

// Cache containers to reduce DOM lookups
const containers = {
  wiki: wikiResultsContainer,
  jira: jiraResultsContainer,
  asana: asanaResultsContainer,
  googleDrive: googleDriveResultsContainer,
};

// Combine fetchResults calls into a single function to reduce redundant logic
function handleSearch(event) {
  if (event.key === "Enter") {
    const query = searchBox.value.trim();
    if (!query) return;

    const endpoints = ["wiki", "jira", "asana", "googleDrive"];
    endpoints.forEach((endpoint) => {
      fetchResults(endpoint, query, (results) =>
        displayResults(
          containers[endpoint],
          capitalize(endpoint),
          results,
          getLogo(endpoint),
          getLinkFn(endpoint),
          getTextFn(endpoint)
        )
      );
    });

    addRecentQuery(query);
  }
}

// Helper functions to reduce repetitive code
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function getLogo(endpoint) {
  return {
    googleDrive: googleDriveLogo,
    asana: asanaLogo,
    wiki: confluenceLogo,
    jira: jiraLogo,
  }[endpoint];
}

function getLinkFn(endpoint) {
  return {
    googleDrive: (result) => result.webViewLink,
    asana: (result) =>
      `https://app.asana.com/0/search?q=${encodeURIComponent(
        result.name
      )}&searched_type=task&child=${result.gid}&f=true`,
    wiki: (result) => result.link,
    jira: (issue) => `https://jira.caremessage.org/browse/${issue.key}`,
  }[endpoint];
}

function getTextFn(endpoint) {
  return {
    googleDrive: (result) => result.name,
    asana: (result) => result.name,
    wiki: (result) => result.title,
    jira: (issue) => issue.fields.summary,
  }[endpoint];
}

// Debounce search input to reduce unnecessary API calls
let debounceTimeout;
searchBox.addEventListener("keyup", (event) => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => handleSearch(event), 300);
});

function handleLinkClick(event) {
  if (
    event.target.tagName === "A" &&
    event.target.parentElement.classList.contains("result-item")
  ) {
    addRecentAccessedLink(event.target);
  }
}

function addRecentAccessedLink(link) {
  const linkData = {
    href: link.href,
    text: link.innerText,
    icon: link.previousSibling.innerHTML,
  };

  if (!recentAccessedLinks.some((l) => l.href === linkData.href)) {
    recentAccessedLinks.unshift(linkData);
    if (recentAccessedLinks.length > MAX_RECENT_LINKS) {
      recentAccessedLinks.pop();
    }
    saveToLocalStorage("recentLinks", recentAccessedLinks);
    displayRecentAccessedLinks(recentAccessedLinks);
  }
}

// Optimize recent queries and links rendering
function renderList(container, items, createItemFn) {
  container.innerHTML = "";
  items.forEach((item) => container.appendChild(createItemFn(item)));
}

function displayRecentAccessedLinks(recentLinks) {
  renderList(recentAccessedLinksContainer, recentLinks, (link) => {
    const col = document.createElement("div");
    col.className = "col";

    const card = document.createElement("div");
    card.className = "card";

    const cardBody = document.createElement("div");
    cardBody.className = "card-body";

    const cardTitle = document.createElement("a");
    cardTitle.href = link.href;
    cardTitle.className = "card-title";
    cardTitle.textContent = link.text;
    cardTitle.target = "_blank";

    const iconSpan = document.createElement("span");
    iconSpan.className = "link-icon";
    iconSpan.innerHTML = link.icon;

    cardBody.appendChild(iconSpan);
    cardBody.appendChild(cardTitle);
    card.appendChild(cardBody);
    col.appendChild(card);
    return col;
  });
}

function addRecentQuery(query) {
  if (!recentQuery.includes(query)) {
    recentQuery.unshift(query);
    if (recentQuery.length > MAX_RECENT_QUERIES) {
      recentQuery.pop();
    }
    saveToLocalStorage("recentQueries", recentQuery);
    displayRecentQuery(recentQuery);
  }
}

function displayRecentQuery(recentQueries) {
  renderList(recentQueryContainer, recentQueries, (query) => {
    const pill = document.createElement("div");
    pill.className = "pill";
    pill.textContent = query;
    pill.onclick = () => {
      searchBox.value = query;
      searchBox.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter" }));
    };
    return pill;
  });
}

function displayGoogleDriveResults(results) {
  displayResults(
    googleDriveResultsContainer,
    "Google Drive",
    results,
    googleDriveLogo,
    (result) => result.webViewLink,
    (result) => result.name
  );
}

function displayWikiResults(results) {
  displayResults(
    wikiResultsContainer,
    "Wiki",
    results,
    confluenceLogo,
    (result) => result.link,
    (result) => result.title
  );
}

function displayJiraResults(issues) {
  displayResults(
    jiraResultsContainer,
    "Jira",
    issues,
    jiraLogo,
    (issue) => `https://jira.caremessage.org/browse/${issue.key}`,
    (issue) => issue.fields.summary
  );
}

function displayAsanaResults(results) {
  displayResults(
    asanaResultsContainer,
    "Asana",
    results,
    asanaLogo,
    (result) =>
      `https://app.asana.com/0/search?q=${encodeURIComponent(
        result.name
      )}&searched_type=task&child=${result.gid}&f=true`,
    (result) => result.name
  );
}

function displayResults(container, headerText, results, logo, linkFn, textFn) {
  container.innerHTML = "";
  const header = document.createElement("h2");
  header.textContent = headerText;
  container.appendChild(header);

  if (results.length === 0) {
    container.innerHTML += "<p>No results found</p>";
    return;
  }

  results.forEach((result) => {
    const resultItem = document.createElement("div");
    resultItem.className = "result-item";

    const icon = document.createElement("div");
    icon.innerHTML = logo;
    icon.className = "result-icon";

    const resultLink = document.createElement("a");
    resultLink.href = linkFn(result);
    resultLink.target = "_blank";
    resultLink.innerText = textFn(result);

    resultItem.appendChild(icon);
    resultItem.appendChild(resultLink);
    container.appendChild(resultItem);
  });
}

// Add keyboard navigation
document.addEventListener("keydown", (e) => {
  if (e.key === "/" && document.activeElement !== searchBox) {
    e.preventDefault();
    searchBox.focus();
  }
});

// Add this function to the existing code
function initializeFromLocalStorage() {
  // Display recent queries
  const storedQueries = getFromLocalStorage("recentQueries") || [];
  if (storedQueries.length > 0) {
    displayRecentQuery(storedQueries);
  }
  
  // Display recent links
  const storedLinks = getFromLocalStorage("recentLinks") || [];
  if (storedLinks.length > 0) {
    displayRecentAccessedLinks(storedLinks);
  }
}

// Add this call at the end of your file or in a document ready function
document.addEventListener("DOMContentLoaded", function() {
  initializeFromLocalStorage();
});
