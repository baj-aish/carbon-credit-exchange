const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// global in-memory store for all users + posts + chats
let state = { users: [], posts: [] };

app.get("/", (req, res) => {
  res.send("Carbon credit backend running");
});

// anyone can read global state
app.get("/api/state", (req, res) => {
  res.json(state);
});

// frontend overwrites users + posts
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

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Backend listening on", PORT);
});
