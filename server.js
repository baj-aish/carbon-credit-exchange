import express from "express";
import cors from "cors";
import { db, auth } from "./firebase.js";

const app = express();
app.use(cors());
app.use(express.json());

/* ================= AUTH ================= */

app.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const user = await auth.createUser({ email, password });

    await db.collection("users").doc(user.uid).set({
      name,
      email,
      role: "user",
      createdAt: Date.now()
    });

    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post("/login", async (req, res) => {
  res.json({ message: "Handled by Firebase client SDK" });
});

/* ================= POSTS ================= */

app.post("/posts", async (req, res) => {
  const post = req.body;
  await db.collection("posts").add({
    ...post,
    likes: [],
    comments: [],
    createdAt: Date.now()
  });
  res.json({ success: true });
});

app.get("/posts", async (_, res) => {
  const snap = await db.collection("posts").orderBy("createdAt", "desc").get();
  res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
});

app.post("/posts/:id/like", async (req, res) => {
  const { uid } = req.body;
  const ref = db.collection("posts").doc(req.params.id);

  await ref.update({
    likes: admin.firestore.FieldValue.arrayUnion(uid)
  });

  res.json({ success: true });
});

app.post("/posts/:id/comment", async (req, res) => {
  const { uid, text } = req.body;
  const ref = db.collection("posts").doc(req.params.id);

  await ref.update({
    comments: admin.firestore.FieldValue.arrayUnion({
      uid,
      text,
      at: Date.now()
    })
  });

  res.json({ success: true });
});

/* ================= CALCULATOR ================= */

app.post("/calculate", (req, res) => {
  const { mode, trees, type, area, unit, years } = req.body;

  let total = 0;

  if (mode === "trees") {
    const rates = { small: 3.5, medium: 12.5, fast: 22.5 };
    total = (trees * rates[type] * years) / 1000;
  } else {
    let hectares = unit === "acre" ? area * 0.4047 : area;
    total = hectares * 6 * years;
  }

  res.json({ credits: total });
});

/* ================= ADMIN ================= */

app.get("/admin/users", async (_, res) => {
  const snap = await db.collection("users").get();
  res.json(snap.docs.map(d => d.data()));
});

/* ================= START ================= */

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on", PORT));
