let map;
let infoWindow;
let markers = [];

async function initMap() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        map = new google.maps.Map(document.getElementById("map"), {
          center: userLocation,
          zoom: 15,
        });

        infoWindow = new google.maps.InfoWindow();

        new google.maps.Marker({
          position: userLocation,
          map: map,
          title: "You are here",
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "white",
          },
        });

        await searchNearbyFood(userLocation);
      },
      () => {
        handleLocationError(true);
      }
    );
  } else {
    handleLocationError(false);
  }
}

async function searchNearbyFood(userLocation) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "<p>Loading nearby food places...</p>";

  try {
    const { Place } = await google.maps.importLibrary("places");
    const place = new Place({ locationBias: userLocation });

    const response = await place.searchNearby({
      locationRestriction: {
        center: userLocation,
        radius: 1500,
      },
      includedTypes: ["restaurant", "cafe", "food"],
    });

    resultsDiv.innerHTML = "";

    if (response.places && response.places.length) {
      clearMarkers();

      response.places.forEach((place) => {
        createMarker(place);

        const placeEl = document.createElement("div");
        placeEl.style.padding = "5px 0";
        placeEl.innerHTML = `
          <strong>${place.displayName?.text || place.name}</strong><br />
          ${place.formattedAddress || ""}<br />
          Rating: ${place.rating || "N/A"} ⭐
        `;
        resultsDiv.appendChild(placeEl);
      });
    } else {
      resultsDiv.innerHTML = "<p>No food places found nearby.</p>";
    }
  } catch (error) {
    console.error("Places API error:", error);
    resultsDiv.innerHTML = "<p>Error fetching food places.</p>";
  }
}

function createMarker(place) {
  if (!place.location) return;

  const marker = new google.maps.marker.AdvancedMarkerElement({
    map: map,
    position: place.location,
    title: place.displayName?.text || place.name,
  });

  marker.addListener("click", () => {
    const content = `
      <div style="max-width: 250px;">
        <h3>${place.displayName?.text || place.name}</h3>
        <p>${place.formattedAddress || ""}</p>
        <p>Rating: ${place.rating || "N/A"} ⭐</p>
      </div>
    `;
    infoWindow.setContent(content);
    infoWindow.open(map, marker);
  });

  markers.push(marker);
}

function clearMarkers() {
  markers.forEach((marker) => marker.setMap(null));
  markers = [];
}

function handleLocationError(browserHasGeolocation) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = browserHasGeolocation
    ? "<p>Error: The Geolocation service failed.</p>"
    : "<p>Error: Your browser doesn't support geolocation.</p>";
}

// Expose globally for Google Maps callback
window.initMap = initMap;
