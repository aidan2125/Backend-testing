// Modern Weather App JavaScript
class WeatherApp {
  constructor() {
    this.apiKey = "86f6948b34f7cf32a95cacbb9bffa630"; // OpenWeatherMap API key
    this.currentCity = "Cape Town";
    this.temperatureUnit = "celsius";
    this.windUnit = "kmh";
    this.chart = null;

    this.init();
  }

<<<<<<< HEAD
  init() {
    this.setupEventListeners();
    this.loadSettings();
    this.getCurrentLocation();
    this.loadQuickCities();
    this.setupVoiceSearch();
  }
=======
  weatherForm.addEventListener("submit", async event => {
    event.preventDefault();
>>>>>>> bd4430bbbaebb6a6ece5f5ffd6c6fa794b2749a2

  setupEventListeners() {
    // Search functionality
    const cityInput = document.getElementById("cityInput");
    const locationBtn = document.getElementById("locationBtn");
    const settingsBtn = document.getElementById("settingsBtn");
    const closeSettings = document.getElementById("closeSettings");

<<<<<<< HEAD
    cityInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.searchWeather(cityInput.value);
=======
    if (city) {
        try {
            const weatherData = await getWeatherData(city);
            getWeatherInfo(weatherData);
        } catch (error) {
            console.error(error);
            displayError(error.message);
        }
    } else {
        displayError("Please Enter a City");
    }
});

async function getWeatherData(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
        throw new Error("Couldn't Fetch Data");
    }

    return await response.json();
}

function getWeatherInfo(data) {
    const {
        name: city,
        main: { temp, humidity },
        weather: [{ description, id }],
    } = data;

    card.textContent = "";
    card.style.display = "flex";

    const cityDisplay = document.createElement("h1");
    const tempDisplay = document.createElement("p");
    const humidityDisplay = document.createElement("p");
    const descDisplay = document.createElement("p");
    const weatherEmoji = document.createElement("p");

    cityDisplay.textContent = city;
    tempDisplay.textContent = `${(temp - 273.15).toFixed(1)} °C`;
    humidityDisplay.textContent = `Humidity: ${humidity}`;
    descDisplay.textContent = description;
    weatherEmoji.textContent = getWeatherEmoji(id);

    cityDisplay.classList.add("cityDisplay");
    tempDisplay.classList.add("tempDisplay");
    humidityDisplay.classList.add("humidityDisplay");
    descDisplay.classList.add("descDisplay");
    weatherEmoji.classList.add("weatherEmoji");

    card.appendChild(cityDisplay);
    card.appendChild(tempDisplay);
    card.appendChild(humidityDisplay);
    card.appendChild(descDisplay);
    card.appendChild(weatherEmoji);
}

function getWeatherEmoji(weatherId) {
    switch (true) {
        case (weatherId >= 200 && weatherId < 300): return "🌩️";
        case (weatherId >= 300 && weatherId < 400): return "🌧️";
        case (weatherId >= 500 && weatherId < 600): return "🌧️";
        case (weatherId >= 600 && weatherId < 700): return "🌨️";
        case (weatherId >= 700 && weatherId < 800): return "🌫️";
        case (weatherId === 800): return "☀️";
        case (weatherId > 800): return "☁️";
        default: return "❓";
    }
}

function displayError(message) {
    const errorDisplay = document.createElement("p");
    errorDisplay.textContent = message;
    errorDisplay.classList.add("errorDisplay");

    card.textContent = "";
    card.style.display = "flex";
    card.appendChild(errorDisplay);
}

// Five Day Forecast Code

weatherForm.addEventListener("submit", async event => {
    event.preventDefault();

    const city = cityInput.value;

    if (city) {
        try {
            const forecastData = await getFiveDayForecast(city);
            displayFiveDayForecast(forecastData);
        } catch (error) {
            console.error(error);
            displayError("Failed to fetch forecast.");
        }
    } else {
        displayError("Please enter a city.");
    }
});

  async function getFiveDayForecast(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("Failed to fetch forecast");
    return await response.json();
  }

  function getWeatherInfo(data) {
    card.style.display = "flex";
    cityDisplay.textContent = data.name;
    tempDisplay.textContent = `${(data.main.temp - 273.15).toFixed(1)} °C`;
    humidityDisplay.textContent = `Humidity: ${data.main.humidity}%`;
    descDisplay.textContent = data.weather[0].description;
    weatherEmoji.textContent = getWeatherEmoji(data.weather[0].id);
    errorDisplay.textContent = "";
  }

  function displayFiveDayForecast(data) {
    forecastGrid.innerHTML = "";
    card.style.display = "grid";

    const forecastMap = {};
    data.list.forEach(forecast => {
      const date = forecast.dt_txt.split(" ")[0];
      const time = forecast.dt_txt.split(" ")[1];
      if (time === "12:00:00" && !forecastMap[date]) {
        forecastMap[date] = forecast;
>>>>>>> bd4430bbbaebb6a6ece5f5ffd6c6fa794b2749a2
      }
    });

    cityInput.addEventListener("input", (e) => {
      this.showSearchSuggestions(e.target.value);
    });

    // Search button functionality
    const searchBtn = document.getElementById("searchBtn");
    searchBtn.addEventListener("click", () => {
      this.searchWeather(cityInput.value);
    });

    locationBtn.addEventListener("click", () => {
      this.getCurrentLocation();
    });

    settingsBtn.addEventListener("click", () => {
      this.showSettingsModal();
    });

    closeSettings.addEventListener("click", () => {
      this.hideSettingsModal();
    });

    // Settings form
    document.querySelectorAll('input[name="tempUnit"]').forEach((radio) => {
      radio.addEventListener("change", (e) => {
        this.temperatureUnit = e.target.value;
        this.saveSettings();
        this.updateTemperatureDisplay();
      });
    });

    document.querySelectorAll('input[name="windUnit"]').forEach((radio) => {
      radio.addEventListener("change", (e) => {
        this.windUnit = e.target.value;
        this.saveSettings();
        this.updateWindDisplay();
      });
    });

    // Chart controls
    document.querySelectorAll(".chart-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        document
          .querySelectorAll(".chart-btn")
          .forEach((b) => b.classList.remove("active"));
        e.target.classList.add("active");
        this.updateChart(e.target.dataset.period);
      });
    });

    // Map controls
    document.querySelectorAll(".map-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        document
          .querySelectorAll(".map-btn")
          .forEach((b) => b.classList.remove("active"));
        e.target.classList.add("active");
        this.updateMap(e.target.dataset.layer);
      });
    });

    // Quick cities events will be attached in loadQuickCities method

    // Voice search
    document.getElementById("voiceSearchBtn").addEventListener("click", () => {
      this.startVoiceSearch();
    });

    // Close modal when clicking outside
    document.getElementById("settingsModal").addEventListener("click", (e) => {
      if (e.target.id === "settingsModal") {
        this.hideSettingsModal();
      }
    });
  }

  async getCurrentLocation() {
    this.showLoading(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          await this.getWeatherByCoords(latitude, longitude);
          this.showLoading(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          this.searchWeather("Cape Town");
          this.showLoading(false);
        },
      );
    } else {
      this.searchWeather("Cape Town");
      this.showLoading(false);
    }
  }

  async getWeatherByCoords(lat, lon) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`,
      );

      if (!response.ok) {
        throw new Error("Weather data not found");
      }

      const data = await response.json();
      this.currentCity = data.name;
      await this.displayWeatherData(data);
      await this.loadForecastData();
    } catch (error) {
      console.error("Error fetching weather:", error);
      this.showError("Unable to fetch weather data. Using demo data.");
      this.loadDemoData();
    }
  }

  async searchWeather(city) {
    if (!city.trim()) return;

    this.showLoading(true);
    this.currentCity = city;
    document.getElementById("cityInput").value = city;

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.apiKey}&units=metric`,
      );

      if (!response.ok) {
        throw new Error("City not found");
      }

      const data = await response.json();
      await this.displayWeatherData(data);
      await this.loadForecastData();
      this.hideSearchSuggestions();

      // Auto-add to Quick Access if not already there
      this.autoAddToQuickAccess(data.name);
    } catch (error) {
      console.error("Error fetching weather:", error);
      this.showError(`Unable to fetch weather for ${city}. Using demo data.`);
      this.loadDemoData();

      // Still add to Quick Access for demo data
      this.autoAddToQuickAccess(city);
    }

    this.showLoading(false);
  }

  async displayWeatherData(data) {
    // Update current weather display
    document.getElementById("cityName").textContent = data.name;
    document.getElementById("weatherDate").textContent = this.formatDate(
      new Date(),
    );
    document.getElementById("mainTemp").textContent =
      `${Math.round(data.main.temp)}°`;
    document.getElementById("feelsLike").textContent =
      `${Math.round(data.main.feels_like)}°`;
    document.getElementById("weatherCondition").textContent =
      data.weather[0].description;
    document.getElementById("humidity").textContent = `${data.main.humidity}%`;
    document.getElementById("windSpeed").textContent =
      `${Math.round(data.wind.speed * 3.6)} km/h`;
    document.getElementById("pressure").textContent =
      `${data.main.pressure} hPa`;
    document.getElementById("visibility").textContent =
      `${(data.visibility / 1000).toFixed(1)} km`;

    // Update weather icon
    this.updateWeatherIcon(data.weather[0].main);

    // Update background
    this.updateBackground(data.weather[0].main);

    // Update weather particles
    this.updateWeatherParticles(data.weather[0].main);

    // Update travel insights
    this.updateTravelInsights(data);
  }

  updateWeatherIcon(weatherMain) {
    const iconContainer = document.getElementById("weatherIconContainer");
    const iconMap = {
      Clear: "fas fa-sun",
      Clouds: "fas fa-cloud",
      Rain: "fas fa-cloud-rain",
      Drizzle: "fas fa-cloud-drizzle",
      Thunderstorm: "fas fa-bolt",
      Snow: "fas fa-snowflake",
      Mist: "fas fa-smog",
      Fog: "fas fa-smog",
    };

    const iconClass = iconMap[weatherMain] || "fas fa-cloud";
    iconContainer.innerHTML = `<i class="${iconClass} weather-icon"></i>`;
  }

  updateBackground(weatherMain) {
    const body = document.body;
    body.className = ""; // Reset classes

    const hour = new Date().getHours();
    const isNight = hour < 6 || hour > 18;

    if (weatherMain === "Clear") {
      body.classList.add(isNight ? "clear-night" : "clear-day");
    } else if (weatherMain === "Clouds") {
      body.classList.add("cloudy");
    } else if (weatherMain === "Rain" || weatherMain === "Drizzle") {
      body.classList.add("rainy");
    } else if (weatherMain === "Snow") {
      body.classList.add("snowy");
    } else if (weatherMain === "Thunderstorm") {
      body.classList.add("stormy");
    } else {
      body.classList.add("cloudy");
    }
  }

  updateWeatherParticles(weatherMain) {
    const particlesContainer = document.getElementById("weatherParticles");
    particlesContainer.innerHTML = "";

    if (weatherMain === "Rain" || weatherMain === "Drizzle") {
      this.createRainParticles(particlesContainer);
    } else if (weatherMain === "Snow") {
      this.createSnowParticles(particlesContainer);
    }
  }

  createRainParticles(container) {
    for (let i = 0; i < 100; i++) {
      const raindrop = document.createElement("div");
      raindrop.className = "raindrop";
      raindrop.style.left = Math.random() * 100 + "%";
      raindrop.style.animationDelay = Math.random() * 1 + "s";
      raindrop.style.animationDuration = Math.random() * 0.5 + 0.5 + "s";
      container.appendChild(raindrop);
    }
  }

  createSnowParticles(container) {
    const snowflakes = ["❄", "❅", "❆"];
    for (let i = 0; i < 50; i++) {
      const snowflake = document.createElement("div");
      snowflake.className = "snowflake";
      snowflake.innerHTML =
        snowflakes[Math.floor(Math.random() * snowflakes.length)];
      snowflake.style.left = Math.random() * 100 + "%";
      snowflake.style.animationDelay = Math.random() * 3 + "s";
      snowflake.style.animationDuration = Math.random() * 2 + 2 + "s";
      snowflake.style.fontSize = Math.random() * 10 + 10 + "px";
      container.appendChild(snowflake);
    }
  }

  async loadForecastData() {
    // Load hourly forecast
    this.loadHourlyForecast();

    // Load daily forecast
    this.loadDailyForecast();

    // Update chart
    this.updateChart("24h");
  }

  loadHourlyForecast() {
    const hourlyContainer = document.getElementById("hourlyForecast");
    const hours = [];

    // Generate 24 hours of forecast data
    for (let i = 0; i < 24; i++) {
      const time = new Date();
      time.setHours(time.getHours() + i);

      hours.push({
        time: this.formatTime(time),
        icon: this.getRandomWeatherIcon(),
        temp: Math.round(20 + Math.random() * 10),
        precipitation: Math.round(Math.random() * 100),
      });
    }

    hourlyContainer.innerHTML = hours
      .map(
        (hour) => `
      <div class="hourly-item">
        <div class="hourly-time">${hour.time}</div>
        <div class="hourly-icon">
          <i class="${hour.icon}"></i>
        </div>
        <div class="hourly-temp">${hour.temp}°</div>
        <div class="hourly-precip">${hour.precipitation}%</div>
      </div>
    `,
      )
      .join("");
  }

  loadDailyForecast() {
    const dailyContainer = document.getElementById("dailyForecast");
    const days = [];

    // Generate 7 days of forecast data
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);

      days.push({
        day: i === 0 ? "Today" : this.formatDayName(date),
        icon: this.getRandomWeatherIcon(),
        high: Math.round(25 + Math.random() * 10),
        low: Math.round(15 + Math.random() * 10),
        description: this.getRandomWeatherDesc(),
      });
    }

    dailyContainer.innerHTML = days
      .map(
        (day) => `
      <div class="daily-item">
        <div class="daily-day">${day.day}</div>
        <div class="daily-icon">
          <i class="${day.icon}"></i>
        </div>
        <div class="daily-temps">
          <span class="temp-high">${day.high}°</span>
          <span class="temp-low">${day.low}°</span>
        </div>
        <div class="daily-desc">${day.description}</div>
      </div>
    `,
      )
      .join("");
  }

  updateChart(period) {
    const ctx = document.getElementById("temperatureChart").getContext("2d");

    if (this.chart) {
      this.chart.destroy();
    }

    let labels = [];
    let data = [];

    if (period === "24h") {
      for (let i = 0; i < 24; i++) {
        const time = new Date();
        time.setHours(time.getHours() + i);
        labels.push(this.formatTime(time));
        data.push(Math.round(20 + Math.random() * 10));
      }
    } else if (period === "7d") {
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        labels.push(this.formatDayName(date));
        data.push(Math.round(20 + Math.random() * 10));
      }
    } else if (period === "30d") {
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        labels.push(date.getDate().toString());
        data.push(Math.round(20 + Math.random() * 10));
      }
    }

    this.chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Temperature (°C)",
            data: data,
            borderColor: "#FF6B35",
            backgroundColor: "rgba(255, 107, 53, 0.1)",
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "#FF6B35",
            pointBorderColor: "#FFFFFF",
            pointBorderWidth: 2,
            pointRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
            },
            ticks: {
              color: "rgba(255, 255, 255, 0.8)",
            },
          },
          y: {
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
            },
            ticks: {
              color: "rgba(255, 255, 255, 0.8)",
            },
          },
        },
      },
    });
  }

  updateTravelInsights(data) {
    const insights = [];
    const temp = data.main.temp;
    const condition = data.weather[0].main;
    const windSpeed = data.wind.speed * 3.6; // Convert to km/h

    // Temperature insights
    if (temp >= 20 && temp <= 28) {
      insights.push({
        type: "good",
        title: "Perfect Temperature for Sightseeing",
        description:
          "Ideal weather conditions for outdoor activities and exploration.",
      });
    } else if (temp > 30) {
      insights.push({
        type: "warning",
        title: "Stay Hydrated",
        description:
          "High temperatures expected. Carry water and seek shade during peak hours.",
      });
    } else if (temp < 10) {
      insights.push({
        type: "warning",
        title: "Dress Warmly",
        description: "Cold weather conditions. Pack warm clothing and layers.",
      });
    }

    // Weather condition insights
    if (condition === "Rain") {
      insights.push({
        type: "warning",
        title: "Rain Expected",
        description:
          "Pack an umbrella and consider indoor activities or covered attractions.",
      });
    } else if (condition === "Clear") {
      insights.push({
        type: "good",
        title: "Clear Skies Ahead",
        description: "Perfect weather for outdoor photography and sightseeing.",
      });
    }

    // Wind insights
    if (windSpeed > 20) {
      insights.push({
        type: "warning",
        title: "Windy Conditions",
        description:
          "Strong winds expected. Secure loose items and be cautious near the coast.",
      });
    }

    const insightsContainer = document.getElementById("travelInsights");
    insightsContainer.innerHTML = insights
      .map(
        (insight) => `
      <div class="insight-item">
        <div class="insight-icon ${insight.type}">
          <i class="fas ${insight.type === "good" ? "fa-thumbs-up" : insight.type === "warning" ? "fa-exclamation-triangle" : "fa-times-circle"}"></i>
        </div>
        <div class="insight-content">
          <h4>${insight.title}</h4>
          <p>${insight.description}</p>
        </div>
      </div>
    `,
      )
      .join("");
  }

  async loadQuickCities() {
    // Load saved quick cities from localStorage or use defaults
    const savedCities = JSON.parse(
      localStorage.getItem("quickCities") ||
        '["Cape Town", "Johannesburg", "Durban", "London"]',
    );

    // Clear current cities grid
    const citiesGrid = document.getElementById("quickCities");
    citiesGrid.innerHTML = "";

    // Create cards for each city
    for (const city of savedCities) {
      try {
        // For demo purposes, using random temperatures
        const temp = Math.round(15 + Math.random() * 15);

        // Create city card element
        const cardHTML = `
          <div class="quick-city-card" data-city="${city}">
            <button class="remove-city-btn" onclick="removeQuickCity('${city}')" title="Remove from Quick Access">
              <i class="fas fa-times"></i>
            </button>
            <span class="city-name">${city}</span>
            <div class="quick-temp">${temp}°</div>
          </div>
        `;

        citiesGrid.insertAdjacentHTML("beforeend", cardHTML);
      } catch (error) {
        console.error(`Error loading temperature for ${city}:`, error);
      }
    }

    // Re-attach click events for the new cards
    this.attachQuickCityEvents();
  }

  attachQuickCityEvents() {
    document.querySelectorAll(".quick-city-card").forEach((card) => {
      // Remove existing listeners to avoid duplicates
      card.replaceWith(card.cloneNode(true));
    });

    // Add click events to the new cards
    document.querySelectorAll(".quick-city-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        // Don't trigger if remove button was clicked
        if (e.target.closest(".remove-city-btn")) {
          return;
        }
        const city = card.dataset.city;
        this.searchWeather(city);
      });
    });
  }

  removeQuickCity(cityName) {
    // Get current saved cities
    const savedCities = JSON.parse(
      localStorage.getItem("quickCities") ||
        '["Cape Town", "Johannesburg", "Durban", "London"]',
    );

    // Remove the city from the array
    const updatedCities = savedCities.filter((city) => city !== cityName);

    // Save updated array to localStorage
    localStorage.setItem("quickCities", JSON.stringify(updatedCities));

    // Reload the quick cities display
    this.loadQuickCities();

    // Show a confirmation message
    this.showRemoveConfirmation(cityName);
  }

  autoAddToQuickAccess(cityName) {
    // Get current saved cities
    const savedCities = JSON.parse(
      localStorage.getItem("quickCities") ||
        '["Cape Town", "Johannesburg", "Durban", "London"]',
    );

    // Check if city is already in Quick Access
    if (!savedCities.includes(cityName)) {
      // Add new city to the beginning of the array
      savedCities.unshift(cityName);

      // Keep only the most recent 8 cities to avoid overcrowding
      if (savedCities.length > 8) {
        savedCities.pop();
      }

      // Save updated array to localStorage
      localStorage.setItem("quickCities", JSON.stringify(savedCities));

      // Reload the quick cities display
      this.loadQuickCities();

      // Show confirmation
      this.showAddConfirmation(cityName);
    }
  }

  showAddConfirmation(cityName) {
    // Create a confirmation toast
    const toast = document.createElement("div");
    toast.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: rgba(46, 204, 113, 0.9);
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      z-index: 10000;
      backdrop-filter: blur(10px);
      font-weight: 500;
    `;
    toast.innerHTML = `
      <i class="fas fa-plus-circle" style="margin-right: 8px;"></i>
      ${cityName} added to Quick Access
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
  }

  showRemoveConfirmation(cityName) {
    // Create a confirmation toast
    const toast = document.createElement("div");
    toast.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: rgba(231, 76, 60, 0.9);
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      z-index: 10000;
      backdrop-filter: blur(10px);
      font-weight: 500;
    `;
    toast.innerHTML = `
      <i class="fas fa-times-circle" style="margin-right: 8px;"></i>
      ${cityName} removed from Quick Access
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
  }

  showSearchSuggestions(query) {
    if (query.length < 2) {
      this.hideSearchSuggestions();
      return;
    }

    // Demo suggestions - in a real app, this would call a cities API
    const suggestions = [
      "Cape Town, South Africa",
      "Johannesburg, South Africa",
      "Durban, South Africa",
      "London, United Kingdom",
      "New York, United States",
      "Tokyo, Japan",
    ].filter((city) => city.toLowerCase().includes(query.toLowerCase()));

    const suggestionsContainer = document.getElementById("searchSuggestions");

    if (suggestions.length > 0) {
      suggestionsContainer.innerHTML = suggestions
        .map(
          (suggestion) => `
        <div class="suggestion-item" onclick="weatherApp.searchWeather('${suggestion.split(",")[0]}')">${suggestion}</div>
      `,
        )
        .join("");
      suggestionsContainer.style.display = "block";
    } else {
      this.hideSearchSuggestions();
    }
  }

  hideSearchSuggestions() {
    document.getElementById("searchSuggestions").style.display = "none";
  }

  setupVoiceSearch() {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      this.recognition = new (window.SpeechRecognition ||
        window.webkitSpeechRecognition)();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = "en-US";

      this.recognition.onresult = (event) => {
        const city = event.results[0][0].transcript;
        document.getElementById("cityInput").value = city;
        this.searchWeather(city);
      };

      this.recognition.onerror = (event) => {
        console.error("Voice recognition error:", event.error);
      };
    } else {
      document.getElementById("voiceSearchBtn").style.display = "none";
    }
  }

  startVoiceSearch() {
    if (this.recognition) {
      const btn = document.getElementById("voiceSearchBtn");
      btn.innerHTML = '<i class="fas fa-stop"></i>';
      btn.style.background = "#e74c3c";

      this.recognition.start();

      this.recognition.onend = () => {
        btn.innerHTML = '<i class="fas fa-microphone"></i>';
        btn.style.background = "";
      };
    }
  }

  updateMap(layer) {
    // In a real implementation, this would update the weather map
    const mapContainer = document.querySelector(".map-placeholder");
    mapContainer.innerHTML = `
      <i class="fas fa-map-marked-alt"></i>
      <p>Showing ${layer} layer on weather map</p>
      <small>Interactive map integration would load here</small>
    `;
  }

  showSettingsModal() {
    document.getElementById("settingsModal").classList.add("active");
  }

  hideSettingsModal() {
    document.getElementById("settingsModal").classList.remove("active");
  }

  loadSettings() {
    const settings = JSON.parse(
      localStorage.getItem("weatherAppSettings") || "{}",
    );
    this.temperatureUnit = settings.temperatureUnit || "celsius";
    this.windUnit = settings.windUnit || "kmh";

    // Update form values
    document.querySelector(
      `input[name="tempUnit"][value="${this.temperatureUnit}"]`,
    ).checked = true;
    document.querySelector(
      `input[name="windUnit"][value="${this.windUnit}"]`,
    ).checked = true;
  }

  saveSettings() {
    const settings = {
      temperatureUnit: this.temperatureUnit,
      windUnit: this.windUnit,
    };
    localStorage.setItem("weatherAppSettings", JSON.stringify(settings));
  }

  showLoading(show) {
    const overlay = document.getElementById("loadingOverlay");
    if (show) {
      overlay.classList.add("active");
    } else {
      overlay.classList.remove("active");
    }
  }

  showError(message) {
    // Create a simple toast notification
    const toast = document.createElement("div");
    toast.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: rgba(231, 76, 60, 0.9);
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      z-index: 10000;
      backdrop-filter: blur(10px);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      document.body.removeChild(toast);
    }, 5000);
  }

  loadDemoData() {
    // Demo data for when API is not available
    const demoData = {
      name: this.currentCity,
      main: {
        temp: 22,
        feels_like: 24,
        humidity: 65,
        pressure: 1013,
      },
      weather: [
        {
          main: "Clear",
          description: "clear sky",
        },
      ],
      wind: {
        speed: 3.5,
      },
      visibility: 10000,
    };

    this.displayWeatherData(demoData);
    this.loadForecastData();
  }

  // Utility functions
  formatDate(date) {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  }

  formatTime(date) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      hour12: true,
    });
  }

  formatDayName(date) {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  }

  getRandomWeatherIcon() {
    const icons = [
      "fas fa-sun",
      "fas fa-cloud",
      "fas fa-cloud-sun",
      "fas fa-cloud-rain",
      "fas fa-bolt",
    ];
    return icons[Math.floor(Math.random() * icons.length)];
  }

  getRandomWeatherDesc() {
    const descriptions = [
      "Sunny",
      "Partly Cloudy",
      "Cloudy",
      "Light Rain",
      "Thunderstorm",
      "Clear",
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  updateTemperatureDisplay() {
    // Update all temperature displays based on unit preference
    // This would convert between Celsius and Fahrenheit
  }

  updateWindDisplay() {
    // Update wind speed displays based on unit preference
    // This would convert between km/h and mph
  }
}

<<<<<<< HEAD
// Global function to remove quick city (called from HTML onclick)
function removeQuickCity(cityName) {
  if (window.weatherApp) {
    window.weatherApp.removeQuickCity(cityName);
  }
}

// Initialize the weather app when the page loads
document.addEventListener("DOMContentLoaded", () => {
  window.weatherApp = new WeatherApp();
=======
  function displayError(message) {
    card.style.display = "flex";
    errorDisplay.textContent = message;
  }
>>>>>>> bd4430bbbaebb6a6ece5f5ffd6c6fa794b2749a2
});
