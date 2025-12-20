// server.js — Firebase Backend (NO MongoDB)

const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();
app.use(cors());
app.use(express.json());

// ---------------- FIREBASE INIT ----------------
if (!process.env.FIREBASE_PROJECT_ID) {
  console.error("Firebase env vars missing");
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
  })
});

const db = admin.firestore();

// ---------------- HEALTH CHECK ----------------
app.get("/", (req, res) => {
  res.send("Firebase backend running");
});

// ---------------- AUTH ----------------

// REGISTER
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

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

    res.json({
      id: user.uid,
      name,
      email,
      role
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// LOGIN
app.post("/api/login", async (req, res) => {
  try {
    const { name, password } = req.body;

    const users = await db
      .collection("users")
      .where("name", "==", name)
      .limit(1)
      .get();

    if (users.empty) {
      return res.status(404).json({ error: "User not found" });
    }

    const userDoc = users.docs[0];
    const user = userDoc.data();

    // Password validation is done client-side by Firebase Auth
    res.json({
      id: userDoc.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

// ---------------- POSTS ----------------

// GET POSTS
app.get("/api/posts", async (req, res) => {
  const snap = await db.collection("posts").orderBy("createdAt", "desc").get();
  res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
});

// CREATE POST
app.post("/api/posts", async (req, res) => {
  const post = {
    ...req.body,
    createdAt: Date.now(),
    chatMessages: [],
    comments: []
  };
  const ref = await db.collection("posts").add(post);
  res.json({ id: ref.id, ...post });
});

// UPDATE POST
app.put("/api/posts/:id", async (req, res) => {
  await db.collection("posts").doc(req.params.id).update(req.body);
  const doc = await db.collection("posts").doc(req.params.id).get();
  res.json({ id: doc.id, ...doc.data() });
});

// SEND CHAT
app.post("/api/posts/:id/chat", async (req, res) => {
  const ref = db.collection("posts").doc(req.params.id);
  await ref.update({
    chatMessages: admin.firestore.FieldValue.arrayUnion({
      ...req.body,
      time: Date.now(),
      seen: false
    })
  });
  const doc = await ref.get();
  res.json({ id: doc.id, ...doc.data() });
});

// ---------------- SERVER ----------------
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Firebase server running on", PORT);
});

