const API = "https://carbon-credit-exchange-backend.onrender.com";
const qs = id => document.getElementById(id);

let currentUser = JSON.parse(localStorage.getItem("cc_user"));
let posts = [];

window.addEventListener("DOMContentLoaded", () => {
  console.log("DOM READY");
  bindEvents();
  updateAuthUI();
  loadPosts();
});

// ---------- UI ----------
const updateAuthUI = () => {
  qs("loginBtn").classList.toggle("hidden", !!currentUser);
  qs("logoutBtn").classList.toggle("hidden", !currentUser);
  qs("userBadge").classList.toggle("hidden", !currentUser);

  if (currentUser) {
    qs("badgeName").textContent = currentUser.name;
    qs("badgeRole").textContent = currentUser.role;
  }
};
function updateAuthUI() {
  const loggedIn = !!currentUser;

  qs("loginBtn").classList.toggle("hidden", loggedIn);
  qs("logoutBtn").classList.toggle("hidden", !loggedIn);
  qs("userBadge").classList.toggle("hidden", !loggedIn);

  if (loggedIn) {
    qs("badgeName").textContent = currentUser.name;
    qs("badgeRole").textContent = currentUser.role;
  }
}
function showSection(id) {
  document.querySelectorAll(".section").forEach(s => {
    s.classList.add("hidden");
  });
  const el = document.getElementById("section-" + id);
  el && el.classList.remove("hidden");
}


// ---------- LOAD POSTS ----------
const loadPosts = async () => {
  const res = await fetch(API + "/api/posts");
  posts = await res.json();
  renderFeed();
};

// ---------- FEED ----------
const renderFeed = () => {
  const box = qs("feedContainer");
  box.innerHTML = posts.map(p => `
    <div class="bg-slate-900 p-3 rounded-xl border">
      <img src="${p.image}" class="h-40 w-full object-cover rounded mb-2"/>
      <h3 class="font-semibold">${p.title}</h3>
      <p class="text-xs">${p.desc}</p>
      <p class="text-xs mt-1">${p.credits} credits • ₹${p.price}</p>
      <button onclick="likePost('${p.id}', ${p.likes})"
        class="text-xs mt-2 border px-2 py-1 rounded">
        ❤️ ${p.likes}
      </button>
      <button onclick="openChat('${p.id}')"
        class="text-xs mt-2 ml-2 border px-2 py-1 rounded">
        💬 Chat
      </button>
    </div>
  `).join("");
};

function bindEvents() {
  // Login modal open
  const loginBtn = qs("loginBtn");
  const heroLoginBtn = qs("heroLoginBtn");
  const closeLogin = qs("closeLogin");
  const loginModal = qs("loginModal");

//  loginBtn && (loginBtn.onclick = () => loginModal.classList.remove("hidden"));
 // heroLoginBtn && (heroLoginBtn.onclick = () => loginModal.classList.remove("hidden"));
 // closeLogin && (closeLogin.onclick = () => loginModal.classList.add("hidden"));

  // Forms
  const registerForm = qs("registerForm");
  const loginForm = qs("loginForm");

//  registerForm && (registerForm.onsubmit = registerUser);
//  loginForm && (loginForm.onsubmit = loginUser);

  // Logout
  const logoutBtn = qs("logoutBtn");
  logoutBtn && (logoutBtn.onclick = logoutUser);
}
async function registerUser(e) {
  e.preventDefault();

  const name = qs("regName").value.trim();
  const email = qs("regEmail").value.trim();

  if (!name || !email) return alert("Fill all fields");

  const res = await fetch(API + "/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password: "123456" })
  });

  if (!res.ok) return alert("Registration failed");

  alert("Registered successfully. Please login.");
}

async function loginUser(e) {
  e.preventDefault();

  const name = qs("loginName").value.trim();
  if (!name) return alert("Enter username");

  const res = await fetch(API + "/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });

  if (!res.ok) return alert("User not found");

  currentUser = await res.json();
  localStorage.setItem("cc_user", JSON.stringify(currentUser));

  updateAuthUI();
  qs("loginModal").classList.add("hidden");
}

function logoutUser() {
  localStorage.removeItem("cc_user");
  currentUser = null;
  updateAuthUI();
}
function updateAuthUI() {
  const loggedIn = !!currentUser;

  qs("loginBtn").classList.toggle("hidden", loggedIn);
  qs("logoutBtn").classList.toggle("hidden", !loggedIn);
  qs("userBadge").classList.toggle("hidden", !loggedIn);

  if (loggedIn) {
    qs("badgeName").textContent = currentUser.name;
    qs("badgeRole").textContent = currentUser.role;
  }
}

// ---------- ACTIONS ----------
window.likePost = async (id, likes) => {
  if (!currentUser) return alert("Login first");
  await fetch(API + "/api/posts/" + id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ likes: likes + 1 })
  });
  loadPosts();
};

window.openChat = id => {
  localStorage.setItem("chat_post", id);
  qs("chatModal").classList.remove("hidden");
};

// ---------- AUTH ----------
qs("registerForm").onsubmit = async e => {
  e.preventDefault();
  const body = {
    name: qs("regName").value,
    email: qs("regEmail").value,
    password: "123456"
  };
  const r = await fetch(API + "/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (r.ok) alert("Registered. Login now.");
};

qs("loginForm").onsubmit = async e => {
  e.preventDefault();
  const name = qs("loginName").value;
  const r = await fetch(API + "/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });
  if (!r.ok) return alert("User not found");
  currentUser = await r.json();
  localStorage.setItem("cc_user", JSON.stringify(currentUser));
  updateAuthUI();
  loadPosts();
  qs("loginModal").classList.add("hidden");
};

qs("logoutBtn").onclick = () => {
  currentUser = null;
  localStorage.removeItem("cc_user");
  updateAuthUI();
};

// ---------- INIT ----------
updateAuthUI();
loadPosts();
document.addEventListener("click", async e => {
  const t = e.target;

  // LOGIN OPEN
  if (t.id === "loginBtn" || t.id === "heroLoginBtn") {
    qs("loginModal").classList.remove("hidden");
  }

  // LOGIN CLOSE
  if (t.id === "closeLogin") {
    qs("loginModal").classList.add("hidden");
  }

  // LOGOUT
  if (t.id === "logoutBtn") {
    localStorage.removeItem("cc_user");
    currentUser = null;
    updateAuthUI();
  }
});
document.addEventListener("submit", async e => {
  e.preventDefault();

  // REGISTER
  if (e.target.id === "registerForm") {
    const name = qs("regName").value.trim();
    const email = qs("regEmail").value.trim();

    if (!name || !email) return alert("Fill all fields");

    const res = await fetch(API + "/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password: "123456" })
    });

    if (!res.ok) return alert("Registration failed");

    alert("Registered. Please login.");
  }

  // LOGIN
  if (e.target.id === "loginForm") {
    const name = qs("loginName").value.trim();
    if (!name) return alert("Enter username");

    const res = await fetch(API + "/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });

    if (!res.ok) return alert("User not found");

    currentUser = await res.json();
    localStorage.setItem("cc_user", JSON.stringify(currentUser));

    updateAuthUI();
    qs("loginModal").classList.add("hidden");
    function showSection(name) {
  document.querySelectorAll(".section").forEach(sec => {
    sec.classList.add("hidden");
  });

  const active = document.getElementById("section-" + name);
  if (active) active.classList.remove("hidden");
}
// SHOW LANDING PAGE ON FIRST LOAD
window.addEventListener("DOMContentLoaded", () => {
  showSection("landing");
});

  }
});






