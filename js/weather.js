// weather.js

export function fetchWeatherData(location) {
  const apiKey = '86f6948b34f7cf32a95cacbb9bffa630';
  const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}`;

  return fetch(url)
    .then(response => {
      if (!response.ok) throw new Error("Failed to fetch weather data");
      return response.json();
    })
    .then(data => ({
      temperature: data.current.temp_c,
      condition: data.current.condition.text,
    }))
    .catch(error => {
      console.error('Weather fetch error:', error);
      return null;
    });
}

const apiKey = '86f6948b34f7cf32a95cacbb9bffa630';

const searchButton = document.getElementById('searchButton');
const cityInput = document.getElementById('cityInput');
const cityName = document.getElementById('cityName');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');
const humidity = document.getElementById('humidity');
const iconContainer = document.getElementById('weatherIcon');
const cityListContainer = document.getElementById('cityListContainer');
const forecastContainer = document.querySelector('.forecast-container');

let cityList = JSON.parse(localStorage.getItem('savedCities')) || [];

// Save cities to localStorage
function saveCities() {
  localStorage.setItem('savedCities', JSON.stringify(cityList));
}

// Render saved cities as buttons
function displayCityList() {
  cityListContainer.innerHTML = '';
  cityList.forEach(city => {
    const btn = document.createElement('button');
    btn.textContent = city;
    btn.className = 'px-3 py-1 rounded bg-white/20 hover:bg-white/30 transition';
    btn.onclick = () => getWeather(city);
    cityListContainer.appendChild(btn);
  });
}

// Custom SVG icons based on OpenWeather icon codes
function getWeatherSVG(iconCode) {
  const svgs = {
    // Clear
    '01d': `<svg viewBox="0 0 64 64" class="w-full h-full" fill="none" stroke="orange" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="32" cy="32" r="14" fill="#FFD93B"/>
              <g>
                <line x1="32" y1="2" x2="32" y2="14"/>
                <line x1="32" y1="50" x2="32" y2="62"/>
                <line x1="2" y1="32" x2="14" y2="32"/>
                <line x1="50" y1="32" x2="62" y2="32"/>
                <line x1="12" y1="12" x2="20" y2="20"/>
                <line x1="44" y1="44" x2="52" y2="52"/>
                <line x1="12" y1="52" x2="20" y2="44"/>
                <line x1="44" y1="20" x2="52" y2="12"/>
              </g>
            </svg>`,
    '01n': `<svg viewBox="0 0 64 64" class="w-full h-full" fill="none" stroke="lightyellow" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="32" cy="32" r="14" fill="lightyellow"/>
              <path d="M50 42a18 18 0 1 1-28-24" stroke="yellow"/>
            </svg>`,
    // Few clouds
    '02d': `<svg viewBox="0 0 64 64" class="w-full h-full" fill="none" stroke="orange" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="24" cy="24" r="14" fill="#FFD93B"/>
              <ellipse cx="40" cy="40" rx="16" ry="14" fill="lightgray"/>
            </svg>`,
    '02n': `<svg viewBox="0 0 64 64" class="w-full h-full" fill="none" stroke="lightyellow" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="24" cy="24" r="14" fill="lightyellow"/>
              <ellipse cx="40" cy="40" rx="16" ry="14" fill="gray"/>
            </svg>`,
    // Scattered clouds
    '03d': `<svg viewBox="0 0 64 64" class="w-full h-full">
              <ellipse cx="32" cy="36" rx="28" ry="20" fill="gray"/>
            </svg>`,
    '03n': `<svg viewBox="0 0 64 64" class="w-full h-full">
              <ellipse cx="32" cy="36" rx="28" ry="20" fill="#555"/>
            </svg>`,
    // Broken clouds
    '04d': `<svg viewBox="0 0 64 64" class="w-full h-full">
              <ellipse cx="24" cy="28" rx="20" ry="14" fill="#bbb"/>
              <ellipse cx="40" cy="38" rx="20" ry="14" fill="#aaa"/>
            </svg>`,
    '04n': `<svg viewBox="0 0 64 64" class="w-full h-full">
              <ellipse cx="24" cy="28" rx="20" ry="14" fill="#666"/>
              <ellipse cx="40" cy="38" rx="20" ry="14" fill="#555"/>
            </svg>`,
    // Shower rain
    '09d': `<svg viewBox="0 0 64 64" class="w-full h-full">
              <ellipse cx="32" cy="32" rx="28" ry="20" fill="gray"/>
              <line x1="20" y1="44" x2="20" y2="54" stroke="blue" stroke-width="3" stroke-linecap="round"/>
              <line x1="32" y1="44" x2="32" y2="54" stroke="blue" stroke-width="3" stroke-linecap="round"/>
              <line x1="44" y1="44" x2="44" y2="54" stroke="blue" stroke-width="3" stroke-linecap="round"/>
            </svg>`,
    '09n': `<svg viewBox="0 0 64 64" class="w-full h-full">
              <ellipse cx="32" cy="32" rx="28" ry="20" fill="#444"/>
              <line x1="20" y1="44" x2="20" y2="54" stroke="lightblue" stroke-width="3" stroke-linecap="round"/>
              <line x1="32" y1="44" x2="32" y2="54" stroke="lightblue" stroke-width="3" stroke-linecap="round"/>
              <line x1="44" y1="44" x2="44" y2="54" stroke="lightblue" stroke-width="3" stroke-linecap="round"/>
            </svg>`,
    // Rain
    '10d': `<svg viewBox="0 0 64 64" class="w-full h-full">
              <ellipse cx="24" cy="24" rx="14" ry="14" stroke="orange" fill="none" stroke-width="3"/>
              <ellipse cx="36" cy="36" rx="28" ry="20" fill="gray"/>
              <line x1="20" y1="44" x2="20" y2="54" stroke="blue" stroke-width="3" stroke-linecap="round"/>
            </svg>`,
    '10n': `<svg viewBox="0 0 64 64" class="w-full h-full">
              <ellipse cx="24" cy="24" rx="14" ry="14" stroke="lightyellow" fill="none" stroke-width="3"/>
              <ellipse cx="36" cy="36" rx="28" ry="20" fill="#444"/>
              <line x1="20" y1="44" x2="20" y2="54" stroke="lightblue" stroke-width="3" stroke-linecap="round"/>
            </svg>`,
    // Thunderstorm
    '11d': `<svg viewBox="0 0 64 64" class="w-full h-full">
              <ellipse cx="32" cy="32" rx="28" ry="20" fill="gray"/>
              <polyline points="20,48 26,40 32,48 38,40 44,48" stroke="yellow" stroke-width="3" fill="none" stroke-linejoin="round"/>
            </svg>`,
    '11n': `<svg viewBox="0 0 64 64" class="w-full h-full">
              <ellipse cx="32" cy="32" rx="28" ry="20" fill="#333"/>
              <polyline points="20,48 26,40 32,48 38,40 44,48" stroke="yellow" stroke-width="3" fill="none" stroke-linejoin="round"/>
            </svg>`,
    // Snow
    '13d': `<svg viewBox="0 0 64 64" class="w-full h-full">
              <ellipse cx="32" cy="32" rx="28" ry="20" fill="#ccf"/>
              <line x1="20" y1="38" x2="20" y2="48" stroke="#ccf" stroke-width="3" stroke-linecap="round"/>
              <line x1="32" y1="38" x2="32" y2="48" stroke="#ccf" stroke-width="3" stroke-linecap="round"/>
              <line x1="44" y1="38" x2="44" y2="48" stroke="#ccf" stroke-width="3" stroke-linecap="round"/>
            </svg>`,
    '13n': `<svg viewBox="0 0 64 64" class="w-full h-full">
              <ellipse cx="32" cy="32" rx="28" ry="20" fill="#dde"/>
              <line x1="20" y1="38" x2="20" y2="48" stroke="#dde" stroke-width="3" stroke-linecap="round"/>
              <line x1="32" y1="38" x2="32" y2="48" stroke="#dde" stroke-width="3" stroke-linecap="round"/>
              <line x1="44" y1="38" x2="44" y2="48" stroke="#dde" stroke-width="3" stroke-linecap="round"/>
            </svg>`,
    // Mist/Fog
    '50d': `<svg viewBox="0 0 64 64" class="w-full h-full">
              <ellipse cx="32" cy="32" rx="28" ry="20" fill="#999" opacity="0.4"/>
            </svg>`,
    '50n': `<svg viewBox="0 0 64 64" class="w-full h-full">
              <ellipse cx="32" cy="32" rx="28" ry="20" fill="#666" opacity="0.3"/>
            </svg>`
  };
  return svgs[iconCode] || `<svg viewBox="0 0 64 64" class="w-full h-full"><text x="50%" y="50%" text-anchor="middle" fill="red" font-size="16" dy=".3em">?</text></svg>`;
}

// Update current weather icon and background
function updateWeatherIcon(iconCode) {
  iconContainer.innerHTML = getWeatherSVG(iconCode);
  updateSkyBackground(iconCode);
}

// Set dynamic sky background on <body> based on icon code
function updateSkyBackground(iconCode) {
  document.body.classList.remove('clear-day', 'clear-night', 'clouds', 'rain', 'snow', 'thunderstorm', 'mist', 'fog');
  if (iconCode.endsWith('d')) {
    if (iconCode.startsWith('01')) document.body.classList.add('clear-day');
    else if (iconCode.startsWith('02') || iconCode.startsWith('03') || iconCode.startsWith('04')) document.body.classList.add('clouds');
    else if (iconCode.startsWith('09') || iconCode.startsWith('10')) document.body.classList.add('rain');
    else if (iconCode.startsWith('11')) document.body.classList.add('thunderstorm');
    else if (iconCode.startsWith('13')) document.body.classList.add('snow');
    else if (iconCode.startsWith('50')) document.body.classList.add('mist');
  } else {
    if (iconCode.startsWith('01')) document.body.classList.add('clear-night');
    else if (iconCode.startsWith('02') || iconCode.startsWith('03') || iconCode.startsWith('04')) document.body.classList.add('clouds');
    else if (iconCode.startsWith('09') || iconCode.startsWith('10')) document.body.classList.add('rain');
    else if (iconCode.startsWith('11')) document.body.classList.add('thunderstorm');
    else if (iconCode.startsWith('13')) document.body.classList.add('snow');
    else if (iconCode.startsWith('50')) document.body.classList.add('mist');
  }
}

searchButton.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (!city) {
    alert('Please enter a city');
    return;
  }
  if (!cityList.includes(city)) {
    cityList.push(city);
    saveCities();
    displayCityList();
  }
  getWeather(city);
});

function getWeather(city) {
  const apiURL = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
  fetch(apiURL)
    .then(res => res.json())
    .then(data => {
      if (data.cod !== '200') {
        alert('City not found');
        return;
      }
      updateWeatherUI(data);
      showForecast(data);
    })
    .catch(() => alert('Failed to fetch weather data'));
}

function updateWeatherUI(data) {
  const today = data.list[0];
  const iconCode = today.weather[0].icon;
  updateWeatherIcon(iconCode);
  cityName.textContent = `${data.city.name}, ${data.city.country}`;
  temperature.textContent = `${today.main.temp.toFixed(1)}°C`;
  description.textContent = today.weather[0].description;
  humidity.textContent = `Humidity: ${today.main.humidity}%`;
}

function showForecast(data) {
    const container = document.querySelector('.forecast-container');
    container.innerHTML = ""; // Clear previous

    const addedDays = new Set();

    data.list.forEach((item) => {
        const date = new Date(item.dt * 1000);
        const dayStr = date.toLocaleDateString('en-GB', {
            weekday: 'short',
            day: 'numeric',
        });

        if (!addedDays.has(dayStr) && addedDays.size < 5) {
            addedDays.add(dayStr);

            const forecastItem = document.createElement("div");
            forecastItem.className = "flex-1 text-center bg-white/10 rounded-lg p-3";

            forecastItem.innerHTML = `
                <p class="font-semibold">${dayStr}</p>
                <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" class="mx-auto w-12 h-12" />
                <p class="text-lg font-bold">${item.main.temp.toFixed(1)}°C</p>
                <p class="capitalize text-sm">${item.weather[0].description}</p>
            `;

            container.appendChild(forecastItem);
        }
    });
}


// Drag-scroll for forecast container (mouse + touch)
let isDown = false, startX, scrollLeft;
forecastContainer.addEventListener('mousedown', (e) => {
  isDown = true;
  forecastContainer.classList.add('active');
  startX = e.pageX - forecastContainer.offsetLeft;
  scrollLeft = forecastContainer.scrollLeft;
});
forecastContainer.addEventListener('mouseleave', () => {
  isDown = false;
  forecastContainer.classList.remove('active');
});
forecastContainer.addEventListener('mouseup', () => {
  isDown = false;
  forecastContainer.classList.remove('active');
});
forecastContainer.addEventListener('mousemove', (e) => {
  if (!isDown) return;
  e.preventDefault();
  const x = e.pageX - forecastContainer.offsetLeft;
  const walk = (x - startX) * 2;
  forecastContainer.scrollLeft = scrollLeft - walk;
});
// Touch events
forecastContainer.addEventListener('touchstart', (e) => {
  startX = e.touches[0].pageX - forecastContainer.offsetLeft;
  scrollLeft = forecastContainer.scrollLeft;
});
forecastContainer.addEventListener('touchmove', (e) => {
  const x = e.touches[0].pageX - forecastContainer.offsetLeft;
  const walk = (x - startX) * 2;
  forecastContainer.scrollLeft = scrollLeft - walk;
});

// On initial load, display saved cities and use geolocation if available
window.addEventListener('DOMContentLoaded', () => {
  displayCityList();
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => getWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
      () => {
        if (cityList.length > 0) getWeather(cityList[0]);
        else getWeather('New York');
      }
    );
  } else {
    if (cityList.length > 0) getWeather(cityList[0]);
    else getWeather('New York');
  }
});

function getWeatherByCoords(lat, lon) {
  const apiURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  fetch(apiURL)
    .then(res => res.json())
    .then(data => {
      updateWeatherUI(data);
      showForecast(data);
    })
    .catch(error => console.error('Error fetching location-based weather:', error));
}
