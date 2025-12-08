// ===== helpers =====
const qs = id => document.getElementById(id);
const qsa = sel => [...document.querySelectorAll(sel)];
const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

const API_BASE = "https://carbon-credit-exchange-backend.onrender.com";
const SESSION_KEY = "ccx_session_v1";
const LAST_SECTION_KEY = "ccx_last_section_v1";
const PROTECTED_SECTIONS = ["feed", "upload", "calculator", "admin", "inbox"];

// ===== highlight active nav =====
const setActiveNav = section => {
  qsa(".nav-btn").forEach(btn => {
    const target = btn.dataset.section;
    const isActive = target === section;

    btn.classList.toggle("border-b-2", isActive);
    btn.classList.toggle("border-b-emerald-400", isActive);
    btn.classList.toggle("border-b-transparent", !isActive);

    const isSpecial = PROTECTED_SECTIONS.includes(target);
    btn.classList.toggle("bg-slate-900", !isActive);
    btn.classList.toggle("bg-slate-800", isActive && isSpecial);
    btn.classList.toggle("text-white", isActive);
  });
};

// ===== GLOBAL STATE =====
let state = {
  users: [],
  posts: [],
  currentUser: null
};

let editPostId = null;
let currentChatPostId = null;
let adminViewChat = false;

// ======================================================
// ================= SESSION HANDLING ===================
// ======================================================

// ✅ SAVE SESSION (unchanged behavior)
const saveSession = () => {
  if (state.currentUser) {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        name: state.currentUser.name,
        role: state.currentUser.role
      })
    );
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
};

// ✅ STRICT ROLE NORMALIZATION (same as original)
const normalizeRole = (name, role) =>
  name.trim().toLowerCase() === "bajaish" && role === "admin" ? "admin" : "user";

// ✅ REFRESH LOGIN FIX (STABLE)
const restoreSession = () => {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return;

  try {
    const s = JSON.parse(raw);
    if (!s.name) return;

    const u = state.users.find(
      x => x.name.toLowerCase() === s.name.toLowerCase()
    );

    if (!u) return;

    state.currentUser = {
      id: u.id,
      name: u.name,
      email: u.email,
      role: s.role || u.role
    };

  } catch (e) {
    console.log("Session restore error:", e);
  }
};

// ======================================================
// ================= BACKEND SYNC =======================
// ======================================================

// ✅ same as original
const syncState = () => {
  fetch(API_BASE + "/api/state", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ users: state.users, posts: state.posts })
  }).catch(err => console.log("sync error", err));
};

// ✅ apply remote state (same structure)
const applyRemoteState = data => {
  state.users = Array.isArray(data.users) ? data.users : [];
  state.posts = Array.isArray(data.posts) ? data.posts : [];
  renderFeed();
  renderUserListings();
  renderInbox();
  renderAdmin();

  if (!chatModal.classList.contains("hidden") && currentChatPostId) {
    const p = state.posts.find(
      x => String(x.id) === String(currentChatPostId)
    );
    if (p) renderChatMessages(p);
  }
};

// ✅ load state + restore login (FIXED ORDER)
const loadState = () => {
  fetch(API_BASE + "/api/state")
    .then(r => r.json())
    .then(data => {
      applyRemoteState(data);
      restoreSession();      // ✅ refresh login fixed here
      updateAuthUI();

      const last = localStorage.getItem(LAST_SECTION_KEY) || "landing";
      if (!state.currentUser && PROTECTED_SECTIONS.includes(last)) {
        showSection("landing");
      } else {
        showSection(last);
      }
    })
    .catch(err => console.log("load error", err));
};

// ✅ REAL-TIME REFRESH (NO GAP CHAT)
const refreshFromServer = () => {
  fetch(API_BASE + "/api/state")
    .then(r => r.json())
    .then(applyRemoteState)
    .catch(err => console.log("refresh error", err));
};

// ======================================================
// ================= DOM REFERENCES =====================
// ======================================================
const userBadge = qs("userBadge");
const badgeName = qs("badgeName");
const badgeRole = qs("badgeRole");
const adminTab = qs("adminTab");
const inboxIndicator = qs("inboxIndicator");

const inboxList = qs("inboxList");
const feedContainer = qs("feedContainer");
const emptyFeedMsg = qs("emptyFeedMsg");
const feedFiltersBox = qs("feedFilters");
const priceFilter = qs("priceFilter");
const creditsFilter = qs("creditsFilter");

const welcomeLine = qs("welcomeLine");
const welcomeName = qs("welcomeName");
const heroLoginBtn = qs("heroLoginBtn");
const heroExploreBtn = qs("heroExploreBtn");

const chatModal = qs("chatModal");
const chatMessagesBox = qs("chatMessages");
const chatPostTitle = qs("chatPostTitle");
const chatForm = qs("chatForm");
const chatInput = qs("chatInput");

const adminList = qs("adminList");
const yourListingsTab = qs("yourListingsTab");
const createListingTab = qs("createListingTab");
const userListingsBox = qs("userListings");
const uploadWrapper = qs("uploadWrapper");
const uploadForm = qs("uploadForm");
const uploadFormBtn = qs("uploadFormBtn");

// ======================================================
// ================= UI NAV HELPERS =====================
// ======================================================

const showSection = name => {
  qsa(".section").forEach(s => s.classList.add("hidden"));
  const sec = qs("section-" + name);
  if (sec) sec.classList.remove("hidden");
  localStorage.setItem(LAST_SECTION_KEY, name);
  setActiveNav(name);
};

const requireLogin = () => {
  if (!state.currentUser) {
    alert("Please login first.");
    qs("loginModal").classList.remove("hidden");
    return false;
  }
  return true;
};

// ======================================================
// ================= INBOX (START) ======================
// (Single conversation logic continues in PART 2)
// ======================================================

const getInboxItems = () => {
  if (!state.currentUser) return [];

  const me = state.currentUser.name;
  const map = new Map();

  state.posts.forEach(p => {
    if (!p.chatMessages?.length) return;

    const relevant = p.chatMessages.filter(
      m => m.from === me || p.user === me
    );

    if (!relevant.length) return;

    const last = p.chatMessages[p.chatMessages.length - 1];

    map.set(p.id, {
      postId: p.id,
      postTitle: p.title,
      from: last.from,
      text: last.text,
      time: last.time,
      seen: last.from === me ? true : !!last.seen
    });
  });

  return [...map.values()].sort((a, b) => b.time - a.time);
};

const updateUnreadIndicator = () => {
  if (!inboxIndicator || !state.currentUser) return;
  const unread = getInboxItems().filter(i => !i.seen && i.from !== state.currentUser.name).length;
  unread
    ? inboxIndicator.classList.remove("hidden")
    : inboxIndicator.classList.add("hidden");
};
// ======================================================
// ================= INBOX RENDER =======================
// ======================================================

const renderInbox = () => {
  if (!inboxList) return;

  if (!state.currentUser) {
    inboxList.innerHTML =
      `<p class="text-sm text-slate-300">Please login to see your inbox.</p>`;
    updateUnreadIndicator();
    return;
  }

  const items = getInboxItems();

  if (!items.length) {
    inboxList.innerHTML =
      `<p class="text-sm text-slate-300">No messages yet.</p>`;
    updateUnreadIndicator();
    return;
  }

  inboxList.innerHTML = items
    .map(i => {
      const t = new Date(i.time).toLocaleString();
      const badge = i.seen
        ? "bg-slate-700 text-slate-200"
        : "bg-red-500/20 text-red-300";
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
            <button data-open-chat="${i.postId}" class="text-[11px] underline">
              Open chat
            </button>
          </div>
        </div>
      `;
    })
    .join("");

  updateUnreadIndicator();
};

// inbox → open chat
on(inboxList, "click", e => {
  const id = e.target.dataset.openChat;
  if (!id) return;
  if (!requireLogin()) return;
  openChatForPost(id);
});

// ======================================================
// ================= FEED / FILTERS =====================
// ======================================================

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

  if (pf === "low-high") arr = [...arr].sort((a, b) => (a.price || 0) - (b.price || 0));
  if (pf === "high-low") arr = [...arr].sort((a, b) => (b.price || 0) - (a.price || 0));

  // show own posts first
  if (state.currentUser) {
    const me = state.currentUser.name;
    const mine = arr.filter(p => p.user === me);
    const others = arr.filter(p => p.user !== me);
    arr = [...mine, ...others];
  }

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

  feedContainer.innerHTML = posts
    .map(p => {
      const commentsHtml = p.comments?.length
        ? p.comments.map(c => `<p class="text-xs"><b>${c.by}:</b> ${c.text}</p>`).join("")
        : '<p class="text-xs text-slate-400">No comments yet</p>';

      const ownerText =
        state.currentUser && p.user === state.currentUser.name
          ? "Post created by you"
          : `By ${p.user}`;

      return `
        <article class="bg-slate-900 rounded-2xl shadow overflow-hidden flex flex-col border border-slate-700">
          <img src="${p.image}" class="w-full h-44 object-cover" alt="post image">
          <div class="p-3 flex-1 flex flex-col">
            <h3 class="font-semibold text-sm mb-1">${p.title}</h3>
            <p class="text-xs text-slate-300 mb-1">${p.desc}</p>

            <div class="flex items-center justify-between text-[11px] mb-2">
              <span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300">
                ${p.credits || 0} credits
              </span>
              <span class="font-semibold text-emerald-200">₹${p.price || 0}</span>
            </div>

            <p class="text-[11px] text-slate-400 mb-2">${ownerText}</p>

            <div class="mt-auto space-y-2">
              <div class="flex items-center justify-between text-xs">
                <button data-like="${p.id}" class="px-2 py-1 rounded-full border border-slate-600 text-[11px]">
                  ❤️ Like (${p.likes || 0})
                </button>
                <button data-chat="${p.id}" class="px-2 py-1 rounded-full border border-slate-600 text-[11px]">
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
        </article>
      `;
    })
    .join("");
};

// ======================================================
// ================= FEED EVENTS ========================
// ======================================================

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

    const input = document.querySelector(
      `[data-comment-input="${commentId}"]`
    );

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

// ======================================================
// ================= CHAT SYSTEM ========================
// (Single conversation per post)
// ======================================================

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

const renderChatMessages = post => {
  if (!post.chatMessages?.length) {
    chatMessagesBox.innerHTML =
      '<p class="text-[11px] text-slate-400 text-center mt-6">No messages yet.</p>';
    return;
  }

  chatMessagesBox.innerHTML = post.chatMessages
    .map(m => {
      const mine = state.currentUser && m.from === state.currentUser.name;
      const time = new Date(m.time).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });

      return `
        <div class="flex ${mine ? "justify-end" : "justify-start"}">
          <div class="max-w-[75%] px-2 py-1 rounded-lg text-[11px] ${
            mine ? "bg-emerald-600 text-white"
                 : "bg-slate-800 border border-slate-700"
          }">
            <div class="font-semibold mb-0.5">${mine ? "You" : m.from}</div>
            <div>${m.text}</div>
            <div class="flex justify-between items-center mt-0.5 text-[9px] opacity-80">
              <span>${time}</span>
              ${mine ? `<span>${m.seen ? "Seen" : "Sent"}</span>` : ""}
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  chatMessagesBox.scrollTop = chatMessagesBox.scrollHeight;
};

on(qs("closeChat"), "click", () => {
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

  const post = state.posts.find(
    p => String(p.id) === String(currentChatPostId)
  );
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

// ======================================================
// ================= ADMIN PANEL ========================
// (unchanged except chat consistency)
// ======================================================

const renderAdmin = () => {
  const u = state.currentUser;

  if (!u || u.role !== "admin") {
    adminList.innerHTML =
      `<p class="text-sm text-slate-300">You are not admin.</p>`;
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
        </tr>
      `
        )
        .join("")
    : `<tr><td colspan="5" class="text-xs text-center text-slate-400 py-2">
         No registered users yet.
       </td></tr>`;

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
  `;
};

// ======================================================
// ================= CALCULATOR =========================
// (unchanged logic)
// ======================================================

qsa('input[name="calcMethod"]').forEach(r =>
  on(r, "change", () => {
    const v = document.querySelector(
      'input[name="calcMethod"]:checked'
    ).value;
    qs("treeForm").classList.toggle("hidden", v !== "trees");
    qs("landForm").classList.toggle("hidden", v !== "land");
    qs("calcResult").classList.add("hidden");
  })
);

const showResult = (annual, total) => {
  const box = qs("calcResult");
  box.classList.remove("hidden");
  qs("annualCredits").textContent =
    `Annual Carbon Credits: ${annual.toFixed(2)} tons CO₂ / year`;
  qs("totalCredits").textContent =
    `Total Carbon Credits: ${total.toFixed(2)} tons CO₂`;
};

on(qs("calcTreesBtn"), "click", () => {
  const x = parseFloat(qs("treeType").value);
  const N = parseFloat(qs("treeCount").value);
  const t = parseFloat(qs("treeYears").value);

  if (N <= 0 || t <= 0)
    return alert("Enter valid tree count and years.");

  const annual = (N * x) / 1000;
  showResult(annual, annual * t);
});

on(qs("calcLandBtn"), "click", () => {
  const A = parseFloat(qs("landArea").value);
  const unit = qs("landUnit").value;
  const t = parseFloat(qs("landYears").value);

  if (A <= 0 || t <= 0)
    return alert("Enter valid area and years.");

  let hectares = A;
  if (unit === "acres") hectares *= 0.404686;

  const annual = hectares * 6;
  showResult(annual, annual * t);
});

// ======================================================
// ================= INITIAL LOAD =======================
// ======================================================

updateAuthUI();
loadState();
setInterval(refreshFromServer, 1000);
