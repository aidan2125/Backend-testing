 
const form = document.getElementById('expense-form');
const list = document.getElementById('expense-list');
const totalAmount = document.getElementById('total-amount');

let expenses = [];

form.addEventListener('submit', (e) => {
  e.preventDefault();

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
      <strong>${item.name}</strong> ($${item.amount.toFixed(2)}) - ${item.category}
      <button onclick="deleteExpense(${index})">❌</button>
    `;
    list.appendChild(div);
  });

  totalAmount.textContent = total.toFixed(2);
}

window.deleteExpense = (index) => {
  expenses.splice(index, 1);
  renderExpenses();
};
