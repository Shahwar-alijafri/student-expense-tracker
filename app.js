// Default monthly budget
const MONTHLY_BUDGET = 5000;

// State management: LocalStorage se load ya empty array
let transactions = JSON.parse(localStorage.getItem('expenses')) || [];

// DOM Elements
const form = document.getElementById('expense-form');
const descInput = document.getElementById('desc');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const list = document.getElementById('transaction-list');

const budgetDisplay = document.getElementById('budget-display');
const expenseDisplay = document.getElementById('expense-display');
const balanceDisplay = document.getElementById('balance-display');
const alertBox = document.getElementById('budget-alert');

let expenseChart = null;

// Initialize Chart.js
function initChart() {
  const ctx = document.getElementById('expenseChart').getContext('2d');
  expenseChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: [
          '#f87171', '#60a5fa', '#fbbf24', '#34d399', '#a78bfa'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}

// Update Totals and Budget Alert
function updateOverview() {
  const totalSpent = transactions.reduce((acc, curr) => acc + curr.amount, 0);
  const remaining = MONTHLY_BUDGET - totalSpent;

  budgetDisplay.textContent = `₹${MONTHLY_BUDGET.toLocaleString('en-IN')}`;
  expenseDisplay.textContent = `₹${totalSpent.toLocaleString('en-IN')}`;
  balanceDisplay.textContent = `₹${remaining.toLocaleString('en-IN')}`;

  if (remaining < 0) {
    balanceDisplay.style.color = '#dc2626';
  } else {
    balanceDisplay.style.color = '#16a34a';
  }

  // 80% Budget crossed warning
  if (totalSpent >= MONTHLY_BUDGET * 0.8) {
    alertBox.classList.remove('hidden');
  } else {
    alertBox.classList.add('hidden');
  }
}

// Render Transactions in List
function renderList() {
  list.innerHTML = '';
  if (transactions.length === 0) {
    list.innerHTML = '<li style="text-align:center; color:#9ca3af; padding:12px;">No transactions added yet.</li>';
    return;
  }

  transactions.forEach((item) => {
    const li = document.createElement('li');
    li.classList.add('transaction-item');
    li.innerHTML = `
      <div class="item-left">
        <strong>${item.desc}</strong>
        <span class="item-cat">${item.category}</span>
      </div>
      <div class="item-right">
        <span class="item-amount">-₹${item.amount.toLocaleString('en-IN')}</span>
        <button class="delete-btn" onclick="deleteTransaction(${item.id})">×</button>
      </div>
    `;
    list.prepend(li);
  });
}

// Update Chart Data
function updateChart() {
  const categoryTotals = {};

  transactions.forEach(item => {
    categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.amount;
  });

  expenseChart.data.labels = Object.keys(categoryTotals);
  expenseChart.data.datasets[0].data = Object.values(categoryTotals);
  expenseChart.update();
}

// Sync to LocalStorage & Refresh UI
function updateUI() {
  localStorage.setItem('expenses', JSON.stringify(transactions));
  updateOverview();
  renderList();
  updateChart();
}

// Add Expense Handler
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const newExpense = {
    id: Date.now(),
    desc: descInput.value.trim(),
    amount: parseFloat(amountInput.value),
    category: categoryInput.value
  };

  transactions.push(newExpense);
  updateUI();

  // Reset form inputs
  descInput.value = '';
  amountInput.value = '';
});

// Delete Transaction
window.deleteTransaction = function(id) {
  transactions = transactions.filter(item => item.id !== id);
  updateUI();
};

// Initial App Boot
initChart();
updateUI();