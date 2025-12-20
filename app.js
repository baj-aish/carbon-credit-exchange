// app.js
const qs = id => document.getElementById(id);
const qsa = sel => [...document.querySelectorAll(sel)];
const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

// ⚠️ CHANGE THIS TO YOUR RENDER URL
const API_BASE = "https://carbon-credit-exchange-backend.onrender.com"; 

const SESSION_KEY = "ccx_session_v2";
const LAST_SECTION_KEY = "ccx_last_section_v2";
const PROTECTED_SECTIONS = ["feed", "upload", "calculator", "admin", "inbox"];

// State
let state = { users: [], posts: [], currentUser: null };
let editPostId = null;
let currentChatPostId = null;

// --- UTILS ---
const showSection = name => {
  qsa(".section").forEach(s => s.classList.add("hidden"));
  const sec = qs("section-" + name);
  if (sec) sec.classList.remove("hidden");
  localStorage.setItem(LAST_SECTION_KEY, name);
  
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
    
    // Greeting
    qs("welcomeName").textContent = u.name;
    qs("welcomeWrapper").classList.remove("hidden");
    
    qsa(".protected-nav").forEach(b => b.classList.remove("hidden"));
    if (u.role === "admin") qs("adminTab").classList.remove("hidden");
    else qs("adminTab").classList.add("hidden");
    qs("feedFilters").classList.remove("hidden");
  } else {
    qs("loginBtn").classList.remove("hidden");
    qs("logoutBtn").classList.add("hidden");
    qs("userBadge").classList.add("hidden");
    qs("heroLoginBtn").classList.remove("hidden");
    qs("welcomeWrapper").classList.add("hidden");
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

// --- DATA FETCHING ---
const fetchData = async () => {
  try {
    // 1. Get Posts
    const res = await fetch(API_BASE + "/api/posts");
    if(res.ok) state.posts = await res.json();
    else console.log("Post fetch error:", res.status);

    // 2. Get Users (Only if admin)
    if(state.currentUser?.role === 'admin') {
       const uRes = await fetch(API_BASE + "/api/users");
       if(uRes.ok) state.users = await uRes.json();
       renderAdmin();
    }
    
    renderFeed();
    renderInbox();
    
    // Update active chat
    if (!qs("chatModal").classList.contains("hidden") && currentChatPostId) {
        const p = state.posts.find(x => x.id == currentChatPostId);
        if(p) renderChatMessages(p);
    }
  } catch (err) { console.error("Fetch Loop Error:", err); }
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

  try {
    const res = await fetch(API_BASE + "/api/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }) 
    });
    // Check Content-Type to avoid "<" JSON error
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server error (Check console)");
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login Failed");

    state.currentUser = data;
    saveSession();
    updateAuthUI();
    qs("loginModal").classList.add("hidden");
    showSection("feed"); // Redirect to marketplace
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
    
    // Edit Mode
    if(editPostId) {
        url += "/" + editPostId;
        method = "PUT";
        if(!img) delete payload.image; // Don't overwrite if no new image
    } else if(!img) return alert("Image required for new listing");

    const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if(res.ok) {
        alert("Saved!");
        qs("uploadForm").reset();
        editPostId = null;
        qs("uploadFormBtn").textContent = "Upload Listing";
        fetchData();
        qs("yourListingsTab").click();
    } else {
        alert("Upload failed. Image might be too large.");
    }
  };

  if(file) {
    if(file.size > 100 * 1024) return alert("Image too large (Max 100KB)");
    const r = new FileReader();
    r.onload = ev => process(ev.target.result);
    r.readAsDataURL(file);
  } else process(null);
});

// --- RENDERERS ---
const renderFeed = () => {
    const con = qs("feedContainer");
    if(!state.posts.length) return con.innerHTML = "";
    
    // Sort logic
    let arr = state.posts.filter(p => p.status !== 'removed');
    const pf = qs("priceFilter").value;
    if (pf === "low-high") arr.sort((a,b) => a.price - b.price);
    if (pf === "high-low") arr.sort((a,b) => b.price - a.price);

    con.innerHTML = arr.map(p => `
      <div class="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow flex flex-col">
        <img src="${p.image}" class="w-full h-44 object-cover">
        <div class="p-3 flex flex-col flex-1">
          <h3 class="font-bold text-sm truncate">${p.title}</h3>
          <p class="text-xs text-slate-400 mb-2 truncate">${p.desc}</p>
          <div class="flex justify-between text-[11px] mb-2">
             <span class="text-emerald-300 bg-emerald-900/30 px-2 py-0.5 rounded-full">${p.credits} Credits</span>
             <span class="text-white font-bold">₹${p.price}</span>
          </div>
          <p class="text-[10px] text-slate-500 mb-2">By ${p.user}</p>
          <div class="mt-auto flex justify-between gap-2">
             <button onclick="window.likePost('${p.id}')" class="flex-1 py-1 bg-slate-800 text-xs rounded border border-slate-600">❤️ ${p.likes||0}</button>
             <button onclick="window.openChat('${p.id}')" class="flex-1 py-1 bg-slate-800 text-xs rounded border border-slate-600">💬 Chat</button>
          </div>
        </div>
      </div>
    `).join("");
    
    // Also render "Your Listings" if active
    if(!qs("userListings").classList.contains("hidden")) {
        const myPosts = state.posts.filter(p => p.user === state.currentUser?.name);
        qs("userListings").innerHTML = myPosts.map(p => `
            <div class="bg-slate-900 p-2 border border-slate-700 rounded mb-2 flex justify-between text-xs items-center">
                <span>${p.title}</span>
                <button class="text-emerald-400 underline" onclick="window.editPost('${p.id}')">Edit</button>
            </div>
        `).join("");
    }
};

const renderInbox = () => {
    const list = qs("inboxList");
    if(!state.currentUser) return;
    // Find posts where I am the owner OR I have sent a message
    const items = state.posts.filter(p => 
        p.chatMessages?.length && (p.user === state.currentUser.name || p.chatMessages.some(m => m.from === state.currentUser.name))
    );
    
    list.innerHTML = items.length ? items.map(p => {
        const last = p.chatMessages[p.chatMessages.length-1];
        return `<div onclick="window.openChat('${p.id}')" class="bg-slate-900 p-3 rounded-lg border border-slate-700 cursor-pointer flex justify-between items-center hover:bg-slate-800">
            <div>
               <div class="text-sm font-bold text-emerald-100">${p.title}</div>
               <div class="text-xs text-slate-400">Last: ${last.from}</div>
            </div>
            <div class="text-xs text-emerald-500">Open</div>
        </div>`
    }).join("") : `<p class="text-slate-400 text-sm">No messages yet.</p>`;
};

const renderAdmin = () => {
    if(state.currentUser?.role !== 'admin') return;
    
    const uHtml = state.users.map(u => `
        <tr class="text-xs border-b border-slate-700">
            <td class="p-2">${u.name}</td>
            <td class="p-2">${u.role}</td>
            <td class="p-2 text-right"><button onclick="window.deleteUser('${u.id}')" class="text-red-400 hover:text-red-300">Delete</button></td>
        </tr>
    `).join("");

    const pHtml = state.posts.map(p => `
        <div class="flex justify-between items-center bg-slate-900 p-2 text-xs border border-slate-700 rounded mb-1">
            <span>${p.title} (by ${p.user})</span>
            <button onclick="window.deletePost('${p.id}')" class="text-red-400 hover:text-red-300">Delete</button>
        </div>
    `).join("");

    qs("adminList").innerHTML = `
      <div class="mb-4">
        <h3 class="font-bold text-sm mb-2 text-emerald-400">Users</h3>
        <table class="w-full text-left">${uHtml}</table>
      </div>
      <div>
        <h3 class="font-bold text-sm mb-2 text-emerald-400">Posts</h3>
        ${pHtml}
      </div>
    `;
};

// --- CHAT & ACTIONS (Exposed to Window for HTML onclick) ---
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
        const isMe = state.currentUser && m.from === state.currentUser.name;
        return `<div class="flex ${isMe?'justify-end':'justify-start'}"><div class="px-2 py-1 rounded mb-1 text-xs max-w-[80%] ${isMe?'bg-emerald-600 text-white':'bg-slate-800 text-slate-300'}">
            <div class="font-bold opacity-50 text-[9px] mb-0.5">${m.from}</div>
            ${m.text}
        </div></div>`;
    }).join("");
    box.scrollTop = box.scrollHeight;
};

on(qs("chatForm"), "submit", async e => {
    e.preventDefault();
    const text = qs("chatInput").value.trim();
    if(!text) return;
    await fetch(API_BASE + `/api/posts/${currentChatPostId}/chat`, {
        method: "POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ from: state.currentUser.name, text })
    });
    qs("chatInput").value = "";
    fetchData(); // Instant update
});

// Like / Edit / Delete Handlers
window.likePost = async (id) => {
    if(!requireLogin()) return;
    const p = state.posts.find(x => x.id == id);
    if(!p) return;
    
    // Optimistic UI update
    p.likes = (p.likes || 0) + 1;
    renderFeed();
    
    await fetch(API_BASE + `/api/posts/${id}`, {
        method: "PUT", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ likes: p.likes })
    });
};

window.editPost = (id) => {
    const p = state.posts.find(x => x.id == id);
    if(!p) return;
    editPostId = id;
    qs("postTitle").value = p.title;
    qs("postDesc").value = p.desc;
    qs("postPrice").value = p.price;
    qs("postCredits").value = p.credits;
    qs("uploadFormBtn").textContent = "Update Listing";
    qs("createListingTab").click();
};

window.deleteUser = async (id) => {
    if(!confirm("Delete user?")) return;
    await fetch(API_BASE + `/api/users/${id}`, { method: "DELETE" });
    fetchData();
};
window.deletePost = async (id) => {
    if(!confirm("Delete post?")) return;
    await fetch(API_BASE + `/api/posts/${id}`, { method: "DELETE" });
    fetchData();
};

// --- INIT ---
const saved = localStorage.getItem(SESSION_KEY);
if(saved) state.currentUser = JSON.parse(saved);
const lastSec = localStorage.getItem(LAST_SECTION_KEY);

updateAuthUI();
if(state.currentUser && lastSec) showSection(lastSec);
else showSection("landing");

fetchData();
setInterval(fetchData, 3000); // Poll every 3 seconds

// UI Event Listeners
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
on(qs("tabRegister"), "click", () => { qs("registerForm").classList.remove("hidden"); qs("loginForm").classList.add("hidden"); qs("tabRegister").classList.replace("bg-slate-900","bg-slate-800"); qs("tabLogin").classList.replace("bg-slate-800","bg-slate-900"); });
on(qs("tabLogin"), "click", () => { qs("loginForm").classList.remove("hidden"); qs("registerForm").classList.add("hidden"); qs("tabLogin").classList.replace("bg-slate-900","bg-slate-800"); qs("tabRegister").classList.replace("bg-slate-800","bg-slate-900");});

// Nav
qsa(".nav-btn").forEach(b => on(b, "click", () => {
    if(b.classList.contains("protected-nav") && !requireLogin()) return;
    showSection(b.dataset.section);
    if(b.dataset.section === 'upload') qs("yourListingsTab").click();
}));
on(qs("createListingTab"), "click", () => { qs("uploadWrapper").classList.remove("hidden"); qs("userListings").classList.add("hidden"); qs("createListingTab").classList.add("text-white","bg-slate-800"); qs("yourListingsTab").classList.remove("text-white","bg-slate-800"); });
on(qs("yourListingsTab"), "click", () => { qs("uploadWrapper").classList.add("hidden"); qs("userListings").classList.remove("hidden"); qs("yourListingsTab").classList.add("text-white","bg-slate-800"); qs("createListingTab").classList.remove("text-white","bg-slate-800"); });

// Calculator

// [NEW] Logic to switch between Tree and Land forms
qsa('input[name="calcMethod"]').forEach(r =>
  on(r, "change", () => {
    const v = document.querySelector('input[name="calcMethod"]:checked').value;
    qs("treeForm").classList.toggle("hidden", v !== "trees");
    qs("landForm").classList.toggle("hidden", v !== "land");
    qs("calcResult").classList.add("hidden");
  })
);
on(qs("calcTreesBtn"), "click", () => {
    const res = (qs("treeCount").value * qs("treeType").value * qs("treeYears").value)/1000;
    qs("calcResult").classList.remove("hidden");
    qs("totalCredits").textContent = res.toFixed(2) + " Tons CO2";
});
on(qs("calcLandBtn"), "click", () => {
    // Simple land formula (placeholder logic based on request)
    const factor = qs("landUnit").value === 'hectares' ? 6 : 2.4; 
    const res = qs("landArea").value * factor * qs("landYears").value;
    qs("calcResult").classList.remove("hidden");
    qs("totalCredits").textContent = res.toFixed(2) + " Tons CO2";
});
on(qs("priceFilter"), "change", renderFeed);
on(qs("gotoCalcLink"), "click", () => showSection("calculator"));

