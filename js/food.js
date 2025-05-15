const apiKey = "AIzaSyCvI8oz4lpujGMNdk28vTHf6useyP8a9tc"; // Replace with your actual API key


function fetchFoodPlaces(lat, lng) {
  const results = document.getElementById('results');
  results.innerHTML = '<p>Loading...</p>';

  // Call your backend API
  fetch(`http://localhost:3000/api/food?lat=${lat}&lng=${lng}`)
    .then(res => res.json())
    .then(data => {
      results.innerHTML = '';
      data.results?.slice(0, 10).forEach(place => {
        const div = document.createElement('div');
        div.className = 'place';

        const photoRef = place.photos?.[0]?.photo_reference;
        const photoUrl = photoRef
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoRef}&key=${"AIzaSyCvI8oz4lpujGMNdk28vTHf6useyP8a9tc"}`
          : null;

        div.innerHTML = `
          ${photoUrl ? `<img src="${photoUrl}" alt="${place.name}"/>` : ''}
          <h3>${place.name}</h3>
          <p>${place.vicinity}</p>
          <p class="rating">Rating: ${place.rating || 'N/A'} ⭐</p>
        `;
        results.appendChild(div);
      });
    })
    .catch(err => {
      console.error('Error fetching places:', err);
      results.innerHTML = '<p>Could not load food recommendations.</p>';
    });
}


function initLocation() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchFoodPlaces(latitude, longitude);
      },
      (error) => {
        document.getElementById('results').innerHTML = '<p>Location access denied or unavailable.</p>';
      }
    );
  } else {
    document.getElementById('results').innerHTML = '<p>Geolocation not supported by your browser.</p>';
  }
}

initLocation();
