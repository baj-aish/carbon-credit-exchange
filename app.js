/* =========================================================
   Carbon Credit Hub – FINAL FIXED app.js
   SAME UI • SAME FEATURES • STABLE STATE
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {

/* ---------- Helpers ---------- */
const qs = id => document.getElementById(id);
const qsa = sel => [...document.querySelectorAll(sel)];
const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

/* ---------- Backend ---------- */
const API_BASE = "https://carbon-credit-exchange-backend.onrender.com";

/* ---------- Storage Keys ---------- */
const SESSION_KEY = "ccx_session_v3";
const LAST_SECTION_KEY = "ccx_last_section_v3";

/* ---------- State ---------- */
let state = {
  currentUser: null,
  posts: [],
  users: []
};

let editPostId = null;
let currentChatPostId = null;
let isManualNav = false; // prevents polling UI reset

/* =========================================================
   UI CORE
   ========================================================= */

const showSection = name => {
  isManualNav = true;

  qsa(".section").forEach(s => s.classList.add("hidden"));
  const sec = qs("section-" + name);
  if (sec) sec.classList.remove("hidden");

  qsa(".nav-btn").forEach(btn => {
    const active = btn.dataset.section === name;
    btn.classList.toggle("border-b-emerald-400", active);
    btn.classList.toggle("text-white", active);
  });

  localStorage.setItem(LAST_SECTION_KEY, name);
  setTimeout(() => (isManualNav = false), 200);
};

const saveSession = () => {
  if (state.currentUser)
    localStorage.setItem(SESSION_KEY, JSON.stringify(state.currentUser));
  else
    localStorage.removeItem(SESSION_KEY);
};

const updateAuthUI = () => {
  const u = state.currentUser;

  if (u) {
    qs("loginBtn").classList.add("hidden");
    qs("logoutBtn").classList.remove("hidden");
    qs("userBadge").classList.remove("hidden");
    qs("badgeName").textContent = u.name;
    qs("badgeRole").textContent = u.role;

    qs("heroLoginBtn").classList.add("hidden");
    qs("welcomeName").textContent = u.name;
    qs("welcomeWrapper").classList.remove("hidden");

    qsa(".protected-nav").forEach(b => b.classList.remove("hidden"));
    qs("feedFilters").classList.remove("hidden");

    if (u.role === "admin") qs("adminTab").classList.remove("hidden");
    else qs("adminTab").classList.add("hidden");
  } else {
    qs("loginBtn").classList.remove("hidden");
    qs("logoutBtn").classList.add("hidden");
    qs("userBadge").classList.add("hidden");
    qs("heroLoginBtn").classList.remove("hidden");
    qs("welcomeWrapper").classList.add("hidden");
    qs("adminTab").classList.add("hidden");
    qs("feedFilters").classList.add("hidden");
    qsa(".protected-nav").forEach(b => b.classList.add("hidden"));
  }
};

const requireLogin = () => {
  if (!state.currentUser) {
    alert("Please login first.");
    qs("loginModal").classList.remove("hidden");
    qs("loginModal").classList.remove("pointer-events-none");
    return false;
  }
  return true;
};

/* =========================================================
   AUTH
   ========================================================= */

on(qs("registerForm"), "submit", async e => {
  e.preventDefault();

  const body = {
    name: qs("regName").value.trim(),
    email: qs("regEmail").value.trim(),
    password: qs("regPass").value,
    role: qs("regRole").value
  };

  const res = await fetch(API_BASE + "/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  if (!res.ok) return alert(data.error);

  alert("Registered successfully. Please login.");
  qs("tabLogin").click();
});

on(qs("loginForm"), "submit", async e => {
  e.preventDefault();

  const body = {
    name: qs("loginName").value.trim(),
    password: qs("loginPass").value
  };

  const res = await fetch(API_BASE + "/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  if (!res.ok) return alert(data.error);

  state.currentUser = data;
  saveSession();
  updateAuthUI();
  qs("loginModal").classList.add("hidden");
  qs("loginModal").classList.add("pointer-events-none");
  showSection("feed");
  fetchData(true);
});

/* =========================================================
   DATA FETCH (STABLE POLLING)
   ========================================================= */

const fetchData = async (force = false) => {
  try {
    const pRes = await fetch(API_BASE + "/api/posts");
    if (pRes.ok) state.posts = await pRes.json();

    if (state.currentUser?.role === "admin") {
      const uRes = await fetch(API_BASE + "/api/users");
      if (uRes.ok) state.users = await uRes.json();
      renderAdmin();
    }

    renderFeed();
    renderInbox();

    if (!isManualNav && !force) return;

    if (currentChatPostId) {
      const p = state.posts.find(x => x.id === currentChatPostId);
      if (p) renderChatMessages(p);
    }
  } catch (e) {
    console.error("Fetch error:", e);
  }
};

/* =========================================================
   FEED + FILTERS
   ========================================================= */

const renderFeed = () => {
  const con = qs("feedContainer");
  if (!con) return;

  let arr = state.posts.filter(p => p.status !== "removed");

  const priceFilter = qs("priceFilter")?.value;
  if (priceFilter === "low-high") arr.sort((a, b) => a.price - b.price);
  if (priceFilter === "high-low") arr.sort((a, b) => b.price - a.price);

  const creditsFilter = qs("creditsFilter")?.value;
  if (creditsFilter === "1-10")
    arr = arr.filter(p => p.credits >= 1 && p.credits <= 10);
  if (creditsFilter === "50+")
    arr = arr.filter(p => p.credits >= 50);

  con.innerHTML = arr.map(p => `
    <div class="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden flex flex-col">
      <img src="${p.image}" class="h-44 w-full object-cover">
      <div class="p-3 flex flex-col flex-1">
        <h3 class="font-bold text-sm truncate">${p.title}</h3>
        <p class="text-xs text-slate-400 truncate">${p.desc}</p>
        <div class="flex justify-between text-xs mt-2">
          <span class="text-emerald-400">${p.credits} Credits</span>
          <span class="font-bold">₹${p.price}</span>
        </div>
        <p class="text-[10px] text-slate-500 mt-1">By ${p.user}</p>
        <button onclick="openChat('${p.id}')" class="mt-auto bg-slate-800 text-xs py-1 rounded">💬 Chat</button>
      </div>
    </div>
  `).join("");
};

/* =========================================================
   INBOX + INDICATOR
   ========================================================= */

const renderInbox = () => {
  if (!state.currentUser) return;

  const list = qs("inboxList");
  const indicator = qs("inboxIndicator");

  const items = state.posts.filter(p =>
    p.chatMessages?.some(m =>
      m.from !== state.currentUser.name && !m.seen
    )
  );

  indicator.classList.toggle("hidden", items.length === 0);

  list.innerHTML = items.length
    ? items.map(p => `
        <div onclick="openChat('${p.id}')" class="bg-slate-900 p-3 rounded cursor-pointer border border-slate-700">
          <div class="font-semibold">${p.title}</div>
        </div>
      `).join("")
    : `<p class="text-sm text-slate-400">No messages</p>`;
};

/* =========================================================
   CHAT
   ========================================================= */

window.openChat = id => {
  if (!requireLogin()) return;
  currentChatPostId = id;
  const p = state.posts.find(x => x.id === id);
  if (!p) return;

  qs("chatModal").classList.remove("hidden");
  qs("chatModal").classList.remove("pointer-events-none");
  qs("chatPostTitle").textContent = p.title;

  p.chatMessages?.forEach(m => (m.seen = true));
  renderChatMessages(p);
};

const renderChatMessages = p => {
  const box = qs("chatMessages");
  box.innerHTML = (p.chatMessages || []).map(m => {
    const me = m.from === state.currentUser.name;
    return `
      <div class="flex ${me ? "justify-end" : "justify-start"}">
        <div class="px-2 py-1 rounded text-xs ${me ? "bg-emerald-600" : "bg-slate-800"}">
          <div class="opacity-50 text-[9px]">${m.from}</div>
          ${m.text}
        </div>
      </div>`;
  }).join("");
  box.scrollTop = box.scrollHeight;
};

on(qs("chatForm"), "submit", async e => {
  e.preventDefault();
  const text = qs("chatInput").value.trim();
  if (!text) return;

  await fetch(`${API_BASE}/api/posts/${currentChatPostId}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      from: state.currentUser.name,
      text
    })
  });

  qs("chatInput").value = "";
  fetchData(true);
});

/* =========================================================
   ADMIN
   ========================================================= */

const renderAdmin = () => {
  const box = qs("adminList");
  if (!box) return;

  box.innerHTML = `
    <h3 class="font-bold mb-2">Users</h3>
    ${state.users.map(u => `
      <div class="flex justify-between text-xs bg-slate-900 p-2 mb-1 rounded">
        <span>${u.name} (${u.role})</span>
        <button onclick="deleteUser('${u.id}')" class="text-red-400">Delete</button>
      </div>
    `).join("")}
  `;
};

window.deleteUser = async id => {
  if (!confirm("Delete user?")) return;
  await fetch(`${API_BASE}/api/users/${id}`, { method: "DELETE" });
  fetchData(true);
};

/* =========================================================
   INIT
   ========================================================= */

const saved = localStorage.getItem(SESSION_KEY);
if (saved) state.currentUser = JSON.parse(saved);

updateAuthUI();

const last = localStorage.getItem(LAST_SECTION_KEY);
showSection(state.currentUser && last ? last : "landing");

fetchData(true);
setInterval(fetchData, 4000);

/* ---------- UI EVENTS ---------- */
on(qs("loginBtn"), "click", () => qs("loginModal").classList.remove("hidden"));
on(qs("closeLogin"), "click", () => qs("loginModal").classList.add("hidden"));
on(qs("closeChat"), "click", () => qs("chatModal").classList.add("hidden"));

on(qs("logoutBtn"), "click", () => {
  state.currentUser = null;
  saveSession();
  updateAuthUI();
  showSection("landing");
});

qsa(".nav-btn").forEach(b =>
  on(b, "click", () => {
    if (b.classList.contains("protected-nav") && !requireLogin()) return;
    showSection(b.dataset.section);
  })
);
   });


on(qs("priceFilter"), "change", renderFeed);
on(qs("creditsFilter"), "change", renderFeed);


