// liveLocation.js

import { fetchWeatherData } from './weather.js';
import { initializeMap } from './map.js';
import { planTrip } from './trip.js';
import { findNearbyFood } from './food.js';

export async function getCurrentLocationAddress() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
    } 
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const geocoder = new google.maps.Geocoder();

        geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
          if (status === 'OK' && results[0]) {
            resolve(results[0].formatted_address);
          } else {
            reject('Geocoder failed: ' + status);
          }
        });
      },
      (error) => reject('Geolocation error: ' + error.message)
    );
  });
}
export async function initializeApp() {
  try {
    const { latitude, longitude } = await getUserLocation();

    // Initialize map with user's location
    initializeMap(latitude, longitude);

    // Fetch and display weather data
    const weatherData = await fetchWeatherData(latitude, longitude);
    const weatherElement = document.getElementById('weather-info');
    if (weatherData && weatherElement) {
      weatherElement.textContent = `Current weather: ${weatherData.summary}, ${weatherData.temperature}°C`;
    }

    // Plan trip using trip.js with user's location
    planTrip({ latitude, longitude });

    // Show loading indicator
    const loadingEl = document.getElementById("loading");
    if (loadingEl) loadingEl.style.display = "block";

    // Find nearby food options using user's location
    await findNearbyFood(latitude, longitude);

    // Hide loading indicator after loading finishes
    if (loadingEl) loadingEl.style.display = "none";

    // Save last location
    localStorage.setItem("lastLocation", JSON.stringify({ latitude, longitude }));

  } catch (error) {
    console.error('Error initializing application:', error);

    // Fallback to a default location (London)
    const fallbackLocation = { latitude: 51.5074, longitude: -0.1278 };
    initializeMap(fallbackLocation.latitude, fallbackLocation.longitude);

    const weatherData = await fetchWeatherData(fallbackLocation.latitude, fallbackLocation.longitude);
    const weatherElement = document.getElementById('weather-info');
    if (weatherData && weatherElement) {
      weatherElement.textContent = `Current weather: ${weatherData.summary}, ${weatherData.temperature}°C (default location)`;
    }
    alert("Location access denied or unavailable. Defaulting to a predefined location.");
  }
}

// Initialize map with last saved location if available
const savedCoords = JSON.parse(localStorage.getItem("lastLocation"));
if (savedCoords) {
  initializeMap(savedCoords.latitude, savedCoords.longitude);
}