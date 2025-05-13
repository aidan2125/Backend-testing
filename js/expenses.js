
import { getCurrentUser, getUserTrips, supabase } from './auth.js'; // Import your helper functions

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


// Fetch the most recent trip for the logged-in user or return null if no trip exists
const getDefaultTripId = async (profileID) => {
  const { data, error } = await supabase
    .from('trip_planner')  // Correct table name where trips are stored
    .select('trip_id')  // Fetch trip_id
    .eq('profileID', profileID)  // Filter by logged-in user's profileID
    .order('start_date', { ascending: false })  // Order by most recent trip (latest start_date)
    .limit(1);  // Only get the most recent trip

  if (error) {
    console.error('Error fetching trip:', error);
    return null;  // No trip found
  }

  if (data.length > 0) {
    return data[0].trip_id;  // Return the trip_id of the most recent trip
  }

  return null;  // No trips available
};

// Function to submit expense, automatically associate with trip if available
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Get expense details from the form
  const name = document.getElementById('expense-name').value;
  const amount = parseFloat(document.getElementById('expense-amount').value);
  const category = document.getElementById('expense-category').value;
  const currency = document.getElementById('expense-currency')?.value || 'USD';
  const nativeAmount = parseFloat(document.getElementById('expense-nativeamount')?.value || amount);
  const location = document.getElementById('expense-location')?.value || '';
  const date = document.getElementById('expense-date')?.value || new Date().toISOString();

  // Automatically fetch the trip_id for the logged-in user
  const user = await getCurrentUser();  // Fetch user first
  if (!user) return;

  const tripId = await getDefaultTripId(user.profileID);  // Automatically fetch the most recent trip

  if (!name || isNaN(amount)) {
    alert('Please enter a valid expense name and amount.');
    return;
  }

  // Insert expense into Supabase, automatically associating with the trip_id if available
  const { data, error } = await supabase
    .from('expenses')  // Correct table name
    .insert([{
      name,
      amount,
      category,
      currency,
      nativeamount: nativeAmount,
      location,
      date,
      trip_id:tripId || null,  // Automatically set trip_id (null if no trip)
      profileID: user.profileID  // Associate expense with the correct profileID
    }]);

  if (error) {
    console.error('Insert error:', error);
    return;
  }

  
  expenses.push(data[0]);  // Add inserted expense to local array
  renderExpenses();  // Re-render expenses
  form.reset();  // Reset the form
});

// Function to render expenses
function renderExpenses() {
  list.innerHTML = '';
  let total = 0;

  expenses.forEach((item, index) => {
    total += item.amount;

    const div = document.createElement('div');
    div.classList.add('expense-item');

    div.innerHTML = `
      <strong>${item.name}</strong> ($${item.amount.toFixed(2)}) - ${item.category}
      <button onclick="deleteExpense(${index})">❌</button>
    `;
    list.appendChild(div);

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


// Optional: Add delete functionality for expenses
window.deleteExpense = async (index) => {
  const { id } = expenses[index];

  const { error } = await supabase
    .from('expenses')  // Correct table name
    .delete()
    .eq('id', id);  // Correct field name for expense id

  if (!error) {
    expenses.splice(index, 1);
    renderExpenses();
  } else {
    console.error('Failed to delete:', error);
  }
};
=======
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

