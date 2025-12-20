// app.js

// ===== helpers =====
const qs = id => document.getElementById(id);
const qsa = sel => [...document.querySelectorAll(sel)];
const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

// Use relative URL so it works locally and on Render automatically
const API_BASE = ""; 
const SESSION_KEY = "ccx_session_v1";
const LAST_SECTION_KEY = "ccx_last_section_v1";
const PROTECTED_SECTIONS = ["feed", "upload", "calculator", "admin", "inbox"];

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
const loginModal = qs("loginModal");

// ===== Global State =====
let state = {
  users: [], // For admin view
  posts: [], // All posts
  currentUser: null
};

let editPostId = null;
let currentChatPostId = null;
let adminViewChat = false;

// ===== Navigation & UI =====
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

const showSection = name => {
  qsa(".section").forEach(s => s.classList.add("hidden"));
  const sec = qs("section-" + name);
  if (sec) sec.classList.remove("hidden");
  localStorage.setItem(LAST_SECTION_KEY, name);
  setActiveNav(name);
};

// ===== Session Management =====
const saveSession = () => {
  if (state.currentUser) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(state.currentUser));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
};

const restoreSession = () => {
  const raw = localStorage.getItem(SESSION_KEY);
  if (raw) {
    try {
      state.currentUser = JSON.parse(raw);
    } catch (e) {
      console.error("Session parse error", e);
    }
  }
};

const updateAuthUI = () => {
  const loginBtn = qs("loginBtn");
  const logoutBtn = qs("logoutBtn");
  const u = state.currentUser;

  if (u) {
    // Logged In
    loginBtn.classList.add("hidden");
    logoutBtn.classList.remove("hidden");
    userBadge.classList.remove("hidden");
    badgeName.textContent = u.name;
    badgeRole.textContent = u.role;
    
    // Hide Hero Login
    if(heroLoginBtn) heroLoginBtn.classList.add("hidden");
    
    // Show Welcome
    if (welcomeLine && welcomeName) {
      welcomeName.textContent = u.name;
      welcomeLine.classList.remove("hidden");
    }

    // Show Nav Items
    qsa(".protected-nav").forEach(b => b.classList.remove("hidden"));
    
    // Admin Check
    if (u.role === "admin") {
      adminTab.classList.remove("hidden");
    } else {
      adminTab.classList.add("hidden");
    }

    if(feedFiltersBox) feedFiltersBox.classList.remove("hidden");
  } else {
    // Logged Out
    loginBtn.classList.remove("hidden");
    logoutBtn.classList.add("hidden");
    userBadge.classList.add("hidden");
    badgeRole.textContent = "";
    
    if(heroLoginBtn) heroLoginBtn.classList.remove("hidden");
    if(welcomeLine) welcomeLine.classList.add("hidden");
    
    adminTab.classList.add("hidden");
    if(feedFiltersBox) feedFiltersBox.classList.add("hidden");
    qsa(".protected-nav").forEach(b => b.classList.add("hidden"));
  }
  updateUnreadIndicator();
};

const requireLogin = () => {
  if (!state.currentUser) {
    alert("Please login first.");
    loginModal.classList.remove("hidden");
    return false;
  }
  return true;
};

// ===== API Operations =====

// Load Data
const fetchData = async () => {
  try {
    // 1. Get Posts
    const postsRes = await fetch(API_BASE + "/api/posts");
    const postsData = await postsRes.json();
    state.posts = Array.isArray(postsData) ? postsData : [];

    // 2. Get Users (Only if admin, but we can try)
    if (state.currentUser?.role === 'admin') {
        const usersRes = await fetch(API_BASE + "/api/users");
        if(usersRes.ok) {
            state.users = await usersRes.json();
        }
    }

    renderFeed();
    renderInbox();
    if(state.currentUser?.role === 'admin') renderAdmin();
    
    // Update active chat if open
    if (!chatModal.classList.contains("hidden") && currentChatPostId) {
        const p = state.posts.find(x => String(x.id) === String(currentChatPostId));
        if (p) renderChatMessages(p);
    }
    
    updateUnreadIndicator();

  } catch (err) {
    console.error("Fetch error:", err);
  }
};

// ===== AUTH HANDLERS =====

// Register
const handleRegister = async (e) => {
  e.preventDefault();
  const name = qs("regName").value.trim();
  const email = qs("regEmail").value.trim();
  const password = qs("regPass").value.trim();
  const role = qs("regRole").value;

  if (!name || !email || !password) return alert("Fill all fields");

  try {
    const res = await fetch(API_BASE + "/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");

    alert("Registration successful! Please login.");
    switchAuthTab("login");
  } catch (err) {
    alert(err.message);
  }
};

// Login
const handleLogin = async (e) => {
  e.preventDefault();
  const name = qs("loginName").value.trim();
  const password = qs("loginPass").value.trim();
  const role = qs("loginRole").value;

  if (!name || !password) return alert("Fill all fields");

  try {
    const res = await fetch(API_BASE + "/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password, role }) // Passing role to validate against server check
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");

    state.currentUser = data;
    saveSession();
    updateAuthUI();
    loginModal.classList.add("hidden");
    
    // Redirect to marketplace or home
    showSection("landing");
    fetchData(); // Load data immediately
  } catch (err) {
    alert(err.message);
  }
};

// ===== POSTS & UPLOAD =====

const handleUpload = async (e) => {
  e.preventDefault();
  if (!requireLogin()) return;

  const title = qs("postTitle").value.trim();
  const desc = qs("postDesc").value.trim();
  const price = parseFloat(qs("postPrice").value) || 0;
  const credits = parseFloat(qs("postCredits").value) || 0;
  const file = qs("postImage").files[0];
  const isEdit = !!editPostId;

  if (!title || !desc) return alert("Title and Description required");

  // Helper to send data
  const sendPost = async (imgData) => {
    const payload = {
        title, desc, price, credits,
        user: state.currentUser.name,
        image: imgData // If null/undefined, backend should handle or keep old
    };

    try {
        let url = API_BASE + "/api/posts";
        let method = "POST";

        if (isEdit) {
            url += "/" + editPostId;
            method = "PUT";
            // If no new image, don't send image field to avoid overwriting with null (logic handled in backend or preserved here)
            // Ideally backend handles partial updates.
            if(!imgData) delete payload.image; 
        } else {
            if(!imgData) return alert("Image required for new post");
            payload.image = imgData;
        }

        const res = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if(!res.ok) throw new Error("Post upload failed");
        
        alert(isEdit ? "Listing updated" : "Listing uploaded");
        uploadForm.reset();
        editPostId = null;
        uploadFormBtn.textContent = "Upload Listing";
        fetchData();
        setListingMode("your");
    } catch(err) {
        console.error(err);
        alert("Error saving post");
    }
  };

  if (file) {
    if (file.size > 200 * 1024) return alert("Image too large! Max 200KB recommended.");
    const r = new FileReader();
    r.onload = ev => sendPost(ev.target.result);
    r.readAsDataURL(file);
  } else {
    sendPost(null);
  }
};

// ===== CHAT =====

const sendChat = async (e) => {
    e.preventDefault();
    if (adminViewChat) return;
    if (!requireLogin() || !currentChatPostId) return;
    
    const text = chatInput.value.trim();
    if (!text) return;

    try {
        const res = await fetch(`${API_BASE}/api/posts/${currentChatPostId}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                from: state.currentUser.name,
                text: text
            })
        });

        if(res.ok) {
            chatInput.value = "";
            fetchData(); // Refresh to see new message
        }
    } catch(err) {
        console.error(err);
    }
};

// ===== RENDER LOGIC (Feed, Inbox, Admin) =====

// Feed
const renderFeed = () => {
    const posts = getFilteredPosts(); // Reuse existing filter logic
    if (!posts.length) {
      feedContainer.innerHTML = "";
      emptyFeedMsg.classList.remove("hidden");
      return;
    }
    emptyFeedMsg.classList.add("hidden");
    
    feedContainer.innerHTML = posts.map(p => {
        let ownerText = (state.currentUser && p.user === state.currentUser.name) 
            ? `Post created by you` 
            : `By ${p.user}`;
        
        return `
        <article class="bg-slate-900 rounded-2xl shadow overflow-hidden flex flex-col border border-slate-700">
          <img src="${p.image || ''}" class="w-full h-44 object-cover" alt="post image">
          <div class="p-3 flex-1 flex flex-col">
            <h3 class="font-semibold text-sm mb-1 line-clamp-2">${p.title}</h3>
            <p class="text-xs text-slate-300 mb-1 line-clamp-3">${p.desc}</p>
            <div class="flex items-center justify-between text-[11px] mb-2">
              <span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300">${p.credits} credits</span>
              <span class="font-semibold text-emerald-200">₹${p.price}</span>
            </div>
            <p class="text-[11px] text-slate-400 mb-2">${ownerText}</p>
            <div class="mt-auto">
                <button data-chat="${p.id}" class="w-full py-1.5 rounded bg-slate-800 text-xs border border-slate-700 hover:bg-slate-700">
                  💬 Chat
                </button>
            </div>
          </div>
        </article>`;
    }).join("");
};

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
      // Put my posts first
      const mine = arr.filter(p => p.user === me);
      const others = arr.filter(p => p.user !== me);
      arr = [...mine, ...others];
    }
    return arr;
};

// Admin
const renderAdmin = () => {
    const u = state.currentUser;
    if (!u || u.role !== "admin") return;

    // Users Table
    const usersHtml = state.users.map(x => `
        <tr class="text-xs">
          <td class="border border-slate-700 px-2 py-1">${x.name}</td>
          <td class="border border-slate-700 px-2 py-1">${x.role}</td>
          <td class="border border-slate-700 px-2 py-1 text-center">
             <button data-deluser="${x.id}" class="text-red-400 underline">Delete</button>
          </td>
        </tr>`).join("");

    // Posts List
    const postsHtml = state.posts.map(p => `
        <div class="bg-slate-900 rounded p-2 flex justify-between items-center text-xs mb-2 border border-slate-700">
           <span>${p.title} (by ${p.user})</span>
           <div class="flex gap-2">
             <button data-delpost="${p.id}" class="text-red-400 underline">Delete</button>
             <button data-viewchat="${p.id}" class="text-blue-400 underline">View Chat</button>
           </div>
        </div>`).join("");

    adminList.innerHTML = `
      <div class="mb-4">
        <h3 class="font-bold text-sm mb-2">Users</h3>
        <table class="w-full text-left border-collapse">${usersHtml}</table>
      </div>
      <div>
        <h3 class="font-bold text-sm mb-2">Manage Posts</h3>
        ${postsHtml}
      </div>
    `;
};

// Inbox
const getInboxItems = () => {
    if (!state.currentUser) return [];
    const me = state.currentUser.name;
    const items = [];
  
    state.posts.forEach(p => {
      if (!p.chatMessages?.length) return;
      // Am I involved? (Owner or Sender)
      const meInThread = p.user === me || p.chatMessages.some(m => m.from === me);
      if (!meInThread) return;
      
      const lastMsg = p.chatMessages[p.chatMessages.length - 1];
      
      items.push({
        postId: p.id,
        postTitle: p.title,
        lastMsg: lastMsg,
        seen: lastMsg.from === me ? true : lastMsg.seen // If I sent it, it's 'seen' by me
      });
    });
    return items.sort((a,b) => b.lastMsg.time - a.lastMsg.time);
};

const renderInbox = () => {
    const items = getInboxItems();
    inboxList.innerHTML = items.length ? items.map(i => `
        <div class="bg-slate-900 p-3 rounded-lg border border-slate-700 flex justify-between items-center">
           <div>
             <div class="text-sm font-bold">${i.postTitle}</div>
             <div class="text-xs text-slate-400">${i.lastMsg.from}: ${i.lastMsg.text}</div>
           </div>
           <button data-open-chat="${i.postId}" class="text-xs bg-emerald-600 px-2 py-1 rounded text-white relative">
             Open
             ${!i.seen ? '<span class="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>' : ''}
           </button>
        </div>
    `).join("") : `<p class="text-slate-400 text-sm">No messages.</p>`;
};

const updateUnreadIndicator = () => {
    if(!inboxIndicator) return;
    const items = getInboxItems();
    const hasUnread = items.some(i => !i.seen);
    if(hasUnread) inboxIndicator.classList.remove("hidden");
    else inboxIndicator.classList.add("hidden");
};

// Chat UI
const openChatForPost = (postId) => {
    const post = state.posts.find(p => String(p.id) === String(postId));
    if(!post) return;

    adminViewChat = false;
    currentChatPostId = post.id;
    chatForm.classList.remove("hidden");
    chatPostTitle.textContent = post.title;
    renderChatMessages(post);
    chatModal.classList.remove("hidden");
};

const renderChatMessages = (post) => {
    if (!post.chatMessages || post.chatMessages.length === 0) {
        chatMessagesBox.innerHTML = '<p class="text-center text-slate-500 text-xs mt-4">Start the conversation</p>';
        return;
    }

    chatMessagesBox.innerHTML = post.chatMessages.map(m => {
        const isMe = state.currentUser && m.from === state.currentUser.name;
        return `
        <div class="flex ${isMe ? 'justify-end' : 'justify-start'}">
            <div class="max-w-[80%] rounded-lg p-2 text-xs mb-1 ${isMe ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-200'}">
                <div class="font-bold text-[10px] opacity-70 mb-0.5">${m.from}</div>
                ${m.text}
                <div class="text-[9px] text-right opacity-60 mt-1">${isMe && m.seen ? 'Seen' : ''}</div>
            </div>
        </div>`;
    }).join("");
    
    chatMessagesBox.scrollTop = chatMessagesBox.scrollHeight;
};


// ===== EVENT LISTENERS =====

on(qs("loginBtn"), "click", () => loginModal.classList.remove("hidden"));
on(heroLoginBtn, "click", () => loginModal.classList.remove("hidden"));
on(qs("closeLogin"), "click", () => loginModal.classList.add("hidden"));
on(qs("logoutBtn"), "click", () => {
    state.currentUser = null;
    saveSession();
    updateAuthUI();
    showSection("landing");
});

// Auth Tabs
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

// Auth Submits
on(registerForm, "submit", handleRegister);
on(loginForm, "submit", handleLogin);

// Post Upload
on(uploadForm, "submit", handleUpload);

// Chat
on(chatForm, "submit", sendChat);
on(qs("closeChat"), "click", () => chatModal.classList.add("hidden"));

// Feed Interactions (Chat button)
on(feedContainer, "click", e => {
    const chatId = e.target.dataset.chat;
    if(chatId) {
        if(requireLogin()) openChatForPost(chatId);
    }
});

// Inbox Interactions
on(inboxList, "click", e => {
    const chatId = e.target.dataset.openChat;
    if(chatId && requireLogin()) openChatForPost(chatId);
});

// Admin Interactions
on(adminList, "click", async e => {
    const delUserId = e.target.dataset.deluser;
    const delPostId = e.target.dataset.delpost;
    const viewChatId = e.target.dataset.viewchat;

    if(delUserId) {
        if(!confirm("Delete this user?")) return;
        await fetch(`${API_BASE}/api/users/${delUserId}`, { method: 'DELETE' });
        fetchData();
    }
    if(delPostId) {
        if(!confirm("Delete this post?")) return;
        await fetch(`${API_BASE}/api/posts/${delPostId}`, { method: 'DELETE' });
        fetchData();
    }
    if(viewChatId) {
        const post = state.posts.find(p => String(p.id) === String(viewChatId));
        if(post) {
            adminViewChat = true;
            chatForm.classList.add("hidden"); // Admin can't chat
            chatPostTitle.textContent = `Admin View: ${post.title}`;
            renderChatMessages(post);
            chatModal.classList.remove("hidden");
        }
    }
});

// Nav
qsa(".nav-btn").forEach(btn => on(btn, "click", () => {
    const sec = btn.dataset.section;
    if(btn.classList.contains("protected-nav") && !requireLogin()) return;
    showSection(sec);
    if(sec === "upload") setListingMode("your");
}));

// Listing Tabs
const setListingMode = (mode) => {
    const isYour = mode === "your";
    if(isYour) {
        // Simple User Listings (Reuse feed filter logic for simplicity in this mini project)
        const myPosts = state.posts.filter(p => p.user === state.currentUser?.name);
        userListingsBox.innerHTML = myPosts.map(p => `
            <div class="bg-slate-900 p-2 border border-slate-700 rounded mb-2 flex justify-between text-xs">
                <span>${p.title}</span>
                <button class="text-blue-400" onclick="editPost('${p.id}')">Edit (Not Impl)</button>
            </div>
        `).join("");
        userListingsBox.classList.remove("hidden");
        uploadWrapper.classList.add("hidden");
        
        yourListingsTab.classList.add("bg-slate-800", "text-white");
        createListingTab.classList.remove("bg-slate-800", "text-white");
    } else {
        userListingsBox.classList.add("hidden");
        uploadWrapper.classList.remove("hidden");
        yourListingsTab.classList.remove("bg-slate-800", "text-white");
        createListingTab.classList.add("bg-slate-800", "text-white");
    }
};

on(yourListingsTab, "click", () => setListingMode("your"));
on(createListingTab, "click", () => setListingMode("create"));
on(heroExploreBtn, "click", () => { if(requireLogin()) showSection("feed"); });

// Calculator
on(qs("calcTreesBtn"), "click", () => {
    const x = parseFloat(qs("treeType").value);
    const N = parseFloat(qs("treeCount").value);
    const t = parseFloat(qs("treeYears").value);
    const res = (N * x * t) / 1000;
    qs("calcResult").classList.remove("hidden");
    qs("totalCredits").textContent = `${res.toFixed(2)} Tons CO2`;
});

// Init
restoreSession();
fetchData();
const savedSection = localStorage.getItem(LAST_SECTION_KEY);
if (savedSection && state.currentUser) showSection(savedSection);
else showSection("landing");

setInterval(fetchData, 5000); // Polling for chat/updates
