const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Store up to 50 users in memory
const users = [];

// Login / Register API
app.post("/api/login", (req, res) => {
  const { name, role } = req.body;

  if (!name || !role) {
    return res.status(400).json({ message: "Name and role required" });
  }

  // Check if user already exists
  let user = users.find(u => u.name === name);

  if (user) {
    return res.json(user);
  }

  // Limit to 50 users
  if (users.length >= 50) {
    return res.status(400).json({ message: "User limit (50) reached" });
  }

  user = { id: Date.now(), name, role };
  users.push(user);

  console.log("Total Users:", users.length);
  res.json(user);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});


