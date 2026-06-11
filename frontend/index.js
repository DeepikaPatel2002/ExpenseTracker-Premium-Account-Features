let allExpenses = [];
let currentFilter = "all";
let isPremiumUser = false;

// ================= INIT =================
window.addEventListener("DOMContentLoaded", () => {
  loadExpenses();
  attachEventListeners();
});

// ================= ATTACH EVENTS =================
function attachEventListeners() {

  // LEADERBOARD
  document.getElementById("showLeaderboard").addEventListener("click", async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await axios.get("http://localhost:4000/premium/leaderboard", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const body = document.getElementById("leaderboard-body");
      body.innerHTML = "";

      res.data.forEach((user, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${index + 1}</td>
          <td>${user.username}</td>
          <td>${user.totalExpense}</td>
        `;
        body.appendChild(tr);
      });

    } catch (err) {
      console.log(err);
      alert("Failed to load leaderboard");
    }
  });

  // DOWNLOAD REPORT
  document.getElementById("downloadBtn").addEventListener("click", () => {
    if (!isPremiumUser) {
      alert("Upgrade to Premium to download report");
      return;
    }

    const data = getFilteredData();

    let csv = "Type,Amount,Category,Description,Date\n";

    data.forEach(item => {
      csv += `${item.type || "expense"},${item.amount},${item.category || "-"},${item.description},${item.createdAt}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "expense-report.csv";
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

      alert("Upgraded to premium! Please login again.");
    } catch (err) {
      alert("Upgrade failed");
    }
  });

  // EXPENSE FORM
  document.getElementById("expenseForm").addEventListener("submit", addExpense);
}

// ================= LOAD EXPENSES =================
async function loadExpenses() {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const res = await axios.get("http://localhost:4000/expense/get", {
      headers: { Authorization: `Bearer ${token}` }
    });

    allExpenses = res.data || [];
    renderReport();
  } catch (err) {
    alert("Failed to load data");
  }
}

// ================= ADD EXPENSE =================
async function addExpense(e) {
  e.preventDefault();

  const token = localStorage.getItem("token");
  const amount = Number(document.getElementById("amount").value);
  const description = document.getElementById("description").value;

  try {
    const res = await axios.post(
      "http://localhost:4000/expense/add",
      { amount, description },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    allExpenses.push(res.data.expense);
    renderReport();

    document.getElementById("expenseForm").reset();
  } catch (err) {
    alert("Failed to add expense");
  }
}

// ================= FILTER =================
function setFilter(type) {
  currentFilter = type;
  renderReport();
}

// ================= FILTER DATA =================
function getFilteredData() {
  const today = new Date();

  return allExpenses.filter(item => {
    const d = new Date(item.createdAt);

    if (currentFilter === "daily") {
      return d.toDateString() === today.toDateString();
    }

    if (currentFilter === "weekly") {
      const diff = (today - d) / (1000 * 60 * 60 * 24);
      return diff <= 7;
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

// ================= RENDER REPORT =================
function renderReport() {
  const tbody = document.getElementById("expense-list");
  tbody.innerHTML = "";

  const data = getFilteredData();

  let totalIncome = 0;
  let totalExpense = 0;

  data.forEach(item => {
    const amount = Number(item.amount);
    const type = item.type || "expense";

    if (type === "income") {
      totalIncome += amount;
    } else {
      totalExpense += amount;
    }

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${item.amount}</td>
      <td>${item.category || "-"}</td>
      <td>${item.description}</td>
      <td>${new Date(item.createdAt).toLocaleString()}</td>
      <td><button class="delete-btn">Delete</button></td>
    `;

    tr.querySelector(".delete-btn").addEventListener("click", async () => {
      const token = localStorage.getItem("token");

      try {
        await axios.delete(
          `http://localhost:4000/expense/delete/${item.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        allExpenses = allExpenses.filter(e => e.id !== item.id);
        renderReport();
      } catch (err) {
        alert("Delete failed");
      }
    });

    tbody.appendChild(tr);
  });

  // SUMMARY UPDATE
  document.getElementById("totalIncome").innerText = "₹" + totalIncome;
  document.getElementById("totalExpense").innerText = "₹" + totalExpense;
  document.getElementById("balance").innerText = "₹" + (totalIncome - totalExpense);
}