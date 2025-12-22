/* =========================================================
   Carbon Credit Hub – FINAL WORKING app.js
   UI UNCHANGED | BUTTONS WORK | FIREBASE BACKEND
   ========================================================= */

/* ---------- Backend ---------- */
const API_BASE = "https://carbon-credit-exchange-backend.onrender.com";

/* ---------- State ---------- */
let currentUser = JSON.parse(localStorage.getItem("cc_currentUser")) || null;
let posts = [];

/* ---------- DOM ---------- */
const feedContainer = document.getElementById("feedContainer");
const emptyFeedMsg = document.getElementById("emptyFeedMsg");
const adminList = document.getElementById("adminList");
const adminTab = document.getElementById("adminTab");
const userBadge = document.getElementById("userBadge");
const badgeName = document.getElementById("badgeName");
const badgeRole = document.getElementById("badgeRole");
const priceFilter = document.getElementById("priceFilter");
const creditsFilter = document.getElementById("creditsFilter");

/* ---------- Helpers ---------- */
function requireLogin() {
  if (!currentUser) {
    alert("Please login first.");
    document.getElementById("loginModal").classList.remove("hidden");
    return false;
  }
  return true;
}

function updateAuthUI() {
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (currentUser) {
    loginBtn.classList.add("hidden");
    logoutBtn.classList.remove("hidden");
    userBadge.classList.remove("hidden");
    badgeName.textContent = currentUser.name;
    badgeRole.textContent = currentUser.role;
    adminTab.classList.toggle("hidden", currentUser.role !== "admin");
  } else {
    loginBtn.classList.remove("hidden");
    logoutBtn.classList.add("hidden");
    userBadge.classList.add("hidden");
    adminTab.classList.add("hidden");
  }
}

/* ---------- Load Posts ---------- */
async function loadPostsFromServer() {
  try {
    const res = await fetch(`${API_BASE}/api/posts`);
    posts = await res.json();
    renderFeed();
  } catch (err) {
    console.error("Failed to load posts", err);
  }
}

/* ---------- Filters ---------- */
function getFilteredPosts() {
  let arr = posts.filter(p => p.status !== "removed");

  const cf = creditsFilter.value;
  if (cf !== "all") {
    arr = arr.filter(p => {
      const c = Number(p.credits || 0);
      if (cf === "1-10") return c >= 1 && c <= 10;
      if (cf === "50+") return c > 50;
      return true;
    });
  }

  const pf = priceFilter.value;
  if (pf === "low-high") arr.sort((a, b) => a.price - b.price);
  if (pf === "high-low") arr.sort((a, b) => b.price - a.price);

  return arr;
}

/* ---------- Render Feed ---------- */
function renderFeed() {
  const visible = getFilteredPosts();

  if (!visible.length) {
    feedContainer.innerHTML = "";
    emptyFeedMsg.classList.remove("hidden");
    return;
  }
  emptyFeedMsg.classList.add("hidden");

  feedContainer.innerHTML = visible.map(p => `
    <article class="bg-white rounded-2xl shadow overflow-hidden flex flex-col">
      <img src="${p.image}" class="w-full h-44 object-cover">
      <div class="p-3 flex-1 flex flex-col">
        <h3 class="font-semibold text-sm mb-1">${p.title}</h3>
        <p class="text-xs text-slate-600 mb-1">${p.desc}</p>
        <div class="flex justify-between text-[11px] mb-2">
          <span>${p.credits || 0} credits</span>
          <span class="font-semibold">₹${p.price || 0}</span>
        </div>
        <p class="text-[11px] text-slate-400 mb-2">By ${p.user}</p>
        <button data-like="${p.id}" class="border rounded px-2 py-1 text-xs">
          ❤️ Like (${p.likes || 0})
        </button>
      </div>
    </article>
  `).join("");
}

/* ---------- Render Admin ---------- */
function renderAdmin() {
  if (!currentUser || currentUser.role !== "admin") {
    adminList.innerHTML = `<p class="text-sm">Not authorized</p>`;
    return;
  }

  adminList.innerHTML = posts.map(p => `
    <div class="bg-white p-3 rounded flex justify-between text-sm">
      <div>
        <p class="font-semibold">${p.title}</p>
        <p class="text-xs">By ${p.user}</p>
      </div>
      <button data-toggle="${p.id}" class="border px-3 py-1 rounded text-xs">
        ${p.status === "removed" ? "Restore" : "Remove"}
      </button>
    </div>
  `).join("");
}

/* ---------- Navigation ---------- */
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.section;
    document.querySelectorAll(".section").forEach(sec => sec.classList.add("hidden"));
    document.getElementById(`section-${target}`).classList.remove("hidden");
    if (target === "admin") renderAdmin();
  });
});

/* ---------- Login ---------- */
document.getElementById("loginForm").addEventListener("submit", async e => {
  e.preventDefault();
  const name = document.getElementById("loginName").value.trim();
  if (!name) return;

  try {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error);
      return;
    }

    currentUser = await res.json();
    localStorage.setItem("cc_currentUser", JSON.stringify(currentUser));
    updateAuthUI();
    document.getElementById("loginModal").classList.add("hidden");
  } catch {
    alert("Server error");
  }
});

/* ---------- Logout ---------- */
document.getElementById("logoutBtn").addEventListener("click", () => {
  currentUser = null;
  localStorage.removeItem("cc_currentUser");
  updateAuthUI();
});

/* ---------- Upload ---------- */
document.getElementById("uploadForm").addEventListener("submit", e => {
  e.preventDefault();
  if (!requireLogin()) return;

  const reader = new FileReader();
  const file = document.getElementById("postImage").files[0];
  if (!file) return alert("Select image");

  reader.onload = async ev => {
    const post = {
      title: postTitle.value,
      desc: postDesc.value,
      price: +postPrice.value,
      credits: +postCredits.value,
      image: ev.target.result,
      user: currentUser.name
    };

    await fetch(`${API_BASE}/api/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(post)
    });

    loadPostsFromServer();
    e.target.reset();
  };
  reader.readAsDataURL(file);
});

/* ---------- Feed Actions ---------- */
feedContainer.addEventListener("click", e => {
  const id = e.target.dataset.like;
  if (!id || !requireLogin()) return;

  const post = posts.find(p => p.id === id);
  fetch(`${API_BASE}/api/posts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ likes: (post.likes || 0) + 1 })
  }).then(loadPostsFromServer);
});

/* ---------- Admin Actions ---------- */
adminList.addEventListener("click", e => {
  const id = e.target.dataset.toggle;
  if (!id) return;

  const post = posts.find(p => p.id === id);
  fetch(`${API_BASE}/api/posts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status: post.status === "removed" ? "active" : "removed"
    })
  }).then(loadPostsFromServer);
});

/* ---------- Init ---------- */
updateAuthUI();
loadPostsFromServer();


