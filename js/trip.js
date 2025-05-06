 
let map;
let directionsService;
let directionsRenderer;

window.initMap = () => {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 20.0, lng: 0.0 },
    zoom: 2,
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);

  document.getElementById("route-btn").addEventListener("click", handleRoute);

  const fromInput = document.getElementById("from-address");
  const toInput = document.getElementById("to-address");

  new google.maps.places.Autocomplete(fromInput);
  new google.maps.places.Autocomplete(toInput);
};

async function handleRoute() {
  const from = document.getElementById("from-address").value;
  const to = document.getElementById("to-address").value;

  if (!from || !to) {
    alert("Enter both addresses");
    return;
  }

  const request = {
    origin: from,
    destination: to,
    travelMode: google.maps.TravelMode.DRIVING,
  };

  directionsService.route(request, (result, status) => {
    if (status === "OK") {
      directionsRenderer.setDirections(result);

      const distanceMeters = result.routes[0].legs[0].distance.value;
      const distanceKm = distanceMeters / 1000;

      if (distanceKm > 300) {
        alert("💡 This might be a good trip to book a flight!");
      }
    } else {
      alert("Could not find route: " + status);
    }
  });
}
