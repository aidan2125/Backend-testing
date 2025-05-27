const apiKey = 'f72a4d69395b4d28b475aa8477f8049e';

const searchButton = document.getElementById('searchButton');
const cityInput = document.getElementById('cityInput');
const cityName = document.getElementById('cityName');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');
const humidity = document.getElementById('humidity');
const iconContainer = document.getElementById('weatherIcon');
const cityListContainer = document.getElementById('cityListContainer');
const forecastContainer = document.querySelector('.forecast-container');

function debounce(func, delay) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

let cityList = JSON.parse(localStorage.getItem('savedCities')) || [];

function saveCities() {
  localStorage.setItem('savedCities', JSON.stringify(cityList));
}

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

searchButton.addEventListener('click', debounce(() => {
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
}, 300));

async function getWeather(city) {
  document.getElementById("error-message").textContent = "";

  try {
    const currentRes = await fetch(`https://api.weatherbit.io/v2.0/current?city=${encodeURIComponent(city)}&key=${apiKey}`);
    const currentData = await currentRes.json();
    if (!currentData.data || !currentData.data.length) {
      document.getElementById("error-message").textContent = "City not found.";
      return;
    }

    const current = currentData.data[0];

    const forecastRes = await fetch(`https://api.weatherbit.io/v2.0/forecast/daily?city=${encodeURIComponent(city)}&days=7&key=${apiKey}`);
    const forecastData = await forecastRes.json();

    updateWeatherUI(city, current.country_code, current);
    showForecast(forecastData);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    document.getElementById("error-message").textContent = "Failed to fetch weather data.";
  }
}

function updateWeatherUI(city, country, current) {
  if (!current || !current.weather) {
    document.getElementById("error-message").textContent = "Weather data is unavailable.";
    return;
  }

  updateWeatherIcon(current.weather.icon);
  cityName.textContent = `${city}, ${country}`;
  temperature.textContent = `${current.temp.toFixed(1)}°C`;
  description.textContent = current.weather.description;
  humidity.textContent = `Humidity: ${current.rh}%`;
}

function showForecast(data) {
  forecastContainer.innerHTML = "";

  if (!data.data || !Array.isArray(data.data)) {
    document.getElementById("error-message").textContent = "Forecast data is unavailable.";
    return;
  }

  data.data.forEach((dayData) => {
    const date = new Date(dayData.ts * 1000);
    const dayStr = date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' });

    const forecastItem = document.createElement("div");
    forecastItem.className = "flex-1 text-center bg-white/10 rounded-lg p-3 cursor-pointer";
    forecastItem.innerHTML = `
      <p class="font-semibold">${dayStr}</p>
      <img src="https://www.weatherbit.io/static/img/icons/${dayData.weather.icon}.png" class="mx-auto w-12 h-12" />
      <p class="text-lg font-bold">${dayData.temp.toFixed(1)}°C</p>
      <p class="capitalize text-sm">${dayData.weather.description}</p>
    `;

    forecastItem.onclick = () => showDetailedDay(dayData);
    forecastContainer.appendChild(forecastItem);
  });
}

function showDetailedDay(dayData) {
  const modal = document.getElementById("forecastModal");
  const modalContent = document.getElementById("modalContent");
  const modalDate = document.getElementById("modalDate");

  // Format date
  const date = new Date(dayData.ts * 1000);
  modalDate.textContent = date.toDateString();

  // Insert detailed content
  modalContent.innerHTML = `
    <p><strong>Sunrise:</strong> ${dayData.sunrise}</p>
    <p><strong>Sunset:</strong> ${dayData.sunset}</p>
    <p><strong>UV Index:</strong> ${dayData.uv}</p>
    <p><strong>Wind Speed:</strong> ${dayData.wind_spd.toFixed(1)} m/s</p>
    <p><strong>Humidity:</strong> ${dayData.rh}%</p>
    <p><strong>Pressure:</strong> ${dayData.pres} mb</p>
    <p><strong>Visibility:</strong> ${dayData.vis} km</p>
  `;

  // Show the modal
  modal.style.display = 'flex';
}


// Optional: implement dynamic weather SVGs and background (as in your original code)
function updateWeatherIcon(iconCode) {
  iconContainer.innerHTML = `<img src="https://www.weatherbit.io/static/img/icons/${iconCode}.png" class="w-16 h-16" />`;
  updateSkyBackground(iconCode);
}

function updateSkyBackground(iconCode) {
  document.body.className = ''; // Clear all background classes

  const group = iconCode.substring(0, 2);
  const time = iconCode.endsWith('d') ? 'day' : 'night';

  if (group === '01') document.body.classList.add(`clear-${time}`);
  else if (['02', '03', '04'].includes(group)) document.body.classList.add('clouds');
  else if (['09', '10'].includes(group)) document.body.classList.add('rain');
  else if (group === '11') document.body.classList.add('thunderstorm');
  else if (group === '13') document.body.classList.add('snow');
  else if (group === '50') document.body.classList.add('mist');
}

// Drag-scroll (mouse + touch)
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
forecastContainer.addEventListener('touchstart', (e) => {
  startX = e.touches[0].pageX - forecastContainer.offsetLeft;
  scrollLeft = forecastContainer.scrollLeft;
});
forecastContainer.addEventListener('touchmove', (e) => {
  const x = e.touches[0].pageX - forecastContainer.offsetLeft;
  const walk = (x - startX) * 2;
  forecastContainer.scrollLeft = scrollLeft - walk;
});

// Geolocation-based fetch on load
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

async function getWeatherByCoords(lat, lon) {
  try {
    const reverseGeoRes = await fetch(`https://api.weatherbit.io/v2.0/current?lat=${lat}&lon=${lon}&key=${apiKey}`);
    const reverseGeoData = await reverseGeoRes.json();
    const city = reverseGeoData.data[0].city_name;
    const country = reverseGeoData.data[0].country_code;

    updateWeatherUI(city, country, reverseGeoData.data[0]);

    const forecastRes = await fetch(`https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&days=7&key=${apiKey}`);
    const forecastData = await forecastRes.json();
    showForecast(forecastData);
  } catch (error) {
    console.error("Error fetching location based weather:", error);
    document.getElementById("error-message").textContent = "Location-based weather data is unavailable. Please try again.";
  }
}
