// expenses.js

import { getCurrentUser, getUserTrips } from './auth.js';  // Make sure to import getUserTrips

const form = document.getElementById('expense-form');
const list = document.getElementById('expense-list');
const totalAmount = document.getElementById('total-amount');

let expenses = [];

// Function to fetch and populate the trip dropdown
const populateTripDropdown = async () => {
  const user = getCurrentUser();
  if (!user) return;

  const trips = await getUserTrips(user.id);  // Fetch trips for the logged-in user

  const tripSelect = document.getElementById('trip-id');
  tripSelect.innerHTML = '';  // Clear previous trip options
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Select a Trip (optional)';
  tripSelect.appendChild(defaultOption);  // Add default option
  
  trips.forEach(trip => {
    const option = document.createElement('option');
    option.value = trip.id;
    option.textContent = trip.name;
    tripSelect.appendChild(option);
  });
};

// Call this function when the page loads or when user logs in
document.addEventListener('DOMContentLoaded', populateTripDropdown);

// Expense submission logic
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

  // Get trip ID (can be null if user chooses no trip)
  const tripId = document.getElementById('trip-id')?.value || null;

  if (!name || isNaN(amount)) return;

  // Insert expense into Supabase
  const { data, error } = await supabase
    .from('expenses')
    .insert([{
      name,
      amount,
      category,
      currency,
      nativeamount: nativeAmount,
      location,
      date,
      trip_id: tripId,  // Set trip_id to null if no trip selected
      profileID: user.id,  // Get logged-in user ID dynamically
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

    // Optional: Enhance this to include currency, date, etc.
    div.innerHTML = `
      <strong>${item.name}</strong> ($${item.amount.toFixed(2)}) - ${item.category}
      <button onclick="deleteExpense(${index})">❌</button>
    `;
    list.appendChild(div);
  });

  totalAmount.textContent = total.toFixed(2);
}

// Optional: Add delete functionality for expenses
window.deleteExpense = (index) => {
  expenses.splice(index, 1);
  renderExpenses();
};
