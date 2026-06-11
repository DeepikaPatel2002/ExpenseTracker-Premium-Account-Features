// Load expenses on page load
window.addEventListener('DOMContentLoaded', () => {
  loadExpenses();
});



// Add Expense
// Add Expense
document.getElementById('expenseForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('token');
  const amount = Number(document.getElementById('amount').value);
  const description = document.getElementById('description').value;

  try {
    const res = await axios.post(

      'http://localhost:4000/expense/add',
      { amount, description },   //  no category here
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
    const res = await axios.get('http://localhost:4000/premium/leaderboard', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const leaderboardBody = document.getElementById('leaderboard-body');
    leaderboardBody.innerHTML = '';

    res.data.forEach((user, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${user.username}</td>
        <td>${user.totalExpense}</td>
      `;
      leaderboardBody.appendChild(tr);
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






// Upgrade to Premium
document.getElementById('upgradeBtn').addEventListener('click', async () => {
  const token = localStorage.getItem('token');
  try {
    await axios.post('http://localhost:4000/user/upgrade', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    alert("Upgraded to premium! Please log out and log back in to refresh your token.");
  } catch (err) {
    alert("Failed to upgrade user");
    console.error(err.response?.data || err);
  }
});


document.getElementById('sendResetBtn')
.addEventListener('click', async () => {

  const email =
    document.getElementById('forgotEmail').value;

  try {

    const res = await axios.post(
      'http://localhost:4000/password/forgotpassword',
      { email }
    );

    alert(res.data.message);

  } catch (err) {

    alert(
      err.response?.data?.message ||
      'Failed to send email'
    );
  }
});
