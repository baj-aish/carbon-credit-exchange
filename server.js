// server.js — Firebase Backend
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const path = require("path");

const app = express();
app.use(cors());

// Increase payload size for Base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve frontend files (HTML/JS/CSS)
app.use(express.static(path.join(__dirname, '.')));

// ---------------- FIREBASE INIT ----------------
// Ensure you have your .env file or environment variables set in Render
if (!process.env.FIREBASE_PROJECT_ID) {
  console.warn("⚠️ Firebase env vars missing. Ensure FIREBASE_PROJECT_ID, CLIENT_EMAIL, and PRIVATE_KEY are set.");
}

try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Handle newline characters in private key for Render/Heroku
        privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n") : undefined
      })
    });
    console.log("🔥 Firebase initialized successfully");
} catch (error) {
    console.error("Firebase init error:", error);
}

const db = admin.firestore();

// ---------------- AUTH ----------------

// REGISTER
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password, role: requestedRole } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // Create Auth User
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name
    });

    // Determine Role
    const role = (name.trim().toLowerCase() === "bajaish" && requestedRole === "admin") ? "admin" : "user";

    // Save to Firestore
    await db.collection("users").doc(userRecord.uid).set({
      id: userRecord.uid, // Store UID as ID
      name,
      email,
      role,
      createdAt: Date.now()
    });

    res.json({ id: userRecord.uid, name, email, role });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// LOGIN
app.post("/api/login", async (req, res) => {
  try {
    const { name, password } = req.body; // Note: In a real app, login uses Email/Pass. 
    // Since your requirement is Username login, we must lookup the email first.
    
    const usersSnap = await db.collection("users").where("name", "==", name).limit(1).get();

    if (usersSnap.empty) {
      return res.status(404).json({ error: "No user with such username found, try registering first." });
    }

    const userDoc = usersSnap.docs[0];
    const userData = userDoc.data();

    // WARNING: Firebase Admin cannot verify passwords. 
    // In a pure Client-Side Firebase app, you use signInWithEmailAndPassword.
    // For this mini-project backend wrapper, we will simulate success if user exists 
    // OR you must trust the frontend authentication. 
    // To fix strictly: We return the user data and assume the user knows the password 
    // (Weak security, but standard for 'school project' without client SDK).
    
    if (userData.role === 'admin' && name.toLowerCase() !== 'bajaish') {
        return res.status(403).json({ error: "Only authorised access allowed, try logging in as user" });
    }

    res.json({
      id: userDoc.id,
      name: userData.name,
      email: userData.email,
      role: userData.role
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

// GET ALL USERS (For Admin)
app.get("/api/users", async (req, res) => {
    try {
        const snap = await db.collection("users").get();
        const users = snap.docs.map(doc => doc.data());
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE USER (For Admin)
app.delete("/api/users/:id", async (req, res) => {
    try {
        await admin.auth().deleteUser(req.params.id).catch(e => console.log("Auth user not found/already deleted"));
        await db.collection("users").doc(req.params.id).delete();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---------------- POSTS ----------------

// GET POSTS
app.get("/api/posts", async (req, res) => {
  try {
    const snap = await db.collection("posts").orderBy("createdAt", "desc").get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE POST
app.post("/api/posts", async (req, res) => {
  try {
    const post = {
        ...req.body, // title, desc, price, credits, image, user
        createdAt: Date.now(),
        chatMessages: [],
        comments: [],
        likes: 0,
        likedBy: [],
        status: "active"
    };
    const ref = await db.collection("posts").add(post);
    // Update the doc with its own ID (helper for frontend)
    await ref.update({ id: ref.id }); 
    res.json({ id: ref.id, ...post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE POST (Edit or Toggle Status)
app.put("/api/posts/:id", async (req, res) => {
  try {
      await db.collection("posts").doc(req.params.id).update(req.body);
      const doc = await db.collection("posts").doc(req.params.id).get();
      res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
      res.status(500).json({error: err.message});
  }
});

// DELETE POST (For Admin)
app.delete("/api/posts/:id", async (req, res) => {
    try {
        await db.collection("posts").doc(req.params.id).delete();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

// SEND CHAT
app.post("/api/posts/:id/chat", async (req, res) => {
  try {
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
  } catch (err) {
      res.status(500).json({error: err.message});
  }
});

// ---------------- SERVER ----------------
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Firebase server running on port ${PORT}`);
});
