// app.js

// ---------- Helpers ----------
const qs = (id) => document.getElementById(id);
const qsa = (sel) => Array.from(document.querySelectorAll(sel));
const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

const API_BASE = "https://<YOUR-RENDER-URL>"; // <-- PUT YOUR RENDER URL HERE

const SESSION_KEY = "ccx_session_v1";
const LAST_SECTION_KEY = "ccx_last_section_v1";

let state = {
  users: [],
  posts: [],
  currentUser: null,
};

let currentChatPostId = null;

// ---------- Error banner (fix 17) ----------
const showError = (msg) => {
  const box = qs("errorBanner");
  if (!box) {
    alert(msg);
    return;
  }
  box.textContent = msg;
  box.classList.remove("hidden");
  setTimeout(() => box.classList.add("hidden"), 5000);
};

// ---------- Fetch helpers ----------
async function apiGet(path) {
  const res = await fetch(API_BASE + path);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function apiPost(path, body) {
  const res = await fetch(API_BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function apiDelete(path) {
  const res = await fetch(API_BASE + path, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ---------- Session + last section (6, 8) ----------
function saveSession() {
  if (!state.currentUser) {
    localStorage.removeItem(SESSION_KEY);
  } else {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        id: state.currentUser.id,
        name: state.currentUser.name,
      })
    );
  }
}

function restoreSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return;
  try {
    const sess = JSON.parse(raw);
    if (!sess.name) return;
    const user = state.users.find(
      (u) => u.name.toLowerCase() === sess.name.toLowerCase()
    );
    // if backend lost user, session gracefully clears (6, 7)
    if (user) state.currentUser = user;
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    localStorage.removeItem(SESSION_KEY);
  }
}

function saveLastSection(id) {
  localStorage.setItem(LAST_SECTION_KEY, id);
}

function restoreLastSection() {
  const id = localStorage.getItem(LAST_SECTION_KEY);
  if (!id) return "section-landing";
  // guard protected sections for logged-out users (8)
  const protectedIds = [
    "section-feed",
    "section-upload",
    "section-calculator",
    "section-inbox",
    "section-admin",
  ];
  if (!state.currentUser && protectedIds.includes(id)) {
    return "section-landing";
  }
  return id;
}

// ---------- Navigation (14, 15) ----------
function showSection(id) {
  const sectionEl = qs(id);
  if (!sectionEl) {
    console.warn("Section not found:", id);
    return;
  }
  qsa("section[data-section-root]").forEach((s) =>
    s.classList.add("hidden")
  );
  sectionEl.classList.remove("hidden");
  saveLastSection(id);
  setActiveNav(id);
}

function setActiveNav(sectionId) {
  qsa(".nav-btn").forEach((btn) => {
    const targetId = btn.dataset.section
      ? `section-${btn.dataset.section}`
      : "";
    if (targetId === sectionId) btn.classList.add("bg-gray-800", "underline");
    else btn.classList.remove("bg-gray-800", "underline");
  });
}

function setupNav() {
  qsa(".nav-btn").forEach((btn) => {
    on(btn, "click", () => {
      const name = btn.dataset.section;
      if (!name) return;
      const id = `section-${name}`;
      if (!state.currentUser && ["feed", "upload", "calculator", "inbox", "admin"].includes(name)) {
        openLoginModal();
        return;
      }
      showSection(id);
    });
  });

  // hero buttons (15: still JS, but robust + reuses nav logic)
  on(qs("heroLoginBtn"), "click", openLoginModal);
  on(qs("heroMarketplaceBtn"), "click", () => {
    if (!state.currentUser) {
      openLoginModal();
    } else {
      showSection("section-feed");
    }
  });
}

// ---------- Auth UI ----------
function updateAuthUI() {
  const userBadge = qs("userBadge");
  const badgeName = qs("badgeName");
  const badgeRole = qs("badgeRole");
  const loginBtn = qs("loginBtn");
  const logoutBtn = qs("logoutBtn");

  if (!state.currentUser) {
    if (userBadge) userBadge.classList.add("hidden");
    if (loginBtn) loginBtn.classList.remove("hidden");
    if (logoutBtn) logoutBtn.classList.add("hidden");
  } else {
    if (userBadge) userBadge.classList.remove("hidden");
    if (badgeName) badgeName.textContent = state.currentUser.name;
    if (badgeRole) badgeRole.textContent = state.currentUser.role;
    if (loginBtn) loginBtn.classList.add("hidden");
    if (logoutBtn) logoutBtn.classList.remove("hidden");
  }

  const adminNav = qs("navAdmin");
  if (adminNav) {
    if (state.currentUser && state.currentUser.role === "admin") {
      adminNav.classList.remove("hidden");
    } else {
      adminNav.classList.add("hidden");
    }
  }

  updateUnreadIndicator(); // refresh red dot after auth change (11)
}

function openLoginModal() {
  const modal = qs("loginModal");
  if (modal) modal.classList.remove("hidden");
}

function closeLoginModal() {
  const modal = qs("loginModal");
  if (modal) modal.classList.add("hidden");
}

function setupAuth() {
  on(qs("loginBtn"), "click", openLoginModal);
  on(qs("loginCloseBtn"), "click", closeLoginModal);

  on(qs("logoutBtn"), "click", () => {
    state.currentUser = null;
    saveSession();
    updateAuthUI();
    showSection("section-landing");
  });

  // register
  on(qs("registerForm"), "submit", async (e) => {
    e.preventDefault();
    const name = qs("regName").value.trim();
    const email = qs("regEmail").value.trim();
    const role = qs("regRole").value;

    try {
      const user = await apiPost("/api/register", { name, email, role });
      state.users.push(user);
      state.currentUser = user;
      saveSession();
      updateAuthUI();
      closeLoginModal();
      showSection("section-feed");
    } catch (err) {
      showError(err.message || "Registration failed");
    }
  });

  // login
  on(qs("loginForm"), "submit", async (e) => {
    e.preventDefault();
    const name = qs("loginName").value.trim();
    const loginRole = qs("loginRole").value;
    try {
      const user = await apiPost("/api/login", { name, loginRole });
      state.currentUser = user;
      saveSession();
      updateAuthUI();
      closeLoginModal();
      showSection(restoreLastSection());
    } catch (err) {
      showError(err.message || "Login failed");
    }
  });
}

// ---------- Rendering: feed / listings ----------
function renderFeed() {
  const container = qs("feedGrid");
  if (!container) return;
  const sc = window.scrollY; // preserve scroll (18)

  const posts = state.posts
    .filter((p) => p.status !== "removed")
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt);

  container.innerHTML = "";
  if (!posts.length) {
    container.innerHTML = `<p class="text-gray-400">No posts yet.</p>`;
    window.scrollTo(0, sc);
    return;
  }

  posts.forEach((p) => {
    const liked =
      state.currentUser &&
      p.likedBy.some(
        (n) => n.toLowerCase() === state.currentUser.name.toLowerCase()
      );
    const isOwner =
      state.currentUser &&
      p.user.toLowerCase() === state.currentUser.name.toLowerCase();

    const card = document.createElement("div");
    card.className =
      "bg-gray-800 rounded-xl p-4 flex flex-col gap-2 shadow-md";

    card.innerHTML = `
      <div class="flex justify-between items-center">
        <h3 class="font-semibold text-lg">${p.title}</h3>
        <span class="text-xs text-gray-400">by ${p.user}</span>
      </div>
      ${
        p.image
          ? `<img src="${p.image}" alt="" class="w-full h-40 object-cover rounded-lg">`
          : ""
      }
      <p class="text-sm text-gray-200">${p.description || ""}</p>
      <div class="text-xs text-gray-400 flex gap-4">
        <span>Price: ${p.price ?? "-"}</span>
        <span>Credits: ${p.credits ?? "-"}</span>
        <span>Status: ${p.status}</span>
      </div>
      <div class="flex justify-between items-center mt-2">
        <button class="like-btn text-sm px-2 py-1 rounded ${
          liked ? "bg-green-600" : "bg-gray-700"
        }" data-id="${p.id}">
          ❤️ ${p.likes}
        </button>
        <button class="chat-btn text-sm px-2 py-1 rounded bg-blue-600" data-id="${
          p.id
        }">Chat</button>
      </div>
      <div class="mt-2">
        <h4 class="font-semibold text-sm mb-1">Comments</h4>
        <div class="space-y-1 text-xs text-gray-200">
          ${
            p.comments && p.comments.length
              ? p.comments
                  .map(
                    (c) =>
                      `<div><span class="font-semibold">${c.user}:</span> ${c.text}</div>`
                  )
                  .join("")
              : `<div class="text-gray-500">No comments yet.</div>`
          }
        </div>
        ${
          state.currentUser
            ? `
          <form class="comment-form mt-2 flex gap-2" data-id="${p.id}">
            <input class="flex-1 bg-gray-900 border border-gray-700 text-xs px-2 py-1 rounded" placeholder="Write a comment...">
            <button class="text-xs px-2 py-1 bg-green-600 rounded">Send</button>
          </form>`
            : `<div class="text-xs text-gray-500 mt-1">Login to comment.</div>`
        }
      </div>
    `;

    container.appendChild(card);
  });

  // bind buttons
  qsa(".like-btn").forEach((btn) => {
    on(btn, "click", () => handleLike(btn.dataset.id));
  });
  qsa(".comment-form").forEach((form) => {
    on(form, "submit", (e) => {
      e.preventDefault();
      const input = form.querySelector("input");
      handleComment(form.dataset.id, input.value.trim());
      input.value = "";
    });
  });
  qsa(".chat-btn").forEach((btn) => {
    on(btn, "click", () => openChatForPost(btn.dataset.id));
  });

  window.scrollTo(0, sc);
}

// ---------- Like / comment (18) ----------
async function handleLike(postId) {
  if (!state.currentUser) return openLoginModal();
  try {
    const updated = await apiPost(`/api/posts/${postId}/like`, {
      userName: state.currentUser.name,
    });
    mergePost(updated);
    renderFeed();
    renderInbox();
  } catch (err) {
    showError(err.message || "Failed to like");
  }
}

async function handleComment(postId, text) {
  if (!state.currentUser) return openLoginModal();
  if (!text) return;
  try {
    const updated = await apiPost(`/api/posts/${postId}/comment`, {
      userName: state.currentUser.name,
      text,
    });
    mergePost(updated);
    renderFeed();
  } catch (err) {
    showError(err.message || "Failed to comment");
  }
}

function mergePost(updated) {
  const idx = state.posts.findIndex((p) => p.id === updated.id);
  if (idx >= 0) state.posts[idx] = updated;
  else state.posts.push(updated);
}

// ---------- Upload / own listings ----------
function setupUpload() {
  on(qs("uploadForm"), "submit", async (e) => {
    e.preventDefault();
    if (!state.currentUser) return openLoginModal();

    const title = qs("postTitle").value.trim();
    const desc = qs("postDesc").value.trim();
    const price = Number(qs("postPrice").value || 0);
    const credits = Number(qs("postCredits").value || 0);
    const imgInput = qs("postImage");

    if (!title) return showError("Title is required");

    let imageData = null;
    if (imgInput && imgInput.files && imgInput.files[0]) {
      const file = imgInput.files[0];
      if (file.size > 50 * 1024) {
        showError("Image must be under 50KB");
        return;
      }
      imageData = await readFileAsDataURL(file);
    }

    try {
      const post = await apiPost("/api/posts", {
        title,
        description: desc,
        image: imageData,
        price,
        credits,
        userName: state.currentUser.name,
      });
      mergePost(post);
      renderFeed();
      renderInbox();
      e.target.reset();
      showSection("section-feed");
    } catch (err) {
      showError(err.message || "Failed to create post");
    }
  });
}

function readFileAsDataURL(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result);
    reader.onerror = () => rej(reader.error);
    reader.readAsDataURL(file);
  });
}

// ---------- Chat + inbox (9, 10, 11, 12) ----------
function openChatForPost(postId) {
  if (!state.currentUser) return openLoginModal();
  currentChatPostId = postId;
  const modal = qs("chatModal");
  const titleEl = qs("chatPostTitle");
  const msgsEl = qs("chatMessages");

  const post = state.posts.find((p) => p.id === postId);
  if (!post || !modal || !msgsEl) return;

  if (titleEl) titleEl.textContent = post.title;

  // Optimistically mark messages to me as seen (10, 11)
  const me = state.currentUser.name.toLowerCase();
  post.chatMessages.forEach((m) => {
    if (m.to.toLowerCase() === me) m.seen = true;
  });
  updateUnreadIndicator();
  renderChatMessages(post);

  modal.classList.remove("hidden");

  // persist seen status
  apiPost(`/api/posts/${postId}/seen`, { userName: state.currentUser.name })
    .then((updated) => {
      mergePost(updated);
      renderInbox();
      renderChatMessages(updated);
    })
    .catch(() => {});
}

function closeChat() {
  const modal = qs("chatModal");
  if (modal) modal.classList.add("hidden");
  currentChatPostId = null;
}

function renderChatMessages(post) {
  const msgsEl = qs("chatMessages");
  if (!msgsEl) return;
  msgsEl.innerHTML = "";

  const me = state.currentUser ? state.currentUser.name.toLowerCase() : "";
  post.chatMessages
    .slice()
    .sort((a, b) => a.createdAt - b.createdAt)
    .forEach((m) => {
      const mine = m.from.toLowerCase() === me;
      const line = document.createElement("div");
      line.className = `flex mb-1 ${
        mine ? "justify-end" : "justify-start"
      } text-xs`;
      line.innerHTML = `
        <div class="${
          mine ? "bg-green-700" : "bg-gray-700"
        } px-2 py-1 rounded max-w-xs">
          <div class="font-semibold">${m.from}</div>
          <div>${m.text}</div>
          ${
            mine
              ? `<div class="text-[10px] text-gray-300 text-right">${
                  m.seen ? "Seen" : "Sent"
                }</div>`
              : ""
          }
        </div>
      `;
      msgsEl.appendChild(line);
    });

  msgsEl.scrollTop = msgsEl.scrollHeight;
}

function setupChat() {
  on(qs("chatCloseBtn"), "click", closeChat);

  on(qs("chatForm"), "submit", async (e) => {
    e.preventDefault();
    if (!state.currentUser || !currentChatPostId) return;
    const input = qs("chatInput");
    const text = input.value.trim();
    if (!text) return;

    const post = state.posts.find((p) => p.id === currentChatPostId);
    if (!post) return;

    const me = state.currentUser.name;
    const other =
      post.user.toLowerCase() === me.toLowerCase()
        ? "Buyer"
        : post.user; // heuristic; can be improved

    // optimistic local append (10, 12, 18)
    const localMsg = {
      id: `local-${Date.now()}`,
      from: me,
      to: other,
      text,
      createdAt: Date.now(),
      seen: false,
    };
    post.chatMessages.push(localMsg);
    renderChatMessages(post);
    input.value = "";

    try {
      const updated = await apiPost(`/api/posts/${post.id}/chat`, {
        from: me,
        to: other,
        text,
      });
      mergePost(updated);
      renderChatMessages(updated);
      renderInbox();
    } catch (err) {
      showError(err.message || "Failed to send message");
    }
  });
}

// Inbox grouping by conversation (9)
function getInboxThreads() {
  if (!state.currentUser) return [];
  const me = state.currentUser.name.toLowerCase();
  const map = new Map();

  state.posts.forEach((post) => {
    post.chatMessages.forEach((m) => {
      if (
        m.to.toLowerCase() === me ||
        m.from.toLowerCase() === me
      ) {
        const other =
          m.from.toLowerCase() === me ? m.to : m.from;
        const key = `${post.id}|${other.toLowerCase()}`;
        const existing = map.get(key) || {
          postId: post.id,
          postTitle: post.title,
          otherUser: other,
          lastMessage: null,
          lastTime: 0,
          unreadCount: 0,
        };

        if (!existing.lastMessage || m.createdAt > existing.lastTime) {
          existing.lastMessage = m.text;
          existing.lastTime = m.createdAt;
        }
        if (m.to.toLowerCase() === me && !m.seen) {
          existing.unreadCount += 1;
        }
        map.set(key, existing);
      }
    });
  });

  return Array.from(map.values()).sort((a, b) => b.lastTime - a.lastTime);
}

function renderInbox() {
  const list = qs("inboxList");
  if (!list) return;
  if (!state.currentUser) {
    list.innerHTML =
      '<p class="text-gray-400 text-sm">Login to see messages.</p>';
    return;
  }

  const threads = getInboxThreads();
  list.innerHTML = "";

  if (!threads.length) {
    list.innerHTML =
      '<p class="text-gray-400 text-sm">No conversations yet.</p>';
  } else {
    threads.forEach((t) => {
      const row = document.createElement("button");
      row.className =
        "w-full text-left p-3 flex justify-between items-center bg-gray-800 hover:bg-gray-700 rounded mb-2";
      row.innerHTML = `
        <div>
          <div class="font-semibold text-sm">${t.postTitle}</div>
          <div class="text-xs text-gray-400">with ${t.otherUser}</div>
          <div class="text-xs text-gray-300 truncate max-w-xs">
            ${t.lastMessage || ""}
          </div>
        </div>
        ${
          t.unreadCount
            ? `<span class="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs bg-red-600 rounded-full">${t.unreadCount}</span>`
            : ""
        }
      `;
      on(row, "click", () => openChatForPost(t.postId));
      list.appendChild(row);
    });
  }

  updateUnreadIndicator();
}

function updateUnreadIndicator() {
  const indicator = qs("inboxIndicator");
  if (!indicator) return;
  if (!state.currentUser) {
    indicator.classList.add("hidden");
    return;
  }
  const threads = getInboxThreads();
  const totalUnread = threads.reduce((sum, t) => sum + t.unreadCount, 0);
  if (totalUnread > 0) indicator.classList.remove("hidden");
  else indicator.classList.add("hidden");
}

// ---------- Calculator (unchanged logic, just organized) ----------
function setupCalculator() {
  on(qs("treeForm"), "submit", (e) => {
    e.preventDefault();
    const n = Number(qs("treeCount").value || 0);
    const type = qs("treeType").value; // small / medium / fast
    const factor = type === "small" ? 3.5 : type === "medium" ? 12.5 : 22.5;
    const credits = n * factor;
    qs("calcResult").textContent = `Estimated credits: ${credits.toFixed(2)}`;
  });

  on(qs("landForm"), "submit", (e) => {
    e.preventDefault();
    const area = Number(qs("landArea").value || 0);
    const density = Number(qs("treeDensity").value || 0);
    const type = qs("treeTypeLand").value;
    const factor = type === "small" ? 3.5 : type === "medium" ? 12.5 : 22.5;
    const totalTrees = area * density;
    const credits = totalTrees * factor;
    qs("calcResult").textContent = `Area credits: ${credits.toFixed(2)}`;
  });
}

// ---------- Admin ----------
function renderAdmin() {
  const usersTable = qs("adminUsers");
  const postsTable = qs("adminPosts");
  if (!usersTable || !postsTable) return;

  if (!state.currentUser || state.currentUser.role !== "admin") {
    usersTable.innerHTML =
      '<p class="text-gray-400 text-sm">Admin only.</p>';
    postsTable.innerHTML = "";
    return;
  }

  usersTable.innerHTML = state.users
    .map(
      (u) => `
    <tr>
      <td class="px-2 py-1 text-xs">${u.name}</td>
      <td class="px-2 py-1 text-xs">${u.email}</td>
      <td class="px-2 py-1 text-xs">${u.role}</td>
      <td class="px-2 py-1 text-right">
        <button class="text-xs text-red-500 admin-del-user" data-id="${u.id}">Remove</button>
      </td>
    </tr>`
    )
    .join("");

  postsTable.innerHTML = state.posts
    .map(
      (p) => `
    <tr>
      <td class="px-2 py-1 text-xs">${p.title}</td>
      <td class="px-2 py-1 text-xs">${p.user}</td>
      <td class="px-2 py-1 text-xs">${p.status}</td>
      <td class="px-2 py-1 text-right">
        <button class="text-xs text-yellow-400 admin-toggle-post" data-id="${
          p.id
        }">
          ${p.status === "removed" ? "Restore" : "Remove"}
        </button>
      </td>
    </tr>`
    )
    .join("");

  qsa(".admin-del-user").forEach((btn) => {
    on(btn, "click", () => adminDeleteUser(btn.dataset.id));
  });
  qsa(".admin-toggle-post").forEach((btn) => {
    on(btn, "click", () => adminTogglePost(btn.dataset.id));
  });
}

async function adminDeleteUser(id) {
  if (!confirm("Remove this user and their posts?")) return;
  try {
    await apiDelete(`/api/admin/users/${id}`);
    // reload state from server
    await loadStateFromServer();
  } catch (err) {
    showError(err.message || "Failed to delete user");
  }
}

async function adminTogglePost(id) {
  const post = state.posts.find((p) => p.id === id);
  if (!post) return;
  const nextStatus = post.status === "removed" ? "active" : "removed";
  try {
    const updated = await apiPost(`/api/admin/posts/${id}/status`, {
      status: nextStatus,
    });
    mergePost(updated);
    renderFeed();
    renderAdmin();
  } catch (err) {
    showError(err.message || "Failed to update post");
  }
}

// ---------- State sync / polling (12) ----------
async function loadStateFromServer() {
  try {
    const snapshot = await apiGet("/api/state");
    state.users = snapshot.users || [];
    state.posts = snapshot.posts || [];
    restoreSession();
    updateAuthUI();
    renderFeed();
    renderInbox();
    renderAdmin();
    if (currentChatPostId) {
      const post = state.posts.find((p) => p.id === currentChatPostId);
      if (post) renderChatMessages(post);
    }
  } catch (err) {
    showError("Could not reach server. Check your network / backend.");
  }
}

// ---------- Init ----------
function init() {
  setupNav();
  setupAuth();
  setupUpload();
  setupChat();
  setupCalculator();

  // start on landing, then load state
  showSection("section-landing");
  loadStateFromServer();

  // polling for near real-time updates (12)
  setInterval(loadStateFromServer, 2000);
}

document.addEventListener("DOMContentLoaded", () => {
  try {
    init();
  } catch (err) {
    console.error(err);
    showError("App failed to initialize.");
  }
});
