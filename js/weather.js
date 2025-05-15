const apiKey = '86f6948b34f7cf32a95cacbb9bffa630';

const searchButton = document.getElementById('searchButton');
const cityInput = document.getElementById('cityInput');
const cityName = document.getElementById('cityName');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');
const humidity = document.getElementById('humidity');

function clearWeatherData() {
    cityName.innerHTML = '';
    temperature.innerHTML = '';
    description.innerHTML = '';
    humidity.innerHTML = '';

    const forecastContainer = document.querySelector('.forecast');
    if (forecastContainer) forecastContainer.remove();
}

searchButton.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (!city) return alert("Please enter a city");
    
    if (!cityList.includes(city)) {
        cityList.push(city);
        displayCityList();
        clearWeatherData();
        getWeather(city);
    } else {
        alert("City is already added");
    }
});

function getWeather(city) {
    const apiURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    fetch(apiURL)
        .then(response => response.json())
        .then(data => {
            if (data.cod === '404') {
                alert("City not found");
            } else {
                updateWeatherUI(data);
                showForecast(data);
            }
        })
       .catch(error => {
    console.error('Error:', error);
    alert('Failed to fetch weather data');
    document.querySelector('.forecast-container')?.remove();
});

}

// Get weather by coordinates (for geolocation)
function getWeatherByCoords(lat, lon) {
    const apiURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    fetch(apiURL)
        .then(response => response.json())
        .then(data => {
            updateWeatherUI(data);
            showForecast(data);
        })
        .catch(error => {
            console.error('Error fetching location-based weather:', error);
        });
}


function updateWeatherUI(data) {
    const today = data.list[0];
    cityName.innerHTML = `${data.city.name}, ${data.city.country}`;
    temperature.innerHTML = `${today.main.temp.toFixed(1)}°C`;
    description.innerHTML = `${today.weather[0].description}`;
    humidity.innerHTML = `Humidity: ${today.main.humidity}%`;

    document.querySelector('.weather-app').classList.add('loaded');
}


function showForecast(data) {
    // Remove any existing forecast container
    const existing = document.querySelector('.forecast-container');
    if (existing) existing.remove();

    const forecastContainer = document.createElement("div");
    forecastContainer.classList.add("forecast-container");
    document.querySelector('.weather-section').appendChild(forecastContainer);

    const addedDays = new Set();

    data.list.forEach((item) => {
        const date = new Date(item.dt * 1000);
        const dayStr = date.toLocaleDateString('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });

        if (!addedDays.has(dayStr) && addedDays.size < 5) {
            addedDays.add(dayStr);

            const forecastItem = document.createElement("div");
            forecastItem.classList.add("forecast-item");
            forecastItem.innerHTML = `
                <p>${dayStr}</p>
                <p>${item.main.temp}°C</p>
                <p>${item.weather[0].description}</p>
            `;
            forecastContainer.appendChild(forecastItem);
        }
    });
}



// Optional: City list tracking
let cityList = [];

function displayCityList() {
    const cityListContainer = document.getElementById("cityListContainer");
    cityListContainer.innerHTML = "";
    cityList.forEach((city) => {
        const cityItem = document.createElement("li");
        cityItem.textContent = city;
        cityListContainer.appendChild(cityItem);
    });
}

// Auto-fetch weather for current location
window.addEventListener('DOMContentLoaded', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                getWeatherByCoords(latitude, longitude);
            },
            (error) => {
                console.warn("Geolocation failed or was denied:", error.message);
            }
        );
    } else {
        console.warn("Geolocation is not supported by this browser.");
    }
});
