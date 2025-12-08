// ===== helpers =====
const qs = id => document.getElementById(id);
const qsa = sel => [...document.querySelectorAll(sel)];
const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

const API_BASE = "https://carbon-credit-exchange-backend.onrender.com";
const SESSION_KEY = "ccx_session_v1";
const LAST_SECTION_KEY = "ccx_last_section_v1";
const PROTECTED_SECTIONS = ["feed", "upload", "calculator", "admin", "inbox"];

// ===== global state =====
let state = {
  users: [],
  posts: [],
  currentUser: null
};

let editPostId = null;
let currentChatPostId = null;
let adminViewChat = false;

// ===== session helpers (REFRESH LOGIN FIXED PERMANENTLY) =====
const saveSession = () => {
  if (!state.currentUser) return localStorage.removeItem(SESSION_KEY);
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      name: state.currentUser.name,
      role: state.currentUser.role
    })
  );
};

const restoreSession = () => {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    const user = state.users.find(
      u => u.name.toLowerCase() === data.name.toLowerCase()
    );
    if (user) {
      state.currentUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: data.role
      };
    }
  } catch (e) {}
};

const normalizeRole = (name, role) =>
  name.trim().toLowerCase() === "bajaish" && role === "admin"
    ? "admin"
    : "user";

// ===== backend sync =====
const syncState = () => {
  fetch(API_BASE + "/api/state", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ users: state.users, posts: state.posts })
  });
};

const applyRemoteState = data => {
  state.users = Array.isArray(data.users) ? data.users : [];
  state.posts = Array.isArray(data.posts) ? data.posts : [];
};

const loadState = () => {
  fetch(API_BASE + "/api/state")
    .then(r => r.json())
    .then(data => {
      applyRemoteState(data);
      restoreSession();
      updateAuthUI();

      const last = localStorage.getItem(LAST_SECTION_KEY) || "landing";
      if (!state.currentUser && PROTECTED_SECTIONS.includes(last)) {
        showSection("landing");
      } else {
        showSection(last);
      }
    });
};

const refreshFromServer = () => {
  fetch(API_BASE + "/api/state")
    .then(r => r.json())
    .then(applyRemoteState)
    .then(() => {
      renderFeed();
      renderInbox();
      updateUnreadIndicator();
      if (currentChatPostId) {
        const p = state.posts.find(p => p.id == currentChatPostId);
        if (p) renderChatMessages(p);
      }
    });
};

// ===== NAV =====
const setActiveNav = section => {
  qsa(".nav-btn").forEach(btn => {
    const target = btn.dataset.section;
    const isActive = target === section;
    btn.classList.toggle("border-b-2", isActive);
    btn.classList.toggle("border-b-emerald-400", isActive);
    btn.classList.toggle("border-b-transparent", !isActive);
  });
};

const showSection = name => {
  qsa(".section").forEach(s => s.classList.add("hidden"));
  const sec = qs("section-" + name);
  if (sec) sec.classList.remove("hidden");
  localStorage.setItem(LAST_SECTION_KEY, name);
  setActiveNav(name);
};

const requireLogin = () => {
  if (!state.currentUser) {
    qs("loginModal").classList.remove("hidden");
    return false;
  }
  return true;
};

// ===== DOM refs =====
const userBadge = qs("userBadge");
const badgeName = qs("badgeName");
const badgeRole = qs("badgeRole");
const adminTab = qs("adminTab");
const inboxIndicator = qs("inboxIndicator");
const inboxList = qs("inboxList");
const feedContainer = qs("feedContainer");
const emptyFeedMsg = qs("emptyFeedMsg");
const priceFilter = qs("priceFilter");
const creditsFilter = qs("creditsFilter");
const heroLoginBtn = qs("heroLoginBtn");
const heroExploreBtn = qs("heroExploreBtn");
const chatModal = qs("chatModal");
const chatMessagesBox = qs("chatMessages");
const chatPostTitle = qs("chatPostTitle");
const chatForm = qs("chatForm");
const chatInput = qs("chatInput");

// ===== AUTH UI =====
const updateAuthUI = () => {
  const loginBtn = qs("loginBtn");
  const logoutBtn = qs("logoutBtn");

  if (state.currentUser) {
    loginBtn.classList.add("hidden");
    logoutBtn.classList.remove("hidden");
    userBadge.classList.remove("hidden");
    badgeName.textContent = state.currentUser.name;
    badgeRole.textContent = state.currentUser.role;
    adminTab.classList.toggle("hidden", state.currentUser.role !== "admin");
  } else {
    loginBtn.classList.remove("hidden");
    logoutBtn.classList.add("hidden");
    userBadge.classList.add("hidden");
    adminTab.classList.add("hidden");
  }
  updateUnreadIndicator();
};

// ===== AUTH (RE-REGISTER FIXED) =====
on(qs("registerForm"), "submit", e => {
  e.preventDefault();

  const name = qs("regName").value.trim();
  const email = qs("regEmail").value.trim();
  const reqRole = qs("regRole").value;

  if (!name || !email) return;

  // already exists → never ask to re-register
  if (state.users.some(u => u.name.toLowerCase() === name.toLowerCase())) {
    alert("User already registered. Please login.");
    qs("tabLogin").click();
    return;
  }

  let role = normalizeRole(name, reqRole);

  state.users.push({
    id: Date.now(),
    name,
    email,
    role,
    createdAt: Date.now()
  });

  syncState();
  alert("Registration successful. Please login.");
  qs("tabLogin").click();
});

on(qs("loginForm"), "submit", e => {
  e.preventDefault();

  const name = qs("loginName").value.trim();
  const loginRole = qs("loginRole").value;

  const user = state.users.find(u => u.name.toLowerCase() === name.toLowerCase());
  if (!user) return alert("User not found. Register first.");

  if (loginRole === "admin" && name.toLowerCase() !== "bajaish")
    return alert("Only authorised access allowed.");

  const role =
    loginRole === "admin" && name.toLowerCase() === "bajaish"
      ? "admin"
      : "user";

  state.currentUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role
  };

  saveSession();
  updateAuthUI();
  qs("loginModal").classList.add("hidden");
  showSection("feed");
  renderFeed();
});

on(qs("logoutBtn"), "click", () => {
  state.currentUser = null;
  saveSession();
  updateAuthUI();
  showSection("landing");
});

// ===== NAV EVENTS =====
qsa(".nav-btn").forEach(btn =>
  on(btn, "click", () => {
    const target = btn.dataset.section;
    if (btn.classList.contains("protected-nav") && !requireLogin()) return;
    showSection(target);
    if (target === "feed") renderFeed();
    if (target === "inbox") renderInbox();
  })
);

on(heroLoginBtn, "click", () =>
  qs("loginModal").classList.remove("hidden")
);

on(heroExploreBtn, "click", () => {
  if (!requireLogin()) return;
  showSection("feed");
  renderFeed();
});

// ===== INITIAL LOAD + REALTIME POLLING (NO GAP CHAT) =====
updateAuthUI();
loadState();
setInterval(refreshFromServer, 1000);
// ===============================
// ===== FEED / FILTER / LIKE ====
// ===============================
const getFilteredPosts = () => {
  let arr = state.posts.filter(p => p.status !== "removed");

  const cf = creditsFilter?.value || "all";
  const pf = priceFilter?.value || "none";

  if (cf !== "all") {
    arr = arr.filter(p => {
      const c = Number(p.credits || 0);
      if (cf === "1-10") return c >= 1 && c <= 10;
      if (cf === "10-20") return c > 10 && c <= 20;
      if (cf === "20-30") return c > 20 && c <= 30;
      if (cf === "30-40") return c > 30 && c <= 40;
      if (cf === "40-50") return c > 40 && c <= 50;
      if (cf === "50+") return c > 50;
      return true;
    });
  }

  if (pf === "low-high") arr.sort((a, b) => (a.price || 0) - (b.price || 0));
  if (pf === "high-low") arr.sort((a, b) => (b.price || 0) - (a.price || 0));

  return arr;
};

const renderFeed = () => {
  const posts = getFilteredPosts();
  if (!posts.length) {
    feedContainer.innerHTML = "";
    emptyFeedMsg.classList.remove("hidden");
    return;
  }

  emptyFeedMsg.classList.add("hidden");

  feedContainer.innerHTML = posts.map(p => `
    <article class="bg-slate-900 rounded-xl shadow p-3 border border-slate-700">
      <img src="${p.image}" class="w-full h-40 object-cover rounded-lg mb-2">
      <h3 class="font-semibold">${p.title}</h3>
      <p class="text-xs text-slate-300">${p.desc}</p>
      <p class="text-xs mt-1">${p.credits} credits • ₹${p.price}</p>

      <div class="flex gap-2 mt-2">
        <button data-like="${p.id}" class="border px-2 py-1 text-xs rounded">
          ❤️ ${p.likes || 0}
        </button>
        <button data-chat="${p.id}" class="border px-2 py-1 text-xs rounded">
          💬 Chat
        </button>
      </div>
    </article>
  `).join("");
};

on(feedContainer, "click", e => {
  const likeId = e.target.dataset.like;
  const chatId = e.target.dataset.chat;

  if (likeId) {
    if (!requireLogin()) return;
    const post = state.posts.find(p => p.id == likeId);
    post.likedBy ||= [];

    const idx = post.likedBy.indexOf(state.currentUser.name);
    if (idx === -1) {
      post.likedBy.push(state.currentUser.name);
      post.likes = (post.likes || 0) + 1;
    } else {
      post.likedBy.splice(idx, 1);
      post.likes--;
    }
    syncState();
    renderFeed();
  }

  if (chatId) {
    if (!requireLogin()) return;
    openChatForPost(chatId);
  }
});

// ===============================
// ===== SINGLE CHAT SYSTEM =====
// ===============================
const renderChatMessages = post => {
  chatMessagesBox.innerHTML = post.chatMessages.map(m => `
    <div class="${m.from === state.currentUser.name ? "text-right" : ""}">
      <div class="inline-block bg-slate-800 text-xs p-2 rounded mt-1">
        <b>${m.from}:</b> ${m.text}
        <div class="text-[10px] text-slate-400">
          ${new Date(m.time).toLocaleTimeString()} 
          ${m.from === state.currentUser.name ? (m.seen ? "Seen" : "Sent") : ""}
        </div>
      </div>
    </div>
  `).join("");

  chatMessagesBox.scrollTop = chatMessagesBox.scrollHeight;
};

const openChatForPost = postId => {
  const post = state.posts.find(p => p.id == postId);
  if (!post) return;

  adminViewChat = false;
  currentChatPostId = post.id;
  post.chatMessages ||= [];

  post.chatMessages.forEach(m => {
    if (m.from !== state.currentUser.name) m.seen = true;
  });

  syncState();
  chatPostTitle.textContent = post.title;
  renderChatMessages(post);
  chatModal.classList.remove("hidden");
};

on(chatForm, "submit", e => {
  e.preventDefault();
  if (!currentChatPostId) return;

  const msg = chatInput.value.trim();
  if (!msg) return;

  const post = state.posts.find(p => p.id == currentChatPostId);
  post.chatMessages.push({
    from: state.currentUser.name,
    text: msg,
    time: Date.now(),
    seen: false
  });

  chatInput.value = "";
  syncState();
  renderChatMessages(post);
  updateUnreadIndicator();
});

on(qs("closeChat"), "click", () => {
  chatModal.classList.add("hidden");
  currentChatPostId = null;
});

// ===============================
// ===== INBOX (ONE ENTRY PER CHAT) =====
// ===============================
const getInboxItems = () => {
  if (!state.currentUser) return [];

  const map = new Map();

  state.posts.forEach(p => {
    if (!p.chatMessages?.length) return;

    const last = p.chatMessages[p.chatMessages.length - 1];
    const key = p.id;

    map.set(key, {
      postId: p.id,
      title: p.title,
      lastText: last.text,
      from: last.from,
      seen: last.seen
    });
  });

  return [...map.values()];
};

const updateUnreadIndicator = () => {
  const unread = getInboxItems().filter(i => !i.seen && i.from !== state.currentUser.name).length;
  unlread > 0 ? inboxIndicator.classList.remove("hidden") : inboxIndicator.classList.add("hidden");
};

const renderInbox = () => {
  const items = getInboxItems();
  if (!items.length) {
    inboxList.innerHTML = `<p class="text-sm text-slate-300">No messages yet.</p>`;
    return;
  }

  inboxList.innerHTML = items.map(i => `
    <div class="border p-3 rounded bg-slate-900 flex justify-between">
      <div>
        <p class="font-semibold">${i.title}</p>
        <p class="text-xs">${i.lastText}</p>
      </div>
      <button data-open="${i.postId}" class="text-xs underline">Open</button>
    </div>
  `).join("");
};

on(inboxList, "click", e => {
  const id = e.target.dataset.open;
  if (id) openChatForPost(id);
});

// ===============================
// ===== CALCULATOR =====
// ===============================
on(qs("calcTreesBtn"), "click", () => {
  const x = parseFloat(qs("treeType").value);
  const N = parseFloat(qs("treeCount").value);
  const t = parseFloat(qs("treeYears").value);

  const annual = (N * x) / 1000;
  qs("annualCredits").textContent = `Annual: ${annual.toFixed(2)}`;
  qs("totalCredits").textContent = `Total: ${(annual * t).toFixed(2)}`;
  qs("calcResult").classList.remove("hidden");
});

on(qs("calcLandBtn"), "click", () => {
  const A = parseFloat(qs("landArea").value);
  const t = parseFloat(qs("landYears").value);

  const annual = A * 6;
  qs("annualCredits").textContent = `Annual: ${annual.toFixed(2)}`;
  qs("totalCredits").textContent = `Total: ${(annual * t).toFixed(2)}`;
  qs("calcResult").classList.remove("hidden");
});
