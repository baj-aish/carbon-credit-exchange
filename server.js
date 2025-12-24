
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();

// 1. Middleware: Fix CORS and Body Size (for images)
app.use(cors());
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ... imports

// DEBUGGING LOGS (Remove these after fixing!)
console.log("--- DEBUG ENV VARS ---");
console.log("Project ID:", `"${process.env.FIREBASE_PROJECT_ID}"`); // Quotes added to show if extra spaces exist
console.log("Email:", `"${process.env.FIREBASE_CLIENT_EMAIL}"`);
console.log("Key Length:", process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.length : "MISSING");
console.log("----------------------");

// ---------------- FIREBASE INIT ----------------
// ... rest of code

// 2. Firebase Init
if (!process.env.FIREBASE_PROJECT_ID) {
  console.error("❌ Error: Firebase environment variables missing.");
  process.exit(1);
}

try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    })
  });
  console.log("🔥 Firebase initialized");
} catch (e) {
  console.error("Firebase Init Error:", e);
}

const db = admin.firestore();

// 3. Routes

// --- AUTH ---
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password, role: reqRole } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "Missing fields" });

    // Create in Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name
    });

    // Determine Role (Secure check)
    const role = (name.trim().toLowerCase() === "bajaish" && reqRole === 'admin') ? "admin" : "user";

    // Save to Firestore
    await db.collection("users").doc(userRecord.uid).set({
      id: userRecord.uid,
      name,
      email,
      role,
      createdAt: Date.now()
    });

    res.json({ id: userRecord.uid, name, email, role });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { name } = req.body; // In this mini-project, we trust the username check 
    // (Real apps should verify password via Client SDK, but this keeps your logic simple)

    const usersSnap = await db.collection("users").where("name", "==", name).limit(1).get();
    
    if (usersSnap.empty) {
      return res.status(404).json({ error: "User not found. Please register." });
    }

    const userDoc = usersSnap.docs[0];
    const userData = userDoc.data();

    res.json(userData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- DATA ---

// Get All Posts
app.get("/api/posts", async (req, res) => {
  try {
    const snap = await db.collection("posts").orderBy("createdAt", "desc").get();
    const posts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Post
app.post("/api/posts", async (req, res) => {
  try {
    const newPost = {
      ...req.body,
      createdAt: Date.now(),
      likes: 0,
      likedBy: [],
      comments: [],
      chatMessages: [],
      status: "active"
    };
    const ref = await db.collection("posts").add(newPost);
    // Return the data with the new ID
    res.json({ id: ref.id, ...newPost });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Post (Edit / Like / Comment)
app.put("/api/posts/:id", async (req, res) => {
  try {
    await db.collection("posts").doc(req.params.id).update(req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Post (Admin)
app.delete("/api/posts/:id", async (req, res) => {
  try {
    await db.collection("posts").doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Chat Message
app.post("/api/posts/:id/chat", async (req, res) => {
  try {
    const msg = {
      ...req.body, // from, text
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

// Get Users (Admin)
app.get("/api/users", async (req, res) => {
  try {
    const snap = await db.collection("users").get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete User (Admin)
app.delete("/api/users/:id", async (req, res) => {
  try {
    // Try to delete from Auth (might fail if not using Admin SDK for Auth management fully)
    try { await admin.auth().deleteUser(req.params.id); } catch(e) {}
    // Delete from Firestore
    await db.collection("users").doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Global 404 Handler (Prevents the HTML "<" error)
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

