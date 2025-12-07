// =========================
// GLOBAL STATE (with checks)
// =========================

// Load from localStorage
let storedUsers = JSON.parse(localStorage.getItem("cc_users")) || [];
let storedCurrentUser = JSON.parse(localStorage.getItem("cc_currentUser")) || null;
let posts = JSON.parse(localStorage.getItem("cc_posts")) || [];

// Ensure users array is valid
let registeredUsers = Array.isArray(storedUsers) ? storedUsers : [];

// Only accept currentUser if it exists in registeredUsers
let currentUser = null;
if (storedCurrentUser && registeredUsers.length > 0) {
  const match = registeredUsers.find(
    u => u.id === storedCurrentUser.id && u.name === storedCurrentUser.name
  );
  if (match) {
    currentUser = { ...match, role: storedCurrentUser.role || match.role };
  }
}

// =========================
// DOM REFERENCES
// =========================

const feedContainer = document.getElementById("feedContainer");
const emptyFeedMsg = document.getElementById("emptyFeedMsg");
const adminList = document.getElementById("adminList");
const adminTab = document.getElementById("adminTab");
const userBadge = document.getElementById("userBadge");
const badgeName = document.getElementById("badgeName");
const badgeRole = document.getElementById("badgeRole");
const priceFilter = document.getElementById("priceFilter");
const creditsFilter = document.getElementById("creditsFilter");
const feedFiltersBox = document.getElementById("feedFilters");
const sections = document.querySelectorAll(".section");
const protectedNavButtons = document.querySelectorAll(".protected-nav");

const heroLoginBtn = document.getElementById("heroLoginBtn");
const heroExploreBtn = document.getElementById("heroExploreBtn");
const welcomeLine = document.getElementById("welcomeLine");
const welcomeName = document.getElementById("welcomeName");

// Chat
const chatModal = document.getElementById("chatModal");
const chatMessagesBox = document.getElementById("chatMessages");
const chatPostTitle = document.getElementById("chatPostTitle");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
let currentChatPostId = null;

// Login/Register modal
const tabRegister = document.getElementById("tabRegister");
const tabLogin = document.getElementById("tabLogin");
const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");

// =========================
// UTILS
// =========================

function saveState() {
  localStorage.setItem("cc_currentUser", JSON.stringify(currentUser));
  localStorage.setItem("cc_posts", JSON.stringify(posts));
  localStorage.setItem("cc_users", JSON.stringify(registeredUsers));
}

function requireLogin() {
  if (!currentUser) {
    alert("Please login first.");
    document.getElementById("loginModal").classList.remove("hidden");
    return false;
  }
  return true;
}

function showSection(name) {
  sections.forEach(sec => sec.classList.add("hidden"));
  const target = document.getElementById(`section-${name}`);
  if (target) {
    target.classList.remove("hidden");
    localStorage.setItem("cc_lastSection", name); // remember last page
  }
}

// Only Bajaish can truly be admin
function normalizeRole(name, requestedRole) {
  if (name.trim().toLowerCase() === "bajaish" && requestedRole === "admin") {
    return "admin";
  }
  return "user";
}

function updateAuthUI() {
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (currentUser) {
    // navbar
    loginBtn.classList.add("hidden");
    logoutBtn.classList.remove("hidden");
    userBadge.classList.remove("hidden");
    badgeName.textContent = currentUser.name;
    badgeRole.textContent = currentUser.role;

    // hero: hide login, show welcome line
    if (heroLoginBtn) heroLoginBtn.classList.add("hidden");
    if (welcomeLine && welcomeName) {
      welcomeName.textContent = currentUser.name;
      welcomeLine.classList.remove("hidden");
    }

    // protected nav
    protectedNavButtons.forEach(btn => btn.classList.remove("hidden"));

    if (currentUser.role === "admin") adminTab.classList.remove("hidden");
    else adminTab.classList.add("hidden");

    if (feedFiltersBox) feedFiltersBox.classList.remove("hidden");
  } else {
    // navbar
    loginBtn.classList.remove("hidden");
    logoutBtn.classList.add("hidden");
    userBadge.classList.add("hidden");
    badgeRole.textContent = "";

    // hero
    if (heroLoginBtn) heroLoginBtn.classList.remove("hidden");
    if (welcomeLine) welcomeLine.classList.add("hidden");

    adminTab.classList.add("hidden");
    if (feedFiltersBox) feedFiltersBox.classList.add("hidden");
    protectedNavButtons.forEach(btn => btn.classList.add("hidden"));
  }
}

function getFilteredPosts() {
  let arr = posts.filter(p => p.status !== "removed");

  const cf = creditsFilter ? creditsFilter.value : "all";
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

  const pf = priceFilter ? priceFilter.value : "none";
  if (pf === "low-high") {
    arr = [...arr].sort((a, b) => (a.price || 0) - (b.price || 0));
  } else if (pf === "high-low") {
    arr = [...arr].sort((a, b) => (b.price || 0) - (a.price || 0));
  }
  return arr;
}

function renderFeed() {
  const visiblePosts = getFilteredPosts();

  if (!visiblePosts.length) {
    feedContainer.innerHTML = "";
    emptyFeedMsg.classList.remove("hidden");
    return;
  }
  emptyFeedMsg.classList.add("hidden");

  feedContainer.innerHTML = visiblePosts
    .map(p => {
      const commentsHtml = p.comments && p.comments.length
        ? p.comments.map(c => `<p class="text-xs"><b>${c.by}:</b> ${c.text}</p>`).join("")
        : '<p class="text-xs text-slate-400">No comments yet</p>';
      return `
      <article class="bg-white rounded-2xl shadow overflow-hidden flex flex-col hover:shadow-lg transition">
        <img src="${p.image}" class="w-full h-44 object-cover" alt="post image">
        <div class="p-3 flex-1 flex flex-col">
          <h3 class="font-semibold text-sm mb-1 line-clamp-2">${p.title}</h3>
          <p class="text-xs text-slate-600 mb-1 line-clamp-3">${p.desc}</p>
          <div class="flex items-center justify-between text-[11px] mb-2">
            <span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              ${p.credits || 0} credits
            </span>
            <span class="font-semibold text-blue-700">₹${p.price || 0}</span>
          </div>
          <p class="text-[11px] text-slate-400 mb-2">By ${p.user}</p>
          <div class="mt-auto space-y-2">
            <div class="flex items-center justify-between text-xs">
              <button data-like="${p.id}" class="px-2 py-1 rounded-full border text-[11px]">
                ❤️ Like (${p.likes})
              </button>
              <button data-chat="${p.id}" class="px-2 py-1 rounded-full border text-[11px]">
                💬 Chat
              </button>
            </div>
            <div class="border-t pt-1">
              <div class="flex gap-1 mb-1">
                <input data-comment-input="${p.id}" class="flex-1 border rounded-lg px-2 py-1 text-[11px]"
                       placeholder="Add comment..." />
                <button data-comment-btn="${p.id}" class="px-2 text-[11px] border rounded-lg">
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
}

function renderAdmin() {
  if (!currentUser || currentUser.role !== "admin") {
    adminList.innerHTML = `<p class="text-sm text-slate-500">You are not admin.</p>`;
    return;
  }

  const userListHtml = registeredUsers.length
    ? registeredUsers
        .map(
          u => `
      <tr class="text-xs">
        <td class="border px-2 py-1">${u.id}</td>
        <td class="border px-2 py-1">${u.name}</td>
        <td class="border px-2 py-1">${u.email || "-"}</td>
        <td class="border px-2 py-1">${u.role}</td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="4" class="text-xs text-center text-slate-500 py-2">No registered users yet.</td></tr>`;

  const postListHtml = posts.length
    ? posts
        .map(
          p => `
      <div class="bg-white rounded-xl shadow p-3 flex items-center justify-between text-sm">
        <div>
          <p class="font-semibold">${p.title}</p>
          <p class="text-xs text-slate-500">
            By ${p.user} • Likes: ${p.likes} • Comments: ${p.comments.length}
          </p>
          <p class="text-[11px] mt-1">
            Credits: ${p.credits || 0} • Price: ₹${p.price || 0}
          </p>
          <p class="text-[11px] mt-1">Status:
            <span class="px-2 py-0.5 rounded-full text-[10px] ${
              p.status === "removed"
                ? "bg-red-100 text-red-600"
                : "bg-emerald-100 text-emerald-700"
            }">${p.status || "active"}</span>
          </p>
        </div>
        <button data-toggle="${p.id}" class="text-xs px-3 py-1 rounded-full border">
          ${p.status === "removed" ? "Restore" : "Remove"}
        </button>
      </div>`
        )
        .join("")
    : `<p class="text-sm text-slate-500">No posts yet.</p>`;

  adminList.innerHTML = `
    <div class="bg-white rounded-2xl shadow p-3 mb-3">
      <h3 class="text-sm font-semibold mb-2">Registered Users (visible to admin)</h3>
      <div class="overflow-x-auto">
        <table class="min-w-full border text-xs">
          <thead class="bg-slate-100">
            <tr>
              <th class="border px-2 py-1 text-left">ID</th>
              <th class="border px-2 py-1 text-left">Name</th>
              <th class="border px-2 py-1 text-left">Email</th>
              <th class="border px-2 py-1 text-left">Role</th>
            </tr>
          </thead>
          <tbody>
            ${userListHtml}
          </tbody>
        </table>
      </div>
    </div>
    <div class="space-y-3">
      <h3 class="text-sm font-semibold mb-1">Post Moderation</h3>
      ${postListHtml}
    </div>
  `;
}

// =========================
// NAVIGATION
// =========================

document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.section;
    if (!target) return;

    const isProtected = btn.classList.contains("protected-nav");
    if (isProtected && !currentUser) {
      requireLogin();
      return;
    }

    showSection(target);
    if (target === "admin") renderAdmin();
    if (target === "feed") renderFeed();
  });
});

// Hero buttons
if (heroLoginBtn) {
  heroLoginBtn.addEventListener("click", () => {
    document.getElementById("loginModal").classList.remove("hidden");
  });
}
if (heroExploreBtn) {
  heroExploreBtn.addEventListener("click", () => {
    if (!requireLogin()) return;
    showSection("feed");
    renderFeed();
  });
}

// Filters
if (priceFilter) priceFilter.addEventListener("change", renderFeed);
if (creditsFilter) creditsFilter.addEventListener("change", renderFeed);

// Calculator link from upload
document.getElementById("gotoCalcLink").addEventListener("click", () => {
  if (!requireLogin()) return;
  showSection("calculator");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// =========================
// LOGIN MODAL & TABS
// =========================

document.getElementById("loginBtn").addEventListener("click", () => {
  document.getElementById("loginModal").classList.remove("hidden");
});
document.getElementById("closeLogin").addEventListener("click", () => {
  document.getElementById("loginModal").classList.add("hidden");
});

if (tabRegister && tabLogin && registerForm && loginForm) {
  tabRegister.addEventListener("click", () => {
    tabRegister.classList.add("bg-slate-900", "text-white", "font-medium");
    tabRegister.classList.remove("bg-slate-100", "text-slate-700");
    tabLogin.classList.remove("bg-slate-900", "text-white", "font-medium");
    tabLogin.classList.add("bg-slate-100", "text-slate-700");
    registerForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
  });

  tabLogin.addEventListener("click", () => {
    tabLogin.classList.add("bg-slate-900", "text-white", "font-medium");
    tabLogin.classList.remove("bg-slate-100", "text-slate-700");
    tabRegister.classList.remove("bg-slate-900", "text-white", "font-medium");
    tabRegister.classList.add("bg-slate-100", "text-slate-700");
    registerForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
  });
}

// =========================
// REGISTER (no auto-login)
// =========================

registerForm.addEventListener("submit", e => {
  e.preventDefault();
  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const requestedRole = document.getElementById("regRole").value;

  if (!name || !email) return;
  if (!email.toLowerCase().endsWith("@gmail.com")) {
    alert("Please enter a valid Gmail address.");
    return;
  }

  const existing = registeredUsers.find(
    u => u.name.toLowerCase() === name.toLowerCase()
  );
  if (existing) {
    alert("User already registered. Please login.");
    tabLogin.click();
    return;
  }

  let role = normalizeRole(name, requestedRole);
  if (requestedRole === "admin" && name.trim().toLowerCase() !== "bajaish") {
    alert("Only authorised access allowed, try logging in using User role.");
    role = "user";
  }

  const newUser = {
    id: Date.now(),
    name,
    email,
    role
  };
  registeredUsers.push(newUser);
  saveState();

  alert("Registration successful. Please login with your username.");
  tabLogin.click(); // switch to login tab
});

// =========================
// LOGIN (must be registered)
// =========================

loginForm.addEventListener("submit", e => {
  e.preventDefault();

  const nameInput = document.getElementById("loginName");
  const roleSelect = document.getElementById("loginRole");

  const name = nameInput.value.trim();
  const loginRole = roleSelect.value;

  if (!name) {
    alert("Please enter a username.");
    return;
  }

  const user = registeredUsers.find(
    u => u.name.toLowerCase() === name.toLowerCase()
  );

  if (!user) {
    alert("No user with such username found, try registering first.");
    return;
  }

  if (loginRole === "admin" && name.toLowerCase() !== "bajaish") {
    alert("Only authorised access allowed, try logging in using as user.");
    return;
  }

  const role =
    loginRole === "admin" && name.toLowerCase() === "bajaish" ? "admin" : "user";

  currentUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role
  };

  saveState();
  updateAuthUI();
  document.getElementById("loginModal").classList.add("hidden");
  showSection("feed");
  renderFeed();
});

// =========================
// LOGOUT
// =========================

document.getElementById("logoutBtn").addEventListener("click", () => {
  currentUser = null;
  localStorage.removeItem("cc_currentUser");
  localStorage.setItem("cc_lastSection", "landing");
  updateAuthUI();
  showSection("landing");
});

// =========================
// UPLOAD POST
// =========================

document.getElementById("uploadForm").addEventListener("submit", e => {
  e.preventDefault();
  if (!requireLogin()) return;

  const title = document.getElementById("postTitle").value.trim();
  const desc = document.getElementById("postDesc").value.trim();
  const price = parseFloat(document.getElementById("postPrice").value) || 0;
  const credits = parseFloat(document.getElementById("postCredits").value) || 0;
  const fileInput = document.getElementById("postImage");
  const file = fileInput.files[0];
  if (!file) return;

  const maxSizeBytes = 50 * 1024;
  if (file.size > maxSizeBytes) {
    alert("Image too large! Please upload an image up to 50 KB only.");
    return;
  }

  const reader = new FileReader();
  reader.onload = ev => {
    const newPost = {
      id: Date.now(),
      title,
      desc,
      image: ev.target.result,
      user: currentUser.name,
      likes: 0,
      comments: [],
      chatMessages: [],
      status: "active",
      price,
      credits
    };
    posts.unshift(newPost);
    saveState();
    renderFeed();
    e.target.reset();
    alert("Listing uploaded (saved in your browser).");
  };
  reader.readAsDataURL(file);
});

// =========================
// FEED ACTIONS
// =========================

feedContainer.addEventListener("click", e => {
  const likeId = e.target.dataset.like;
  const commentBtnId = e.target.dataset.commentBtn;
  const chatId = e.target.dataset.chat;

  if (likeId) {
    if (!requireLogin()) return;
    const post = posts.find(p => String(p.id) === likeId);
    if (post) {
      post.likes++;
      saveState();
      renderFeed();
    }
  }

  if (commentBtnId) {
    if (!requireLogin()) return;
    const post = posts.find(p => String(p.id) === commentBtnId);
    if (!post) return;
    const input = document.querySelector(`[data-comment-input="${commentBtnId}"]`);
    const text = input.value.trim();
    if (!text) return;
    post.comments.push({ by: currentUser.name, text });
    input.value = "";
    saveState();
    renderFeed();
  }

  if (chatId) {
    if (!requireLogin()) return;
    openChatForPost(chatId);
  }
});

// =========================
// ADMIN POST TOGGLE
// =========================

adminList.addEventListener("click", e => {
  const id = e.target.dataset.toggle;
  if (!id) return;
  const post = posts.find(p => String(p.id) === id);
  if (!post) return;
  post.status = post.status === "removed" ? "active" : "removed";
  saveState();
  renderFeed();
  renderAdmin();
});

// =========================
// CHAT LOGIC
// =========================

function openChatForPost(postId) {
  const post = posts.find(p => String(p.id) === String(postId));
  if (!post) return;
  if (!post.chatMessages) post.chatMessages = [];

  // mark other-person messages as seen
  post.chatMessages.forEach(m => {
    if (m.from !== currentUser.name) {
      m.seen = true;
    }
  });
  saveState();

  currentChatPostId = post.id;
  chatPostTitle.textContent = `Chat about: ${post.title}`;
  renderChatMessages(post);
  chatModal.classList.remove("hidden");
}

function renderChatMessages(post) {
  if (!post.chatMessages || !post.chatMessages.length) {
    chatMessagesBox.innerHTML =
      '<p class="text-[11px] text-slate-500 text-center mt-6">No messages yet. Start the conversation.</p>';
    return;
  }

  chatMessagesBox.innerHTML = post.chatMessages
    .map(msg => {
      const mine = msg.from === currentUser.name;
      const time = new Date(msg.time).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });
      return `
      <div class="flex ${mine ? "justify-end" : "justify-start"}">
        <div class="max-w-[75%] px-2 py-1 rounded-lg text-[11px] ${
          mine ? "bg-emerald-500 text-white" : "bg-white border"
        }">
          <div class="font-semibold mb-0.5">${mine ? "You" : msg.from}</div>
          <div>${msg.text}</div>
          <div class="flex justify-between items-center mt-0.5 text-[9px] opacity-80">
            <span>${time}</span>
            ${mine ? `<span>${msg.seen ? "Seen" : "Sent"}</span>` : ""}
          </div>
          ${
            mine
              ? `<button data-delmsg="${msg.id}" class="mt-0.5 text-[9px] underline">
                   Delete for everyone
                 </button>`
              : ""
          }
        </div>
      </div>`;
    })
    .join("");

  chatMessagesBox.scrollTop = chatMessagesBox.scrollHeight;
}

document.getElementById("closeChat").addEventListener("click", () => {
  chatModal.classList.add("hidden");
  currentChatPostId = null;
});

chatForm.addEventListener("submit", e => {
  e.preventDefault();
  if (!requireLogin()) return;
  if (!currentChatPostId) return;

  const text = chatInput.value.trim();
  if (!text) return;

  const post = posts.find(p => String(p.id) === String(currentChatPostId));
  if (!post) return;
  if (!post.chatMessages) post.chatMessages = [];

  const message = {
    id: Date.now(),
    from: currentUser.name,
    text,
    time: Date.now(),
    seen: false
  };

  post.chatMessages.push(message);
  saveState();
  chatInput.value = "";
  renderChatMessages(post);
});

// delete message (for everyone)
chatMessagesBox.addEventListener("click", e => {
  const msgId = e.target.dataset.delmsg;
  if (!msgId || !currentChatPostId) return;

  const post = posts.find(p => String(p.id) === String(currentChatPostId));
  if (!post || !post.chatMessages) return;

  post.chatMessages = post.chatMessages.filter(m => String(m.id) !== String(msgId));
  saveState();
  renderChatMessages(post);
});

// =========================
// CALCULATOR
// =========================

document.querySelectorAll('input[name="calcMethod"]').forEach(r => {
  r.addEventListener("change", () => {
    const v = document.querySelector('input[name="calcMethod"]:checked').value;
    document.getElementById("treeForm").classList.toggle("hidden", v !== "trees");
    document.getElementById("landForm").classList.toggle("hidden", v !== "land");
    document.getElementById("calcResult").classList.add("hidden");
  });
});

function showResult(annual, total) {
  const resBox = document.getElementById("calcResult");
  resBox.classList.remove("hidden");
  document.getElementById("annualCredits").textContent =
    `Annual Carbon Credits: ${annual.toFixed(2)} tons CO₂ / year`;
  document.getElementById("totalCredits").textContent =
    `Total Carbon Credits: ${total.toFixed(2)} tons CO₂`;
}

document.getElementById("calcTreesBtn").addEventListener("click", () => {
  const x = parseFloat(document.getElementById("treeType").value);
  const N = parseFloat(document.getElementById("treeCount").value);
  const t = parseFloat(document.getElementById("treeYears").value);
  if (N <= 0 || t <= 0) return alert("Enter valid tree count and years.");
  const annual = (N * x) / 1000;
  const total = annual * t;
  showResult(annual, total);
});

document.getElementById("calcLandBtn").addEventListener("click", () => {
  const A = parseFloat(document.getElementById("landArea").value);
  const unit = document.getElementById("landUnit").value;
  const t = parseFloat(document.getElementById("landYears").value);
  if (A <= 0 || t <= 0) return alert("Enter valid area and years.");

  let hectares = A;
  if (unit === "acres") hectares = A * 0.404686;
  const y = 6;
  const annual = hectares * y;
  const total = annual * t;
  showResult(annual, total);
});

// =========================
// INITIAL SETUP
// =========================

updateAuthUI();

let lastSection = localStorage.getItem("cc_lastSection") || "landing";
const protectedSections = ["feed", "upload", "calculator", "admin"];

if (!currentUser && protectedSections.includes(lastSection)) {
  lastSection = "landing";
}

showSection(lastSection);
if (lastSection === "feed") renderFeed();








