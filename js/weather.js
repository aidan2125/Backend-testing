// Modern Weather App JavaScript
class WeatherApp {
  constructor() {
    this.apiKey = "8b2db50bb3a8c5f7c9b9d4e6f1a2b3c4"; // Replace with your OpenWeatherMap API key
    this.currentCity = "Cape Town";
    this.temperatureUnit = "celsius";
    this.windUnit = "kmh";
    this.chart = null;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadSettings();
    this.getCurrentLocation();
    this.loadQuickCities();
    this.setupVoiceSearch();
  }

  setupEventListeners() {
    // Search functionality
    const cityInput = document.getElementById("cityInput");
    const locationBtn = document.getElementById("locationBtn");
    const settingsBtn = document.getElementById("settingsBtn");
    const closeSettings = document.getElementById("closeSettings");

    cityInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.searchWeather(cityInput.value);
      }
    });

    cityInput.addEventListener("input", (e) => {
      this.showSearchSuggestions(e.target.value);
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

    // Quick cities
    document.querySelectorAll(".quick-city-card").forEach((card) => {
      card.addEventListener("click", () => {
        const city = card.dataset.city;
        this.searchWeather(city);
      });
    });

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
    } catch (error) {
      console.error("Error fetching weather:", error);
      this.showError(`Unable to fetch weather for ${city}. Using demo data.`);
      this.loadDemoData();
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
    const cities = ["Cape Town", "Johannesburg", "Durban", "London"];

    for (const city of cities) {
      try {
        // For demo purposes, using random temperatures
        const temp = Math.round(15 + Math.random() * 15);
        const card = document.querySelector(`[data-city="${city}"]`);
        if (card) {
          card.querySelector(".quick-temp").textContent = `${temp}°`;
        }
      } catch (error) {
        console.error(`Error loading temperature for ${city}:`, error);
      }
    }
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

// Initialize the weather app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.weatherApp = new WeatherApp();
});
