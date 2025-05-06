 
let map;
let tripMarkers = [];
let directionsService;
let directionsRenderer;

window.initMap = () => {
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();

  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 40.7128, lng: -74.0060 },
    zoom: 8,
  });

  directionsRenderer.setMap(map);

  map.addListener("click", (event) => {
    const marker = new google.maps.Marker({
      position: event.latLng,
      map: map,
    });
    tripMarkers.push(marker);
    if (tripMarkers.length > 1) {
      drawRoute();
    }
  });
};

function drawRoute() {
  const waypoints = tripMarkers.slice(1, -1).map(marker => ({
    location: marker.getPosition(),
    stopover: true
  }));

  directionsService.route({
    origin: tripMarkers[0].getPosition(),
    destination: tripMarkers[tripMarkers.length - 1].getPosition(),
    waypoints,
    travelMode: google.maps.TravelMode.DRIVING,
  }, (response, status) => {
    if (status === "OK") {
      directionsRenderer.setDirections(response);
    }
  });
}

document.getElementById("get-location-btn").addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    const userPos = { lat: latitude, lng: longitude };
    map.setCenter(userPos);
    map.setZoom(12);

    const marker = new google.maps.Marker({
      position: userPos,
      map: map,
      title: "Your Location",
    });
    tripMarkers.push(marker);
  });
});

document.getElementById("clear-trip").addEventListener("click", () => {
  tripMarkers.forEach(marker => marker.setMap(null));
  tripMarkers = [];
  directionsRenderer.set('directions', null);
});
