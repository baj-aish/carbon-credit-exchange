// small helpers
const qs = id => document.getElementById(id);
const qsa = sel => Array.from(document.querySelectorAll(sel));

// ---- single state object (shorter than 3 keys) ----
const KEY = "cc_state_v1";
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
const now = Date.now();

let state = JSON.parse(localStorage.getItem(KEY)) || {
  users: [],
  posts: [],
  currentUser: null,
  lastSection: "landing"
};

// purge items older than 30 days if timestamp present
state.users = state.users.filter(u => !u.createdAt || now - u.createdAt <= THIRTY_DAYS);
state.posts = state.posts.filter(p => !p.createdAt || now - p.createdAt <= THIRTY_DAYS);

// validate currentUser
if (state.currentUser) {
  const match = state.users.find(
    u => u.id === state.currentUser.id && u.name === state.currentUser.name
  );
  if (!match) state.currentUser = null;
}

const save = () => localStorage.setItem(KEY, JSON.stringify(state));

// dom refs
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

let editPostId = null; // id of post currently being edited (if any)

let currentChatPostId = null;

// utils
const requireLogin = () => {
  if (!state.currentUser) {
    alert("Please login first.");
    qs("loginModal").classList.remove("hidden");
    return false;
  }
  return true;
};

const showSection = name => {
  qsa(".section").forEach(s => s.classList.add("hidden"));
  const sec = qs(`section-${name}`);
  if (sec) {
    sec.classList.remove("hidden");
    state.lastSection = name;
    save();
  }
};

const normalizeRole = (name, role) =>
  name.trim().toLowerCase() === "bajaish" && role === "admin" ? "admin" : "user";

// ---- inbox helpers ----
const getInboxItems = () => {
  if (!state.currentUser) return [];
  const me = state.currentUser.name;
  const items = [];
  state.posts.forEach(p => {
    if (p.user !== me || !p.chatMessages) return;
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
  unread ? inboxIndicator.classList.remove("hidden")
         : inboxIndicator.classList.add("hidden");
};

const renderInbox = () => {
  if (!inboxList) return;
  if (!state.currentUser) {
    inboxList.innerHTML = `<p class="text-sm text-slate-300">Please login to see your inbox.</p>`;
    updateUnreadIndicator();
    return;
  }
  const items = getInboxItems();
  if (!items.length) {
    inboxList.innerHTML = `<p class="text-sm text-slate-300">No messages received on your listings yet.</p>`;
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
          <span class="text-[10px] px-2 py-0.5 rounded-full ${badge}">
            ${txt}
          </span>
          <button data-open-chat="${i.postId}"
                  class="text-[11px] underline">
            Open chat
          </button>
        </div>
      </div>`;
    })
    .join("");
  updateUnreadIndicator();
};

// ---- auth UI ----
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
    u.role === "admin" ? adminTab.classList.remove("hidden")
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

// ---- feed + admin ----
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

  // put your own posts at the top
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
                    <p class="text-[11px] text-slate-400 mb-2">
            ${
              state.currentUser && p.user === state.currentUser.name
                ? `Post created by you${p.createdAt ? " • " + new Date(p.createdAt).toLocaleDateString() : ""}`
                : `By ${p.user}`
            }
          </p>

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
      const date = p.createdAt ? new Date(p.createdAt).toLocaleString() : "";
      return `
        <div class="bg-slate-900 rounded-xl shadow p-3 border border-slate-700 flex items-center justify-between text-sm">
          <div class="pr-3">
            <p class="font-semibold text-xs">${p.title}</p>
            <p class="text-[11px] text-slate-400">Credits: ${p.credits || 0} • Price: ₹${p.price || 0}</p>
            <p class="text-[11px] text-slate-500 mt-1">${date}</p>
          </div>
          <button class="text-[11px] underline" data-edit-post="${p.id}">
            Edit
          </button>
        </div>`;
    })
    .join("");
};

const setListingMode = mode => {
  const yourActive = mode === "your";

  yourListingsTab.classList.toggle("bg-slate-800", yourActive);
  yourListingsTab.classList.toggle("bg-slate-900", !yourActive);
  yourListingsTab.classList.toggle("text-white", yourActive);
  yourListingsTab.classList.toggle("text-slate-300", !yourActive);

  createListingTab.classList.toggle("bg-slate-800", !yourActive);
  createListingTab.classList.toggle("bg-slate-900", yourActive);
  createListingTab.classList.toggle("text-white", !yourActive);
  createListingTab.classList.toggle("text-slate-300", yourActive);

  userListingsBox.classList.toggle("hidden", !yourActive);
  uploadWrapper.classList.toggle("hidden", yourActive);

  if (yourActive) {
    editPostId = null;
    renderUserListings();
  } else {
    // create mode: reset form
    qs("uploadForm").reset();
    editPostId = null;
    qs("uploadFormBtn").textContent = "Upload Listing";
  }
};

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
      </tr>`
        )
        .join("")
    : `<tr><td colspan="4" class="text-xs text-center text-slate-400 py-2">No registered users yet.</td></tr>`;

  const postsHtml = state.posts.length
    ? state.posts
        .map(
          p => `
      <div class="bg-slate-900 rounded-xl shadow p-3 flex items-center justify-between text-sm border border-slate-700">
        <div>
          <p class="font-semibold">${p.title}</p>
          <p class="text-xs text-slate-400">
            By ${p.user} • Likes: ${p.likes || 0} • Comments: ${p.comments?.length || 0}
          </p>
          <p class="text-[11px] mt-1">
            Credits: ${p.credits || 0} • Price: ₹${p.price || 0}
          </p>
          <p class="text-[11px] mt-1">Status:
            <span class="px-2 py-0.5 rounded-full text-[10px] ${
              p.status === "removed"
                ? "bg-red-500/20 text-red-300"
                : "bg-emerald-500/20 text-emerald-200"
            }">${p.status || "active"}</span>
          </p>
        </div>
        <button data-toggle="${p.id}" class="text-xs px-3 py-1 rounded-full border border-slate-600">
          ${p.status === "removed" ? "Restore" : "Remove"}
        </button>
      </div>`
        )
        .join("")
    : `<p class="text-sm text-slate-300">No posts yet.</p>`;

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
            </tr>
          </thead>
          <tbody>
            ${usersHtml}
          </tbody>
        </table>
      </div>
    </div>
    <div class="space-y-3">
      <h3 class="text-sm font-semibold mb-1">Post Moderation</h3>
      ${postsHtml}
    </div>`;
};

// ---- nav ----
qsa(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.section;
    if (!target) return;
    if (btn.classList.contains("protected-nav") && !requireLogin()) return;

    showSection(target);
    if (target === "feed") renderFeed();
    if (target === "admin") renderAdmin();
    if (target === "inbox") renderInbox();
    if (target === "upload") setListingMode("your");
  });
});


heroLoginBtn?.addEventListener("click", () => {
  qs("loginModal").classList.remove("hidden");
});
heroExploreBtn?.addEventListener("click", () => {
  if (!requireLogin()) return;
  showSection("feed");
  renderFeed();
});
yourListingsTab.addEventListener("click", () => {
  if (!requireLogin()) return;
  setListingMode("your");
});

createListingTab.addEventListener("click", () => {
  if (!requireLogin()) return;
  setListingMode("create");
});


priceFilter?.addEventListener("change", renderFeed);
creditsFilter?.addEventListener("change", renderFeed);

qs("gotoCalcLink")?.addEventListener("click", () => {
  if (!requireLogin()) return;
  showSection("calculator");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ---- login modal + tabs ----
qs("loginBtn").addEventListener("click", () => {
  qs("loginModal").classList.remove("hidden");
});
qs("closeLogin").addEventListener("click", () => {
  qs("loginModal").classList.add("hidden");
});

const tabRegister = qs("tabRegister");
const tabLogin = qs("tabLogin");
const registerForm = qs("registerForm");
const loginForm = qs("loginForm");

const activateTab = mode => {
  const regActive = mode === "register";
  registerForm.classList.toggle("hidden", !regActive);
  loginForm.classList.toggle("hidden", regActive);
  tabRegister.classList.toggle("bg-slate-800", regActive);
  tabRegister.classList.toggle("bg-slate-900", !regActive);
  tabLogin.classList.toggle("bg-slate-800", !regActive);
  tabLogin.classList.toggle("bg-slate-900", regActive);
};

tabRegister.addEventListener("click", () => activateTab("register"));
tabLogin.addEventListener("click", () => activateTab("login"));

// ---- register ----
registerForm.addEventListener("submit", e => {
  e.preventDefault();
  const name = qs("regName").value.trim();
  const email = qs("regEmail").value.trim();
  const requestedRole = qs("regRole").value;

  if (!name || !email) return;
  if (!email.toLowerCase().endsWith("@gmail.com")) {
    alert("Please enter a valid Gmail address.");
    return;
  }
  if (state.users.some(u => u.name.toLowerCase() === name.toLowerCase())) {
    alert("User already registered. Please login.");
    activateTab("login");
    return;
  }

  let role = normalizeRole(name, requestedRole);
  if (requestedRole === "admin" && role !== "admin") {
    alert("Only authorised access allowed, try using User role.");
    role = "user";
  }

  state.users.push({
    id: Date.now(),
    name,
    email,
    role,
    createdAt: Date.now()
  });
  save();
  alert("Registration successful. Please login.");
  activateTab("login");
});

// ---- login ----
loginForm.addEventListener("submit", e => {
  e.preventDefault();
  const name = qs("loginName").value.trim();
  const loginRole = qs("loginRole").value;
  if (!name) return alert("Enter a username.");

  const user = state.users.find(u => u.name.toLowerCase() === name.toLowerCase());
  if (!user) return alert("No user with such username found, try registering first.");

  if (loginRole === "admin" && name.toLowerCase() !== "bajaish") {
    alert("Only authorised access allowed, try logging in as User.");
    return;
  }
  const role = loginRole === "admin" && name.toLowerCase() === "bajaish" ? "admin" : "user";

  state.currentUser = { id: user.id, name: user.name, email: user.email, role };
  save();
  updateAuthUI();
  qs("loginModal").classList.add("hidden");
  showSection("feed");
  renderFeed();
});

// ---- logout ----
qs("logoutBtn").addEventListener("click", () => {
  state.currentUser = null;
  state.lastSection = "landing";
  save();
  updateAuthUI();
  showSection("landing");
});

// ---- upload ----
qs("uploadForm").addEventListener("submit", e => {
  e.preventDefault();
  if (!requireLogin()) return;

  const title = qs("postTitle").value.trim();
  const desc = qs("postDesc").value.trim();
  const price = parseFloat(qs("postPrice").value) || 0;
  const credits = parseFloat(qs("postCredits").value) || 0;
  const file = qs("postImage").files[0];
  const isEdit = !!editPostId;

  if (!title || !desc) return;

  const handleSave = imgData => {
    if (isEdit) {
      const post = state.posts.find(p => String(p.id) === String(editPostId));
      if (!post) return;
      post.title = title;
      post.desc = desc;
      post.price = price;
      post.credits = credits;
      if (imgData) post.image = imgData; // only replace image if new one uploaded
      save();
      renderFeed();
      renderUserListings();
      alert("Listing updated.");
    } else {
      state.posts.unshift({
        id: Date.now(),
        title,
        desc,
        image: imgData,
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
      save();
      renderFeed();
      renderUserListings();
      alert("Listing uploaded.");
    }
    e.target.reset();
    editPostId = null;
    qs("uploadFormBtn").textContent = "Upload Listing";
  };

  if (file) {
    const maxBytes = 50 * 1024;
    if (file.size > maxBytes) {
      alert("Image too large! Only up to 50 KB allowed.");
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => handleSave(ev.target.result);
    reader.readAsDataURL(file);
  } else {
    // editing without changing image
    if (!isEdit) {
      alert("Please choose an image for a new listing.");
      return;
    }
    handleSave(null);
  }
});

//- userlistings box
userListingsBox.addEventListener("click", e => {
  const id = e.target.dataset.editPost;
  if (!id) return;
  if (!requireLogin()) return;

  const post = state.posts.find(p => String(p.id) === String(id));
  if (!post) return;

  editPostId = post.id;
  // switch to create/edit view
  setListingMode("create");

  qs("postTitle").value = post.title;
  qs("postDesc").value = post.desc;
  qs("postPrice").value = post.price;
  qs("postCredits").value = post.credits;
  qs("uploadFormBtn").textContent = "Save changes";
});


// ---- feed actions (like toggle / comment / open chat) ----
feedContainer.addEventListener("click", e => {
  const likeId = e.target.dataset.like;
  const commentId = e.target.dataset.commentBtn;
  const chatId = e.target.dataset.chat;

  if (likeId) {
    if (!requireLogin()) return;
    const post = state.posts.find(p => String(p.id) === likeId);
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
    save();
    renderFeed();
  }

  if (commentId) {
    if (!requireLogin()) return;
    const post = state.posts.find(p => String(p.id) === commentId);
    if (!post) return;
    const input = document.querySelector(`[data-comment-input="${commentId}"]`);
    const text = input.value.trim();
    if (!text) return;
    post.comments ||= [];
    post.comments.push({ by: state.currentUser.name, text });
    input.value = "";
    save();
    renderFeed();
  }

  if (chatId) {
    if (!requireLogin()) return;
    openChatForPost(chatId);
  }
});

// ---- admin post toggle ----
adminList.addEventListener("click", e => {
  const id = e.target.dataset.toggle;
  if (!id) return;
  const post = state.posts.find(p => String(p.id) === id);
  if (!post) return;
  post.status = post.status === "removed" ? "active" : "removed";
  save();
  renderFeed();
  renderAdmin();
});

// inbox open chat
inboxList?.addEventListener("click", e => {
  const id = e.target.dataset.openChat;
  if (!id) return;
  if (!requireLogin()) return;
  openChatForPost(id);
});

// ---- chat ----
const openChatForPost = postId => {
  const post = state.posts.find(p => String(p.id) === String(postId));
  if (!post) return;
  post.chatMessages ||= [];

  // mark messages from others as seen
  post.chatMessages.forEach(m => {
    if (m.from !== state.currentUser.name) m.seen = true;
  });
  save();
  updateUnreadIndicator();

  currentChatPostId = post.id;
  chatPostTitle.textContent = `Chat about: ${post.title}`;
  renderChatMessages(post);
  chatModal.classList.remove("hidden");
};

const renderChatMessages = post => {
  if (!post.chatMessages || !post.chatMessages.length) {
    chatMessagesBox.innerHTML =
      '<p class="text-[11px] text-slate-400 text-center mt-6">No messages yet. Start the conversation.</p>';
    return;
  }
  chatMessagesBox.innerHTML = post.chatMessages
    .map(m => {
      const mine = m.from === state.currentUser.name;
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
            mine
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

qs("closeChat").addEventListener("click", () => {
  chatModal.classList.add("hidden");
  currentChatPostId = null;
});

chatForm.addEventListener("submit", e => {
  e.preventDefault();
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
  save();
  chatInput.value = "";
  renderChatMessages(post);
  updateUnreadIndicator();
});

chatMessagesBox.addEventListener("click", e => {
  const id = e.target.dataset.delmsg;
  if (!id || !currentChatPostId) return;
  const post = state.posts.find(p => String(p.id) === String(currentChatPostId));
  if (!post || !post.chatMessages) return;
  post.chatMessages = post.chatMessages.filter(m => String(m.id) !== String(id));
  save();
  renderChatMessages(post);
  updateUnreadIndicator();
});

// ---- calculator ----
qsa('input[name="calcMethod"]').forEach(r => {
  r.addEventListener("change", () => {
    const v = document.querySelector('input[name="calcMethod"]:checked').value;
    qs("treeForm").classList.toggle("hidden", v !== "trees");
    qs("landForm").classList.toggle("hidden", v !== "land");
    qs("calcResult").classList.add("hidden");
  });
});

const showResult = (annual, total) => {
  const box = qs("calcResult");
  box.classList.remove("hidden");
  qs("annualCredits").textContent =
    `Annual Carbon Credits: ${annual.toFixed(2)} tons CO₂ / year`;
  qs("totalCredits").textContent =
    `Total Carbon Credits: ${total.toFixed(2)} tons CO₂`;
};

qs("calcTreesBtn").addEventListener("click", () => {
  const x = parseFloat(qs("treeType").value);
  const N = parseFloat(qs("treeCount").value);
  const t = parseFloat(qs("treeYears").value);
  if (N <= 0 || t <= 0) return alert("Enter valid tree count and years.");
  const annual = (N * x) / 1000;
  showResult(annual, annual * t);
});

qs("calcLandBtn").addEventListener("click", () => {
  const A = parseFloat(qs("landArea").value);
  const unit = qs("landUnit").value;
  const t = parseFloat(qs("landYears").value);
  if (A <= 0 || t <= 0) return alert("Enter valid area and years.");
  let hectares = A;
  if (unit === "acres") hectares *= 0.404686;
  const annual = hectares * 6; // 6 tons/ha/year
  showResult(annual, annual * t);
});

// ---- initial load ----
updateAuthUI();
let startSection = state.lastSection || "landing";
const protectedSections = ["feed", "upload", "calculator", "admin", "inbox"];
...
showSection(startSection);
if (startSection === "feed") renderFeed();
if (startSection === "admin") renderAdmin();
if (startSection === "inbox") renderInbox();
if (startSection === "upload") setListingMode("your");
