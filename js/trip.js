import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://lmtvzmagwdegwravdcue.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtdHZ6bWFnd2RlZ3dyYXZkY3VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0OTMzMTYsImV4cCI6MjA2MTA2OTMxNn0.Kc7eVAIdPTSOnCBaMpFowYBPBjuBgkwyJA6nZD-F2yU';
const supabase = createClient(supabaseUrl, supabaseKey);
let map, directionsService, directionsRenderer;
let fromInput, toInput;

window.initMap = function () {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 20.0, lng: 0.0 },
    zoom: 2,
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);

  fromInput = document.getElementById("from-address");
  toInput = document.getElementById("to-address");

  new google.maps.places.Autocomplete(fromInput);
  new google.maps.places.Autocomplete(toInput);

  document.getElementById("route-btn").addEventListener("click", handleRoute);
  document.getElementById("confirm-save-btn").addEventListener("click", saveTrip);
};

let currentTrip = {};

async function handleRoute() {
  const origin = fromInput.value;
  const destination = toInput.value;
  const travelMode = document.getElementById("travel-mode").value;

  if (!origin || !destination) {
    alert('Please enter both addresses.');
    return;
  }

  const gmapsMode = travelMode === "FLYING" ? google.maps.TravelMode.DRIVING : travelMode;

  directionsService.route(
    {
      origin,
      destination,
      travelMode: gmapsMode,
    },
    (response, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        directionsRenderer.setDirections(response);
        const distance = response.routes[0].legs[0].distance.value / 1000;

        const cost = calculateCost(distance, travelMode);
        const activities = document.getElementById("activities").value;
        currentTrip = {
          from: origin,
          destination,
          activities,
          travelMode,
          distance,
          cost
        };

        // Show trip summary
        document.getElementById("summary-text").innerText = `
From: ${origin}
To: ${destination}
Mode: ${travelMode}
Distance: ${distance.toFixed(2)} km
Estimated Cost: $${cost.toFixed(2)}
Activities: ${activities}
        `.trim();
        document.getElementById("trip-summary-modal").style.display = "block";
      } else {
        alert('Route failed: ' + status);
      }
    }
  );
}

function calculateCost(distance, mode) {
  const rates = {
    DRIVING: 0.5,
    TRANSIT: 0.3,
    FLYING: 0.8
  };
  return distance * (rates[mode] || 0.5);
}

async function saveTrip() {
  document.getElementById("trip-summary-modal").style.display = "none";

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    alert('Please log in to save a trip.');
    return;
  }

  const { data: profileData, error: profileError } = await supabase
    .from('signup')
    .select('profileID')
    .eq('email', user.email)
    .single();

  if (profileError || !profileData) {
    alert('Profile not found or duplicate accounts exist.');
    return;
  }

  const activitiesArray = currentTrip.activities.split(',').map(a => a.trim());

  const { error: insertError } = await supabase.from('trip_planner').insert([{
    profileID: profileData.profileID,
    destination: currentTrip.destination,
    start_date: new Date().toISOString(),
    end_date: new Date().toISOString(),
    activities: activitiesArray,
  }]);

  if (insertError) {
    console.error('❌ Error saving trip:', insertError.message);
    alert('Failed to save trip.');
  } else {
    alert('✅ Trip saved successfully!');
  }
}
