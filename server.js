const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

let state = { users: [], posts: [] };

app.get("/", (req, res) => {
  res.send("Carbon credit backend running");
});

app.get("/api/state", (req, res) => {
  res.json(state);
});

app.post("/api/state", (req, res) => {
  const body = req.body || {};
  if (Array.isArray(body.users)) state.users = body.users;
  if (Array.isArray(body.posts)) state.posts = body.posts;
  res.json({ ok: true });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Backend listening on", PORT));
