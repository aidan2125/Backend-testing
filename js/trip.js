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

  const saveBtn = document.getElementById("save-btn");
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      document.dispatchEvent(new CustomEvent('saveTripRequested', { detail: currentTrip }));
    });
  }

 const confirmSaveBtn = document.getElementById("confirm-save-btn");
if (confirmSaveBtn) {
  confirmSaveBtn.addEventListener("click", () => {
    console.log("✅ Confirm & Save button clicked");
       console.log("Trip data being saved:", currentTrip);
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
  const profileID = localStorage.getItem('profileID'); // Ensure this is set during login

  if (!userEmail || !profileID) {
    alert('⚠️ Missing user email or profile ID. Please log in again.');
    return;
  }

  // Collect title and dates
  const tripStart = document.getElementById('trip-start')?.value;
  const tripEnd = document.getElementById('trip-end')?.value;
  const title = `${trip.origin} to ${trip.destination}`;

  if (!tripStart || !tripEnd) {
    alert("⚠️ Please enter both trip start and end dates.");
    return;
  }

  try {
    // Geocode destination to get lat/lng
    const geocoder = new google.maps.Geocoder();
    const location = await new Promise((resolve, reject) => {
      geocoder.geocode({ address: trip.destination }, (results, status) => {
        if (status === 'OK' && results[0]) {
          resolve(results[0].geometry.location);
        } else {
          reject(new Error('Geocode failed: ' + status));
        }
      });
    });

    const destinationLat = location.lat();
    const destinationLng = location.lng();

    // ✅ Construct geography point as GeoJSON
    const destination_point = {
      type: 'Point',
      coordinates: [destinationLng, destinationLat]
    };

    // 🔧 Final trip payload
    const tripWithCoords = {
      title,
      origin: trip.origin,
      destination: trip.destination,
      activities: trip.activities,
      travel_mode: trip.travelMode,
      distance: trip.distance,
      estimated_cost: trip.cost,
      start_date: tripStart,
      end_date: tripEnd,
      profileID,
      
    };

    const response = await fetch('http://localhost:3000/api/savetrip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': userEmail,
      },
      body: JSON.stringify(tripWithCoords)
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
    console.error('❌ Trip save error:', err);
    alert('❌ Error saving trip: ' + err.message);
  }
});

