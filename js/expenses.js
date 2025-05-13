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

  if (!name || isNaN(amount)) return;

  const expense = { name, amount, category };
  expenses.push(expense);
  renderExpenses();
  form.reset();
});

function renderExpenses() {
  list.innerHTML = '';
  let total = 0;

  expenses.forEach((item, index) => {
    total += item.amount;

    const div = document.createElement('div');
    div.classList.add('expense-item');

    div.innerHTML = `
      <div class="expense-details">
        <strong>${item.name}</strong> - <span class="expense-amount">$${item.amount.toFixed(2)}</span>
        <span class="expense-category">${item.category}</span>
        <span class="expense-date">${new Date(item.date).toLocaleDateString()}</span>
      </div>
    `;

    // DELETE Button
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('btn', 'btn-delete');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => deleteExpense(index);
    div.appendChild(deleteBtn);

    // VIEW Button
    const viewBtn = document.createElement('button');
    viewBtn.classList.add('btn', 'btn-view');
    viewBtn.textContent = 'View';
    viewBtn.onclick = () => viewExpense(item);
    div.appendChild(viewBtn);

    list.appendChild(div);
  });

  totalAmount.textContent = total.toFixed(2);
}

// Function to view the expense details in a modal
function viewExpense(item) {
  const modal = document.createElement('div');
  modal.classList.add('expense-modal-overlay');

  modal.innerHTML = `
    <div class="expense-modal">
      <h3>${item.name}</h3>
      <p><strong>Amount:</strong> $${item.amount}</p>
      <p><strong>Category:</strong> ${item.category}</p>
      <p><strong>Date:</strong> ${new Date(item.date).toLocaleDateString()}</p>
      <p><strong>Location:</strong> ${item.location || 'N/A'}</p>
      <p><strong>Trip:</strong> ${item.trip_id || 'None'}</p>
      <button class="btn btn-close">Close</button>
    </div>
  `;

  document.body.appendChild(modal);

  // Close modal when button clicked
  modal.querySelector('.btn-close').onclick = () => {
    modal.remove();
  };
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
