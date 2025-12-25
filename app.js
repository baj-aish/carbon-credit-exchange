// // // ==========================================
// // // 1. IMPORTS & CONFIGURATION
// // // ==========================================
// // import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
// // import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
// // import { getFirestore, collection, addDoc, getDocs, getDoc, doc, updateDoc, arrayUnion, query, orderBy, onSnapshot, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// // const firebaseConfig = {
// //   apiKey: "AIzaSyAAfBZtKGSWsC7WH90i0Xd9487CEtduuX0",
// //   authDomain: "carbon-credit-f6e72.firebaseapp.com",
// //   projectId: "carbon-credit-f6e72",
// //   storageBucket: "carbon-credit-f6e72.firebasestorage.app",
// //   messagingSenderId: "26922591570",
// //   appId: "1:26922591570:web:cb0c8d76e0695fcd29c68b",
// //   measurementId: "G-QBM9MF9T54"
// // };

// // const app = initializeApp(firebaseConfig);
// // const auth = getAuth(app);
// // const db = getFirestore(app);

// // // ==========================================
// // // 2. CORE UTILITIES
// // // ==========================================
// // const qs = id => document.getElementById(id);
// // const qsa = sel => document.querySelectorAll(sel);
// // const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

// // // Safe DOM Helpers
// // const getEl = (input) => (typeof input === 'string' ? qs(input) : input);
// // const show = (input) => getEl(input)?.classList.remove("hidden");
// // const hide = (input) => getEl(input)?.classList.add("hidden");
// // const toggle = (input, condition) => condition ? show(input) : hide(input);

// // const LAST_SECTION_KEY = "ccx_last_section_v10";
// // let state = { users: [], posts: [], currentUser: null };
// // let editPostId = null, currentChatPostId = null;

// // // ==========================================
// // // 3. UI NAVIGATION
// // // ==========================================
// // const showSection = name => {
// //   qsa(".section").forEach(s => s.classList.add("hidden"));
// //   const target = qs("section-" + name) ? name : "landing";
// //   show("section-" + target);
// //   localStorage.setItem(LAST_SECTION_KEY, target);
  
// //   qsa(".nav-btn").forEach(btn => {
// //     const isActive = btn.dataset.section === target;
// //     if (isActive) {
// //         btn.classList.remove("bg-slate-900", "text-slate-100", "border-b-transparent", "hover:bg-slate-800");
// //         btn.classList.add("bg-emerald-600", "text-white", "font-bold");
// //     } else {
// //         btn.classList.add("bg-slate-900", "text-slate-100", "border-b-transparent", "hover:bg-slate-800");
// //         btn.classList.remove("bg-emerald-600", "text-white", "font-bold");
// //     }
// //   });
// // };

// // const updateAuthUI = () => {
// //   const u = state.currentUser;
// //   const isAdmin = u?.role === 'admin';

// //   toggle("loginBtn", !u);
// //   toggle("heroLoginBtn", !u);
// //   toggle("logoutBtn", u);
// //   toggle("userBadge", u);
// //   toggle("welcomeWrapper", u);
// //   toggle("feedFilters", u);

// //   qsa(".protected-nav").forEach(el => {
// //       if (el.id === "adminTab") toggle(el, u && isAdmin); 
// //       else toggle(el, !!u);
// //   });

// //   if (u) {
// //     qs("badgeName").textContent = u.name;
// //     qs("badgeRole").textContent = u.role;
// //     qs("welcomeName").textContent = u.name;
// //   }
// // };

// // const requireLogin = () => {
// //   if (!state.currentUser) {
// //     alert("Please login first.");
// //     show("loginModal");
// //     return false;
// //   }
// //   return true;
// // };
// // // ==========================================
// // // 4. DATA LISTENERS (REAL-TIME)
// // // ==========================================
// // const startListeners = () => {
// //     // 1. Listen to Posts (Chats & Feed)
// //     onSnapshot(query(collection(db, "posts"), orderBy("createdAt", "desc")), (snap) => {
// //         state.posts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
// //         renderFeed(); 
// //         renderInbox(); // <--- Updates Red Dot instantly
        
// //         if (currentChatPostId && !qs("chatModal").classList.contains("hidden")) {
// //             const p = state.posts.find(x => x.id == currentChatPostId);
// //             if(p) renderChatMessages(p);
// //         }
// //     });

// //     // 2. Listen to Users
// //     onSnapshot(collection(db, "users"), (snap) => {
// //         state.users = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
// //         if (auth.currentUser) {
// //             const me = state.users.find(u => u.id === auth.currentUser.uid);
// //             if (me && JSON.stringify(state.currentUser) !== JSON.stringify(me)) {
// //                 state.currentUser = me;
// //                 updateAuthUI();
// //                 renderFeed(); 
// //                 renderInbox();
// //             }
// //         }
// //         if(state.currentUser?.role === 'admin') renderAdmin();
// //     });
// // };

// // // ==========================================
// // // 5. AUTH HANDLERS
// // // ==========================================
// // on(qs("registerForm"), "submit", async e => {
// //   e.preventDefault();
// //   const [name, email, pass] = [qs("regName").value, qs("regEmail").value, qs("regPass").value];
// //   const reqRole = qs("regRole")?.value || "user";
  
// //   try {
// //     const { user } = await createUserWithEmailAndPassword(auth, email, pass);
// //     const role = (name.toLowerCase() === "bajaish" && reqRole === "admin") ? "admin" : "user";
// //     await setDoc(doc(db, "users", user.uid), { id: user.uid, name, email, role, createdAt: Date.now() });
// //     alert("Registered! Please login.");
// //     qs("tabLogin").click();
// //   } catch (err) { alert(err.message); }
// // });

// // on(qs("loginForm"), "submit", async e => {
// //   e.preventDefault();
// //   const name = qs("loginName").value;
// //   try {
// //     const snap = await getDocs(collection(db, "users"));
// //     const userDoc = snap.docs.find(d => d.data().name === name);
// //     if (!userDoc) throw new Error("User not found.");
    
// //     await signInWithEmailAndPassword(auth, userDoc.data().email, qs("loginPass").value);
    
// //     state.currentUser = { id: userDoc.id, ...userDoc.data() };
// //     updateAuthUI();
// //     renderFeed();
// //     renderInbox();
// //     hide("loginModal");
// //     showSection("feed");
// //   } catch (err) { alert(err.message); }
// // });

// // onAuthStateChanged(auth, async (user) => {
// //     if (user && !state.currentUser) {
// //         const snap = await getDoc(doc(db, "users", user.uid));
// //         if (snap.exists()) {
// //             state.currentUser = { id: snap.id, ...snap.data() };
// //             updateAuthUI(); renderFeed(); renderInbox();
// //         }
// //     } else if (!user) {
// //         state.currentUser = null;
// //         updateAuthUI(); renderFeed(); renderInbox();
// //     }
// // });

// // // ==========================================
// // // 6. RENDERERS
// // // ==========================================
// // const renderFeed = () => {
// //     const container = qs("feedContainer");
// //     let arr = state.posts.filter(p => p.status !== 'removed');
    
// //     const pf = qs("priceFilter")?.value || "none";
// //     if (pf === "low-high") arr.sort((a,b) => a.price - b.price);
// //     if (pf === "high-low") arr.sort((a,b) => b.price - a.price);

// //     const cf = qs("creditsFilter")?.value || "all";
// //     if (cf === "1-10") arr = arr.filter(p => p.credits >= 1 && p.credits <= 10);
// //     if (cf === "50+") arr = arr.filter(p => p.credits >= 50);

// //     if(arr.length === 0) container.innerHTML = '<p class="text-slate-400 text-sm mt-2 col-span-full">No posts yet.</p>';
// //     else container.innerHTML = arr.map(htmlPost).join("");
    
// //     const myName = state.currentUser?.name;
// //     if(!qs("userListings").classList.contains("hidden")) {
// //         const myPosts = state.posts.filter(p => p.user === myName);
// //         qs("userListings").innerHTML = myPosts.length ? myPosts.map(htmlListRow).join("") : '<p class="text-slate-400 text-xs">No listings found.</p>';
// //     }
// // };

// // const renderInbox = () => {
// //     // 1. Check Login
// //     if(!state.currentUser) {
// //         toggle("inboxIndicator", false);
// //         if(qs("inboxList")) qs("inboxList").innerHTML = `<p class="text-slate-400 text-sm">Login required.</p>`;
// //         return;
// //     }
    
// //     const myName = state.currentUser.name;
    
// //     // 2. Find Threads
// //     const items = state.posts.filter(p => 
// //         p.chatMessages?.length && (p.user === myName || p.chatMessages.some(m => m.from === myName))
// //     );
    
// //     // 3. Count Unread Messages (From Others + Not Seen)
// //     let totalUnread = 0;
// //     items.forEach(p => {
// //         const unreadInThread = p.chatMessages.filter(m => m.from !== myName && !m.seen).length;
// //         totalUnread += unreadInThread;
// //     });

// //     // 4. Toggle Indicator
// //     toggle("inboxIndicator", totalUnread > 0);

// //     // 5. Render List
// //     const list = qs("inboxList");
// //     if(!list) return;

// //     if(items.length === 0) {
// //         list.innerHTML = '<p class="text-slate-400 text-sm">No messages yet.</p>';
// //         return;
// //     }

// //     items.sort((a,b) => (b.chatMessages.at(-1)?.time || 0) - (a.chatMessages.at(-1)?.time || 0));
// //     list.innerHTML = items.map(p => htmlInboxItem(p, myName)).join("");
// // };

// // const renderAdmin = () => {
// //     if(state.currentUser?.role !== 'admin') return;
// //     qs("adminList").innerHTML = `
// //       <div class="mb-4"><h3 class="font-bold text-sm mb-2 text-emerald-400">Users</h3><table class="w-full text-left">${state.users.map(htmlAdminUser).join("")}</table></div>
// //       <div><h3 class="font-bold text-sm mb-2 text-emerald-400">Posts</h3>${state.posts.map(htmlAdminPost).join("")}</div>`;
// // };

// // // ==========================================
// // // 7. ACTIONS (CHAT, POSTS)
// // // ==========================================
// // window.openChat = async (pid) => {
// //     if(!requireLogin()) return;
// //     const p = state.posts.find(x => x.id == pid);
// //     if(!p) return;
// //     currentChatPostId = pid;
// //     qs("chatPostTitle").textContent = p.title;
// //     show("chatModal"); show("chatForm");
// //     renderChatMessages(p);
    
// //     // Mark messages as seen when opening
// //     const msgs = p.chatMessages || [];
// //     if (msgs.some(m => m.from !== state.currentUser.name && !m.seen)) {
// //         const updated = msgs.map(m => (m.from !== state.currentUser.name && !m.seen) ? {...m, seen: true} : m);
// //         await updateDoc(doc(db, "posts", pid), { chatMessages: updated });
// //     }
// // };

// // window.viewAdminChat = (pid) => {
// //     const p = state.posts.find(x => x.id == pid);
// //     currentChatPostId = null;
// //     qs("chatPostTitle").textContent = `Admin: ${p.title}`;
// //     show("chatModal"); hide("chatForm");
// //     renderChatMessages(p);
// // };

// // const renderChatMessages = (p) => {
// //     const box = qs("chatMessages");
// //     box.innerHTML = (p.chatMessages||[]).map(m => {
// //         const isMe = state.currentUser && m.from === state.currentUser.name;
// //         return `<div class="flex ${isMe?'justify-end':'justify-start'}"><div class="px-2 py-1 rounded mb-1 text-xs max-w-[80%] ${isMe?'bg-emerald-600 text-white':'bg-slate-800 text-slate-300'}"><div class="font-bold opacity-50 text-[9px]">${m.from}</div>${m.text}<div class="text-[9px] opacity-60 text-right">${isMe && m.seen ? 'Seen' : ''}</div></div></div>`;
// //     }).join("");
// //     box.scrollTop = box.scrollHeight;
// // };

// // // Global Handlers
// // window.editPost = (id) => {
// //     const p = state.posts.find(x => x.id == id);
// //     if(!p) return;
// //     editPostId = id;
// //     qs("postTitle").value = p.title; qs("postDesc").value = p.desc;
// //     qs("postPrice").value = p.price; qs("postCredits").value = p.credits;
// //     qs("uploadFormBtn").textContent = "Update Listing"; qs("createListingTab").click();
// // };
// // window.deleteUser = async (id) => { if(confirm("Delete user?")) await deleteDoc(doc(db, "users", id)); };
// // window.deletePost = async (id) => { if(confirm("Delete post?")) await deleteDoc(doc(db, "posts", id)); };

// // // ==========================================
// // // 8. EVENT BINDINGS
// // // ==========================================
// // on(qs("chatForm"), "submit", async e => {
// //     e.preventDefault();
// //     const text = qs("chatInput").value.trim();
// //     if(!text) return;
// //     await updateDoc(doc(db, "posts", currentChatPostId), { chatMessages: arrayUnion({ from: state.currentUser.name, text, time: Date.now(), seen: false }) });
// //     qs("chatInput").value = "";
// // });

// // on(qs("uploadForm"), "submit", async e => {
// //   e.preventDefault();
// //   if(!requireLogin()) return;
// //   const file = qs("postImage").files[0];
// //   const reader = new FileReader();
// //   const save = async (img) => {
// //     const data = { 
// //         title: qs("postTitle").value, desc: qs("postDesc").value, 
// //         price: Number(qs("postPrice").value), credits: Number(qs("postCredits").value),
// //         user: state.currentUser.name, image: img, createdAt: Date.now(), chatMessages: [], status: "active"
// //     };
// //     if(editPostId) { if(!img) delete data.image; await updateDoc(doc(db, "posts", editPostId), data); }
// //     else { if(!img) return alert("Image required"); await addDoc(collection(db, "posts"), data); }
// //     qs("uploadForm").reset(); editPostId = null; qs("uploadFormBtn").textContent = "Upload Listing"; qs("yourListingsTab").click();
// //   };
// //   if(file) { reader.onload = ev => save(ev.target.result); reader.readAsDataURL(file); } else save(null);
// // });

// // // UI Buttons
// // on(qs("loginBtn"), "click", () => show("loginModal"));
// // on(qs("heroLoginBtn"), "click", () => show("loginModal"));
// // on(qs("closeLogin"), "click", () => hide("loginModal"));
// // on(qs("closeChat"), "click", () => hide("chatModal"));
// // on(qs("logoutBtn"), "click", () => { signOut(auth); showSection("landing"); });
// // on(qs("heroExploreBtn"), "click", () => { if(requireLogin()) showSection("feed"); });

// // // Tabs & Filters
// // on(qs("tabRegister"), "click", () => { show("registerForm"); hide("loginForm"); });
// // on(qs("tabLogin"), "click", () => { show("loginForm"); hide("registerForm"); });
// // on(qs("priceFilter"), "change", renderFeed);
// // on(qs("creditsFilter"), "change", renderFeed);
// // on(qs("gotoCalcLink"), "click", () => showSection("calculator"));

// // // Tabs (Listings)
// // on(qs("createListingTab"), "click", () => { 
// //     show("uploadWrapper"); hide("userListings"); 
// //     qs("createListingTab").classList.replace("text-slate-300", "text-white"); qs("createListingTab").classList.add("bg-slate-800");
// //     qs("yourListingsTab").classList.replace("text-white", "text-slate-300"); qs("yourListingsTab").classList.remove("bg-slate-800");
// // });
// // on(qs("yourListingsTab"), "click", () => { 
// //     hide("uploadWrapper"); show("userListings"); 
// //     qs("yourListingsTab").classList.replace("text-slate-300", "text-white"); qs("yourListingsTab").classList.add("bg-slate-800");
// //     qs("createListingTab").classList.replace("text-white", "text-slate-300"); qs("createListingTab").classList.remove("bg-slate-800");
// //     renderFeed(); 
// // });

// // qsa(".nav-btn").forEach(b => on(b, "click", () => {
// //     if(b.classList.contains("protected-nav") && !requireLogin()) return;
// //     showSection(b.dataset.section);
// //     if(b.dataset.section === 'upload') qs("yourListingsTab").click();
// // }));

// // // Calculator
// // qsa('input[name="calcMethod"]').forEach(r => on(r, "change", () => {
// //     const v = document.querySelector('input[name="calcMethod"]:checked').value;
// //     toggle("treeForm", v === "trees"); toggle("landForm", v !== "trees"); hide("calcResult");
// // }));
// // on(qs("calcTreesBtn"), "click", () => {
// //     show("calcResult"); qs("totalCredits").textContent = ((qs("treeCount").value * qs("treeType").value * qs("treeYears").value)/1000).toFixed(2) + " Tons CO2";
// // });
// // on(qs("calcLandBtn"), "click", () => {
// //     const factor = qs("landUnit").value === 'hectares' ? 6 : 2.4; 
// //     show("calcResult"); qs("totalCredits").textContent = (qs("landArea").value * factor * qs("landYears").value).toFixed(2) + " Tons CO2";
// // });

// // // ==========================================
// // // 9. HTML TEMPLATES
// // // ==========================================
// // const htmlPost = (p) => {
// //     const isMine = state.currentUser && p.user === state.currentUser.name;
// //     const hasUnread = state.currentUser && p.chatMessages?.some(m => m.from !== state.currentUser.name && !m.seen);
// //     const badge = isMine ? `<span class="bg-emerald-500 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded ml-2">CREATED BY YOU</span>` : '';
// //     return `<div class="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow flex flex-col"><img src="${p.image}" class="w-full h-44 object-cover"><div class="p-3 flex flex-col flex-1"><div class="flex justify-between items-start mb-1"><h3 class="font-bold text-sm truncate flex-1">${p.title}</h3>${badge}</div><p class="text-[10px] text-slate-500 mb-2">By ${p.user} • ${new Date(p.createdAt).toLocaleDateString()}</p><p class="text-xs text-slate-400 mb-2 truncate">${p.desc}</p><div class="flex justify-between text-[11px] mb-2"><span class="text-emerald-300 bg-emerald-900/30 px-2 py-0.5 rounded-full">${p.credits} Credits</span><span class="text-white font-bold">₹${p.price}</span></div><div class="mt-auto"><button onclick="window.openChat('${p.id}')" class="w-full py-2 bg-slate-800 text-xs rounded border border-slate-600 relative hover:bg-slate-700">💬 Chat ${hasUnread?'<span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900"></span>':''}</button></div></div></div>`;
// // };
// // const htmlListRow = (p) => `<div class="bg-slate-900 p-2 border border-slate-700 rounded mb-2 flex justify-between text-xs items-center"><span>${p.title}</span><button class="text-emerald-400 underline" onclick="window.editPost('${p.id}')">Edit</button></div>`;
// // const htmlInboxItem = (p, myName) => {
// //     const last = p.chatMessages.at(-1);
// //     const unread = p.chatMessages.filter(m => m.from !== myName && !m.seen).length;
// //     return `<div onclick="window.openChat('${p.id}')" class="bg-slate-900 p-3 rounded-lg border border-slate-700 cursor-pointer flex justify-between items-center hover:bg-slate-800"><div><div class="text-sm font-bold text-emerald-100 flex items-center gap-2">${p.title} ${unread>0?`<span class="bg-red-500 text-white text-[9px] px-1.5 rounded-full">${unread}</span>`:''}</div><div class="text-xs text-slate-400">Last: ${last.from}: ${last.text}</div></div><div class="text-xs text-emerald-500">Open</div></div>`;
// // };
// // const htmlAdminUser = (u) => `<tr class="text-xs border-b border-slate-700"><td class="p-2">${u.name}</td><td class="p-2">${u.role}</td><td class="p-2 text-right"><button onclick="window.deleteUser('${u.id}')" class="text-red-400 hover:text-red-300">Remove</button></td></tr>`;
// // const htmlAdminPost = (p) => `<div class="flex justify-between items-center bg-slate-900 p-2 text-xs border border-slate-700 rounded mb-1"><div class="flex flex-col"><span class="font-bold">${p.title}</span><span class="text-[10px] text-slate-400">By ${p.user} • ${p.chatMessages?.length||0} msgs</span></div><div class="flex gap-2"><button onclick="window.viewAdminChat('${p.id}')" class="text-blue-400">View</button><button onclick="window.deletePost('${p.id}')" class="text-red-400">Delete</button></div></div>`;

// // // ==========================================
// // // 8. SAFE INIT (Wait for DOM)
// // // ==========================================
// // const init = () => {
// //     updateAuthUI();
// //     startListeners();
// //     const lastSec = localStorage.getItem(LAST_SECTION_KEY);
// //     const target = lastSec && qs("section-" + lastSec) ? lastSec : "landing";
// //     showSection(target);
// // };

// // if (document.readyState === "loading") {
// //     document.addEventListener("DOMContentLoaded", init);
// // } else {
// //     init();
// // }




// // ==========================================
// // 1. IMPORTS & CONFIGURATION
// // ==========================================
// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
// import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
// import { getFirestore, collection, addDoc, getDocs, getDoc, doc, updateDoc, arrayUnion, query, orderBy, onSnapshot, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// // ==========================================
// // 2. CORE UTILITIES
// // ==========================================
// const qs = id => document.getElementById(id);
// const qsa = sel => document.querySelectorAll(sel);
// const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

// const getEl = (input) => (typeof input === 'string' ? qs(input) : input);
// const show = (input) => getEl(input)?.classList.remove("hidden");
// const hide = (input) => getEl(input)?.classList.add("hidden");
// const toggle = (input, condition) => condition ? show(input) : hide(input);

// const LAST_SECTION_KEY = "ccx_last_section_v11";
// let state = { users: [], posts: [], currentUser: null };
// let editPostId = null, currentChatPostId = null;

// // ==========================================
// // 3. UI NAVIGATION
// // ==========================================
// const showSection = name => {
//   qsa(".section").forEach(s => s.classList.add("hidden"));
//   const target = qs("section-" + name) ? name : "landing";
//   show("section-" + target);
//   localStorage.setItem(LAST_SECTION_KEY, target);
  
//   qsa(".nav-btn").forEach(btn => {
//     const isActive = btn.dataset.section === target;
//     if (isActive) {
//         btn.classList.remove("bg-slate-900", "text-slate-100", "border-b-transparent", "hover:bg-slate-800");
//         btn.classList.add("bg-emerald-600", "text-white", "font-bold");
//     } else {
//         btn.classList.add("bg-slate-900", "text-slate-100", "border-b-transparent", "hover:bg-slate-800");
//         btn.classList.remove("bg-emerald-600", "text-white", "font-bold");
//     }
//   });
// };

// const updateAuthUI = () => {
//   const u = state.currentUser;
//   const isAdmin = u?.role === 'admin';

//   toggle("loginBtn", !u);
//   toggle("heroLoginBtn", !u);
//   toggle("logoutBtn", u);
//   toggle("userBadge", u);
//   toggle("welcomeWrapper", u);
//   toggle("feedFilters", u);

//   qsa(".protected-nav").forEach(el => {
//       if (el.id === "adminTab") toggle(el, u && isAdmin); 
//       else toggle(el, !!u);
//   });

//   if (u) {
//     qs("badgeName").textContent = u.name;
//     qs("badgeRole").textContent = u.role;
//     qs("welcomeName").textContent = u.name;
//   }
// };

// const requireLogin = () => {
//   if (!state.currentUser) {
//     alert("Please login first.");
//     show("loginModal");
//     return false;
//   }
//   return true;
// };

// // ==========================================
// // 4. DATA LISTENERS
// // ==========================================
// const startListeners = () => {
//     onSnapshot(query(collection(db, "posts"), orderBy("createdAt", "desc")), (snap) => {
//         state.posts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//         renderFeed(); 
//         renderInbox();
        
//         if (currentChatPostId && !qs("chatModal").classList.contains("hidden")) {
//             const p = state.posts.find(x => x.id == currentChatPostId);
//             if(p) renderChatMessages(p);
//         }
//     });

//     onSnapshot(collection(db, "users"), (snap) => {
//         state.users = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

// // ==========================================
// // 5. AUTH HANDLERS
// // ==========================================
// on(qs("registerForm"), "submit", async e => {
//   e.preventDefault();
//   const [name, email, pass] = [qs("regName").value, qs("regEmail").value, qs("regPass").value];
//   const reqRole = qs("regRole")?.value || "user";
  
//   try {
//     const { user } = await createUserWithEmailAndPassword(auth, email, pass);
//     const role = (name.toLowerCase() === "bajaish" && reqRole === "admin") ? "admin" : "user";
//     await setDoc(doc(db, "users", user.uid), { id: user.uid, name, email, role, createdAt: Date.now() });
//     alert("Registered! Please login.");
//     qs("tabLogin").click();
//   } catch (err) { alert(err.message); }
// });

// on(qs("loginForm"), "submit", async e => {
//   e.preventDefault();
//   const name = qs("loginName").value;
//   try {
//     const snap = await getDocs(collection(db, "users"));
//     const userDoc = snap.docs.find(d => d.data().name === name);
//     if (!userDoc) throw new Error("User not found.");
    
//     await signInWithEmailAndPassword(auth, userDoc.data().email, qs("loginPass").value);
    
//     state.currentUser = { id: userDoc.id, ...userDoc.data() };
//     updateAuthUI();
//     renderFeed();
//     renderInbox();
//     hide("loginModal");
//     showSection("feed");
//   } catch (err) { alert(err.message); }
// });

// onAuthStateChanged(auth, async (user) => {
//     if (user && !state.currentUser) {
//         const snap = await getDoc(doc(db, "users", user.uid));
//         if (snap.exists()) {
//             state.currentUser = { id: snap.id, ...snap.data() };
//             updateAuthUI(); renderFeed(); renderInbox();
//         }
//     } else if (!user) {
//         state.currentUser = null;
//         updateAuthUI(); renderFeed(); renderInbox();
//     }
// });

// // ==========================================
// // 6. RENDERERS
// // ==========================================
// const renderFeed = () => {
//     const container = qs("feedContainer");
//     let arr = state.posts.filter(p => p.status !== 'removed');
    
//     const pf = qs("priceFilter")?.value || "none";
//     if (pf === "low-high") arr.sort((a,b) => a.price - b.price);
//     if (pf === "high-low") arr.sort((a,b) => b.price - a.price);

//     const cf = qs("creditsFilter")?.value || "all";
//     if (cf === "1-10") arr = arr.filter(p => p.credits >= 1 && p.credits <= 10);
//     if (cf === "50+") arr = arr.filter(p => p.credits >= 50);

//     if(arr.length === 0) container.innerHTML = '<p class="text-slate-400 text-sm mt-2 col-span-full">No posts yet.</p>';
//     else container.innerHTML = arr.map(htmlPost).join("");
    
//     const myName = state.currentUser?.name;
//     if(!qs("userListings").classList.contains("hidden")) {
//         const myPosts = state.posts.filter(p => p.user === myName);
//         qs("userListings").innerHTML = myPosts.length ? myPosts.map(htmlListRow).join("") : '<p class="text-slate-400 text-xs">No listings found.</p>';
//     }
// };

// const renderInbox = () => {
//     if(!state.currentUser) {
//         toggle("inboxIndicator", false);
//         if(qs("inboxList")) qs("inboxList").innerHTML = `<p class="text-slate-400 text-sm">Login required.</p>`;
//         return;
//     }
    
//     const myName = state.currentUser.name;
//     const items = state.posts.filter(p => 
//         p.chatMessages?.length && (p.user === myName || p.chatMessages.some(m => m.from === myName))
//     );
    
//     let totalUnread = 0;
//     items.forEach(p => {
//         totalUnread += p.chatMessages.filter(m => m.from !== myName && !m.seen).length;
//     });
//     toggle("inboxIndicator", totalUnread > 0);

//     const list = qs("inboxList");
//     if(!list) return;

//     if(items.length === 0) {
//         list.innerHTML = '<p class="text-slate-400 text-sm">No messages yet.</p>';
//         return;
//     }

//     items.sort((a,b) => (b.chatMessages.at(-1)?.time || 0) - (a.chatMessages.at(-1)?.time || 0));
//     list.innerHTML = items.map(p => htmlInboxItem(p, myName)).join("");
// };

// const renderAdmin = () => {
//     if(state.currentUser?.role !== 'admin') return;
//     qs("adminList").innerHTML = `
//       <div class="mb-4"><h3 class="font-bold text-sm mb-2 text-emerald-400">Users</h3><table class="w-full text-left">${state.users.map(htmlAdminUser).join("")}</table></div>
//       <div><h3 class="font-bold text-sm mb-2 text-emerald-400">Posts</h3>${state.posts.map(htmlAdminPost).join("")}</div>`;
// };

// // ==========================================
// // 7. ACTIONS (CHAT, POSTS)
// // ==========================================
// window.openChat = async (pid) => {
//     if(!requireLogin()) return;
//     const p = state.posts.find(x => x.id == pid);
//     if(!p) return;
//     currentChatPostId = pid;
//     qs("chatPostTitle").textContent = p.title;
//     show("chatModal"); show("chatForm");
//     renderChatMessages(p);
    
//     const msgs = p.chatMessages || [];
//     if (msgs.some(m => m.from !== state.currentUser.name && !m.seen)) {
//         const updated = msgs.map(m => (m.from !== state.currentUser.name && !m.seen) ? {...m, seen: true} : m);
//         await updateDoc(doc(db, "posts", pid), { chatMessages: updated });
//     }
// };

// window.viewAdminChat = (pid) => {
//     const p = state.posts.find(x => x.id == pid);
//     currentChatPostId = null;
//     qs("chatPostTitle").textContent = `Admin: ${p.title}`;
//     show("chatModal"); hide("chatForm");
//     renderChatMessages(p);
// };

// const renderChatMessages = (p) => {
//     const box = qs("chatMessages");
//     box.innerHTML = (p.chatMessages||[]).map(m => {
//         const isMe = state.currentUser && m.from === state.currentUser.name;
//         return `<div class="flex ${isMe?'justify-end':'justify-start'}"><div class="px-2 py-1 rounded mb-1 text-xs max-w-[80%] ${isMe?'bg-emerald-600 text-white':'bg-slate-800 text-slate-300'}"><div class="font-bold opacity-50 text-[9px]">${m.from}</div>${m.text}<div class="text-[9px] opacity-60 text-right">${isMe && m.seen ? 'Seen' : ''}</div></div></div>`;
//     }).join("");
//     box.scrollTop = box.scrollHeight;
// };

// // Global Handlers
// window.editPost = (id) => {
//     const p = state.posts.find(x => x.id == id);
//     if(!p) return;
//     editPostId = id;
    
//     // Fill Form
//     qs("postTitle").value = p.title; 
//     qs("postDesc").value = p.desc;
//     qs("postPrice").value = p.price; 
//     qs("postCredits").value = p.credits;
    
//     // Update Button Text & Show Delete
//     qs("uploadFormBtn").textContent = "Update Listing"; 
//     show("deleteEditBtn"); // <--- SHOW DELETE BUTTON
    
//     qs("createListingTab").click();
// };

// window.deleteUser = async (id) => { if(confirm("Delete user?")) await deleteDoc(doc(db, "users", id)); };
// window.deletePost = async (id) => { if(confirm("Delete post?")) await deleteDoc(doc(db, "posts", id)); };

// // ==========================================
// // 8. EVENT BINDINGS
// // ==========================================
// on(qs("chatForm"), "submit", async e => {
//     e.preventDefault();
//     const text = qs("chatInput").value.trim();
//     if(!text) return;
//     await updateDoc(doc(db, "posts", currentChatPostId), { chatMessages: arrayUnion({ from: state.currentUser.name, text, time: Date.now(), seen: false }) });
//     qs("chatInput").value = "";
// });

// on(qs("uploadForm"), "submit", async e => {
//   e.preventDefault();
//   if(!requireLogin()) return;
//   const file = qs("postImage").files[0];
//   const reader = new FileReader();
//   const save = async (img) => {
//     const data = { 
//         title: qs("postTitle").value, desc: qs("postDesc").value, 
//         price: Number(qs("postPrice").value), credits: Number(qs("postCredits").value),
//         user: state.currentUser.name, image: img, createdAt: Date.now(), chatMessages: [], status: "active"
//     };
//     if(editPostId) { 
//         if(!img) delete data.image; 
//         await updateDoc(doc(db, "posts", editPostId), data); 
//     } else { 
//         if(!img) return alert("Image required"); 
//         await addDoc(collection(db, "posts"), data); 
//     }
    
//     // Reset Form & Hide Delete Button
//     qs("uploadForm").reset(); 
//     editPostId = null; 
//     qs("uploadFormBtn").textContent = "Upload Listing"; 
//     hide("deleteEditBtn"); // <--- HIDE DELETE BUTTON
    
//     qs("yourListingsTab").click();
//   };
//   if(file) { reader.onload = ev => save(ev.target.result); reader.readAsDataURL(file); } else save(null);
// });

// // [NEW] Delete Button Listener in Edit Form
// on(qs("deleteEditBtn"), "click", async () => {
//     if(!editPostId) return;
//     if(confirm("Delete this listing permanently?")) {
//         await deleteDoc(doc(db, "posts", editPostId));
        
//         // Reset Form
//         qs("uploadForm").reset();
//         editPostId = null;
//         qs("uploadFormBtn").textContent = "Upload Listing"; 
//         hide("deleteEditBtn");
        
//         qs("yourListingsTab").click();
//     }
// });

// // UI Buttons
// on(qs("loginBtn"), "click", () => show("loginModal"));
// on(qs("heroLoginBtn"), "click", () => show("loginModal"));
// on(qs("closeLogin"), "click", () => hide("loginModal"));
// on(qs("closeChat"), "click", () => hide("chatModal"));
// on(qs("logoutBtn"), "click", () => { signOut(auth); showSection("landing"); });
// on(qs("heroExploreBtn"), "click", () => { if(requireLogin()) showSection("feed"); });

// // Tabs & Filters
// on(qs("tabRegister"), "click", () => { show("registerForm"); hide("loginForm"); });
// on(qs("tabLogin"), "click", () => { show("loginForm"); hide("registerForm"); });
// on(qs("priceFilter"), "change", renderFeed);
// on(qs("creditsFilter"), "change", renderFeed);
// on(qs("gotoCalcLink"), "click", () => showSection("calculator"));

// // Tabs (Listings)
// on(qs("createListingTab"), "click", () => { 
//     show("uploadWrapper"); hide("userListings"); 
//     qs("createListingTab").classList.replace("text-slate-300", "text-white"); qs("createListingTab").classList.add("bg-slate-800");
//     qs("yourListingsTab").classList.replace("text-white", "text-slate-300"); qs("yourListingsTab").classList.remove("bg-slate-800");
    
//     // If user clicked "Create New" manually, clear any pending edit state
//     if (!editPostId) {
//         qs("uploadForm").reset();
//         qs("uploadFormBtn").textContent = "Upload Listing";
//         hide("deleteEditBtn");
//     }
// });
// on(qs("yourListingsTab"), "click", () => { 
//     hide("uploadWrapper"); show("userListings"); 
//     qs("yourListingsTab").classList.replace("text-slate-300", "text-white"); qs("yourListingsTab").classList.add("bg-slate-800");
//     qs("createListingTab").classList.replace("text-white", "text-slate-300"); qs("createListingTab").classList.remove("bg-slate-800");
    
//     // Clear edit state when leaving
//     editPostId = null;
//     qs("uploadForm").reset();
//     qs("uploadFormBtn").textContent = "Upload Listing";
//     hide("deleteEditBtn");
    
//     renderFeed(); 
// });

// qsa(".nav-btn").forEach(b => on(b, "click", () => {
//     if(b.classList.contains("protected-nav") && !requireLogin()) return;
//     showSection(b.dataset.section);
//     if(b.dataset.section === 'upload') qs("yourListingsTab").click();
// }));

// // Calculator
// qsa('input[name="calcMethod"]').forEach(r => on(r, "change", () => {
//     const v = document.querySelector('input[name="calcMethod"]:checked').value;
//     toggle("treeForm", v === "trees"); toggle("landForm", v !== "trees"); hide("calcResult");
// }));
// on(qs("calcTreesBtn"), "click", () => {
//     show("calcResult"); qs("totalCredits").textContent = ((qs("treeCount").value * qs("treeType").value * qs("treeYears").value)/1000).toFixed(2) + " Tons CO2";
// });
// on(qs("calcLandBtn"), "click", () => {
//     const factor = qs("landUnit").value === 'hectares' ? 6 : 2.4; 
//     show("calcResult"); qs("totalCredits").textContent = (qs("landArea").value * factor * qs("landYears").value).toFixed(2) + " Tons CO2";
// });

// // ==========================================
// // 9. HTML TEMPLATES
// // ==========================================
// const htmlPost = (p) => {
//     const isMine = state.currentUser && p.user === state.currentUser.name;
//     const hasUnread = state.currentUser && p.chatMessages?.some(m => m.from !== state.currentUser.name && !m.seen);
//     const badge = isMine ? `<span class="bg-emerald-500 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded ml-2">CREATED BY YOU</span>` : '';
//     return `<div class="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow flex flex-col"><img src="${p.image}" class="w-full h-44 object-cover"><div class="p-3 flex flex-col flex-1"><div class="flex justify-between items-start mb-1"><h3 class="font-bold text-sm truncate flex-1">${p.title}</h3>${badge}</div><p class="text-[10px] text-slate-500 mb-2">By ${p.user} • ${new Date(p.createdAt).toLocaleDateString()}</p><p class="text-xs text-slate-400 mb-2 truncate">${p.desc}</p><div class="flex justify-between text-[11px] mb-2"><span class="text-emerald-300 bg-emerald-900/30 px-2 py-0.5 rounded-full">${p.credits} Credits</span><span class="text-white font-bold">₹${p.price}</span></div><div class="mt-auto"><button onclick="window.openChat('${p.id}')" class="w-full py-2 bg-slate-800 text-xs rounded border border-slate-600 relative hover:bg-slate-700">💬 Chat ${hasUnread?'<span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900"></span>':''}</button></div></div></div>`;
// };
// const htmlListRow = (p) => `<div class="bg-slate-900 p-2 border border-slate-700 rounded mb-2 flex justify-between text-xs items-center"><span>${p.title}</span><button class="text-emerald-400 underline" onclick="window.editPost('${p.id}')">Edit</button></div>`;
// const htmlInboxItem = (p, myName) => {
//     const last = p.chatMessages.at(-1);
//     const unread = p.chatMessages.filter(m => m.from !== myName && !m.seen).length;
//     return `<div onclick="window.openChat('${p.id}')" class="bg-slate-900 p-3 rounded-lg border border-slate-700 cursor-pointer flex justify-between items-center hover:bg-slate-800"><div><div class="text-sm font-bold text-emerald-100 flex items-center gap-2">${p.title} ${unread>0?`<span class="bg-red-500 text-white text-[9px] px-1.5 rounded-full">${unread}</span>`:''}</div><div class="text-xs text-slate-400">Last: ${last.from}: ${last.text}</div></div><div class="text-xs text-emerald-500">Open</div></div>`;
// };
// const htmlAdminUser = (u) => `<tr class="text-xs border-b border-slate-700"><td class="p-2">${u.name}</td><td class="p-2">${u.role}</td><td class="p-2 text-right"><button onclick="window.deleteUser('${u.id}')" class="text-red-400 hover:text-red-300">Remove</button></td></tr>`;
// const htmlAdminPost = (p) => `<div class="flex justify-between items-center bg-slate-900 p-2 text-xs border border-slate-700 rounded mb-1"><div class="flex flex-col"><span class="font-bold">${p.title}</span><span class="text-[10px] text-slate-400">By ${p.user} • ${p.chatMessages?.length||0} msgs</span></div><div class="flex gap-2"><button onclick="window.viewAdminChat('${p.id}')" class="text-blue-400">View</button><button onclick="window.deletePost('${p.id}')" class="text-red-400">Delete</button></div></div>`;

// // ==========================================
// // 8. SAFE INIT (Wait for DOM)
// // ==========================================
// const init = () => {
//     updateAuthUI();
//     startListeners();
//     const lastSec = localStorage.getItem(LAST_SECTION_KEY);
//     const target = lastSec && qs("section-" + lastSec) ? lastSec : "landing";
//     showSection(target);
// };

// if (document.readyState === "loading") {
//     document.addEventListener("DOMContentLoaded", init);
// } else {
//     init();
// }



// // ==========================================
// // 1. IMPORTS & CONFIGURATION
// // ==========================================
// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
// import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
// import { getFirestore, collection, addDoc, getDocs, getDoc, doc, updateDoc, arrayUnion, query, orderBy, onSnapshot, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// // ==========================================
// // 2. CORE UTILITIES
// // ==========================================
// const qs = id => document.getElementById(id);
// const qsa = sel => document.querySelectorAll(sel);
// const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

// const getEl = (input) => (typeof input === 'string' ? qs(input) : input);
// const show = (input) => getEl(input)?.classList.remove("hidden");
// const hide = (input) => getEl(input)?.classList.add("hidden");
// const toggle = (input, condition) => condition ? show(input) : hide(input);

// const LAST_SECTION_KEY = "ccx_last_section_v12";
// let state = { users: [], posts: [], currentUser: null };
// let editPostId = null, currentChatPostId = null;

// // ==========================================
// // 3. UI NAVIGATION
// // ==========================================
// const showSection = name => {
//   qsa(".section").forEach(s => s.classList.add("hidden"));
//   const target = qs("section-" + name) ? name : "landing";
//   show("section-" + target);
//   localStorage.setItem(LAST_SECTION_KEY, target);
  
//   qsa(".nav-btn").forEach(btn => {
//     const isActive = btn.dataset.section === target;
//     if (isActive) {
//         btn.classList.remove("bg-slate-900", "text-slate-100", "border-b-transparent", "hover:bg-slate-800");
//         btn.classList.add("bg-emerald-600", "text-white", "font-bold");
//     } else {
//         btn.classList.add("bg-slate-900", "text-slate-100", "border-b-transparent", "hover:bg-slate-800");
//         btn.classList.remove("bg-emerald-600", "text-white", "font-bold");
//     }
//   });
// };

// const updateAuthUI = () => {
//   const u = state.currentUser;
//   const isAdmin = u?.role === 'admin';

//   toggle("loginBtn", !u);
//   toggle("heroLoginBtn", !u);
//   toggle("logoutBtn", u);
//   toggle("userBadge", u);
//   toggle("welcomeWrapper", u);
//   toggle("feedFilters", u);

//   qsa(".protected-nav").forEach(el => {
//       if (el.id === "adminTab") toggle(el, u && isAdmin); 
//       else toggle(el, !!u);
//   });

//   if (u) {
//     qs("badgeName").textContent = u.name;
//     qs("badgeRole").textContent = u.role;
//     qs("welcomeName").textContent = u.name;
//   }
// };

// const requireLogin = () => {
//   if (!state.currentUser) {
//     alert("Please login first.");
//     show("loginModal");
//     return false;
//   }
//   return true;
// };

// // ==========================================
// // 4. DATA LISTENERS
// // ==========================================
// const startListeners = () => {
//     onSnapshot(query(collection(db, "posts"), orderBy("createdAt", "desc")), (snap) => {
//         state.posts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//         renderFeed(); 
//         renderInbox();
        
//         if (currentChatPostId && !qs("chatModal").classList.contains("hidden")) {
//             const p = state.posts.find(x => x.id == currentChatPostId);
//             if(p) renderChatMessages(p);
//         }
//     });

//     onSnapshot(collection(db, "users"), (snap) => {
//         state.users = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

// // ==========================================
// // 5. AUTH HANDLERS
// // ==========================================
// on(qs("registerForm"), "submit", async e => {
//   e.preventDefault();
//   const [name, email, pass] = [qs("regName").value, qs("regEmail").value, qs("regPass").value];
//   const reqRole = qs("regRole")?.value || "user";
  
//   try {
//     const { user } = await createUserWithEmailAndPassword(auth, email, pass);
//     const role = (name.toLowerCase() === "bajaish" && reqRole === "admin") ? "admin" : "user";
//     await setDoc(doc(db, "users", user.uid), { id: user.uid, name, email, role, createdAt: Date.now() });
//     alert("Registered! Please login.");
//     qs("tabLogin").click();
//   } catch (err) { alert(err.message); }
// });

// on(qs("loginForm"), "submit", async e => {
//   e.preventDefault();
//   const name = qs("loginName").value;
//   try {
//     const snap = await getDocs(collection(db, "users"));
//     const userDoc = snap.docs.find(d => d.data().name === name);
//     if (!userDoc) throw new Error("User not found.");
    
//     await signInWithEmailAndPassword(auth, userDoc.data().email, qs("loginPass").value);
    
//     state.currentUser = { id: userDoc.id, ...userDoc.data() };
//     updateAuthUI();
//     renderFeed();
//     renderInbox();
//     hide("loginModal");
//     showSection("feed");
//   } catch (err) { alert(err.message); }
// });

// onAuthStateChanged(auth, async (user) => {
//     if (user && !state.currentUser) {
//         const snap = await getDoc(doc(db, "users", user.uid));
//         if (snap.exists()) {
//             state.currentUser = { id: snap.id, ...snap.data() };
//             updateAuthUI(); renderFeed(); renderInbox();
//         }
//     } else if (!user) {
//         state.currentUser = null;
//         updateAuthUI(); renderFeed(); renderInbox();
//     }
// });

// // ==========================================
// // 6. RENDERERS
// // ==========================================
// const renderFeed = () => {
//     const container = qs("feedContainer");
//     let arr = state.posts.filter(p => p.status !== 'removed');
    
//     const pf = qs("priceFilter")?.value || "none";
//     if (pf === "low-high") arr.sort((a,b) => a.price - b.price);
//     if (pf === "high-low") arr.sort((a,b) => b.price - a.price);

//     const cf = qs("creditsFilter")?.value || "all";
//     if (cf === "1-10") arr = arr.filter(p => p.credits >= 1 && p.credits <= 10);
//     if (cf === "50+") arr = arr.filter(p => p.credits >= 50);

//     if(arr.length === 0) container.innerHTML = '<p class="text-slate-400 text-sm mt-2 col-span-full">No posts yet.</p>';
//     else container.innerHTML = arr.map(htmlPost).join("");
    
//     const myName = state.currentUser?.name;
//     if(!qs("userListings").classList.contains("hidden")) {
//         const myPosts = state.posts.filter(p => p.user === myName);
//         qs("userListings").innerHTML = myPosts.length ? myPosts.map(htmlListRow).join("") : '<p class="text-slate-400 text-xs">No listings found.</p>';
//     }
// };

// const renderInbox = () => {
//     if(!state.currentUser) {
//         toggle("inboxIndicator", false);
//         if(qs("inboxList")) qs("inboxList").innerHTML = `<p class="text-slate-400 text-sm">Login required.</p>`;
//         return;
//     }
    
//     const myName = state.currentUser.name;
//     const items = state.posts.filter(p => 
//         p.chatMessages?.length && (p.user === myName || p.chatMessages.some(m => m.from === myName))
//     );
    
//     let totalUnread = 0;
//     items.forEach(p => {
//         totalUnread += p.chatMessages.filter(m => m.from !== myName && !m.seen).length;
//     });
//     toggle("inboxIndicator", totalUnread > 0);

//     const list = qs("inboxList");
//     if(!list) return;

//     if(items.length === 0) {
//         list.innerHTML = '<p class="text-slate-400 text-sm">No messages yet.</p>';
//         return;
//     }

//     items.sort((a,b) => (b.chatMessages.at(-1)?.time || 0) - (a.chatMessages.at(-1)?.time || 0));
//     list.innerHTML = items.map(p => htmlInboxItem(p, myName)).join("");
// };

// const renderAdmin = () => {
//     if(state.currentUser?.role !== 'admin') return;
//     qs("adminList").innerHTML = `
//       <div class="mb-4"><h3 class="font-bold text-sm mb-2 text-emerald-400">Users</h3><table class="w-full text-left">${state.users.map(htmlAdminUser).join("")}</table></div>
//       <div><h3 class="font-bold text-sm mb-2 text-emerald-400">Posts</h3>${state.posts.map(htmlAdminPost).join("")}</div>`;
// };

// // ==========================================
// // 7. ACTIONS (CHAT, POSTS)
// // ==========================================
// window.openChat = async (pid) => {
//     if(!requireLogin()) return;
//     const p = state.posts.find(x => x.id == pid);
//     if(!p) return;
//     currentChatPostId = pid;
//     qs("chatPostTitle").textContent = p.title;
//     show("chatModal"); show("chatForm");
//     renderChatMessages(p);
    
//     const msgs = p.chatMessages || [];
//     if (msgs.some(m => m.from !== state.currentUser.name && !m.seen)) {
//         const updated = msgs.map(m => (m.from !== state.currentUser.name && !m.seen) ? {...m, seen: true} : m);
//         await updateDoc(doc(db, "posts", pid), { chatMessages: updated });
//     }
// };

// window.viewAdminChat = (pid) => {
//     const p = state.posts.find(x => x.id == pid);
//     currentChatPostId = null;
//     qs("chatPostTitle").textContent = `Admin: ${p.title}`;
//     show("chatModal"); hide("chatForm");
//     renderChatMessages(p);
// };

// const renderChatMessages = (p) => {
//     const box = qs("chatMessages");
//     box.innerHTML = (p.chatMessages||[]).map(m => {
//         const isMe = state.currentUser && m.from === state.currentUser.name;
//         return `<div class="flex ${isMe?'justify-end':'justify-start'}"><div class="px-2 py-1 rounded mb-1 text-xs max-w-[80%] ${isMe?'bg-emerald-600 text-white':'bg-slate-800 text-slate-300'}"><div class="font-bold opacity-50 text-[9px]">${m.from}</div>${m.text}<div class="text-[9px] opacity-60 text-right">${isMe && m.seen ? 'Seen' : ''}</div></div></div>`;
//     }).join("");
//     box.scrollTop = box.scrollHeight;
// };

// // Global Handlers (Edit/Delete)
// window.editPost = (id) => {
//     const p = state.posts.find(x => x.id == id);
//     if(!p) return;
//     editPostId = id;
    
//     // Fill Form
//     qs("postTitle").value = p.title; qs("postDesc").value = p.desc;
//     qs("postPrice").value = p.price; qs("postCredits").value = p.credits;
    
//     // UI Updates
//     qs("uploadFormBtn").textContent = "Update Listing"; 
//     show("deleteEditBtn"); // Show Delete Button
//     qs("createListingTab").click();
// };

// window.deleteUser = async (id) => { if(confirm("Delete user?")) await deleteDoc(doc(db, "users", id)); };
// window.deletePost = async (id) => { if(confirm("Delete post?")) await deleteDoc(doc(db, "posts", id)); };

// // ==========================================
// // 8. EVENT BINDINGS
// // ==========================================
// on(qs("chatForm"), "submit", async e => {
//     e.preventDefault();
//     const text = qs("chatInput").value.trim();
//     if(!text) return;
//     await updateDoc(doc(db, "posts", currentChatPostId), { chatMessages: arrayUnion({ from: state.currentUser.name, text, time: Date.now(), seen: false }) });
//     qs("chatInput").value = "";
// });

// on(qs("uploadForm"), "submit", async e => {
//   e.preventDefault();
//   if(!requireLogin()) return;
//   const file = qs("postImage").files[0];
//   const reader = new FileReader();
//   const save = async (img) => {
//     const data = { 
//         title: qs("postTitle").value, desc: qs("postDesc").value, 
//         price: Number(qs("postPrice").value), credits: Number(qs("postCredits").value),
//         user: state.currentUser.name, image: img, createdAt: Date.now(), chatMessages: [], status: "active"
//     };
//     if(editPostId) { if(!img) delete data.image; await updateDoc(doc(db, "posts", editPostId), data); }
//     else { if(!img) return alert("Image required"); await addDoc(collection(db, "posts"), data); }
    
//     // Reset
//     qs("uploadForm").reset(); editPostId = null; 
//     qs("uploadFormBtn").textContent = "Upload Listing"; 
//     hide("deleteEditBtn"); // Hide Delete Button
//     qs("yourListingsTab").click();
//   };
//   if(file) { reader.onload = ev => save(ev.target.result); reader.readAsDataURL(file); } else save(null);
// });

// // Delete Button Handler
// on(qs("deleteEditBtn"), "click", async () => {
//     if(!editPostId) return;
//     if(confirm("Delete this listing permanently?")) {
//         await deleteDoc(doc(db, "posts", editPostId));
//         qs("uploadForm").reset(); editPostId = null; 
//         qs("uploadFormBtn").textContent = "Upload Listing"; 
//         hide("deleteEditBtn");
//         qs("yourListingsTab").click();
//     }
// });

// // UI Buttons
// on(qs("loginBtn"), "click", () => show("loginModal"));
// on(qs("heroLoginBtn"), "click", () => show("loginModal"));
// on(qs("closeLogin"), "click", () => hide("loginModal"));
// on(qs("closeChat"), "click", () => hide("chatModal"));
// on(qs("logoutBtn"), "click", () => { signOut(auth); showSection("landing"); });
// on(qs("heroExploreBtn"), "click", () => { if(requireLogin()) showSection("feed"); });

// // Tabs & Filters
// on(qs("tabRegister"), "click", () => { show("registerForm"); hide("loginForm"); });
// on(qs("tabLogin"), "click", () => { show("loginForm"); hide("registerForm"); });
// on(qs("priceFilter"), "change", renderFeed);
// on(qs("creditsFilter"), "change", renderFeed);
// on(qs("gotoCalcLink"), "click", () => showSection("calculator"));

// // Tabs (Listings) - Reset edit state when switching tabs
// on(qs("createListingTab"), "click", () => { 
//     show("uploadWrapper"); hide("userListings"); 
//     qs("createListingTab").classList.replace("text-slate-300", "text-white"); qs("createListingTab").classList.add("bg-slate-800");
//     qs("yourListingsTab").classList.replace("text-white", "text-slate-300"); qs("yourListingsTab").classList.remove("bg-slate-800");
    
//     if(!editPostId) {
//         qs("uploadForm").reset();
//         qs("uploadFormBtn").textContent = "Upload Listing";
//         hide("deleteEditBtn");
//     }
// });
// on(qs("yourListingsTab"), "click", () => { 
//     hide("uploadWrapper"); show("userListings"); 
//     qs("yourListingsTab").classList.replace("text-slate-300", "text-white"); qs("yourListingsTab").classList.add("bg-slate-800");
//     qs("createListingTab").classList.replace("text-white", "text-slate-300"); qs("createListingTab").classList.remove("bg-slate-800");
    
//     // Clear edit state
//     editPostId = null; qs("uploadForm").reset();
//     qs("uploadFormBtn").textContent = "Upload Listing";
//     hide("deleteEditBtn");
//     renderFeed(); 
// });

// qsa(".nav-btn").forEach(b => on(b, "click", () => {
//     if(b.classList.contains("protected-nav") && !requireLogin()) return;
//     showSection(b.dataset.section);
//     if(b.dataset.section === 'upload') qs("yourListingsTab").click();
// }));

// // Calculator
// qsa('input[name="calcMethod"]').forEach(r => on(r, "change", () => {
//     const v = document.querySelector('input[name="calcMethod"]:checked').value;
//     toggle("treeForm", v === "trees"); toggle("landForm", v !== "trees"); hide("calcResult");
// }));
// on(qs("calcTreesBtn"), "click", () => {
//     show("calcResult"); qs("totalCredits").textContent = ((qs("treeCount").value * qs("treeType").value * qs("treeYears").value)/1000).toFixed(2) + " Tons CO2";
// });
// on(qs("calcLandBtn"), "click", () => {
//     const factor = qs("landUnit").value === 'hectares' ? 6 : 2.4; 
//     show("calcResult"); qs("totalCredits").textContent = (qs("landArea").value * factor * qs("landYears").value).toFixed(2) + " Tons CO2";
// });

// // ==========================================
// // 9. HTML TEMPLATES
// // ==========================================
// const htmlPost = (p) => {
//     const isMine = state.currentUser && p.user === state.currentUser.name;
//     const hasUnread = state.currentUser && p.chatMessages?.some(m => m.from !== state.currentUser.name && !m.seen);
//     const badge = isMine ? `<span class="bg-emerald-500 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded ml-2">CREATED BY YOU</span>` : '';
//     return `<div class="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow flex flex-col"><img src="${p.image}" class="w-full h-44 object-cover"><div class="p-3 flex flex-col flex-1"><div class="flex justify-between items-start mb-1"><h3 class="font-bold text-sm truncate flex-1">${p.title}</h3>${badge}</div><p class="text-[10px] text-slate-500 mb-2">By ${p.user} • ${new Date(p.createdAt).toLocaleDateString()}</p><p class="text-xs text-slate-400 mb-2 truncate">${p.desc}</p><div class="flex justify-between text-[11px] mb-2"><span class="text-emerald-300 bg-emerald-900/30 px-2 py-0.5 rounded-full">${p.credits} Credits</span><span class="text-white font-bold">₹${p.price}</span></div><div class="mt-auto"><button onclick="window.openChat('${p.id}')" class="w-full py-2 bg-slate-800 text-xs rounded border border-slate-600 relative hover:bg-slate-700">💬 Chat ${hasUnread?'<span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900"></span>':''}</button></div></div></div>`;
// };
// const htmlListRow = (p) => `<div class="bg-slate-900 p-2 border border-slate-700 rounded mb-2 flex justify-between text-xs items-center"><span>${p.title}</span><button class="text-emerald-400 underline" onclick="window.editPost('${p.id}')">Edit</button></div>`;
// const htmlInboxItem = (p, myName) => {
//     const last = p.chatMessages.at(-1);
//     const unread = p.chatMessages.filter(m => m.from !== myName && !m.seen).length;
//     return `<div onclick="window.openChat('${p.id}')" class="bg-slate-900 p-3 rounded-lg border border-slate-700 cursor-pointer flex justify-between items-center hover:bg-slate-800"><div><div class="text-sm font-bold text-emerald-100 flex items-center gap-2">${p.title} ${unread>0?`<span class="bg-red-500 text-white text-[9px] px-1.5 rounded-full">${unread}</span>`:''}</div><div class="text-xs text-slate-400">Last: ${last.from}: ${last.text}</div></div><div class="text-xs text-emerald-500">Open</div></div>`;
// };
// const htmlAdminUser = (u) => `<tr class="text-xs border-b border-slate-700"><td class="p-2">${u.name}</td><td class="p-2">${u.role}</td><td class="p-2 text-right"><button onclick="window.deleteUser('${u.id}')" class="text-red-400 hover:text-red-300">Remove</button></td></tr>`;
// const htmlAdminPost = (p) => `<div class="flex justify-between items-center bg-slate-900 p-2 text-xs border border-slate-700 rounded mb-1"><div class="flex flex-col"><span class="font-bold">${p.title}</span><span class="text-[10px] text-slate-400">By ${p.user} • ${p.chatMessages?.length||0} msgs</span></div><div class="flex gap-2"><button onclick="window.viewAdminChat('${p.id}')" class="text-blue-400">View</button><button onclick="window.deletePost('${p.id}')" class="text-red-400">Delete</button></div></div>`;

// // ==========================================
// // 8. SAFE INIT (Wait for DOM)
// // ==========================================
// const init = () => {
//     updateAuthUI();
//     startListeners();
//     const lastSec = localStorage.getItem(LAST_SECTION_KEY);
//     const target = lastSec && qs("section-" + lastSec) ? lastSec : "landing";
//     showSection(target);
// };

// if (document.readyState === "loading") {
//     document.addEventListener("DOMContentLoaded", init);
// } else {
//     init();
// }






// // ==========================================
// // 1. IMPORTS & CONFIGURATION
// // ==========================================
// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
// import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
// import { getFirestore, collection, addDoc, getDocs, getDoc, doc, updateDoc, arrayUnion, query, orderBy, onSnapshot, setDoc, deleteDoc, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// // ==========================================
// // 2. CORE UTILITIES
// // ==========================================
// const qs = id => document.getElementById(id);
// const qsa = sel => document.querySelectorAll(sel);
// const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

// const getEl = (input) => (typeof input === 'string' ? qs(input) : input);
// const show = (input) => getEl(input)?.classList.remove("hidden");
// const hide = (input) => getEl(input)?.classList.add("hidden");
// const toggle = (input, condition) => condition ? show(input) : hide(input);

// const LAST_SECTION_KEY = "ccx_last_section_vfinal";
// let state = { users: [], posts: [], chats: [], currentUser: null };
// let editPostId = null, currentChatId = null;

// // ==========================================
// // 3. UI NAVIGATION
// // ==========================================
// const showSection = name => {
//   qsa(".section").forEach(s => s.classList.add("hidden"));
//   const target = qs("section-" + name) ? name : "landing";
//   show("section-" + target);
//   localStorage.setItem(LAST_SECTION_KEY, target);
  
//   qsa(".nav-btn").forEach(btn => {
//     const isActive = btn.dataset.section === target;
//     if (isActive) {
//         btn.classList.remove("bg-slate-900", "text-slate-100", "border-b-transparent", "hover:bg-slate-800");
//         btn.classList.add("bg-emerald-600", "text-white", "font-bold");
//     } else {
//         btn.classList.add("bg-slate-900", "text-slate-100", "border-b-transparent", "hover:bg-slate-800");
//         btn.classList.remove("bg-emerald-600", "text-white", "font-bold");
//     }
//   });
// };

// const updateAuthUI = () => {
//   const u = state.currentUser;
//   const isAdmin = u?.role === 'admin';

//   toggle("loginBtn", !u);
//   toggle("heroLoginBtn", !u);
//   toggle("logoutBtn", u);
//   toggle("userBadge", u);
//   toggle("welcomeWrapper", u);
//   toggle("feedFilters", u);

//   qsa(".protected-nav").forEach(el => {
//       if (el.id === "adminTab") toggle(el, u && isAdmin); 
//       else toggle(el, !!u);
//   });

//   if (u) {
//     qs("badgeName").textContent = u.name;
//     qs("badgeRole").textContent = u.role;
//     qs("welcomeName").textContent = u.name;
//   }
// };

// const requireLogin = () => {
//   if (!state.currentUser) {
//     alert("Please login first.");
//     show("loginModal");
//     return false;
//   }
//   return true;
// };

// // ==========================================
// // 4. DATA LISTENERS (PRIVATE CHAT LOGIC)
// // ==========================================
// const startListeners = () => {
//     // 1. Posts Listener
//     onSnapshot(query(collection(db, "posts"), orderBy("createdAt", "desc")), (snap) => {
//         state.posts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//         renderFeed(); 
//     });

//     // 2. Users Listener
//     onSnapshot(collection(db, "users"), (snap) => {
//         state.users = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//         if (auth.currentUser) {
//             const me = state.users.find(u => u.id === auth.currentUser.uid);
//             if (me && JSON.stringify(state.currentUser) !== JSON.stringify(me)) {
//                 state.currentUser = me;
//                 updateAuthUI();
//                 renderFeed(); 
//                 // Re-init chat listener for new user
//                 subscribeToChats(me.id);
//             }
//         }
//         if(state.currentUser?.role === 'admin') renderAdmin();
//     });
// };

// // Private Chat Listener
// let unsubscribeChats = null;
// const subscribeToChats = (uid) => {
//     if(unsubscribeChats) unsubscribeChats();
//     // Listen for chats where I am a participant
//     const q = query(collection(db, "chats"), where("participants", "array-contains", uid));
//     unsubscribeChats = onSnapshot(q, (snap) => {
//         state.chats = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//         renderInbox(); // Updates Red Dot
        
//         // Update open chat window
//         if (currentChatId && !qs("chatModal").classList.contains("hidden")) {
//             const chat = state.chats.find(c => c.id === currentChatId);
//             if(chat) renderChatMessages(chat);
//         }
//     });
// };

// // ==========================================
// // 5. AUTH HANDLERS
// // ==========================================
// on(qs("registerForm"), "submit", async e => {
//   e.preventDefault();
//   const [name, email, pass] = [qs("regName").value, qs("regEmail").value, qs("regPass").value];
  
//   try {
//     const { user } = await createUserWithEmailAndPassword(auth, email, pass);
//     // Hardcoded Admin Logic
//     const role = (name.toLowerCase() === "bajaish") ? "admin" : "user";
    
//     await setDoc(doc(db, "users", user.uid), { id: user.uid, name, email, role, createdAt: Date.now() });
//     alert("Registered! Please login.");
//     qs("tabLogin").click();
//   } catch (err) { alert(err.message); }
// });

// on(qs("loginForm"), "submit", async e => {
//   e.preventDefault();
//   const name = qs("loginName").value;
//   const password = qs("loginPass").value;
//   const selectedRole = qs("loginRole").value; // Get role from dropdown

//   try {
//     const snap = await getDocs(collection(db, "users"));
//     const userDoc = snap.docs.find(d => d.data().name === name);
//     if (!userDoc) throw new Error("User not found.");
    
//     const userData = userDoc.data();
    
//     // Validate Role Selection
//     if (userData.role !== selectedRole) {
//         throw new Error(`Access Denied: You are not a ${selectedRole}.`);
//     }

//     await signInWithEmailAndPassword(auth, userData.email, password);
    
//     state.currentUser = { id: userDoc.id, ...userData };
//     updateAuthUI();
//     subscribeToChats(state.currentUser.id);
//     renderFeed();
//     hide("loginModal");
//     showSection("feed");
//   } catch (err) { alert(err.message); }
// });

// onAuthStateChanged(auth, async (user) => {
//     if (user) {
//         if (!state.currentUser) {
//             const snap = await getDoc(doc(db, "users", user.uid));
//             if (snap.exists()) {
//                 state.currentUser = { id: snap.id, ...snap.data() };
//                 updateAuthUI();
//                 subscribeToChats(state.currentUser.id);
//                 renderFeed();
//             }
//         }
//     } else {
//         state.currentUser = null;
//         state.chats = []; // Clear chats on logout
//         updateAuthUI();
//         renderFeed();
//         renderInbox();
//     }
// });

// // ==========================================
// // 6. RENDERERS
// // ==========================================
// const renderFeed = () => {
//     const container = qs("feedContainer");
//     let arr = state.posts.filter(p => p.status !== 'removed');
    
//     const pf = qs("priceFilter")?.value || "none";
//     if (pf === "low-high") arr.sort((a,b) => a.price - b.price);
//     if (pf === "high-low") arr.sort((a,b) => b.price - a.price);

//     const cf = qs("creditsFilter")?.value || "all";
//     if (cf === "1-10") arr = arr.filter(p => p.credits >= 1 && p.credits <= 10);
//     if (cf === "50+") arr = arr.filter(p => p.credits >= 50);

//     if(arr.length === 0) container.innerHTML = '<p class="text-slate-400 text-sm mt-2 col-span-full">No posts yet.</p>';
//     else container.innerHTML = arr.map(htmlPost).join("");
    
//     const myName = state.currentUser?.name;
//     if(!qs("userListings").classList.contains("hidden")) {
//         const myPosts = state.posts.filter(p => p.user === myName);
//         qs("userListings").innerHTML = myPosts.length ? myPosts.map(htmlListRow).join("") : '<p class="text-slate-400 text-xs">No listings found.</p>';
//     }
// };

// const renderInbox = () => {
//     if(!state.currentUser) {
//         toggle("inboxIndicator", false);
//         if(qs("inboxList")) qs("inboxList").innerHTML = `<p class="text-slate-400 text-sm">Login required.</p>`;
//         return;
//     }
    
//     const myId = state.currentUser.id;
//     const chats = state.chats;
    
//     // Count Unread Messages (where I am NOT the sender and it's not seen)
//     let totalUnread = 0;
//     chats.forEach(c => {
//         totalUnread += (c.messages || []).filter(m => m.senderId !== myId && !m.seen).length;
//     });
//     toggle("inboxIndicator", totalUnread > 0);

//     const list = qs("inboxList");
//     if(!list) return;

//     if(chats.length === 0) {
//         list.innerHTML = '<p class="text-slate-400 text-sm">No messages yet.</p>';
//         return;
//     }

//     // Sort by latest message time
//     chats.sort((a,b) => (b.updatedAt || 0) - (a.updatedAt || 0));
//     list.innerHTML = chats.map(c => htmlInboxItem(c, myId)).join("");
// };

// const renderAdmin = () => {
//     if(state.currentUser?.role !== 'admin') return;
//     qs("adminList").innerHTML = `
//       <div class="mb-4"><h3 class="font-bold text-sm mb-2 text-emerald-400">Users</h3><table class="w-full text-left">${state.users.map(htmlAdminUser).join("")}</table></div>
//       <div><h3 class="font-bold text-sm mb-2 text-emerald-400">Posts</h3>${state.posts.map(htmlAdminPost).join("")}</div>`;
// };

// // ==========================================
// // 7. ACTIONS (PRIVATE CHAT)
// // ==========================================
// window.startChat = async (postId, ownerName) => {
//     if(!requireLogin()) return;
    
//     const myId = state.currentUser.id;
//     const post = state.posts.find(p => p.id === postId);
    
//     // Identify Owner ID
//     const owner = state.users.find(u => u.name === ownerName);
//     if(!owner) return alert("Owner not found");
//     if(owner.id === myId) return alert("You cannot chat with yourself.");

//     // Check if chat exists
//     let chat = state.chats.find(c => c.postId === postId && c.participants.includes(myId) && c.participants.includes(owner.id));
    
//     if(!chat) {
//         // Create new chat
//         const ref = await addDoc(collection(db, "chats"), {
//             postId: postId,
//             postTitle: post.title,
//             participants: [myId, owner.id],
//             participantNames: [state.currentUser.name, ownerName],
//             messages: [],
//             updatedAt: Date.now()
//         });
//         currentChatId = ref.id;
//         chat = { id: ref.id, postTitle: post.title };
//     } else {
//         currentChatId = chat.id;
//     }

//     qs("chatPostTitle").textContent = chat.postTitle;
//     show("chatModal"); show("chatForm");
    
//     // Fetch latest data for this chat
//     const snap = await getDoc(doc(db, "chats", currentChatId));
//     renderChatMessages({ id: currentChatId, ...snap.data() });
// };

// // Open from Inbox
// window.openExistingChat = (chatId) => {
//     currentChatId = chatId;
//     const chat = state.chats.find(c => c.id === chatId);
//     if(!chat) return;
    
//     qs("chatPostTitle").textContent = chat.postTitle;
//     show("chatModal"); show("chatForm");
//     renderChatMessages(chat);
// };

// const renderChatMessages = (chat) => {
//     const box = qs("chatMessages");
//     const myId = state.currentUser.id;
    
//     box.innerHTML = (chat.messages||[]).map(m => {
//         const isMe = m.senderId === myId;
//         return `<div class="flex ${isMe?'justify-end':'justify-start'}"><div class="px-2 py-1 rounded mb-1 text-xs max-w-[80%] ${isMe?'bg-emerald-600 text-white':'bg-slate-800 text-slate-300'}"><div class="font-bold opacity-50 text-[9px]">${m.senderName}</div>${m.text}</div></div>`;
//     }).join("");
//     box.scrollTop = box.scrollHeight;

//     // Mark seen
//     const needsUpdate = (chat.messages||[]).some(m => m.senderId !== myId && !m.seen);
//     if(needsUpdate) {
//         const updatedMsgs = chat.messages.map(m => (m.senderId !== myId ? {...m, seen: true} : m));
//         updateDoc(doc(db, "chats", chat.id), { messages: updatedMsgs });
//     }
// };

// on(qs("chatForm"), "submit", async e => {
//     e.preventDefault();
//     const text = qs("chatInput").value.trim();
//     if(!text) return;
    
//     const msg = {
//         senderId: state.currentUser.id,
//         senderName: state.currentUser.name,
//         text,
//         time: Date.now(),
//         seen: false
//     };
    
//     await updateDoc(doc(db, "chats", currentChatId), {
//         messages: arrayUnion(msg),
//         updatedAt: Date.now()
//     });
//     qs("chatInput").value = "";
// });

// // ==========================================
// // 8. ACTIONS (POSTS)
// // ==========================================
// window.editPost = (id) => {
//     const p = state.posts.find(x => x.id == id);
//     if(!p) return;
//     editPostId = id;
//     qs("postTitle").value = p.title; qs("postDesc").value = p.desc;
//     qs("postPrice").value = p.price; qs("postCredits").value = p.credits;
//     qs("uploadFormBtn").textContent = "Update Listing"; 
//     show("deleteEditBtn"); // Show Delete
//     qs("createListingTab").click();
// };

// on(qs("deleteEditBtn"), "click", async () => {
//     if(!editPostId) return;
//     if(confirm("Delete this listing permanently?")) {
//         await deleteDoc(doc(db, "posts", editPostId));
//         // Reset
//         qs("uploadForm").reset(); editPostId = null; 
//         qs("uploadFormBtn").textContent = "Upload Listing"; 
//         hide("deleteEditBtn");
//         qs("yourListingsTab").click();
//     }
// });

// window.deleteUser = async (id) => { if(confirm("Delete user?")) await deleteDoc(doc(db, "users", id)); };
// window.deletePost = async (id) => { if(confirm("Delete post?")) await deleteDoc(doc(db, "posts", id)); };

// // Upload Logic
// on(qs("uploadForm"), "submit", async e => {
//   e.preventDefault();
//   if(!requireLogin()) return;
//   const file = qs("postImage").files[0];
//   const reader = new FileReader();
//   const save = async (img) => {
//     const data = { 
//         title: qs("postTitle").value, desc: qs("postDesc").value, 
//         price: Number(qs("postPrice").value), credits: Number(qs("postCredits").value),
//         user: state.currentUser.name, image: img, createdAt: Date.now(), status: "active"
//     };
//     if(editPostId) { 
//         if(!img) delete data.image; 
//         await updateDoc(doc(db, "posts", editPostId), data); 
//     } else { 
//         if(!img) return alert("Image required"); 
//         await addDoc(collection(db, "posts"), data); 
//     }
//     qs("uploadForm").reset(); editPostId = null; 
//     qs("uploadFormBtn").textContent = "Upload Listing"; 
//     hide("deleteEditBtn");
//     qs("yourListingsTab").click();
//   };
//   if(file) { reader.onload = ev => save(ev.target.result); reader.readAsDataURL(file); } else save(null);
// });

// // ==========================================
// // 9. UI BINDINGS
// // ==========================================
// // Toggle Tabs in Auth Modal
// on(qs("tabRegister"), "click", () => {
//     qs("tabRegister").className = "flex-1 py-1.5 text-xs font-semibold rounded-md bg-slate-800 text-white transition-all";
//     qs("tabLogin").className = "flex-1 py-1.5 text-xs font-semibold rounded-md text-slate-400 hover:text-white transition-all";
//     show("registerForm"); hide("loginForm");
// });
// on(qs("tabLogin"), "click", () => {
//     qs("tabLogin").className = "flex-1 py-1.5 text-xs font-semibold rounded-md bg-slate-800 text-white transition-all";
//     qs("tabRegister").className = "flex-1 py-1.5 text-xs font-semibold rounded-md text-slate-400 hover:text-white transition-all";
//     show("loginForm"); hide("registerForm");
// });

// // Listing Tabs
// on(qs("createListingTab"), "click", () => { 
//     show("uploadWrapper"); hide("userListings"); 
//     qs("createListingTab").classList.replace("text-slate-300", "text-white"); qs("createListingTab").classList.add("bg-slate-800");
//     qs("yourListingsTab").classList.replace("text-white", "text-slate-300"); qs("yourListingsTab").classList.remove("bg-slate-800");
//     if(!editPostId) { qs("uploadForm").reset(); qs("uploadFormBtn").textContent = "Upload Listing"; hide("deleteEditBtn"); }
// });
// on(qs("yourListingsTab"), "click", () => { 
//     hide("uploadWrapper"); show("userListings"); 
//     qs("yourListingsTab").classList.replace("text-slate-300", "text-white"); qs("yourListingsTab").classList.add("bg-slate-800");
//     qs("createListingTab").classList.replace("text-white", "text-slate-300"); qs("createListingTab").classList.remove("bg-slate-800");
//     editPostId = null; qs("uploadForm").reset(); qs("uploadFormBtn").textContent = "Upload Listing"; hide("deleteEditBtn");
//     renderFeed(); 
// });

// // Nav & General
// qsa(".nav-btn").forEach(b => on(b, "click", () => {
//     if(b.classList.contains("protected-nav") && !requireLogin()) return;
//     showSection(b.dataset.section);
//     if(b.dataset.section === 'upload') qs("yourListingsTab").click();
// }));

// on(qs("loginBtn"), "click", () => show("loginModal"));
// on(qs("heroLoginBtn"), "click", () => show("loginModal"));
// on(qs("closeLogin"), "click", () => hide("loginModal"));
// on(qs("closeChat"), "click", () => hide("chatModal"));
// on(qs("logoutBtn"), "click", () => { signOut(auth); showSection("landing"); });
// on(qs("heroExploreBtn"), "click", () => { if(requireLogin()) showSection("feed"); });
// on(qs("priceFilter"), "change", renderFeed);
// on(qs("creditsFilter"), "change", renderFeed);
// on(qs("gotoCalcLink"), "click", () => showSection("calculator"));

// // Calculator
// qsa('input[name="calcMethod"]').forEach(r => on(r, "change", () => {
//     const v = document.querySelector('input[name="calcMethod"]:checked').value;
//     toggle("treeForm", v === "trees"); toggle("landForm", v !== "trees"); hide("calcResult");
// }));
// on(qs("calcTreesBtn"), "click", () => {
//     show("calcResult"); qs("totalCredits").textContent = ((qs("treeCount").value * qs("treeType").value * qs("treeYears").value)/1000).toFixed(2) + " Tons CO2";
// });
// on(qs("calcLandBtn"), "click", () => {
//     const factor = qs("landUnit").value === 'hectares' ? 6 : 2.4; 
//     show("calcResult"); qs("totalCredits").textContent = (qs("landArea").value * factor * qs("landYears").value).toFixed(2) + " Tons CO2";
// });

// // ==========================================
// // 10. HTML TEMPLATES
// // ==========================================
// const htmlPost = (p) => {
//     const isMine = state.currentUser && p.user === state.currentUser.name;
//     const badge = isMine ? `<span class="bg-emerald-500 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded ml-2">CREATED BY YOU</span>` : '';
//     // Chat button calls startChat with owner name
//     return `<div class="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow flex flex-col"><img src="${p.image}" class="w-full h-44 object-cover"><div class="p-3 flex flex-col flex-1"><div class="flex justify-between items-start mb-1"><h3 class="font-bold text-sm truncate flex-1">${p.title}</h3>${badge}</div><p class="text-[10px] text-slate-500 mb-2">By ${p.user} • ${new Date(p.createdAt).toLocaleDateString()}</p><p class="text-xs text-slate-400 mb-2 truncate">${p.desc}</p><div class="flex justify-between text-[11px] mb-2"><span class="text-emerald-300 bg-emerald-900/30 px-2 py-0.5 rounded-full">${p.credits} Credits</span><span class="text-white font-bold">₹${p.price}</span></div><div class="mt-auto"><button onclick="window.startChat('${p.id}', '${p.user}')" class="w-full py-2 bg-slate-800 text-xs rounded border border-slate-600 relative hover:bg-slate-700">💬 Chat</button></div></div></div>`;
// };
// const htmlListRow = (p) => `<div class="bg-slate-900 p-2 border border-slate-700 rounded mb-2 flex justify-between text-xs items-center"><span>${p.title}</span><button class="text-emerald-400 underline" onclick="window.editPost('${p.id}')">Edit</button></div>`;
// const htmlInboxItem = (c, myId) => {
//     const msgs = c.messages || [];
//     const last = msgs[msgs.length-1] || { text: 'No messages', senderName: '' };
//     const unread = msgs.filter(m => m.senderId !== myId && !m.seen).length;
//     const otherName = c.participantNames.find(n => n !== state.currentUser.name) || "User";
    
//     return `<div onclick="window.openExistingChat('${c.id}')" class="bg-slate-900 p-3 rounded-lg border border-slate-700 cursor-pointer flex justify-between items-center hover:bg-slate-800"><div><div class="text-sm font-bold text-emerald-100 flex items-center gap-2">${c.postTitle} <span class="text-xs text-slate-400 font-normal">w/ ${otherName}</span> ${unread>0?`<span class="bg-red-500 text-white text-[9px] px-1.5 rounded-full">${unread}</span>`:''}</div><div class="text-xs text-slate-400 truncate max-w-[200px]">${last.senderName}: ${last.text}</div></div><div class="text-xs text-emerald-500">Open</div></div>`;
// };
// const htmlAdminUser = (u) => `<tr class="text-xs border-b border-slate-700"><td class="p-2">${u.name}</td><td class="p-2">${u.role}</td><td class="p-2 text-right"><button onclick="window.deleteUser('${u.id}')" class="text-red-400 hover:text-red-300">Remove</button></td></tr>`;
// const htmlAdminPost = (p) => `<div class="flex justify-between items-center bg-slate-900 p-2 text-xs border border-slate-700 rounded mb-1"><div class="flex flex-col"><span class="font-bold">${p.title}</span><span class="text-[10px] text-slate-400">By ${p.user}</span></div><div class="flex gap-2"><button onclick="window.deletePost('${p.id}')" class="text-red-400">Delete</button></div></div>`;

// const init = () => {
//     updateAuthUI();
//     startListeners();
//     const lastSec = localStorage.getItem(LAST_SECTION_KEY);
//     const target = lastSec && qs("section-" + lastSec) ? lastSec : "landing";
//     showSection(target);
// };

// if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
// else init();



// // ==========================================
// // 1. IMPORTS & CONFIGURATION
// // ==========================================
// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
// import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
// import { getFirestore, collection, addDoc, getDocs, getDoc, doc, updateDoc, arrayUnion, query, orderBy, onSnapshot, setDoc, deleteDoc, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// // ==========================================
// // 2. CORE UTILITIES
// // ==========================================
// const qs = id => document.getElementById(id);
// const qsa = sel => document.querySelectorAll(sel);
// const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

// const getEl = (input) => (typeof input === 'string' ? qs(input) : input);
// const show = (input) => getEl(input)?.classList.remove("hidden");
// const hide = (input) => getEl(input)?.classList.add("hidden");
// const toggle = (input, condition) => condition ? show(input) : hide(input);

// const LAST_SECTION_KEY = "ccx_last_section_vfinal";
// let state = { users: [], posts: [], chats: [], currentUser: null };
// let editPostId = null, currentChatId = null;

// // ==========================================
// // 3. UI NAVIGATION
// // ==========================================
// const showSection = name => {
//   qsa(".section").forEach(s => s.classList.add("hidden"));
//   const target = qs("section-" + name) ? name : "landing";
//   show("section-" + target);
//   localStorage.setItem(LAST_SECTION_KEY, target);
  
//   qsa(".nav-btn").forEach(btn => {
//     const isActive = btn.dataset.section === target;
//     if (isActive) {
//         btn.classList.remove("bg-slate-900", "text-slate-100", "border-b-transparent", "hover:bg-slate-800");
//         btn.classList.add("bg-emerald-600", "text-white", "font-bold");
//     } else {
//         btn.classList.add("bg-slate-900", "text-slate-100", "border-b-transparent", "hover:bg-slate-800");
//         btn.classList.remove("bg-emerald-600", "text-white", "font-bold");
//     }
//   });
// };

// const updateAuthUI = () => {
//   const u = state.currentUser;
//   const isAdmin = u?.role === 'admin';

//   toggle("loginBtn", !u);
//   toggle("heroLoginBtn", !u);
//   toggle("logoutBtn", u);
//   toggle("userBadge", u);
//   toggle("welcomeWrapper", u);
//   toggle("feedFilters", u);

//   qsa(".protected-nav").forEach(el => {
//       if (el.id === "adminTab") toggle(el, u && isAdmin); 
//       else toggle(el, !!u);
//   });

//   if (u) {
//     qs("badgeName").textContent = u.name;
//     qs("badgeRole").textContent = u.role;
//     qs("welcomeName").textContent = u.name;
//   }
// };

// const requireLogin = () => {
//   if (!state.currentUser) {
//     alert("Please login first.");
//     show("loginModal");
//     return false;
//   }
//   return true;
// };

// // ==========================================
// // 4. DATA LISTENERS (PRIVATE CHAT LOGIC)
// // ==========================================
// const startListeners = () => {
//     // 1. Posts Listener
//     onSnapshot(query(collection(db, "posts"), orderBy("createdAt", "desc")), (snap) => {
//         state.posts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//         renderFeed(); 
//     });

//     // 2. Users Listener
//     onSnapshot(collection(db, "users"), (snap) => {
//         state.users = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//         if (auth.currentUser) {
//             const me = state.users.find(u => u.id === auth.currentUser.uid);
//             if (me && JSON.stringify(state.currentUser) !== JSON.stringify(me)) {
//                 state.currentUser = me;
//                 updateAuthUI();
//                 renderFeed(); 
//                 // Re-init chat listener for new user
//                 subscribeToChats(me.id);
//             }
//         }
//         if(state.currentUser?.role === 'admin') renderAdmin();
//     });
// };

// // Private Chat Listener
// let unsubscribeChats = null;
// const subscribeToChats = (uid) => {
//     if(unsubscribeChats) unsubscribeChats();
//     // Listen for chats where I am a participant
//     const q = query(collection(db, "chats"), where("participants", "array-contains", uid));
//     unsubscribeChats = onSnapshot(q, (snap) => {
//         state.chats = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//         renderInbox(); // Updates Red Dot
        
//         // Update open chat window
//         if (currentChatId && !qs("chatModal").classList.contains("hidden")) {
//             const chat = state.chats.find(c => c.id === currentChatId);
//             if(chat) renderChatMessages(chat);
//         }
//     });
// };

// // ==========================================
// // 5. AUTH HANDLERS
// // ==========================================
// on(qs("registerForm"), "submit", async e => {
//   e.preventDefault();
//   const [name, email, pass] = [qs("regName").value, qs("regEmail").value, qs("regPass").value];
  
//   try {
//     const { user } = await createUserWithEmailAndPassword(auth, email, pass);
//     // Hardcoded Admin Logic
//     const role = (name.toLowerCase() === "bajaish") ? "admin" : "user";
    
//     await setDoc(doc(db, "users", user.uid), { id: user.uid, name, email, role, createdAt: Date.now() });
//     alert("Registered! Please login.");
//     qs("tabLogin").click();
//   } catch (err) { alert(err.message); }
// });

// on(qs("loginForm"), "submit", async e => {
//   e.preventDefault();
//   const name = qs("loginName").value;
//   const password = qs("loginPass").value;
//   const selectedRole = qs("loginRole").value; // Get role from dropdown

//   try {
//     const snap = await getDocs(collection(db, "users"));
//     const userDoc = snap.docs.find(d => d.data().name === name);
//     if (!userDoc) throw new Error("User not found.");
    
//     const userData = userDoc.data();
    
//     // Validate Role Selection
//     if (userData.role !== selectedRole) {
//         throw new Error(`Access Denied: You are not a ${selectedRole}.`);
//     }

//     await signInWithEmailAndPassword(auth, userData.email, password);
    
//     state.currentUser = { id: userDoc.id, ...userData };
//     updateAuthUI();
//     subscribeToChats(state.currentUser.id);
//     renderFeed();
//     hide("loginModal");
//     showSection("feed");
//   } catch (err) { alert(err.message); }
// });

// onAuthStateChanged(auth, async (user) => {
//     if (user) {
//         if (!state.currentUser) {
//             const snap = await getDoc(doc(db, "users", user.uid));
//             if (snap.exists()) {
//                 state.currentUser = { id: snap.id, ...snap.data() };
//                 updateAuthUI();
//                 subscribeToChats(state.currentUser.id);
//                 renderFeed();
//             }
//         }
//     } else {
//         state.currentUser = null;
//         state.chats = []; // Clear chats on logout
//         updateAuthUI();
//         renderFeed();
//         renderInbox();
//     }
// });

// // ==========================================
// // 6. RENDERERS
// // ==========================================
// const renderFeed = () => {
//     const container = qs("feedContainer");
//     let arr = state.posts.filter(p => p.status !== 'removed');
    
//     const pf = qs("priceFilter")?.value || "none";
//     if (pf === "low-high") arr.sort((a,b) => a.price - b.price);
//     if (pf === "high-low") arr.sort((a,b) => b.price - a.price);

//     const cf = qs("creditsFilter")?.value || "all";
//     if (cf === "1-10") arr = arr.filter(p => p.credits >= 1 && p.credits <= 10);
//     if (cf === "50+") arr = arr.filter(p => p.credits >= 50);

//     if(arr.length === 0) container.innerHTML = '<p class="text-slate-400 text-sm mt-2 col-span-full">No posts yet.</p>';
//     else container.innerHTML = arr.map(htmlPost).join("");
    
//     const myName = state.currentUser?.name;
//     if(!qs("userListings").classList.contains("hidden")) {
//         const myPosts = state.posts.filter(p => p.user === myName);
//         qs("userListings").innerHTML = myPosts.length ? myPosts.map(htmlListRow).join("") : '<p class="text-slate-400 text-xs">No listings found.</p>';
//     }
// };

// const renderInbox = () => {
//     if(!state.currentUser) {
//         toggle("inboxIndicator", false);
//         if(qs("inboxList")) qs("inboxList").innerHTML = `<p class="text-slate-400 text-sm">Login required.</p>`;
//         return;
//     }
    
//     const myId = state.currentUser.id;
//     const chats = state.chats;
    
//     // Count Unread Messages (where I am NOT the sender and it's not seen)
//     let totalUnread = 0;
//     chats.forEach(c => {
//         totalUnread += (c.messages || []).filter(m => m.senderId !== myId && !m.seen).length;
//     });
//     toggle("inboxIndicator", totalUnread > 0);

//     const list = qs("inboxList");
//     if(!list) return;

//     if(chats.length === 0) {
//         list.innerHTML = '<p class="text-slate-400 text-sm">No messages yet.</p>';
//         return;
//     }

//     // Sort by latest message time
//     chats.sort((a,b) => (b.updatedAt || 0) - (a.updatedAt || 0));
//     list.innerHTML = chats.map(c => htmlInboxItem(c, myId)).join("");
// };

// const renderAdmin = () => {
//     if(state.currentUser?.role !== 'admin') return;
//     qs("adminList").innerHTML = `
//       <div class="mb-4"><h3 class="font-bold text-sm mb-2 text-emerald-400">Users</h3><table class="w-full text-left">${state.users.map(htmlAdminUser).join("")}</table></div>
//       <div><h3 class="font-bold text-sm mb-2 text-emerald-400">Posts</h3>${state.posts.map(htmlAdminPost).join("")}</div>`;
// };

// // ==========================================
// // 7. ACTIONS (PRIVATE CHAT)
// // ==========================================
// window.startChat = async (postId, ownerName) => {
//     if(!requireLogin()) return;
    
//     const myId = state.currentUser.id;
//     const post = state.posts.find(p => p.id === postId);
    
//     // Identify Owner ID
//     const owner = state.users.find(u => u.name === ownerName);
//     if(!owner) return alert("Owner not found");
//     if(owner.id === myId) return alert("You cannot chat with yourself.");

//     // Check if chat exists
//     let chat = state.chats.find(c => c.postId === postId && c.participants.includes(myId) && c.participants.includes(owner.id));
    
//     if(!chat) {
//         // Create new chat
//         const ref = await addDoc(collection(db, "chats"), {
//             postId: postId,
//             postTitle: post.title,
//             participants: [myId, owner.id],
//             participantNames: [state.currentUser.name, ownerName],
//             messages: [],
//             updatedAt: Date.now()
//         });
//         currentChatId = ref.id;
//         chat = { id: ref.id, postTitle: post.title };
//     } else {
//         currentChatId = chat.id;
//     }

//     qs("chatPostTitle").textContent = chat.postTitle;
//     show("chatModal"); show("chatForm");
    
//     // Fetch latest data for this chat
//     const snap = await getDoc(doc(db, "chats", currentChatId));
//     renderChatMessages({ id: currentChatId, ...snap.data() });
// };

// // Open from Inbox
// window.openExistingChat = (chatId) => {
//     currentChatId = chatId;
//     const chat = state.chats.find(c => c.id === chatId);
//     if(!chat) return;
    
//     qs("chatPostTitle").textContent = chat.postTitle;
//     show("chatModal"); show("chatForm");
//     renderChatMessages(chat);
// };

// const renderChatMessages = (chat) => {
//     const box = qs("chatMessages");
//     const myId = state.currentUser.id;
    
//     box.innerHTML = (chat.messages||[]).map(m => {
//         const isMe = m.senderId === myId;
//         return `<div class="flex ${isMe?'justify-end':'justify-start'}"><div class="px-2 py-1 rounded mb-1 text-xs max-w-[80%] ${isMe?'bg-emerald-600 text-white':'bg-slate-800 text-slate-300'}"><div class="font-bold opacity-50 text-[9px]">${m.senderName}</div>${m.text}</div></div>`;
//     }).join("");
//     box.scrollTop = box.scrollHeight;

//     // Mark seen
//     const needsUpdate = (chat.messages||[]).some(m => m.senderId !== myId && !m.seen);
//     if(needsUpdate) {
//         const updatedMsgs = chat.messages.map(m => (m.senderId !== myId ? {...m, seen: true} : m));
//         updateDoc(doc(db, "chats", chat.id), { messages: updatedMsgs });
//     }
// };

// on(qs("chatForm"), "submit", async e => {
//     e.preventDefault();
//     const text = qs("chatInput").value.trim();
//     if(!text) return;
    
//     const msg = {
//         senderId: state.currentUser.id,
//         senderName: state.currentUser.name,
//         text,
//         time: Date.now(),
//         seen: false
//     };
    
//     await updateDoc(doc(db, "chats", currentChatId), {
//         messages: arrayUnion(msg),
//         updatedAt: Date.now()
//     });
//     qs("chatInput").value = "";
// });

// // ==========================================
// // 8. ACTIONS (POSTS)
// // ==========================================
// window.editPost = (id) => {
//     const p = state.posts.find(x => x.id == id);
//     if(!p) return;
//     editPostId = id;
//     qs("postTitle").value = p.title; qs("postDesc").value = p.desc;
//     qs("postPrice").value = p.price; qs("postCredits").value = p.credits;
//     qs("uploadFormBtn").textContent = "Update Listing"; 
//     show("deleteEditBtn"); // Show Delete
//     qs("createListingTab").click();
// };

// on(qs("deleteEditBtn"), "click", async () => {
//     if(!editPostId) return;
//     if(confirm("Delete this listing permanently?")) {
//         await deleteDoc(doc(db, "posts", editPostId));
//         // Reset
//         qs("uploadForm").reset(); editPostId = null; 
//         qs("uploadFormBtn").textContent = "Upload Listing"; 
//         hide("deleteEditBtn");
//         qs("yourListingsTab").click();
//     }
// });

// window.deleteUser = async (id) => { if(confirm("Delete user?")) await deleteDoc(doc(db, "users", id)); };
// window.deletePost = async (id) => { if(confirm("Delete post?")) await deleteDoc(doc(db, "posts", id)); };

// // Upload Logic
// on(qs("uploadForm"), "submit", async e => {
//   e.preventDefault();
//   if(!requireLogin()) return;
//   const file = qs("postImage").files[0];
//   const reader = new FileReader();
//   const save = async (img) => {
//     const data = { 
//         title: qs("postTitle").value, desc: qs("postDesc").value, 
//         price: Number(qs("postPrice").value), credits: Number(qs("postCredits").value),
//         user: state.currentUser.name, image: img, createdAt: Date.now(), status: "active"
//     };
//     if(editPostId) { 
//         if(!img) delete data.image; 
//         await updateDoc(doc(db, "posts", editPostId), data); 
//     } else { 
//         if(!img) return alert("Image required"); 
//         await addDoc(collection(db, "posts"), data); 
//     }
//     qs("uploadForm").reset(); editPostId = null; 
//     qs("uploadFormBtn").textContent = "Upload Listing"; 
//     hide("deleteEditBtn");
//     qs("yourListingsTab").click();
//   };
//   if(file) { reader.onload = ev => save(ev.target.result); reader.readAsDataURL(file); } else save(null);
// });

// // ==========================================
// // 9. UI BINDINGS
// // ==========================================
// // Toggle Tabs in Auth Modal
// on(qs("tabRegister"), "click", () => {
//     qs("tabRegister").className = "flex-1 py-1.5 text-xs font-semibold rounded-md bg-slate-800 text-white transition-all";
//     qs("tabLogin").className = "flex-1 py-1.5 text-xs font-semibold rounded-md text-slate-400 hover:text-white transition-all";
//     show("registerForm"); hide("loginForm");
// });
// on(qs("tabLogin"), "click", () => {
//     qs("tabLogin").className = "flex-1 py-1.5 text-xs font-semibold rounded-md bg-slate-800 text-white transition-all";
//     qs("tabRegister").className = "flex-1 py-1.5 text-xs font-semibold rounded-md text-slate-400 hover:text-white transition-all";
//     show("loginForm"); hide("registerForm");
// });

// // Listing Tabs
// on(qs("createListingTab"), "click", () => { 
//     show("uploadWrapper"); hide("userListings"); 
//     qs("createListingTab").classList.replace("text-slate-300", "text-white"); qs("createListingTab").classList.add("bg-slate-800");
//     qs("yourListingsTab").classList.replace("text-white", "text-slate-300"); qs("yourListingsTab").classList.remove("bg-slate-800");
//     if(!editPostId) { qs("uploadForm").reset(); qs("uploadFormBtn").textContent = "Upload Listing"; hide("deleteEditBtn"); }
// });
// on(qs("yourListingsTab"), "click", () => { 
//     hide("uploadWrapper"); show("userListings"); 
//     qs("yourListingsTab").classList.replace("text-slate-300", "text-white"); qs("yourListingsTab").classList.add("bg-slate-800");
//     qs("createListingTab").classList.replace("text-white", "text-slate-300"); qs("createListingTab").classList.remove("bg-slate-800");
//     editPostId = null; qs("uploadForm").reset(); qs("uploadFormBtn").textContent = "Upload Listing"; hide("deleteEditBtn");
//     renderFeed(); 
// });

// // Nav & General
// qsa(".nav-btn").forEach(b => on(b, "click", () => {
//     if(b.classList.contains("protected-nav") && !requireLogin()) return;
//     showSection(b.dataset.section);
//     if(b.dataset.section === 'upload') qs("yourListingsTab").click();
// }));

// on(qs("loginBtn"), "click", () => show("loginModal"));
// on(qs("heroLoginBtn"), "click", () => show("loginModal"));
// on(qs("closeLogin"), "click", () => hide("loginModal"));
// on(qs("closeChat"), "click", () => hide("chatModal"));
// on(qs("logoutBtn"), "click", () => { signOut(auth); showSection("landing"); });
// on(qs("heroExploreBtn"), "click", () => { if(requireLogin()) showSection("feed"); });
// on(qs("priceFilter"), "change", renderFeed);
// on(qs("creditsFilter"), "change", renderFeed);
// on(qs("gotoCalcLink"), "click", () => showSection("calculator"));

// // Calculator
// qsa('input[name="calcMethod"]').forEach(r => on(r, "change", () => {
//     const v = document.querySelector('input[name="calcMethod"]:checked').value;
//     toggle("treeForm", v === "trees"); toggle("landForm", v !== "trees"); hide("calcResult");
// }));
// on(qs("calcTreesBtn"), "click", () => {
//     show("calcResult"); qs("totalCredits").textContent = ((qs("treeCount").value * qs("treeType").value * qs("treeYears").value)/1000).toFixed(2) + " Tons CO2";
// });
// on(qs("calcLandBtn"), "click", () => {
//     const factor = qs("landUnit").value === 'hectares' ? 6 : 2.4; 
//     show("calcResult"); qs("totalCredits").textContent = (qs("landArea").value * factor * qs("landYears").value).toFixed(2) + " Tons CO2";
// });

// // ==========================================
// // 10. HTML TEMPLATES
// // ==========================================
// const htmlPost = (p) => {
//     const isMine = state.currentUser && p.user === state.currentUser.name;
//     const badge = isMine ? `<span class="bg-emerald-500 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded ml-2">CREATED BY YOU</span>` : '';
//     // Chat button calls startChat with owner name
//     return `<div class="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow flex flex-col"><img src="${p.image}" class="w-full h-44 object-cover"><div class="p-3 flex flex-col flex-1"><div class="flex justify-between items-start mb-1"><h3 class="font-bold text-sm truncate flex-1">${p.title}</h3>${badge}</div><p class="text-[10px] text-slate-500 mb-2">By ${p.user} • ${new Date(p.createdAt).toLocaleDateString()}</p><p class="text-xs text-slate-400 mb-2 truncate">${p.desc}</p><div class="flex justify-between text-[11px] mb-2"><span class="text-emerald-300 bg-emerald-900/30 px-2 py-0.5 rounded-full">${p.credits} Credits</span><span class="text-white font-bold">₹${p.price}</span></div><div class="mt-auto"><button onclick="window.startChat('${p.id}', '${p.user}')" class="w-full py-2 bg-slate-800 text-xs rounded border border-slate-600 relative hover:bg-slate-700">💬 Chat</button></div></div></div>`;
// };
// const htmlListRow = (p) => `<div class="bg-slate-900 p-2 border border-slate-700 rounded mb-2 flex justify-between text-xs items-center"><span>${p.title}</span><button class="text-emerald-400 underline" onclick="window.editPost('${p.id}')">Edit</button></div>`;
// const htmlInboxItem = (c, myId) => {
//     const msgs = c.messages || [];
//     const last = msgs[msgs.length-1] || { text: 'No messages', senderName: '' };
//     const unread = msgs.filter(m => m.senderId !== myId && !m.seen).length;
//     const otherName = c.participantNames.find(n => n !== state.currentUser.name) || "User";
    
//     return `<div onclick="window.openExistingChat('${c.id}')" class="bg-slate-900 p-3 rounded-lg border border-slate-700 cursor-pointer flex justify-between items-center hover:bg-slate-800"><div><div class="text-sm font-bold text-emerald-100 flex items-center gap-2">${c.postTitle} <span class="text-xs text-slate-400 font-normal">w/ ${otherName}</span> ${unread>0?`<span class="bg-red-500 text-white text-[9px] px-1.5 rounded-full">${unread}</span>`:''}</div><div class="text-xs text-slate-400 truncate max-w-[200px]">${last.senderName}: ${last.text}</div></div><div class="text-xs text-emerald-500">Open</div></div>`;
// };
// const htmlAdminUser = (u) => `<tr class="text-xs border-b border-slate-700"><td class="p-2">${u.name}</td><td class="p-2">${u.role}</td><td class="p-2 text-right"><button onclick="window.deleteUser('${u.id}')" class="text-red-400 hover:text-red-300">Remove</button></td></tr>`;
// const htmlAdminPost = (p) => `<div class="flex justify-between items-center bg-slate-900 p-2 text-xs border border-slate-700 rounded mb-1"><div class="flex flex-col"><span class="font-bold">${p.title}</span><span class="text-[10px] text-slate-400">By ${p.user}</span></div><div class="flex gap-2"><button onclick="window.deletePost('${p.id}')" class="text-red-400">Delete</button></div></div>`;

// const init = () => {
//     updateAuthUI();
//     startListeners();
//     const lastSec = localStorage.getItem(LAST_SECTION_KEY);
//     const target = lastSec && qs("section-" + lastSec) ? lastSec : "landing";
//     showSection(target);
// };

// if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
// else init();




// // ==========================================
// // 1. IMPORTS & CONFIGURATION
// // ==========================================
// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
// import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
// import { getFirestore, collection, addDoc, getDocs, getDoc, doc, updateDoc, arrayUnion, query, orderBy, onSnapshot, setDoc, deleteDoc, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// // ==========================================
// // 2. CORE UTILITIES
// // ==========================================
// const qs = id => document.getElementById(id);
// const qsa = sel => document.querySelectorAll(sel);
// const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

// const getEl = (input) => (typeof input === 'string' ? qs(input) : input);
// const show = (input) => getEl(input)?.classList.remove("hidden");
// const hide = (input) => getEl(input)?.classList.add("hidden");
// const toggle = (input, condition) => condition ? show(input) : hide(input);

// const LAST_SECTION_KEY = "ccx_last_section_v15";
// // State now includes 'chats' for private messaging
// let state = { users: [], posts: [], chats: [], currentUser: null };
// let editPostId = null, currentChatId = null;

// // ==========================================
// // 3. UI NAVIGATION
// // ==========================================
// const showSection = name => {
//   qsa(".section").forEach(s => s.classList.add("hidden"));
//   const target = qs("section-" + name) ? name : "landing";
//   show("section-" + target);
//   localStorage.setItem(LAST_SECTION_KEY, target);
  
//   qsa(".nav-btn").forEach(btn => {
//     const isActive = btn.dataset.section === target;
//     if (isActive) {
//         btn.classList.remove("bg-slate-900", "text-slate-100", "border-b-transparent", "hover:bg-slate-800");
//         btn.classList.add("bg-emerald-600", "text-white", "font-bold");
//     } else {
//         btn.classList.add("bg-slate-900", "text-slate-100", "border-b-transparent", "hover:bg-slate-800");
//         btn.classList.remove("bg-emerald-600", "text-white", "font-bold");
//     }
//   });
// };

// const updateAuthUI = () => {
//   const u = state.currentUser;
//   const isAdmin = u?.role === 'admin';

//   toggle("loginBtn", !u);
//   toggle("heroLoginBtn", !u);
//   toggle("logoutBtn", u);
//   toggle("userBadge", u);
//   toggle("welcomeWrapper", u);
//   toggle("feedFilters", u);

//   qsa(".protected-nav").forEach(el => {
//       if (el.id === "adminTab") toggle(el, u && isAdmin); 
//       else toggle(el, !!u);
//   });

//   if (u) {
//     qs("badgeName").textContent = u.name;
//     qs("badgeRole").textContent = u.role;
//     qs("welcomeName").textContent = u.name;
//   }
// };

// const requireLogin = () => {
//   if (!state.currentUser) {
//     alert("Please login first.");
//     show("loginModal");
//     return false;
//   }
//   return true;
// };

// // ==========================================
// // 4. DATA LISTENERS (FIXED FOR INBOX)
// // ==========================================
// const startListeners = () => {
//     // 1. Posts Listener (Feed)
//     onSnapshot(query(collection(db, "posts"), orderBy("createdAt", "desc")), (snap) => {
//         state.posts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//         renderFeed(); 
//     });

//     // 2. Users Listener (Sync Profile)
//     onSnapshot(collection(db, "users"), (snap) => {
//         state.users = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
//         // If logged in, ensure state matches DB
//         if (auth.currentUser) {
//             const me = state.users.find(u => u.id === auth.currentUser.uid);
//             if (me) {
//                 // If this is a fresh load or update, set user and start chat listener
//                 if (!state.currentUser || JSON.stringify(state.currentUser) !== JSON.stringify(me)) {
//                     state.currentUser = me;
//                     updateAuthUI();
//                     renderFeed();
//                     subscribeToChats(me.id); // <--- START INBOX LISTENER
//                 }
//             }
//         }
//         if(state.currentUser?.role === 'admin') renderAdmin();
//     });
// };

// // 3. Private Chat Listener (The Inbox Fix)
// let unsubscribeChats = null;
// const subscribeToChats = (uid) => {
//     if(unsubscribeChats) unsubscribeChats(); // Stop old listener
    
//     // Query chats where I am a participant
//     const q = query(collection(db, "chats"), where("participants", "array-contains", uid));
    
//     unsubscribeChats = onSnapshot(q, (snap) => {
//         state.chats = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
//         renderInbox(); // <--- Updates UI and Red Dot
        
//         // If chat modal is open, update messages in real-time
//         if (currentChatId && !qs("chatModal").classList.contains("hidden")) {
//             const chat = state.chats.find(c => c.id === currentChatId);
//             if(chat) renderChatMessages(chat);
//         }
//     });
// };

// // ==========================================
// // 5. AUTH HANDLERS
// // ==========================================
// on(qs("registerForm"), "submit", async e => {
//   e.preventDefault();
//   const [name, email, pass] = [qs("regName").value, qs("regEmail").value, qs("regPass").value];
//   try {
//     const { user } = await createUserWithEmailAndPassword(auth, email, pass);
//     const role = (name.toLowerCase() === "bajaish") ? "admin" : "user";
//     await setDoc(doc(db, "users", user.uid), { id: user.uid, name, email, role, createdAt: Date.now() });
//     alert("Registered! Please login.");
//     qs("tabLogin").click();
//   } catch (err) { alert(err.message); }
// });

// on(qs("loginForm"), "submit", async e => {
//   e.preventDefault();
//   const name = qs("loginName").value;
//   const password = qs("loginPass").value;
//   const selectedRole = qs("loginRole").value;

//   try {
//     const snap = await getDocs(collection(db, "users"));
//     const userDoc = snap.docs.find(d => d.data().name === name);
//     if (!userDoc) throw new Error("User not found.");
    
//     const userData = userDoc.data();
//     if (userData.role !== selectedRole) throw new Error(`Access Denied: You are not a ${selectedRole}.`);

//     await signInWithEmailAndPassword(auth, userData.email, password);
    
//     // Immediate Manual Set (Fixes lag)
//     state.currentUser = { id: userDoc.id, ...userData };
//     updateAuthUI();
//     subscribeToChats(state.currentUser.id); // Start Inbox immediately
//     renderFeed();
//     hide("loginModal");
//     showSection("feed");
//   } catch (err) { alert(err.message); }
// });

// onAuthStateChanged(auth, async (user) => {
//     if (user) {
//         if (!state.currentUser) {
//             const snap = await getDoc(doc(db, "users", user.uid));
//             if (snap.exists()) {
//                 state.currentUser = { id: snap.id, ...snap.data() };
//                 updateAuthUI();
//                 subscribeToChats(state.currentUser.id);
//                 renderFeed();
//             }
//         }
//     } else {
//         state.currentUser = null;
//         state.chats = [];
//         updateAuthUI();
//         renderFeed();
//         renderInbox();
//     }
// });

// // ==========================================
// // 6. RENDERERS
// // ==========================================
// const renderFeed = () => {
//     const container = qs("feedContainer");
//     let arr = state.posts.filter(p => p.status !== 'removed');
    
//     const pf = qs("priceFilter")?.value || "none";
//     if (pf === "low-high") arr.sort((a,b) => a.price - b.price);
//     if (pf === "high-low") arr.sort((a,b) => b.price - a.price);

//     const cf = qs("creditsFilter")?.value || "all";
//     if (cf === "1-10") arr = arr.filter(p => p.credits >= 1 && p.credits <= 10);
//     if (cf === "50+") arr = arr.filter(p => p.credits >= 50);

//     container.innerHTML = arr.length ? arr.map(htmlPost).join("") : '<p class="text-slate-400 text-sm mt-2 col-span-full">No posts yet.</p>';
    
//     const myName = state.currentUser?.name;
//     if(!qs("userListings").classList.contains("hidden")) {
//         const myPosts = state.posts.filter(p => p.user === myName);
//         qs("userListings").innerHTML = myPosts.length ? myPosts.map(htmlListRow).join("") : '<p class="text-slate-400 text-xs">No listings found.</p>';
//     }
// };

// const renderInbox = () => {
//     const list = qs("inboxList");
    
//     // 1. If not logged in, show nothing or prompts
//     if(!state.currentUser) {
//         toggle("inboxIndicator", false);
//         if(list) list.innerHTML = `<p class="text-slate-400 text-sm">Login required.</p>`;
//         return;
//     }
    
//     const myId = state.currentUser.id;
//     const chats = state.chats || [];
    
//     // 2. Count Unread
//     let totalUnread = 0;
//     chats.forEach(c => {
//         totalUnread += (c.messages || []).filter(m => m.senderId !== myId && !m.seen).length;
//     });
//     toggle("inboxIndicator", totalUnread > 0);

//     if(!list) return;

//     if(chats.length === 0) {
//         list.innerHTML = '<p class="text-slate-400 text-sm">No messages yet.</p>';
//         return;
//     }

//     chats.sort((a,b) => (b.updatedAt || 0) - (a.updatedAt || 0));
//     list.innerHTML = chats.map(c => htmlInboxItem(c, myId)).join("");
// };

// const renderAdmin = () => {
//     if(state.currentUser?.role !== 'admin') return;
//     qs("adminList").innerHTML = `
//       <div class="mb-4"><h3 class="font-bold text-sm mb-2 text-emerald-400">Users</h3><table class="w-full text-left">${state.users.map(htmlAdminUser).join("")}</table></div>
//       <div><h3 class="font-bold text-sm mb-2 text-emerald-400">Posts</h3>${state.posts.map(htmlAdminPost).join("")}</div>`;
// };

// // ==========================================
// // 7. ACTIONS (CHAT - FIXED)
// // ==========================================
// // This replaces the old 'openChat' with logic to Find or Create a Chat Room
// window.startChat = async (postId, ownerName) => {
//     if(!requireLogin()) return;
    
//     const myId = state.currentUser.id;
    
//     // Find owner ID from name (since posts store name)
//     const owner = state.users.find(u => u.name === ownerName);
    
//     if(!owner) return alert("Error: User not found.");
//     if(owner.id === myId) return alert("You cannot chat with yourself.");

//     // Check if chat exists
//     let chat = state.chats.find(c => c.postId === postId && c.participants.includes(myId) && c.participants.includes(owner.id));
    
//     if(!chat) {
//         // Create new chat
//         const post = state.posts.find(p => p.id === postId);
//         const ref = await addDoc(collection(db, "chats"), {
//             postId: postId,
//             postTitle: post.title,
//             participants: [myId, owner.id],
//             participantNames: [state.currentUser.name, ownerName],
//             messages: [],
//             updatedAt: Date.now()
//         });
//         currentChatId = ref.id;
//         chat = { id: ref.id, postTitle: post.title, messages: [] };
//     } else {
//         currentChatId = chat.id;
//     }

//     qs("chatPostTitle").textContent = chat.postTitle;
//     show("chatModal"); show("chatForm");
//     renderChatMessages(chat);
// };

// window.openExistingChat = (chatId) => {
//     currentChatId = chatId;
//     const chat = state.chats.find(c => c.id === chatId);
//     if(!chat) return;
    
//     qs("chatPostTitle").textContent = chat.postTitle;
//     show("chatModal"); show("chatForm");
//     renderChatMessages(chat);
// };

// const renderChatMessages = (chat) => {
//     const box = qs("chatMessages");
//     const myId = state.currentUser.id;
    
//     box.innerHTML = (chat.messages||[]).map(m => {
//         const isMe = m.senderId === myId;
//         return `<div class="flex ${isMe?'justify-end':'justify-start'}"><div class="px-2 py-1 rounded mb-1 text-xs max-w-[80%] ${isMe?'bg-emerald-600 text-white':'bg-slate-800 text-slate-300'}"><div class="font-bold opacity-50 text-[9px]">${m.senderName}</div>${m.text}</div></div>`;
//     }).join("");
//     box.scrollTop = box.scrollHeight;

//     // Mark seen
//     const needsUpdate = (chat.messages||[]).some(m => m.senderId !== myId && !m.seen);
//     if(needsUpdate) {
//         const updatedMsgs = chat.messages.map(m => (m.senderId !== myId ? {...m, seen: true} : m));
//         updateDoc(doc(db, "chats", chat.id), { messages: updatedMsgs });
//     }
// };

// on(qs("chatForm"), "submit", async e => {
//     e.preventDefault();
//     const text = qs("chatInput").value.trim();
//     if(!text) return;
    
//     const msg = {
//         senderId: state.currentUser.id,
//         senderName: state.currentUser.name,
//         text,
//         time: Date.now(),
//         seen: false
//     };
    
//     await updateDoc(doc(db, "chats", currentChatId), {
//         messages: arrayUnion(msg),
//         updatedAt: Date.now()
//     });
//     qs("chatInput").value = "";
// });

// window.viewAdminChat = (pid) => { /* Admin view can be expanded later if needed */ };

// // ==========================================
// // 8. ACTIONS (POSTS)
// // ==========================================
// window.editPost = (id) => {
//     const p = state.posts.find(x => x.id == id);
//     if(!p) return;
//     editPostId = id;
//     qs("postTitle").value = p.title; qs("postDesc").value = p.desc;
//     qs("postPrice").value = p.price; qs("postCredits").value = p.credits;
//     qs("uploadFormBtn").textContent = "Update Listing"; 
//     show("deleteEditBtn"); 
//     qs("createListingTab").click();
// };

// on(qs("deleteEditBtn"), "click", async () => {
//     if(!editPostId) return;
//     if(confirm("Delete this listing permanently?")) {
//         await deleteDoc(doc(db, "posts", editPostId));
//         qs("uploadForm").reset(); editPostId = null; 
//         qs("uploadFormBtn").textContent = "Upload Listing"; 
//         hide("deleteEditBtn");
//         qs("yourListingsTab").click();
//     }
// });

// window.deleteUser = async (id) => { if(confirm("Delete user?")) await deleteDoc(doc(db, "users", id)); };
// window.deletePost = async (id) => { if(confirm("Delete post?")) await deleteDoc(doc(db, "posts", id)); };

// on(qs("uploadForm"), "submit", async e => {
//   e.preventDefault();
//   if(!requireLogin()) return;
//   const file = qs("postImage").files[0];
//   const reader = new FileReader();
//   const save = async (img) => {
//     const data = { 
//         title: qs("postTitle").value, desc: qs("postDesc").value, 
//         price: Number(qs("postPrice").value), credits: Number(qs("postCredits").value),
//         user: state.currentUser.name, image: img, createdAt: Date.now(), status: "active"
//     };
//     if(editPostId) { if(!img) delete data.image; await updateDoc(doc(db, "posts", editPostId), data); }
//     else { if(!img) return alert("Image required"); await addDoc(collection(db, "posts"), data); }
//     qs("uploadForm").reset(); editPostId = null; 
//     qs("uploadFormBtn").textContent = "Upload Listing"; hide("deleteEditBtn");
//     qs("yourListingsTab").click();
//   };
//   if(file) { reader.onload = ev => save(ev.target.result); reader.readAsDataURL(file); } else save(null);
// });

// // ==========================================
// // 9. UI BINDINGS
// // ==========================================
// on(qs("tabRegister"), "click", () => {
//     qs("tabRegister").className = "flex-1 py-1.5 text-xs font-semibold rounded-md bg-slate-800 text-white transition-all";
//     qs("tabLogin").className = "flex-1 py-1.5 text-xs font-semibold rounded-md text-slate-400 hover:text-white transition-all";
//     show("registerForm"); hide("loginForm");
// });
// on(qs("tabLogin"), "click", () => {
//     qs("tabLogin").className = "flex-1 py-1.5 text-xs font-semibold rounded-md bg-slate-800 text-white transition-all";
//     qs("tabRegister").className = "flex-1 py-1.5 text-xs font-semibold rounded-md text-slate-400 hover:text-white transition-all";
//     show("loginForm"); hide("registerForm");
// });

// on(qs("createListingTab"), "click", () => { 
//     show("uploadWrapper"); hide("userListings"); 
//     qs("createListingTab").classList.replace("text-slate-300", "text-white"); qs("createListingTab").classList.add("bg-slate-800");
//     qs("yourListingsTab").classList.replace("text-white", "text-slate-300"); qs("yourListingsTab").classList.remove("bg-slate-800");
//     if(!editPostId) { qs("uploadForm").reset(); qs("uploadFormBtn").textContent = "Upload Listing"; hide("deleteEditBtn"); }
// });
// on(qs("yourListingsTab"), "click", () => { 
//     hide("uploadWrapper"); show("userListings"); 
//     qs("yourListingsTab").classList.replace("text-slate-300", "text-white"); qs("yourListingsTab").classList.add("bg-slate-800");
//     qs("createListingTab").classList.replace("text-white", "text-slate-300"); qs("createListingTab").classList.remove("bg-slate-800");
//     editPostId = null; qs("uploadForm").reset(); qs("uploadFormBtn").textContent = "Upload Listing"; hide("deleteEditBtn");
//     renderFeed(); 
// });

// qsa(".nav-btn").forEach(b => on(b, "click", () => {
//     if(b.classList.contains("protected-nav") && !requireLogin()) return;
//     showSection(b.dataset.section);
//     if(b.dataset.section === 'upload') qs("yourListingsTab").click();
// }));

// on(qs("loginBtn"), "click", () => show("loginModal"));
// on(qs("heroLoginBtn"), "click", () => show("loginModal"));
// on(qs("closeLogin"), "click", () => hide("loginModal"));
// on(qs("closeChat"), "click", () => hide("chatModal"));
// on(qs("logoutBtn"), "click", () => { signOut(auth); showSection("landing"); });
// on(qs("heroExploreBtn"), "click", () => { if(requireLogin()) showSection("feed"); });
// on(qs("priceFilter"), "change", renderFeed);
// on(qs("creditsFilter"), "change", renderFeed);
// on(qs("gotoCalcLink"), "click", () => showSection("calculator"));

// // Calculator
// qsa('input[name="calcMethod"]').forEach(r => on(r, "change", () => {
//     const v = document.querySelector('input[name="calcMethod"]:checked').value;
//     toggle("treeForm", v === "trees"); toggle("landForm", v !== "trees"); hide("calcResult");
// }));
// on(qs("calcTreesBtn"), "click", () => { show("calcResult"); qs("totalCredits").textContent = ((qs("treeCount").value * qs("treeType").value * qs("treeYears").value)/1000).toFixed(2) + " Tons CO2"; });
// on(qs("calcLandBtn"), "click", () => { const factor = qs("landUnit").value === 'hectares' ? 6 : 2.4; show("calcResult"); qs("totalCredits").textContent = (qs("landArea").value * factor * qs("landYears").value).toFixed(2) + " Tons CO2"; });

// // ==========================================
// // 10. HTML TEMPLATES
// // ==========================================
// const htmlPost = (p) => {
//     const isMine = state.currentUser && p.user === state.currentUser.name;
//     const badge = isMine ? `<span class="bg-emerald-500 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded ml-2">CREATED BY YOU</span>` : '';
//     // FIXED: startChat call
//     return `<div class="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow flex flex-col"><img src="${p.image}" class="w-full h-44 object-cover"><div class="p-3 flex flex-col flex-1"><div class="flex justify-between items-start mb-1"><h3 class="font-bold text-sm truncate flex-1">${p.title}</h3>${badge}</div><p class="text-[10px] text-slate-500 mb-2">By ${p.user} • ${new Date(p.createdAt).toLocaleDateString()}</p><p class="text-xs text-slate-400 mb-2 truncate">${p.desc}</p><div class="flex justify-between text-[11px] mb-2"><span class="text-emerald-300 bg-emerald-900/30 px-2 py-0.5 rounded-full">${p.credits} Credits</span><span class="text-white font-bold">₹${p.price}</span></div><div class="mt-auto"><button onclick="window.startChat('${p.id}', '${p.user}')" class="w-full py-2 bg-slate-800 text-xs rounded border border-slate-600 relative hover:bg-slate-700">💬 Chat</button></div></div></div>`;
// };
// const htmlListRow = (p) => `<div class="bg-slate-900 p-2 border border-slate-700 rounded mb-2 flex justify-between text-xs items-center"><span>${p.title}</span><button class="text-emerald-400 underline" onclick="window.editPost('${p.id}')">Edit</button></div>`;
// const htmlInboxItem = (c, myId) => {
//     const msgs = c.messages || [];
//     const last = msgs[msgs.length-1] || { text: 'No messages', senderName: '' };
//     const unread = msgs.filter(m => m.senderId !== myId && !m.seen).length;
//     const otherName = c.participantNames.find(n => n !== state.currentUser.name) || "User";
    
//     return `<div onclick="window.openExistingChat('${c.id}')" class="bg-slate-900 p-3 rounded-lg border border-slate-700 cursor-pointer flex justify-between items-center hover:bg-slate-800"><div><div class="text-sm font-bold text-emerald-100 flex items-center gap-2">${c.postTitle} <span class="text-xs text-slate-400 font-normal">w/ ${otherName}</span> ${unread>0?`<span class="bg-red-500 text-white text-[9px] px-1.5 rounded-full">${unread}</span>`:''}</div><div class="text-xs text-slate-400 truncate max-w-[200px]">${last.senderName}: ${last.text}</div></div><div class="text-xs text-emerald-500">Open</div></div>`;
// };
// const htmlAdminUser = (u) => `<tr class="text-xs border-b border-slate-700"><td class="p-2">${u.name}</td><td class="p-2">${u.role}</td><td class="p-2 text-right"><button onclick="window.deleteUser('${u.id}')" class="text-red-400 hover:text-red-300">Remove</button></td></tr>`;
// const htmlAdminPost = (p) => `<div class="flex justify-between items-center bg-slate-900 p-2 text-xs border border-slate-700 rounded mb-1"><div class="flex flex-col"><span class="font-bold">${p.title}</span><span class="text-[10px] text-slate-400">By ${p.user}</span></div><div class="flex gap-2"><button onclick="window.deletePost('${p.id}')" class="text-red-400">Delete</button></div></div>`;

// const init = () => {
//     updateAuthUI();
//     startListeners();
//     const lastSec = localStorage.getItem(LAST_SECTION_KEY);
//     const target = lastSec && qs("section-" + lastSec) ? lastSec : "landing";
//     showSection(target);
// };

// if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
// else init();




// // ==========================================
// // 1. FIREBASE SETUP
// // ==========================================
// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
// import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
// import { getFirestore, collection, addDoc, getDocs, getDoc, doc, updateDoc, arrayUnion, query, orderBy, onSnapshot, setDoc, deleteDoc, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// // ==========================================
// // 2. STATE & UTILS
// // ==========================================
// const qs = (id) => document.getElementById(id);
// const qsa = (sel) => document.querySelectorAll(sel);
// const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

// const show = (id) => qs(id)?.classList.remove("hidden");
// const hide = (id) => qs(id)?.classList.add("hidden");
// const toggle = (id, condition) => condition ? show(id) : hide(id);

// const LAST_SECTION_KEY = "ccx_section_final";
// let state = { users: [], posts: [], chats: [], currentUser: null };
// let editPostId = null;
// let currentChatId = null;
// let unsubscribeChats = null;

// // ==========================================
// // 3. UI LOGIC
// // ==========================================
// const showSection = (name) => {
//     qsa(".section").forEach(s => s.classList.add("hidden"));
//     const target = qs("section-" + name) ? name : "landing";
//     show("section-" + target);
//     localStorage.setItem(LAST_SECTION_KEY, target);

//     // Highlight Tabs
//     qsa(".nav-btn").forEach(btn => {
//         const isActive = btn.dataset.section === target;
//         if(isActive) {
//             btn.classList.add("bg-emerald-600", "text-white", "border-transparent");
//             btn.classList.remove("bg-slate-900", "text-slate-100", "border-slate-800");
//         } else {
//             btn.classList.remove("bg-emerald-600", "text-white", "border-transparent");
//             btn.classList.add("bg-slate-900", "text-slate-100", "border-slate-800");
//         }
//     });
// };

// const updateAuthUI = () => {
//     const u = state.currentUser;
//     const isAdmin = u?.role === 'admin';

//     toggle("loginBtn", !u);
//     toggle("heroLoginBtn", !u);
//     toggle("logoutBtn", u);
//     toggle("userBadge", u);
//     toggle("welcomeWrapper", u);
//     toggle("feedFilters", u);

//     qsa(".protected-nav").forEach(el => {
//         if(el.id === "adminTab") toggle(el, u && isAdmin);
//         else toggle(el, !!u);
//     });

//     if(u) {
//         qs("badgeName").textContent = u.name;
//         qs("badgeRole").textContent = u.role;
//         qs("welcomeName").textContent = u.name;
//     }
// };

// // ==========================================
// // 4. DATA LOGIC
// // ==========================================
// const startListeners = () => {
//     // Posts
//     onSnapshot(query(collection(db, "posts"), orderBy("createdAt", "desc")), (snap) => {
//         state.posts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//         renderFeed();
//     });

//     // Users
//     onSnapshot(collection(db, "users"), (snap) => {
//         state.users = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//         if(auth.currentUser) {
//             const me = state.users.find(u => u.id === auth.currentUser.uid);
//             if(me && JSON.stringify(me) !== JSON.stringify(state.currentUser)) {
//                 state.currentUser = me;
//                 updateAuthUI();
//                 startChatListener(me.id);
//             }
//         }
//         if(state.currentUser?.role === 'admin') renderAdmin();
//     });
// };

// const startChatListener = (uid) => {
//     if(unsubscribeChats) unsubscribeChats();
//     // Query chats where user is participant
//     const q = query(collection(db, "chats"), where("participants", "array-contains", uid));
//     unsubscribeChats = onSnapshot(q, (snap) => {
//         state.chats = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//         renderInbox();
        
//         // If chat open, update it
//         if(currentChatId && !qs("chatModal").classList.contains("hidden")) {
//             const chat = state.chats.find(c => c.id === currentChatId);
//             if(chat) renderChatMessages(chat);
//         }
//     });
// };

// // ==========================================
// // 5. FUNCTIONS (Window Exposed)
// // ==========================================

// // START CHAT (From Feed)
// const startChat = async (postId, ownerName) => {
//     if(!state.currentUser) return show("loginModal");
    
//     const myId = state.currentUser.id;
//     const owner = state.users.find(u => u.name === ownerName);
    
//     if(!owner) return alert("User not found");
//     if(owner.id === myId) return alert("You cannot chat with yourself");

//     // Check existing chat
//     let chat = state.chats.find(c => c.postId === postId && c.participants.includes(myId) && c.participants.includes(owner.id));
    
//     if(!chat) {
//         const post = state.posts.find(p => p.id === postId);
//         const ref = await addDoc(collection(db, "chats"), {
//             postId, postTitle: post.title,
//             participants: [myId, owner.id],
//             participantNames: [state.currentUser.name, ownerName],
//             messages: [],
//             updatedAt: Date.now()
//         });
//         chat = { id: ref.id, postTitle: post.title, messages: [] };
//         currentChatId = ref.id;
//     } else {
//         currentChatId = chat.id;
//     }
    
//     openChatModal(chat);
// };

// // OPEN CHAT (From Inbox)
// const openExistingChat = (chatId) => {
//     currentChatId = chatId;
//     const chat = state.chats.find(c => c.id === chatId);
//     if(chat) openChatModal(chat);
// };

// // INTERNAL MODAL OPENER
// const openChatModal = (chat) => {
//     qs("chatPostTitle").textContent = chat.postTitle;
//     show("chatModal");
//     renderChatMessages(chat);
    
//     // Mark seen
//     const myId = state.currentUser.id;
//     const hasUnread = (chat.messages||[]).some(m => m.senderId !== myId && !m.seen);
//     if(hasUnread) {
//         const updated = chat.messages.map(m => m.senderId !== myId ? {...m, seen: true} : m);
//         updateDoc(doc(db, "chats", chat.id), { messages: updated });
//     }
// };

// const renderChatMessages = (chat) => {
//     const box = qs("chatMessages");
//     const myId = state.currentUser.id;
//     box.innerHTML = (chat.messages||[]).map(m => {
//         const isMe = m.senderId === myId;
//         return `<div class="flex ${isMe?'justify-end':'justify-start'}"><div class="px-3 py-2 rounded-xl text-xs max-w-[80%] ${isMe?'bg-emerald-600 text-white rounded-br-none':'bg-slate-800 text-slate-200 rounded-bl-none'}"><div class="font-bold opacity-50 text-[9px] mb-0.5">${m.senderName}</div>${m.text}</div></div>`;
//     }).join("");
//     box.scrollTop = box.scrollHeight;
// };

// // EDIT POST
// const editPost = (id) => {
//     const p = state.posts.find(x => x.id == id);
//     if(!p) return;
//     editPostId = id;
//     qs("postTitle").value = p.title; qs("postDesc").value = p.desc;
//     qs("postPrice").value = p.price; qs("postCredits").value = p.credits;
    
//     qs("uploadFormBtn").textContent = "Update Listing";
//     show("deleteEditBtn");
//     qs("createListingTab").click();
// };

// const deletePost = async (id) => { if(confirm("Delete post?")) await deleteDoc(doc(db, "posts", id)); };
// const deleteUser = async (id) => { if(confirm("Delete user?")) await deleteDoc(doc(db, "users", id)); };

// // ==========================================
// // 6. RENDERERS
// // ==========================================
// const renderFeed = () => {
//     const arr = state.posts.filter(p => p.status !== 'removed');
//     // Filters
//     const pf = qs("priceFilter").value;
//     if(pf === 'low-high') arr.sort((a,b)=>a.price-b.price);
//     if(pf === 'high-low') arr.sort((a,b)=>b.price-a.price);
    
//     const cf = qs("creditsFilter").value;
//     const filtered = arr.filter(p => {
//         if(cf === '1-10') return p.credits >= 1 && p.credits <= 10;
//         if(cf === '50+') return p.credits >= 50;
//         return true;
//     });

//     qs("feedContainer").innerHTML = filtered.map(p => {
//         const isMine = state.currentUser && p.user === state.currentUser.name;
//         const badge = isMine ? `<span class="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold px-2 py-0.5 rounded ml-2">YOU</span>` : '';
//         return `
//         <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all group">
//             <div class="h-40 bg-slate-800 overflow-hidden"><img src="${p.image}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"></div>
//             <div class="p-4 flex flex-col gap-2">
//                 <div class="flex justify-between items-start"><h3 class="font-bold text-white truncate flex-1">${p.title}</h3>${badge}</div>
//                 <p class="text-xs text-slate-400 truncate">${p.desc}</p>
//                 <div class="flex justify-between items-center text-xs mt-2">
//                     <span class="bg-slate-800 text-slate-300 px-2 py-1 rounded">${p.credits} Credits</span>
//                     <span class="text-emerald-400 font-bold text-sm">₹${p.price}</span>
//                 </div>
//                 <button onclick="window.startChat('${p.id}', '${p.user}')" class="w-full mt-3 bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 py-2 rounded-lg text-xs font-bold transition-colors">Chat with Seller</button>
//             </div>
//         </div>`;
//     }).join("");

//     // User Listings
//     const myName = state.currentUser?.name;
//     const myPosts = state.posts.filter(p => p.user === myName);
//     qs("userListings").innerHTML = myPosts.map(p => `
//         <div class="bg-slate-950 border border-slate-800 p-3 rounded-lg flex justify-between items-center">
//             <div class="flex flex-col"><span class="font-bold text-sm text-slate-200">${p.title}</span><span class="text-[10px] text-slate-500">₹${p.price} • ${p.credits} Cr</span></div>
//             <button onclick="window.editPost('${p.id}')" class="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-md">Edit</button>
//         </div>
//     `).join("");
// };

// const renderInbox = () => {
//     if(!state.currentUser) return;
//     const myId = state.currentUser.id;
//     const chats = state.chats;
    
//     // Count Unread
//     let unread = 0;
//     chats.forEach(c => { unread += (c.messages||[]).filter(m => m.senderId !== myId && !m.seen).length; });
//     toggle("inboxIndicator", unread > 0);

//     chats.sort((a,b) => (b.updatedAt||0) - (a.updatedAt||0));
    
//     qs("inboxList").innerHTML = chats.map(c => {
//         const last = (c.messages||[]).slice(-1)[0] || { text: 'No messages', senderName: '' };
//         const other = c.participantNames.find(n => n !== state.currentUser.name);
//         const hasUnread = (c.messages||[]).filter(m => m.senderId !== myId && !m.seen).length;
        
//         return `
//         <div onclick="window.openExistingChat('${c.id}')" class="bg-slate-900 border border-slate-800 p-4 rounded-xl cursor-pointer hover:border-emerald-500/50 transition-colors flex justify-between items-center group">
//             <div>
//                 <div class="font-bold text-white text-sm flex items-center gap-2">${other} <span class="text-slate-500 font-normal text-xs">on ${c.postTitle}</span></div>
//                 <div class="text-xs text-slate-400 mt-1 truncate max-w-[200px] group-hover:text-slate-300">${last.senderName}: ${last.text}</div>
//             </div>
//             ${hasUnread ? `<div class="w-2 h-2 bg-emerald-500 rounded-full"></div>` : `<div class="text-slate-600 text-lg">›</div>`}
//         </div>`;
//     }).join("");
// };

// const renderAdmin = () => {
//     if(state.currentUser?.role !== 'admin') return;
//     qs("adminList").innerHTML = `
//     <div class="grid gap-6">
//         <div class="bg-slate-950 p-4 rounded-xl border border-slate-800">
//             <h3 class="font-bold text-emerald-400 text-xs uppercase mb-3">All Users</h3>
//             <div class="space-y-2">${state.users.map(u => `<div class="flex justify-between text-xs text-slate-300 border-b border-slate-800 pb-2"><span>${u.name} <span class="text-slate-500">(${u.role})</span></span><button onclick="window.deleteUser('${u.id}')" class="text-red-400 hover:text-red-300">Remove</button></div>`).join("")}</div>
//         </div>
//         <div class="bg-slate-950 p-4 rounded-xl border border-slate-800">
//             <h3 class="font-bold text-emerald-400 text-xs uppercase mb-3">All Listings</h3>
//             <div class="space-y-2">${state.posts.map(p => `<div class="flex justify-between text-xs text-slate-300 border-b border-slate-800 pb-2"><span>${p.title}</span><button onclick="window.deletePost('${p.id}')" class="text-red-400 hover:text-red-300">Delete</button></div>`).join("")}</div>
//         </div>
//     </div>`;
// };

// // ==========================================
// // 7. LISTENERS
// // ==========================================
// on(qs("chatForm"), "submit", async e => {
//     e.preventDefault();
//     const txt = qs("chatInput").value.trim();
//     if(!txt) return;
//     await updateDoc(doc(db, "chats", currentChatId), {
//         messages: arrayUnion({ senderId: state.currentUser.id, senderName: state.currentUser.name, text: txt, time: Date.now(), seen: false }),
//         updatedAt: Date.now()
//     });
//     qs("chatInput").value = "";
// });

// on(qs("uploadForm"), "submit", async e => {
//     e.preventDefault();
//     if(!state.currentUser) return show("loginModal");
    
//     const file = qs("postImage").files[0];
//     const reader = new FileReader();
    
//     const save = async (img) => {
//         const d = { 
//             title: qs("postTitle").value, desc: qs("postDesc").value, 
//             price: Number(qs("postPrice").value), credits: Number(qs("postCredits").value),
//             user: state.currentUser.name, image: img, createdAt: Date.now(), status: "active" 
//         };
//         if(editPostId) { if(!img) delete d.image; await updateDoc(doc(db, "posts", editPostId), d); }
//         else { if(!img) return alert("Image required"); await addDoc(collection(db, "posts"), d); }
        
//         qs("uploadForm").reset(); editPostId = null; qs("uploadFormBtn").textContent = "Publish Listing"; hide("deleteEditBtn");
//         qs("yourListingsTab").click();
//     };
//     if(file) { reader.onload = ev => save(ev.target.result); reader.readAsDataURL(file); } else save(null);
// });

// on(qs("deleteEditBtn"), "click", async () => {
//     if(editPostId && confirm("Delete listing?")) {
//         await deleteDoc(doc(db, "posts", editPostId));
//         qs("uploadForm").reset(); editPostId = null; qs("uploadFormBtn").textContent = "Publish Listing"; hide("deleteEditBtn");
//         qs("yourListingsTab").click();
//     }
// });

// // Auth Handlers
// on(qs("registerForm"), "submit", async e => {
//     e.preventDefault();
//     const [name, email, pass] = [qs("regName").value, qs("regEmail").value, qs("regPass").value];
//     try {
//         const { user } = await createUserWithEmailAndPassword(auth, email, pass);
//         const role = name.toLowerCase() === "bajaish" ? "admin" : "user";
//         await setDoc(doc(db, "users", user.uid), { id: user.uid, name, email, role, createdAt: Date.now() });
//         alert("Registered!"); qs("tabLogin").click();
//     } catch(e) { alert(e.message); }
// });

// on(qs("loginForm"), "submit", async e => {
//     e.preventDefault();
//     const name = qs("loginName").value;
//     try {
//         const snap = await getDocs(collection(db, "users"));
//         const uDoc = snap.docs.find(d => d.data().name === name);
//         if(!uDoc) throw new Error("User not found");
        
//         const data = uDoc.data();
//         if(data.role !== qs("loginRole").value) throw new Error("Incorrect Role Selected");
        
//         await signInWithEmailAndPassword(auth, data.email, qs("loginPass").value);
//         state.currentUser = { id: uDoc.id, ...data };
//         updateAuthUI(); startChatListener(uDoc.id); renderFeed();
//         hide("loginModal"); showSection("feed");
//     } catch(e) { alert(e.message); }
// });

// // UI Buttons
// on(qs("loginBtn"), "click", () => show("loginModal"));
// on(qs("heroLoginBtn"), "click", () => show("loginModal"));
// on(qs("closeLogin"), "click", () => hide("loginModal"));
// on(qs("closeChat"), "click", () => hide("chatModal"));
// on(qs("logoutBtn"), "click", () => { signOut(auth); showSection("landing"); });
// on(qs("heroExploreBtn"), "click", () => { if(state.currentUser) showSection("feed"); else show("loginModal"); });

// // Tabs
// const setTab = (a, b, showA) => {
//     qs(a).className = "flex-1 py-3 text-xs font-bold text-white bg-slate-800 border-b-2 border-emerald-500";
//     qs(b).className = "flex-1 py-3 text-xs font-bold text-slate-400 hover:text-white";
//     if(showA) { show("uploadWrapper"); hide("userListings"); } else { hide("uploadWrapper"); show("userListings"); renderFeed(); }
// };
// on(qs("createListingTab"), "click", () => { setTab("createListingTab", "yourListingsTab", true); if(!editPostId) { qs("uploadForm").reset(); hide("deleteEditBtn"); } });
// on(qs("yourListingsTab"), "click", () => { setTab("yourListingsTab", "createListingTab", false); editPostId = null; hide("deleteEditBtn"); });

// on(qs("tabRegister"), "click", () => { 
//     qs("tabRegister").className = "flex-1 py-2 text-xs font-bold rounded-md bg-slate-800 text-white shadow";
//     qs("tabLogin").className = "flex-1 py-2 text-xs font-bold rounded-md text-slate-400 hover:text-white";
//     show("registerForm"); hide("loginForm"); 
// });
// on(qs("tabLogin"), "click", () => { 
//     qs("tabLogin").className = "flex-1 py-2 text-xs font-bold rounded-md bg-slate-800 text-white shadow";
//     qs("tabRegister").className = "flex-1 py-2 text-xs font-bold rounded-md text-slate-400 hover:text-white";
//     show("loginForm"); hide("registerForm"); 
// });

// qsa(".nav-btn").forEach(b => on(b, "click", () => showSection(b.dataset.section)));
// on(qs("priceFilter"), "change", renderFeed);
// on(qs("creditsFilter"), "change", renderFeed);
// on(qs("gotoCalcLink"), "click", () => showSection("calculator"));

// // Expose to Window
// window.startChat = startChat;
// window.openExistingChat = openExistingChat;
// window.editPost = editPost;
// window.deleteUser = deleteUser;
// window.deletePost = deletePost;

// // Init
// const init = () => {
//     updateAuthUI();
//     startListeners();
//     const last = localStorage.getItem(LAST_SECTION_KEY);
//     showSection(last || "landing");
// };
// if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();




// // ==========================================
// // 1. IMPORTS & CONFIGURATION
// // ==========================================
// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
// import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
// import { getFirestore, collection, addDoc, getDocs, getDoc, doc, updateDoc, arrayUnion, query, orderBy, onSnapshot, setDoc, deleteDoc, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// // ==========================================
// // 2. CORE UTILITIES
// // ==========================================
// const qs = id => document.getElementById(id);
// const qsa = sel => document.querySelectorAll(sel);
// const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

// const getEl = (input) => (typeof input === 'string' ? qs(input) : input);
// const show = (input) => getEl(input)?.classList.remove("hidden");
// const hide = (input) => getEl(input)?.classList.add("hidden");
// const toggle = (input, condition) => condition ? show(input) : hide(input);

// const LAST_SECTION_KEY = "ccx_last_section_vfinal_2";
// // State includes chats for private messaging
// let state = { users: [], posts: [], chats: [], currentUser: null };
// let editPostId = null, currentChatId = null;

// // ==========================================
// // 3. UI NAVIGATION
// // ==========================================
// const showSection = name => {
//   qsa(".section").forEach(s => s.classList.add("hidden"));
//   const target = qs("section-" + name) ? name : "landing";
//   show("section-" + target);
//   localStorage.setItem(LAST_SECTION_KEY, target);
  
//   qsa(".nav-btn").forEach(btn => {
//     const isActive = btn.dataset.section === target;
//     if (isActive) {
//         btn.classList.remove("bg-slate-900", "text-slate-100", "border-b-transparent", "hover:bg-slate-800");
//         btn.classList.add("bg-emerald-600", "text-white", "font-bold");
//     } else {
//         btn.classList.add("bg-slate-900", "text-slate-100", "border-b-transparent", "hover:bg-slate-800");
//         btn.classList.remove("bg-emerald-600", "text-white", "font-bold");
//     }
//   });
// };

// const updateAuthUI = () => {
//   const u = state.currentUser;
//   const isAdmin = u?.role === 'admin';

//   toggle("loginBtn", !u);
//   toggle("heroLoginBtn", !u);
//   toggle("logoutBtn", u);
//   toggle("userBadge", u);
//   toggle("welcomeWrapper", u);
//   toggle("feedFilters", u);

//   qsa(".protected-nav").forEach(el => {
//       if (el.id === "adminTab") toggle(el, u && isAdmin); 
//       else toggle(el, !!u);
//   });

//   if (u) {
//     qs("badgeName").textContent = u.name;
//     qs("badgeRole").textContent = u.role;
//     qs("welcomeName").textContent = u.name;
//   }
// };

// const requireLogin = () => {
//   if (!state.currentUser) {
//     alert("Please login first.");
//     show("loginModal");
//     return false;
//   }
//   return true;
// };

// // ==========================================
// // 4. DATA LISTENERS
// // ==========================================
// const startListeners = () => {
//     // 1. Posts Listener (Feed)
//     onSnapshot(query(collection(db, "posts"), orderBy("createdAt", "desc")), (snap) => {
//         state.posts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//         renderFeed(); 
//     });

//     // 2. Users Listener (Sync)
//     onSnapshot(collection(db, "users"), (snap) => {
//         state.users = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
//         // Restore user session if auth is valid
//         if (auth.currentUser) {
//             const me = state.users.find(u => u.id === auth.currentUser.uid);
//             if (me) {
//                 if (!state.currentUser || JSON.stringify(state.currentUser) !== JSON.stringify(me)) {
//                     state.currentUser = me;
//                     updateAuthUI();
//                     renderFeed();
//                     subscribeToChats(me.id); // <--- START INBOX LISTENER
//                 }
//             }
//         }
//         if(state.currentUser?.role === 'admin') renderAdmin();
//     });
// };

// // 3. Private Chat Listener (The Inbox Fix)
// let unsubscribeChats = null;
// const subscribeToChats = (uid) => {
//     if(unsubscribeChats) unsubscribeChats(); // Stop old
    
//     // Listen for chats where I am a participant
//     const q = query(collection(db, "chats"), where("participants", "array-contains", uid));
    
//     unsubscribeChats = onSnapshot(q, (snap) => {
//         state.chats = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
//         renderInbox(); // <--- Updates UI and Red Dot
        
//         // If chat modal is open, update messages in real-time
//         if (currentChatId && !qs("chatModal").classList.contains("hidden")) {
//             const chat = state.chats.find(c => c.id === currentChatId);
//             if(chat) renderChatMessages(chat);
//         }
//     });
// };

// // ==========================================
// // 5. AUTH HANDLERS
// // ==========================================
// on(qs("registerForm"), "submit", async e => {
//   e.preventDefault();
//   const [name, email, pass] = [qs("regName").value, qs("regEmail").value, qs("regPass").value];
//   try {
//     const { user } = await createUserWithEmailAndPassword(auth, email, pass);
//     const role = (name.toLowerCase() === "bajaish") ? "admin" : "user";
//     await setDoc(doc(db, "users", user.uid), { id: user.uid, name, email, role, createdAt: Date.now() });
//     alert("Registered! Please login.");
//     qs("tabLogin").click();
//   } catch (err) { alert(err.message); }
// });

// on(qs("loginForm"), "submit", async e => {
//   e.preventDefault();
//   const name = qs("loginName").value;
//   const password = qs("loginPass").value;
//   const selectedRole = qs("loginRole").value;

//   try {
//     const snap = await getDocs(collection(db, "users"));
//     const userDoc = snap.docs.find(d => d.data().name === name);
//     if (!userDoc) throw new Error("User not found.");
    
//     const userData = userDoc.data();
//     if (userData.role !== selectedRole) throw new Error(`Access Denied: You are not a ${selectedRole}.`);

//     await signInWithEmailAndPassword(auth, userData.email, password);
    
//     // Immediate Manual Set (Fixes lag)
//     state.currentUser = { id: userDoc.id, ...userData };
//     updateAuthUI();
//     subscribeToChats(state.currentUser.id); // Start Inbox immediately
//     renderFeed();
//     hide("loginModal");
//     showSection("feed");
//   } catch (err) { alert(err.message); }
// });

// onAuthStateChanged(auth, async (user) => {
//     if (user) {
//         if (!state.currentUser) {
//             const snap = await getDoc(doc(db, "users", user.uid));
//             if (snap.exists()) {
//                 state.currentUser = { id: snap.id, ...snap.data() };
//                 updateAuthUI();
//                 subscribeToChats(state.currentUser.id);
//                 renderFeed();
//             }
//         }
//     } else {
//         state.currentUser = null;
//         state.chats = [];
//         updateAuthUI();
//         renderFeed();
//         renderInbox();
//     }
// });

// // ==========================================
// // 6. RENDERERS
// // ==========================================
// const renderFeed = () => {
//     const container = qs("feedContainer");
//     let arr = state.posts.filter(p => p.status !== 'removed');
    
//     const pf = qs("priceFilter")?.value || "none";
//     if (pf === "low-high") arr.sort((a,b) => a.price - b.price);
//     if (pf === "high-low") arr.sort((a,b) => b.price - a.price);

//     const cf = qs("creditsFilter")?.value || "all";
//     if (cf === "1-10") arr = arr.filter(p => p.credits >= 1 && p.credits <= 10);
//     if (cf === "50+") arr = arr.filter(p => p.credits >= 50);

//     container.innerHTML = arr.length ? arr.map(htmlPost).join("") : '<p class="text-slate-400 text-sm mt-2 col-span-full">No posts yet.</p>';
    
//     const myName = state.currentUser?.name;
//     if(!qs("userListings").classList.contains("hidden")) {
//         const myPosts = state.posts.filter(p => p.user === myName);
//         qs("userListings").innerHTML = myPosts.length ? myPosts.map(htmlListRow).join("") : '<p class="text-slate-400 text-xs">No listings found.</p>';
//     }
// };

// const renderInbox = () => {
//     const list = qs("inboxList");
    
//     // 1. If not logged in
//     if(!state.currentUser) {
//         toggle("inboxIndicator", false);
//         if(list) list.innerHTML = `<p class="text-slate-400 text-sm">Login required.</p>`;
//         return;
//     }
    
//     const myId = state.currentUser.id;
//     const chats = state.chats || [];
    
//     // 2. Count Unread
//     let totalUnread = 0;
//     chats.forEach(c => {
//         totalUnread += (c.messages || []).filter(m => m.senderId !== myId && !m.seen).length;
//     });
//     toggle("inboxIndicator", totalUnread > 0);

//     if(!list) return;

//     if(chats.length === 0) {
//         list.innerHTML = '<p class="text-slate-400 text-sm">No messages yet.</p>';
//         return;
//     }

//     chats.sort((a,b) => (b.updatedAt || 0) - (a.updatedAt || 0));
//     list.innerHTML = chats.map(c => htmlInboxItem(c, myId)).join("");
// };

// const renderAdmin = () => {
//     if(state.currentUser?.role !== 'admin') return;
//     qs("adminList").innerHTML = `
//       <div class="mb-4"><h3 class="font-bold text-sm mb-2 text-emerald-400">Users</h3><table class="w-full text-left">${state.users.map(htmlAdminUser).join("")}</table></div>
//       <div><h3 class="font-bold text-sm mb-2 text-emerald-400">Posts</h3>${state.posts.map(htmlAdminPost).join("")}</div>`;
// };

// // ==========================================
// // 7. ACTIONS (CHAT - PRIVATE ROOMS)
// // ==========================================
// window.startChat = async (postId, ownerId) => {
//     if(!requireLogin()) return;
    
//     const myId = state.currentUser.id;
    
//     // Prevent self-chat
//     if(ownerId === myId) return alert("You cannot chat with yourself.");

//     // Find Owner Data
//     const owner = state.users.find(u => u.id === ownerId);
//     const ownerName = owner ? owner.name : "User";

//     // Check if chat exists (Participants = Me + Owner, Context = Post)
//     let chat = state.chats.find(c => c.postId === postId && c.participants.includes(myId) && c.participants.includes(ownerId));
    
//     if(!chat) {
//         // Create new chat room
//         const post = state.posts.find(p => p.id === postId);
//         const ref = await addDoc(collection(db, "chats"), {
//             postId: postId,
//             postTitle: post.title,
//             participants: [myId, ownerId],
//             participantNames: [state.currentUser.name, ownerName],
//             messages: [],
//             updatedAt: Date.now()
//         });
//         currentChatId = ref.id;
//         chat = { id: ref.id, postTitle: post.title, messages: [] };
//     } else {
//         currentChatId = chat.id;
//     }

//     qs("chatPostTitle").textContent = chat.postTitle;
//     show("chatModal"); show("chatForm");
//     renderChatMessages(chat);
// };

// window.openExistingChat = (chatId) => {
//     currentChatId = chatId;
//     const chat = state.chats.find(c => c.id === chatId);
//     if(!chat) return;
    
//     qs("chatPostTitle").textContent = chat.postTitle;
//     show("chatModal"); show("chatForm");
//     renderChatMessages(chat);
// };

// const renderChatMessages = (chat) => {
//     const box = qs("chatMessages");
//     const myId = state.currentUser.id;
    
//     box.innerHTML = (chat.messages||[]).map(m => {
//         const isMe = m.senderId === myId;
//         return `<div class="flex ${isMe?'justify-end':'justify-start'}"><div class="px-2 py-1 rounded mb-1 text-xs max-w-[80%] ${isMe?'bg-emerald-600 text-white':'bg-slate-800 text-slate-300'}"><div class="font-bold opacity-50 text-[9px]">${m.senderName}</div>${m.text}</div></div>`;
//     }).join("");
//     box.scrollTop = box.scrollHeight;

//     // Mark as seen
//     const needsUpdate = (chat.messages||[]).some(m => m.senderId !== myId && !m.seen);
//     if(needsUpdate) {
//         const updatedMsgs = chat.messages.map(m => (m.senderId !== myId ? {...m, seen: true} : m));
//         updateDoc(doc(db, "chats", chat.id), { messages: updatedMsgs });
//     }
// };

// on(qs("chatForm"), "submit", async e => {
//     e.preventDefault();
//     const text = qs("chatInput").value.trim();
//     if(!text) return;
    
//     const msg = {
//         senderId: state.currentUser.id,
//         senderName: state.currentUser.name,
//         text,
//         time: Date.now(),
//         seen: false
//     };
    
//     await updateDoc(doc(db, "chats", currentChatId), {
//         messages: arrayUnion(msg),
//         updatedAt: Date.now()
//     });
//     qs("chatInput").value = "";
// });

// // ==========================================
// // 8. ACTIONS (POSTS)
// // ==========================================
// window.editPost = (id) => {
//     const p = state.posts.find(x => x.id == id);
//     if(!p) return;
//     editPostId = id;
//     qs("postTitle").value = p.title; qs("postDesc").value = p.desc;
//     qs("postPrice").value = p.price; qs("postCredits").value = p.credits;
//     qs("uploadFormBtn").textContent = "Update Listing"; 
//     show("deleteEditBtn"); 
//     qs("createListingTab").click();
// };

// on(qs("deleteEditBtn"), "click", async () => {
//     if(!editPostId) return;
//     if(confirm("Delete this listing permanently?")) {
//         await deleteDoc(doc(db, "posts", editPostId));
//         qs("uploadForm").reset(); editPostId = null; 
//         qs("uploadFormBtn").textContent = "Upload Listing"; 
//         hide("deleteEditBtn");
//         qs("yourListingsTab").click();
//     }
// });

// window.deleteUser = async (id) => { if(confirm("Delete user?")) await deleteDoc(doc(db, "users", id)); };
// window.deletePost = async (id) => { if(confirm("Delete post?")) await deleteDoc(doc(db, "posts", id)); };

// on(qs("uploadForm"), "submit", async e => {
//   e.preventDefault();
//   if(!requireLogin()) return;
//   const file = qs("postImage").files[0];
//   const reader = new FileReader();
//   const save = async (img) => {
//     const data = { 
//         title: qs("postTitle").value, desc: qs("postDesc").value, 
//         price: Number(qs("postPrice").value), credits: Number(qs("postCredits").value),
//         user: state.currentUser.name, // Display Name
//         ownerId: state.currentUser.id, // VITAL FOR CHAT: Stores User ID
//         image: img, createdAt: Date.now(), status: "active"
//     };
//     if(editPostId) { if(!img) delete data.image; await updateDoc(doc(db, "posts", editPostId), data); }
//     else { if(!img) return alert("Image required"); await addDoc(collection(db, "posts"), data); }
//     qs("uploadForm").reset(); editPostId = null; 
//     qs("uploadFormBtn").textContent = "Upload Listing"; hide("deleteEditBtn");
//     qs("yourListingsTab").click();
//   };
//   if(file) { reader.onload = ev => save(ev.target.result); reader.readAsDataURL(file); } else save(null);
// });

// // ==========================================
// // 9. UI BINDINGS
// // ==========================================
// on(qs("tabRegister"), "click", () => {
//     qs("tabRegister").className = "flex-1 py-1.5 text-xs font-semibold rounded-md bg-slate-800 text-white transition-all";
//     qs("tabLogin").className = "flex-1 py-1.5 text-xs font-semibold rounded-md text-slate-400 hover:text-white transition-all";
//     show("registerForm"); hide("loginForm");
// });
// on(qs("tabLogin"), "click", () => {
//     qs("tabLogin").className = "flex-1 py-1.5 text-xs font-semibold rounded-md bg-slate-800 text-white transition-all";
//     qs("tabRegister").className = "flex-1 py-1.5 text-xs font-semibold rounded-md text-slate-400 hover:text-white transition-all";
//     show("loginForm"); hide("registerForm");
// });

// on(qs("createListingTab"), "click", () => { 
//     show("uploadWrapper"); hide("userListings"); 
//     qs("createListingTab").classList.replace("text-slate-300", "text-white"); qs("createListingTab").classList.add("bg-slate-800");
//     qs("yourListingsTab").classList.replace("text-white", "text-slate-300"); qs("yourListingsTab").classList.remove("bg-slate-800");
//     if(!editPostId) { qs("uploadForm").reset(); qs("uploadFormBtn").textContent = "Upload Listing"; hide("deleteEditBtn"); }
// });
// on(qs("yourListingsTab"), "click", () => { 
//     hide("uploadWrapper"); show("userListings"); 
//     qs("yourListingsTab").classList.replace("text-slate-300", "text-white"); qs("yourListingsTab").classList.add("bg-slate-800");
//     qs("createListingTab").classList.replace("text-white", "text-slate-300"); qs("createListingTab").classList.remove("bg-slate-800");
//     editPostId = null; qs("uploadForm").reset(); qs("uploadFormBtn").textContent = "Upload Listing"; hide("deleteEditBtn");
//     renderFeed(); 
// });

// qsa(".nav-btn").forEach(b => on(b, "click", () => {
//     if(b.classList.contains("protected-nav") && !requireLogin()) return;
//     showSection(b.dataset.section);
//     if(b.dataset.section === 'upload') qs("yourListingsTab").click();
// }));

// on(qs("loginBtn"), "click", () => show("loginModal"));
// on(qs("heroLoginBtn"), "click", () => show("loginModal"));
// on(qs("closeLogin"), "click", () => hide("loginModal"));
// on(qs("closeChat"), "click", () => hide("chatModal"));
// on(qs("logoutBtn"), "click", () => { signOut(auth); showSection("landing"); });
// on(qs("heroExploreBtn"), "click", () => { if(requireLogin()) showSection("feed"); });
// on(qs("priceFilter"), "change", renderFeed);
// on(qs("creditsFilter"), "change", renderFeed);
// on(qs("gotoCalcLink"), "click", () => showSection("calculator"));

// qsa('input[name="calcMethod"]').forEach(r => on(r, "change", () => {
//     const v = document.querySelector('input[name="calcMethod"]:checked').value;
//     toggle("treeForm", v === "trees"); toggle("landForm", v !== "trees"); hide("calcResult");
// }));
// on(qs("calcTreesBtn"), "click", () => { show("calcResult"); qs("totalCredits").textContent = ((qs("treeCount").value * qs("treeType").value * qs("treeYears").value)/1000).toFixed(2) + " Tons CO2"; });
// on(qs("calcLandBtn"), "click", () => { const factor = qs("landUnit").value === 'hectares' ? 6 : 2.4; show("calcResult"); qs("totalCredits").textContent = (qs("landArea").value * factor * qs("landYears").value).toFixed(2) + " Tons CO2"; });

// // ==========================================
// // 10. HTML TEMPLATES
// // ==========================================
// const htmlPost = (p) => {
//     const isMine = state.currentUser && p.user === state.currentUser.name;
//     const badge = isMine ? `<span class="bg-emerald-500 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded ml-2">CREATED BY YOU</span>` : '';
    
//     // IMPORTANT: startChat uses p.ownerId (The user who created the post)
//     // If old posts lack ownerId, we fallback to finding them by name or hide button
//     const chatBtn = !isMine ? `<button onclick="window.startChat('${p.id}', '${p.ownerId || p.user}')" class="w-full py-2 bg-slate-800 text-xs rounded border border-slate-600 relative hover:bg-slate-700">💬 Chat</button>` : '';

//     return `<div class="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow flex flex-col"><img src="${p.image}" class="w-full h-44 object-cover"><div class="p-3 flex flex-col flex-1"><div class="flex justify-between items-start mb-1"><h3 class="font-bold text-sm truncate flex-1">${p.title}</h3>${badge}</div><p class="text-[10px] text-slate-500 mb-2">By ${p.user} • ${new Date(p.createdAt).toLocaleDateString()}</p><p class="text-xs text-slate-400 mb-2 truncate">${p.desc}</p><div class="flex justify-between text-[11px] mb-2"><span class="text-emerald-300 bg-emerald-900/30 px-2 py-0.5 rounded-full">${p.credits} Credits</span><span class="text-white font-bold">₹${p.price}</span></div><div class="mt-auto">${chatBtn}</div></div></div>`;
// };
// const htmlListRow = (p) => `<div class="bg-slate-900 p-2 border border-slate-700 rounded mb-2 flex justify-between text-xs items-center"><span>${p.title}</span><button class="text-emerald-400 underline" onclick="window.editPost('${p.id}')">Edit</button></div>`;
// const htmlInboxItem = (c, myId) => {
//     const msgs = c.messages || [];
//     const last = msgs[msgs.length-1] || { text: 'No messages', senderName: '' };
//     const unread = msgs.filter(m => m.senderId !== myId && !m.seen).length;
//     const otherName = c.participantNames.find(n => n !== state.currentUser.name) || "User";
    
//     return `<div onclick="window.openExistingChat('${c.id}')" class="bg-slate-900 p-3 rounded-lg border border-slate-700 cursor-pointer flex justify-between items-center hover:bg-slate-800"><div><div class="text-sm font-bold text-emerald-100 flex items-center gap-2">${c.postTitle} <span class="text-xs text-slate-400 font-normal">w/ ${otherName}</span> ${unread>0?`<span class="bg-red-500 text-white text-[9px] px-1.5 rounded-full">${unread}</span>`:''}</div><div class="text-xs text-slate-400 truncate max-w-[200px]">${last.senderName}: ${last.text}</div></div><div class="text-xs text-emerald-500">Open</div></div>`;
// };
// const htmlAdminUser = (u) => `<tr class="text-xs border-b border-slate-700"><td class="p-2">${u.name}</td><td class="p-2">${u.role}</td><td class="p-2 text-right"><button onclick="window.deleteUser('${u.id}')" class="text-red-400 hover:text-red-300">Remove</button></td></tr>`;
// const htmlAdminPost = (p) => `<div class="flex justify-between items-center bg-slate-900 p-2 text-xs border border-slate-700 rounded mb-1"><div class="flex flex-col"><span class="font-bold">${p.title}</span><span class="text-[10px] text-slate-400">By ${p.user}</span></div><div class="flex gap-2"><button onclick="window.deletePost('${p.id}')" class="text-red-400">Delete</button></div></div>`;

// const init = () => {
//     updateAuthUI();
//     startListeners();
//     const lastSec = localStorage.getItem(LAST_SECTION_KEY);
//     const target = lastSec && qs("section-" + lastSec) ? lastSec : "landing";
//     showSection(target);
// };

// if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
// else init();




// // ==========================================
// // 1. IMPORTS & CONFIG
// // ==========================================
// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
// import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
// import { getFirestore, collection, addDoc, getDocs, getDoc, doc, updateDoc, arrayUnion, query, orderBy, onSnapshot, setDoc, deleteDoc, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// // ==========================================
// // 2. CORE UTILITIES
// // ==========================================
// const qs = id => document.getElementById(id);
// const qsa = sel => document.querySelectorAll(sel);
// const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

// const getEl = (input) => (typeof input === 'string' ? qs(input) : input);
// const show = (input) => getEl(input)?.classList.remove("hidden");
// const hide = (input) => getEl(input)?.classList.add("hidden");
// const toggle = (input, condition) => condition ? show(input) : hide(input);

// const LAST_SECTION_KEY = "ccx_FINAL_v3";
// let state = { users: [], posts: [], chats: [], currentUser: null };
// let editPostId = null, currentChatId = null, chatUnsubscribe = null;

// // ==========================================
// // 3. UI NAVIGATION
// // ==========================================
// const showSection = name => {
//   qsa(".section").forEach(s => s.classList.add("hidden"));
//   const target = qs("section-" + name) ? name : "landing";
//   show("section-" + target);
//   localStorage.setItem(LAST_SECTION_KEY, target);
  
//   // Highlighting
//   qsa(".nav-btn").forEach(btn => {
//     const isActive = btn.dataset.section === target;
//     if (isActive) {
//         btn.classList.remove("bg-slate-900", "text-slate-100", "border-transparent", "hover:bg-slate-800");
//         btn.classList.add("bg-emerald-600", "text-white", "font-bold", "border-emerald-400");
//     } else {
//         btn.classList.add("bg-slate-900", "text-slate-100", "border-transparent", "hover:bg-slate-800");
//         btn.classList.remove("bg-emerald-600", "text-white", "font-bold", "border-emerald-400");
//     }
//   });
// };

// const updateAuthUI = () => {
//   const u = state.currentUser;
//   const isAdmin = u?.role === 'admin';

//   toggle("loginBtn", !u);
//   toggle("heroLoginBtn", !u);
//   toggle("logoutBtn", u);
//   toggle("userBadge", u);
//   toggle("welcomeWrapper", u);
//   toggle("feedFilters", u);

//   qsa(".protected-nav").forEach(el => {
//       if (el.id === "adminTab") toggle(el, u && isAdmin); 
//       else toggle(el, !!u);
//   });

//   if (u) {
//     qs("badgeName").textContent = u.name;
//     qs("badgeRole").textContent = u.role;
//     qs("welcomeName").textContent = u.name;
//   }
// };

// const requireLogin = () => {
//   if (!state.currentUser) {
//     alert("Please login first.");
//     show("loginModal");
//     return false;
//   }
//   return true;
// };

// // ==========================================
// // 4. DATA LISTENERS
// // ==========================================
// const startListeners = () => {
//     // 1. Posts (Feed)
//     onSnapshot(query(collection(db, "posts"), orderBy("createdAt", "desc")), (snap) => {
//         state.posts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//         renderFeed(); 
//     });

//     // 2. Users (Sync Profile)
//     onSnapshot(collection(db, "users"), (snap) => {
//         state.users = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
//         if (auth.currentUser) {
//             const me = state.users.find(u => u.id === auth.currentUser.uid);
//             if (me) {
//                 // If user data loaded/changed, update state
//                 if (!state.currentUser || state.currentUser.id !== me.id) {
//                     state.currentUser = me;
//                     updateAuthUI();
//                     subscribeToChats(me.id); // <--- CRITICAL: Start Inbox
//                     renderFeed();
//                 }
//             }
//         }
//         if(state.currentUser?.role === 'admin') renderAdmin();
//     });
// };

// // 3. INBOX LISTENER
// const subscribeToChats = (uid) => {
//     if(chatUnsubscribe) chatUnsubscribe();
    
//     // Listen for chats where I am a participant
//     const q = query(collection(db, "chats"), where("participants", "array-contains", uid));
    
//     chatUnsubscribe = onSnapshot(q, (snap) => {
//         state.chats = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//         renderInbox(); // Update UI & Red Dot
        
//         // Live update active chat
//         if (currentChatId && !qs("chatModal").classList.contains("hidden")) {
//             const activeChat = state.chats.find(c => c.id === currentChatId);
//             if(activeChat) renderChatMessages(activeChat);
//         }
//     });
// };

// // ==========================================
// // 5. AUTH LOGIC
// // ==========================================
// on(qs("registerForm"), "submit", async e => {
//   e.preventDefault();
//   const [name, email, pass] = [qs("regName").value, qs("regEmail").value, qs("regPass").value];
//   try {
//     const { user } = await createUserWithEmailAndPassword(auth, email, pass);
//     const role = (name.toLowerCase() === "bajaish") ? "admin" : "user";
//     await setDoc(doc(db, "users", user.uid), { id: user.uid, name, email, role, createdAt: Date.now() });
//     alert("Registered! Please login.");
//     qs("tabLogin").click();
//   } catch (err) { alert(err.message); }
// });

// on(qs("loginForm"), "submit", async e => {
//   e.preventDefault();
//   const name = qs("loginName").value;
//   const password = qs("loginPass").value;
//   const selectedRole = qs("loginRole").value;

//   try {
//     const snap = await getDocs(collection(db, "users"));
//     const userDoc = snap.docs.find(d => d.data().name === name);
//     if (!userDoc) throw new Error("User not found.");
    
//     const userData = userDoc.data();
//     if (userData.role !== selectedRole) throw new Error(`Access Denied: You are not a ${selectedRole}.`);

//     await signInWithEmailAndPassword(auth, userData.email, password);
    
//     // Set State Immediately
//     state.currentUser = { id: userDoc.id, ...userData };
//     updateAuthUI();
//     subscribeToChats(userData.id); 
//     hide("loginModal");
//     showSection("feed");
//   } catch (err) { alert(err.message); }
// });

// onAuthStateChanged(auth, async (user) => {
//     if (user) {
//         if (!state.currentUser) {
//             const snap = await getDoc(doc(db, "users", user.uid));
//             if (snap.exists()) {
//                 state.currentUser = { id: snap.id, ...snap.data() };
//                 updateAuthUI();
//                 subscribeToChats(state.currentUser.id);
//                 renderFeed();
//             }
//         }
//     } else {
//         state.currentUser = null;
//         state.chats = [];
//         updateAuthUI();
//         renderFeed();
//         renderInbox();
//     }
// });

// // ==========================================
// // 6. RENDERERS
// // ==========================================
// const renderFeed = () => {
//     const container = qs("feedContainer");
//     let arr = state.posts.filter(p => p.status !== 'removed');
    
//     // Filters
//     const pf = qs("priceFilter")?.value || "none";
//     if (pf === "low-high") arr.sort((a,b) => a.price - b.price);
//     if (pf === "high-low") arr.sort((a,b) => b.price - a.price);

//     const cf = qs("creditsFilter")?.value || "all";
//     if (cf === "1-10") arr = arr.filter(p => p.credits >= 1 && p.credits <= 10);
//     if (cf === "50+") arr = arr.filter(p => p.credits >= 50);

//     container.innerHTML = arr.length ? arr.map(htmlPost).join("") : '<p class="text-slate-400 text-sm mt-2 col-span-full">No posts yet.</p>';
    
//     const myName = state.currentUser?.name;
//     if(!qs("userListings").classList.contains("hidden")) {
//         const myPosts = state.posts.filter(p => p.user === myName);
//         qs("userListings").innerHTML = myPosts.length ? myPosts.map(htmlListRow).join("") : '<p class="text-slate-400 text-xs">No listings found.</p>';
//     }
// };

// const renderInbox = () => {
//     const list = qs("inboxList");
//     if(!state.currentUser) {
//         toggle("inboxIndicator", false);
//         if(list) list.innerHTML = `<p class="text-slate-400 text-sm">Login required.</p>`;
//         return;
//     }
    
//     const myId = state.currentUser.id;
//     const chats = state.chats || [];
    
//     let totalUnread = 0;
//     chats.forEach(c => {
//         totalUnread += (c.messages || []).filter(m => m.senderId !== myId && !m.seen).length;
//     });
//     toggle("inboxIndicator", totalUnread > 0);

//     if(!list) return;
//     if(chats.length === 0) { list.innerHTML = '<p class="text-slate-400 text-sm">No chats yet.</p>'; return; }

//     chats.sort((a,b) => (b.updatedAt || 0) - (a.updatedAt || 0));
//     list.innerHTML = chats.map(c => htmlInboxItem(c, myId)).join("");
// };

// const renderAdmin = () => {
//     if(state.currentUser?.role !== 'admin') return;
//     qs("adminList").innerHTML = `
//       <div class="mb-4"><h3 class="font-bold text-sm mb-2 text-emerald-400">Users</h3><table class="w-full text-left">${state.users.map(htmlAdminUser).join("")}</table></div>
//       <div><h3 class="font-bold text-sm mb-2 text-emerald-400">Posts</h3>${state.posts.map(htmlAdminPost).join("")}</div>`;
// };

// // ==========================================
// // 7. PRIVATE CHAT LOGIC (FIXED)
// // ==========================================
// window.startChat = async (postId, ownerName, ownerId) => {
//     if(!requireLogin()) return;
    
//     const myId = state.currentUser.id;
//     let targetId = ownerId;

//     // LEGACY FIX: If post doesn't have ownerId, find user by name
//     if (!targetId || targetId === "undefined") {
//         const targetUser = state.users.find(u => u.name === ownerName);
//         if (targetUser) targetId = targetUser.id;
//         else return alert("Cannot find seller. They might have deleted their account.");
//     }

//     if(targetId === myId) return alert("You cannot chat with yourself.");

//     // Check existing chat
//     let chat = state.chats.find(c => c.postId === postId && c.participants.includes(myId) && c.participants.includes(targetId));
    
//     if(!chat) {
//         // Create new room
//         const post = state.posts.find(p => p.id === postId);
//         const ref = await addDoc(collection(db, "chats"), {
//             postId: postId,
//             postTitle: post.title,
//             participants: [myId, targetId],
//             participantNames: [state.currentUser.name, ownerName],
//             messages: [],
//             updatedAt: Date.now()
//         });
//         currentChatId = ref.id;
//         chat = { id: ref.id, postTitle: post.title, messages: [] };
//     } else {
//         currentChatId = chat.id;
//     }

//     qs("chatPostTitle").textContent = chat.postTitle;
//     show("chatModal"); show("chatForm");
//     renderChatMessages(chat);
// };

// window.openExistingChat = (chatId) => {
//     currentChatId = chatId;
//     const chat = state.chats.find(c => c.id === chatId);
//     if(!chat) return;
    
//     qs("chatPostTitle").textContent = chat.postTitle;
//     show("chatModal"); show("chatForm");
//     renderChatMessages(chat);
// };

// const renderChatMessages = (chat) => {
//     const box = qs("chatMessages");
//     const myId = state.currentUser.id;
    
//     box.innerHTML = (chat.messages||[]).map(m => {
//         const isMe = m.senderId === myId;
//         return `<div class="flex ${isMe?'justify-end':'justify-start'}"><div class="px-3 py-1.5 rounded-lg mb-1 text-xs max-w-[80%] ${isMe?'bg-emerald-600 text-white':'bg-slate-700 text-slate-200'}"><div class="font-bold opacity-50 text-[9px] mb-0.5">${m.senderName}</div>${m.text}</div></div>`;
//     }).join("");
//     box.scrollTop = box.scrollHeight;

//     // Mark seen
//     const needsUpdate = (chat.messages||[]).some(m => m.senderId !== myId && !m.seen);
//     if(needsUpdate) {
//         const updatedMsgs = chat.messages.map(m => (m.senderId !== myId ? {...m, seen: true} : m));
//         updateDoc(doc(db, "chats", chat.id), { messages: updatedMsgs });
//     }
// };

// on(qs("chatForm"), "submit", async e => {
//     e.preventDefault();
//     const text = qs("chatInput").value.trim();
//     if(!text) return;
    
//     const msg = {
//         senderId: state.currentUser.id,
//         senderName: state.currentUser.name,
//         text,
//         time: Date.now(),
//         seen: false
//     };
    
//     await updateDoc(doc(db, "chats", currentChatId), {
//         messages: arrayUnion(msg),
//         updatedAt: Date.now()
//     });
//     qs("chatInput").value = "";
// });

// // ==========================================
// // 8. POST ACTIONS
// // ==========================================
// window.editPost = (id) => {
//     const p = state.posts.find(x => x.id == id);
//     if(!p) return;
//     editPostId = id;
//     qs("postTitle").value = p.title; qs("postDesc").value = p.desc;
//     qs("postPrice").value = p.price; qs("postCredits").value = p.credits;
//     qs("uploadFormBtn").textContent = "Update Listing"; 
//     show("deleteEditBtn"); 
//     qs("createListingTab").click();
// };

// on(qs("deleteEditBtn"), "click", async () => {
//     if(!editPostId) return;
//     if(confirm("Delete this listing permanently?")) {
//         await deleteDoc(doc(db, "posts", editPostId));
//         qs("uploadForm").reset(); editPostId = null; 
//         qs("uploadFormBtn").textContent = "Upload Listing"; 
//         hide("deleteEditBtn");
//         qs("yourListingsTab").click();
//     }
// });

// window.deleteUser = async (id) => { if(confirm("Delete user?")) await deleteDoc(doc(db, "users", id)); };
// window.deletePost = async (id) => { if(confirm("Delete post?")) await deleteDoc(doc(db, "posts", id)); };

// on(qs("uploadForm"), "submit", async e => {
//   e.preventDefault();
//   if(!requireLogin()) return;
//   const file = qs("postImage").files[0];
//   const reader = new FileReader();
//   const save = async (img) => {
//     const data = { 
//         title: qs("postTitle").value, desc: qs("postDesc").value, 
//         price: Number(qs("postPrice").value), credits: Number(qs("postCredits").value),
//         user: state.currentUser.name, 
//         ownerId: state.currentUser.id, // CRITICAL FOR CHAT
//         image: img, createdAt: Date.now(), status: "active"
//     };
//     if(editPostId) { if(!img) delete data.image; await updateDoc(doc(db, "posts", editPostId), data); }
//     else { if(!img) return alert("Image required"); await addDoc(collection(db, "posts"), data); }
//     qs("uploadForm").reset(); editPostId = null; 
//     qs("uploadFormBtn").textContent = "Upload Listing"; hide("deleteEditBtn");
//     qs("yourListingsTab").click();
//   };
//   if(file) { reader.onload = ev => save(ev.target.result); reader.readAsDataURL(file); } else save(null);
// });

// // ==========================================
// // 9. UI BINDINGS
// // ==========================================
// on(qs("tabRegister"), "click", () => {
//     qs("tabRegister").className = "flex-1 py-2 text-xs font-bold rounded-md bg-slate-800 text-white transition-all shadow";
//     qs("tabLogin").className = "flex-1 py-2 text-xs font-bold rounded-md text-slate-400 hover:text-white transition-all";
//     show("registerForm"); hide("loginForm");
// });
// on(qs("tabLogin"), "click", () => {
//     qs("tabLogin").className = "flex-1 py-2 text-xs font-bold rounded-md bg-slate-800 text-white transition-all shadow";
//     qs("tabRegister").className = "flex-1 py-2 text-xs font-bold rounded-md text-slate-400 hover:text-white transition-all";
//     show("loginForm"); hide("registerForm");
// });

// // Listings Tabs
// on(qs("createListingTab"), "click", () => { 
//     show("uploadWrapper"); hide("userListings"); 
//     qs("createListingTab").classList.replace("text-slate-400", "text-white"); qs("createListingTab").classList.add("bg-slate-800");
//     qs("yourListingsTab").classList.replace("text-white", "text-slate-400"); qs("yourListingsTab").classList.remove("bg-slate-800");
//     if(!editPostId) { qs("uploadForm").reset(); qs("uploadFormBtn").textContent = "Upload Listing"; hide("deleteEditBtn"); }
// });
// on(qs("yourListingsTab"), "click", () => { 
//     hide("uploadWrapper"); show("userListings"); 
//     qs("yourListingsTab").classList.replace("text-slate-400", "text-white"); qs("yourListingsTab").classList.add("bg-slate-800");
//     qs("createListingTab").classList.replace("text-white", "text-slate-400"); qs("createListingTab").classList.remove("bg-slate-800");
//     editPostId = null; qs("uploadForm").reset(); qs("uploadFormBtn").textContent = "Upload Listing"; hide("deleteEditBtn");
//     renderFeed(); 
// });

// qsa(".nav-btn").forEach(b => on(b, "click", () => {
//     if(b.classList.contains("protected-nav") && !requireLogin()) return;
//     showSection(b.dataset.section);
//     if(b.dataset.section === 'upload') qs("yourListingsTab").click();
// }));

// // Modal Controls
// on(qs("loginBtn"), "click", () => show("loginModal"));
// on(qs("heroLoginBtn"), "click", () => show("loginModal"));
// on(qs("closeLogin"), "click", () => hide("loginModal"));
// on(qs("closeChat"), "click", () => hide("chatModal"));
// on(qs("logoutBtn"), "click", () => { signOut(auth); showSection("landing"); });
// on(qs("heroExploreBtn"), "click", () => { if(requireLogin()) showSection("feed"); });

// // Filters & Calc
// on(qs("priceFilter"), "change", renderFeed);
// on(qs("creditsFilter"), "change", renderFeed);
// on(qs("gotoCalcLink"), "click", () => showSection("calculator"));

// qsa('input[name="calcMethod"]').forEach(r => on(r, "change", () => {
//     const v = document.querySelector('input[name="calcMethod"]:checked').value;
//     toggle("treeForm", v === "trees"); toggle("landForm", v !== "trees"); hide("calcResult");
// }));
// on(qs("calcTreesBtn"), "click", () => { show("calcResult"); qs("totalCredits").textContent = ((qs("treeCount").value * qs("treeType").value * qs("treeYears").value)/1000).toFixed(2) + " Tons CO2"; });
// on(qs("calcLandBtn"), "click", () => { const factor = qs("landUnit").value === 'hectares' ? 6 : 2.4; show("calcResult"); qs("totalCredits").textContent = (qs("landArea").value * factor * qs("landYears").value).toFixed(2) + " Tons CO2"; });

// // ==========================================
// // 10. HTML TEMPLATES
// // ==========================================
// const htmlPost = (p) => {
//     const isMine = state.currentUser && p.user === state.currentUser.name;
//     const badge = isMine ? `<span class="bg-emerald-500 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded ml-2">CREATED BY YOU</span>` : '';
//     // Passes OwnerID to startChat (Critical Fix)
//     const chatBtn = !isMine ? `<button onclick="window.startChat('${p.id}', '${p.user}', '${p.ownerId}')" class="w-full py-2 bg-slate-800 text-xs rounded border border-slate-600 relative hover:bg-slate-700 font-semibold transition-colors">💬 Chat with Seller</button>` : '';

//     return `<div class="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-lg flex flex-col hover:border-slate-600 transition-all"><img src="${p.image}" class="w-full h-44 object-cover"><div class="p-3 flex flex-col flex-1"><div class="flex justify-between items-start mb-1"><h3 class="font-bold text-sm truncate flex-1 text-slate-200">${p.title}</h3>${badge}</div><p class="text-[10px] text-slate-500 mb-2">By ${p.user} • ${new Date(p.createdAt).toLocaleDateString()}</p><p class="text-xs text-slate-400 mb-3 truncate">${p.desc}</p><div class="flex justify-between text-[11px] mb-3"><span class="text-emerald-300 bg-emerald-900/30 px-2 py-0.5 rounded-full border border-emerald-500/20">${p.credits} Credits</span><span class="text-white font-bold">₹${p.price}</span></div><div class="mt-auto">${chatBtn}</div></div></div>`;
// };
// const htmlListRow = (p) => `<div class="bg-slate-900 p-3 border border-slate-700 rounded-lg mb-2 flex justify-between text-xs items-center hover:bg-slate-800 transition-colors"><span>${p.title}</span><button class="text-emerald-400 font-bold underline" onclick="window.editPost('${p.id}')">Edit</button></div>`;
// const htmlInboxItem = (c, myId) => {
//     const msgs = c.messages || [];
//     const last = msgs[msgs.length-1] || { text: 'No messages yet', senderName: '' };
//     const unread = msgs.filter(m => m.senderId !== myId && !m.seen).length;
//     const otherName = c.participantNames.find(n => n !== state.currentUser.name) || "User";
    
//     return `<div onclick="window.openExistingChat('${c.id}')" class="bg-slate-900 p-3 rounded-lg border border-slate-700 cursor-pointer flex justify-between items-center hover:bg-slate-800 transition-colors"><div><div class="text-sm font-bold text-emerald-100 flex items-center gap-2">${c.postTitle} <span class="text-xs text-slate-400 font-normal">w/ ${otherName}</span> ${unread>0?`<span class="bg-red-500 text-white text-[9px] px-1.5 rounded-full shadow-sm">${unread}</span>`:''}</div><div class="text-xs text-slate-400 truncate max-w-[200px] mt-0.5">${last.senderName}: ${last.text}</div></div><div class="text-xs text-emerald-500 font-bold">Open</div></div>`;
// };
// const htmlAdminUser = (u) => `<tr class="text-xs border-b border-slate-700"><td class="p-2 text-slate-300">${u.name}</td><td class="p-2 text-slate-400">${u.role}</td><td class="p-2 text-right"><button onclick="window.deleteUser('${u.id}')" class="text-red-400 hover:text-red-300 font-bold">Remove</button></td></tr>`;
// const htmlAdminPost = (p) => `<div class="flex justify-between items-center bg-slate-900 p-2 text-xs border border-slate-700 rounded mb-1"><div class="flex flex-col"><span class="font-bold text-slate-200">${p.title}</span><span class="text-[10px] text-slate-400">By ${p.user}</span></div><div class="flex gap-2"><button onclick="window.deletePost('${p.id}')" class="text-red-400 font-bold hover:text-red-300">Delete</button></div></div>`;

// const init = () => {
//     updateAuthUI();
//     startListeners();
//     const lastSec = localStorage.getItem(LAST_SECTION_KEY);
//     const target = lastSec && qs("section-" + lastSec) ? lastSec : "landing";
//     showSection(target);
// };

// if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
// else init();


// // ==========================================
// // 1. IMPORTS & CONFIGURATION
// // ==========================================
// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
// import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
// import { getFirestore, collection, addDoc, getDocs, getDoc, doc, updateDoc, arrayUnion, query, orderBy, onSnapshot, setDoc, deleteDoc, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// // ==========================================
// // 2. UTILITIES
// // ==========================================
// const qs = id => document.getElementById(id);
// const qsa = sel => document.querySelectorAll(sel);
// const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

// const getEl = (input) => (typeof input === 'string' ? qs(input) : input);
// const show = (input) => getEl(input)?.classList.remove("hidden");
// const hide = (input) => getEl(input)?.classList.add("hidden");
// const toggle = (input, condition) => condition ? show(input) : hide(input);

// const LAST_SECTION_KEY = "ccx_last_section_final";
// let state = { users: [], posts: [], chats: [], currentUser: null };
// let editPostId = null, currentChatId = null, chatUnsubscribe = null;

// // ==========================================
// // 3. UI NAVIGATION
// // ==========================================
// const showSection = name => {
//   qsa(".section").forEach(s => s.classList.add("hidden"));
//   const target = qs("section-" + name) ? name : "landing";
//   show("section-" + target);
//   localStorage.setItem(LAST_SECTION_KEY, target);
  
//   // FORCE REFRESH INBOX if clicked
//   if(target === 'inbox') renderInbox();

//   qsa(".nav-btn").forEach(btn => {
//     const isActive = btn.dataset.section === target;
//     if (isActive) {
//         btn.classList.remove("bg-slate-900", "text-slate-100", "border-transparent", "hover:bg-slate-800");
//         btn.classList.add("bg-emerald-600", "text-white", "font-bold", "border-emerald-400");
//     } else {
//         btn.classList.add("bg-slate-900", "text-slate-100", "border-transparent", "hover:bg-slate-800");
//         btn.classList.remove("bg-emerald-600", "text-white", "font-bold", "border-emerald-400");
//     }
//   });
// };

// const updateAuthUI = () => {
//   const u = state.currentUser;
//   const isAdmin = u?.role === 'admin';

//   toggle("loginBtn", !u);
//   toggle("heroLoginBtn", !u);
//   toggle("logoutBtn", u);
//   toggle("userBadge", u);
//   toggle("welcomeWrapper", u);
//   toggle("feedFilters", u);

//   qsa(".protected-nav").forEach(el => {
//       if (el.id === "adminTab") toggle(el, u && isAdmin); 
//       else toggle(el, !!u);
//   });

//   if (u) {
//     qs("badgeName").textContent = u.name;
//     qs("badgeRole").textContent = u.role;
//     qs("welcomeName").textContent = u.name;
//   }
// };

// const requireLogin = () => {
//   if (!state.currentUser) {
//     alert("Please login first.");
//     show("loginModal");
//     return false;
//   }
//   return true;
// };

// // ==========================================
// // 4. DATA LOGIC (FIXED)
// // ==========================================
// // --- REPLACE 'startListeners' FUNCTION ---
// const startListeners = () => {
//     // 1. Posts Listener
//     onSnapshot(query(collection(db, "posts"), orderBy("createdAt", "desc")), (snap) => {
//         state.posts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//         renderFeed(); 
//     });

//     // 2. Users Listener (Syncs Profile & Starts Inbox)
//     onSnapshot(collection(db, "users"), (snap) => {
//         state.users = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
//         // Auto-login logic
//         if (auth.currentUser) {
//             const me = state.users.find(u => u.id === auth.currentUser.uid);
//             if (me) {
//                 // If user just loaded or changed
//                 if (!state.currentUser || state.currentUser.id !== me.id) {
//                     state.currentUser = me;
//                     updateAuthUI();
//                     subscribeToChats(me.id); // <--- CRITICAL: Starts the Inbox Listener
//                     renderFeed();
//                 }
//             }
//         }
//     });
// };

// // --- REPLACE 'subscribeToChats' FUNCTION ---
// let unsubscribeChats = null;
// const subscribeToChats = (uid) => {
//     if(unsubscribeChats) unsubscribeChats();
    
//     // Query: Find all chats where I am a participant
//     const q = query(collection(db, "chats"), where("participants", "array-contains", uid));
    
//     unsubscribeChats = onSnapshot(q, (snap) => {
//         state.chats = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
//         // 1. Calculate Unread Count for Red Dot
//         let totalUnread = 0;
//         state.chats.forEach(c => {
//             const msgs = c.messages || [];
//             // Count messages NOT sent by me and NOT seen
//             totalUnread += msgs.filter(m => m.senderId !== uid && !m.seen).length;
//         });
        
//         // 2. Toggle Red Dot UI
//         const indicator = qs("inboxIndicator");
//         if(indicator) {
//             if(totalUnread > 0) indicator.classList.remove("hidden");
//             else indicator.classList.add("hidden");
//         }

//         // 3. Refresh Inbox List
//         renderInbox();
        
//         // 4. Update Open Chat Window (if active)
//         if (currentChatId && !qs("chatModal").classList.contains("hidden")) {
//             const activeChat = state.chats.find(c => c.id === currentChatId);
//             if(activeChat) renderChatMessages(activeChat);
//         }
//     });
// };

// // ==========================================
// // 5. AUTH HANDLERS
// // ==========================================
// on(qs("registerForm"), "submit", async e => {
//   e.preventDefault();
//   const [name, email, pass] = [qs("regName").value, qs("regEmail").value, qs("regPass").value];
//   try {
//     const { user } = await createUserWithEmailAndPassword(auth, email, pass);
//     const role = (name.toLowerCase() === "bajaish") ? "admin" : "user";
//     await setDoc(doc(db, "users", user.uid), { id: user.uid, name, email, role, createdAt: Date.now() });
//     alert("Registered! Please login.");
//     qs("tabLogin").click();
//   } catch (err) { alert(err.message); }
// });

// on(qs("loginForm"), "submit", async e => {
//   e.preventDefault();
//   const name = qs("loginName").value;
//   const password = qs("loginPass").value;
//   const selectedRole = qs("loginRole").value;

//   try {
//     const snap = await getDocs(collection(db, "users"));
//     const userDoc = snap.docs.find(d => d.data().name === name);
//     if (!userDoc) throw new Error("User not found.");
    
//     const userData = userDoc.data();
//     if (userData.role !== selectedRole) throw new Error(`Role mismatch. You are registered as ${userData.role}.`);

//     await signInWithEmailAndPassword(auth, userData.email, password);
    
//     state.currentUser = { id: userDoc.id, ...userData };
//     updateAuthUI();
//     subscribeToChats(userData.id); 
//     hide("loginModal");
//     showSection("feed");
//   } catch (err) { alert(err.message); }
// });

// onAuthStateChanged(auth, async (user) => {
//     if (user) {
//         if (!state.currentUser) {
//             const snap = await getDoc(doc(db, "users", user.uid));
//             if (snap.exists()) {
//                 state.currentUser = { id: snap.id, ...snap.data() };
//                 updateAuthUI();
//                 subscribeToChats(state.currentUser.id);
//                 renderFeed();
//             }
//         }
//     } else {
//         state.currentUser = null;
//         state.chats = [];
//         updateAuthUI();
//         renderFeed();
//         renderInbox();
//     }
// });

// // ==========================================
// // 6. CHAT LOGIC (SMART START)
// // ==========================================
// // Takes just postId. Finds Owner ID internally. Handles Legacy posts.
// // --- REPLACE 'window.startChat' ---
// window.startChat = async (postId, ownerId) => {
//     if(!requireLogin()) return;
    
//     const myId = state.currentUser.id;
//     let targetId = ownerId;
//     let ownerName = "Seller";

//     // Handle Legacy Posts (Find owner by name if ID missing)
//     if (!targetId) {
//         const post = state.posts.find(p => p.id === postId);
//         const targetUser = state.users.find(u => u.name === post.user);
//         if (targetUser) {
//             targetId = targetUser.id;
//             ownerName = targetUser.name;
//         } else {
//             return alert("Seller details missing. Cannot chat.");
//         }
//     } else {
//         const u = state.users.find(x => x.id === targetId);
//         if(u) ownerName = u.name;
//     }

//     if(targetId === myId) return alert("You cannot chat with yourself.");

//     // CHECK FOR EXISTING CHAT (Prevents Duplicates)
//     // We look for a chat where BOTH users are participants
//     let chat = state.chats.find(c => c.participants.includes(myId) && c.participants.includes(targetId));
    
//     if(!chat) {
//         // Create New Chat Room
//         const ref = await addDoc(collection(db, "chats"), {
//             participants: [myId, targetId],
//             participantNames: { [myId]: state.currentUser.name, [targetId]: ownerName },
//             messages: [],
//             updatedAt: Date.now()
//         });
//         currentChatId = ref.id;
//         chat = { id: ref.id, messages: [] };
//     } else {
//         currentChatId = chat.id;
//     }

//     // Open Modal
//     qs("chatPostTitle").textContent = `Chat with ${ownerName}`;
//     show("chatModal"); 
//     show("chatForm");
//     renderChatMessages(chat);
// };

// window.openExistingChat = (chatId) => {
//     currentChatId = chatId;
//     const chat = state.chats.find(c => c.id === chatId);
//     if(!chat) return;
//     qs("chatPostTitle").textContent = chat.postTitle;
//     show("chatModal"); show("chatForm");
//     renderChatMessages(chat);
// };

// // --- REPLACE 'renderChatMessages' ---
// const renderChatMessages = (chat) => {
//     const box = qs("chatMessages");
//     const myId = state.currentUser.id;
    
//     // Render Messages
//     box.innerHTML = (chat.messages||[]).map(m => {
//         const isMe = m.senderId === myId;
//         const seenLabel = (isMe && m.seen) ? '<span class="text-[8px] text-emerald-300 ml-1">✓✓</span>' : '';
        
//         return `
//         <div class="flex ${isMe?'justify-end':'justify-start'}">
//             <div class="px-3 py-1.5 rounded-lg mb-1 text-xs max-w-[80%] ${isMe?'bg-emerald-600 text-white':'bg-slate-700 text-slate-200'}">
//                 <div class="font-bold opacity-50 text-[9px] mb-0.5">${m.senderName}</div>
//                 ${m.text}
//                 ${seenLabel}
//             </div>
//         </div>`;
//     }).join("");
    
//     box.scrollTop = box.scrollHeight;

//     // MARK AS SEEN LOGIC
//     // If there are messages from the other person that are NOT seen, update them now.
//     const needsUpdate = (chat.messages||[]).some(m => m.senderId !== myId && !m.seen);
    
//     if(needsUpdate) {
//         const updatedMsgs = chat.messages.map(m => {
//             if(m.senderId !== myId) return {...m, seen: true}; // Mark theirs as seen
//             return m; // Keep mine as is
//         });
        
//         // Update Database (This will trigger listener again to show checks)
//         updateDoc(doc(db, "chats", chat.id), { messages: updatedMsgs });
//     }
// };
// on(qs("chatForm"), "submit", async e => {
//     e.preventDefault();
//     const text = qs("chatInput").value.trim();
//     if(!text) return;
    
//     await updateDoc(doc(db, "chats", currentChatId), {
//         messages: arrayUnion({ senderId: state.currentUser.id, senderName: state.currentUser.name, text, time: Date.now(), seen: false }),
//         updatedAt: Date.now()
//     });
//     qs("chatInput").value = "";
// });

// // ==========================================
// // 7. RENDERERS & ACTIONS
// // ==========================================
// const renderFeed = () => {
//     const container = qs("feedContainer");
//     let arr = state.posts.filter(p => p.status !== 'removed');
    
//     const pf = qs("priceFilter")?.value || "none";
//     if (pf === "low-high") arr.sort((a,b) => a.price - b.price);
//     if (pf === "high-low") arr.sort((a,b) => b.price - a.price);

//     const cf = qs("creditsFilter")?.value || "all";
//     if (cf === "1-10") arr = arr.filter(p => p.credits >= 1 && p.credits <= 10);
//     if (cf === "50+") arr = arr.filter(p => p.credits >= 50);

//     container.innerHTML = arr.length ? arr.map(htmlPost).join("") : '<p class="text-slate-400 text-sm mt-2 col-span-full">No posts yet.</p>';
    
//     // Update User Listings
//     const myName = state.currentUser?.name;
//     if(!qs("userListings").classList.contains("hidden")) {
//         const myPosts = state.posts.filter(p => p.user === myName);
//         qs("userListings").innerHTML = myPosts.length ? myPosts.map(htmlListRow).join("") : '<p class="text-slate-400 text-xs">No listings found.</p>';
//     }
// };

// // --- REPLACE 'renderInbox' ---
// const renderInbox = () => {
//     const list = qs("inboxList");
//     if(!list) return;

//     // 1. Check Login
//     if(!state.currentUser) {
//         list.innerHTML = `<p class="text-slate-400 text-sm">Please login to view chats.</p>`;
//         return;
//     }
    
//     const myId = state.currentUser.id;
//     const chats = state.chats || [];

//     if(chats.length === 0) {
//         list.innerHTML = '<p class="text-slate-400 text-sm">No conversations yet.</p>';
//         return;
//     }

//     // Sort by latest message
//     chats.sort((a,b) => (b.updatedAt || 0) - (a.updatedAt || 0));

//     list.innerHTML = chats.map(c => {
//         const msgs = c.messages || [];
//         const last = msgs[msgs.length-1] || { text: 'New conversation', senderName: '' };
        
//         // Count unread for THIS specific chat
//         const unreadCount = msgs.filter(m => m.senderId !== myId && !m.seen).length;
        
//         // Find other person's name securely
//         let otherName = "User";
//         if(c.participantNames) {
//             // Get the name that DOESN'T belong to me
//             const otherId = c.participants.find(id => id !== myId);
//             otherName = c.participantNames[otherId] || "User";
//         }

//         return `
//         <div onclick="window.openExistingChat('${c.id}')" class="bg-slate-900 p-3 rounded-lg border border-slate-700 cursor-pointer flex justify-between items-center hover:bg-slate-800 transition-colors">
//             <div>
//                <div class="text-sm font-bold text-emerald-100 flex items-center gap-2">
//                  ${otherName} 
//                  ${unreadCount > 0 ? `<span class="bg-red-500 text-white text-[9px] px-1.5 rounded-full shadow-sm">${unreadCount}</span>` : ''}
//                </div>
//                <div class="text-xs text-slate-400 truncate max-w-[200px] mt-0.5">
//                  ${last.senderId === myId ? 'You: ' : ''}${last.text}
//                </div>
//             </div>
//             <div class="text-xs text-emerald-500 font-bold">Open</div>
//         </div>`;
//     }).join("");
// };

// const renderAdmin = () => {
//     if(state.currentUser?.role !== 'admin') return;
//     qs("adminList").innerHTML = `
//       <div class="mb-4"><h3 class="font-bold text-sm mb-2 text-emerald-400">Users</h3><table class="w-full text-left">${state.users.map(htmlAdminUser).join("")}</table></div>
//       <div><h3 class="font-bold text-sm mb-2 text-emerald-400">Posts</h3>${state.posts.map(htmlAdminPost).join("")}</div>`;
// };

// // Post Actions
// window.editPost = (id) => {
//     const p = state.posts.find(x => x.id == id);
//     if(!p) return;
//     editPostId = id;
//     qs("postTitle").value = p.title; qs("postDesc").value = p.desc;
//     qs("postPrice").value = p.price; qs("postCredits").value = p.credits;
//     qs("uploadFormBtn").textContent = "Update Listing"; 
//     show("deleteEditBtn"); 
//     qs("createListingTab").click();
// };

// on(qs("deleteEditBtn"), "click", async () => {
//     if(!editPostId) return;
//     if(confirm("Delete this listing permanently?")) {
//         await deleteDoc(doc(db, "posts", editPostId));
//         qs("uploadForm").reset(); editPostId = null; 
//         qs("uploadFormBtn").textContent = "Upload Listing"; 
//         hide("deleteEditBtn");
//         qs("yourListingsTab").click();
//     }
// });

// window.deleteUser = async (id) => { if(confirm("Delete user?")) await deleteDoc(doc(db, "users", id)); };
// window.deletePost = async (id) => { if(confirm("Delete post?")) await deleteDoc(doc(db, "posts", id)); };

// on(qs("uploadForm"), "submit", async e => {
//   e.preventDefault();
//   if(!requireLogin()) return;
//   const file = qs("postImage").files[0];
//   const reader = new FileReader();
//   const save = async (img) => {
//     const data = { 
//         title: qs("postTitle").value, desc: qs("postDesc").value, 
//         price: Number(qs("postPrice").value), credits: Number(qs("postCredits").value),
//         user: state.currentUser.name, 
//         ownerId: state.currentUser.id, // VITAL
//         image: img, createdAt: Date.now(), status: "active"
//     };
//     if(editPostId) { if(!img) delete data.image; await updateDoc(doc(db, "posts", editPostId), data); }
//     else { if(!img) return alert("Image required"); await addDoc(collection(db, "posts"), data); }
//     qs("uploadForm").reset(); editPostId = null; 
//     qs("uploadFormBtn").textContent = "Upload Listing"; hide("deleteEditBtn");
//     qs("yourListingsTab").click();
//   };
//   if(file) { reader.onload = ev => save(ev.target.result); reader.readAsDataURL(file); } else save(null);
// });

// // ==========================================
// // 8. TEMPLATES
// // ==========================================
// const htmlPost = (p) => {
//     const isMine = state.currentUser && p.user === state.currentUser.name;
//     const badge = isMine ? `<span class="bg-emerald-500 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded ml-2">CREATED BY YOU</span>` : '';
//     // Passing ONLY ID now (Safe)
//     const chatBtn = !isMine ? `<button onclick="window.startChat('${p.id}')" class="w-full py-2 bg-slate-800 text-xs rounded border border-slate-600 relative hover:bg-slate-700 font-semibold transition-colors">💬 Chat with Seller</button>` : '';

//     return `<div class="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-lg flex flex-col hover:border-slate-600 transition-all"><img src="${p.image}" class="w-full h-44 object-cover"><div class="p-3 flex flex-col flex-1"><div class="flex justify-between items-start mb-1"><h3 class="font-bold text-sm truncate flex-1 text-slate-200">${p.title}</h3>${badge}</div><p class="text-[10px] text-slate-500 mb-2">By ${p.user} • ${new Date(p.createdAt).toLocaleDateString()}</p><p class="text-xs text-slate-400 mb-3 truncate">${p.desc}</p><div class="flex justify-between text-[11px] mb-3"><span class="text-emerald-300 bg-emerald-900/30 px-2 py-0.5 rounded-full border border-emerald-500/20">${p.credits} Credits</span><span class="text-white font-bold">₹${p.price}</span></div><div class="mt-auto">${chatBtn}</div></div></div>`;
// };
// const htmlListRow = (p) => `<div class="bg-slate-900 p-3 border border-slate-700 rounded-lg mb-2 flex justify-between text-xs items-center hover:bg-slate-800 transition-colors"><span>${p.title}</span><button class="text-emerald-400 font-bold underline" onclick="window.editPost('${p.id}')">Edit</button></div>`;
// const htmlInboxItem = (c, myId) => {
//     const msgs = c.messages || [];
//     const last = msgs[msgs.length-1] || { text: 'No messages yet', senderName: '' };
//     const unread = msgs.filter(m => m.senderId !== myId && !m.seen).length;
//     const otherName = c.participantNames.find(n => n !== state.currentUser.name) || "User";
    
//     return `<div onclick="window.openExistingChat('${c.id}')" class="bg-slate-900 p-3 rounded-lg border border-slate-700 cursor-pointer flex justify-between items-center hover:bg-slate-800 transition-colors"><div><div class="text-sm font-bold text-emerald-100 flex items-center gap-2">${c.postTitle} <span class="text-xs text-slate-400 font-normal">w/ ${otherName}</span> ${unread>0?`<span class="bg-red-500 text-white text-[9px] px-1.5 rounded-full shadow-sm">${unread}</span>`:''}</div><div class="text-xs text-slate-400 truncate max-w-[200px] mt-0.5">${last.senderName}: ${last.text}</div></div><div class="text-xs text-emerald-500 font-bold">Open</div></div>`;
// };
// const htmlAdminUser = (u) => `<tr class="text-xs border-b border-slate-700"><td class="p-2 text-slate-300">${u.name}</td><td class="p-2 text-slate-400">${u.role}</td><td class="p-2 text-right"><button onclick="window.deleteUser('${u.id}')" class="text-red-400 hover:text-red-300 font-bold">Remove</button></td></tr>`;
// const htmlAdminPost = (p) => `<div class="flex justify-between items-center bg-slate-900 p-2 text-xs border border-slate-700 rounded mb-1"><div class="flex flex-col"><span class="font-bold text-slate-200">${p.title}</span><span class="text-[10px] text-slate-400">By ${p.user}</span></div><div class="flex gap-2"><button onclick="window.deletePost('${p.id}')" class="text-red-400 font-bold hover:text-red-300">Delete</button></div></div>`;

// // ==========================================
// // 9. BINDINGS
// // ==========================================
// on(qs("tabRegister"), "click", () => {
//     qs("tabRegister").className = "flex-1 py-2 text-xs font-bold rounded-md bg-slate-800 text-white transition-all shadow";
//     qs("tabLogin").className = "flex-1 py-2 text-xs font-bold rounded-md text-slate-400 hover:text-white transition-all";
//     show("registerForm"); hide("loginForm");
// });
// on(qs("tabLogin"), "click", () => {
//     qs("tabLogin").className = "flex-1 py-2 text-xs font-bold rounded-md bg-slate-800 text-white transition-all shadow";
//     qs("tabRegister").className = "flex-1 py-2 text-xs font-bold rounded-md text-slate-400 hover:text-white transition-all";
//     show("loginForm"); hide("registerForm");
// });

// on(qs("createListingTab"), "click", () => { 
//     show("uploadWrapper"); hide("userListings"); 
//     qs("createListingTab").classList.replace("text-slate-300", "text-white"); qs("createListingTab").classList.add("bg-slate-800");
//     qs("yourListingsTab").classList.replace("text-white", "text-slate-300"); qs("yourListingsTab").classList.remove("bg-slate-800");
//     if(!editPostId) { qs("uploadForm").reset(); qs("uploadFormBtn").textContent = "Upload Listing"; hide("deleteEditBtn"); }
// });
// on(qs("yourListingsTab"), "click", () => { 
//     hide("uploadWrapper"); show("userListings"); 
//     qs("yourListingsTab").classList.replace("text-slate-300", "text-white"); qs("yourListingsTab").classList.add("bg-slate-800");
//     qs("createListingTab").classList.replace("text-white", "text-slate-300"); qs("createListingTab").classList.remove("bg-slate-800");
//     editPostId = null; qs("uploadForm").reset(); qs("uploadFormBtn").textContent = "Upload Listing"; hide("deleteEditBtn");
//     renderFeed(); 
// });

// qsa(".nav-btn").forEach(b => on(b, "click", () => {
//     if(b.classList.contains("protected-nav") && !requireLogin()) return;
//     showSection(b.dataset.section);
//     if(b.dataset.section === 'upload') qs("yourListingsTab").click();
// }));

// on(qs("loginBtn"), "click", () => show("loginModal"));
// on(qs("heroLoginBtn"), "click", () => show("loginModal"));
// on(qs("closeLogin"), "click", () => hide("loginModal"));
// on(qs("closeChat"), "click", () => hide("chatModal"));
// on(qs("logoutBtn"), "click", () => { signOut(auth); showSection("landing"); });
// on(qs("heroExploreBtn"), "click", () => { if(requireLogin()) showSection("feed"); });
// on(qs("priceFilter"), "change", renderFeed);
// on(qs("creditsFilter"), "change", renderFeed);
// on(qs("gotoCalcLink"), "click", () => showSection("calculator"));

// qsa('input[name="calcMethod"]').forEach(r => on(r, "change", () => {
//     const v = document.querySelector('input[name="calcMethod"]:checked').value;
//     toggle("treeForm", v === "trees"); toggle("landForm", v !== "trees"); hide("calcResult");
// }));
// on(qs("calcTreesBtn"), "click", () => { show("calcResult"); qs("totalCredits").textContent = ((qs("treeCount").value * qs("treeType").value * qs("treeYears").value)/1000).toFixed(2) + " Tons CO2"; });
// on(qs("calcLandBtn"), "click", () => { const factor = qs("landUnit").value === 'hectares' ? 6 : 2.4; show("calcResult"); qs("totalCredits").textContent = (qs("landArea").value * factor * qs("landYears").value).toFixed(2) + " Tons CO2"; });

// // INIT
// const init = () => {
//     updateAuthUI();
//     startListeners();
//     const lastSec = localStorage.getItem(LAST_SECTION_KEY);
//     const target = lastSec && qs("section-" + lastSec) ? lastSec : "landing";
//     showSection(target);
// };

// if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
// else init();




// ==========================================
// 1. CONFIGURATION
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, getDoc, doc, updateDoc, arrayUnion, query, orderBy, onSnapshot, setDoc, deleteDoc, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// ==========================================
// 2. CORE UTILITIES
// ==========================================
const qs = id => document.getElementById(id);
const qsa = sel => document.querySelectorAll(sel);
const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

const getEl = (input) => (typeof input === 'string' ? qs(input) : input);
const show = (input) => getEl(input)?.classList.remove("hidden");
const hide = (input) => getEl(input)?.classList.add("hidden");
const toggle = (input, condition) => condition ? show(input) : hide(input);

const LAST_SECTION_KEY = "ccx_FINAL_v999";
let state = { users: [], posts: [], chats: [], currentUser: null };
let editPostId = null, currentChatId = null, chatUnsubscribe = null;

// ==========================================
// 3. NAVIGATION
// ==========================================
const showSection = name => {
  qsa(".section").forEach(s => s.classList.add("hidden"));
  const target = qs("section-" + name) ? name : "landing";
  show("section-" + target);
  localStorage.setItem(LAST_SECTION_KEY, target);
  
  if(target === 'inbox') renderInbox();

  qsa(".nav-btn").forEach(btn => {
    const isActive = btn.dataset.section === target;
    if (isActive) {
        btn.classList.remove("bg-slate-900", "text-slate-100", "border-transparent", "hover:bg-slate-800");
        btn.classList.add("bg-emerald-600", "text-white", "font-bold", "border-emerald-400");
    } else {
        btn.classList.add("bg-slate-900", "text-slate-100", "border-transparent", "hover:bg-slate-800");
        btn.classList.remove("bg-emerald-600", "text-white", "font-bold", "border-emerald-400");
    }
  });
};

const updateAuthUI = () => {
  const u = state.currentUser;
  const isAdmin = u?.role === 'admin';

  toggle("loginBtn", !u);
  toggle("heroLoginBtn", !u);
  toggle("logoutBtn", u);
  toggle("userBadge", u);
  toggle("welcomeWrapper", u);
  toggle("feedFilters", u);

  qsa(".protected-nav").forEach(el => {
      if (el.id === "adminTab") toggle(el, u && isAdmin); 
      else toggle(el, !!u);
  });

  if (u) {
    qs("badgeName").textContent = u.name;
    qs("badgeRole").textContent = u.role;
    qs("welcomeName").textContent = u.name;
  }
};

const requireLogin = () => {
  if (!state.currentUser) {
    alert("Please login first.");
    show("loginModal");
    return false;
  }
  return true;
};

// ==========================================
// 4. DATA LOGIC (CRITICAL FIXES)
// ==========================================
const startListeners = () => {
    // 1. Posts
    onSnapshot(query(collection(db, "posts"), orderBy("createdAt", "desc")), (snap) => {
        state.posts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderFeed(); 
    });

    // 2. Users
    onSnapshot(collection(db, "users"), (snap) => {
        state.users = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (auth.currentUser) {
            const me = state.users.find(u => u.id === auth.currentUser.uid);
            if (me) {
                if (!state.currentUser || state.currentUser.id !== me.id) {
                    state.currentUser = me;
                    updateAuthUI();
                    // <--- Starts Inbox Listener
                    renderFeed();
                }
            }
        }
    });
};

const subscribeToChats = (uid) => {
    if(chatUnsubscribe) chatUnsubscribe();
    
    // Find all chats where I am a participant
    const q = query(collection(db, "chats"), where("participants", "array-contains", uid));
    
    chatUnsubscribe = onSnapshot(q, (snap) => {
        state.chats = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderInbox(); // Update UI
        
        // Update Active Chat Window
        if (currentChatId && !qs("chatModal").classList.contains("hidden")) {
            const active = state.chats.find(c => c.id === currentChatId);
            if(active) renderChatMessages(active);
        }
    });
};

// ==========================================
// 5. CHAT LOGIC (SMART & ROBUST)
// ==========================================
// Takes just ONE argument: Post ID. Finds the rest securely.
const startChat = async (postId) => {
  if (!requireLogin()) return;

  const post = state.posts.find(p => p.id === postId);
  if (!post) return alert("Post not found");

  const myId = state.currentUser.id;
  const targetId = post.ownerId;

  if (!targetId) {
    alert("Seller information missing.");
    return;
  }

  if (targetId === myId) {
    alert("You cannot chat with yourself.");
    return;
  }

  let chat = state.chats.find(
    c => c.postId === postId &&
         c.participants.includes(myId) &&
         c.participants.includes(targetId)
  );

  if (!chat) {
    const ref = await addDoc(collection(db, "chats"), {
      postId,
      postTitle: post.title,
      participants: [myId, targetId],
      participantNames: [state.currentUser.name, post.user],
      messages: [],
      updatedAt: Date.now()
    });

    chat = {
      id: ref.id,
      postTitle: post.title,
      messages: []
    };
  }

  currentChatId = chat.id;
  qs("chatPostTitle").textContent = chat.postTitle;
  show("chatModal");
  show("chatForm");
  renderChatMessages(chat);
};

window.openExistingChat = (chatId) => {
    currentChatId = chatId;
    const chat = state.chats.find(c => c.id === chatId);
    if(!chat) return;
    qs("chatPostTitle").textContent = chat.postTitle;
    show("chatModal"); show("chatForm");
    renderChatMessages(chat);
};

const renderChatMessages = (chat) => {
    const box = qs("chatMessages");
    const myId = state.currentUser.id;
    
    box.innerHTML = (chat.messages||[]).map(m => {
        const isMe = m.senderId === myId;
        return `<div class="flex ${isMe?'justify-end':'justify-start'}"><div class="px-3 py-1.5 rounded-lg mb-1 text-xs max-w-[80%] ${isMe?'bg-emerald-600 text-white':'bg-slate-700 text-slate-200'}"><div class="font-bold opacity-50 text-[9px] mb-0.5">${m.senderName}</div>${m.text}</div></div>`;
    }).join("");
    box.scrollTop = box.scrollHeight;

    // Mark as seen
    const needsUpdate = (chat.messages||[]).some(m => m.senderId !== myId && !m.seen);
    if(needsUpdate) {
        const updatedMsgs = chat.messages.map(m => (m.senderId !== myId ? {...m, seen: true} : m));
        updateDoc(doc(db, "chats", chat.id), { messages: updatedMsgs });
    }
};

on(qs("chatForm"), "submit", async e => {
    e.preventDefault();
    const text = qs("chatInput").value.trim();
    if(!text) return;
    
    await updateDoc(doc(db, "chats", currentChatId), {
        messages: arrayUnion({ senderId: state.currentUser.id, senderName: state.currentUser.name, text, time: Date.now(), seen: false }),
        updatedAt: Date.now()
    });
    qs("chatInput").value = "";
});

// ==========================================
// 6. RENDERERS (FEED & INBOX)
// ==========================================
const renderFeed = () => {
    const container = qs("feedContainer");
    let arr = state.posts.filter(p => p.status !== 'removed');
    
    // Filters
    const pf = qs("priceFilter")?.value || "none";
    if (pf === "low-high") arr.sort((a,b) => a.price - b.price);
    if (pf === "high-low") arr.sort((a,b) => b.price - a.price);

    const cf = qs("creditsFilter")?.value || "all";
    if (cf === "1-10") arr = arr.filter(p => p.credits >= 1 && p.credits <= 10);
    if (cf === "50+") arr = arr.filter(p => p.credits >= 50);

    container.innerHTML = arr.length ? arr.map(htmlPost).join("") : '<p class="text-slate-400 text-sm mt-2 col-span-full">No posts yet.</p>';
    
    const myName = state.currentUser?.name;
    if(!qs("userListings").classList.contains("hidden")) {
        const myPosts = state.posts.filter(p => p.user === myName);
        qs("userListings").innerHTML = myPosts.length ? myPosts.map(htmlListRow).join("") : '<p class="text-slate-400 text-xs">No listings found.</p>';
    }
};

const renderInbox = () => {
    const list = qs("inboxList");
    
    if(!state.currentUser) {
        toggle("inboxIndicator", false);
        if(list) list.innerHTML = `<p class="text-slate-400 text-sm">Please login to see messages.</p>`;
        return;
    }
    
    const myId = state.currentUser.id;
    const chats = state.chats || [];
    
    // Count Unread
    let totalUnread = 0;
    chats.forEach(c => totalUnread += (c.messages || []).filter(m => m.senderId !== myId && !m.seen).length);
    toggle("inboxIndicator", totalUnread > 0);

    if(!list) return;
    if(chats.length === 0) { list.innerHTML = '<p class="text-slate-400 text-sm">No chats found.</p>'; return; }

    chats.sort((a,b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    list.innerHTML = chats.map(c => htmlInboxItem(c, myId)).join("");
};

// ==========================================
// 7. POST ACTIONS
// ==========================================
window.editPost = (id) => {
    const p = state.posts.find(x => x.id == id);
    if(!p) return;
    editPostId = id;
    qs("postTitle").value = p.title; qs("postDesc").value = p.desc;
    qs("postPrice").value = p.price; qs("postCredits").value = p.credits;
    qs("uploadFormBtn").textContent = "Update Listing"; 
    show("deleteEditBtn"); 
    qs("createListingTab").click();
};

on(qs("deleteEditBtn"), "click", async () => {
    if(!editPostId) return;
    if(confirm("Delete this listing permanently?")) {
        await deleteDoc(doc(db, "posts", editPostId));
        qs("uploadForm").reset(); editPostId = null; 
        qs("uploadFormBtn").textContent = "Upload Listing"; 
        hide("deleteEditBtn");
        qs("yourListingsTab").click();
    }
});

on(qs("uploadForm"), "submit", async e => {
  e.preventDefault();
  if(!requireLogin()) return;
  const file = qs("postImage").files[0];
  const reader = new FileReader();
  const save = async (img) => {
    const data = { 
        title: qs("postTitle").value, desc: qs("postDesc").value, 
        price: Number(qs("postPrice").value), credits: Number(qs("postCredits").value),
        user: state.currentUser.name, 
        ownerId: state.currentUser.id, // Stores ID for Chat
        image: img, createdAt: Date.now(), status: "active"
    };
    if(editPostId) { if(!img) delete data.image; await updateDoc(doc(db, "posts", editPostId), data); }
    else { if(!img) return alert("Image required"); await addDoc(collection(db, "posts"), data); }
    qs("uploadForm").reset(); editPostId = null; 
    qs("uploadFormBtn").textContent = "Upload Listing"; hide("deleteEditBtn");
    qs("yourListingsTab").click();
  };
  if(file) { reader.onload = ev => save(ev.target.result); reader.readAsDataURL(file); } else save(null);
});

// ==========================================
// 8. AUTH & UI
// ==========================================
on(qs("registerForm"), "submit", async e => {
  e.preventDefault();
  const [name, email, pass] = [qs("regName").value, qs("regEmail").value, qs("regPass").value];
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, pass);
    const role = (name.toLowerCase() === "bajaish") ? "admin" : "user";
    await setDoc(doc(db, "users", user.uid), { id: user.uid, name, email, role, createdAt: Date.now() });
    alert("Registered! Please login.");
    qs("tabLogin").click();
  } catch (err) { alert(err.message); }
});

on(qs("loginForm"), "submit", async e => {
  e.preventDefault();
  const name = qs("loginName").value;
  const password = qs("loginPass").value;
  const selectedRole = qs("loginRole").value;

  try {
    const snap = await getDocs(collection(db, "users"));
    const userDoc = snap.docs.find(d => d.data().name === name);
    if (!userDoc) throw new Error("User not found.");
    
    const userData = userDoc.data();
    if (userData.role !== selectedRole) throw new Error(`Access Denied: You are not a ${selectedRole}.`);

    await signInWithEmailAndPassword(auth, userData.email, password);
    state.currentUser = { id: userDoc.id, ...userData };
    updateAuthUI();
    subscribeToChats(userData.id); 
    hide("loginModal");
    showSection("feed");
  } catch (err) { alert(err.message); }
});
 
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (!snap.exists()) return;

    state.currentUser = { id: snap.id, ...snap.data() };
    updateAuthUI();

    // 🔥 GUARANTEED CHAT LISTENER
    subscribeToChats(state.currentUser.id);

    renderFeed();
    renderInbox();
  } else {
    state.currentUser = null;
    state.chats = [];
    updateAuthUI();
    renderFeed();
    renderInbox();
  }
});

// Tabs
on(qs("tabRegister"), "click", () => {
    qs("tabRegister").className = "flex-1 py-2 text-xs font-bold rounded-md bg-slate-800 text-white transition-all shadow";
    qs("tabLogin").className = "flex-1 py-2 text-xs font-bold rounded-md text-slate-400 hover:text-white transition-all";
    show("registerForm"); hide("loginForm");
});
on(qs("tabLogin"), "click", () => {
    qs("tabLogin").className = "flex-1 py-2 text-xs font-bold rounded-md bg-slate-800 text-white transition-all shadow";
    qs("tabRegister").className = "flex-1 py-2 text-xs font-bold rounded-md text-slate-400 hover:text-white transition-all";
    show("loginForm"); hide("registerForm");
});

on(qs("createListingTab"), "click", () => { 
    show("uploadWrapper"); hide("userListings"); 
    qs("createListingTab").classList.replace("text-slate-300", "text-white"); qs("createListingTab").classList.add("bg-slate-800");
    qs("yourListingsTab").classList.replace("text-white", "text-slate-300"); qs("yourListingsTab").classList.remove("bg-slate-800");
    if(!editPostId) { qs("uploadForm").reset(); qs("uploadFormBtn").textContent = "Upload Listing"; hide("deleteEditBtn"); }
});
on(qs("yourListingsTab"), "click", () => { 
    hide("uploadWrapper"); show("userListings"); 
    qs("yourListingsTab").classList.replace("text-slate-300", "text-white"); qs("yourListingsTab").classList.add("bg-slate-800");
    qs("createListingTab").classList.replace("text-white", "text-slate-300"); qs("createListingTab").classList.remove("bg-slate-800");
    editPostId = null; qs("uploadForm").reset(); qs("uploadFormBtn").textContent = "Upload Listing"; hide("deleteEditBtn");
    renderFeed(); 
});

qsa(".nav-btn").forEach(b => on(b, "click", () => {
    if(b.classList.contains("protected-nav") && !requireLogin()) return;
    showSection(b.dataset.section);
    if(b.dataset.section === 'upload') qs("yourListingsTab").click();
}));

// Other
on(qs("loginBtn"), "click", () => show("loginModal"));
on(qs("heroLoginBtn"), "click", () => show("loginModal"));
on(qs("closeLogin"), "click", () => hide("loginModal"));
on(qs("closeChat"), "click", () => hide("chatModal"));
on(qs("logoutBtn"), "click", () => { signOut(auth); showSection("landing"); });
on(qs("heroExploreBtn"), "click", () => { if(requireLogin()) showSection("feed"); });
on(qs("priceFilter"), "change", renderFeed);
on(qs("creditsFilter"), "change", renderFeed);
on(qs("gotoCalcLink"), "click", () => showSection("calculator"));

// Calculator
qsa('input[name="calcMethod"]').forEach(r => on(r, "change", () => {
    const v = document.querySelector('input[name="calcMethod"]:checked').value;
    toggle("treeForm", v === "trees"); toggle("landForm", v !== "trees"); hide("calcResult");
}));
on(qs("calcTreesBtn"), "click", () => { show("calcResult"); qs("totalCredits").textContent = ((qs("treeCount").value * qs("treeType").value * qs("treeYears").value)/1000).toFixed(2) + " Tons CO2"; });
on(qs("calcLandBtn"), "click", () => { const factor = qs("landUnit").value === 'hectares' ? 6 : 2.4; show("calcResult"); qs("totalCredits").textContent = (qs("landArea").value * factor * qs("landYears").value).toFixed(2) + " Tons CO2"; });

// ==========================================
// 9. TEMPLATES
// ==========================================
const htmlPost = (p) => {
    const isMine = state.currentUser && p.user === state.currentUser.name;
    const badge = isMine ? `<span class="bg-emerald-500 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded ml-2">CREATED BY YOU</span>` : '';
    // FIXED CHAT BUTTON: ONLY PASS ID
   const chatBtn = `
<button 
  class="chat-btn w-full py-2 bg-slate-800 text-xs rounded border border-slate-600 hover:bg-slate-700 font-semibold"
  data-post-id="${p.id}">
  💬 Chat with Seller
</button>`;


    return `<div class="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-lg flex flex-col hover:border-slate-600 transition-all"><img src="${p.image}" class="w-full h-44 object-cover"><div class="p-3 flex flex-col flex-1"><div class="flex justify-between items-start mb-1"><h3 class="font-bold text-sm truncate flex-1 text-slate-200">${p.title}</h3>${badge}</div><p class="text-[10px] text-slate-500 mb-2">By ${p.user} • ${new Date(p.createdAt).toLocaleDateString()}</p><p class="text-xs text-slate-400 mb-3 truncate">${p.desc}</p><div class="flex justify-between text-[11px] mb-3"><span class="text-emerald-300 bg-emerald-900/30 px-2 py-0.5 rounded-full border border-emerald-500/20">${p.credits} Credits</span><span class="text-white font-bold">₹${p.price}</span></div><div class="mt-auto">${chatBtn}</div></div></div>`;
};
const htmlListRow = (p) => `<div class="bg-slate-900 p-3 border border-slate-700 rounded-lg mb-2 flex justify-between text-xs items-center hover:bg-slate-800 transition-colors"><span>${p.title}</span><button class="text-emerald-400 font-bold underline" onclick="window.editPost('${p.id}')">Edit</button></div>`;
const htmlInboxItem = (c, myId) => {
    const msgs = c.messages || [];
    const last = msgs[msgs.length-1] || { text: 'No messages yet', senderName: '' };
    const unread = msgs.filter(m => m.senderId !== myId && !m.seen).length;
    // Find name that IS NOT mine
    let otherName = "User";
    if(c.participantNames) {
        const otherIndex = c.participantNames.findIndex(n => n !== state.currentUser.name);
        if(otherIndex > -1) otherName = c.participantNames[otherIndex];
    }
    
    return `<div onclick="window.openExistingChat('${c.id}')" class="bg-slate-900 p-3 rounded-lg border border-slate-700 cursor-pointer flex justify-between items-center hover:bg-slate-800 transition-colors"><div><div class="text-sm font-bold text-emerald-100 flex items-center gap-2">${c.postTitle} <span class="text-xs text-slate-400 font-normal">w/ ${otherName}</span> ${unread>0?`<span class="bg-red-500 text-white text-[9px] px-1.5 rounded-full shadow-sm">${unread}</span>`:''}</div><div class="text-xs text-slate-400 truncate max-w-[200px] mt-0.5">${last.senderName}: ${last.text}</div></div><div class="text-xs text-emerald-500 font-bold">Open</div></div>`;
};
const htmlAdminUser = (u) => `<tr class="text-xs border-b border-slate-700"><td class="p-2 text-slate-300">${u.name}</td><td class="p-2 text-slate-400">${u.role}</td><td class="p-2 text-right"><button onclick="window.deleteUser('${u.id}')" class="text-red-400 hover:text-red-300 font-bold">Remove</button></td></tr>`;
const htmlAdminPost = (p) => `<div class="flex justify-between items-center bg-slate-900 p-2 text-xs border border-slate-700 rounded mb-1"><div class="flex flex-col"><span class="font-bold text-slate-200">${p.title}</span><span class="text-[10px] text-slate-400">By ${p.user}</span></div><div class="flex gap-2"><button onclick="window.deletePost('${p.id}')" class="text-red-400 font-bold hover:text-red-300">Delete</button></div></div>`;

const init = () => {
    updateAuthUI();
    startListeners();
    const lastSec = localStorage.getItem(LAST_SECTION_KEY);
    const target = lastSec && qs("section-" + lastSec) ? lastSec : "landing";
    showSection(target);
};

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".chat-btn");
  if (!btn) return;

  const postId = btn.dataset.postId;
  if (!postId) return;

  startChat(postId);
});













