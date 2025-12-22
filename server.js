const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const bcrypt = require("bcryptjs");

const app = express();

/* ---------- Middleware ---------- */
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

/* ---------- Firebase Init ---------- */
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
  })
});

const db = admin.firestore();

/* =========================================================
   AUTH ROUTES (FIXED & SECURE)
   ========================================================= */

/* ---------- REGISTER ---------- */
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !password)
      return res.status(400).json({ error: "Missing fields" });

    // Check if user exists
    const existing = await db
      .collection("users")
      .where("name", "==", name)
      .limit(1)
      .get();

    if (!existing.empty)
      return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const userRef = await db.collection("users").add({
      name,
      email: email || "",
      password: hashedPassword,
      role: role === "admin" && name === "bajaish" ? "admin" : "user",
      createdAt: Date.now()
    });

    res.json({
      id: userRef.id,
      name,
      role: role === "admin" && name === "bajaish" ? "admin" : "user"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------- LOGIN ---------- */
app.post("/api/login", async (req, res) => {
  try {
    const { name, password } = req.body;

    const snap = await db
      .collection("users")
      .where("name", "==", name)
      .limit(1)
      .get();

    if (snap.empty)
      return res.status(404).json({ error: "User not found" });

    const doc = snap.docs[0];
    const user = doc.data();

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ error: "Invalid password" });

    // Send safe user object (NO password)
    res.json({
      id: doc.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================================================
   POSTS
   ========================================================= */

app.get("/api/posts", async (_, res) => {
  try {
    const snap = await db.collection("posts").orderBy("createdAt", "desc").get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/posts", async (req, res) => {
  try {
    const post = {
      ...req.body,
      createdAt: Date.now(),
      chatMessages: [],
      status: "active"
    };
    const ref = await db.collection("posts").add(post);
    res.json({ id: ref.id, ...post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/posts/:id", async (req, res) => {
  try {
    await db.collection("posts").doc(req.params.id).update(req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/posts/:id", async (req, res) => {
  try {
    await db.collection("posts").doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================================================
   CHAT
   ========================================================= */

app.post("/api/posts/:id/chat", async (req, res) => {
  try {
    const msg = {
      from: req.body.from,
      text: req.body.text,
      time: Date.now(),
      seen: false
    };

    await db.collection("posts").doc(req.params.id).update({
      chatMessages: admin.firestore.FieldValue.arrayUnion(msg)
    });

    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================================================
   ADMIN
   ========================================================= */

app.get("/api/users", async (_, res) => {
  try {
    const snap = await db.collection("users").get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data(), password: undefined })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    await db.collection("users").doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------- 404 ---------- */
app.use((_, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

/* ---------- START ---------- */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("✅ Server running on port", PORT));
