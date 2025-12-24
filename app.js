// app.js - Serverless Version

// 1. IMPORT FIREBASE SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, getDoc, doc, updateDoc, arrayUnion, query, orderBy, onSnapshot, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔴 2. PASTE YOUR CONFIG HERE (From Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyAAfBZtKGSWsC7WH90i0Xd9487CEtduuX0",
  authDomain: "carbon-credit-f6e72.firebaseapp.com",
  projectId: "carbon-credit-f6e72",
  storageBucket: "carbon-credit-f6e72.firebasestorage.app",
  messagingSenderId: "26922591570",
  appId: "1:26922591570:web:cb0c8d76e0695fcd29c68b",
  measurementId: "G-QBM9MF9T54"
};

// 3. INITIALIZE
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- HELPERS & CONSTANTS ---
const qs = id => document.getElementById(id);
const qsa = sel => [...document.querySelectorAll(sel)];
const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

const LAST_SECTION_KEY = "ccx_last_section_v3";
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
    if(qs("welcomeName")) {
        qs("welcomeName").textContent = u.name;
        qs("welcomeLine").classList.remove("hidden");
    }
    
    qsa(".protected-nav").forEach(b => b.classList.remove("hidden"));
    if (u.role === "admin") qs("adminTab").classList.remove("hidden");
    else qs("adminTab").classList.add("hidden");
    if(qs("feedFilters")) qs("feedFilters").classList.remove("hidden");
  } else {
    qs("loginBtn").classList.remove("hidden");
    qs("logoutBtn").classList.add("hidden");
    qs("userBadge").classList.add("hidden");
    qs("heroLoginBtn").classList.remove("hidden");
    if(qs("welcomeLine")) qs("welcomeLine").classList.add("hidden");
    qs("adminTab").classList.add("hidden");
    if(qs("feedFilters")) qs("feedFilters").classList.add("hidden");
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

// --- DATA LISTENERS (Real-time!) ---
const startListeners = () => {
    // Listen to Posts
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    onSnapshot(q, (snapshot) => {
        state.posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderFeed(); // Updates Main Feed AND User Listings if visible
        renderInbox();
        
        // Update active chat if open
        if (!qs("chatModal").classList.contains("hidden") && currentChatPostId) {
            const p = state.posts.find(x => x.id == currentChatPostId);
            if(p) renderChatMessages(p);
        }
    });

    // Listen to Users (and sync current user state)
    onSnapshot(collection(db, "users"), (snapshot) => {
        state.users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Auto-sync current user if logged in
        if (auth.currentUser) {
            const me = state.users.find(u => u.id === auth.currentUser.uid);
            if (me) {
                state.currentUser = me;
                updateAuthUI();
            }
        }

        if(state.currentUser?.role === 'admin') renderAdmin();
    });
};

// --- AUTH HANDLERS ---
on(qs("registerForm"), "submit", async e => {
  e.preventDefault();
  const name = qs("regName").value;
  const email = qs("regEmail").value;
  const password = qs("regPass").value;
  const requestedRole = qs("regRole").value;

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCred.user;
    
    // Secure Role Check
    const role = (name.toLowerCase() === "bajaish" && requestedRole === "admin") ? "admin" : "user";

    // Save to Firestore
    await setDoc(doc(db, "users", user.uid), {
        id: user.uid,
        name: name,
        email: email,
        role: role,
        createdAt: Date.now()
    });

    alert("Registered! Please login.");
    qs("tabLogin").click();
  } catch (err) { alert(err.message); }
});

on(qs("loginForm"), "submit", async e => {
  e.preventDefault();
  const name = qs("loginName").value; // Used for lookup in this app
  const password = qs("loginPass").value;

  try {
    // 1. Find email by username
    const usersRef = collection(db, "users");
    const snap = await getDocs(usersRef);
    const userDoc = snap.docs.find(d => d.data().name === name);

    if (!userDoc) throw new Error("Username not found. Please register.");
    
    const email = userDoc.data().email;

    // 2. Sign In
    await signInWithEmailAndPassword(auth, email, password);
    
    qs("loginModal").classList.add("hidden");
    showSection("feed");
  } catch (err) { alert(err.message); }
});

// Handle Auth State Changes (FIXED: Immediate Fetch)
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Fast path: Fetch user doc immediately so UI updates instantly
        const docRef = doc(db, "users", user.uid);
        const snapshot = await getDoc(docRef);
        
        if (snapshot.exists()) {
            state.currentUser = { id: snapshot.id, ...snapshot.data() };
            updateAuthUI();
            renderFeed(); // Re-render to show "Created by you" correctly
        }
    } else {
        state.currentUser = null;
        updateAuthUI();
        renderFeed();
    }
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
    const payload = { 
        title, desc, price, credits, 
        user: state.currentUser.name, 
        image: img,
        createdAt: Date.now(),
        chatMessages: [],
        status: "active"
    };
    
    if(editPostId) {
        if(!img) delete payload.image; 
        const ref = doc(db, "posts", editPostId);
        await updateDoc(ref, payload);
        alert("Updated!");
    } else {
        if(!img) return alert("Image required");
        await addDoc(collection(db, "posts"), payload);
        alert("Posted!");
    }
    
    qs("uploadForm").reset();
    editPostId = null;
    qs("uploadFormBtn").textContent = "Upload Listing";
    qs("yourListingsTab").click();
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
    
    let arr = state.posts.filter(p => p.status !== 'removed');
    const pf = qs("priceFilter").value;
    if (pf === "low-high") arr.sort((a,b) => a.price - b.price);
    if (pf === "high-low") arr.sort((a,b) => b.price - a.price);

    con.innerHTML = arr.map(p => {
      const isMine = state.currentUser && p.user === state.currentUser.name;
      const timeStr = new Date(p.createdAt).toLocaleDateString() + " " + new Date(p.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      const badge = isMine 
        ? `<span class="bg-emerald-500 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded ml-2">CREATED BY YOU</span>` 
        : '';

      const myName = state.currentUser?.name;
      const hasUnread = p.chatMessages?.some(m => m.from !== myName && !m.seen);

      return `
      <div class="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow flex flex-col">
        <img src="${p.image}" class="w-full h-44 object-cover">
        <div class="p-3 flex flex-col flex-1">
          <div class="flex justify-between items-start mb-1">
             <h3 class="font-bold text-sm truncate flex-1">${p.title}</h3>
             ${badge}
          </div>
          <p class="text-[10px] text-slate-500 mb-2">
             By ${p.user} • ${timeStr}
          </p>
          <p class="text-xs text-slate-400 mb-2 truncate">${p.desc}</p>
          <div class="flex justify-between text-[11px] mb-2">
             <span class="text-emerald-300 bg-emerald-900/30 px-2 py-0.5 rounded-full">${p.credits} Credits</span>
             <span class="text-white font-bold">₹${p.price}</span>
          </div>
          <div class="mt-auto">
             <button onclick="window.openChat('${p.id}')" class="w-full py-2 bg-slate-800 text-xs rounded border border-slate-600 relative hover:bg-slate-700">
                💬 Chat
                ${ hasUnread ? '<span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900"></span>' : '' }
             </button>
          </div>
        </div>
      </div>
    `}).join("");
    
    // User Listings (FIXED: Handles filtering correctly)
    if(!qs("userListings").classList.contains("hidden")) {
        const myPosts = state.posts.filter(p => p.user === state.currentUser?.name);
        
        if (myPosts.length === 0) {
            qs("userListings").innerHTML = '<p class="text-slate-400 text-xs">No listings found.</p>';
        } else {
            qs("userListings").innerHTML = myPosts.map(p => `
                <div class="bg-slate-900 p-2 border border-slate-700 rounded mb-2 flex justify-between text-xs items-center">
                    <span>${p.title}</span>
                    <button class="text-emerald-400 underline" onclick="window.editPost('${p.id}')">Edit</button>
                </div>
            `).join("");
        }
    }
};

const renderInbox = () => {
    const list = qs("inboxList");
    if(!state.currentUser) return;
    
    const items = state.posts.filter(p => 
        p.chatMessages?.length && (p.user === state.currentUser.name || p.chatMessages.some(m => m.from === state.currentUser.name))
    );
    
    const totalUnread = items.reduce((acc, p) => acc + p.chatMessages.filter(m => m.from !== state.currentUser.name && !m.seen).length, 0);
    const ind = qs("inboxIndicator");
    if(ind) {
        if(totalUnread > 0) ind.classList.remove("hidden");
        else ind.classList.add("hidden");
    }

    list.innerHTML = items.length ? items.map(p => {
        const last = p.chatMessages[p.chatMessages.length-1];
        const unreadCount = p.chatMessages.filter(m => m.from !== state.currentUser.name && !m.seen).length;
        
        return `<div onclick="window.openChat('${p.id}')" class="bg-slate-900 p-3 rounded-lg border border-slate-700 cursor-pointer flex justify-between items-center hover:bg-slate-800">
            <div>
               <div class="text-sm font-bold text-emerald-100 flex items-center gap-2">
                 ${p.title} 
                 ${unreadCount > 0 ? `<span class="bg-red-500 text-white text-[9px] px-1.5 rounded-full">${unreadCount}</span>` : ''}
               </div>
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
            <td class="p-2 text-right"><button onclick="window.deleteUser('${u.id}')" class="text-red-400 hover:text-red-300">Remove</button></td>
        </tr>
    `).join("");

    const pHtml = state.posts.map(p => `
        <div class="flex justify-between items-center bg-slate-900 p-2 text-xs border border-slate-700 rounded mb-1">
            <div class="flex flex-col">
                <span class="font-bold">${p.title}</span>
                <span class="text-[10px] text-slate-400">By ${p.user} • ${p.chatMessages?.length || 0} msgs</span>
            </div>
            <div class="flex gap-2">
                <button onclick="window.viewAdminChat('${p.id}')" class="text-blue-400 hover:text-blue-300">View Chat</button>
                <button onclick="window.deletePost('${p.id}')" class="text-red-400 hover:text-red-300">Delete</button>
            </div>
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

// --- CHAT & ACTIONS ---
window.openChat = async (pid) => {
    if(!requireLogin()) return;
    const p = state.posts.find(x => x.id == pid);
    if(!p) return;
    
    currentChatPostId = pid;
    qs("chatModal").classList.remove("hidden");
    qs("chatPostTitle").textContent = p.title;
    qs("chatForm").classList.remove("hidden"); 

    renderChatMessages(p);
    
    // Mark as seen locally and in DB
    const msgs = p.chatMessages || [];
    let needsUpdate = false;
    const updated = msgs.map(m => {
        if(m.from !== state.currentUser.name && !m.seen) {
            needsUpdate = true;
            return {...m, seen: true};
        }
        return m;
    });
    
    if(needsUpdate) {
        await updateDoc(doc(db, "posts", pid), { chatMessages: updated });
    }
};

window.viewAdminChat = (pid) => {
    const p = state.posts.find(x => x.id == pid);
    if(!p) return;
    currentChatPostId = null;
    qs("chatModal").classList.remove("hidden");
    qs("chatPostTitle").textContent = `Admin View: ${p.title}`;
    qs("chatForm").classList.add("hidden"); 
    renderChatMessages(p);
};

const renderChatMessages = (p) => {
    const box = qs("chatMessages");
    box.innerHTML = (p.chatMessages||[]).map(m => {
        const isMe = state.currentUser && m.from === state.currentUser.name;
        return `<div class="flex ${isMe?'justify-end':'justify-start'}"><div class="px-2 py-1 rounded mb-1 text-xs max-w-[80%] ${isMe?'bg-emerald-600 text-white':'bg-slate-800 text-slate-300'}">
            <div class="font-bold opacity-50 text-[9px] mb-0.5">${m.from}</div>
            ${m.text}
            <div class="text-[9px] opacity-60 text-right">${isMe && m.seen ? 'Seen' : ''}</div>
        </div></div>`;
    }).join("");
    box.scrollTop = box.scrollHeight;
};

on(qs("chatForm"), "submit", async e => {
    e.preventDefault();
    const text = qs("chatInput").value.trim();
    if(!text) return;
    
    const msg = {
        from: state.currentUser.name,
        text,
        time: Date.now(),
        seen: false
    };
    
    await updateDoc(doc(db, "posts", currentChatPostId), {
        chatMessages: arrayUnion(msg)
    });
    
    qs("chatInput").value = "";
});

// Edit / Delete Handlers
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
    if(!confirm("Delete user? (Auth login will remain, DB record removed)")) return;
    await deleteDoc(doc(db, "users", id));
};
window.deletePost = async (id) => {
    if(!confirm("Delete post?")) return;
    await deleteDoc(doc(db, "posts", id));
};

// --- INIT ---
const lastSec = localStorage.getItem(LAST_SECTION_KEY);
startListeners(); // Start realtime listeners
if(lastSec) showSection(lastSec);
else showSection("landing");

// UI Listeners
on(qs("loginBtn"), "click", () => qs("loginModal").classList.remove("hidden"));
on(qs("closeLogin"), "click", () => qs("loginModal").classList.add("hidden"));
on(qs("closeChat"), "click", () => qs("chatModal").classList.add("hidden"));
on(qs("logoutBtn"), "click", () => {
    signOut(auth);
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
    if(b.dataset.section === 'upload') qs
