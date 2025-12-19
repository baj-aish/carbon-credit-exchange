/* =========================================================
   Carbon Credit Exchange – Firebase Compatible app.js
   SAME UI / SAME FEATURES / CLEAN STATE
   ========================================================= */

/* ---------- Helpers ---------- */
const qs = id => document.getElementById(id);
const qsa = sel => [...document.querySelectorAll(sel)];
const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

/* ---------- Backend ---------- */
const API_BASE = "https://carbon-credit-exchange-backend.onrender.com";

/* ---------- State ---------- */
let state = {
  currentUser: null,
  posts: []
};

const SESSION_KEY = "ccx_session_v1";
const LAST_SECTION_KEY = "ccx_last_section_v1";
const PROTECTED_SECTIONS = ["feed", "upload", "calculator", "admin", "inbox"];

/* ---------- API helpers ---------- */
const api = async (path, method = "GET", body) => {
  const res = await fetch(API_BASE + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};

/* ---------- Session ---------- */
const saveSession = () => {
  if (!state.currentUser) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(state.currentUser));
};

const restoreSession = () => {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return;
  try {
    state.currentUser = JSON.parse(raw);
  } catch {
    localStorage.removeItem(SESSION_KEY);
  }
};

/* ---------- Navigation ---------- */
const showSection = name => {
  qsa(".section").forEach(s => s.classList.add("hidden"));
  qs("section-" + name)?.classList.remove("hidden");
  localStorage.setItem(LAST_SECTION_KEY, name);
};

/* ---------- Auth UI ---------- */
const updateAuthUI = () => {
  const u = state.currentUser;
  qs("loginBtn")?.classList.toggle("hidden", !!u);
  qs("logoutBtn")?.classList.toggle("hidden", !u);
  qs("userBadge")?.classList.toggle("hidden", !u);

  qsa(".protected-nav").forEach(b =>
    b.classList.toggle("hidden", !u)
  );

  qs("adminTab")?.classList.toggle(
    "hidden",
    !(u && u.role === "admin")
  );

  if (u) {
    qs("badgeName").textContent = u.name;
    qs("badgeRole").textContent = u.role;
  }
};

/* ---------- Load Posts ---------- */
const loadPosts = async () => {
  try {
    const posts = await api("/api/posts");
    state.posts = posts.map(p => ({ ...p, id: p.id || p._id }));
    renderFeed();
    renderInbox();
    renderAdmin();
    renderUserListings();
  } catch (e) {
    console.error("loadPosts failed", e);
  }
};

/* ---------- Auth ---------- */
on(qs("registerForm"), "submit", async e => {
  e.preventDefault();
  try {
    const data = await api("/api/register", "POST", {
      name: qs("regName").value.trim(),
      email: qs("regEmail").value.trim(),
      password: qs("regPass").value.trim(),
      role: qs("regRole").value
    });
    alert("Registration successful. Please login.");
    qs("tabLogin").click();
  } catch (e) {
    alert(e.error || "Registration failed");
  }
});

on(qs("loginForm"), "submit", async e => {
  e.preventDefault();
  try {
    const user = await api("/api/login", "POST", {
      name: qs("loginName").value.trim(),
      password: qs("loginPass").value.trim(),
      loginRole: qs("loginRole").value
    });
    state.currentUser = user;
    saveSession();
    updateAuthUI();
    qs("loginModal").classList.add("hidden");
    await loadPosts();
    showSection("feed");
  } catch (e) {
    alert(e.error || "Login failed");
  }
});

on(qs("logoutBtn"), "click", () => {
  state.currentUser = null;
  saveSession();
  updateAuthUI();
  showSection("landing");
});

/* ---------- Feed ---------- */
const renderFeed = () => {
  const box = qs("feedContainer");
  if (!box) return;
  if (!state.posts.length) {
    qs("emptyFeedMsg")?.classList.remove("hidden");
    box.innerHTML = "";
    return;
  }
  qs("emptyFeedMsg")?.classList.add("hidden");

  box.innerHTML = state.posts.map(p => `
    <article class="bg-slate-900 rounded-xl p-3 border border-slate-700">
      <img src="${p.image}" class="w-full h-40 object-cover mb-2"/>
      <h3 class="font-semibold">${p.title}</h3>
      <p class="text-xs text-slate-300">${p.desc}</p>
      <div class="flex justify-between text-xs mt-2">
        <span>${p.credits} credits</span>
        <span>₹${p.price}</span>
      </div>
      <div class="flex gap-2 mt-2">
        <button data-like="${p.id}">❤️ ${p.likes || 0}</button>
        <button data-chat="${p.id}">💬 Chat</button>
      </div>
    </article>
  `).join("");
};

/* ---------- Likes / Chat ---------- */
on(qs("feedContainer"), "click", async e => {
  const id = e.target.dataset.like;
  if (!id || !state.currentUser) return;

  const post = state.posts.find(p => p.id === id);
  if (!post) return;

  const me = state.currentUser.name;
  post.likedBy ||= [];

  if (post.likedBy.includes(me)) {
    post.likedBy = post.likedBy.filter(x => x !== me);
    post.likes--;
  } else {
    post.likedBy.push(me);
    post.likes++;
  }

  try {
    await api(`/api/posts/${id}`, "PUT", {
      likes: post.likes,
      likedBy: post.likedBy
    });
    renderFeed();
  } catch {
    alert("Like failed");
  }
});

/* ---------- Listings ---------- */
const renderUserListings = () => {
  if (!state.currentUser) return;
  const box = qs("userListings");
  if (!box) return;

  const mine = state.posts.filter(
    p => p.user === state.currentUser.name
  );

  box.innerHTML = mine.map(p => `
    <div class="border p-2 flex justify-between">
      <span>${p.title}</span>
      <button data-edit-post="${p.id}">Edit</button>
    </div>
  `).join("");
};

/* ---------- Inbox ---------- */
const renderInbox = () => {
  const box = qs("inboxList");
  if (!box || !state.currentUser) return;

  const me = state.currentUser.name;
  const msgs = [];

  state.posts.forEach(p => {
    (p.chatMessages || []).forEach(m => {
      if (m.to === me) msgs.push({ ...m, post: p.title });
    });
  });

  box.innerHTML = msgs.length
    ? msgs.map(m => `<p>${m.from}: ${m.text}</p>`).join("")
    : `<p class="text-slate-400">No messages</p>`;
};

/* ---------- Admin ---------- */
const renderAdmin = () => {
  if (!state.currentUser || state.currentUser.role !== "admin") return;
  qs("adminList").innerHTML = state.posts.map(p => `
    <div class="flex justify-between border p-2">
      <span>${p.title}</span>
      <button data-toggle="${p.id}">
        ${p.status === "removed" ? "Restore" : "Remove"}
      </button>
    </div>
  `).join("");
};

on(qs("adminList"), "click", async e => {
  const id = e.target.dataset.toggle;
  if (!id) return;

  const post = state.posts.find(p => p.id === id);
  const status = post.status === "removed" ? "active" : "removed";

  await api(`/api/posts/${id}`, "PUT", { status });
  loadPosts();
});

/* ---------- Calculator ---------- */
on(qs("calcTreesBtn"), "click", () => {
  const x = +qs("treeType").value;
  const n = +qs("treeCount").value;
  const t = +qs("treeYears").value;
  const annual = (n * x) / 1000;
  qs("annualCredits").textContent = annual.toFixed(2);
  qs("totalCredits").textContent = (annual * t).toFixed(2);
  qs("calcResult").classList.remove("hidden");
});

/* ---------- Init ---------- */
restoreSession();
updateAuthUI();
loadPosts();
showSection(localStorage.getItem(LAST_SECTION_KEY) || "landing");
setInterval(loadPosts, 3000);
