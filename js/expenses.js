
 
const form = document.getElementById('expense-form');
const list = document.getElementById('expense-list');
const totalAmount = document.getElementById('total-amount');
 
const convertAmount = document.getElementById('convert-amount');
const fromCurrency = document.getElementById('from-currency');
const toCurrency = document.getElementById('to-currency');
const convertedResult = document.getElementById('converted-result');
const convertBtn = document.getElementById('convertBtn');
 
let expenses = [];
 
// Fetch the most recent trip for the logged-in user or null if none
const getDefaultTripId = async (profileID) => {
  const { data, error } = await supabase
    .from('trip_planner')
    .select('trip_id')
    .eq('profileID', profileID)
    .order('start_date', { ascending: false })
    .limit(1);
 
  if (error) {
    console.error('Error fetching trip:', error);
    return null;
  }
 
  return data.length > 0 ? data[0].trip_id : null;
};

 
// Add Expense Form Submit Handler
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('expense-category');
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
 
    const name = document.getElementById('expense-name').value.trim();
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const category = document.getElementById('expense-category').value;
    const location = document.getElementById('expense-location').value.trim() || '';
    const date = document.getElementById('expense-date').value || new Date().toISOString();
 
    const user = await getCurrentUser();
    if (!user) {
      alert('Please log in to add expenses.');
      return;
    }
 
    const tripId = await getDefaultTripId(user.profileID);
 
    if (!name || isNaN(amount)) {
      alert('Please enter a valid expense name and amount.');
      return;
    }
 
    const { data, error } = await supabase
      .from('expenses')
      .insert([{
        name,
        amount,
        category,
        location,
        date,
        trip_id: tripId || null,
        profileID: user.profileID
      }]);
 
    if (error) {
      console.error('Insert error:', error);
      alert('Failed to add expense.');
    } else {
      alert('Expense added successfully!');
      form.reset(); // optional: reset form after submission
    }
  });
});
 
// Render Expenses List + Total


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

 
// Delete expense by index


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
  const expense = expenses[index];
  if (!expense) return;
 
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', expense.id);
 
  if (!error) {
    expenses.splice(index, 1);
    renderExpenses();
  } else {
    console.error('Failed to delete expense:', error);
  }
};
 
// Currency Converter Logic
convertBtn.addEventListener('click', async (e) => {
  e.preventDefault();
 
  const amount = parseFloat(convertAmount.value);
  const from = fromCurrency.value;
  const to = toCurrency.value;
 
  if (isNaN(amount) || !from || !to) {
    convertedResult.textContent = 'Please enter valid amount and select currencies.';
    return;
  }
 
try {
  const response = await fetch(`https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`);
  const result = await response.json();
 
  console.log("Conversion API result:", result); // Add this line
 
  if (result && typeof result.result === 'number') {
    convertedResult.textContent = `${amount} ${from} = ${result.result.toFixed(2)} ${to}`;
  } else {
    convertedResult.textContent = 'Conversion failed.';
  }
} catch (err) {
  console.error('Conversion error:', err);
  convertedResult.textContent = 'Error fetching rates.';
}
});
 
 