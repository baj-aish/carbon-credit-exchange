alert("app.js is loaded");
const API = "https://carbon-credit-exchange-backend.onrender.com";
const qs = id => document.getElementById(id);

let currentUser = JSON.parse(localStorage.getItem("cc_user"));
let posts = [];

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

