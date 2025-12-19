import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const API = "https://YOUR-RENDER-URL.onrender.com";

window.login = async () => {
  const email = email.value;
  const password = password.value;
  await signInWithEmailAndPassword(auth, email, password);
};

onAuthStateChanged(auth, user => {
  if (user) loadFeed(user.uid);
});

async function loadFeed(uid) {
  const res = await fetch(API + "/posts");
  const posts = await res.json();

  feed.innerHTML = posts.map(p => `
    <div class="border p-2 my-2">
      <h3>${p.title}</h3>
      <img src="${p.image}" class="w-full"/>
      <p>${p.description}</p>
      <button onclick="like('${p.id}','${uid}')">❤️ ${p.likes.length}</button>
    </div>
  `).join("");
}

window.post = async () => {
  await fetch(API + "/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: title.value,
      image: img.value,
      description: desc.value
    })
  });
  location.reload();
};

window.like = async (id, uid) => {
  await fetch(`${API}/posts/${id}/like`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid })
  });
  location.reload();
};
