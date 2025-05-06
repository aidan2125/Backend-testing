import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://lmtvzmagwdegwravdcue.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtdHZ6bWFnd2RlZ3dyYXZkY3VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0OTMzMTYsImV4cCI6MjA2MTA2OTMxNn0.Kc7eVAIdPTSOnCBaMpFowYBPBjuBgkwyJA6nZD-F2yU';
const supabase = createClient(supabaseUrl, supabaseKey);

// Declare globally so all functions can access
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

  // ✅ Add event listener for route button
  document.getElementById("route-btn").addEventListener("click", handleRoute);
};

// ✅ Define the route handling function
function handleRoute() {
  const origin = fromInput.value;
  const destination = toInput.value;

  if (!origin || !destination) {
    alert('Please enter both addresses.');
    return;
  }

  directionsService.route(
    {
      origin,
      destination,
      travelMode: google.maps.TravelMode.DRIVING,
    },
    (response, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        directionsRenderer.setDirections(response);
      } else {
        alert('Could not display directions due to: ' + status);
      }
    }
  );
}

// ✅ Save trip to Supabase
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('save-trip-btn').addEventListener('click', async () => {
    const fromAddress = document.getElementById('from-address').value;
    const destination = document.getElementById('to-address').value;
    const activities = document.getElementById('activities').value;

    // ✅ Validate fields before saving
    if (!fromAddress || !destination || !activities) {
      alert('Please fill in all required fields!');
      return;
    }

    const startDate = new Date().toISOString(); // placeholder
    const endDate = new Date().toISOString();   // placeholder

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    console.log('From Address:', fromAddress);
    console.log('Destination:', destination);
    console.log('Activities:', activities);

    if (userError || !user) {
      alert('Please log in to save a trip.');
      return;
    }

    // ✅ Log user ID for debugging
    console.log('User ID:', user.id);

    // ✅ Fetch profileID from the signup table using the user's email
    const { data: profileData, error: profileError } = await supabase
      .from('signup')
      .select('profileID')
      .eq('email', user.email) // Assuming the email is unique and linked to the profile
      .single();

    if (profileError || !profileData) {
      alert('Profile not found. Please sign up first.');
      return;
    }

    const profileID = profileData.profileID; // Extract the profileID

    // ✅ Convert activities to an array (if required by the Supabase schema)
    const activitiesArray = activities.split(',').map(activity => activity.trim());

    // ✅ Insert the trip data into the trip_planner table with the fetched profileID
    const { error } = await supabase.from('trip_planner').insert([{
      profileID: profileID,  // Use profileID from signup table
      destination,
      start_date: startDate,
      end_date: endDate,
      activities: activitiesArray, // Pass activities as an array
    }]);

    if (error) {
      console.error('❌ Error saving trip:', error.message);
      alert('Failed to save trip.');
    } else {
      alert('✅ Trip saved successfully!');
    }
  });
});
