// server.js — Firebase Backend (Clean & Working)

const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();
app.use(cors());
app.use(express.json());

// ---------- Firebase Init ----------
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
  })
});

const db = admin.firestore();

// ---------- Health ----------
app.get("/", (_, res) => res.send("Backend running"));

// ---------- AUTH ----------

// Register
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "Missing fields" });

  try {
    const user = await admin.auth().createUser({
      email,
      password,
      displayName: name
    });

    const role = name.toLowerCase() === "bajaish" ? "admin" : "user";

    await db.collection("users").doc(user.uid).set({
      name,
      email,
      role,
      createdAt: Date.now()
    });

    res.json({ id: user.uid, name, email, role });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Login (simple username check)
app.post("/api/login", async (req, res) => {
  const { name } = req.body;
  const snap = await db.collection("users").where("name", "==", name).limit(1).get();

  if (snap.empty)
    return res.status(404).json({ error: "No user found" });

  const doc = snap.docs[0];
  res.json({ id: doc.id, ...doc.data() });
});

// ---------- POSTS ----------

// Get posts
app.get("/api/posts", async (_, res) => {
  const snap = await db.collection("posts").orderBy("createdAt", "desc").get();
  res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
});

// Create post
app.post("/api/posts", async (req, res) => {
  const post = {
    ...req.body,
    likes: 0,
    comments: [],
    chatMessages: [],
    status: "active",
    createdAt: Date.now()
  };
  const ref = await db.collection("posts").add(post);
  res.json({ id: ref.id, ...post });
});

// Update post (likes / comments / admin)
app.put("/api/posts/:id", async (req, res) => {
  await db.collection("posts").doc(req.params.id).update(req.body);
  res.json({ ok: true });
});

// Chat
app.post("/api/posts/:id/chat", async (req, res) => {
  await db.collection("posts").doc(req.params.id).update({
    chatMessages: admin.firestore.FieldValue.arrayUnion({
      ...req.body,
      time: Date.now(),
      seen: false
    })
  });
  res.json({ ok: true });
});

// ---------- Server ----------
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running on", PORT));
