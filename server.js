// server.js (MongoDB, auth, posts, chat)
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());

// ----------------- MongoDB connect -----------------
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("MONGO_URI not set in environment - exiting");
  process.exit(1);
}

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => {
  console.error("MongoDB connection error:", err);
  process.exit(1);
});

// ----------------- Schemas & Models -----------------
const userSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  email: { type: String, default: "" },
  password: { type: String, required: true },
  role: { type: String, default: "user" }
}, { timestamps: true });

const chatMessageSchema = new mongoose.Schema({
  from: String,
  to: String,
  text: String,
  time: Number,
  seen: { type: Boolean, default: false }
}, { _id: false });

const commentSchema = new mongoose.Schema({
  by: String,
  text: String,
  time: Number
}, { _id: false });

const postSchema = new mongoose.Schema({
  title: String,
  desc: String,
  image: String,
  user: String,
  price: { type: Number, default: 0 },
  credits: { type: Number, default: 0 },
  status: { type: String, default: "active" },
  likes: { type: Number, default: 0 },
  likedBy: [String],
  comments: [commentSchema],
  chatMessages: [chatMessageSchema],
  createdAt: { type: Number, default: () => Date.now() }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema);

// ----------------- Health -----------------
app.get("/", (req, res) => {
  res.send("Carbon credit backend (MongoDB) running");
});

// ----------------- Auth -----------------

// Register: expects { name, email, password }
// Returns user object { id, name, email, role }
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !password) {
      return res.status(400).json({ error: "Name and password required" });
    }

    const exists = await User.findOne({ name });
    if (exists) return res.status(400).json({ error: "User already exists" });

    const hash = await bcrypt.hash(password, 10);
    const role = name.toLowerCase() === "bajaish" ? "admin" : "user";

    const user = await User.create({
      name,
      email: email || "",
      password: hash,
      role
    });

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    console.error("register error", err);
    res.status(500).json({ error: "Server error on register" });
  }
});

// Login: expects { name, password, loginRole }
// Returns user object on success
app.post("/api/login", async (req, res) => {
  try {
    const { name, password, loginRole } = req.body || {};
    if (!name || !password) return res.status(400).json({ error: "Missing credentials" });

    const user = await User.findOne({ name });
    if (!user) return res.status(404).json({ error: "User not found" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Incorrect password" });

    if (loginRole === "admin" && user.name.toLowerCase() !== "bajaish") {
      return res.status(403).json({ error: "Only authorised access allowed" });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    console.error("login error", err);
    res.status(500).json({ error: "Server error on login" });
  }
});

// ----------------- Posts CRUD + Chat -----------------

// Get all posts
app.get("/api/posts", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error("GET /api/posts error", err);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// Create post: body = post object
app.post("/api/posts", async (req, res) => {
  try {
    const body = req.body || {};
    body.createdAt = Date.now();
    const post = await Post.create(body);
    res.json(post);
  } catch (err) {
    console.error("POST /api/posts error", err);
    res.status(500).json({ error: "Failed to create post" });
  }
});

// Update post by Mongo _id. Allows updating likes, comments, chatMessages, etc.
app.put("/api/posts/:id", async (req, res) => {
  try {
    const update = req.body || {};
    const post = await Post.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (err) {
    console.error("PUT /api/posts/:id error", err);
    res.status(500).json({ error: "Failed to update post" });
  }
});

// Append a chat message to a post
// POST /api/posts/:id/chat  body: { from, to, text, time }
// Returns updated post
app.post("/api/posts/:id/chat", async (req, res) => {
  try {
    const { from, to, text } = req.body || {};
    if (!from || !text) return res.status(400).json({ error: "Invalid chat message" });
    const msg = { from, to: to || null, text, time: Date.now(), seen: false };

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    post.chatMessages = post.chatMessages || [];
    post.chatMessages.push(msg);
    await post.save();

    res.json(post);
  } catch (err) {
    console.error("POST chat error", err);
    res.status(500).json({ error: "Failed to send chat" });
  }
});

// Mark chat messages in a post as seen for a receiver
// PUT /api/posts/:id/chat/mark-seen  body: { receiver }
app.put("/api/posts/:id/chat/mark-seen", async (req, res) => {
  try {
    const receiver = req.body?.receiver;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    let changed = false;
    post.chatMessages = post.chatMessages || [];
    post.chatMessages.forEach(m => {
      if (!m.seen && (!m.to || (receiver && m.to === receiver))) {
        m.seen = true;
        changed = true;
      }
    });

    if (changed) await post.save();
    res.json(post);
  } catch (err) {
    console.error("mark-seen error", err);
    res.status(500).json({ error: "Failed to mark messages seen" });
  }
});

// ----------------- Server listen -----------------
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
