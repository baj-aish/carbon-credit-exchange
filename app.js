/*********************************
  🔥 Firebase Frontend Setup
*********************************/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, collection, addDoc, getDocs,
  query, where, updateDoc, doc, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getStorage, ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

/*** 🔧 PASTE YOUR FIREBASE CONFIG HERE ***/
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
const storage = getStorage(app);

/*********************************
  🔐 Session
*********************************/
let session = JSON.parse(localStorage.getItem("cc_session")) || null;

signInAnonymously(auth);

/*********************************
  🔁 Helpers
*********************************/
const qs = id => document.getElementById(id);
const show = id => qs(id).classList.remove("hidden");
const hide = id => qs(id).classList.add("hidden");

function setSection(section) {
  document.querySelectorAll("section").forEach(s => s.classList.add("hidden"));
  show(section);
  localStorage.setItem("cc_last", section);
}

/*********************************
  🔐 Auth
*********************************/
async function register() {
  const username = qs("registerUsername").value.trim();
  const role = qs("registerRole").value;

  if (!username) return alert("Username required");

  if (role === "admin" && username !== "Bajaish")
    return alert("Only authorised access allowed, try logging in as user");

  await addDoc(collection(db, "users"), { username, role });
  alert("Registered successfully. Please login.");
  setSection("auth");
}

async function login() {
  const username = qs("loginUsername").value.trim();
  const role = qs("loginRole").value;

  const q = query(collection(db, "users"), where("username", "==", username));
  const snap = await getDocs(q);

  if (snap.empty)
    return alert("No user with such username found, try registering first.");

  const user = snap.docs[0].data();

  if (role === "admin" && username !== "Bajaish")
    return alert("Only authorised access allowed, try logging in as user");

  session = { username, role };
  localStorage.setItem("cc_session", JSON.stringify(session));
  qs("loginBtn").classList.add("hidden");
  qs("logoutBtn").classList.remove("hidden");
  setSection("home");
}

function logout() {
  localStorage.clear();
  location.reload();
}

/*********************************
  🏠 Restore Session
*********************************/
if (session) {
  qs("loginBtn").classList.add("hidden");
  qs("logoutBtn").classList.remove("hidden");
  setSection(localStorage.getItem("cc_last") || "home");
}

/*********************************
  🛒 Marketplace
*********************************/
async function loadMarketplace() {
  const list = qs("marketplaceList");
  list.innerHTML = "";
  const snap = await getDocs(collection(db, "posts"));

  snap.forEach(d => {
    const p = d.data();
    list.innerHTML += `
      <div class="card">
        <img src="${p.image}" width="100%" />
        <h3>${p.title}</h3>
        <p>${p.desc}</p>
        <p>Credits: ${p.credits}</p>
        <p>Price: ₹${p.price}</p>
        <small>By ${p.user}</small>
      </div>
    `;
  });
}

/*********************************
  ✍️ Posts
*********************************/
async function createPost() {
  const file = qs("postImage").files[0];
  if (!file || file.size > 51200)
    return alert("Image size must be below 50 KB");

  const refImg = ref(storage, Date.now() + file.name);
  await uploadBytes(refImg, file);
  const url = await getDownloadURL(refImg);

  await addDoc(collection(db, "posts"), {
    user: session.username,
    title: qs("postTitle").value,
    desc: qs("postDesc").value,
    credits: qs("postCredits").value,
    price: qs("postPrice").value,
    image: url,
    time: Date.now()
  });

  alert("Post created");
  loadMarketplace();
}

/*********************************
  🧮 Calculator
*********************************/
qs("calculate").onclick = () => {
  const m = qs("calcMethod").value;
  let result = 0;

  if (m === "trees") {
    const x = +qs("treeType").value;
    const n = +qs("treeCount").value;
    const t = +qs("treeYears").value;
    result = (n * x * t) / 1000;
  } else {
    let a = +qs("landArea").value;
    if (qs("landUnit").value === "acre") a *= 0.4047;
    const t = +qs("landYears").value;
    result = a * 6 * t;
  }

  qs("calcResult").innerText = `Total Carbon Credits: ${result.toFixed(2)}`;
};

/*********************************
  🔗 UI Events
*********************************/
qs("loginBtn").onclick = () => setSection("auth");
qs("goLogin").onclick = () => setSection("auth");
qs("logoutBtn").onclick = logout;

qs("registerSubmit").onclick = register;
qs("loginSubmit").onclick = login;
qs("createPost").onclick = createPost;

document.querySelectorAll(".nav-btn").forEach(b => {
  b.onclick = () => {
    if (!session && !["home"].includes(b.dataset.section))
      return alert("Please login first");
    setSection(b.dataset.section);
    if (b.dataset.section === "marketplace") loadMarketplace();
  };
});
