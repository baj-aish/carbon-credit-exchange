// server.js
// Minimal Firebase-connected backend for Render

const express = require("express");
const path = require("path");
const admin = require("firebase-admin");

// 🔑 Firebase Admin Initialization
const serviceAccount = require("./firebaseKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "YOUR_PROJECT_ID.appspot.com"
});

// 🔥 Firestore & Storage references
const db = admin.firestore();
const bucket = admin.storage().bucket();

// 🌐 Express app
const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// 🧪 Health check (for Render)
app.get("/health", (req, res) => {
  res.send("Firebase backend is running");
});

// 🚀 Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 🌍 Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log("Server running on port", PORT)
);
