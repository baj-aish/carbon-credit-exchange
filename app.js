/* =========================================================
   Carbon Credit Exchange – Firebase app.js
   USERNAME + PASSWORD | SAME UI | FULLY WORKING
   ========================================================= */

/* -------------------- Helpers -------------------- */
const qs = id => document.getElementById(id);
const qsa = sel => [...document.querySelectorAll(sel)];
const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

/* -------------------- Firebase -------------------- */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  increment
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* 🔴 REPLACE WITH YOUR FIREBASE CONFIG */
const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "XXXX",
  appId: "XXXX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* -------------------- State -------------------- */
let state = {
  user: null,
  profile: null,
  posts: []
};

/* -------------------- Session UI -------------------- */
const updateAuthUI = () => {
  const u = state.profile;

  qs("loginBtn")?.classList.toggle("hidden", !!u);
  qs("logoutBtn")?.classList.toggle("hidden", !u);
  qs("userBadge")?.classList.toggle("hidden", !u);

  qsa(".protected-nav").forEach(b =>
    b.classList.toggle("hidden", !u)
  );

  qs("adminTab")?.classList.toggle(
    "hidden",
    !(u && u.role === "admin")
  );

  if (u) {
    qs("badgeName").textContent = u.name;
    qs("badgeRole").textContent = u.role;
  }
};

/* -------------------- Navigation -------------------- */
const showSection = name => {
  qsa(".section").forEach(s => s.classList.add("hidden"));
  qs("section-" + name)?.classList.remove("hidden");
};

/* -------------------- Auth Logic -------------------- */
const usernameToEmail = name => `${name}@ccx.local`;

/* REGISTER */
on(document, "DOMContentLoaded", () => {

  on(qs("registerForm"), "submit", async e => {
    e.preventDefault();

    const name = qs("regName").value.trim();
    const pass = qs("regPass").value.trim();
    const role = qs("regRole").value;

    if (role === "admin" && name !== "Bajaish") {
      alert("Only authorised admin allowed");
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        usernameToEmail(name),
        pass
      );

      await addDoc(collection(db, "users"), {
        uid: cred.user.uid,
        name,
        role,
        createdAt: serverTimestamp()
      });

      alert("Registered successfully. Please login.");
      qs("tabLogin").click();
    } catch (err) {
      alert(err.message);
    }
  });

  /* LOGIN */
  on(qs("loginForm"), "submit", async e => {
    e.preventDefault();

    const name = qs("loginName").value.trim();
    const pass = qs("loginPass").value.trim();
    const role = qs("loginRole").value;

    if (role === "admin" && name !== "Bajaish") {
      alert("Only authorised admin allowed");
      return;
    }

    try {
      await signInWithEmailAndPassword(
        auth,
        usernameToEmail(name),
        pass
      );
    } catch {
      alert("Invalid credentials");
    }
  });

  /* LOGOUT */
  on(qs("logoutBtn"), "click", async () => {
    await signOut(auth);
    showSection("landing");
  });

});

/* -------------------- Auth Observer -------------------- */
onAuthStateChanged(auth, async user => {
  if (!user) {
    state.user = null;
    state.profile = null;
    updateAuthUI();
    return;
  }

  state.user = user;

  const snap = await getDocs(
    query(collection(db, "users"), where("uid", "==", user.uid))
  );

  state.profile = snap.docs[0].data();
  updateAuthUI();
  showSection("feed");
  listenPosts();
});

/* -------------------- Posts (Realtime) -------------------- */
const listenPosts = () => {
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

  onSnapshot(q, snap => {
    state.posts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderFeed();
    renderInbox();
    renderAdmin();
    renderUserListings();
  });
};

/* -------------------- Feed -------------------- */
const renderFeed = () => {
  const box = qs("feedContainer");
  if (!box) return;

  box.innerHTML = state.posts
    .filter(p => p.status !== "removed")
    .map(p => `
    <article class="bg-slate-900 rounded-xl p-3 border border-slate-700">
      <img src="${p.image}" class="w-full h-40 object-cover mb-2"/>
      <h3 class="font-semibold">${p.title}</h3>
      <p class="text-xs">${p.desc}</p>
      <div class="flex justify-between text-xs mt-2">
        <span>${p.credits} credits</span>
        <span>₹${p.price}</span>
      </div>
      <div class="flex gap-2 mt-2">
        <button data-like="${p.id}">❤️ ${p.likes || 0}</button>
        <button data-chat="${p.id}">💬 Chat</button>
      </div>
    </article>
  `).join("");
};

/* -------------------- Likes -------------------- */
on(document, "click", async e => {
  const id = e.target.dataset.like;
  if (!id || !state.profile) return;

  const post = state.posts.find(p => p.id === id);
  const ref = doc(db, "posts", id);
  const me = state.profile.name;

  if ((post.likedBy || []).includes(me)) {
    await updateDoc(ref, {
      likes: increment(-1),
      likedBy: arrayRemove(me)
    });
  } else {
    await updateDoc(ref, {
      likes: increment(1),
      likedBy: arrayUnion(me)
    });
  }
});

/* -------------------- Inbox -------------------- */
const renderInbox = () => {
  const box = qs("inboxList");
  if (!box || !state.profile) return;

  const me = state.profile.name;
  let msgs = [];

  state.posts.forEach(p => {
    (p.chats || []).forEach(m => {
      if (m.to === me) msgs.push(m);
    });
  });

  box.innerHTML = msgs.length
    ? msgs.map(m => `<p>${m.from}: ${m.text}</p>`).join("")
    : "<p>No messages</p>";
};

/* -------------------- Admin -------------------- */
const renderAdmin = () => {
  if (state.profile?.role !== "admin") return;

  qs("adminList").innerHTML = state.posts.map(p => `
    <div class="flex justify-between border p-2">
      <span>${p.title}</span>
      <button data-toggle="${p.id}">
        ${p.status === "removed" ? "Restore" : "Remove"}
      </button>
    </div>
  `).join("");
};

on(document, "click", async e => {
  const id = e.target.dataset.toggle;
  if (!id) return;

  const post = state.posts.find(p => p.id === id);
  await updateDoc(doc(db, "posts", id), {
    status: post.status === "removed" ? "active" : "removed"
  });
});

/* -------------------- Calculator -------------------- */
on(qs("calcTreesBtn"), "click", () => {
  const x = +qs("treeType").value;
  const n = +qs("treeCount").value;
  const t = +qs("treeYears").value;

  const annual = (n * x) / 1000;
  qs("annualCredits").textContent = annual.toFixed(2);
  qs("totalCredits").textContent = (annual * t).toFixed(2);
  qs("calcResult").classList.remove("hidden");
});
