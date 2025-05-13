import { getCurrentUser, getUserTrips, supabase } from './auth.js'; // Import your helper functions

const form = document.getElementById('expense-form');
const list = document.getElementById('expense-list');
const totalAmount = document.getElementById('total-amount');

let expenses = [];

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
  });

  totalAmount.textContent = total.toFixed(2);
}

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
