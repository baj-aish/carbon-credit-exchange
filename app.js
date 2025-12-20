// app.js
const qs = id => document.getElementById(id);
const qsa = sel => [...document.querySelectorAll(sel)];
const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

// RENDER URL (Leave empty for relative path if same domain)
// app.js

// 🔴 CHANGE THIS LINE:
const API_BASE = "https://carbon-credit-exchange-backend.onrender.com"; 
 
const SESSION_KEY = "ccx_session_v1";
const LAST_SECTION_KEY = "ccx_last_section_v1";
const PROTECTED_SECTIONS = ["feed", "upload", "calculator", "admin", "inbox"];

// State
let state = { users: [], posts: [], currentUser: null };
let editPostId = null;
let currentChatPostId = null;
let adminViewChat = false;

// --- UTILS ---
const showSection = name => {
  qsa(".section").forEach(s => s.classList.add("hidden"));
  const sec = qs("section-" + name);
  if (sec) sec.classList.remove("hidden");
  localStorage.setItem(LAST_SECTION_KEY, name);
  
  // Nav Highlight
  qsa(".nav-btn").forEach(btn => {
    const isActive = btn.dataset.section === name;
    btn.classList.toggle("border-b-emerald-400", isActive);
    btn.classList.toggle("text-white", isActive);
  });
};

const saveSession = () => {
  if (state.currentUser) localStorage.setItem(SESSION_KEY, JSON.stringify(state.currentUser));
  else localStorage.removeItem(SESSION_KEY);
};

const updateAuthUI = () => {
  const u = state.currentUser;
  if (u) {
    qs("loginBtn").classList.add("hidden");
    qs("logoutBtn").classList.remove("hidden");
    qs("userBadge").classList.remove("hidden");
    qs("badgeName").textContent = u.name;
    qs("badgeRole").textContent = u.role;
    qs("heroLoginBtn").classList.add("hidden");
    qs("welcomeName").textContent = u.name;
    qs("welcomeLine").classList.remove("hidden");
    qsa(".protected-nav").forEach(b => b.classList.remove("hidden"));
    if (u.role === "admin") qs("adminTab").classList.remove("hidden");
    else qs("adminTab").classList.add("hidden");
    qs("feedFilters").classList.remove("hidden");
  } else {
    qs("loginBtn").classList.remove("hidden");
    qs("logoutBtn").classList.add("hidden");
    qs("userBadge").classList.add("hidden");
    qs("heroLoginBtn").classList.remove("hidden");
    qs("welcomeLine").classList.add("hidden");
    qs("adminTab").classList.add("hidden");
    qs("feedFilters").classList.add("hidden");
    qsa(".protected-nav").forEach(b => b.classList.add("hidden"));
  }
};

const requireLogin = () => {
  if (!state.currentUser) {
    alert("Please login first.");
    qs("loginModal").classList.remove("hidden");
    return false;
  }
  return true;
};

// --- API ---
const fetchData = async () => {
  try {
    const res = await fetch(API_BASE + "/api/posts");
    if(res.ok) state.posts = await res.json();

    if(state.currentUser?.role === 'admin') {
       const uRes = await fetch(API_BASE + "/api/users");
       if(uRes.ok) state.users = await uRes.json();
       renderAdmin();
    }
    
    renderFeed();
    renderInbox();
    if (!qs("chatModal").classList.contains("hidden") && currentChatPostId) {
        const p = state.posts.find(x => x.id == currentChatPostId);
        if(p) renderChatMessages(p);
    }
  } catch (err) { console.error(err); }
};

// --- AUTH HANDLERS ---
on(qs("registerForm"), "submit", async e => {
  e.preventDefault();
  const name = qs("regName").value;
  const email = qs("regEmail").value;
  const password = qs("regPass").value;
  const role = qs("regRole").value;

  try {
    const res = await fetch(API_BASE + "/api/register", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    alert("Registered! Please login.");
    qs("tabLogin").click();
  } catch (err) { alert(err.message); }
});

on(qs("loginForm"), "submit", async e => {
  e.preventDefault();
  const name = qs("loginName").value;
  const password = qs("loginPass").value;
  const role = qs("loginRole").value;

  try {
    const res = await fetch(API_BASE + "/api/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password, role }) 
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    state.currentUser = data;
    saveSession();
    updateAuthUI();
    qs("loginModal").classList.add("hidden");
    showSection("landing");
    fetchData();
  } catch (err) { alert(err.message); }
});

// --- POSTS ---
on(qs("uploadForm"), "submit", async e => {
  e.preventDefault();
  if(!requireLogin()) return;
  const title = qs("postTitle").value;
  const desc = qs("postDesc").value;
  const price = Number(qs("postPrice").value);
  const credits = Number(qs("postCredits").value);
  const file = qs("postImage").files[0];
  
  const process = async (img) => {
    const payload = { title, desc, price, credits, user: state.currentUser.name, image: img };
    let url = API_BASE + "/api/posts";
    let method = "POST";
    
    if(editPostId) {
        url += "/" + editPostId;
        method = "PUT";
        if(!img) delete payload.image;
    } else if(!img) return alert("Image required");

    await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
    alert("Saved!");
    qs("uploadForm").reset();
    editPostId = null;
    qs("uploadFormBtn").textContent = "Upload Listing";
    fetchData();
    qs("yourListingsTab").click();
  };

  if(file) {
    const r = new FileReader();
    r.onload = ev => process(ev.target.result);
    r.readAsDataURL(file);
  } else process(null);
});

// --- RENDERERS ---
const renderFeed = () => {
    const con = qs("feedContainer");
    if(!state.posts.length) return con.innerHTML = "";
    con.innerHTML = state.posts.filter(p => p.status !== 'removed').map(p => `
      <div class="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow">
        <img src="${p.image}" class="w-full h-40 object-cover">
        <div class="p-3">
          <h3 class="font-bold text-sm truncate">${p.title}</h3>
          <p class="text-xs text-slate-400 mb-2">By ${p.user}</p>
          <div class="flex justify-between text-xs mb-2">
            <span class="text-emerald-300">${p.credits} Credits</span>
            <span class="text-white">₹${p.price}</span>
          </div>
          <button onclick="openChat('${p.id}')" class="w-full py-1 bg-slate-800 text-xs rounded border border-slate-600">💬 Chat</button>
        </div>
      </div>
    `).join("");
};

const renderInbox = () => {
    const list = qs("inboxList");
    if(!state.currentUser) return;
    const items = state.posts.filter(p => 
        p.chatMessages?.length && (p.user === state.currentUser.name || p.chatMessages.some(m => m.from === state.currentUser.name))
    );
    list.innerHTML = items.map(p => {
        const last = p.chatMessages[p.chatMessages.length-1];
        return `<div onclick="openChat('${p.id}')" class="bg-slate-900 p-3 rounded border border-slate-700 cursor-pointer flex justify-between">
            <div class="text-sm font-bold">${p.title}</div>
            <div class="text-xs text-slate-400">${last.from}: ${last.text}</div>
        </div>`
    }).join("");
};

const renderAdmin = () => {
    if(state.currentUser?.role !== 'admin') return;
    qs("adminList").innerHTML = state.users.map(u => `
        <div class="flex justify-between bg-slate-900 p-2 text-xs border border-slate-700 mb-1">
            <span>${u.name} (${u.role})</span>
            <button onclick="deleteUser('${u.id}')" class="text-red-400">Delete</button>
        </div>
    `).join("");
};

// --- CHAT ---
window.openChat = (pid) => {
    if(!requireLogin()) return;
    const p = state.posts.find(x => x.id == pid);
    if(!p) return;
    currentChatPostId = pid;
    qs("chatModal").classList.remove("hidden");
    qs("chatPostTitle").textContent = p.title;
    renderChatMessages(p);
};

const renderChatMessages = (p) => {
    const box = qs("chatMessages");
    box.innerHTML = (p.chatMessages||[]).map(m => {
        const isMe = m.from === state.currentUser.name;
        return `<div class="flex ${isMe?'justify-end':'justify-start'}"><div class="px-2 py-1 rounded mb-1 text-xs ${isMe?'bg-emerald-600':'bg-slate-800'}">${m.text}</div></div>`;
    }).join("");
    box.scrollTop = box.scrollHeight;
};

on(qs("chatForm"), "submit", async e => {
    e.preventDefault();
    const text = qs("chatInput").value;
    if(!text) return;
    await fetch(API_BASE + `/api/posts/${currentChatPostId}/chat`, {
        method: "POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ from: state.currentUser.name, text })
    });
    qs("chatInput").value = "";
    fetchData();
});

// --- GLOBAL EXPORTS FOR HTML ONCLICK ---
window.deleteUser = async (id) => {
    if(confirm("Delete user?")) {
        await fetch(API_BASE + `/api/users/${id}`, { method: "DELETE" });
        fetchData();
    }
};

// --- INIT ---
const saved = localStorage.getItem(SESSION_KEY);
if(saved) state.currentUser = JSON.parse(saved);
updateAuthUI();
fetchData();
setInterval(fetchData, 4000);

// Basic Event Listeners
on(qs("loginBtn"), "click", () => qs("loginModal").classList.remove("hidden"));
on(qs("closeLogin"), "click", () => qs("loginModal").classList.add("hidden"));
on(qs("closeChat"), "click", () => qs("chatModal").classList.add("hidden"));
on(qs("logoutBtn"), "click", () => {
    state.currentUser = null;
    saveSession();
    updateAuthUI();
    showSection("landing");
});
on(qs("heroExploreBtn"), "click", () => { if(requireLogin()) showSection("feed"); });
on(qs("heroLoginBtn"), "click", () => qs("loginModal").classList.remove("hidden"));

// Tabs
on(qs("tabRegister"), "click", () => { qs("registerForm").classList.remove("hidden"); qs("loginForm").classList.add("hidden"); });
on(qs("tabLogin"), "click", () => { qs("loginForm").classList.remove("hidden"); qs("registerForm").classList.add("hidden"); });

// Nav
qsa(".nav-btn").forEach(b => on(b, "click", () => {
    if(b.classList.contains("protected-nav") && !requireLogin()) return;
    showSection(b.dataset.section);
    if(b.dataset.section === 'upload') {
        qs("uploadWrapper").classList.add("hidden");
        qs("userListings").classList.remove("hidden");
    }
}));
on(qs("createListingTab"), "click", () => { qs("uploadWrapper").classList.remove("hidden"); qs("userListings").classList.add("hidden"); });
on(qs("yourListingsTab"), "click", () => { qs("uploadWrapper").classList.add("hidden"); qs("userListings").classList.remove("hidden"); });

// Calc
on(qs("calcTreesBtn"), "click", () => {
    const res = (qs("treeCount").value * qs("treeType").value * qs("treeYears").value)/1000;
    qs("calcResult").classList.remove("hidden");
    qs("totalCredits").textContent = res.toFixed(2) + " Tons";
});

