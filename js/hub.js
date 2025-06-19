import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Initialize Supabase
const supabaseUrl = "https://lmtvzmagwdegwravdcue.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtdHZ6bWFnd2RlZ3dyYXZkY3VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0OTMzMTYsImV4cCI6MjA2MTA2OTMxNn0.Kc7eVAIdPTSOnCBaMpFowYBPBjuBgkwyJA6nZD-F2yU";
const supabase = createClient(supabaseUrl, supabaseKey);

const profileID = localStorage.getItem("profileID");

// Enhanced Map & Routing Variables
let map, directionsService, directionsRenderer, placesService;
let fromInput, toInput, currentLocationInput, destinationInput;
let currentTrip = {};
let userLocation = null;
let mapMarkers = [];
let autocompleteServices = {};

// Initialize the enhanced map
window.initHubMap = function () {
  console.log("🗺️ Initializing Travel Hub Map...");

  try {
    // Default location (will be overridden with user location)
    const defaultLocation = { lat: -26.2041, lng: 28.0473 }; // Johannesburg

    // Create the map with modern styling
    const mapElement = document.getElementById("map");
    if (!mapElement) {
      console.error("❌ Map element not found");
      return;
    }

    map = new google.maps.Map(mapElement, {
      center: defaultLocation,
      zoom: 12,
      styles: [
        {
          featureType: "all",
          elementType: "geometry.fill",
          stylers: [{ color: "#f5f7fa" }],
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#ffffff" }],
        },
        {
          featureType: "road",
          elementType: "geometry.stroke",
          stylers: [{ color: "#e0e7ff" }],
        },
        {
          featureType: "poi",
          elementType: "geometry.fill",
          stylers: [{ color: "#e8f4f8" }],
        },
        {
          featureType: "water",
          elementType: "geometry.fill",
          stylers: [{ color: "#64b5f6" }],
        },
      ],
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_BOTTOM,
      },
    });

    // Initialize services
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
      draggable: true,
      polylineOptions: {
        strokeColor: "#ff6b35",
        strokeWeight: 4,
        strokeOpacity: 0.8,
      },
    });
    directionsRenderer.setMap(map);
    placesService = new google.maps.places.PlacesService(map);

    // Set up input elements
    setupInputElements();

    // Set up event listeners
    setupMapEventListeners();

    // Get user location
    getCurrentLocation();

    console.log("✅ Travel Hub Map initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing map:", error);
    showToast("Failed to initialize map", "error");
  }
};

// Setup input elements and autocomplete
function setupInputElements() {
  // Location search inputs
  currentLocationInput = document.getElementById("current-location-search");
  destinationInput = document.getElementById("destination-search");

  // Trip planner inputs
  fromInput = document.getElementById("from-address");
  toInput = document.getElementById("to-address");

  // Set up autocomplete for all inputs
  if (currentLocationInput) {
    autocompleteServices.current = new google.maps.places.Autocomplete(
      currentLocationInput,
      {
        types: ["geocode", "establishment"],
        componentRestrictions: { country: "za" },
      },
    );

    autocompleteServices.current.addListener("place_changed", () => {
      const place = autocompleteServices.current.getPlace();
      if (place.geometry) {
        updateMapLocation(
          place.geometry.location,
          place.name || "Selected Location",
        );
      }
    });
  }

  if (destinationInput) {
    autocompleteServices.destination = new google.maps.places.Autocomplete(
      destinationInput,
      {
        types: ["geocode", "establishment"],
        componentRestrictions: { country: "za" },
      },
    );

    autocompleteServices.destination.addListener("place_changed", () => {
      const place = autocompleteServices.destination.getPlace();
      if (place.geometry) {
        updateMapLocation(place.geometry.location, place.name || "Destination");
      }
    });
  }

  if (fromInput) {
    autocompleteServices.from = new google.maps.places.Autocomplete(fromInput, {
      types: ["geocode", "establishment"],
    });
  }

  if (toInput) {
    autocompleteServices.to = new google.maps.places.Autocomplete(toInput, {
      types: ["geocode", "establishment"],
    });
  }
}

// Setup map event listeners
function setupMapEventListeners() {
  // Tab switching
  const currentTab = document.getElementById("current-tab");
  const destinationTab = document.getElementById("destination-tab");

  if (currentTab && destinationTab) {
    currentTab.addEventListener("click", () => switchLocationTab("current"));
    destinationTab.addEventListener("click", () =>
      switchLocationTab("destination"),
    );
  }

  // Map control buttons
  const currentLocationBtn = document.getElementById("currentLocationBtn");
  const fullscreenMapBtn = document.getElementById("fullscreenMapBtn");

  if (currentLocationBtn) {
    currentLocationBtn.addEventListener("click", getCurrentLocation);
  }

  if (fullscreenMapBtn) {
    fullscreenMapBtn.addEventListener("click", toggleFullscreenMap);
  }

  // Route button
  const routeBtn = document.getElementById("route-btn");
  if (routeBtn) {
    routeBtn.addEventListener("click", handleRoute);
  }

  // Save trip button
  const confirmSaveBtn = document.getElementById("confirm-save-btn");
  if (confirmSaveBtn) {
    confirmSaveBtn.addEventListener("click", saveTrip);
  }

  // Search button
  const searchBtn = document.querySelector(".search-btn");
  if (searchBtn) {
    searchBtn.addEventListener("click", handleLocationSearch);
  }
}

// Switch between location tabs
function switchLocationTab(tabName) {
  const currentTab = document.getElementById("current-tab");
  const destinationTab = document.getElementById("destination-tab");
  const currentSearch = document.getElementById("current-location-search");
  const destinationSearch = document.getElementById("destination-search");

  if (!currentTab || !destinationTab || !currentSearch || !destinationSearch) {
    console.error("❌ Tab elements not found");
    return;
  }

  if (tabName === "current") {
    currentTab.classList.add("active");
    destinationTab.classList.remove("active");
    currentSearch.style.display = "block";
    destinationSearch.style.display = "none";
  } else {
    currentTab.classList.remove("active");
    destinationTab.classList.add("active");
    currentSearch.style.display = "none";
    destinationSearch.style.display = "block";
  }
}

// Get current location
function getCurrentLocation() {
  showToast("Getting your location...", "info");

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        updateMapLocation(userLocation, "Your Current Location");
        showToast("Location found successfully!", "success");
      },
      (error) => {
        console.error("❌ Geolocation error:", error);
        handleLocationError(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  } else {
    handleLocationError(false);
  }
}

// Handle location errors
function handleLocationError(browserHasGeolocation) {
  const errorMessage = browserHasGeolocation
    ? "Error: The Geolocation service failed. Please enable location services."
    : "Error: Your browser doesn't support geolocation.";

  showToast(errorMessage, "error");

  // Set default location
  const defaultLocation = { lat: -26.2041, lng: 28.0473 };
  updateMapLocation(defaultLocation, "Default Location (Johannesburg)");
}

// Update map location
function updateMapLocation(location, title = "Location") {
  if (!map) return;

  // Clear existing markers
  clearMapMarkers();

  // Center map on location
  map.setCenter(location);
  map.setZoom(14);

  // Add marker
  const marker = new google.maps.Marker({
    position: location,
    map: map,
    title: title,
    animation: google.maps.Animation.DROP,
    icon: {
      url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ff6b35'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E",
      scaledSize: new google.maps.Size(30, 30),
    },
  });

  mapMarkers.push(marker);

  // Show info window
  const infoWindow = new google.maps.InfoWindow({
    content: `<div style="padding: 10px; text-align: center;"><strong>${title}</strong></div>`,
  });

  infoWindow.open(map, marker);
}

// Clear map markers
function clearMapMarkers() {
  mapMarkers.forEach((marker) => marker.setMap(null));
  mapMarkers = [];
}

// Handle location search
function handleLocationSearch() {
  const currentTab = document.querySelector(".tab-btn.active");
  const isCurrentLocation = currentTab && currentTab.id === "current-tab";

  const searchInput = isCurrentLocation
    ? currentLocationInput
    : destinationInput;
  const query = searchInput?.value.trim();

  if (!query) {
    showToast("Please enter a location to search", "error");
    return;
  }

  // Use Places API to search
  const request = {
    query: query,
    fields: ["name", "geometry", "formatted_address"],
  };

  placesService.findPlaceFromQuery(request, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK && results[0]) {
      const place = results[0];
      updateMapLocation(place.geometry.location, place.name);
      showToast(`Found: ${place.name}`, "success");
    } else {
      showToast("Location not found", "error");
    }
  });
}

// Toggle fullscreen map
function toggleFullscreenMap() {
  const mapCard = document.querySelector(".map-card");
  const mapContainer = document.querySelector(".map-container");

  if (mapCard && mapContainer) {
    if (mapCard.classList.contains("fullscreen")) {
      mapCard.classList.remove("fullscreen");
      mapContainer.style.height = "300px";
      showToast("Exited fullscreen", "info");
    } else {
      mapCard.classList.add("fullscreen");
      mapContainer.style.height = "70vh";
      showToast("Entered fullscreen", "info");
    }

    // Trigger map resize
    setTimeout(() => {
      google.maps.event.trigger(map, "resize");
    }, 100);
  }
}

// Enhanced route calculation
async function handleRoute() {
  const origin = fromInput?.value.trim();
  const destination = toInput?.value.trim();
  const travelMode = document.getElementById("travel-mode")?.value;

  if (!origin || !destination) {
    showToast("Please enter both starting point and destination.", "error");
    return;
  }

  showToast("Calculating route...", "info");

  if (travelMode === "FLYING") {
    // Handle flying routes differently
    await handleFlightRoute(origin, destination);
    return;
  }

  // Handle driving/transit routes
  const request = {
    origin: origin,
    destination: destination,
    travelMode:
      google.maps.TravelMode[travelMode] || google.maps.TravelMode.DRIVING,
    unitSystem: google.maps.UnitSystem.METRIC,
    avoidHighways: false,
    avoidTolls: false,
  };

  directionsService.route(request, (response, status) => {
    if (status === google.maps.DirectionsStatus.OK) {
      directionsRenderer.setDirections(response);

      const route = response.routes[0];
      const leg = route.legs[0];
      const distance = leg.distance.value / 1000; // km
      const duration = leg.duration.text;

      const cost = calculateCost(distance, travelMode);
      const activities = document.getElementById("activities")?.value || "";

      currentTrip = {
        from: origin,
        destination: destination,
        activities: activities,
        travelMode: travelMode,
        distance: distance,
        duration: duration,
        cost: cost,
        route: response,
      };

      showTripSummary();
      showToast(
        `Route calculated: ${distance.toFixed(1)}km, ${duration}`,
        "success",
      );
    } else {
      console.error("❌ Directions request failed:", status);

      if (status === google.maps.DirectionsStatus.ZERO_RESULTS) {
        showToast("No route found. Try switching to flying mode.", "error");
      } else {
        showToast(`Route calculation failed: ${status}`, "error");
      }
    }
  });
}

// Handle flight routes
async function handleFlightRoute(origin, destination) {
  try {
    // Use geocoding to get coordinates
    const geocoder = new google.maps.Geocoder();

    const originResult = await geocodeAddress(geocoder, origin);
    const destResult = await geocodeAddress(geocoder, destination);

    if (originResult && destResult) {
      const distance = calculateFlightDistance(
        originResult.geometry.location.lat(),
        originResult.geometry.location.lng(),
        destResult.geometry.location.lat(),
        destResult.geometry.location.lng(),
      );

      const cost = calculateCost(distance, "FLYING");
      const activities = document.getElementById("activities")?.value || "";

      currentTrip = {
        from: origin,
        destination: destination,
        activities: activities,
        travelMode: "FLYING",
        distance: distance,
        duration: "Varies by airline",
        cost: cost,
      };

      // Draw flight path on map
      drawFlightPath(
        originResult.geometry.location,
        destResult.geometry.location,
      );

      showTripSummary();
      showToast(`Flight distance: ${distance.toFixed(0)}km`, "success");
    }
  } catch (error) {
    console.error("❌ Flight route error:", error);
    showToast("Failed to calculate flight route", "error");
  }
}

// Geocode address helper
function geocodeAddress(geocoder, address) {
  return new Promise((resolve, reject) => {
    geocoder.geocode({ address: address }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK) {
        resolve(results[0]);
      } else {
        reject(status);
      }
    });
  });
}

// Calculate flight distance
function calculateFlightDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// Draw flight path
function drawFlightPath(origin, destination) {
  // Clear previous directions
  directionsRenderer.setDirections({ routes: [] });

  // Create flight path polyline
  const flightPath = new google.maps.Polyline({
    path: [origin, destination],
    geodesic: true,
    strokeColor: "#ff6b35",
    strokeOpacity: 1.0,
    strokeWeight: 3,
    icons: [
      {
        icon: {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: "#ff6b35",
          fillOpacity: 1,
          strokeWeight: 0,
        },
        offset: "50%",
      },
    ],
  });

  flightPath.setMap(map);

  // Add markers
  new google.maps.Marker({
    position: origin,
    map: map,
    title: "Origin",
    icon: {
      url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%232196f3'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E",
      scaledSize: new google.maps.Size(25, 25),
    },
  });

  new google.maps.Marker({
    position: destination,
    map: map,
    title: "Destination",
    icon: {
      url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ff6b35'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E",
      scaledSize: new google.maps.Size(25, 25),
    },
  });

  // Fit bounds to show both markers
  const bounds = new google.maps.LatLngBounds();
  bounds.extend(origin);
  bounds.extend(destination);
  map.fitBounds(bounds);
}

// Enhanced cost calculation
function calculateCost(distance, mode) {
  const rates = {
    DRIVING: 2.5, // R2.50 per km (fuel + wear)
    TRANSIT: 0.8, // R0.80 per km (public transport)
    FLYING: 4.5, // R4.50 per km (budget airline estimate)
    WALKING: 0,
    BICYCLING: 0.1,
  };

  const baseRate = rates[mode] || rates.DRIVING;
  const baseCost = distance * baseRate;

  // Add some overhead for longer distances
  const overhead = distance > 100 ? baseCost * 0.15 : 0;

  return baseCost + overhead;
}

// Show enhanced trip summary
function showTripSummary() {
  const modal = document.getElementById("trip-summary-modal");
  const summaryText = document.getElementById("summary-text");

  if (!modal || !summaryText) return;

  const summary = `
🚀 TRIP SUMMARY

📍 From: ${currentTrip.from}
📍 To: ${currentTrip.destination}
🚗 Mode: ${getTravelModeIcon(currentTrip.travelMode)} ${currentTrip.travelMode}
📏 Distance: ${currentTrip.distance.toFixed(1)} km
⏱️ Duration: ${currentTrip.duration || "Estimated"}
💰 Estimated Cost: R${currentTrip.cost.toFixed(2)}
🎯 Activities: ${currentTrip.activities || "None specified"}

---
💡 Cost includes fuel, tolls, and estimated expenses
⚠️ Actual costs may vary based on current rates
    `.trim();

  summaryText.textContent = summary;
  modal.style.display = "block";
}

// Get travel mode icon
function getTravelModeIcon(mode) {
  const icons = {
    DRIVING: "🚗",
    TRANSIT: "🚌",
    FLYING: "✈️",
    WALKING: "🚶",
    BICYCLING: "🚴",
  };
  return icons[mode] || "🚗";
}

// Enhanced trip saving
async function saveTrip() {
  const modal = document.getElementById("trip-summary-modal");
  if (modal) modal.style.display = "none";

  showToast("Saving trip...", "info");

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      showToast("Please log in to save a trip.", "error");
      return;
    }

    const { data: profileData, error: profileError } = await supabase
      .from("signup")
      .select("profileID")
      .eq("email", user.email)
      .single();

    if (profileError || !profileData) {
      showToast("Profile not found.", "error");
      return;
    }

    const activitiesArray = currentTrip.activities
      ? currentTrip.activities.split(",").map((a) => a.trim())
      : [];

    const tripPayload = {
      profileID: profileData.profileID,
      origin: currentTrip.from,
      destination: currentTrip.destination,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days later
      travel_mode: currentTrip.travelMode,
      distance: currentTrip.distance,
      estimated_cost: currentTrip.cost,
      activities: activitiesArray,
    };

    const { error: insertError } = await supabase
      .from("trip_planner")
      .insert([tripPayload]);

    if (insertError) {
      console.error("❌ Error saving trip:", insertError.message);
      showToast("Failed to save trip.", "error");
    } else {
      showToast("✅ Trip saved successfully!", "success");
      // Refresh trips display
      fetchTrips();
    }
  } catch (error) {
    console.error("❌ Save trip error:", error);
    showToast("An error occurred while saving.", "error");
  }
}

// Enhanced fetch trips with better display
async function fetchTrips() {
  try {
    const { data: trips, error } = await supabase
      .from("trip_planner")
      .select("*")
      .eq("profileID", profileID)
      .order("start_date", { ascending: true });

    const container = document.getElementById("upcoming-trips-container");
    if (error || !container) {
      console.error("❌ Error fetching trips:", error?.message);
      return;
    }

    if (!trips.length) {
      container.innerHTML = `
                <div class="loading-placeholder">
                    <i class="fas fa-calendar-plus"></i>
                    <span>No trips planned yet. Create your first trip!</span>
                </div>
            `;
      return;
    }

    container.innerHTML = "";
    trips.forEach((trip) => {
      const tripCard = document.createElement("div");
      tripCard.classList.add("trip-card");

      const startDate = new Date(trip.start_date).toLocaleDateString();
      const endDate = new Date(trip.end_date).toLocaleDateString();

      tripCard.innerHTML = `
                <h3><i class="fas fa-map-marker-alt"></i> ${trip.destination}</h3>
                <p><strong>From:</strong> ${trip.origin || "Not specified"}</p>
                <p><strong>Dates:</strong> ${startDate} - ${endDate}</p>
                <p><strong>Mode:</strong> ${getTravelModeIcon(trip.travel_mode)} ${trip.travel_mode}</p>
                <p><strong>Distance:</strong> ${trip.distance ? trip.distance.toFixed(1) + " km" : "N/A"}</p>
                <p><strong>Estimated Cost:</strong> R${trip.estimated_cost ? trip.estimated_cost.toFixed(2) : "N/A"}</p>
                ${
                  trip.activities && trip.activities.length > 0
                    ? `<p><strong>Activities:</strong> ${trip.activities.join(", ")}</p>`
                    : ""
                }
            `;
      container.appendChild(tripCard);
    });
  } catch (error) {
    console.error("❌ Fetch trips error:", error);
  }
}

// Enhanced notes saving
async function saveTripNotes(notes) {
  try {
    showToast("Saving notes...", "info");

    const { error } = await supabase
      .from("trip_notes")
      .upsert({ profileID, notes });

    if (error) {
      console.error("❌ Error saving notes:", error.message);
      showToast("Failed to save notes", "error");
    } else {
      showToast("Notes saved successfully!", "success");
    }
  } catch (error) {
    console.error("❌ Save notes error:", error);
    showToast("An error occurred", "error");
  }
}

// Fetch trip notes
async function fetchTripNotes() {
  try {
    const { data, error } = await supabase
      .from("trip_notes")
      .select("notes")
      .eq("profileID", profileID)
      .maybeSingle();

    const textarea = document.getElementById("trip-notes-textarea");
    if (!error && data && textarea) {
      textarea.value = data.notes || "";
    }
  } catch (error) {
    console.error("❌ Fetch notes error:", error);
  }
}

// Enhanced budget snapshot
async function fetchBudgetSnapshot() {
  try {
    const { data, error } = await supabase
      .from("trip_expenses")
      .select("category, amount")
      .eq("profileID", profileID);

    const summary = document.getElementById("budget-summary");
    if (error || !summary) {
      console.error("❌ Error fetching budget:", error?.message);
      return;
    }

    if (!data || data.length === 0) {
      summary.innerHTML = `
                <div class="loading-placeholder">
                    <i class="fas fa-chart-pie"></i>
                    <span>No expenses tracked yet</span>
                </div>
            `;
      return;
    }

    // Group expenses by category and calculate totals
    const categoryTotals = data.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    const totalAmount = Object.values(categoryTotals).reduce(
      (sum, amount) => sum + amount,
      0,
    );

    summary.innerHTML =
      Object.entries(categoryTotals)
        .map(
          ([category, amount]) => `
            <div class="budget-item">
                <span>${category}</span>
                <span>R${amount.toFixed(2)}</span>
            </div>
        `,
        )
        .join("") +
      `
            <div class="budget-item" style="border-top: 2px solid var(--primary-orange); margin-top: 10px; padding-top: 15px;">
                <span><strong>Total</strong></span>
                <span><strong>R${totalAmount.toFixed(2)}</strong></span>
            </div>
        `;
  } catch (error) {
    console.error("❌ Fetch budget error:", error);
  }
}

// Enhanced packing list
async function fetchPackingList() {
  try {
    const { data, error } = await supabase
      .from("packing_list")
      .select("*")
      .eq("profileID", profileID)
      .order("packed", { ascending: true });

    const list = document.getElementById("packing-list");
    if (error || !list) {
      console.error("❌ Error fetching packing list:", error?.message);
      return;
    }

    if (!data || data.length === 0) {
      list.innerHTML = `
                <li>
                    <div class="loading-placeholder">
                        <i class="fas fa-suitcase"></i>
                        <span>No packing items yet</span>
                    </div>
                </li>
            `;
      return;
    }

    list.innerHTML = "";
    data.forEach((item) => {
      const li = document.createElement("li");
      li.innerHTML = `
                <input type="checkbox" ${item.packed ? "checked" : ""} 
                       onchange="updatePackingItem('${item.id}', this.checked)"/>
                <label>${item.item}</label>
            `;
      list.appendChild(li);
    });
  } catch (error) {
    console.error("❌ Fetch packing list error:", error);
  }
}

// Update packing item
window.updatePackingItem = async function (itemId, packed) {
  try {
    const { error } = await supabase
      .from("packing_list")
      .update({ packed })
      .eq("id", itemId);

    if (error) {
      console.error("❌ Error updating packing item:", error);
    } else {
      showToast(packed ? "Item packed!" : "Item unpacked", "success");
    }
  } catch (error) {
    console.error("❌ Update packing item error:", error);
  }
};

// Enhanced currency functions
async function populateCurrencyDropdowns() {
  const fromCurrency = document.getElementById("from-currency");
  const toCurrency = document.getElementById("to-currency");

  if (!fromCurrency || !toCurrency) {
    console.error("❌ Missing currency select elements");
    return;
  }

  try {
    const res = await fetch("https://api.exchangerate.host/symbols");
    const { symbols } = await res.json();

    // Popular currencies first
    const popularCurrencies = [
      "USD",
      "EUR",
      "GBP",
      "ZAR",
      "JPY",
      "CAD",
      "AUD",
      "CHF",
    ];
    const otherCurrencies = Object.keys(symbols)
      .filter((code) => !popularCurrencies.includes(code))
      .sort();

    const orderedCurrencies = [...popularCurrencies, ...otherCurrencies];

    orderedCurrencies.forEach((code) => {
      if (symbols[code]) {
        const option1 = document.createElement("option");
        option1.value = code;
        option1.text = `${code} - ${symbols[code].description}`;
        fromCurrency.appendChild(option1);

        const option2 = document.createElement("option");
        option2.value = code;
        option2.text = `${code} - ${symbols[code].description}`;
        toCurrency.appendChild(option2);
      }
    });

    // Set defaults
    fromCurrency.value = "USD";
    toCurrency.value = "ZAR";
  } catch (err) {
    console.error("❌ Failed to fetch currency symbols", err);
    showToast("Failed to load currencies", "error");
  }
}

// Enhanced currency converter
function setupCurrencyConverter() {
  const convertBtn = document.getElementById("convertBtn");
  const converterForm = document.getElementById("converter-form");

  if (converterForm) {
    converterForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const amount = parseFloat(
        document.getElementById("convert-amount").value,
      );
      const from = document.getElementById("from-currency").value;
      const to = document.getElementById("to-currency").value;
      const resultDiv = document.getElementById("converted-result");

      if (isNaN(amount) || !from || !to) {
        resultDiv.textContent =
          "Please enter valid amount and select currencies.";
        resultDiv.style.color = "var(--danger)";
        return;
      }

      resultDiv.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Converting...';
      resultDiv.style.color = "var(--text-muted)";

      try {
        const response = await fetch(
          `https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`,
        );
        const result = await response.json();

        if (result && typeof result.result === "number") {
          resultDiv.innerHTML = `
                        <strong>${amount} ${from} = ${result.result.toFixed(2)} ${to}</strong>
                        <br><small>Rate: 1 ${from} = ${(result.result / amount).toFixed(4)} ${to}</small>
                    `;
          resultDiv.style.color = "var(--text-dark)";
          showToast("Currency converted successfully!", "success");
        } else {
          resultDiv.textContent = "Conversion failed. Please try again.";
          resultDiv.style.color = "var(--danger)";
        }
      } catch (err) {
        console.error("❌ Currency conversion error:", err);
        resultDiv.textContent = "Error fetching exchange rates.";
        resultDiv.style.color = "var(--danger)";
        showToast("Failed to convert currency", "error");
      }
    });
  }
}

// Toast notification function
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
        <i class="fas fa-${type === "error" ? "exclamation-circle" : type === "success" ? "check-circle" : "info-circle"}"></i>
        <span>${message}</span>
    `;

  const container = document.getElementById("toastContainer");
  if (container) {
    container.appendChild(toast);

    setTimeout(() => toast.classList.add("active"), 100);
    setTimeout(() => {
      toast.classList.remove("active");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Travel Hub initializing...");

  // Fetch initial data
  if (profileID) {
    fetchTrips();
    fetchTripNotes();
    fetchBudgetSnapshot();
    fetchPackingList();
  }

  // Setup currency converter
  populateCurrencyDropdowns().then(setupCurrencyConverter);

  // Notes save button
  const notesBtn = document.getElementById("save-notes-btn");
  if (notesBtn) {
    notesBtn.addEventListener("click", () => {
      const notes = document.getElementById("trip-notes-textarea")?.value || "";
      saveTripNotes(notes);
    });
  }

  console.log("✅ Travel Hub initialized successfully");
});
