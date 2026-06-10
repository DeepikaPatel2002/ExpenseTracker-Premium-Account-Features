// Load expenses on page load
window.addEventListener('DOMContentLoaded', () => {
  loadExpenses();
});

// Add Expense
document.getElementById('expenseForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('token');
  const amount = document.getElementById('amount').value;
  const description = document.getElementById('description').value;
  const category = document.getElementById('category').value;

  try {
    const res = await axios.post('http://localhost:4000/expense/add',
      { amount, description, category },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    addExpenseToUI(res.data.expense);
    document.getElementById('expenseForm').reset();
  } catch (err) {
    alert('Failed to add expense');
  }
});

// Load Expenses
async function loadExpenses() {
  const token = localStorage.getItem('token');
  if (!token) return;
  try {
    const res = await axios.get('http://localhost:4000/expense/get',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const expenseList = document.getElementById('expense-list');
    expenseList.innerHTML = '';
    res.data.forEach(expense => addExpenseToUI(expense));
  } catch (err) {
    alert('Failed to load expenses');
  }
}

// Add Expense To UI (Table Row)
function addExpenseToUI(expense) {
  const expenseList = document.getElementById('expense-list');
  const tr = document.createElement('tr');

  tr.innerHTML = `
    <td>${expense.amount}</td>
    <td>${expense.category}</td>
    <td>${expense.description}</td>
    <td>${new Date(expense.createdAt).toLocaleString()}</td>
    <td><button class="delete-btn">Delete</button></td>
  `;

  tr.querySelector('.delete-btn').addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:4000/expense/delete/${expense.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      tr.remove();
    } catch (err) {
      alert('Failed to delete expense');
    }
  });

  expenseList.appendChild(tr);
}

// Leaderboard
document.getElementById('showLeaderboard').addEventListener('click', async () => {
  const token = localStorage.getItem('token');
  try {
    const res = await axios.get('http://localhost:4000/premium/leaderboard',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const leaderboard = document.getElementById('leaderboard');
    leaderboard.innerHTML = '';
    res.data.forEach(user => {
      const li = document.createElement('li');
      li.textContent = `${user.username} - ${user.totalExpense}`;
      leaderboard.appendChild(li);
    });
  } catch (err) {
    alert('Failed to load leaderboard');
  }
});

// Download Report
document.getElementById('downloadBtn').addEventListener('click', () => {
  const token = localStorage.getItem('token');
  window.location.href = `http://localhost:4000/premium/downloadReport?token=${token}`;
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
});
