import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
 
// Initialize Supabase
const supabaseUrl = 'https://lmtvzmagwdegwravdcue.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtdHZ6bWFnd2RlZ3dyYXZkY3VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0OTMzMTYsImV4cCI6MjA2MTA2OTMxNn0.Kc7eVAIdPTSOnCBaMpFowYBPBjuBgkwyJA6nZD-F2yU'; // Truncated for safety
const supabase = createClient(supabaseUrl, supabaseKey);
 
const profileID = localStorage.getItem('profileID');
 
// ---- Trip Planner Map & Routing ----
let map, directionsService, directionsRenderer;
let fromInput, toInput;
let currentTrip = {};
 
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
 
async function handleRoute() {
    const origin = fromInput.value.trim();
    const destination = toInput.value.trim();
    const travelMode = document.getElementById("travel-mode").value;
 
    if (!origin || !destination) {
        alert("Please enter both addresses.");
        return;
    }
 
    if (travelMode === "FLYING") {
        const estimatedDistance = 10000; // placeholder for dynamic later
        const cost = calculateCost(estimatedDistance, travelMode);
        const activities = document.getElementById("activities").value;
 
        currentTrip = {
            from: origin,
            destination,
            activities,
            travelMode,
            distance: estimatedDistance,
            cost,
        };
 
        showTripSummary();
        return;
    }
 
    directionsService.route(
        {
            origin,
            destination,
            travelMode: travelMode,
        },
        (response, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
                directionsRenderer.setDirections(response);
                const distance = response.routes[0].legs[0].distance.value / 1000; // km
 
                const cost = calculateCost(distance, travelMode);
                const activities = document.getElementById("activities").value;
 
                currentTrip = {
                    from: origin,
                    destination,
                    activities,
                    travelMode,
                    distance,
                    cost,
                };
 
                showTripSummary();
            } else if (status === google.maps.DirectionsStatus.ZERO_RESULTS) {
                alert("We couldn’t find a drivable route. Try switching to FLYING mode.");
            } else {
                alert("Route failed: " + status);
                console.error("❌ Route error:", status);
            }
        }
    );
}
 
function calculateCost(distance, mode) {
    const rates = {
        DRIVING: 0.5,
        TRANSIT: 0.3,
        FLYING: 0.8,
    };
    return distance * (rates[mode] || 0.5);
}
 
function showTripSummary() {
    document.getElementById("summary-text").innerText = `
From: ${currentTrip.from}
To: ${currentTrip.destination}
Mode: ${currentTrip.travelMode}
Distance: ~${currentTrip.distance.toFixed(2)} km
Estimated Cost: $${currentTrip.cost.toFixed(2)}
Activities: ${currentTrip.activities}
    `.trim();
 
    document.getElementById("trip-summary-modal").style.display = "block";
}
 
async function saveTrip() {
    document.getElementById("trip-summary-modal").style.display = "none";
 
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        alert("Please log in to save a trip.");
        return;
    }
 
    const { data: profileData, error: profileError } = await supabase
        .from("signup")
        .select("profileID")
        .eq("email", user.email)
        .single();
 
    if (profileError || !profileData) {
        alert("Profile not found or duplicate accounts exist.");
        return;
    }
 
    const activitiesArray = currentTrip.activities
        ? currentTrip.activities.split(",").map((a) => a.trim())
        : [];
 
    const tripPayload = {
        profileID: profileData.profileID,
        destination: currentTrip.destination,
        start_date: new Date().toISOString(),
        end_date: new Date().toISOString(),
        activities: activitiesArray,
    };
 
    const { error: insertError } = await supabase.from("trip_planner").insert([tripPayload]);
 
    if (insertError) {
        console.error("❌ Error saving trip:", insertError.message);
        alert("Failed to save trip.");
    } else {
        alert("✅ Trip saved successfully!");
    }
}
 
// ------------------ Fetch Upcoming Trips ------------------
async function fetchTrips() {
  const { data: trips, error } = await supabase
    .from('trip_planner')
    .select('destination, origin, start_date, end_date, travel_mode, distance, estimated_cost')
    .eq('profileID', profileID)
    .order('start_date', { ascending: true });
 
  const container = document.getElementById('upcoming-trips-container');
  if (error || !container) {
    console.error('Error fetching trips:', error?.message);
    return;
  }
 
  if (!trips.length) {
    container.innerHTML = '<p>No upcoming trips found.</p>';
    return;
  }
 
  container.innerHTML = ''; // Clear previous
  trips.forEach(trip => {
    const tripCard = document.createElement('div');
    tripCard.classList.add('trip-card');
    tripCard.innerHTML = `
      <h3>${trip.destination}</h3>
      <p><strong>From:</strong> ${trip.origin}</p>
      <p><strong>Start:</strong> ${trip.start_date}</p>
      <p><strong>End:</strong> ${trip.end_date}</p>
      <p><strong>Mode:</strong> ${trip.travel_mode}</p>
      <p><strong>Distance:</strong> ${trip.distance ?? 'N/A'} km</p>
      <p><strong>Cost:</strong> $${trip.estimated_cost ?? 'N/A'}</p>
    `;
    container.appendChild(tripCard);
  });
}
 
// ------------------ Save Trip Notes ------------------
async function saveTripNotes(notes) {
  const { error } = await supabase
    .from('trip_notes')
    .upsert({ profileID, notes });
 
  if (error) {
    console.error('Error saving notes:', error.message);
  } else {
    alert('Notes saved!');
  }
}
 
// ------------------ Fetch Trip Notes ------------------
async function fetchTripNotes() {
  const { data, error } = await supabase
    .from('trip_notes')
    .select('notes')
    .eq('profileID', profileID)
    .maybeSingle();
 
  const textarea = document.getElementById('trip-notes-textarea');
  if (!error && data && textarea) {
    textarea.value = data.notes;
  }
}
 
// ------------------ Fetch Budget Snapshot ------------------
async function fetchBudgetSnapshot() {
  const { data, error } = await supabase
    .from('trip_expenses')
    .select('category, amount')
    .eq('profileID', profileID);
 
  const summary = document.getElementById('budget-summary');
  if (error || !summary) {
    console.error('Error fetching budget:', error?.message);
    return;
  }
 
  summary.innerHTML = data.map(exp => `
    <div class="budget-item">
      <span>${exp.category}</span>
      <span>$${exp.amount}</span>
    </div>
  `).join('');
}
 
// ------------------ Fetch Packing Checklist ------------------
async function fetchPackingList() {
  const { data, error } = await supabase
    .from('packing_list')
    .select('*')
    .eq('profileID', profileID);
 
  const list = document.getElementById('packing-list');
  if (error || !list) {
    console.error('Error fetching packing list:', error?.message);
    return;
  }
 
  list.innerHTML = '';
  data.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `<input type="checkbox" ${item.packed ? 'checked' : ''}/> ${item.item}`;
    list.appendChild(li);
  });
}
 
// ------------------ Currency Converter Dropdowns ------------------
async function populateCurrencyDropdowns() {
  const fromCurrency = document.getElementById("from-currency");
  const toCurrency = document.getElementById("to-currency");
  if (!fromCurrency || !toCurrency) {
    console.error("Missing currency select elements");
    return;
  }
 
  try {
    const res = await fetch("https://api.exchangerate.host/symbols");
    const { symbols } = await res.json();
    Object.entries(symbols).forEach(([code, { description }]) => {
      const option1 = document.createElement("option");
      option1.value = code;
      option1.text = `${code} - ${description}`;
      fromCurrency.appendChild(option1);
 
      const option2 = document.createElement("option");
      option2.value = code;
      option2.text = `${code} - ${description}`;
      toCurrency.appendChild(option2);
    });
    // Optionally set defaults
    fromCurrency.value = "USD";
    toCurrency.value = "ZAR";
  } catch (err) {
    console.error("Failed to fetch currency symbols", err);
  }
}
 
// ------------------ Currency Converter Functionality ------------------
function setupCurrencyConverter() {
  const convertBtn = document.getElementById('convertBtn');
  const convertAmount = document.getElementById('convert-amount');
  const fromCurrency = document.getElementById('from-currency');
  const toCurrency = document.getElementById('to-currency');
  const convertedResult = document.getElementById('converted-result');
 
  if (convertBtn && convertAmount && fromCurrency && toCurrency && convertedResult) {
    document.getElementById('converter-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      const amount = parseFloat(convertAmount.value);
      const from = fromCurrency.value;
      const to = toCurrency.value;
      if (isNaN(amount) || !from || !to) {
        convertedResult.textContent = 'Please enter valid amount and select currencies.';
        return;
      }
      convertedResult.textContent = 'Converting...';
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
}
 
// ------------------ Event Listeners & Initialization ------------------
document.addEventListener('DOMContentLoaded', () => {
  // Trip, notes, budget, packing
  fetchTrips();
  fetchTripNotes();
  fetchBudgetSnapshot();
  fetchPackingList();
 
  // Notes save button
  const notesBtn = document.getElementById('save-notes-btn');
  if (notesBtn) {
    notesBtn.addEventListener('click', () => {
      const notes = document.getElementById('trip-notes-textarea').value;
      saveTripNotes(notes);
    });
  }
 
  // Currency converter
  populateCurrencyDropdowns().then(setupCurrencyConverter);
});