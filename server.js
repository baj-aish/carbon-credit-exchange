// server.js – minimal global backend (Render)
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// Global in-memory state shared by all users
let state = { users: [], posts: [] };

app.get("/", (_req, res) => {
  res.send("Carbon credit backend running");
});

app.get("/api/state", (_req, res) => {
  res.json(state);
});

app.post("/api/state", (req, res) => {
  const { users, posts } = req.body || {};
  if (Array.isArray(users)) state.users = users;
  if (Array.isArray(posts)) state.posts = posts;
  res.json({ ok: true, users: state.users.length, posts: state.posts.length });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Backend listening on", PORT));
