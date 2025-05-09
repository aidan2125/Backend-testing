// liveLocation.js

import { fetchWeatherData } from './weather.js';
import { initializeMap } from './maps.js';
import { planTrip } from './trip.js';
import { findNearbyFood } from './food.js';

export async function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve({ latitude, longitude });
        },
        (error) => reject(error)
      );
    }
  });
}

export async function initializeApp() {
  try {
    const { latitude, longitude } = await getUserLocation();

    // Initialize map
    initializeMap(latitude, longitude);

    // Fetch and display weather data
    const weatherData = await fetchWeatherData(latitude, longitude);
    // Update weather UI here

    // Plan trip based on location
    planTrip(latitude, longitude);

    // Find nearby food options
    findNearbyFood(latitude, longitude);
  } catch (error) {
    console.error('Error initializing application:', error);
  }
}
