const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// very simple in-memory global state
let globalState = { posts: [] };

app.get("/", (req, res) => {
  res.send("Carbon credit backend running");
});

app.get("/api/state", (req, res) => {
  res.json(globalState);
});

app.post("/api/state", (req, res) => {
  const body = req.body || {};
  globalState.posts = Array.isArray(body.posts) ? body.posts : [];
  res.json({ ok: true, count: globalState.posts.length });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Backend listening on", PORT));
