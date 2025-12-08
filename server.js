const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
let state = { users: [], posts: [] };

function pruneOld() {
  const now = Date.now();
  state.users = state.users.filter(
    u => !u.createdAt || now - u.createdAt <= THIRTY_DAYS
  );
  state.posts = state.posts.filter(
    p => !p.createdAt || now - p.createdAt <= THIRTY_DAYS
  );
}

app.get("/", (req, res) => {
  res.send("Carbon credit backend running");
});

// return global users + posts
app.get("/api/state", (req, res) => {
  pruneOld();
  res.json(state);
});

// overwrite global users + posts
app.post("/api/state", (req, res) => {
  const body = req.body || {};
  if (Array.isArray(body.users)) state.users = body.users;
  if (Array.isArray(body.posts)) state.posts = body.posts;
  pruneOld();
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


