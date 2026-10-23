/* =========================================================
   HASMIT YADAV — DEVELOPER PORTFOLIO
   Main JavaScript
   Features: Theme Toggle, Project Search, Weather Widget
   ========================================================= */

"use strict";


/* =========================================================
   1. THEME TOGGLE
   ========================================================= */

const themeToggle = document.getElementById("themeToggle");


/*
 * Update the theme toggle button without removing
 * its icon or other HTML elements.
 */

function updateThemeButton(isDarkMode) {
    if (!themeToggle) return;

    const label = themeToggle.querySelector("span");
    const icon = themeToggle.querySelector("i");

    const buttonText = isDarkMode
        ? "Switch to Light Mode"
        : "Switch to Dark Mode";

    if (label) {
        label.textContent = buttonText;
    } else {
        /*
         * Fallback for buttons without a span.
         */
        themeToggle.textContent = buttonText;
    }

    if (icon) {
        icon.classList.toggle("fa-sun", isDarkMode);
        icon.classList.toggle("fa-moon", !isDarkMode);
    }

    themeToggle.setAttribute(
        "aria-pressed",
        String(isDarkMode)
    );

    themeToggle.setAttribute(
        "aria-label",
        buttonText
    );

    themeToggle.setAttribute(
        "title",
        buttonText
    );
}


/*
 * Apply the selected theme.
 *
 * Supported classes:
 * - dark-mode
 * - light-theme
 *
 * data-theme is also updated for theme-aware components.
 */

function applyTheme(isDarkMode) {
    document.body.classList.toggle(
        "dark-mode",
        isDarkMode
    );

    document.body.classList.toggle(
        "light-theme",
        !isDarkMode
    );

    document.body.dataset.theme = isDarkMode
        ? "dark"
        : "light";

    updateThemeButton(isDarkMode);
}


/*
 * Restore the previously selected theme.
 */

function getSavedTheme() {
    try {
        return localStorage.getItem(
            "hasmit-portfolio-theme"
        );
    } catch (error) {
        console.warn(
            "Theme preference could not be accessed.",
            error
        );

        return null;
    }
}


/*
 * Save the selected theme.
 */

function saveTheme(isDarkMode) {
    try {
        localStorage.setItem(
            "hasmit-portfolio-theme",
            isDarkMode ? "dark" : "light"
        );
    } catch (error) {
        console.warn(
            "Theme preference could not be saved.",
            error
        );
    }
}


/*
 * Initialise the theme.
 *
 * By default, the portfolio uses light mode.
 */

const savedTheme = getSavedTheme();

const initialDarkMode = savedTheme === "dark";

applyTheme(initialDarkMode);


/*
 * Listen for theme toggle clicks.
 */

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        const isDarkMode =
            !document.body.classList.contains("dark-mode");

        applyTheme(isDarkMode);

        saveTheme(isDarkMode);
    });
}


/* =========================================================
   2. PROJECT SEARCH
   ========================================================= */

const projectSearch =
    document.getElementById("projectSearch");

const projectCards = Array.from(
    document.querySelectorAll(".project-card")
);

const projectSearchStatus =
    document.getElementById("projectSearchStatus");

const noProjectsMessage =
    document.getElementById("noProjectsMessage");


/*
 * Search project titles, descriptions, technologies,
 * and additional keywords in the data-search attribute.
 */

function filterProjects() {
    if (!projectSearch) return;

    const query = projectSearch.value
        .trim()
        .toLowerCase();

    let visibleCount = 0;

    projectCards.forEach((card) => {
        const searchableText = [
            card.textContent || "",
            card.dataset.search || ""
        ]
            .join(" ")
            .toLowerCase();

        const matches = searchableText.includes(query);

        /*
         * Use both the hidden property and display style
         * so project cards remain hidden even if other CSS
         * rules override the browser's default hidden style.
         */

        card.hidden = !matches;

        card.style.display = matches ? "" : "none";

        if (matches) {
            visibleCount++;
        }
    });


    /*
     * Update the accessible search status.
     */

    if (projectSearchStatus) {
        if (query) {
            projectSearchStatus.textContent =
                `Showing ${visibleCount} of ${projectCards.length} projects for "${projectSearch.value.trim()}".`;
        } else {
            projectSearchStatus.textContent =
                `Showing all ${projectCards.length} projects.`;
        }
    }


    /*
     * Display the no-results message when necessary.
     */

    if (noProjectsMessage) {
        const noResults = visibleCount === 0;

        noProjectsMessage.hidden = !noResults;

        noProjectsMessage.style.display =
            noResults ? "" : "none";
    }
}


/*
 * Listen for project search input.
 */

if (projectSearch) {
    projectSearch.addEventListener(
        "input",
        filterProjects
    );

    /*
     * Apply the initial search state.
     */

    filterProjects();
}


/* =========================================================
   3. WEATHER WIDGET
   ========================================================= */

const cityInput =
    document.getElementById("cityInput");

const weatherButton =
    document.getElementById("weatherButton");

const weatherResult =
    document.getElementById("weatherResult");


/*
 * Existing OpenWeatherMap API key.
 *
 * IMPORTANT:
 * A key in browser JavaScript is publicly visible.
 * Restrict its usage with your provider where supported,
 * or move weather requests to a backend endpoint.
 */

const WEATHER_API_KEY =
    "8409c3b8439e34afb48a7476c83666a8";


/*
 * Prevent multiple weather requests at the same time.
 */

let isWeatherLoading = false;


/* =========================================================
   4. WEATHER RESULT HELPERS
   ========================================================= */


/*
 * Display a simple weather status message.
 *
 * DOM methods are used instead of innerHTML.
 */

function showWeatherMessage(
    message,
    iconClass = "fa-location-dot"
) {
    if (!weatherResult) return;

    const icon = document.createElement("i");

    icon.className = `fa-solid ${iconClass}`;

    icon.setAttribute("aria-hidden", "true");


    const text = document.createElement("span");

    text.textContent = message;


    weatherResult.replaceChildren(
        icon,
        text
    );
}


/*
 * Display the retrieved weather information.
 */

function displayWeather(data) {
    if (!weatherResult) return;

    const container = document.createElement("div");

    container.className = "weather-data";


    /*
     * City heading.
     */

    const cityHeading = document.createElement("h3");

    const country = data.sys?.country
        ? `, ${data.sys.country}`
        : "";

    cityHeading.textContent =
        `${data.name}${country}`;


    /*
     * Temperature.
     */

    const temperature = document.createElement("p");

    temperature.className = "weather-temperature";

    temperature.textContent =
        `Temperature: ${data.main.temp}°C`;


    /*
     * Weather condition.
     */

    const condition = document.createElement("p");

    condition.className = "weather-condition";

    const description =
        data.weather?.[0]?.description || "Unavailable";

    condition.textContent =
        `Condition: ${description}`;


    /*
     * Feels-like temperature.
     */

    const feelsLike = document.createElement("p");

    feelsLike.textContent =
        `Feels like: ${data.main.feels_like}°C`;


    /*
     * Humidity.
     */

    const humidity = document.createElement("p");

    humidity.textContent =
        `Humidity: ${data.main.humidity}%`;


    /*
     * Wind speed.
     */

    const windSpeed = document.createElement("p");

    windSpeed.textContent =
        `Wind speed: ${data.wind?.speed ?? "Unavailable"} m/s`;


    /*
     * Add weather data to the container.
     */

    container.append(
        cityHeading,
        temperature,
        condition,
        feelsLike,
        humidity,
        windSpeed
    );


    /*
     * Weather icon.
     */

    const icon = document.createElement("i");

    icon.className =
        "fa-solid fa-cloud-sun weather-result-icon";

    icon.setAttribute("aria-hidden", "true");


    weatherResult.replaceChildren(
        icon,
        container
    );
}


/* =========================================================
   5. FETCH WEATHER DATA
   ========================================================= */

async function getWeather() {
    /*
     * Ensure required elements exist.
     */

    if (!cityInput || !weatherButton || !weatherResult) {
        console.error(
            "Weather widget initialization failed: Missing HTML elements."
        );

        return;
    }


    /*
     * Prevent duplicate requests.
     */

    if (isWeatherLoading) {
        return;
    }


    /*
     * Read and validate the city name.
     */

    const city = cityInput.value.trim();

    if (!city) {
        showWeatherMessage(
            "Please enter a city name.",
            "fa-circle-exclamation"
        );

        cityInput.focus();

        return;
    }


    /*
     * Prevent unnecessarily long inputs.
     */

    if (city.length > 100) {
        showWeatherMessage(
            "Please enter a shorter city name.",
            "fa-circle-exclamation"
        );

        return;
    }


    /*
     * Verify an API key is configured.
     */

    if (
        !WEATHER_API_KEY ||
        WEATHER_API_KEY.includes("YOUR_API_KEY")
    ) {
        showWeatherMessage(
            "Weather service is not configured.",
            "fa-circle-exclamation"
        );

        return;
    }


    /*
     * Set loading state.
     */

    isWeatherLoading = true;

    weatherButton.disabled = true;

    weatherButton.setAttribute(
        "aria-busy",
        "true"
    );

    showWeatherMessage(
        "Loading weather information...",
        "fa-spinner"
    );


    /*
     * Set a timeout so requests do not continue indefinitely.
     */

    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
        controller.abort();
    }, 12000);


    try {
        /*
         * Build the OpenWeatherMap API URL.
         */

        const url = new URL(
            "https://api.openweathermap.org/data/2.5/weather"
        );

        url.searchParams.set("q", city);

        url.searchParams.set(
            "appid",
            WEATHER_API_KEY
        );

        url.searchParams.set(
            "units",
            "metric"
        );


        /*
         * Send the request.
         */

        const response = await fetch(url.toString(), {
            method: "GET",

            signal: controller.signal,

            headers: {
                "Accept": "application/json"
            }
        });


        /*
         * Handle API errors.
         */

        if (response.status === 404) {
            throw new Error("CITY_NOT_FOUND");
        }

        if (response.status === 401) {
            throw new Error("INVALID_API_KEY");
        }

        if (response.status === 429) {
            throw new Error("RATE_LIMIT");
        }

        if (!response.ok) {
            throw new Error("WEATHER_API_ERROR");
        }


        /*
         * Parse the response.
         */

        const data = await response.json();


        /*
         * Check required weather fields.
         */

        const validResponse =
            data &&
            typeof data.name === "string" &&
            data.main &&
            Number.isFinite(data.main.temp) &&
            Number.isFinite(data.main.feels_like) &&
            Number.isFinite(data.main.humidity);


        if (!validResponse) {
            throw new Error("INVALID_WEATHER_RESPONSE");
        }


        /*
         * Display weather information.
         */

        displayWeather(data);


    } catch (error) {
        console.error(
            "Weather request failed:",
            error
        );


        /*
         * Show helpful error messages.
         */

        if (error.name === "AbortError") {
            showWeatherMessage(
                "The request timed out. Please try again.",
                "fa-clock"
            );

        } else if (error.message === "CITY_NOT_FOUND") {
            showWeatherMessage(
                "City not found. Check the spelling and try again.",
                "fa-location-dot"
            );

        } else if (error.message === "INVALID_API_KEY") {
            showWeatherMessage(
                "Weather service configuration is invalid.",
                "fa-circle-exclamation"
            );

        } else if (error.message === "RATE_LIMIT") {
            showWeatherMessage(
                "Too many weather requests. Please try again later.",
                "fa-hourglass-half"
            );

        } else if (
            error.message === "INVALID_WEATHER_RESPONSE"
        ) {
            showWeatherMessage(
                "Unexpected weather data received. Please try again.",
                "fa-circle-exclamation"
            );

        } else if (!navigator.onLine) {
            showWeatherMessage(
                "You are offline. Check your internet connection.",
                "fa-wifi"
            );

        } else {
            showWeatherMessage(
                "Unable to fetch weather. Please try again.",
                "fa-cloud"
            );
        }

    } finally {
        /*
         * Always restore the button state.
         */

        clearTimeout(timeoutId);

        isWeatherLoading = false;

        weatherButton.disabled = false;

        weatherButton.setAttribute(
            "aria-busy",
            "false"
        );
    }
}


/* =========================================================
   6. WEATHER EVENT LISTENERS
   ========================================================= */

if (cityInput && weatherButton) {
    weatherButton.addEventListener(
        "click",
        getWeather
    );


    /*
     * Allow users to search by pressing Enter.
     */

    cityInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.isComposing) {
            event.preventDefault();

            getWeather();
        }
    });
}


/* =========================================================
   7. AUTOMATIC FOOTER YEAR
   ========================================================= */

const currentYear =
    document.getElementById("currentYear");

if (currentYear) {
    currentYear.textContent =
        String(new Date().getFullYear());
}


/* =========================================================
   8. INITIALIZATION
   ========================================================= */

console.log(
    "Hasmit Yadav portfolio JavaScript connected successfully."
);