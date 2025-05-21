// map.js
// --- Removed Supabase code (moved to backend) ---

let map, directionsService, directionsRenderer;
let fromInput, toInput;
let currentTrip = {};

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 20.0, lng: 0.0 },
    zoom: 2,
  });

  // Center map on user's location if available
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        map.setCenter(userLocation);
        map.setZoom(12);
      }
    );
  }

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);

  fromInput = document.getElementById("from-address");
  toInput = document.getElementById("to-address");

  if (fromInput) new google.maps.places.Autocomplete(fromInput);
  if (toInput) new google.maps.places.Autocomplete(toInput);

  const routeBtn = document.getElementById("route-btn");
  if (routeBtn) routeBtn.addEventListener("click", handleRoute);

  const saveBtn = document.getElementById("confirm-save-btn");
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      document.dispatchEvent(new CustomEvent('saveTripRequested', { detail: currentTrip }));
    });
  }
}



function calculateCost(distance, mode) {
  const rates = {
    DRIVING: 0.5,
    TRANSIT: 0.3,
    FLYING: 0.8,
  };
  return distance * (rates[mode] || 0.5);
}

function showSummary(trip) {
  document.getElementById("summary-text").innerText = `
From: ${trip.from}
To: ${trip.destination}
Mode: ${trip.travelMode}
Distance: ${trip.distance.toFixed(2)} km
Estimated Cost: $${trip.cost.toFixed(2)}
Activities: ${trip.activities}
  `.trim();

  document.getElementById("trip-summary-modal").style.display = "block";
}

function handleRoute() {
  const origin = fromInput.value;
  const destination = toInput.value;
  const travelMode = document.getElementById("travel-mode").value;
  const activities = document.getElementById("activities").value;

  if (!origin || !destination) {
    alert('Please enter both addresses.');
    return;
  }

  if (travelMode === "FLYING") {
    const estimatedDistance = 10000;
    const cost = calculateCost(estimatedDistance, travelMode);

    currentTrip = { from: origin, destination, activities, travelMode, distance: estimatedDistance, cost };
    showSummary(currentTrip);
    return;
  }

  // Only allow valid Google Maps travel modes
  const validModes = ["DRIVING", "TRANSIT", "WALKING", "BICYCLING"];
  const gmTravelMode = validModes.includes(travelMode) ? google.maps.TravelMode[travelMode] : google.maps.TravelMode.DRIVING;

  directionsService.route(
    {
      origin,
      destination,
      travelMode: gmTravelMode,
    },
    (response, status) => {
      if (
        status === google.maps.DirectionsStatus.OK &&
        response.routes &&
        response.routes[0] &&
        response.routes[0].legs &&
        response.routes[0].legs[0]
      ) {
        directionsRenderer.setDirections(response);
        const distance = response.routes[0].legs[0].distance.value / 1000;
        const cost = calculateCost(distance, travelMode);

        currentTrip = { from: origin, destination, activities, travelMode, distance, cost };

        map.setCenter(response.routes[0].legs[0].end_location);
        map.setZoom(10);

        showSummary(currentTrip);
      } else if (status === google.maps.DirectionsStatus.ZERO_RESULTS) {
        alert("No drivable route found. Try switching to FLYING mode.");
      } else {
        alert("Route error: " + status);
        console.error("❌ Route error:", status);
      }
    }
  );
}

window.initMap = initMap;
