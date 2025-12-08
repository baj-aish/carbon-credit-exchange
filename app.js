// =====================
// SIMPLE UTILS + STATE
// =====================
var qs = function (id) { return document.getElementById(id); };
var qsa = function (sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); };

var STORAGE_KEY = "cc_state_v3";
var THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
var now = Date.now();

var state = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || {
  users: [],
  posts: [],
  currentUser: null,
  lastSection: "landing"
};

// purge > 30 days if timestamps exist
state.users = state.users.filter(function (u) {
  return !u.createdAt || now - u.createdAt <= THIRTY_DAYS;
});
state.posts = state.posts.filter(function (p) {
  return !p.createdAt || now - p.createdAt <= THIRTY_DAYS;
});

// validate currentUser
if (state.currentUser) {
  var match = state.users.find(function (u) {
    return u.id === state.currentUser.id && u.name === state.currentUser.name;
  });
  if (!match) state.currentUser = null;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// =====================
// DOM REFERENCES
// =====================
var userBadge = qs("userBadge");
var badgeName = qs("badgeName");
var badgeRole = qs("badgeRole");
var adminTab = qs("adminTab");

var inboxIndicator = qs("inboxIndicator");
var inboxList = qs("inboxList");
var feedContainer = qs("feedContainer");
var emptyFeedMsg = qs("emptyFeedMsg");
var feedFiltersBox = qs("feedFilters");
var priceFilter = qs("priceFilter");
var creditsFilter = qs("creditsFilter");
var welcomeLine = qs("welcomeLine");
var welcomeName = qs("welcomeName");
var heroLoginBtn = qs("heroLoginBtn");
var heroExploreBtn = qs("heroExploreBtn");

var chatModal = qs("chatModal");
var chatMessagesBox = qs("chatMessages");
var chatPostTitle = qs("chatPostTitle");
var chatForm = qs("chatForm");
var chatInput = qs("chatInput");

var adminList = qs("adminList");

// post-listing section
var yourListingsTab = qs("yourListingsTab");
var createListingTab = qs("createListingTab");
var userListingsBox = qs("userListings");
var uploadWrapper = qs("uploadWrapper");
var uploadForm = qs("uploadForm");
var uploadFormBtn = qs("uploadFormBtn");

var editPostId = null; // which post is being edited in form
var currentChatPostId = null;

// =====================
// SMALL HELPERS
// =====================
function requireLogin() {
  if (!state.currentUser) {
    alert("Please login first.");
    qs("loginModal").classList.remove("hidden");
    return false;
  }
  return true;
}

function showSection(name) {
  qsa(".section").forEach(function (sec) {
    sec.classList.add("hidden");
  });
  var sec = qs("section-" + name);
  if (sec) {
    sec.classList.remove("hidden");
    state.lastSection = name;
    saveState();
  }
}

// Bajaish-only admin
function normalizeRole(name, role) {
  if (name.trim().toLowerCase() === "bajaish" && role === "admin") return "admin";
  return "user";
}

// =====================
// INBOX
// =====================
function getInboxItems() {
  if (!state.currentUser) return [];
  var me = state.currentUser.name;
  var items = [];
  state.posts.forEach(function (p) {
    if (p.user !== me || !p.chatMessages) return;
    p.chatMessages.forEach(function (m) {
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
  items.sort(function (a, b) {
    return (b.time || 0) - (a.time || 0);
  });
  return items;
}

function updateUnreadIndicator() {
  if (!inboxIndicator) return;
  if (!state.currentUser) {
    inboxIndicator.classList.add("hidden");
    return;
  }
  var unread = getInboxItems().filter(function (i) { return !i.seen; }).length;
  if (unread > 0) inboxIndicator.classList.remove("hidden");
  else inboxIndicator.classList.add("hidden");
}

function renderInbox() {
  if (!inboxList) return;
  if (!state.currentUser) {
    inboxList.innerHTML = '<p class="text-sm text-slate-300">Please login to see your inbox.</p>';
    updateUnreadIndicator();
    return;
  }
  var items = getInboxItems();
  if (!items.length) {
    inboxList.innerHTML = '<p class="text-sm text-slate-300">No messages received on your listings yet.</p>';
    updateUnreadIndicator();
    return;
  }
  inboxList.innerHTML = items.map(function (i) {
    var t = new Date(i.time).toLocaleString();
    var badge = i.seen ? "bg-slate-700 text-slate-200" : "bg-red-500/20 text-red-300";
    var txt = i.seen ? "Seen" : "Unread";
    return (
      '<div class="bg-slate-900 rounded-xl shadow p-3 flex items-center justify-between text-sm border border-slate-700">' +
        '<div class="pr-3">' +
          '<p class="font-semibold text-xs">From ' + i.from + '</p>' +
          '<p class="text-xs text-slate-400">On: ' + i.postTitle + '</p>' +
          '<p class="text-[11px] text-slate-200 mt-1 line-clamp-2">' + i.text + '</p>' +
          '<p class="text-[10px] mt-1 text-slate-500">' + t + '</p>' +
        '</div>' +
        '<div class="flex flex-col items-end gap-1">' +
          '<span class="text-[10px] px-2 py-0.5 rounded-full ' + badge + '">' + txt + '</span>' +
          '<button data-open-chat="' + i.postId + '" class="text-[11px] underline">Open chat</button>' +
        '</div>' +
      '</div>'
    );
  }).join("");
  updateUnreadIndicator();
}

// =====================
// AUTH UI
// =====================
function updateAuthUI() {
  var loginBtn = qs("loginBtn");
  var logoutBtn = qs("logoutBtn");
  var u = state.currentUser;

  if (u) {
    loginBtn.classList.add("hidden");
    logoutBtn.classList.remove("hidden");
    userBadge.classList.remove("hidden");
    badgeName.textContent = u.name;
    badgeRole.textContent = u.role;

    if (heroLoginBtn) heroLoginBtn.classList.add("hidden");
    if (welcomeLine && welcomeName) {
      welcomeName.textContent = u.name;
      welcomeLine.classList.remove("hidden");
    }

    qsa(".protected-nav").forEach(function (b) { b.classList.remove("hidden"); });
    if (u.role === "admin") adminTab.classList.remove("hidden");
    else adminTab.classList.add("hidden");
    if (feedFiltersBox) feedFiltersBox.classList.remove("hidden");
  } else {
    loginBtn.classList.remove("hidden");
    logoutBtn.classList.add("hidden");
    userBadge.classList.add("hidden");
    badgeRole.textContent = "";
    if (heroLoginBtn) heroLoginBtn.classList.remove("hidden");
    if (welcomeLine) welcomeLine.classList.add("hidden");
    adminTab.classList.add("hidden");
    if (feedFiltersBox) feedFiltersBox.classList.add("hidden");
    qsa(".protected-nav").forEach(function (b) { b.classList.add("hidden"); });
  }
  updateUnreadIndicator();
}

// =====================
// FEED / ADMIN
// =====================
function getFilteredPosts() {
  var arr = state.posts.filter(function (p) { return p.status !== "removed"; });
  var cf = creditsFilter ? creditsFilter.value : "all";
  var pf = priceFilter ? priceFilter.value : "none";

  if (cf !== "all") {
    arr = arr.filter(function (p) {
      var c = Number(p.credits || 0);
      if (cf === "1-10") return c >= 1 && c <= 10;
      if (cf === "10-20") return c > 10 && c <= 20;
      if (cf === "20-30") return c > 20 && c <= 30;
      if (cf === "30-40") return c > 30 && c <= 40;
      if (cf === "40-50") return c > 40 && c <= 50;
      if (cf === "50+") return c > 50;
      return true;
    });
  }
  if (pf === "low-high") arr = arr.slice().sort(function (a, b) { return (a.price || 0) - (b.price || 0); });
  if (pf === "high-low") arr = arr.slice().sort(function (a, b) { return (b.price || 0) - (a.price || 0); });

  // your posts on top
  if (state.currentUser) {
    var me = state.currentUser.name;
    var mine = arr.filter(function (p) { return p.user === me; });
    var others = arr.filter(function (p) { return p.user !== me; });
    arr = mine.concat(others);
  }
  return arr;
}

function renderFeed() {
  var posts = getFilteredPosts();
  if (!posts.length) {
    feedContainer.innerHTML = "";
    emptyFeedMsg.classList.remove("hidden");
    return;
  }
  emptyFeedMsg.classList.add("hidden");
  feedContainer.innerHTML = posts.map(function (p) {
    var commentsHtml = (p.comments && p.comments.length)
      ? p.comments.map(function (c) {
          return '<p class="text-xs"><b>' + c.by + ':</b> ' + c.text + '</p>';
        }).join("")
      : '<p class="text-xs text-slate-400">No comments yet</p>';

    var ownerText;
    if (state.currentUser && p.user === state.currentUser.name) {
      var d = p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "";
      ownerText = "Post created by you" + (d ? " • " + d : "");
    } else {
      ownerText = "By " + p.user;
    }

    return (
      '<article class="bg-slate-900 rounded-2xl shadow overflow-hidden flex flex-col border border-slate-700">' +
        '<img src="' + p.image + '" class="w-full h-44 object-cover" alt="post image">' +
        '<div class="p-3 flex-1 flex flex-col">' +
          '<h3 class="font-semibold text-sm mb-1 line-clamp-2">' + p.title + '</h3>' +
          '<p class="text-xs text-slate-300 mb-1 line-clamp-3">' + p.desc + '</p>' +
          '<div class="flex items-center justify-between text-[11px] mb-2">' +
            '<span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300">' +
              (p.credits || 0) + ' credits</span>' +
            '<span class="font-semibold text-emerald-200">₹' + (p.price || 0) + '</span>' +
          '</div>' +
          '<p class="text-[11px] text-slate-400 mb-2">' + ownerText + '</p>' +
          '<div class="mt-auto space-y-2">' +
            '<div class="flex items-center justify-between text-xs">' +
              '<button data-like="' + p.id + '" class="px-2 py-1 rounded-full border border-slate-600 text-[11px]">' +
                '❤️ Like (' + (p.likes || 0) + ')' +
              '</button>' +
              '<button data-chat="' + p.id + '" class="px-2 py-1 rounded-full border border-slate-600 text-[11px]">' +
                '💬 Chat' +
              '</button>' +
            '</div>' +
            '<div class="border-t border-slate-700 pt-1">' +
              '<div class="flex gap-1 mb-1">' +
                '<input data-comment-input="' + p.id + '"' +
                       ' class="flex-1 border border-slate-700 bg-slate-950 rounded-lg px-2 py-1 text-[11px]"' +
                       ' placeholder="Add comment..." />' +
                '<button data-comment-btn="' + p.id + '"' +
                        ' class="px-2 text-[11px] border border-slate-600 rounded-lg">Post</button>' +
              '</div>' +
              '<div class="space-y-0.5">' + commentsHtml + '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }).join("");
}

function renderAdmin() {
  var u = state.currentUser;
  if (!u || u.role !== "admin") {
    adminList.innerHTML = '<p class="text-sm text-slate-300">You are not admin.</p>';
    return;
  }

  var usersHtml = state.users.length
    ? state.users.map(function (x) {
        return (
          '<tr class="text-xs">' +
            '<td class="border border-slate-700 px-2 py-1">' + x.id + '</td>' +
            '<td class="border border-slate-700 px-2 py-1">' + x.name + '</td>' +
            '<td class="border border-slate-700 px-2 py-1">' + (x.email || "-") + '</td>' +
            '<td class="border border-slate-700 px-2 py-1">' + x.role + '</td>' +
          '</tr>'
        );
      }).join("")
    : '<tr><td colspan="4" class="text-xs text-center text-slate-400 py-2">No registered users yet.</td></tr>';

  var postsHtml = state.posts.length
    ? state.posts.map(function (p) {
        var badgeClass = p.status === "removed"
          ? "bg-red-500/20 text-red-300"
          : "bg-emerald-500/20 text-emerald-200";
        return (
          '<div class="bg-slate-900 rounded-xl shadow p-3 flex items-center justify-between text-sm border border-slate-700">' +
            '<div>' +
              '<p class="font-semibold">' + p.title + '</p>' +
              '<p class="text-xs text-slate-400">By ' + p.user +
                ' • Likes: ' + (p.likes || 0) +
                ' • Comments: ' + (p.comments ? p.comments.length : 0) + '</p>' +
              '<p class="text-[11px] mt-1">Credits: ' + (p.credits || 0) +
                ' • Price: ₹' + (p.price || 0) + '</p>' +
              '<p class="text-[11px] mt-1">Status: ' +
                '<span class="px-2 py-0.5 rounded-full text-[10px] ' + badgeClass + '">' +
                  (p.status || "active") +
                '</span></p>' +
            '</div>' +
            '<button data-toggle="' + p.id + '"' +
                    ' class="text-xs px-3 py-1 rounded-full border border-slate-600">' +
              (p.status === "removed" ? "Restore" : "Remove") +
            '</button>' +
          '</div>'
        );
      }).join("")
    : '<p class="text-sm text-slate-300">No posts yet.</p>';

  adminList.innerHTML =
    '<div class="bg-slate-900 rounded-2xl shadow p-3 mb-3 border border-slate-700">' +
      '<h3 class="text-sm font-semibold mb-2">Registered Users</h3>' +
      '<div class="overflow-x-auto">' +
        '<table class="min-w-full border border-slate-700 text-xs">' +
          '<thead class="bg-slate-800">' +
            '<tr>' +
              '<th class="border border-slate-700 px-2 py-1 text-left">ID</th>' +
              '<th class="border border-slate-700 px-2 py-1 text-left">Name</th>' +
              '<th class="border border-slate-700 px-2 py-1 text-left">Email</th>' +
              '<th class="border border-slate-700 px-2 py-1 text-left">Role</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody>' + usersHtml + '</tbody>' +
        '</table>' +
      '</div>' +
    '</div>' +
    '<div class="space-y-3">' +
      '<h3 class="text-sm font-semibold mb-1">Post Moderation</h3>' +
      postsHtml +
    '</div>';
}

// =====================
// USER LISTINGS / EDIT
// =====================
function renderUserListings() {
  if (!userListingsBox) return;
  if (!state.currentUser) {
    userListingsBox.innerHTML =
      '<p class="text-sm text-slate-300">Please login to see your listings.</p>';
    return;
  }
  var me = state.currentUser.name;
  var myPosts = state.posts.filter(function (p) { return p.user === me; });
  if (!myPosts.length) {
    userListingsBox.innerHTML =
      '<p class="text-sm text-slate-300">You have not created any listings yet.</p>';
    return;
  }
  userListingsBox.innerHTML = myPosts.map(function (p) {
    var d = p.createdAt ? new Date(p.createdAt).toLocaleString() : "";
    return (
      '<div class="bg-slate-900 rounded-xl shadow p-3 border border-slate-700 flex items-center justify-between text-sm">' +
        '<div class="pr-3">' +
          '<p class="font-semibold text-xs">' + p.title + '</p>' +
          '<p class="text-[11px] text-slate-400">Credits: ' + (p.credits || 0) +
            ' • Price: ₹' + (p.price || 0) + '</p>' +
          '<p class="text-[11px] text-slate-500 mt-1">' + d + '</p>' +
        '</div>' +
        '<button class="text-[11px] underline" data-edit-post="' + p.id + '">Edit</button>' +
      '</div>'
    );
  }).join("");
}

function setListingMode(mode) {
  if (!yourListingsTab || !createListingTab || !userListingsBox || !uploadWrapper) return;

  var yourActive = mode === "your";

  // tab styles
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
    if (uploadForm) uploadForm.reset();
    editPostId = null;
    if (uploadFormBtn) uploadFormBtn.textContent = "Upload Listing";
  }
}

// =====================
// NAVIGATION + HERO
// =====================
qsa(".nav-btn").forEach(function (btn) {
  btn.addEventListener("click", function () {
    var target = btn.dataset.section;
    if (!target) return;
    if (btn.classList.contains("protected-nav") && !requireLogin()) return;

    showSection(target);
    if (target === "feed") renderFeed();
    if (target === "admin") renderAdmin();
    if (target === "inbox") renderInbox();
    if (target === "upload") setListingMode("your");
  });
});

if (heroLoginBtn) {
  heroLoginBtn.addEventListener("click", function () {
    qs("loginModal").classList.remove("hidden");
  });
}
if (heroExploreBtn) {
  heroExploreBtn.addEventListener("click", function () {
    if (!requireLogin()) return;
    showSection("feed");
    renderFeed();
  });
}

if (priceFilter) priceFilter.addEventListener("change", renderFeed);
if (creditsFilter) creditsFilter.addEventListener("change", renderFeed);

// link from upload to calculator
var gotoCalcLink = qs("gotoCalcLink");
if (gotoCalcLink) {
  gotoCalcLink.addEventListener("click", function () {
    if (!requireLogin()) return;
    showSection("calculator");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// =====================
// LOGIN MODAL + TABS
// =====================
qs("loginBtn").addEventListener("click", function () {
  qs("loginModal").classList.remove("hidden");
});
qs("closeLogin").addEventListener("click", function () {
  qs("loginModal").classList.add("hidden");
});

var tabRegister = qs("tabRegister");
var tabLogin = qs("tabLogin");
var registerForm = qs("registerForm");
var loginForm = qs("loginForm");

function switchAuthTab(mode) {
  var regActive = mode === "register";
  registerForm.classList.toggle("hidden", !regActive);
  loginForm.classList.toggle("hidden", regActive);

  tabRegister.classList.toggle("bg-slate-800", regActive);
  tabRegister.classList.toggle("bg-slate-900", !regActive);
  tabLogin.classList.toggle("bg-slate-800", !regActive);
  tabLogin.classList.toggle("bg-slate-900", regActive);
}

tabRegister.addEventListener("click", function () { switchAuthTab("register"); });
tabLogin.addEventListener("click", function () { switchAuthTab("login"); });

// register
registerForm.addEventListener("submit", function (e) {
  e.preventDefault();
  var name = qs("regName").value.trim();
  var email = qs("regEmail").value.trim();
  var requestedRole = qs("regRole").value;

  if (!name || !email) return;
  if (!email.toLowerCase().endsWith("@gmail.com")) {
    alert("Please enter a valid Gmail address.");
    return;
  }
  var exists = state.users.some(function (u) {
    return u.name.toLowerCase() === name.toLowerCase();
  });
  if (exists) {
    alert("User already registered. Please login.");
    switchAuthTab("login");
    return;
  }

  var role = normalizeRole(name, requestedRole);
  if (requestedRole === "admin" && role !== "admin") {
    alert("Only authorised access allowed, try using User role.");
    role = "user";
  }

  state.users.push({
    id: Date.now(),
    name: name,
    email: email,
    role: role,
    createdAt: Date.now()
  });
  saveState();
  alert("Registration successful. Please login.");
  switchAuthTab("login");
});

// login
loginForm.addEventListener("submit", function (e) {
  e.preventDefault();
  var name = qs("loginName").value.trim();
  var loginRole = qs("loginRole").value;
  if (!name) {
    alert("Enter a username.");
    return;
  }
  var user = state.users.find(function (u) {
    return u.name.toLowerCase() === name.toLowerCase();
  });
  if (!user) {
    alert("No user with such username found, try registering first.");
    return;
  }
  if (loginRole === "admin" && name.toLowerCase() !== "bajaish") {
    alert("Only authorised access allowed, try logging in as User.");
    return;
  }
  var role = (loginRole === "admin" && name.toLowerCase() === "bajaish")
    ? "admin"
    : "user";

  state.currentUser = { id: user.id, name: user.name, email: user.email, role: role };
  saveState();
  updateAuthUI();
  qs("loginModal").classList.add("hidden");
  showSection("feed");
  renderFeed();
});

// logout
qs("logoutBtn").addEventListener("click", function () {
  state.currentUser = null;
  state.lastSection = "landing";
  saveState();
  updateAuthUI();
  showSection("landing");
});

// =====================
// UPLOAD / EDIT LISTING
// =====================
if (yourListingsTab) {
  yourListingsTab.addEventListener("click", function () {
    if (!requireLogin()) return;
    setListingMode("your");
  });
}
if (createListingTab) {
  createListingTab.addEventListener("click", function () {
    if (!requireLogin()) return;
    setListingMode("create");
  });
}

if (uploadForm) {
  uploadForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!requireLogin()) return;

    var title = qs("postTitle").value.trim();
    var desc = qs("postDesc").value.trim();
    var price = parseFloat(qs("postPrice").value) || 0;
    var credits = parseFloat(qs("postCredits").value) || 0;
    var fileInput = qs("postImage");
    var file = fileInput.files[0];
    var isEdit = !!editPostId;

    if (!title || !desc) return;

    function finishSave(imageData) {
      if (isEdit) {
        var post = state.posts.find(function (p) { return String(p.id) === String(editPostId); });
        if (!post) return;
        post.title = title;
        post.desc = desc;
        post.price = price;
        post.credits = credits;
        if (imageData) post.image = imageData;
        saveState();
        renderFeed();
        renderUserListings();
        alert("Listing updated.");
      } else {
        state.posts.unshift({
          id: Date.now(),
          title: title,
          desc: desc,
          image: imageData,
          user: state.currentUser.name,
          likes: 0,
          likedBy: [],
          comments: [],
          chatMessages: [],
          status: "active",
          price: price,
          credits: credits,
          createdAt: Date.now()
        });
        saveState();
        renderFeed();
        renderUserListings();
        alert("Listing uploaded.");
      }
      uploadForm.reset();
      editPostId = null;
      uploadFormBtn.textContent = "Upload Listing";
    }

    if (file) {
      var maxBytes = 50 * 1024;
      if (file.size > maxBytes) {
        alert("Image too large! Only up to 50 KB allowed.");
        return;
      }
      var reader = new FileReader();
      reader.onload = function (ev) {
        finishSave(ev.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      if (!isEdit) {
        alert("Please choose an image for a new listing.");
        return;
      }
      finishSave(null);
    }
  });
}

// edit button in "Your listings"
if (userListingsBox) {
  userListingsBox.addEventListener("click", function (e) {
    var id = e.target.dataset.editPost;
    if (!id) return;
    if (!requireLogin()) return;

    var post = state.posts.find(function (p) { return String(p.id) === String(id); });
    if (!post) return;

    editPostId = post.id;
    setListingMode("create");

    qs("postTitle").value = post.title;
    qs("postDesc").value = post.desc;
    qs("postPrice").value = post.price;
    qs("postCredits").value = post.credits;
    uploadFormBtn.textContent = "Save changes";
  });
}

// =====================
// FEED EVENTS (like, comment, chat)
// =====================
feedContainer.addEventListener("click", function (e) {
  var likeId = e.target.dataset.like;
  var commentId = e.target.dataset.commentBtn;
  var chatId = e.target.dataset.chat;

  // like toggle
  if (likeId) {
    if (!requireLogin()) return;
    var post = state.posts.find(function (p) { return String(p.id) === String(likeId); });
    if (!post) return;
    if (!post.likedBy) post.likedBy = [];
    var index = post.likedBy.indexOf(state.currentUser.name);
    if (index === -1) {
      post.likedBy.push(state.currentUser.name);
      post.likes = (post.likes || 0) + 1;
    } else {
      post.likedBy.splice(index, 1);
      post.likes = Math.max(0, (post.likes || 0) - 1);
    }
    saveState();
    renderFeed();
  }

  // comment
  if (commentId) {
    if (!requireLogin()) return;
    var postC = state.posts.find(function (p) { return String(p.id) === String(commentId); });
    if (!postC) return;
    var input = document.querySelector('[data-comment-input="' + commentId + '"]');
    var text = input.value.trim();
    if (!text) return;
    if (!postC.comments) postC.comments = [];
    postC.comments.push({ by: state.currentUser.name, text: text });
    input.value = "";
    saveState();
    renderFeed();
  }

  // open chat
  if (chatId) {
    if (!requireLogin()) return;
    openChatForPost(chatId);
  }
});

// =====================
// ADMIN TOGGLE
// =====================
adminList.addEventListener("click", function (e) {
  var id = e.target.dataset.toggle;
  if (!id) return;
  var post = state.posts.find(function (p) { return String(p.id) === String(id); });
  if (!post) return;
  post.status = post.status === "removed" ? "active" : "removed";
  saveState();
  renderFeed();
  renderAdmin();
});

// inbox -> open chat
if (inboxList) {
  inboxList.addEventListener("click", function (e) {
    var postId = e.target.dataset.openChat;
    if (!postId) return;
    if (!requireLogin()) return;
    openChatForPost(postId);
  });
}

// =====================
// CHAT
// =====================
function openChatForPost(postId) {
  var post = state.posts.find(function (p) { return String(p.id) === String(postId); });
  if (!post) return;
  if (!post.chatMessages) post.chatMessages = [];

  // mark others' messages as seen
  post.chatMessages.forEach(function (m) {
    if (m.from !== state.currentUser.name) m.seen = true;
  });
  saveState();
  updateUnreadIndicator();

  currentChatPostId = post.id;
  chatPostTitle.textContent = "Chat about: " + post.title;
  renderChatMessages(post);
  chatModal.classList.remove("hidden");
}

function renderChatMessages(post) {
  if (!post.chatMessages || !post.chatMessages.length) {
    chatMessagesBox.innerHTML =
      '<p class="text-[11px] text-slate-400 text-center mt-6">No messages yet. Start the conversation.</p>';
    return;
  }
  chatMessagesBox.innerHTML = post.chatMessages.map(function (m) {
    var mine = state.currentUser && m.from === state.currentUser.name;
    var time = new Date(m.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return (
      '<div class="flex ' + (mine ? "justify-end" : "justify-start") + '">' +
        '<div class="max-w-[75%] px-2 py-1 rounded-lg text-[11px] ' +
          (mine ? "bg-emerald-600 text-white" : "bg-slate-800 border border-slate-700") + '">' +
          '<div class="font-semibold mb-0.5">' + (mine ? "You" : m.from) + '</div>' +
          '<div>' + m.text + '</div>' +
          '<div class="flex justify-between items-center mt-0.5 text-[9px] opacity-80">' +
            '<span>' + time + '</span>' +
            (mine ? '<span>' + (m.seen ? "Seen" : "Sent") + '</span>' : "") +
          '</div>' +
          (mine
            ? '<button data-delmsg="' + m.id + '" class="mt-0.5 text-[9px] underline">Delete for everyone</button>'
            : "") +
        '</div>' +
      '</div>'
    );
  }).join("");
  chatMessagesBox.scrollTop = chatMessagesBox.scrollHeight;
}

qs("closeChat").addEventListener("click", function () {
  chatModal.classList.add("hidden");
  currentChatPostId = null;
});

chatForm.addEventListener("submit", function (e) {
  e.preventDefault();
  if (!requireLogin() || !currentChatPostId) return;
  var text = chatInput.value.trim();
  if (!text) return;
  var post = state.posts.find(function (p) { return String(p.id) === String(currentChatPostId); });
  if (!post) return;
  if (!post.chatMessages) post.chatMessages = [];
  post.chatMessages.push({
    id: Date.now(),
    from: state.currentUser.name,
    text: text,
    time: Date.now(),
    seen: false
  });
  saveState();
  chatInput.value = "";
  renderChatMessages(post);
  updateUnreadIndicator();
});

chatMessagesBox.addEventListener("click", function (e) {
  var id = e.target.dataset.delmsg;
  if (!id || !currentChatPostId) return;
  var post = state.posts.find(function (p) { return String(p.id) === String(currentChatPostId); });
  if (!post || !post.chatMessages) return;
  post.chatMessages = post.chatMessages.filter(function (m) { return String(m.id) !== String(id); });
  saveState();
  renderChatMessages(post);
  updateUnreadIndicator();
});

// =====================
// CALCULATOR
// =====================
qsa('input[name="calcMethod"]').forEach(function (r) {
  r.addEventListener("change", function () {
    var v = document.querySelector('input[name="calcMethod"]:checked').value;
    qs("treeForm").classList.toggle("hidden", v !== "trees");
    qs("landForm").classList.toggle("hidden", v !== "land");
    qs("calcResult").classList.add("hidden");
  });
});

function showResult(annual, total) {
  var box = qs("calcResult");
  box.classList.remove("hidden");
  qs("annualCredits").textContent =
    "Annual Carbon Credits: " + annual.toFixed(2) + " tons CO\u2082 / year";
  qs("totalCredits").textContent =
    "Total Carbon Credits: " + total.toFixed(2) + " tons CO\u2082";
}

qs("calcTreesBtn").addEventListener("click", function () {
  var x = parseFloat(qs("treeType").value);
  var N = parseFloat(qs("treeCount").value);
  var t = parseFloat(qs("treeYears").value);
  if (N <= 0 || t <= 0) {
    alert("Enter valid tree count and years.");
    return;
  }
  var annual = (N * x) / 1000;
  showResult(annual, annual * t);
});

qs("calcLandBtn").addEventListener("click", function () {
  var A = parseFloat(qs("landArea").value);
  var unit = qs("landUnit").value;
  var t = parseFloat(qs("landYears").value);
  if (A <= 0 || t <= 0) {
    alert("Enter valid area and years.");
    return;
  }
  var hectares = A;
  if (unit === "acres") hectares = A * 0.404686;
  var annual = hectares * 6; // 6 tons/ha/year
  showResult(annual, annual * t);
});

// =====================
// INITIAL LOAD
// =====================
updateAuthUI();

var startSection = state.lastSection || "landing";
var protectedSections = ["feed", "upload", "calculator", "admin", "inbox"];
if (!state.currentUser && protectedSections.indexOf(startSection) !== -1) {
  startSection = "landing";
}

showSection(startSection);
if (startSection === "feed") renderFeed();
if (startSection === "admin") renderAdmin();
if (startSection === "inbox") renderInbox();
if (startSection === "upload") setListingMode("your");
