// --- Imports ---
import { getCurrentLocationAddress } from './livelocation.js';
import { getCurrentUser, supabase } from './auth.js';
 
// --- Global Variables ---
let map, service, infowindow, currentPosition, currentMarker, restaurantMarkers = [];
let autocomplete, directionsService, directionsRenderer;
let fromInput, toInput, currentTrip = [];
 
// --- Debounce Function ---
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        return new Promise((resolve, reject) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                Promise.resolve(func(...args))
                    .then(resolve)
                    .catch(reject);
            }, wait);
        });
    };
}
 
// --- Unified Map Initialization ---
window.initHubMap = async function () {
    infowindow = new google.maps.InfoWindow();
    const defaultLocation = { lat: 40.7128, lng: -74.0060 };
    const mapElement = document.getElementById("map");
    if (!mapElement) return;
    map = new google.maps.Map(mapElement, { center: defaultLocation, zoom: 14 });

    // Places Service for food search
    service = new google.maps.places.PlacesService(map);

    // Autocomplete for food destination
    const destinationInput = document.getElementById("destination");
    if (destinationInput) {
        autocomplete = new google.maps.places.Autocomplete(destinationInput);
        autocomplete.setFields(['geometry', 'name']);
    }

    // Directions for trip planning
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    fromInput = document.getElementById("from-address");
    toInput = document.getElementById("to-address");
    if (fromInput) new google.maps.places.Autocomplete(fromInput);
    if (toInput) new google.maps.places.Autocomplete(toInput);

    // Autofill "From" input using live location
    if (fromInput) {
        try {
            const address = await getCurrentLocationAddress();
            fromInput.value = address;
        } catch (err) { console.warn("Live location not available:", err); }
    }

    // Try to get user's current location for food
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                currentPosition = { lat: position.coords.latitude, lng: position.coords.longitude };
                map.setCenter(currentPosition);
                currentMarker = new google.maps.Marker({
                    position: currentPosition, map: map, title: "Your Location",
                    icon: { path: google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: "#4285F4", fillOpacity: 1, strokeWeight: 2, strokeColor: "#FFF" }
                });
            },
            () => handleLocationError(true)
        );
    } else {
        handleLocationError(false);
    }

    setupEventListeners();

    // Initialize new features
    await loadUpcomingTrips();
    setupItineraryBuilder();
    setupLiveTravelAssistant();
    setupPackingChecklist();
    setupBudgetSnapshot();
    setupTripNotes();
    setupQuickAccessButtons();

    // Trip event listeners
    const routeBtn = document.getElementById("route-btn");
    if (routeBtn) routeBtn.addEventListener("click", handleRoute);
    const saveBtn = document.getElementById("confirm-save-btn");
    if (saveBtn) saveBtn.addEventListener("click", () => {
        document.dispatchEvent(new CustomEvent('saveTripRequested', { detail: currentTrip }));
    });

    // Expense event listeners
    setupExpenseListeners();
};

// --- New Feature Implementations ---

// Load upcoming trips from Supabase and display in Trip Overview
async function loadUpcomingTrips() {
    const container = document.getElementById('upcoming-trips-container');
    if (!container) return;
    container.innerHTML = '<p>Loading upcoming trips...</p>';
    try {
        const user = await getCurrentUser();
        if (!user) {
            container.innerHTML = '<p>Please log in to see your upcoming trips.</p>';
            return;
        }
        const { data, error } = await supabase
            .from('trip_planner')
            .select('*')
            .eq('profileID', user.profileID)
            .order('start_date', { ascending: true })
            .limit(5);
        if (error) {
            container.innerHTML = '<p>Error loading trips.</p>';
            return;
        }
        if (!data || data.length === 0) {
            container.innerHTML = '<p>No upcoming trips found.</p>';
            return;
        }
        container.innerHTML = '';
        data.forEach(trip => {
            const tripDiv = document.createElement('div');
            tripDiv.className = 'trip-item';
            const startDate = new Date(trip.start_date);
            const now = new Date();
            const diffTime = startDate - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            tripDiv.innerHTML = `
                <strong>${trip.destination}</strong> - ${startDate.toDateString()}<br/>
                Mode: ${trip.travel_mode || 'N/A'}<br/>
                Estimated Cost: $${trip.estimated_cost || 'N/A'}<br/>
                Activities: ${trip.activities || 'None'}<br/>
                <em>Trip starts in ${diffDays} day${diffDays !== 1 ? 's' : ''}</em>
            `;
            container.appendChild(tripDiv);
        });
    } catch (err) {
        container.innerHTML = '<p>Error loading trips.</p>';
        console.error(err);
    }
}

// Placeholder functions for other new features
function setupItineraryBuilder() {
    // TODO: Implement drag-and-drop itinerary builder
}

function setupLiveTravelAssistant() {
    // TODO: Implement live travel assistant widgets
}

function setupPackingChecklist() {
    // TODO: Implement trip packing checklist with auto-generated items
}

function setupBudgetSnapshot() {
    // TODO: Implement budget snapshot pulling data from expenses
}

function setupTripNotes() {
    const saveBtn = document.getElementById('save-notes-btn');
    const notesTextarea = document.getElementById('trip-notes-textarea');
    if (!saveBtn || !notesTextarea) return;

    saveBtn.addEventListener('click', async () => {
        const notes = notesTextarea.value.trim();
        if (!notes) {
            alert('Please enter some notes before saving.');
            return;
        }
        try {
            const user = await getCurrentUser();
            if (!user) {
                alert('Please log in to save notes.');
                return;
            }
            const { error } = await supabase
                .from('trip_notes')
                .upsert({ profileID: user.profileID, notes }, { onConflict: 'profileID' });
            if (error) {
                alert('Failed to save notes.');
            } else {
                alert('Notes saved successfully.');
            }
        } catch (err) {
            alert('Error saving notes.');
            console.error(err);
        }
    });
}

function setupQuickAccessButtons() {
    const weatherBtn = document.getElementById('weather-btn');
    const currencyBtn = document.getElementById('currency-btn');
    const foodBtn = document.getElementById('food-btn');
    const emergencyBtn = document.getElementById('emergency-btn');

    if (weatherBtn) {
        weatherBtn.addEventListener('click', () => {
            window.location.href = 'weather.html';
        });
    }
    if (currencyBtn) {
        currencyBtn.addEventListener('click', () => {
            window.location.href = 'converter.html';
        });
    }
    if (foodBtn) {
        foodBtn.addEventListener('click', () => {
            window.location.href = 'food.html';
        });
    }
    if (emergencyBtn) {
        emergencyBtn.addEventListener('click', () => {
            alert('Emergency Numbers:\nPolice: 911\nAmbulance: 911\nFire: 911');
        });
    }
}
 
// --- Food Functions ---
function setupEventListeners() {
    const currentTab = document.getElementById("current-tab");
    const destinationTab = document.getElementById("destination-tab");
    const searchCurrentBtn = document.getElementById("search-current");
    const searchDestinationBtn = document.getElementById("search-destination");
 
    if (!currentTab || !destinationTab || !searchCurrentBtn || !searchDestinationBtn) return;
 
    const debouncedSearchNearby = debounce(searchNearbyRestaurants, 500);
    const debouncedSearchDestination = debounce(searchDestinationRestaurants, 500);
 
    currentTab.addEventListener("click", () => switchTab("current"));
    destinationTab.addEventListener("click", () => switchTab("destination"));
    searchCurrentBtn.addEventListener("click", debouncedSearchNearby);
    searchDestinationBtn.addEventListener("click", debouncedSearchDestination);
}
 
function switchTab(tabName) {
    const currentTab = document.getElementById("current-tab");
    const destinationTab = document.getElementById("destination-tab");
    const currentSearch = document.getElementById("current-location-search");
    const destinationSearch = document.getElementById("destination-search");
    if (!currentTab || !destinationTab || !currentSearch || !destinationSearch) return;
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
 
function searchNearbyRestaurants(event) {
    event.preventDefault();
    if (!currentPosition) {
        alert("Your location is not available. Please allow location access and try again.");
        return;
    }
    showLoading(true);
    clearResults();
    const cuisineTypeElement = document.getElementById("cuisine-type");
    const distanceElement = document.getElementById("distance");
    if (!cuisineTypeElement || !distanceElement) {
        showLoading(false);
        return;
    }
    const cuisineType = cuisineTypeElement.value;
    const radius = parseInt(distanceElement.value);
    const request = {
        location: new google.maps.LatLng(currentPosition.lat, currentPosition.lng),
        radius: radius,
        type: ['restaurant', 'cafe', 'bar', 'food'],
        keyword: cuisineType,
        openNow: true
    };
    return service.nearbySearch(request)
        .then((results) => {
            if (results && results.length > 0) {
                displayResults(results, currentPosition);
            } else {
                handleEmptyResults();
            }
        })
        .catch((error) => {
            handleEmptyResults();
        })
        .finally(() => {
            showLoading(false);
        });
}
 
function searchDestinationRestaurants(event) {
    event.preventDefault();
    const place = autocomplete.getPlace();
    if (!place || !place.geometry) {
        alert("Please select a valid destination from the dropdown.");
        return;
    }
    showLoading(true);
    clearResults();
    const destinationLocation = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
    };
    map.setCenter(destinationLocation);
    if (currentMarker) currentMarker.setMap(null);
    currentMarker = new google.maps.Marker({
        position: destinationLocation,
        map: map,
        title: place.name || "Destination",
        animation: google.maps.Animation.DROP
    });
    const cuisineTypeElement = document.getElementById("dest-cuisine-type");
    const distanceElement = document.getElementById("dest-distance");
    if (!cuisineTypeElement || !distanceElement) {
        showLoading(false);
        return;
    }
    const cuisineType = cuisineTypeElement.value;
    const radius = parseInt(distanceElement.value);
    const request = {
        location: new google.maps.LatLng(destinationLocation.lat, destinationLocation.lng),
        radius: radius,
        type: ['restaurant', 'cafe', 'bar', 'food'],
        keyword: cuisineType,
        openNow: true
    };
    return service.nearbySearch(request)
        .then((results) => {
            if (results && results.length > 0) {
                displayResults(results, destinationLocation);
            } else {
                handleEmptyResults();
            }
        })
        .catch((error) => {
            handleEmptyResults();
        })
        .finally(() => {
            showLoading(false);
        });
}
 
function displayResults(places, referenceLocation) {
    clearMarkers();
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(referenceLocation);
    const resultsList = document.getElementById("results-list");
    if (!resultsList) return;
    resultsList.innerHTML = "";
    if (places.length === 0) {
        handleEmptyResults();
        return;
    }
    places.forEach((place, i) => {
        const distance = calculateDistance(
            referenceLocation.lat,
            referenceLocation.lng,
            place.geometry.location.lat(),
            place.geometry.location.lng()
        );
        createMarker(place, i + 1);
        addPlaceToList(place, distance, i + 1);
        bounds.extend(place.geometry.location);
    });
    map.fitBounds(bounds);
}
 
function createMarker(place, index) {
    const marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location,
        animation: google.maps.Animation.DROP,
        title: place.name,
        label: { text: String(index), color: "white" }
    });
    marker.addListener("click", () => {
        let content = `
            <div style="padding: 8px; max-width: 300px;">
                <h3 style="margin-top: 0;">${place.name}</h3>
                <p>${place.vicinity}</p>
        `;
        if (place.rating) {
            content += `<p>Rating: ${place.rating} ⭐ (${place.user_ratings_total || 0} reviews)</p>`;
        }
        if (place.opening_hours && place.opening_hours.open_now) {
            content += `<p style="color: green;">Open Now</p>`;
        } else if (place.opening_hours) {
            content += `<p style="color: red;">Closed</p>`;
        }
        if (place.photos && place.photos.length > 0) {
            content += `<img src="${place.photos[0].getUrl({ maxWidth: 250, maxHeight: 150 })}" style="width: 100%; margin-top: 8px;">`;
        }
        content += `<a href="https://www.google.com/maps/place/?q=place_id:${place.place_id}" target="_blank" style="display: block; margin-top: 8px; color: blue; text-decoration: underline;">View on Google Maps</a></div>`;
        infowindow.setContent(content);
        infowindow.open(map, marker);
    });
    restaurantMarkers.push(marker);
}
 
function addPlaceToList(place, distance, index) {
    const resultsList = document.getElementById("results-list");
    if (!resultsList) return;
    const listItem = document.createElement("li");
    listItem.className = "result-item";
    const formattedDistance = distance.toFixed(1);
    let starsHtml = place.rating ? `<div class="star">⭐</div> ${place.rating} (${place.user_ratings_total || 0})` : "No ratings";
    let openStatus = "";
    if (place.opening_hours && place.opening_hours.open_now) {
        openStatus = `<span style="color: green; margin-left: 10px;">Open</span>`;
    } else if (place.opening_hours) {
        openStatus = `<span style="color: red; margin-left: 10px;">Closed</span>`;
    }
    listItem.innerHTML = `
        <div style="margin-right: 15px; font-weight: bold; font-size: 1.2rem;">${index}</div>
        <div class="result-info">
            <div class="result-name">${place.name} ${openStatus}</div>
            <div class="result-address">${place.vicinity}</div>
            <div class="result-rating">${starsHtml}</div>
        </div>
        <div class="distance">${formattedDistance} km</div>
    `;
    listItem.addEventListener("click", () => {
        google.maps.event.trigger(restaurantMarkers[index - 1], "click");
        map.panTo(restaurantMarkers[index - 1].getPosition());
    });
    resultsList.appendChild(listItem);
}
 
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
function deg2rad(deg) { return deg * (Math.PI / 180); }
function clearMarkers() { restaurantMarkers.forEach(marker => marker.setMap(null)); restaurantMarkers = []; infowindow.close(); }
function clearResults() { clearMarkers(); const resultsList = document.getElementById("results-list"); if (resultsList) resultsList.innerHTML = ""; }
function showLoading(show) { const loadingElement = document.getElementById("loading"); if (loadingElement) loadingElement.style.display = show ? "block" : "none"; }
function handleEmptyResults() {
    const resultsList = document.getElementById("results-list");
    if (!resultsList) return;
    resultsList.innerHTML = `<li class="empty-results"><p>No restaurants found. Try changing your search criteria.</p></li>`;
}
function handleLocationError(browserHasGeolocation) {
    alert(browserHasGeolocation
        ? "Error: The Geolocation service failed. Please enable location services."
        : "Error: Your browser doesn't support geolocation.");
}
function gm_authFailure() {
    alert("Google Maps API key error. Please check your API key.");
}
function addFoodEntry(foodItem) { console.log("Adding food:", foodItem); }
function getFoodEntries() { return []; }
 
// --- Trip Functions ---
function calculateCost(distance, mode) {
    const rates = { DRIVING: 0.5, TRANSIT: 0.3, FLYING: 0.8 };
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
        }
    } catch (err) {
        alert('❌ Could not connect to server');
    }
});
function planTrip(origin, destination, mode, activities) {
    console.log("Planning trip:", { origin, destination, mode, activities });
}
function getSavedTrips() { return []; }
 
// --- Expense Functions ---
function setupExpenseListeners() {
    document.addEventListener('DOMContentLoaded', function () {
        const form = document.getElementById('expense-form');
        const list = document.getElementById('expense-list');
        const totalAmount = document.getElementById('total-amount');
        const convertAmount = document.getElementById('convert-amount');
        const fromCurrency = document.getElementById('from-currency');
        const toCurrency = document.getElementById('to-currency');
        const convertedResult = document.getElementById('converted-result');
        const convertBtn = document.getElementById('convertBtn');
        let expenses = [];
        const getDefaultTripId = async (profileID) => {
            const { data, error } = await supabase
                .from('trip_planner')
                .select('trip_id')
                .eq('profileID', profileID)
                .order('start_date', { ascending: false })
                .limit(1);
            if (error) return null;
            return data.length > 0 ? data[0].trip_id : null;
        };
        function renderExpenses() {
            list.innerHTML = '';
            let total = 0;
            expenses.forEach((item, index) => {
                total += item.amount;
                const div = document.createElement('div');
                div.classList.add('expense-item');
                div.innerHTML = `
                    <strong>${item.name}</strong> ($${item.amount.toFixed(2)}) - ${item.category}
                    <button onclick="deleteExpense(${index})">❌</button>
                `;
                list.appendChild(div);
            });
            totalAmount.textContent = total.toFixed(2);
        }
        window.deleteExpense = async (index) => {
            const expense = expenses[index];
            if (!expense) return;
            const { error } = await supabase
                .from('expenses')
                .delete()
                .eq('id', expense.id);
            if (!error) {
                expenses.splice(index, 1);
                renderExpenses();
            }
        };
        if (form) {
            form.addEventListener('submit', async function (e) {
                e.preventDefault();
                const name = document.getElementById('expense-name').value.trim();
                const amount = parseFloat(document.getElementById('expense-amount').value);
                const category = document.getElementById('expense-category').value;
                const location = document.getElementById('expense-location').value.trim() || '';
                const date = document.getElementById('expense-date').value || new Date().toISOString();
                const user = await getCurrentUser();
                if (!user) {
                    alert('Please log in to add expenses.');
                    return;
                }
                const tripId = await getDefaultTripId(user.profileID);
                if (!name || isNaN(amount)) {
                    alert('Please enter a valid expense name and amount.');
                    return;
                }
                const { error } = await supabase
                    .from('expenses')
                    .insert([{
                        name,
                        amount,
                        category,
                        location,
                        date,
                        trip_id: tripId || null,
                        profileID: user.profileID
                    }]);
                if (error) {
                    alert('Failed to add expense.');
                } else {
                    alert('Expense added successfully!');
                    form.reset();
                }
            });
        }
        if (convertBtn) {
            convertBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                const amount = parseFloat(convertAmount.value);
                const from = fromCurrency.value;
                const to = toCurrency.value;
                if (isNaN(amount) || !from || !to) {
                    convertedResult.textContent = 'Please enter valid amount and select currencies.';
                    return;
                }
                try {
                    const response = await fetch(`https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`);
                    const result = await response.json();
                    if (result && typeof result.result === 'number') {
                        convertedResult.textContent = `${amount} ${from} = ${result.result.toFixed(2)} ${to}`;
                    } else {
                        convertedResult.textContent = 'Conversion failed.';
                    }
                } catch (err) {
                    convertedResult.textContent = 'Error fetching rates.';
                }
            });
        }
    });
}
function addExpense(amount, category, date) { console.log("Adding expense:", { amount, category, date }); }
function getExpenses() { return []; }
 
// --- Combined Interface ---
export {
    addFoodEntry, getFoodEntries,
    planTrip, getSavedTrips,
    addExpense, getExpenses,
};
const Hub = {
    addFoodEntry, getFoodEntries,
    planTrip, getSavedTrips,
    addExpense, getExpenses,
};
export default Hub;