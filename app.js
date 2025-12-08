// ===== helpers & constants =====
const $ = id => document.getElementById(id);
const $$ = sel => [...document.querySelectorAll(sel)];
const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

const API_BASE = "https://carbon-credit-exchange-backend.onrender.com";
const SESSION_KEY = "ccx_session_v1";
const LAST_SECTION_KEY = "ccx_last_section_v1";
const PROTECTED = ["feed", "upload", "calculator", "admin", "inbox"];

// global state (backend holds users+posts; browser only remembers session + last section)
let state = { users: [], posts: [], currentUser: null };
let editPostId = null;
let currentChatPostId = null;
let adminViewChat = false;

// ===== DOM refs =====
const userBadge = $("userBadge"), badgeName = $("badgeName"), badgeRole = $("badgeRole");
const adminTab = $("adminTab"), inboxIndicator = $("inboxIndicator"), inboxList = $("inboxList");
const feedContainer = $("feedContainer"), emptyFeedMsg = $("emptyFeedMsg"), feedFiltersBox = $("feedFilters");
const priceFilter = $("priceFilter"), creditsFilter = $("creditsFilter");
const welcomeLine = $("welcomeLine"), welcomeName = $("welcomeName");
const heroLoginBtn = $("heroLoginBtn"), heroExploreBtn = $("heroExploreBtn");
const chatModal = $("chatModal"), chatMessagesBox = $("chatMessages"), chatPostTitle = $("chatPostTitle");
const chatForm = $("chatForm"), chatInput = $("chatInput");
const adminList = $("adminList");
const yourListingsTab = $("yourListingsTab"), createListingTab = $("createListingTab");
const userListingsBox = $("userListings"), uploadWrapper = $("uploadWrapper");
const uploadForm = $("uploadForm"), uploadFormBtn = $("uploadFormBtn");

// ===== nav highlighting & sections =====
const setActiveNav = section => {
  $$(".nav-btn").forEach(btn => {
    const target = btn.dataset.section;
    const active = target === section;
    const special = PROTECTED.includes(target);
    btn.classList.toggle("border-b-2", active);
    btn.classList.toggle("border-b-emerald-400", active);
    btn.classList.toggle("border-b-transparent", !active);
    btn.classList.toggle("bg-slate-800", active && special);
    btn.classList.toggle("bg-slate-900", !active || !special);
    btn.classList.toggle("text-white", active);
  });
};

const showSection = name => {
  $$(".section").forEach(s => s.classList.add("hidden"));
  const sec = $("section-" + name);
  if (sec) sec.classList.remove("hidden");
  localStorage.setItem(LAST_SECTION_KEY, name);
  setActiveNav(name);
};

const requireLogin = () => {
  if (!state.currentUser) {
    alert("Please login first.");
    $("loginModal").classList.remove("hidden");
    return false;
  }
  return true;
};

const normalizeRole = (name, role) =>
  name.trim().toLowerCase() === "bajaish" && role === "admin" ? "admin" : "user";

// ===== backend sync & polling =====
const applyRemoteState = data => {
  state.users = Array.isArray(data.users) ? data.users : [];
  state.posts = Array.isArray(data.posts) ? data.posts : [];
  renderAll();
};

const syncState = () => {
  fetch(API_BASE + "/api/state", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ users: state.users, posts: state.posts })
  }).catch(console.log);
};

const loadState = () => {
  fetch(API_BASE + "/api/state")
    .then(r => r.json())
    .then(d => {
      applyRemoteState(d);
      restoreSession();
      const last = localStorage.getItem(LAST_SECTION_KEY) || "landing";
      if (!state.currentUser && PROTECTED.includes(last)) showSection("landing");
      else showSection(last);
    })
    .catch(console.log);
};

const refreshFromServer = () => {
  fetch(API_BASE + "/api/state")
    .then(r => r.json())
    .then(d => {
      applyRemoteState(d);
      // keep open chat updated
      if (!chatModal.classList.contains("hidden") && currentChatPostId) {
        const p = state.posts.find(x => String(x.id) === String(currentChatPostId));
        if (p) renderChatMessages(p);
      }
    })
    .catch(console.log);
};

// ===== session =====
const saveSession = () => {
  if (state.currentUser) {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ name: state.currentUser.name, role: state.currentUser.role })
    );
  } else localStorage.removeItem(SESSION_KEY);
};

const restoreSession = () => {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return;
  try {
    const s = JSON.parse(raw);
    if (!s.name) return;
    const u = state.users.find(x => x.name.toLowerCase() === s.name.toLowerCase());
    if (!u) return;
    state.currentUser = { id: u.id, name: u.name, email: u.email, role: s.role || u.role };
    updateAuthUI();
  } catch (e) {
    console.log("session error", e);
  }
};

// ===== inbox =====
const getInboxItems = () => {
  if (!state.currentUser) return [];
  const me = state.currentUser.name;
  const items = [];
  state.posts.forEach(p => {
    if (!p.chatMessages?.length) return;
    const meInThread = p.user === me || p.chatMessages.some(m => m.from === me);
    if (!meInThread) return;
    p.chatMessages.forEach(m => {
      if (m.from === me) return;
      items.push({
        postId: p.id,
        postTitle: p.title,
        from: m.from,
        text: m.text,
        time: m.time || Date.now(),
        seen: !!m.seen
      });
    });
  });
  return items.sort((a, b) => (b.time || 0) - (a.time || 0));
};

const updateUnreadIndicator = () => {
  if (!inboxIndicator) return;
  if (!state.currentUser) return inboxIndicator.classList.add("hidden");
  const unread = getInboxItems().filter(i => !i.seen).length;
  unread ? inboxIndicator.classList.remove("hidden") : inboxIndicator.classList.add("hidden");
};

const renderInbox = () => {
  if (!inboxList) return;
  if (!state.currentUser) {
    inboxList.innerHTML = `<p class="text-sm text-slate-300">Please login to see your inbox.</p>`;
    return updateUnreadIndicator();
  }
  const items = getInboxItems();
  if (!items.length) {
    inboxList.innerHTML = `<p class="text-sm text-slate-300">No messages yet.</p>`;
    return updateUnreadIndicator();
  }
  inboxList.innerHTML = items
    .map(i => {
      const t = new Date(i.time).toLocaleString();
      const badge = i.seen ? "bg-slate-700 text-slate-200" : "bg-red-500/20 text-red-300";
      const txt = i.seen ? "Seen" : "Unread";
      return `
      <div class="bg-slate-900 rounded-xl shadow p-3 flex items-center justify-between text-sm border border-slate-700">
        <div class="pr-3">
          <p class="font-semibold text-xs">From ${i.from}</p>
          <p class="text-xs text-slate-400">On: ${i.postTitle}</p>
          <p class="text-[11px] text-slate-200 mt-1 line-clamp-2">${i.text}</p>
          <p class="text-[10px] mt-1 text-slate-500">${t}</p>
        </div>
        <div class="flex flex-col items-end gap-1">
          <span class="text-[10px] px-2 py-0.5 rounded-full ${badge}">${txt}</span>
          <button data-open-chat="${i.postId}" class="text-[11px] underline">Open chat</button>
        </div>
      </div>`;
    })
    .join("");
  updateUnreadIndicator();
};

// ===== auth UI =====
const updateAuthUI = () => {
  const loginBtn = $("loginBtn"), logoutBtn = $("logoutBtn");
  const u = state.currentUser;
  if (u) {
    loginBtn.classList.add("hidden");
    logoutBtn.classList.remove("hidden");
    userBadge.classList.remove("hidden");
    badgeName.textContent = u.name;
    badgeRole.textContent = u.role;
    heroLoginBtn?.classList.add("hidden");
    if (welcomeLine && welcomeName) {
      welcomeName.textContent = u.name;
      welcomeLine.classList.remove("hidden");
    }
    $$(".protected-nav").forEach(b => b.classList.remove("hidden"));
    feedFiltersBox?.classList.remove("hidden");
    u.role === "admin" ? adminTab.classList.remove("hidden") : adminTab.classList.add("hidden");
  } else {
    loginBtn.classList.remove("hidden");
    logoutBtn.classList.add("hidden");
    userBadge.classList.add("hidden");
    badgeRole.textContent = "";
    heroLoginBtn?.classList.remove("hidden");
    welcomeLine?.classList.add("hidden");
    adminTab.classList.add("hidden");
    feedFiltersBox?.classList.add("hidden");
    $$(".protected-nav").forEach(b => b.classList.add("hidden"));
  }
  updateUnreadIndicator();
};

// ===== feed & admin render =====
const filteredPosts = () => {
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
  if (pf === "low-high") arr = [...arr].sort((a, b) => (a.price || 0) - (b.price || 0));
  if (pf === "high-low") arr = [...arr].sort((a, b) => (b.price || 0) - (a.price || 0));
  if (state.currentUser) {
    const me = state.currentUser.name;
    const mine = arr.filter(p => p.user === me);
    const others = arr.filter(p => p.user !== me);
    arr = [...mine, ...others];
  }
  return arr;
};

const renderFeed = () => {
  if (!feedContainer) return;
  const posts = filteredPosts();
  if (!posts.length) {
    feedContainer.innerHTML = "";
    emptyFeedMsg.classList.remove("hidden");
    return;
  }
  emptyFeedMsg.classList.add("hidden");
  feedContainer.innerHTML = posts
    .map(p => {
      const commentsHtml = p.comments?.length
        ? p.comments.map(c => `<p class="text-xs"><b>${c.by}:</b> ${c.text}</p>`).join("")
        : '<p class="text-xs text-slate-400">No comments yet</p>';
      const ownerText =
        state.currentUser && p.user === state.currentUser.name
          ? `Post created by you${p.createdAt ? " • " + new Date(p.createdAt).toLocaleDateString() : ""}`
          : `By ${p.user}`;
      return `
      <article class="bg-slate-900 rounded-2xl shadow overflow-hidden flex flex-col border border-slate-700">
        <img src="${p.image}" class="w-full h-44 object-cover" alt="post">
        <div class="p-3 flex-1 flex flex-col">
          <h3 class="font-semibold text-sm mb-1 line-clamp-2">${p.title}</h3>
          <p class="text-xs text-slate-300 mb-1 line-clamp-3">${p.desc}</p>
          <div class="flex items-center justify-between text-[11px] mb-2">
            <span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300">
              ${p.credits || 0} credits
            </span>
            <span class="font-semibold text-emerald-200">₹${p.price || 0}</span>
          </div>
          <p class="text-[11px] text-slate-400 mb-2">${ownerText}</p>
          <div class="mt-auto space-y-2">
            <div class="flex items-center justify-between text-xs">
              <button data-like="${p.id}"
                class="px-2 py-1 rounded-full border border-slate-600 text-[11px]">
                ❤️ Like (${p.likes || 0})
              </button>
              <button data-chat="${p.id}"
                class="px-2 py-1 rounded-full border border-slate-600 text-[11px]">
                💬 Chat
              </button>
            </div>
            <div class="border-t border-slate-700 pt-1">
              <div class="flex gap-1 mb-1">
                <input data-comment-input="${p.id}"
                  class="flex-1 border border-slate-700 bg-slate-950 rounded-lg px-2 py-1 text-[11px]"
                  placeholder="Add comment..." />
                <button data-comment-btn="${p.id}"
                  class="px-2 text-[11px] border border-slate-600 rounded-lg">
                  Post
                </button>
              </div>
              <div class="space-y-0.5">${commentsHtml}</div>
            </div>
          </div>
        </div>
      </article>`;
    })
    .join("");
};

const renderAdmin = () => {
  if (!adminList) return;
  const u = state.currentUser;
  if (!u || u.role !== "admin") {
    adminList.innerHTML = `<p class="text-sm text-slate-300">You are not admin.</p>`;
    return;
  }
  const usersHtml = state.users.length
    ? state.users
        .map(
          x => `
      <tr class="text-xs">
        <td class="border border-slate-700 px-2 py-1">${x.id}</td>
        <td class="border border-slate-700 px-2 py-1">${x.name}</td>
        <td class="border border-slate-700 px-2 py-1">${x.email || "-"}</td>
        <td class="border border-slate-700 px-2 py-1">${x.role}</td>
        <td class="border border-slate-700 px-2 py-1 text-center">
          <button data-deluser="${x.id}" class="text-[11px] underline">Remove</button>
        </td>
      </tr>`
        )
        .join("")
    : '<tr><td colspan="5" class="text-xs text-center text-slate-400 py-2">No registered users yet.</td></tr>';

  const postsHtml = state.posts.length
    ? state.posts
        .map(p => {
          const badge =
            p.status === "removed"
              ? "bg-red-500/20 text-red-300"
              : "bg-emerald-500/20 text-emerald-200";
          return `
        <div class="bg-slate-900 rounded-xl shadow p-3 flex items-center justify-between text-sm border border-slate-700">
          <div class="pr-3">
            <p class="font-semibold">${p.title}</p>
            <p class="text-xs text-slate-400">
              By ${p.user} • Likes: ${p.likes || 0} • Comments: ${p.comments?.length || 0}
            </p>
            <p class="text-[11px] mt-1">Credits: ${p.credits || 0} • Price: ₹${p.price || 0}</p>
            <p class="text-[11px] mt-1">
              Status:
              <span class="px-2 py-0.5 rounded-full text-[10px] ${badge}">
                ${p.status || "active"}
              </span>
            </p>
          </div>
          <div class="flex flex-col items-end gap-1">
            <button data-toggle="${p.id}"
              class="text-xs px-3 py-1 rounded-full border border-slate-600 mb-1">
              ${p.status === "removed" ? "Restore" : "Remove"}
            </button>
            <button data-viewchat="${p.id}" class="text-[11px] underline">
              View chat
            </button>
          </div>
        </div>`;
        })
        .join("")
    : '<p class="text-sm text-slate-300">No posts yet.</p>';

  adminList.innerHTML = `
    <div class="bg-slate-900 rounded-2xl shadow p-3 mb-3 border border-slate-700">
      <h3 class="text-sm font-semibold mb-2">Registered Users</h3>
      <div class="overflow-x-auto">
        <table class="min-w-full border border-slate-700 text-xs">
          <thead class="bg-slate-800">
            <tr>
              <th class="border border-slate-700 px-2 py-1 text-left">ID</th>
              <th class="border border-slate-700 px-2 py-1 text-left">Name</th>
              <th class="border border-slate-700 px-2 py-1 text-left">Email</th>
              <th class="border border-slate-700 px-2 py-1 text-left">Role</th>
              <th class="border border-slate-700 px-2 py-1 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>${usersHtml}</tbody>
        </table>
      </div>
    </div>
    <div class="space-y-3">
      <h3 class="text-sm font-semibold mb-1">Post Moderation & Chats</h3>
      ${postsHtml}
    </div>`;
};

// ===== user listings =====
const renderUserListings = () => {
  if (!userListingsBox) return;
  if (!state.currentUser) {
    userListingsBox.innerHTML =
      `<p class="text-sm text-slate-300">Please login to see your listings.</p>`;
    return;
  }
  const me = state.currentUser.name;
  const myPosts = state.posts.filter(p => p.user === me);
  if (!myPosts.length) {
    userListingsBox.innerHTML =
      `<p class="text-sm text-slate-300">You have not created any listings yet.</p>`;
    return;
  }
  userListingsBox.innerHTML = myPosts
    .map(p => {
      const d = p.createdAt ? new Date(p.createdAt).toLocaleString() : "";
      return `
      <div class="bg-slate-900 rounded-xl shadow p-3 border border-slate-700 flex items-center justify-between text-sm">
        <div class="pr-3">
          <p class="font-semibold text-xs">${p.title}</p>
          <p class="text-[11px] text-slate-400">
            Credits: ${p.credits || 0} • Price: ₹${p.price || 0}
          </p>
          <p class="text-[11px] text-slate-500 mt-1">${d}</p>
        </div>
        <button class="text-[11px] underline" data-edit-post="${p.id}">
          Edit
        </button>
      </div>`;
    })
    .join("");
};

const setListingMode = mode => {
  const your = mode === "your";
  yourListingsTab.classList.toggle("bg-slate-800", your);
  yourListingsTab.classList.toggle("bg-slate-900", !your);
  yourListingsTab.classList.toggle("text-white", your);
  yourListingsTab.classList.toggle("text-slate-300", !your);
  createListingTab.classList.toggle("bg-slate-800", !your);
  createListingTab.classList.toggle("bg-slate-900", your);
  createListingTab.classList.toggle("text-white", !your);
  createListingTab.classList.toggle("text-slate-300", your);
  userListingsBox.classList.toggle("hidden", !your);
  uploadWrapper.classList.toggle("hidden", your);
  if (your) {
    editPostId = null;
    renderUserListings();
  } else {
    uploadForm?.reset();
    editPostId = null;
    uploadFormBtn.textContent = "Upload Listing";
  }
};

// ===== chat =====
const renderChatMessages = post => {
  if (!post.chatMessages?.length) {
    chatMessagesBox.innerHTML =
      '<p class="text-[11px] text-slate-400 text-center mt-6">No messages yet. Start the conversation.</p>';
    return;
  }
  chatMessagesBox.innerHTML = post.chatMessages
    .map(m => {
      const mine = state.currentUser && m.from === state.currentUser.name;
      const time = new Date(m.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      return `
      <div class="flex ${mine ? "justify-end" : "justify-start"}">
        <div class="max-w-[75%] px-2 py-1 rounded-lg text-[11px] ${
          mine ? "bg-emerald-600 text-white" : "bg-slate-800 border border-slate-700"
        }">
          <div class="font-semibold mb-0.5">${mine ? "You" : m.from}</div>
          <div>${m.text}</div>
          <div class="flex justify-between items-center mt-0.5 text-[9px] opacity-80">
            <span>${time}</span>
            ${mine ? `<span>${m.seen ? "Seen" : "Sent"}</span>` : ""}
          </div>
          ${
            mine && !adminViewChat
              ? `<button data-delmsg="${m.id}" class="mt-0.5 text-[9px] underline">
                 Delete for everyone
               </button>`
              : ""
          }
        </div>
      </div>`;
    })
    .join("");
  chatMessagesBox.scrollTop = chatMessagesBox.scrollHeight;
};

const openChatForPost = postId => {
  const post = state.posts.find(p => String(p.id) === String(postId));
  if (!post) return;
  adminViewChat = false;
  chatForm.classList.remove("hidden");
  post.chatMessages ||= [];
  if (state.currentUser) {
    post.chatMessages.forEach(m => {
      if (m.from !== state.currentUser.name) m.seen = true;
    });
    syncState();
  }
  currentChatPostId = post.id;
  chatPostTitle.textContent = `Chat about: ${post.title}`;
  renderChatMessages(post);
  chatModal.classList.remove("hidden");
};

const openAdminChatView = post => {
  adminViewChat = true;
  chatForm.classList.add("hidden");
  const participants = new Set();
  participants.add(post.user);
  (post.chatMessages || []).forEach(m => participants.add(m.from));
  const names = [...participants];
  chatPostTitle.textContent =
    names.length === 2
      ? `Chat between ${names[0]} and ${names[1]}`
      : `Chat on "${post.title}" between ${names.join(", ")}`;
  currentChatPostId = post.id;
  renderChatMessages(post);
  chatModal.classList.remove("hidden");
};

// ===== calculator =====
$$('input[name="calcMethod"]').forEach(r =>
  on(r, "change", () => {
    const v = document.querySelector('input[name="calcMethod"]:checked').value;
    $("treeForm").classList.toggle("hidden", v !== "trees");
    $("landForm").classList.toggle("hidden", v !== "land");
    $("calcResult").classList.add("hidden");
  })
);

const showResult = (annual, total) => {
  $("calcResult").classList.remove("hidden");
  $("annualCredits").textContent =
    `Annual Carbon Credits: ${annual.toFixed(2)} tons CO₂ / year`;
  $("totalCredits").textContent =
    `Total Carbon Credits: ${total.toFixed(2)} tons CO₂`;
};

on($("calcTreesBtn"), "click", () => {
  const x = parseFloat($("treeType").value);
  const N = parseFloat($("treeCount").value);
  const t = parseFloat($("treeYears").value);
  if (N <= 0 || t <= 0) return alert("Enter valid tree count and years.");
  const annual = (N * x) / 1000;
  showResult(annual, annual * t);
});

on($("calcLandBtn"), "click", () => {
  const A = parseFloat($("landArea").value);
  const unit = $("landUnit").value;
  const t = parseFloat($("landYears").value);
  if (A <= 0 || t <= 0) return alert("Enter valid area and years.");
  let hectares = A;
  if (unit === "acres") hectares *= 0.404686;
  const annual = hectares * 6;
  showResult(annual, annual * t);
});

// ===== nav events =====
$$(".nav-btn").forEach(btn =>
  on(btn, "click", () => {
    const target = btn.dataset.section;
    if (!target) return;
    if (btn.classList.contains("protected-nav") && !requireLogin()) return;
    showSection(target);
    if (target === "feed") renderFeed();
    if (target === "admin") renderAdmin();
    if (target === "inbox") renderInbox();
    if (target === "upload") setListingMode("your");
  })
);

on(heroLoginBtn, "click", () => $("loginModal").classList.remove("hidden"));
on(heroExploreBtn, "click", () => {
  if (!requireLogin()) return;
  showSection("feed");
  renderFeed();
});
on(priceFilter, "change", renderFeed);
on(creditsFilter, "change", renderFeed);
on($("gotoCalcLink"), "click", () => {
  if (!requireLogin()) return;
  showSection("calculator");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ===== auth forms =====
on($("loginBtn"), "click", () => $("loginModal").classList.remove("hidden"));
on($("closeLogin"), "click", () => $("loginModal").classList.add("hidden"));

const tabRegister = $("tabRegister"), tabLogin = $("tabLogin");
const registerForm = $("registerForm"), loginForm = $("loginForm");

const switchAuthTab = mode => {
  const reg = mode === "register";
  registerForm.classList.toggle("hidden", !reg);
  loginForm.classList.toggle("hidden", reg);
  tabRegister.classList.toggle("bg-slate-800", reg);
  tabRegister.classList.toggle("bg-slate-900", !reg);
  tabLogin.classList.toggle("bg-slate-800", !reg);
  tabLogin.classList.toggle("bg-slate-900", reg);
};

on(tabRegister, "click", () => switchAuthTab("register"));
on(tabLogin, "click", () => switchAuthTab("login"));

on(registerForm, "submit", e => {
  e.preventDefault();
  const name = $("regName").value.trim();
  const email = $("regEmail").value.trim();
  const requestedRole = $("regRole").value;
  if (!name || !email) return;
  if (!email.toLowerCase().endsWith("@gmail.com"))
    return alert("Please enter a valid Gmail address.");
  if (state.users.some(u => u.name.toLowerCase() === name.toLowerCase())) {
    alert("User already registered. Please login.");
    return switchAuthTab("login");
  }
  let role = normalizeRole(name, requestedRole);
  if (requestedRole === "admin" && role !== "admin") {
    alert("Only authorised access allowed, try using User role.");
    role = "user";
  }
  state.users.push({ id: Date.now(), name, email, role, createdAt: Date.now() });
  syncState();
  alert("Registration successful. Please login.");
  switchAuthTab("login");
});

on(loginForm, "submit", e => {
  e.preventDefault();
  const name = $("loginName").value.trim();
  const loginRole = $("loginRole").value;
  if (!name) return alert("Enter a username.");
  const user = state.users.find(u => u.name.toLowerCase() === name.toLowerCase());
  if (!user) return alert("No user with such username found, try registering first.");
  if (loginRole === "admin" && name.toLowerCase() !== "bajaish")
    return alert("Only authorised access allowed, try logging in as User.");
  const role =
    loginRole === "admin" && name.toLowerCase() === "bajaish" ? "admin" : "user";
  state.currentUser = { id: user.id, name: user.name, email: user.email, role };
  saveSession();
  updateAuthUI();
  $("loginModal").classList.add("hidden");
  showSection("feed");
  renderFeed();
});

on($("logoutBtn"), "click", () => {
  state.currentUser = null;
  saveSession();
  updateAuthUI();
  showSection("landing");
});

// ===== post listing events =====
on(yourListingsTab, "click", () => { if (requireLogin()) setListingMode("your"); });
on(createListingTab, "click", () => { if (requireLogin()) setListingMode("create"); });

on(uploadForm, "submit", e => {
  e.preventDefault();
  if (!requireLogin()) return;
  const title = $("postTitle").value.trim();
  const desc = $("postDesc").value.trim();
  const price = parseFloat($("postPrice").value) || 0;
  const credits = parseFloat($("postCredits").value) || 0;
  const file = $("postImage").files[0];
  const isEdit = !!editPostId;
  if (!title || !desc) return;

  const finish = img => {
    if (isEdit) {
      const post = state.posts.find(p => String(p.id) === String(editPostId));
      if (!post) return;
      post.title = title;
      post.desc = desc;
      post.price = price;
      post.credits = credits;
      if (img) post.image = img;
      syncState();
      renderFeed();
      renderUserListings();
      alert("Listing updated.");
    } else {
      state.posts.unshift({
        id: Date.now(),
        title,
        desc,
        image: img,
        user: state.currentUser.name,
        likes: 0,
        likedBy: [],
        comments: [],
        chatMessages: [],
        status: "active",
        price,
        credits,
        createdAt: Date.now()
      });
      syncState();
      renderFeed();
      renderUserListings();
      alert("Listing uploaded.");
    }
    uploadForm.reset();
    editPostId = null;
    uploadFormBtn.textContent = "Upload Listing";
  };

  if (file) {
    if (file.size > 50 * 1024) return alert("Image too large! Only up to 50 KB allowed.");
    const r = new FileReader();
    r.onload = ev => finish(ev.target.result);
    r.readAsDataURL(file);
  } else {
    if (!isEdit) return alert("Please choose an image for a new listing.");
    finish(null);
  }
});

on(userListingsBox, "click", e => {
  const id = e.target.dataset.editPost;
  if (!id || !requireLogin()) return;
  const post = state.posts.find(p => String(p.id) === String(id));
  if (!post) return;
  editPostId = post.id;
  setListingMode("create");
  $("postTitle").value = post.title;
  $("postDesc").value = post.desc;
  $("postPrice").value = post.price;
  $("postCredits").value = post.credits;
  uploadFormBtn.textContent = "Save changes";
});

// feed like/comment/chat
on(feedContainer, "click", e => {
  const likeId = e.target.dataset.like;
  const commentId = e.target.dataset.commentBtn;
  const chatId = e.target.dataset.chat;

  if (likeId) {
    if (!requireLogin()) return;
    const post = state.posts.find(p => String(p.id) === String(likeId));
    if (!post) return;
    post.likedBy ||= [];
    const idx = post.likedBy.indexOf(state.currentUser.name);
    if (idx === -1) {
      post.likedBy.push(state.currentUser.name);
      post.likes = (post.likes || 0) + 1;
    } else {
      post.likedBy.splice(idx, 1);
      post.likes = Math.max(0, (post.likes || 0) - 1);
    }
    syncState();
    renderFeed();
  }

  if (commentId) {
    if (!requireLogin()) return;
    const post = state.posts.find(p => String(p.id) === String(commentId));
    if (!post) return;
    const input = document.querySelector(`[data-comment-input="${commentId}"]`);
    const text = input.value.trim();
    if (!text) return;
    post.comments ||= [];
    post.comments.push({ by: state.currentUser.name, text });
    input.value = "";
    syncState();
    renderFeed();
  }

  if (chatId) {
    if (!requireLogin()) return;
    openChatForPost(chatId);
  }
});

// admin actions
on(adminList, "click", e => {
  const toggleId = e.target.dataset.toggle;
  const delUserId = e.target.dataset.deluser;
  const viewChatId = e.target.dataset.viewchat;

  if (toggleId) {
    const post = state.posts.find(p => String(p.id) === String(toggleId));
    if (!post) return;
    post.status = post.status === "removed" ? "active" : "removed";
    syncState();
    renderFeed();
    renderAdmin();
  }

  if (delUserId) {
    const idNum = Number(delUserId);
    state.users = state.users.filter(u => u.id !== idNum);
    syncState();
    renderAdmin();
  }

  if (viewChatId) {
    const post = state.posts.find(p => String(p.id) === String(viewChatId));
    if (!post) return;
    openAdminChatView(post);
  }
});

// inbox open chat
on(inboxList, "click", e => {
  const id = e.target.dataset.openChat;
  if (!id) return;
  if (!requireLogin()) return;
  openChatForPost(id);
});

// chat events
on($("closeChat"), "click", () => {
  chatModal.classList.add("hidden");
  currentChatPostId = null;
  adminViewChat = false;
  chatForm.classList.remove("hidden");
});

on(chatForm, "submit", e => {
  e.preventDefault();
  if (adminViewChat) return;
  if (!requireLogin() || !currentChatPostId) return;
  const text = chatInput.value.trim();
  if (!text) return;
  const post = state.posts.find(p => String(p.id) === String(currentChatPostId));
  if (!post) return;
  post.chatMessages ||= [];
  post.chatMessages.push({
    id: Date.now(),
    from: state.currentUser.name,
    text,
    time: Date.now(),
    seen: false
  });
  syncState();
  chatInput.value = "";
  renderChatMessages(post);
  updateUnreadIndicator();
});

on(chatMessagesBox, "click", e => {
  const id = e.target.dataset.delmsg;
  if (!id || !currentChatPostId || adminViewChat) return;
  const post = state.posts.find(p => String(p.id) === String(currentChatPostId));
  if (!post?.chatMessages) return;
  post.chatMessages = post.chatMessages.filter(m => String(m.id) !== String(id));
  syncState();
  renderChatMessages(post);
  updateUnreadIndicator();
});

// ===== renderAll helper =====
const renderAll = () => {
  updateAuthUI();
  renderFeed();
  renderUserListings();
  renderInbox();
  renderAdmin();
};

// ===== initial =====
updateAuthUI();
loadState();
setInterval(refreshFromServer, 4000);
