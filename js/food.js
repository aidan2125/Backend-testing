 //Global variables
let map;
let service;
let infowindow;
let currentPosition;
let currentMarker;
let restaurantMarkers = [];
let autocomplete;
 
// Debounce function to limit rapid consecutive searches, preserving Promise return
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
 
// Initialize the map and related services
function initMap() {
    // Create a new info window for markers
    infowindow = new google.maps.InfoWindow();
   
    // Default location (will be overridden with user's location)
    const defaultLocation = { lat: 40.7128, lng: -74.0060 }; // New York City
   
    // Create the map centered at the default location
    const mapElement = document.getElementById("map");
    if (!mapElement) {
        console.error("Map element not found");
        return;
    }
    map = new google.maps.Map(mapElement, {
        center: defaultLocation,
        zoom: 14,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
    });
   
    // Create the places service
    service = new google.maps.places.PlacesService(map);
   
    // Set up autocomplete for destination search
    const destinationInput = document.getElementById("destination");
    if (!destinationInput) {
        console.error("Destination input not found");
        return;
    }
    autocomplete = new google.maps.places.Autocomplete(destinationInput);
    autocomplete.setFields(['geometry', 'name']);
   
    // Try to get the user's current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                currentPosition = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
               
                // Center map on user's location
                map.setCenter(currentPosition);
               
                // Add a marker for the user's location
                currentMarker = new google.maps.Marker({
                    position: currentPosition,
                    map: map,
                    title: "Your Location",
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 10,
                        fillColor: "#4285F4",
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: "#FFFFFF",
                    }
                });
            },
            () => {
                handleLocationError(true);
            }
        );
    } else {
        handleLocationError(false);
    }
   
    // Set up event listeners
    setupEventListeners();
}
 
// Function to handle location errors
function handleLocationError(browserHasGeolocation) {
    alert(
        browserHasGeolocation
            ? "Error: The Geolocation service failed. Please enable location services."
            : "Error: Your browser doesn't support geolocation."
    );
}
 
// Set up event listeners for the page
function setupEventListeners() {
    const currentTab = document.getElementById("current-tab");
    const destinationTab = document.getElementById("destination-tab");
    const searchCurrentBtn = document.getElementById("search-current");
    const searchDestinationBtn = document.getElementById("search-destination");
 
    // Check if elements exist
    if (!currentTab || !destinationTab || !searchCurrentBtn || !searchDestinationBtn) {
        console.error("One or more tab or button elements not found");
        return;
    }
 
    // Define debounced search functions
    const debouncedSearchNearby = debounce(searchNearbyRestaurants, 500);
    const debouncedSearchDestination = debounce(searchDestinationRestaurants, 500);
 
    // Remove existing listeners to prevent duplicates
    currentTab.removeEventListener("click", () => switchTab("current"));
    destinationTab.removeEventListener("click", () => switchTab("destination"));
    searchCurrentBtn.removeEventListener("click", debouncedSearchNearby);
    searchDestinationBtn.removeEventListener("click", debouncedSearchDestination);
 
    // Add new listeners
    currentTab.addEventListener("click", () => switchTab("current"));
    destinationTab.addEventListener("click", () => switchTab("destination"));
    searchCurrentBtn.addEventListener("click", debouncedSearchNearby);
    searchDestinationBtn.addEventListener("click", debouncedSearchDestination);
}
 
// Switch between current location and destination tabs
function switchTab(tabName) {
    const currentTab = document.getElementById("current-tab");
    const destinationTab = document.getElementById("destination-tab");
    const currentSearch = document.getElementById("current-location-search");
    const destinationSearch = document.getElementById("destination-search");
   
    if (!currentTab || !destinationTab || !currentSearch || !destinationSearch) {
        console.error("Tab or search elements not found");
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
 
// Search for restaurants near the user's current location
function searchNearbyRestaurants(event) {
    event.preventDefault();
   
    // Check if location is available
    if (!currentPosition) {
        alert("Your location is not available. Please allow location access and try again.");
        return;
    }
   
    // Show loading indicator
    showLoading(true);
   
    // Clear previous results
    clearResults();
   
    // Get search parameters
    const cuisineTypeElement = document.getElementById("cuisine-type");
    const distanceElement = document.getElementById("distance");
    if (!cuisineTypeElement || !distanceElement) {
        console.error("Cuisine type or distance input not found");
        showLoading(false);
        return;
    }
    const cuisineType = cuisineTypeElement.value;
    const radius = parseInt(distanceElement.value);
   
    // Build the search query
    let query = "restaurant";
    if (cuisineType) {
        query += " " + cuisineType;
    }
   
    // Define the search request
    const request = {
        location: new google.maps.LatLng(currentPosition.lat, currentPosition.lng),
        radius: radius,
        type: ['restaurant', 'cafe', 'bar', 'food'],
        keyword: cuisineType,
        openNow: true
    };
   
    // Perform the search
    return service.nearbySearch(request)
        .then((results) => {
            if (results && results.length > 0) {
                displayResults(results, currentPosition);
            } else {
                handleEmptyResults();
            }
        })
        .catch((error) => {
            console.error('Nearby Search failed:', error);
            handleEmptyResults();
        })
        .finally(() => {
            showLoading(false);
        });
}
 
// Search for restaurants near the destination
function searchDestinationRestaurants(event) {
    event.preventDefault();
   
    const place = autocomplete.getPlace();
   
    if (!place || !place.geometry) {
        alert("Please select a valid destination from the dropdown.");
        return;
    }
   
    // Show loading indicator
    showLoading(true);
   
    // Clear previous results
    clearResults();
   
    // Get the destination location
    const destinationLocation = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
    };
   
    // Update map to show the destination
    map.setCenter(destinationLocation);
   
    // Remove current location marker if it exists
    if (currentMarker) {
        currentMarker.setMap(null);
    }
   
    // Add a marker for the destination
    currentMarker = new google.maps.Marker({
        position: destinationLocation,
        map: map,
        title: place.name || "Destination",
        animation: google.maps.Animation.DROP
    });
   
    // Get search parameters
    const cuisineTypeElement = document.getElementById("dest-cuisine-type");
    const distanceElement = document.getElementById("dest-distance");
    if (!cuisineTypeElement || !distanceElement) {
        console.error("Destination cuisine type or distance input not found");
        showLoading(false);
        return;
    }
    const cuisineType = cuisineTypeElement.value;
    const radius = parseInt(distanceElement.value);
   
    // Define the search request
    const request = {
        location: new google.maps.LatLng(destinationLocation.lat, destinationLocation.lng),
        radius: radius,
        type: ['restaurant', 'cafe', 'bar', 'food'],
        keyword: cuisineType,
        openNow: true
    };
   
    // Perform the search
    return service.nearbySearch(request)
        .then((results) => {
            if (results && results.length > 0) {
                displayResults(results, destinationLocation);
            } else {
                handleEmptyResults();
            }
        })
        .catch((error) => {
            console.error('Destination Search failed:', error);
            handleEmptyResults();
        })
        .finally(() => {
            showLoading(false);
        });
}
 
// Display search results on the map and in the list
function displayResults(places, referenceLocation) {
    // Clear existing markers
    clearMarkers();
   
    // Create bounds to encompass all markers
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(referenceLocation);
   
    // Reference to results list
    const resultsList = document.getElementById("results-list");
    if (!resultsList) {
        console.error("Results list element not found");
        return;
    }
    resultsList.innerHTML = "";
   
    // Check if any places were found
    if (places.length === 0) {
        handleEmptyResults();
        return;
    }
   
    // Process each place
    places.forEach((place, i) => {
        // Calculate distance
        const distance = calculateDistance(
            referenceLocation.lat,
            referenceLocation.lng,
            place.geometry.location.lat(),
            place.geometry.location.lng()
        );
       
        // Create a marker for the place
        createMarker(place, i + 1);
       
        // Add place to results list
        addPlaceToList(place, distance, i + 1);
       
        // Extend bounds to include this place
        bounds.extend(place.geometry.location);
    });
   
    // Adjust map to show all markers
    map.fitBounds(bounds);
}
 
// Create a marker for a place
function createMarker(place, index) {
    const marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location,
        animation: google.maps.Animation.DROP,
        title: place.name,
        label: { text: String(index), color: "white" }
    });
   
    // Add click listener to show info window
    marker.addListener("click", () => {
        let content = `
            <div style="padding: 8px; max-width: 300px;">
                <h3 style="margin-top: 0;">${place.name}</h3>
                <p>${place.vicinity}</p>
        `;
       
        if (place.rating) {
            content += `
                <p>Rating: ${place.rating} ⭐ (${place.user_ratings_total || 0} reviews)</p>
            `;
        }
       
        if (place.opening_hours && place.opening_hours.open_now) {
            content += `<p style="color: green;">Open Now</p>`;
        } else if (place.opening_hours) {
            content += `<p style="color: red;">Closed</p>`;
        }
       
        if (place.photos && place.photos.length > 0) {
            content += `
                <img src="${place.photos[0].getUrl({ maxWidth: 250, maxHeight: 150 })}" style="width: 100%; margin-top: 8px;">
            `;
        }
       
        content += `
                <a href="https://www.google.com/maps/place/?q=place_id:${place.place_id}" target="_blank" style="display: block; margin-top: 8px; color: blue; text-decoration: underline;">View on Google Maps</a>
            </div>
        `;
       
        infowindow.setContent(content);
        infowindow.open(map, marker);
    });
   
    // Store the marker for later reference
    restaurantMarkers.push(marker);
}
 
// Add a place to the results list
function addPlaceToList(place, distance, index) {
    const resultsList = document.getElementById("results-list");
    if (!resultsList) {
        console.error("Results list element not found");
        return;
    }
   
    const listItem = document.createElement("li");
    listItem.className = "result-item";
   
    // Format the distance to 1 decimal place
    const formattedDistance = distance.toFixed(1);
   
    // Create the stars for rating display
    let starsHtml = "";
    if (place.rating) {
        starsHtml = `<div class="star">⭐</div> ${place.rating} (${place.user_ratings_total || 0})`;
    } else {
        starsHtml = "No ratings";
    }
   
    // Set open status
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
   
    // Add click event to highlight the corresponding marker
    listItem.addEventListener("click", () => {
        // Trigger a click on the corresponding marker
        google.maps.event.trigger(restaurantMarkers[index - 1], "click");
       
        // Scroll the map to make sure the info window is visible
        map.panTo(restaurantMarkers[index - 1].getPosition());
    });
   
    resultsList.appendChild(listItem);
}
 
// Calculate distance between two coordinates in kilometers
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
}
 
// Convert degrees to radians
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}
 
// Clear all restaurant markers from the map
function clearMarkers() {
    restaurantMarkers.forEach(marker => {
        marker.setMap(null);
    });
    restaurantMarkers = [];
   
    // Close any open info windows
    infowindow.close();
}
 
// Clear all results
function clearResults() {
    clearMarkers();
    const resultsList = document.getElementById("results-list");
    if (resultsList) {
        resultsList.innerHTML = "";
    }
}
 
// Show or hide loading indicator
function showLoading(show) {
    const loadingElement = document.getElementById("loading");
    if (loadingElement) {
        loadingElement.style.display = show ? "block" : "none";
    }
}
 
// Handle empty results
function handleEmptyResults() {
    const resultsList = document.getElementById("results-list");
    if (!resultsList) {
        console.error("Results list element not found");
        return;
    }
    resultsList.innerHTML = `
        <li class="empty-results">
            <p>No restaurants found. Try changing your search criteria.</p>
        </li>
    `;
}
 
// Handle Google Maps API error
function gm_authFailure() {
    alert("Google Maps API key error. Please check your API key.");
}