const apiKey = "a476f55188212fab52986601162b9da6";  // API Key
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const weatherData = document.getElementById("weatherData");
const recentSearches = document.getElementById("recentSearches");
const recentCities = document.getElementById("recentCities");
const forecast = document.getElementById("forecast");
const forecastData = document.getElementById("forecastData");

// Load recent searches from local storage
let recentCitiesList = JSON.parse(localStorage.getItem("recentCities")) || [];
updateRecentCities();

// Event listener for search button
searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (!city) {
        showError("❌ Please enter a city name.");
        return;
    }
    fetchWeather(city);
});

// Fetch current weather data
async function fetchWeather(city) {
    try {
        // API request
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        if (!response.ok) throw new Error("❌ City not found. Please try again.");
        const data = await response.json();

        displayWeather(data);
        fetchForecast(city);
        saveRecentCity(city);
    } catch (error) {
        showError(error.message);
    }
}

// Display current weather
function displayWeather(data) {
    weatherData.innerHTML = `
        <h2 class="text-xl font-bold">${data.name}, ${data.sys.country}</h2>
        <p>🌡 Temperature: ${data.main.temp}°C</p>
        <p>🌤 Weather: ${data.weather[0].description}</p>
        <p>💨 Wind: ${data.wind.speed} m/s</p>
        <p>💧 Humidity: ${data.main.humidity}%</p>
    `;
}

// Fetch 5-day forecast
async function fetchForecast(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
        if (!response.ok) throw new Error("⚠️ Forecast data not available.");
        const data = await response.json();

        displayForecast(data.list);
    } catch (error) {
        showError(error.message);
    }
}

// Display 5-day forecast
function displayForecast(list) {
    forecast.style.display = "block";
    forecastData.innerHTML = "";

    // Extract daily forecasts (every 8th data point)
    const dailyForecasts = list.filter((_, index) => index % 8 === 0);
    dailyForecasts.forEach(day => {
        const date = new Date(day.dt * 1000).toLocaleDateString();
        forecastData.innerHTML += `
            <div class="p-2 bg-gray-200 rounded-lg">
                <p class="font-bold">${date}</p>
                <p>🌡 ${day.main.temp}°C</p>
                <p>💨 ${day.wind.speed} m/s</p>
                <p>💧 ${day.main.humidity}%</p>
            </div>
        `;
    });
}

// Save recent searches and update UI
function saveRecentCity(city) {
    const formattedCity = city.toLowerCase(); // Normalize for case-insensitive comparison

    if (!recentCitiesList.some(item => item.toLowerCase() === formattedCity)) {
        recentCitiesList.unshift(city); // Add new city
        if (recentCitiesList.length > 5) recentCitiesList.pop(); // Keep only 5 entries
        localStorage.setItem("recentCities", JSON.stringify(recentCitiesList));
        updateRecentCities();
    }
}

// Update recent searches UI
function updateRecentCities() {
    recentCities.innerHTML = "";
    if (recentCitiesList.length > 0) {
        recentSearches.style.display = "block";
        recentCitiesList.forEach(city => {
            const li = document.createElement("li");
            li.innerHTML = `<button class="bg-gray-300 px-4 py-2 rounded-lg">${city}</button>`;
            li.querySelector("button").addEventListener("click", () => fetchWeather(city));
            recentCities.appendChild(li);
        });
    } else {
        recentSearches.style.display = "none";
    }
}

// Display error messages
function showError(message) {
    weatherData.innerHTML = `<p class="text-red-500">${message}</p>`;
    forecast.style.display = "none"; // Hide forecast on error
}
