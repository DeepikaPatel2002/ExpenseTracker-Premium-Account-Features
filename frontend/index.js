

let allExpenses = [];
let currentFilter = "all";
let isPremiumUser = false;

// ================= TOKEN PARSE =================
function parseToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    return null;
  }
}

// ================= PAGINATION =================
let currentPage = 1;
let limit = Number(localStorage.getItem("limit")) || 10;

// detect premium from token
const tokenData = parseToken();
if (tokenData?.isPremiumUser) {
  isPremiumUser = true;
}

// ================= INIT =================
window.addEventListener("DOMContentLoaded", () => {
  attachEvents();
  loadExpenses();

  const limitSelect = document.getElementById("limitSelect");

  if (limitSelect) {
    limitSelect.value = limit;

    limitSelect.addEventListener("change", (e) => {
      limit = Number(e.target.value);
      localStorage.setItem("limit", limit);

      currentPage = 1;
      render();
    });
  }
});

// ================= EVENTS =================
function attachEvents() {

  // LEADERBOARD
  document.getElementById("showLeaderboard")?.addEventListener("click", async () => {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      "http://localhost:4000/premium/leaderboard",
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const body = document.getElementById("leaderboard-body");
    if (!body) return;

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
  document.getElementById("downloadBtn")?.addEventListener("click", () => {

    if (!isPremiumUser) {
      alert("Upgrade to premium to download report");
      return;
    }

    const data = filterData();

    let csv = "Type,Amount,Category,Description,Note,Date\n";

    data.forEach(item => {
      csv += `${item.type || "expense"},${item.amount},${item.category || "-"},${item.description},${item.note || "-"},${item.createdAt}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "report.csv";
    a.click();
  });

  // LOGOUT
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
  });

  // UPGRADE
  document.getElementById("upgradeBtn")?.addEventListener("click", async () => {
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        "http://localhost:4000/user/upgrade",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      isPremiumUser = true;
      alert("Upgraded successfully!");
    } catch (err) {
      alert("Upgrade failed");
    }
  });

  // FORM
  document.getElementById("expenseForm")?.addEventListener("submit", addExpense);

  // PAGINATION
  document.getElementById("prevBtn")?.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      render();
    }
  });

  document.getElementById("nextBtn")?.addEventListener("click", () => {
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
  const note = document.getElementById("note")?.value || "";

  const res = await axios.post(
    "http://localhost:4000/expense/add",
    { amount, description, note },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  allExpenses.push(res.data.expense);
  render();

  document.getElementById("expenseForm").reset();
}

// ================= FILTER =================
function setFilter(type) {
  currentFilter = type;
  currentPage = 1;

  console.log("FILTER SELECTED:", type);

  document.getElementById("filter-all")?.classList.remove("filter-active");
  document.getElementById("filter-daily")?.classList.remove("filter-active");
  document.getElementById("filter-weekly")?.classList.remove("filter-active");
  document.getElementById("filter-monthly")?.classList.remove("filter-active");

  document.getElementById(`filter-${type}`)?.classList.add("filter-active");

  render();
}
// ================= FILTER DATA =================
function filterData() {
  const today = new Date();

  const result = allExpenses.filter(item => {
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

  console.log("FILTER:", currentFilter, "RESULT:", result); // 👈 ADD THIS

  return result;
}



// ================= RENDER =================
function render() {

  const tbody = document.getElementById("expense-list");
  if (!tbody) return;

  tbody.innerHTML = "";

  const data = filterData();

  const totalPages = Math.ceil(data.length / limit) || 1;

  if (currentPage > totalPages) currentPage = totalPages;

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
      <td>${item.note || "-"}</td>
      <td>${new Date(item.createdAt).toLocaleString()}</td>
      <td><button onclick="deleteItem('${item.id || item._id}')">Delete</button></td>
    `;

    tbody.appendChild(tr);
  });

  document.getElementById("totalIncome").innerText = "₹" + income;
  document.getElementById("totalExpense").innerText = "₹" + expense;
  document.getElementById("balance").innerText = "₹" + (income - expense);

  const pageInfo = document.getElementById("pageInfo");

  if (pageInfo) {
    pageInfo.innerText = `Page ${currentPage} of ${totalPages}`;
  }

  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  if (prevBtn) prevBtn.disabled = currentPage === 1;
  if (nextBtn) nextBtn.disabled = currentPage === totalPages;
}

// ================= DELETE =================
async function deleteItem(id) {
  const token = localStorage.getItem("token");

  try {
    await axios.delete(
      `http://localhost:4000/expense/delete/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    allExpenses = allExpenses.filter(e => (e.id || e._id) != id);
    render();

  } catch (err) {
    console.log(err);
    alert("Delete failed");
  }
}