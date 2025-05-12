import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://lmtvzmagwdegwravdcue.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtdHZ6bWFnd2RlZ3dyYXZkY3VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0OTMzMTYsImV4cCI6MjA2MTA2OTMxNn0.Kc7eVAIdPTSOnCBaMpFowYBPBjuBgkwyJA6nZD-F2yU'
);

const form = document.getElementById('expense-form');
const list = document.getElementById('expense-list');
const totalDisplay = document.getElementById('total-amount');
const tripSelect = document.getElementById('trip-select'); // Reference to the trip select dropdown

let total = 0;
let profileID = null;

// Load trips for the current user and populate the dropdown
async function loadTrips() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: profileRow } = await supabase
    .from('signup')
    .select('profileID')
    .eq('email', user.email)
    .single();

  profileID = profileRow?.profileID;

  const { data: trips } = await supabase
    .from('trip_planner')
    .select('trip_id, destination')
    .eq('profileID', profileID);

  trips?.forEach(trip => {
    const option = document.createElement("option");
    option.value = trip.trip_id;
    option.textContent = trip.destination;
    tripSelect.appendChild(option);
  });
}

loadTrips();

// Load expenses when a trip is selected
tripSelect.addEventListener('change', async () => {
  const selectedTripId = tripSelect.value;
  if (!selectedTripId) {
    list.innerHTML = '<p>Please select a trip to view expenses.</p>';
    return;
  }

  // Fetch expenses for the selected trip
  const { data: expenses, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('profileID', profileID)
    .eq('trip_id', selectedTripId)
    .order('created_at', { ascending: false });

  if (error || !expenses.length) {
    list.innerHTML = '<p>No expenses found for this trip.</p>';
    return;
  }

  // Clear the previous expense list
  list.innerHTML = '';

  // Display each expense
  expenses.forEach(exp => {
    addExpenseToUI(exp);
  });

  // Update the total amount
  total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  totalDisplay.textContent = total.toFixed(2);
});

// Form submit handler
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const trip_id = tripSelect.value;
  const name = document.getElementById("expense-name").value;
  const amount = parseFloat(document.getElementById("expense-amount").value);
  const category = document.getElementById("expense-category").value;

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profileRow } = await supabase
    .from('signup')
    .select('profileID')
    .eq('email', user.email)
    .single();

  const { error } = await supabase.from("expenses").insert([{
    profileID: profileRow.profileID,
    trip_id,
    name,
    amount,
    category
  }]);

  if (!error) {
    alert("✅ Expense saved!");
    e.target.reset(); // Clear form after success
    tripSelect.dispatchEvent(new Event('change')); // Re-fetch expenses after adding a new one
  } else {
    alert("❌ Failed to save expense.");
    console.error(error);
  }
});

// Add expense to UI
function addExpenseToUI(expense) {
  const item = document.createElement('div');
  item.className = 'expense-item';
  item.innerHTML = `
    <p><strong>${expense.name}</strong> — $${expense.amount.toFixed(2)} <em>(${expense.category})</em></p>
  `;
  list.appendChild(item);
}
