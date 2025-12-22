/* =========================================================
   Carbon Credit Exchange – Clean Firebase-backed app.js
   SAME UI / SAME FEATURES / NO JWT / FIXED SESSION
   ========================================================= */

/* ---------- Helpers ---------- */
const qs = id => document.getElementById(id);
const qsa = sel => [...document.querySelectorAll(sel)];
const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

/* ---------- Backend ---------- */
const API_BASE = "https://carbon-credit-exchange-backend.onrender.com";

/* ---------- Session ---------- */
const SESSION_KEY = "cc_session_v1";
let currentUser = null;

/* ---------- App State ---------- */
let posts = [];

/* ---------- Session Restore ---------- */
const restoreSession = () => {
  const saved = localStorage.getItem(SESSION_KEY);
  if (saved) {
    currentUser = JSON.parse(saved);
    updateAuthUI();
    loadPosts();
  }
};

/* ---------- Auth UI ---------- */
const updateAuthUI = () => {
  qs("authBtn").textContent = currentUser ? "Logout" : "Login";
  qs("welcomeText").textContent = currentUser
    ? `Welcome, ${currentUser.name}`
    : "";

  qsa(".protected").forEach(sec => {
    sec.classList.toggle("hidden", !currentUser);
  });

  qs("adminSection")?.classList.toggle(
    "hidden",
    !(currentUser && currentUser.role === "admin")
  );
};

/* ---------- Auth Actions ---------- */
const login = async name => {
  const res = await fetch(`${API_BASE}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });

  if (!res.ok) {
    alert("User not found");
    return;
  }

  currentUser = await res.json();
  localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
  updateAuthUI();
  loadPosts();
};

const logout = () => {
  localStorage.removeItem(SESSION_KEY);
  currentUser = null;
  updateAuthUI();
};

/* ---------- Posts ---------- */
const loadPosts = async () => {
  const res = await fetch(`${API_BASE}/api/posts`);
  posts = await res.json();
  renderFeed();
};

const createPost = async data => {
  await fetch(`${API_BASE}/api/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...data,
      author: currentUser.name
    })
  });
  loadPosts();
};

const likePost = async id => {
  await fetch(`${API_BASE}/api/posts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "like" })
  });
  loadPosts();
};

const removePost = async id => {
  await fetch(`${API_BASE}/api/posts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "remove" })
  });
  loadPosts();
};

/* ---------- Render ---------- */
const renderFeed = () => {
  const feed = qs("feedList");
  if (!feed) return;

  feed.innerHTML = "";
  posts.forEach(p => {
    const el = document.createElement("div");
    el.className = "card";
    el.innerHTML = `
      <h3>${p.title}</h3>
      <p>${p.content}</p>
      <button onclick="likePost('${p.id}')">❤️ ${p.likes || 0}</button>
      ${
        currentUser?.role === "admin"
          ? `<button onclick="removePost('${p.id}')">Remove</button>`
          : ""
      }
    `;
    feed.appendChild(el);
  });
};

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  restoreSession();

  on(qs("loginBtn"), "click", () => {
    const name = qs("loginName").value.trim();
    if (name) login(name);
  });

  on(qs("logoutBtn"), "click", logout);

  on(qs("postForm"), "submit", e => {
    e.preventDefault();
    createPost({
      title: qs("postTitle").value,
      content: qs("postContent").value
    });
  });
});

