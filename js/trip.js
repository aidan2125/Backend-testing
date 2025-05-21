import { getCurrentLocationAddress } from './livelocation.js';

let map, directionsService, directionsRenderer;
let fromInput, toInput;
let currentTrip = {};

window.initMap = async function () {
  if (
    typeof google === "undefined" ||
    !google.maps ||
    !google.maps.Map ||
    !google.maps.DirectionsService ||
    !google.maps.DirectionsRenderer ||
    !google.maps.Geocoder ||
    !google.maps.places ||
    !google.maps.places.Autocomplete
  ) {
    alert("Google Maps JavaScript API is not loaded correctly.");
    return;
  }

  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 20.0, lng: 0.0 },
    zoom: 2,
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);

  fromInput = document.getElementById("from-address");
  toInput = document.getElementById("to-address");

  if (fromInput) new google.maps.places.Autocomplete(fromInput);
  if (toInput) new google.maps.places.Autocomplete(toInput);

  // ✅ Autofill "From" input using live location
  if (fromInput) {
    try {
      const address = await getCurrentLocationAddress();
      fromInput.value = address;
    } catch (err) {
      console.warn("📍 Live location not available:", err);
    }
  }

  const routeBtn = document.getElementById("route-btn");
  if (routeBtn) routeBtn.addEventListener("click", handleRoute);

  const saveBtn = document.getElementById("confirm-save-btn");
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      document.dispatchEvent(new CustomEvent('saveTripRequested', { detail: currentTrip }));
    });
  }
};

function calculateCost(distance, mode) {
  const rates = {
    DRIVING: 0.5,
    TRANSIT: 0.3,
    FLYING: 0.8,
  };
  return distance * (rates[mode] || 0.5);
}

function showSummary(trip) {
  const summaryText = document.getElementById("summary-text");
  if (summaryText) {
    summaryText.innerText = `
From: ${trip.origin}
To: ${trip.destination}
Mode: ${trip.travelMode}
Distance: ${trip.distance.toFixed(2)} km
Estimated Cost: $${trip.cost.toFixed(2)}
Activities: ${trip.activities}
    `.trim();
  }
  const modal = document.getElementById("trip-summary-modal");
  if (modal) modal.style.display = "block";
}

function handleRoute() {
  if (!fromInput || !toInput) return;

  const origin = fromInput.value;
  const destination = toInput.value;
  const travelMode = document.getElementById("travel-mode")?.value;
  const activities = document.getElementById("activities")?.value || "";

  if (!origin || !destination) {
    alert('Please enter both addresses.');
    return;
  }

  if (travelMode === "FLYING") {
    const estimatedDistance = 10000;
    const flyingCost = calculateCost(estimatedDistance, travelMode);

    currentTrip = { origin, destination, activities, travelMode, distance: estimatedDistance, cost: flyingCost };
    showSummary(currentTrip);
    return;
  }

  directionsService.route(
    {
      origin,
      destination,
      travelMode: google.maps.TravelMode[travelMode] || google.maps.TravelMode.DRIVING,
    },
    (response, status) => {
      if (
        status === google.maps.DirectionsStatus.OK &&
        response &&
        response.routes &&
        response.routes[0] &&
        response.routes[0].legs &&
        response.routes[0].legs[0]
      ) {
        directionsRenderer.setDirections(response);
        const distance = response.routes[0].legs[0].distance.value / 1000;
        const routeCost = calculateCost(distance, travelMode);

        currentTrip = { origin, destination, activities, travelMode, distance, cost: routeCost };
        map.setCenter(response.routes[0].legs[0].end_location);
        map.setZoom(10);
        showSummary(currentTrip);
      } else if (status === google.maps.DirectionsStatus.ZERO_RESULTS) {
        alert("No route found. Try switching to FLYING mode.");
      } else {
        alert("Route error: " + status);
        console.error("❌ Route error:", status);
      }
    }
  );
}

document.addEventListener('saveTripRequested', async (e) => {
  const trip = e.detail;

  const userEmail = localStorage.getItem('userEmail');
  
  if (!userEmail) {
    alert('⚠️ User not logged in');
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/savetrip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': userEmail,
      },
      body: JSON.stringify(trip)
    });

    const data = await response.json();

    if (response.ok) {
      alert('✅ Trip saved successfully!');
      const modal = document.getElementById("trip-summary-modal");
      if (modal) modal.style.display = "none";
    } else {
      alert('❌ Failed to save trip: ' + data.message);
      console.error(data);
    }
  } catch (err) {
    console.error('Error saving trip:', err);
    alert('❌ Could not connect to server');
  }
});
