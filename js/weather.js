
const weatherForm = document.querySelector(".weatherForm");
const cityInput = document.querySelector(".cityInput");
const card = document.querySelector(".card");
const apiKey = "a0a3fc597b20432fc34aee7fe0c6d97c";

  weatherForm.addEventListener("submit", async event => {
    event.preventDefault();

    const city = cityInput.value;

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
      }
    });

    Object.values(forecastMap).slice(0, 5).forEach(forecast => {
        const {
            main: { temp, humidity },
            weather: [{ description, id }],

        } = forecast;

        const dayCard = document.createElement("div");
        dayCard.classList.add("dayCard");

        const date = new Date(dt_txt).toLocaleDateString(undefined, { weekday: "long" });
        const tempC = `${(temp - 273.15).toFixed(1)} °C`;
        const emoji = getWeatherEmoji(id);

        dayCard.innerHTML = `
            <h3>${date}</h3>
            <p>${emoji}</p>
            <p>${description}</p>
            <p>${tempC}</p>
            <p>Humidity: ${humidity}%</p>
        `;

        card.appendChild(dayCard);
    });
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
    card.style.display = "flex";
    errorDisplay.textContent = message;
  }
});
