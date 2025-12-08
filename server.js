const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// ================================
// GLOBAL IN-MEMORY STATE
// ================================
let state = {
  users: [],
  posts: []
};

// ================================
// ROOT CHECK
// ================================
app.get("/", (req, res) => {
  res.send("Carbon credit backend running");
});

// ================================
// GET FULL STATE
// ================================
app.get("/api/state", (req, res) => {
  res.json(state);
});

// ================================
// UPDATE FULL STATE
// (Used by frontend for sync)
// ================================
app.post("/api/state", (req, res) => {
  const body = req.body || {};

  if (Array.isArray(body.users)) {
    state.users = body.users;
  }

  if (Array.isArray(body.posts)) {
    state.posts = body.posts;
  }

  res.json({
    ok: true,
    users: state.users.length,
    posts: state.posts.length
  });
});

// ================================
// SERVER START
// ================================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Backend listening on", PORT);
});
