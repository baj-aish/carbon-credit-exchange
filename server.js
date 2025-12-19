// server.js
const express = require("express");
const path = require("path");
const admin = require("firebase-admin");

const app = express();

// 🔐 Firebase Admin using ENV variables (SAFE)
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
  }),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

// 🔥 Firebase services
const db = admin.firestore();
const bucket = admin.storage().bucket();

// 🌐 Middleware
app.use(express.json());
app.use(express.static(__dirname));

// 🧪 Health check
app.get("/health", (req, res) => {
  res.send("Firebase backend connected successfully");
});

// 🚀 Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 🌍 Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
