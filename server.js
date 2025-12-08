// =======================
// Carbon Credit Backend
// =======================

const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// In-memory DB (persist until Render restarts)
let state = {
  users: [],
  posts: []
};

// Health check
app.get("/", (req, res) => {
  res.send("Carbon credit backend running");
});

// Read entire state
app.get("/api/state", (req, res) => {
  res.json(state);
});

// Write entire state (frontend sync)
app.post("/api/state", (req, res) => {
  const body = req.body || {};

  if (Array.isArray(body.users)) state.users = body.users;
  if (Array.isArray(body.posts)) state.posts = body.posts;

  res.json({
    ok: true,
    users: state.users.length,
    posts: state.posts.length
  });
});

// Server start
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Backend running on", PORT);
});
