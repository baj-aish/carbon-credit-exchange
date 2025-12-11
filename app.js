// ===== helpers =====
const qs = id => document.getElementById(id);
const qsa = sel => [...document.querySelectorAll(sel)];
const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

const API_BASE = "https://carbon-credit-exchange-backend.onrender.com";
// ===== API helpers =====
async function apiGet(path) {
  const res = await fetch(API_BASE + path, { credentials: 'same-origin' });
  if (!res.ok) throw await res.json().catch(() => ({ error: 'Network error' }));
  return res.json();
}

async function apiPost(path, body) {
  const res = await fetch(API_BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw await res.json().catch(() => ({ error: 'Network error' }));
  return res.json();
}

async function apiPut(path, body) {
  const res = await fetch(API_BASE + path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw await res.json().catch(() => ({ error: 'Network error' }));
  return res.json();
}

// ===== compatibility stub for old syncState() calls =====
// Many parts of the UI still call syncState(); keep a no-op so code doesn't break.
// When using real endpoints we replace specific calls with apiPost/apiPut.
const syncState = () => {
  // no-op: sync handled by dedicated API calls (loadPosts / apiPut / apiPost)
  return Promise.resolve();
};
// ===== session restore (recreate session from localStorage) =====
const restoreSession = () => {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return;
  try {
    const s = JSON.parse(raw);
    if (!s.name) return;
    // recreate a minimal currentUser record (server will be authoritative)
    state.currentUser = {
      id: s.id || Date.now(),
      name: s.name,
      email: s.email || "",
      role: s.role || "user"
    };
    updateAuthUI();
  } catch (e) {
    console.log("session restore error", e);
  }
};

// ===== loadState (keeps the call you already have) =====
const loadState = async () => {
  // restore local session first (so user UI appears while posts load)
  restoreSession();
  // then load posts from server
  await loadPosts();
  // choose which section to show
  const last = localStorage.getItem(LAST_SECTION_KEY) || "landing";
  if (!state.currentUser && PROTECTED_SECTIONS.includes(last)) {
    showSection("landing");
  } else {
    showSection(last);
  }
};


const SESSION_KEY = "ccx_session_v1";
const LAST_SECTION_KEY = "ccx_last_section_v1";
const PROTECTED_SECTIONS = ["feed", "upload", "calculator", "admin", "inbox"];

// highlight active nav item (underline + dark bg)
const setActiveNav = section => {
  qsa(".nav-btn").forEach(btn => {
    const target = btn.dataset.section;
    const isActive = target === section;

    // underline
    btn.classList.toggle("border-b-2", isActive);
    btn.classList.toggle("border-b-emerald-400", isActive);
    btn.classList.toggle("border-b-transparent", !isActive);

    // background + text
    const isSpecial = PROTECTED_SECTIONS.includes(target);
    btn.classList.toggle("bg-slate-900", !isActive);
    btn.classList.toggle("bg-slate-800", isActive && isSpecial);
    btn.classList.toggle("text-white", isActive);
  });
};


// global state (users + posts live on backend)
let state = {
  users: [],
  posts: [],
  currentUser: null
};

let editPostId = null;
let currentChatPostId = null;
let adminViewChat = false;

// ===== session helpers (only keep who is logged in on this device) =====
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

const normalizeRole = (name, role) =>
  name.trim().toLowerCase() === "bajaish" && role === "admin" ? "admin" : "user";

// ===== backend sync =====
// Load posts from MongoDB
// Load posts from backend (uses apiGet helper)
const loadPosts = async () => {
  try {
    const posts = await apiGet("/api/posts");
    // normalize to use .id where possible (older client code uses p.id)
    state.posts = (Array.isArray(posts) ? posts : []).map(p => {
      // keep both _id and id for compatibility
      if (!p.id && p._id) p.id = p._id;
      return p;
    });
    renderFeed();
    renderUserListings();
    renderInbox();
    renderAdmin();
  } catch (err) {
    console.log("posts load error", err);
  }
};


// After login, call loadPosts()


// ===== DOM refs =====
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

// ===== misc helpers =====
const showSection = name => {
  qsa(".section").forEach(s => s.classList.add("hidden"));
  const sec = qs("section-" + name);
  if (sec) sec.classList.remove("hidden");

  // remember last section
  localStorage.setItem(LAST_SECTION_KEY, name);

  // update nav highlight
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

// ===== INBOX =====
const getInboxItems = () => {
  if (!state.currentUser) return [];
  const me = state.currentUser.name;
  const conversations = {};

  state.posts.forEach(p => {
    if (!p.chatMessages?.length) return;

    // only include threads where user is participant
    const participated =
      p.user === me || p.chatMessages.some(m => m.from === me);
    if (!participated) return;

    // find last incoming msg
    const msgs = p.chatMessages.filter(m => m.from !== me);
    const lastMsg = msgs[msgs.length - 1];

    if (!lastMsg) return;

    conversations[p.id] = {
      postId: p.id,
      postTitle: p.title,
      from: lastMsg.from,
      text: lastMsg.text,
      time: lastMsg.time,
      seen: lastMsg.seen
    };
  });

  return Object.values(conversations).sort((a, b) => b.time - a.time);
};


const updateUnreadIndicator = () => {
  if (!state.currentUser) {
    inboxIndicator.classList.add("hidden");
    return;
  }

  const items = getInboxItems();
  const unread = items.filter(i => !i.seen).length;

  if (unread > 0) inboxIndicator.classList.remove("hidden");
  else inboxIndicator.classList.add("hidden");
};


const renderInbox = () => {
  if (!inboxList) return;
  if (!state.currentUser) {
    inboxList.innerHTML =
      `<p class="text-sm text-slate-300">Please login to see your inbox.</p>`;
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
      </div>`;
    })
    .join("");
  updateUnreadIndicator();
};

// ===== AUTH UI =====
const updateAuthUI = () => {
  const loginBtn = qs("loginBtn");
  const logoutBtn = qs("logoutBtn");
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
    qsa(".protected-nav").forEach(b => b.classList.remove("hidden"));
    u.role === "admin"
      ? adminTab.classList.remove("hidden")
      : adminTab.classList.add("hidden");
    feedFiltersBox?.classList.remove("hidden");
  } else {
    loginBtn.classList.remove("hidden");
    logoutBtn.classList.add("hidden");
    userBadge.classList.add("hidden");
    badgeRole.textContent = "";
    heroLoginBtn?.classList.remove("hidden");
    welcomeLine?.classList.add("hidden");
    adminTab.classList.add("hidden");
    feedFiltersBox?.classList.add("hidden");
    qsa(".protected-nav").forEach(b => b.classList.add("hidden"));
  }
  updateUnreadIndicator();
};

// ===== FEED / ADMIN =====
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
      let ownerText;
      if (state.currentUser && p.user === state.currentUser.name) {
        const d = p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "";
        ownerText = `Post created by you${d ? " • " + d : ""}`;
      } else ownerText = `By ${p.user}`;
      return `
      <article class="bg-slate-900 rounded-2xl shadow overflow-hidden flex flex-col border border-slate-700">
        <img src="${p.image}" class="w-full h-44 object-cover" alt="post image">
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
      </article>`;
    })
    .join("");
};

const renderAdmin = () => {
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

// ===== YOUR LISTINGS / EDIT =====
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
  if (!yourListingsTab || !createListingTab || !userListingsBox || !uploadWrapper) return;
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
    if (uploadFormBtn) uploadFormBtn.textContent = "Upload Listing";
  }
};

// ===== NAV + HERO =====
qsa(".nav-btn").forEach(btn =>
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

on(heroLoginBtn, "click", () => qs("loginModal").classList.remove("hidden"));
on(heroExploreBtn, "click", () => {
  if (!requireLogin()) return;
  showSection("feed");
  renderFeed();
});

on(priceFilter, "change", renderFeed);
on(creditsFilter, "change", renderFeed);

on(qs("gotoCalcLink"), "click", () => {
  if (!requireLogin()) return;
  showSection("calculator");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ===== LOGIN / REGISTER =====
on(qs("loginBtn"), "click", () => qs("loginModal").classList.remove("hidden"));
on(qs("closeLogin"), "click", () => qs("loginModal").classList.add("hidden"));

const tabRegister = qs("tabRegister");
const tabLogin = qs("tabLogin");
const registerForm = qs("registerForm");
const loginForm = qs("loginForm");
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

on(registerForm, "submit", async e => {
  e.preventDefault();
  const name = qs("regName").value.trim();
  const email = qs("regEmail").value.trim();
  const password = qs("regPass").value.trim();

  if (!name || !email || !password) return alert("Fill all fields.");

  const res = await fetch(API_BASE + "/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
  });

  const data = await res.json();
  if (data.error) return alert(data.error);

  alert("Registration successful. Please login.");
  switchAuthTab("login");
});
on(loginForm, "submit", async e => {
  e.preventDefault();
  const name = qs("loginName").value.trim();
  const password = qs("loginPass").value.trim();
  const loginRole = qs("loginRole").value;

  const res = await fetch(API_BASE + "/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, password, loginRole })
  });

  const data = await res.json();
  if (data.error) return alert(data.error);

  state.currentUser = data;
  saveSession();
  updateAuthUI();

  qs("loginModal").classList.add("hidden");

  loadPosts();
  showSection("feed");
});



on(qs("logoutBtn"), "click", () => {
  state.currentUser = null;
  saveSession();
  updateAuthUI();
  showSection("landing");
});

// ===== POST LISTING =====
on(yourListingsTab, "click", () => {
  if (requireLogin()) setListingMode("your");
});
on(createListingTab, "click", () => {
  if (requireLogin()) setListingMode("create");
});

on(uploadForm, "submit", e => {
  e.preventDefault();
  if (!requireLogin()) return;
  const title = qs("postTitle").value.trim();
  const desc = qs("postDesc").value.trim();
  const price = parseFloat(qs("postPrice").value) || 0;
  const credits = parseFloat(qs("postCredits").value) || 0;
  const file = qs("postImage").files[0];
  const isEdit = !!editPostId;
  if (!title || !desc) return;

  const finish = img => {
        if (isEdit) {
      // server expects PUT /api/posts/:id
      try {
        const postLocal = state.posts.find(p => String(p.id) === String(editPostId) || String(p._id) === String(editPostId));
        if (!postLocal) return alert("Post not found for edit.");
        const idToUse = postLocal._id || postLocal.id;
        const updated = await apiPut(`/api/posts/${idToUse}`, {
          title, desc, price, credits, image: img ? img : postLocal.image
        });
        // update local cache and re-render
        const idx = state.posts.findIndex(p => String(p._id || p.id) === String(idToUse));
        if (idx !== -1) state.posts[idx] = updated;
        renderFeed();
        renderUserListings();
        alert("Listing updated.");
      } catch (err) {
        console.error("update post error", err);
        alert("Failed to update listing.");
      }
    } else {
      try {
        const created = await apiPost("/api/posts", {
          title, desc, image: img || "", user: state.currentUser.name,
          likes: 0, likedBy: [], comments: [], chatMessages: [], status: "active", price, credits, createdAt: Date.now()
        });
        // server returns created post; normalize id
        if (!created.id && created._id) created.id = created._id;
        state.posts.unshift(created);
        renderFeed();
        renderUserListings();
        alert("Listing uploaded.");
      } catch (err) {
        console.error("create post error", err);
        alert("Failed to upload listing.");
      }
    }

    uploadForm.reset();
    editPostId = null;
    uploadFormBtn.textContent = "Upload Listing";
  };

  if (file) {
    if (file.size > 50 * 1024)
      return alert("Image too large! Only up to 50 KB allowed.");
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
  qs("postTitle").value = post.title;
  qs("postDesc").value = post.desc;
  qs("postPrice").value = post.price;
  qs("postCredits").value = post.credits;
  uploadFormBtn.textContent = "Save changes";
});

// ===== FEED EVENTS =====
on(feedContainer, "click", e => {
  const likeId = e.target.dataset.like;
  const commentId = e.target.dataset.commentBtn;
  const chatId = e.target.dataset.chat;

  if (likeId) {
    if (!requireLogin()) return;
    const post = state.posts.find(p => String(p.id) === String(likeId));
    if (!post) return;
      try {
      post.likedBy ||= [];
      const me = state.currentUser.name;
      const idx = post.likedBy.indexOf(me);
      if (idx === -1) {
        post.likedBy.push(me);
        post.likes = (post.likes || 0) + 1;
      } else {
        post.likedBy.splice(idx, 1);
        post.likes = Math.max(0, (post.likes || 0) - 1);
      }
      const idToUse = post._id || post.id;
      const updated = await apiPut(`/api/posts/${idToUse}`, { likedBy: post.likedBy, likes: post.likes });
      // update local copy
      const i = state.posts.findIndex(p => String(p._id || p.id) === String(idToUse));
      if (i !== -1) state.posts[i] = updated;
      renderFeed();
    } catch (err) {
      console.error("like update failed", err);
      alert("Failed to update like.");
    }

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
        try {
      post.comments ||= [];
      post.comments.push({ by: state.currentUser.name, text, time: Date.now() });
      const idToUse = post._id || post.id;
      const updated = await apiPut(`/api/posts/${idToUse}`, { comments: post.comments });
      const i = state.posts.findIndex(p => String(p._id || p.id) === String(idToUse));
      if (i !== -1) state.posts[i] = updated;
      input.value = "";
      renderFeed();
    } catch (err) {
      console.error("comment error", err);
      alert("Failed to post comment.");
    }

  }

  if (chatId) {
    if (!requireLogin()) return;
    openChatForPost(chatId);
  }
});

// ===== ADMIN EVENTS (remove user, toggle post, view chat) =====
on(adminList, "click", e => {
  const toggleId = e.target.dataset.toggle;
  const delUserId = e.target.dataset.deluser;
  const viewChatId = e.target.dataset.viewchat;

  if (toggleId) {
       try {
      const post = state.posts.find(p => String(p.id) === String(toggleId) || String(p._id) === String(toggleId));
      if (!post) return;
      const idToUse = post._id || post.id;
      const newStatus = post.status === "removed" ? "active" : "removed";
      const updated = await apiPut(`/api/posts/${idToUse}`, { status: newStatus });
      const idx = state.posts.findIndex(p => String(p._id || p.id) === String(idToUse));
      if (idx !== -1) state.posts[idx] = updated;
      renderFeed();
      renderAdmin();
    } catch (err) {
      console.error("toggle post error", err);
      alert("Failed to change status.");
    }
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
    adminViewChat = true;
    chatForm.classList.add("hidden");

    const participants = new Set();
    participants.add(post.user);
    (post.chatMessages || []).forEach(m => participants.add(m.from));
    const names = [...participants];

    if (names.length === 2) {
      chatPostTitle.textContent = `Chat between ${names[0]} and ${names[1]}`;
    } else {
      chatPostTitle.textContent = `Chat on "${post.title}" between ${names.join(
        ", "
      )}`;
    }

    currentChatPostId = post.id;
    renderChatMessages(post);
    chatModal.classList.remove("hidden");
  }
});

// inbox → open chat (normal user)
on(inboxList, "click", e => {
  const id = e.target.dataset.openChat;
  if (!id) return;
  if (!requireLogin()) return;
  openChatForPost(id);
});

// ===== CHAT =====
const openChatForPost = async postId => {
  const post = state.posts.find(p => String(p.id) === String(postId));
  if (!post) return;
  adminViewChat = false;
  chatForm.classList.remove("hidden");
  post.chatMessages ||= [];
  // mark incoming as seen for this user
    // mark incoming as seen for this user (try server-side first; fallback to local)
  if (state.currentUser) {
    try {
      await apiPut(`/api/posts/${post._id || post.id}/chat/mark-seen`, { receiver: state.currentUser.name });
      // refresh posts (server returns updated seen flags)
      await loadPosts();
    } catch (err) {
      // fallback: mark locally if server call fails
      post.chatMessages.forEach(m => {
        if (m.from !== state.currentUser.name) m.seen = true;
      });
    }
  }

  currentChatPostId = post.id;
  chatPostTitle.textContent = `Chat about: ${post.title}`;
  renderChatMessages(post);
  chatModal.classList.remove("hidden");
};

const renderChatMessages = post => {
  if (!post.chatMessages?.length) {
    chatMessagesBox.innerHTML =
      '<p class="text-[11px] text-slate-400 text-center mt-6">No messages yet. Start the conversation.</p>';
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
          mine ? "bg-emerald-600 text-white" : "bg-slate-800 border border-slate-700"
        }">
          <div class="font-semibold mb-0.5">${mine ? "You" : m.from}</div>
          <div>${m.text}</div>
          <div class="flex justify-between items-center mt-0.5 text-[9px] opacity-80">
            <span>${time}</span>
            ${
              mine
                ? `<span>${m.seen ? "Seen" : "Sent"}</span>`
                : ""
            }
          </div>
        </div>
      </div>`;
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
  if (adminViewChat) return; // admin read-only view
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

// ===== CALCULATOR =====
qsa('input[name="calcMethod"]').forEach(r =>
  on(r, "change", () => {
    const v = document.querySelector('input[name="calcMethod"]:checked').value;
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
  if (N <= 0 || t <= 0) return alert("Enter valid tree count and years.");
  const annual = (N * x) / 1000;
  showResult(annual, annual * t);
});

on(qs("calcLandBtn"), "click", () => {
  const A = parseFloat(qs("landArea").value);
  const unit = qs("landUnit").value;
  const t = parseFloat(qs("landYears").value);
  if (A <= 0 || t <= 0) return alert("Enter valid area and years.");
  let hectares = A;
  if (unit === "acres") hectares *= 0.404686;
  const annual = hectares * 6;
  showResult(annual, annual * t);
});

// ===== INITIAL LOAD + polling for near-realtime chat =====
updateAuthUI();
loadState();                  // loadState will decide which section to show
setInterval(loadPosts, 1000);




