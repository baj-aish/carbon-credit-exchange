// server.js
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors()); // you can restrict origin later if needed
app.use(express.json({ limit: "300kb" }));

const PORT = process.env.PORT || 10000;
const DATA_FILE = path.join(__dirname, "data.json");

// ---------- Simple persistent state (fixes 1, 6, 7, 20) ----------
function loadState() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed.users || !parsed.posts) throw new Error("Bad file");
    return parsed;
  } catch {
    return { users: [], posts: [] };
  }
}

function saveState() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to save state:", err);
  }
}

let state = loadState();

const newId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const findPost = (id) => state.posts.find((p) => p.id === id);

// ---------- Basic ----------
app.get("/", (_req, res) => {
  res.send("Carbon credit backend running");
});

// Clients read full state (but do NOT overwrite it anymore) – fixes 2
app.get("/api/state", (_req, res) => {
  res.json(state);
});

// ---------- Auth: register + login (fixes 2, 6, 20) ----------
app.post("/api/register", (req, res) => {
  const { name, email, role } = req.body || {};
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  const trimmedName = String(name).trim();
  const trimmedEmail = String(email).trim();
  const lowerName = trimmedName.toLowerCase();

  if (!trimmedEmail.toLowerCase().endsWith("@gmail.com")) {
    return res.status(400).json({ error: "Only Gmail addresses are allowed" });
  }

  if (state.users.some((u) => u.name.toLowerCase() === lowerName)) {
    return res.status(400).json({ error: "Username already exists" });
  }

  const finalRole =
    lowerName === "bajaish" && role === "admin" ? "admin" : "user";

  const user = {
    id: newId(),
    name: trimmedName,
    email: trimmedEmail,
    role: finalRole,
    createdAt: Date.now(),
  };

  state.users.push(user);
  saveState();
  res.json(user);
});

app.post("/api/login", (req, res) => {
  const { name, loginRole } = req.body || {};
  if (!name) return res.status(400).json({ error: "Name is required" });

  const trimmedName = String(name).trim();
  const lowerName = trimmedName.toLowerCase();

  const user = state.users.find((u) => u.name.toLowerCase() === lowerName);
  if (!user) {
    return res
      .status(404)
      .json({ error: "User not found. Please register first." });
  }

  if (loginRole === "admin") {
    if (lowerName !== "bajaish" || user.role !== "admin") {
      return res.status(403).json({
        error:
          "Only authorised access allowed, try logging in using User instead.",
      });
    }
  }

  res.json(user);
});

// ---------- Posts CRUD + interactions (fixes 2, 10, 11, 12, 18) ----------
app.post("/api/posts", (req, res) => {
  const {
    id,
    title,
    description,
    image,
    price,
    credits,
    userName,
    status,
  } = req.body || {};

  if (!title || !userName) {
    return res.status(400).json({ error: "Title and userName are required" });
  }

  const owner = state.users.find(
    (u) => u.name.toLowerCase() === String(userName).toLowerCase()
  );
  if (!owner) {
    return res.status(400).json({ error: "Owner user does not exist" });
  }

  if (id) {
    const existing = findPost(id);
    if (!existing) {
      return res.status(404).json({ error: "Post not found" });
    }
    existing.title = title;
    existing.description = description || "";
    existing.image = image || null;
    existing.price = price ?? existing.price;
    existing.credits = credits ?? existing.credits;
    existing.status = status || existing.status;
    existing.updatedAt = Date.now();
    saveState();
    return res.json(existing);
  } else {
    const post = {
      id: newId(),
      title,
      description: description || "",
      image: image || null,
      price: price ?? null,
      credits: credits ?? null,
      user: owner.name,
      status: "active",
      likes: 0,
      likedBy: [],
      comments: [],
      chatMessages: [],
      createdAt: Date.now(),
    };
    state.posts.push(post);
    saveState();
    return res.json(post);
  }
});

app.post("/api/posts/:id/like", (req, res) => {
  const { userName } = req.body || {};
  const post = findPost(req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  if (!userName) return res.status(400).json({ error: "userName required" });

  const lower = userName.toLowerCase();
  const idx = post.likedBy.findIndex((n) => n.toLowerCase() === lower);
  if (idx >= 0) {
    post.likedBy.splice(idx, 1);
  } else {
    post.likedBy.push(userName);
  }
  post.likes = post.likedBy.length;
  post.updatedAt = Date.now();
  saveState();
  res.json(post);
});

app.post("/api/posts/:id/comment", (req, res) => {
  const { userName, text } = req.body || {};
  const post = findPost(req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  if (!userName || !text)
    return res.status(400).json({ error: "userName and text required" });

  post.comments.push({
    id: newId(),
    user: userName,
    text,
    createdAt: Date.now(),
  });
  post.updatedAt = Date.now();
  saveState();
  res.json(post);
});

app.post("/api/posts/:id/chat", (req, res) => {
  const { from, to, text } = req.body || {};
  const post = findPost(req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  if (!from || !to || !text)
    return res.status(400).json({ error: "from, to and text required" });

  const msg = {
    id: newId(),
    from,
    to,
    text,
    createdAt: Date.now(),
    seen: false,
  };
  post.chatMessages.push(msg);
  post.updatedAt = Date.now();
  saveState();
  res.json(post);
});

// mark all messages TO userName in this post as seen (fixes 10, 11)
app.post("/api/posts/:id/seen", (req, res) => {
  const { userName } = req.body || {};
  const post = findPost(req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  if (!userName)
    return res.status(400).json({ error: "userName is required" });

  const lower = userName.toLowerCase();
  post.chatMessages.forEach((m) => {
    if (m.to.toLowerCase() === lower) m.seen = true;
  });
  post.updatedAt = Date.now();
  saveState();
  res.json(post);
});

// ---------- Admin operations ----------
app.post("/api/admin/posts/:id/status", (req, res) => {
  const { status } = req.body || {};
  const post = findPost(req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  post.status = status || post.status;
  post.updatedAt = Date.now();
  saveState();
  res.json(post);
});

app.delete("/api/admin/users/:id", (req, res) => {
  const idx = state.users.findIndex((u) => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "User not found" });

  const removed = state.users[idx];
  state.users.splice(idx, 1);
  // also remove their posts
  state.posts = state.posts.filter((p) => p.user !== removed.name);
  saveState();
  res.json({ ok: true });
});

// ---------- Start ----------
app.listen(PORT, () => {
  console.log("Server listening on port", PORT);
});
