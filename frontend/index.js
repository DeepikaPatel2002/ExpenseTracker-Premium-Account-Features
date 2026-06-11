let allExpenses = [];
let currentFilter = "all";
let isPremiumUser = false;

// ================= PAGINATION =================
let currentPage = 1;
let limit = Number(localStorage.getItem("limit")) || 10;

// ================= INIT =================
window.addEventListener("DOMContentLoaded", () => {
  attachEvents();
  loadExpenses();

  // set dropdown value from storage
  const limitSelect = document.getElementById("limitSelect");
  if (limitSelect) {
    limitSelect.value = limit;

    limitSelect.addEventListener("change", (e) => {
      limit = Number(e.target.value);
      localStorage.setItem("limit", limit);

      currentPage = 1; // reset page
      render();
    });
  }
});

// ================= EVENTS =================
function attachEvents() {

  // LEADERBOARD
  document.getElementById("showLeaderboard").addEventListener("click", async () => {
    const token = localStorage.getItem("token");

    const res = await axios.get("http://localhost:4000/premium/leaderboard", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const body = document.getElementById("leaderboard-body");
    body.innerHTML = "";

    res.data.forEach((u, i) => {
      body.innerHTML += `
        <tr>
          <td>${i + 1}</td>
          <td>${u.username}</td>
          <td>${u.totalExpense}</td>
        </tr>
      `;
    });
  });

  // DOWNLOAD
  document.getElementById("downloadBtn").addEventListener("click", () => {

    if (!isPremiumUser) {
      alert("Premium feature. Upgrade required.");
      return;
    }

    const data = filterData();

    let csv = "Type,Amount,Category,Description,Date\n";

    data.forEach(item => {
      csv += `${item.type || "expense"},${item.amount},${item.category || "-"},${item.description},${item.createdAt}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "report.csv";
    a.click();
  });

  // LOGOUT
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
  });

  // UPGRADE
  document.getElementById("upgradeBtn").addEventListener("click", async () => {
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        "http://localhost:4000/user/upgrade",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      isPremiumUser = true;
      alert("Upgraded to Premium successfully!");
    } catch (err) {
      alert("Upgrade failed");
    }
  });

  // FORM
  document.getElementById("expenseForm").addEventListener("submit", addExpense);

  // PAGINATION BUTTONS
  document.getElementById("prevBtn").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      render();
    }
  });

  document.getElementById("nextBtn").addEventListener("click", () => {
    const data = filterData();
    const totalPages = Math.ceil(data.length / limit);

    if (currentPage < totalPages) {
      currentPage++;
      render();
    }
  });
}

// ================= LOAD =================
async function loadExpenses() {
  const token = localStorage.getItem("token");

  const res = await axios.get("http://localhost:4000/expense/get", {
    headers: { Authorization: `Bearer ${token}` }
  });

  allExpenses = res.data || [];
  render();
}

// ================= ADD =================
async function addExpense(e) {
  e.preventDefault();

  const token = localStorage.getItem("token");

  const amount = document.getElementById("amount").value;
  const description = document.getElementById("description").value;

  const res = await axios.post(
    "http://localhost:4000/expense/add",
    { amount, description },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  allExpenses.push(res.data.expense);

  currentPage = 1; // reset page after add
  render();
}

// ================= FILTER =================
function setFilter(type) {
  currentFilter = type;
  currentPage = 1;
  render();
}

// ================= FILTER DATA =================
function filterData() {
  const today = new Date();

  return allExpenses.filter(item => {
    const d = new Date(item.createdAt);

    if (currentFilter === "daily") {
      return d.toDateString() === today.toDateString();
    }

    if (currentFilter === "weekly") {
      return (today - d) / (1000 * 60 * 60 * 24) <= 7;
    }

    if (currentFilter === "monthly") {
      return (
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
      );
    }

    return true;
  });
}

// ================= RENDER =================
function render() {

  const tbody = document.getElementById("expense-list");
  tbody.innerHTML = "";

  const data = filterData();

  const totalPages = Math.ceil(data.length / limit);

  if (currentPage > totalPages) currentPage = totalPages || 1;

  const start = (currentPage - 1) * limit;
  const end = start + limit;

  const paginatedData = data.slice(start, end);

  let income = 0;
  let expense = 0;

  paginatedData.forEach(item => {

    const amount = Number(item.amount);
    const type = item.type || "expense";

    if (type === "income") income += amount;
    else expense += amount;

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${item.amount}</td>
      <td>${item.category || "-"}</td>
      <td>${item.description}</td>
      <td>${new Date(item.createdAt).toLocaleString()}</td>
      <td><button onclick="deleteItem('${item.id || item._id}')">Delete</button></td>
    `;

    tbody.appendChild(tr);
  });

  document.getElementById("totalIncome").innerText = "₹" + income;
  document.getElementById("totalExpense").innerText = "₹" + expense;
  document.getElementById("balance").innerText = "₹" + (income - expense);

  // pagination UI
  document.getElementById("pageInfo").innerText =
    `Page ${currentPage} of ${totalPages || 1}`;

  document.getElementById("prevBtn").disabled = currentPage === 1;
  document.getElementById("nextBtn").disabled =
    currentPage === totalPages || totalPages === 0;
}

// ================= DELETE =================
async function deleteItem(id) {
  const token = localStorage.getItem("token");

  await axios.delete(`http://localhost:4000/expense/delete/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  allExpenses = allExpenses.filter(e => (e.id || e._id) != id);
  render();
}