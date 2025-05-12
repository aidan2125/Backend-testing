const weatherForm = document.querySelector(".weatherForm");
const cityInput = document.querySelector(".cityInput");
const card = document.querySelector(".card");
const apiKey = "a0a3fc597b20432fc34aee7fe0c6d97c";

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

    if (!response.ok) {
        throw new Error("Couldn't fetch forecast data");
    }

    return await response.json();
}

function displayFiveDayForecast(data) {
    card.innerHTML = "";
    card.style.display = "grid";
    card.style.gridTemplateColumns = "repeat(5, 1fr)";
    card.style.gap = "1rem";

    const forecastMap = {};

    // Filter to one forecast per day around 12:00 PM
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
            dt_txt
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
    card.innerHTML = "";
    card.style.display = "flex";

    const errorMsg = document.createElement("p");
    errorMsg.textContent = message;
    errorMsg.classList.add("errorDisplay");
    card.appendChild(errorMsg);
}
