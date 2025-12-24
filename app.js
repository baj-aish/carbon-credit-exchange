// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
// import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
// import { getFirestore, collection, addDoc, getDocs, getDoc, doc, updateDoc, arrayUnion, query, orderBy, onSnapshot, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// // 🔴 CONFIG
// const firebaseConfig = {
//   apiKey: "AIzaSyAAfBZtKGSWsC7WH90i0Xd9487CEtduuX0",
//   authDomain: "carbon-credit-f6e72.firebaseapp.com",
//   projectId: "carbon-credit-f6e72",
//   storageBucket: "carbon-credit-f6e72.firebasestorage.app",
//   messagingSenderId: "26922591570",
//   appId: "1:26922591570:web:cb0c8d76e0695fcd29c68b",
//   measurementId: "G-QBM9MF9T54"
// };

// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const db = getFirestore(app);

// // --- HELPERS ---
// const qs = id => document.getElementById(id);
// const qsa = sel => [...document.querySelectorAll(sel)];
// const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

// // Safe Toggle: Prevents "Cannot read properties of null" error
// const safeToggle = (id, action) => {
//     const el = qs(id);
//     if (!el) return; // Skip if element not found
//     if (action === "show") el.classList.remove("hidden");
//     if (action === "hide") el.classList.add("hidden");
// };

// const LAST_SECTION_KEY = "ccx_last_section_v3";
// const PROTECTED_SECTIONS = ["feed", "upload", "calculator", "admin", "inbox"];

// let state = { users: [], posts: [], currentUser: null };
// let editPostId = null;
// let currentChatPostId = null;

// // --- UTILS ---
// const showSection = name => {
//   qsa(".section").forEach(s => s.classList.add("hidden"));
//   const sec = qs("section-" + name);
//   if (sec) sec.classList.remove("hidden");
//   localStorage.setItem(LAST_SECTION_KEY, name);
  
//   qsa(".nav-btn").forEach(btn => {
//     const isActive = btn.dataset.section === name;
//     btn.classList.toggle("border-b-emerald-400", isActive);
//     btn.classList.toggle("text-white", isActive);
//   });
// };

// const updateAuthUI = () => {
//   const u = state.currentUser;
  
//   if (u) {
//     safeToggle("loginBtn", "hide");
//     safeToggle("logoutBtn", "show");
//     safeToggle("userBadge", "show");
    
//     const nameEl = qs("badgeName");
//     const roleEl = qs("badgeRole");
//     if(nameEl) nameEl.textContent = u.name;
//     if(roleEl) roleEl.textContent = u.role;
    
//     safeToggle("heroLoginBtn", "hide");
//     safeToggle("welcomeWrapper", "show");
    
//     const welcomeName = qs("welcomeName");
//     if(welcomeName) welcomeName.textContent = u.name;
    
//     qsa(".protected-nav").forEach(b => b.classList.remove("hidden"));
    
//     if (u.role === "admin") safeToggle("adminTab", "show");
//     else safeToggle("adminTab", "hide");
    
//     safeToggle("feedFilters", "show");
//   } else {
//     safeToggle("loginBtn", "show");
//     safeToggle("logoutBtn", "hide");
//     safeToggle("userBadge", "hide");
//     safeToggle("heroLoginBtn", "show");
//     safeToggle("welcomeWrapper", "hide");
//     safeToggle("adminTab", "hide");
//     safeToggle("feedFilters", "hide");
//     qsa(".protected-nav").forEach(b => b.classList.add("hidden"));
//   }
// };

// const requireLogin = () => {
//   if (!state.currentUser) {
//     alert("Please login first.");
//     safeToggle("loginModal", "show");
//     return false;
//   }
//   return true;
// };

// // --- DATA LISTENERS ---
// const startListeners = () => {
//     const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
//     onSnapshot(q, (snapshot) => {
//         state.posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//         renderFeed(); 
//         renderInbox(); // Update inbox whenever posts/chats update
        
//         if (!qs("chatModal").classList.contains("hidden") && currentChatPostId) {
//             const p = state.posts.find(x => x.id == currentChatPostId);
//             if(p) renderChatMessages(p);
//         }
//     });

//     onSnapshot(collection(db, "users"), (snapshot) => {
//         state.users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
//         if (auth.currentUser) {
//             const me = state.users.find(u => u.id === auth.currentUser.uid);
//             if (me && JSON.stringify(state.currentUser) !== JSON.stringify(me)) {
//                 state.currentUser = me;
//                 updateAuthUI();
//                 renderFeed();
//                 renderInbox();
//             }
//         }
//         if(state.currentUser?.role === 'admin') renderAdmin();
//     });
// };

// // --- AUTH HANDLERS ---
// on(qs("registerForm"), "submit", async e => {
//   e.preventDefault();
//   const name = qs("regName").value;
//   const email = qs("regEmail").value;
//   const password = qs("regPass").value;
  
//   // Use a default role if dropdown is missing/null, otherwise normalize
//   let role = "user";
//   const roleEl = qs("regRole");
//   if(roleEl) {
//       const val = roleEl.value;
//       if (name.toLowerCase() === "bajaish" && val === "admin") role = "admin";
//   }

//   try {
//     const userCred = await createUserWithEmailAndPassword(auth, email, password);
//     const user = userCred.user;

//     await setDoc(doc(db, "users", user.uid), {
//         id: user.uid,
//         name: name,
//         email: email,
//         role: role,
//         createdAt: Date.now()
//     });

//     alert("Registered! Please login.");
//     qs("tabLogin").click();
//   } catch (err) { alert(err.message); }
// });

// on(qs("loginForm"), "submit", async e => {
//   e.preventDefault();
//   const name = qs("loginName").value; 
//   const password = qs("loginPass").value;

//   try {
//     const usersRef = collection(db, "users");
//     const snap = await getDocs(usersRef);
//     const userDoc = snap.docs.find(d => d.data().name === name);

//     if (!userDoc) throw new Error("Username not found. Please register.");
    
//     const userData = userDoc.data();
//     await signInWithEmailAndPassword(auth, userData.email, password);
    
//     state.currentUser = { id: userDoc.id, ...userData };
//     updateAuthUI();
//     renderFeed();
//     renderInbox(); // Force update inbox on login

//     safeToggle("loginModal", "hide");
//     showSection("feed");
//   } catch (err) { alert(err.message); }
// });

// onAuthStateChanged(auth, async (user) => {
//     if (user) {
//         if (!state.currentUser) {
//             const docRef = doc(db, "users", user.uid);
//             const snapshot = await getDoc(docRef);
//             if (snapshot.exists()) {
//                 state.currentUser = { id: snapshot.id, ...snapshot.data() };
//                 updateAuthUI();
//                 renderFeed();
//                 renderInbox();
//             }
//         }
//     } else {
//         state.currentUser = null;
//         updateAuthUI();
//         renderFeed();
//         renderInbox();
//     }
// });

// // --- RENDERERS ---
// const renderFeed = () => {
//     const con = qs("feedContainer");
//     if(!state.posts.length) return con.innerHTML = "";
    
//     let arr = state.posts.filter(p => p.status !== 'removed');
//     const pf = qs("priceFilter")?.value || "none";
//     if (pf === "low-high") arr.sort((a,b) => a.price - b.price);
//     if (pf === "high-low") arr.sort((a,b) => b.price - a.price);

//     con.innerHTML = arr.map(p => {
//       const isMine = state.currentUser && p.user === state.currentUser.name;
//       const timeStr = new Date(p.createdAt).toLocaleDateString();
//       const badge = isMine 
//         ? `<span class="bg-emerald-500 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded ml-2">CREATED BY YOU</span>` 
//         : '';

//       const myName = state.currentUser?.name;
//       const hasUnread = p.chatMessages?.some(m => m.from !== myName && !m.seen);

//       return `
//       <div class="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow flex flex-col">
//         <img src="${p.image}" class="w-full h-44 object-cover">
//         <div class="p-3 flex flex-col flex-1">
//           <div class="flex justify-between items-start mb-1">
//              <h3 class="font-bold text-sm truncate flex-1">${p.title}</h3>
//              ${badge}
//           </div>
//           <p class="text-[10px] text-slate-500 mb-2">By ${p.user} • ${timeStr}</p>
//           <p class="text-xs text-slate-400 mb-2 truncate">${p.desc}</p>
//           <div class="flex justify-between text-[11px] mb-2">
//              <span class="text-emerald-300 bg-emerald-900/30 px-2 py-0.5 rounded-full">${p.credits} Credits</span>
//              <span class="text-white font-bold">₹${p.price}</span>
//           </div>
//           <div class="mt-auto">
//              <button onclick="window.openChat('${p.id}')" class="w-full py-2 bg-slate-800 text-xs rounded border border-slate-600 relative hover:bg-slate-700">
//                 💬 Chat
//                 ${ hasUnread ? '<span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900"></span>' : '' }
//              </button>
//           </div>
//         </div>
//       </div>
//     `}).join("");
    
//     if(!qs("userListings").classList.contains("hidden")) {
//         const myName = state.currentUser ? state.currentUser.name : "";
//         const myPosts = state.posts.filter(p => p.user === myName);
        
//         if (myPosts.length === 0) {
//             qs("userListings").innerHTML = '<p class="text-slate-400 text-xs">No listings found.</p>';
//         } else {
//             qs("userListings").innerHTML = myPosts.map(p => `
//                 <div class="bg-slate-900 p-2 border border-slate-700 rounded mb-2 flex justify-between text-xs items-center">
//                     <span>${p.title}</span>
//                     <button class="text-emerald-400 underline" onclick="window.editPost('${p.id}')">Edit</button>
//                 </div>
//             `).join("");
//         }
//     }
// };

// const renderInbox = () => {
//     const list = qs("inboxList");
//     if(!list) return; // safety
    
//     if(!state.currentUser) {
//         list.innerHTML = `<p class="text-slate-400 text-sm">Please login.</p>`;
//         return;
//     }
    
//     const myName = state.currentUser.name;
//     // Show thread if: I am the owner OR I am a sender in the thread
//     const items = state.posts.filter(p => 
//         p.chatMessages?.length && (p.user === myName || p.chatMessages.some(m => m.from === myName))
//     );
    
//     // Sort by last message time
//     items.sort((a,b) => {
//         const lastA = a.chatMessages[a.chatMessages.length-1].time;
//         const lastB = b.chatMessages[b.chatMessages.length-1].time;
//         return lastB - lastA;
//     });

//     const totalUnread = items.reduce((acc, p) => acc + p.chatMessages.filter(m => m.from !== myName && !m.seen).length, 0);
//     const ind = qs("inboxIndicator");
//     if(ind) {
//         if(totalUnread > 0) ind.classList.remove("hidden");
//         else ind.classList.add("hidden");
//     }

//     if(items.length === 0) {
//         list.innerHTML = '<p class="text-slate-400 text-sm">No messages yet.</p>';
//         return;
//     }

//     list.innerHTML = items.map(p => {
//         const last = p.chatMessages[p.chatMessages.length-1];
//         const unreadCount = p.chatMessages.filter(m => m.from !== myName && !m.seen).length;
        
//         return `<div onclick="window.openChat('${p.id}')" class="bg-slate-900 p-3 rounded-lg border border-slate-700 cursor-pointer flex justify-between items-center hover:bg-slate-800">
//             <div>
//                <div class="text-sm font-bold text-emerald-100 flex items-center gap-2">
//                  ${p.title} 
//                  ${unreadCount > 0 ? `<span class="bg-red-500 text-white text-[9px] px-1.5 rounded-full">${unreadCount}</span>` : ''}
//                </div>
//                <div class="text-xs text-slate-400">Last: ${last.from}: ${last.text}</div>
//             </div>
//             <div class="text-xs text-emerald-500">Open</div>
//         </div>`
//     }).join("");
// };

// const renderAdmin = () => {
//     if(state.currentUser?.role !== 'admin') return;
    
//     const uHtml = state.users.map(u => `
//         <tr class="text-xs border-b border-slate-700">
//             <td class="p-2">${u.name}</td>
//             <td class="p-2">${u.role}</td>
//             <td class="p-2 text-right"><button onclick="window.deleteUser('${u.id}')" class="text-red-400 hover:text-red-300">Remove</button></td>
//         </tr>
//     `).join("");

//     const pHtml = state.posts.map(p => `
//         <div class="flex justify-between items-center bg-slate-900 p-2 text-xs border border-slate-700 rounded mb-1">
//             <div class="flex flex-col">
//                 <span class="font-bold">${p.title}</span>
//                 <span class="text-[10px] text-slate-400">By ${p.user} • ${p.chatMessages?.length || 0} msgs</span>
//             </div>
//             <div class="flex gap-2">
//                 <button onclick="window.viewAdminChat('${p.id}')" class="text-blue-400 hover:text-blue-300">View Chat</button>
//                 <button onclick="window.deletePost('${p.id}')" class="text-red-400 hover:text-red-300">Delete</button>
//             </div>
//         </div>
//     `).join("");

//     qs("adminList").innerHTML = `
//       <div class="mb-4">
//         <h3 class="font-bold text-sm mb-2 text-emerald-400">Users</h3>
//         <table class="w-full text-left">${uHtml}</table>
//       </div>
//       <div>
//         <h3 class="font-bold text-sm mb-2 text-emerald-400">Posts</h3>
//         ${pHtml}
//       </div>
//     `;
// };

// // --- CHAT & ACTIONS ---
// window.openChat = async (pid) => {
//     if(!requireLogin()) return;
//     const p = state.posts.find(x => x.id == pid);
//     if(!p) return;
    
//     currentChatPostId = pid;
//     safeToggle("chatModal", "show");
//     const titleEl = qs("chatPostTitle");
//     if(titleEl) titleEl.textContent = p.title;
//     safeToggle("chatForm", "show");

//     renderChatMessages(p);
    
//     // Mark as seen locally and in DB
//     const msgs = p.chatMessages || [];
//     let needsUpdate = false;
//     const updated = msgs.map(m => {
//         if(m.from !== state.currentUser.name && !m.seen) {
//             needsUpdate = true;
//             return {...m, seen: true};
//         }
//         return m;
//     });
    
//     if(needsUpdate) {
//         await updateDoc(doc(db, "posts", pid), { chatMessages: updated });
//     }
// };

// window.viewAdminChat = (pid) => {
//     const p = state.posts.find(x => x.id == pid);
//     if(!p) return;
//     currentChatPostId = null;
//     safeToggle("chatModal", "show");
//     qs("chatPostTitle").textContent = `Admin View: ${p.title}`;
//     safeToggle("chatForm", "hide");
//     renderChatMessages(p);
// };

// const renderChatMessages = (p) => {
//     const box = qs("chatMessages");
//     if(!box) return;
    
//     box.innerHTML = (p.chatMessages||[]).map(m => {
//         const isMe = state.currentUser && m.from === state.currentUser.name;
//         return `<div class="flex ${isMe?'justify-end':'justify-start'}"><div class="px-2 py-1 rounded mb-1 text-xs max-w-[80%] ${isMe?'bg-emerald-600 text-white':'bg-slate-800 text-slate-300'}">
//             <div class="font-bold opacity-50 text-[9px] mb-0.5">${m.from}</div>
//             ${m.text}
//             <div class="text-[9px] opacity-60 text-right">${isMe && m.seen ? 'Seen' : ''}</div>
//         </div></div>`;
//     }).join("");
//     box.scrollTop = box.scrollHeight;
// };

// on(qs("chatForm"), "submit", async e => {
//     e.preventDefault();
//     const text = qs("chatInput").value.trim();
//     if(!text) return;
    
//     const msg = {
//         from: state.currentUser.name,
//         text,
//         time: Date.now(),
//         seen: false
//     };
    
//     await updateDoc(doc(db, "posts", currentChatPostId), {
//         chatMessages: arrayUnion(msg)
//     });
    
//     qs("chatInput").value = "";
// });

// // Edit / Delete Handlers
// window.editPost = (id) => {
//     const p = state.posts.find(x => x.id == id);
//     if(!p) return;
//     editPostId = id;
//     qs("postTitle").value = p.title;
//     qs("postDesc").value = p.desc;
//     qs("postPrice").value = p.price;
//     qs("postCredits").value = p.credits;
//     qs("uploadFormBtn").textContent = "Update Listing";
//     qs("createListingTab").click();
// };

// window.deleteUser = async (id) => {
//     if(!confirm("Delete user?")) return;
//     await deleteDoc(doc(db, "users", id));
// };
// window.deletePost = async (id) => {
//     if(!confirm("Delete post?")) return;
//     await deleteDoc(doc(db, "posts", id));
// };

// // --- POSTS (UPLOAD) ---
// on(qs("uploadForm"), "submit", async e => {
//   e.preventDefault();
//   if(!requireLogin()) return;
  
//   const title = qs("postTitle").value;
//   const desc = qs("postDesc").value;
//   const price = Number(qs("postPrice").value);
//   const credits = Number(qs("postCredits").value);
//   const file = qs("postImage").files[0];
  
//   const process = async (img) => {
//     const payload = { 
//         title, desc, price, credits, 
//         user: state.currentUser.name, 
//         image: img,
//         createdAt: Date.now(),
//         chatMessages: [],
//         status: "active"
//     };
    
//     if(editPostId) {
//         if(!img) delete payload.image; 
//         const ref = doc(db, "posts", editPostId);
//         await updateDoc(ref, payload);
//         alert("Updated!");
//     } else {
//         if(!img) return alert("Image required");
//         await addDoc(collection(db, "posts"), payload);
//         alert("Posted!");
//     }
    
//     qs("uploadForm").reset();
//     editPostId = null;
//     qs("uploadFormBtn").textContent = "Upload Listing";
//     qs("yourListingsTab").click();
//   };

//   if(file) {
//     if(file.size > 100 * 1024) return alert("Image too large (Max 100KB)");
//     const r = new FileReader();
//     r.onload = ev => process(ev.target.result);
//     r.readAsDataURL(file);
//   } else process(null);
// });

// // --- INIT ---
// const lastSec = localStorage.getItem(LAST_SECTION_KEY);
// startListeners(); 
// if(lastSec) showSection(lastSec);
// else showSection("landing");

// // UI Listeners
// on(qs("loginBtn"), "click", () => safeToggle("loginModal", "show"));
// on(qs("closeLogin"), "click", () => safeToggle("loginModal", "hide"));
// on(qs("closeChat"), "click", () => safeToggle("chatModal", "hide"));
// on(qs("logoutBtn"), "click", () => {
//     signOut(auth);
//     showSection("landing");
// });
// on(qs("heroExploreBtn"), "click", () => { if(requireLogin()) showSection("feed"); });
// on(qs("heroLoginBtn"), "click", () => safeToggle("loginModal", "show"));

// // Tabs
// on(qs("tabRegister"), "click", () => { 
//     safeToggle("registerForm", "show"); 
//     safeToggle("loginForm", "hide"); 
//     // Stylistic toggle omitted for brevity but logic is sound
// });
// on(qs("tabLogin"), "click", () => { 
//     safeToggle("loginForm", "show"); 
//     safeToggle("registerForm", "hide"); 
// });

// // Nav
// qsa(".nav-btn").forEach(b => on(b, "click", () => {
//     if(b.classList.contains("protected-nav") && !requireLogin()) return;
//     showSection(b.dataset.section);
//     if(b.dataset.section === 'upload') qs("yourListingsTab").click();
// }));

// on(qs("createListingTab"), "click", () => { 
//     safeToggle("uploadWrapper", "show"); 
//     safeToggle("userListings", "hide"); 
//     qs("createListingTab").classList.add("text-white","bg-slate-800"); 
//     qs("createListingTab").classList.remove("text-slate-300");
//     qs("yourListingsTab").classList.remove("text-white","bg-slate-800"); 
//     qs("yourListingsTab").classList.add("text-slate-300");
// });

// on(qs("yourListingsTab"), "click", () => { 
//     safeToggle("uploadWrapper", "hide"); 
//     safeToggle("userListings", "show"); 
//     qs("yourListingsTab").classList.add("text-white","bg-slate-800"); 
//     qs("yourListingsTab").classList.remove("text-slate-300");
//     qs("createListingTab").classList.remove("text-white","bg-slate-800"); 
//     qs("createListingTab").classList.add("text-slate-300");
//     renderFeed(); // Re-render logic to filter user's posts
// });

// // Calculator
// qsa('input[name="calcMethod"]').forEach(r =>
//   on(r, "change", () => {
//     const v = document.querySelector('input[name="calcMethod"]:checked').value;
//     const treeForm = qs("treeForm");
//     const landForm = qs("landForm");
//     if(v === "trees") {
//         if(treeForm) treeForm.classList.remove("hidden");
//         if(landForm) landForm.classList.add("hidden");
//     } else {
//         if(treeForm) treeForm.classList.add("hidden");
//         if(landForm) landForm.classList.remove("hidden");
//     }
//     qs("calcResult").classList.add("hidden");
//   })
// );
// on(qs("calcTreesBtn"), "click", () => {
//     const res = (qs("treeCount").value * qs("treeType").value * qs("treeYears").value)/1000;
//     qs("calcResult").classList.remove("hidden");
//     qs("totalCredits").textContent = res.toFixed(2) + " Tons CO2";
// });
// on(qs("calcLandBtn"), "click", () => {
//     const factor = qs("landUnit").value === 'hectares' ? 6 : 2.4; 
//     const res = qs("landArea").value * factor * qs("landYears").value;
//     qs("calcResult").classList.remove("hidden");
//     qs("totalCredits").textContent = res.toFixed(2) + " Tons CO2";
// });
// on(qs("priceFilter"), "change", renderFeed);
// on(qs("gotoCalcLink"), "click", () => showSection("calculator"));

// app.js - Serverless Version (Fixed Filters & Highlights)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, getDoc, doc, updateDoc, arrayUnion, query, orderBy, onSnapshot, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔴 CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyAAfBZtKGSWsC7WH90i0Xd9487CEtduuX0",
  authDomain: "carbon-credit-f6e72.firebaseapp.com",
  projectId: "carbon-credit-f6e72",
  storageBucket: "carbon-credit-f6e72.firebasestorage.app",
  messagingSenderId: "26922591570",
  appId: "1:26922591570:web:cb0c8d76e0695fcd29c68b",
  measurementId: "G-QBM9MF9T54"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- HELPERS ---
const qs = id => document.getElementById(id);
const qsa = sel => [...document.querySelectorAll(sel)];
const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

// Safe Toggle
const safeToggle = (id, action) => {
    const el = qs(id);
    if (!el) return;
    if (action === "show") el.classList.remove("hidden");
    if (action === "hide") el.classList.add("hidden");
};

const LAST_SECTION_KEY = "ccx_last_section_v4"; // Updated version key
const PROTECTED_SECTIONS = ["feed", "upload", "calculator", "admin", "inbox"];

let state = { users: [], posts: [], currentUser: null };
let editPostId = null;
let currentChatPostId = null;

// --- UTILS (Fixed Highlighting) ---
const showSection = name => {
  qsa(".section").forEach(s => s.classList.add("hidden"));
  const sec = qs("section-" + name);
  if (sec) sec.classList.remove("hidden");
  localStorage.setItem(LAST_SECTION_KEY, name);
  
  // [FIX] Robust Button Highlighting (Background Color Change)
  qsa(".nav-btn").forEach(btn => {
    const isActive = btn.dataset.section === name;
    if (isActive) {
        btn.classList.remove("bg-slate-900", "text-slate-100", "border-b-transparent");
        btn.classList.add("bg-emerald-600", "text-white", "font-bold");
    } else {
        btn.classList.add("bg-slate-900", "text-slate-100", "border-b-transparent");
        btn.classList.remove("bg-emerald-600", "text-white", "font-bold");
    }
  });
};

const updateAuthUI = () => {
  const u = state.currentUser;
  
  if (u) {
    safeToggle("loginBtn", "hide");
    safeToggle("logoutBtn", "show");
    safeToggle("userBadge", "show");
    
    const nameEl = qs("badgeName");
    const roleEl = qs("badgeRole");
    if(nameEl) nameEl.textContent = u.name;
    if(roleEl) roleEl.textContent = u.role;
    
    safeToggle("heroLoginBtn", "hide");
    safeToggle("welcomeWrapper", "show");
    
    const welcomeName = qs("welcomeName");
    if(welcomeName) welcomeName.textContent = u.name;
    
    qsa(".protected-nav").forEach(b => b.classList.remove("hidden"));
    
    if (u.role === "admin") safeToggle("adminTab", "show");
    else safeToggle("adminTab", "hide");
    
    safeToggle("feedFilters", "show");
  } else {
    safeToggle("loginBtn", "show");
    safeToggle("logoutBtn", "hide");
    safeToggle("userBadge", "hide");
    safeToggle("heroLoginBtn", "show");
    safeToggle("welcomeWrapper", "hide");
    safeToggle("adminTab", "hide");
    safeToggle("feedFilters", "hide");
    qsa(".protected-nav").forEach(b => b.classList.add("hidden"));
  }
};

const requireLogin = () => {
  if (!state.currentUser) {
    alert("Please login first.");
    safeToggle("loginModal", "show");
    return false;
  }
  return true;
};

// --- DATA LISTENERS ---
const startListeners = () => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    onSnapshot(q, (snapshot) => {
        state.posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderFeed(); 
        renderInbox(); 
        
        if (!qs("chatModal").classList.contains("hidden") && currentChatPostId) {
            const p = state.posts.find(x => x.id == currentChatPostId);
            if(p) renderChatMessages(p);
        }
    });

    onSnapshot(collection(db, "users"), (snapshot) => {
        state.users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        if (auth.currentUser) {
            const me = state.users.find(u => u.id === auth.currentUser.uid);
            if (me && JSON.stringify(state.currentUser) !== JSON.stringify(me)) {
                state.currentUser = me;
                updateAuthUI();
                renderFeed();
                renderInbox();
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
  
  let role = "user";
  const roleEl = qs("regRole");
  if(roleEl) {
      const val = roleEl.value;
      if (name.toLowerCase() === "bajaish" && val === "admin") role = "admin";
  }

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCred.user;

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
  const name = qs("loginName").value; 
  const password = qs("loginPass").value;

  try {
    const usersRef = collection(db, "users");
    const snap = await getDocs(usersRef);
    const userDoc = snap.docs.find(d => d.data().name === name);

    if (!userDoc) throw new Error("Username not found. Please register.");
    
    const userData = userDoc.data();
    await signInWithEmailAndPassword(auth, userData.email, password);
    
    state.currentUser = { id: userDoc.id, ...userData };
    updateAuthUI();
    renderFeed();
    renderInbox(); 

    safeToggle("loginModal", "hide");
    showSection("feed");
  } catch (err) { alert(err.message); }
});

onAuthStateChanged(auth, async (user) => {
    if (user) {
        if (!state.currentUser) {
            const docRef = doc(db, "users", user.uid);
            const snapshot = await getDoc(docRef);
            if (snapshot.exists()) {
                state.currentUser = { id: snapshot.id, ...snapshot.data() };
                updateAuthUI();
                renderFeed();
                renderInbox();
            }
        }
    } else {
        state.currentUser = null;
        updateAuthUI();
        renderFeed();
        renderInbox();
    }
});

// --- RENDERERS (Fixed Filters) ---
const renderFeed = () => {
    const con = qs("feedContainer");
    if(!state.posts.length) return con.innerHTML = "";
    
    let arr = state.posts.filter(p => p.status !== 'removed');
    
    // [FIX] Price Filter
    const pf = qs("priceFilter")?.value || "none";
    if (pf === "low-high") arr.sort((a,b) => a.price - b.price);
    if (pf === "high-low") arr.sort((a,b) => b.price - a.price);

    // [FIX] Credit Filter Logic
    const cf = qs("creditsFilter")?.value || "all";
    if (cf === "1-10") arr = arr.filter(p => p.credits >= 1 && p.credits <= 10);
    if (cf === "50+") arr = arr.filter(p => p.credits >= 50);

    con.innerHTML = arr.map(p => {
      const isMine = state.currentUser && p.user === state.currentUser.name;
      const timeStr = new Date(p.createdAt).toLocaleDateString();
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
          <p class="text-[10px] text-slate-500 mb-2">By ${p.user} • ${timeStr}</p>
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
    
    if(!qs("userListings").classList.contains("hidden")) {
        const myName = state.currentUser ? state.currentUser.name : "";
        const myPosts = state.posts.filter(p => p.user === myName);
        
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
    if(!list) return; 
    
    if(!state.currentUser) {
        list.innerHTML = `<p class="text-slate-400 text-sm">Please login.</p>`;
        return;
    }
    
    const myName = state.currentUser.name;
    const items = state.posts.filter(p => 
        p.chatMessages?.length && (p.user === myName || p.chatMessages.some(m => m.from === myName))
    );
    
    // Sort Inbox by latest message
    items.sort((a,b) => {
        const lastA = a.chatMessages[a.chatMessages.length-1].time;
        const lastB = b.chatMessages[b.chatMessages.length-1].time;
        return lastB - lastA;
    });

    const totalUnread = items.reduce((acc, p) => acc + p.chatMessages.filter(m => m.from !== myName && !m.seen).length, 0);
    const ind = qs("inboxIndicator");
    if(ind) {
        if(totalUnread > 0) ind.classList.remove("hidden");
        else ind.classList.add("hidden");
    }

    if(items.length === 0) {
        list.innerHTML = '<p class="text-slate-400 text-sm">No messages yet.</p>';
        return;
    }

    list.innerHTML = items.map(p => {
        const last = p.chatMessages[p.chatMessages.length-1];
        const unreadCount = p.chatMessages.filter(m => m.from !== myName && !m.seen).length;
        
        return `<div onclick="window.openChat('${p.id}')" class="bg-slate-900 p-3 rounded-lg border border-slate-700 cursor-pointer flex justify-between items-center hover:bg-slate-800">
            <div>
               <div class="text-sm font-bold text-emerald-100 flex items-center gap-2">
                 ${p.title} 
                 ${unreadCount > 0 ? `<span class="bg-red-500 text-white text-[9px] px-1.5 rounded-full">${unreadCount}</span>` : ''}
               </div>
               <div class="text-xs text-slate-400">Last: ${last.from}: ${last.text}</div>
            </div>
            <div class="text-xs text-emerald-500">Open</div>
        </div>`
    }).join("");
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
    safeToggle("chatModal", "show");
    const titleEl = qs("chatPostTitle");
    if(titleEl) titleEl.textContent = p.title;
    safeToggle("chatForm", "show");

    renderChatMessages(p);
    
    // Mark as seen
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
    safeToggle("chatModal", "show");
    qs("chatPostTitle").textContent = `Admin View: ${p.title}`;
    safeToggle("chatForm", "hide");
    renderChatMessages(p);
};

const renderChatMessages = (p) => {
    const box = qs("chatMessages");
    if(!box) return;
    
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
    if(!confirm("Delete user?")) return;
    await deleteDoc(doc(db, "users", id));
};
window.deletePost = async (id) => {
    if(!confirm("Delete post?")) return;
    await deleteDoc(doc(db, "posts", id));
};

// --- POSTS (UPLOAD) ---
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

// --- INIT ---
const lastSec = localStorage.getItem(LAST_SECTION_KEY);
startListeners(); 
if(lastSec) showSection(lastSec);
else showSection("landing");

// UI Listeners
on(qs("loginBtn"), "click", () => safeToggle("loginModal", "show"));
on(qs("closeLogin"), "click", () => safeToggle("loginModal", "hide"));
on(qs("closeChat"), "click", () => safeToggle("chatModal", "hide"));
on(qs("logoutBtn"), "click", () => {
    signOut(auth);
    showSection("landing");
});
on(qs("heroExploreBtn"), "click", () => { if(requireLogin()) showSection("feed"); });
on(qs("heroLoginBtn"), "click", () => safeToggle("loginModal", "show"));

// Tabs
on(qs("tabRegister"), "click", () => { 
    safeToggle("registerForm", "show"); 
    safeToggle("loginForm", "hide"); 
});
on(qs("tabLogin"), "click", () => { 
    safeToggle("loginForm", "show"); 
    safeToggle("registerForm", "hide"); 
});

// Nav
qsa(".nav-btn").forEach(b => on(b, "click", () => {
    if(b.classList.contains("protected-nav") && !requireLogin()) return;
    showSection(b.dataset.section);
    if(b.dataset.section === 'upload') qs("yourListingsTab").click();
}));

on(qs("createListingTab"), "click", () => { 
    safeToggle("uploadWrapper", "show"); 
    safeToggle("userListings", "hide"); 
    qs("createListingTab").classList.add("text-white","bg-slate-800"); 
    qs("createListingTab").classList.remove("text-slate-300");
    qs("yourListingsTab").classList.remove("text-white","bg-slate-800"); 
    qs("yourListingsTab").classList.add("text-slate-300");
});

on(qs("yourListingsTab"), "click", () => { 
    safeToggle("uploadWrapper", "hide"); 
    safeToggle("userListings", "show"); 
    qs("yourListingsTab").classList.add("text-white","bg-slate-800"); 
    qs("yourListingsTab").classList.remove("text-slate-300");
    qs("createListingTab").classList.remove("text-white","bg-slate-800"); 
    qs("createListingTab").classList.add("text-slate-300");
    renderFeed();
});

// Calculator
qsa('input[name="calcMethod"]').forEach(r =>
  on(r, "change", () => {
    const v = document.querySelector('input[name="calcMethod"]:checked').value;
    const treeForm = qs("treeForm");
    const landForm = qs("landForm");
    if(v === "trees") {
        if(treeForm) treeForm.classList.remove("hidden");
        if(landForm) landForm.classList.add("hidden");
    } else {
        if(treeForm) treeForm.classList.add("hidden");
        if(landForm) landForm.classList.remove("hidden");
    }
    qs("calcResult").classList.add("hidden");
  })
);
on(qs("calcTreesBtn"), "click", () => {
    const res = (qs("treeCount").value * qs("treeType").value * qs("treeYears").value)/1000;
    qs("calcResult").classList.remove("hidden");
    qs("totalCredits").textContent = res.toFixed(2) + " Tons CO2";
});
on(qs("calcLandBtn"), "click", () => {
    const factor = qs("landUnit").value === 'hectares' ? 6 : 2.4; 
    const res = qs("landArea").value * factor * qs("landYears").value;
    qs("calcResult").classList.remove("hidden");
    qs("totalCredits").textContent = res.toFixed(2) + " Tons CO2";
});

// [FIX] Add Listener for both filters
on(qs("priceFilter"), "change", renderFeed);
on(qs("creditsFilter"), "change", renderFeed);

on(qs("gotoCalcLink"), "click", () => showSection("calculator"));


