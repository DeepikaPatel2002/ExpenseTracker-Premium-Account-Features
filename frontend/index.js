

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
    const res = await axios.post(
      'http://localhost:4000/expense/add',
      { amount, description, category },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    addExpenseToUI(res.data);

    document.getElementById('expenseForm').reset();

  } catch (err) {
    console.error("Expense error:", err.response?.data || err);
    alert('Failed to add expense');
  }
});



// Load Expenses
async function loadExpenses() {
  const token = localStorage.getItem('token');

  console.log("Token being sent:", token);

  if (!token) {
    console.log("No token found");
    return;
  }

  try {
    const res = await axios.get(
      'http://localhost:4000/expense/get',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log("Expenses fetched:", res.data);

    const expenseList = document.getElementById('expense-list');
    expenseList.innerHTML = '';

    res.data.forEach(expense => {
      addExpenseToUI(expense);
    });

  } catch (err) {
    console.error(
      "Load expenses error:",
      err.response?.data || err
    );
  }
}



// Add Expense To UI
function addExpenseToUI(expense) {
  const expenseList = document.getElementById('expense-list');

  const li = document.createElement('li');

  li.innerHTML = `
    ${expense.amount} - ${expense.description} - ${expense.category}
    <button class="delete-btn">Delete Expense</button>
  `;

  li.querySelector('button').addEventListener('click', async () => {
    try {
      const token = localStorage.getItem('token');

      await axios.delete(
        `http://localhost:4000/expense/delete/${expense.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      li.remove();

    } catch (err) {
      console.error(
        "Delete error:",
        err.response?.data || err
      );
    }
  });

  expenseList.appendChild(li);
}
