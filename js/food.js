// js/food.js

// Function to initialize the map and search for nearby restaurants
function initMap() {
    // Replace this with the actual destination coordinates
    const destination = { lat: -33.9249, lng: 18.4241 }; // Example: Cape Town, South Africa
  
    // Create a map centered at the destination
    const map = new google.maps.Map(document.getElementById("map"), {
      center: destination,
      zoom: 15,
    });
  
    // Create a marker at the destination
    new google.maps.Marker({
      position: destination,
      map: map,
      title: "Destination",
    });
  
    // Create the Places service
    const service = new google.maps.places.PlacesService(map);
  
    // Search for nearby restaurants
    service.nearbySearch(
      {
        location: destination,
        radius: 1000, // Search within 1 km radius
        type: ["restaurant"],
      },
      (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const list = document.getElementById("restaurant-list");
          list.innerHTML = ""; // Clear any existing entries
  
          results.forEach((place) => {
            // Create a list item for each restaurant
            const listItem = document.createElement("li");
            listItem.textContent = place.name;
            list.appendChild(listItem);
  
            // Create a marker for each restaurant
            new google.maps.Marker({
              position: place.geometry.location,
              map: map,
              title: place.name,
            });
          });
        } else {
          console.error("Places search failed due to: " + status);
        }
      }
    );
  }
  
  // Initialize the map when the window loads
  window.initMap = initMap;
  