// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const { Sequelize, DataTypes, Op } = require('sequelize');

const app = express();
app.use(helmet());
app.use(cors());
app.use(bodyParser.json({ limit: '2mb' })); // allow base64 images up to limit
app.use(bodyParser.urlencoded({ extended: true }));

// ---------- DB connection (MySQL via Sequelize) ----------
const {
  MYSQL_HOST,
  MYSQL_PORT,
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_DATABASE
} = process.env;

if (!MYSQL_HOST || !MYSQL_USER || !MYSQL_DATABASE) {
  console.error("Missing MySQL config in environment variables (MYSQL_HOST/MYSQL_USER/MYSQL_DATABASE).");
  // continue so Render shows the error; in dev you can still run but DB connection will fail
}

const sequelize = new Sequelize(MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD, {
  host: MYSQL_HOST || 'localhost',
  port: MYSQL_PORT ? Number(MYSQL_PORT) : 3306,
  dialect: 'mysql',
  logging: false, // set true for debugging
  dialectOptions: {
    // add options if your provider needs SSL, etc.
  },
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 }
});

// ---------- Models ----------
const User = sequelize.define('User', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, defaultValue: 'user' },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'users'
});

const Post = sequelize.define('Post', {
  title: { type: DataTypes.TEXT },
  desc: { type: DataTypes.TEXT },
  image: { type: DataTypes.TEXT('long') }, // base64 data URL OK here (limit uploads on client)
  price: { type: DataTypes.DECIMAL(18, 6), defaultValue: 0 },
  credits: { type: DataTypes.DECIMAL(18, 6), defaultValue: 0 },
  likes: { type: DataTypes.INTEGER, defaultValue: 0 },
  likedBy: { type: DataTypes.TEXT }, // store JSON stringified array, e.g. '["userid1","userid2"]'
  comments: { type: DataTypes.TEXT }, // JSON stringified array of {userId, text, createdAt}
  status: { type: DataTypes.STRING, defaultValue: 'active' },
  chatMeta: { type: DataTypes.TEXT }, // optional metadata
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'posts'
});

const ChatMessage = sequelize.define('ChatMessage', {
  postId: { type: DataTypes.INTEGER, allowNull: false },
  fromUserId: { type: DataTypes.INTEGER },
  text: { type: DataTypes.TEXT },
  seenBy: { type: DataTypes.TEXT }, // JSON array of userIds who have seen it
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'chat_messages', updatedAt: false });

/* Associations */
User.hasMany(Post, { foreignKey: 'userId', onDelete: 'CASCADE' });
Post.belongsTo(User, { foreignKey: 'userId' });

Post.hasMany(ChatMessage, { foreignKey: 'postId', onDelete: 'CASCADE' });
ChatMessage.belongsTo(Post, { foreignKey: 'postId' });

// ---------- Initialize DB ----------
async function initDb() {
  try {
    await sequelize.authenticate();
    console.log('Connected to MySQL via Sequelize.');

    // sync: create tables if they don't exist (safe for fresh DB)
    await sequelize.sync({ alter: true });
    console.log('Database synced (tables created or updated).');
  } catch (err) {
    console.error('Unable to connect / sync database:', err);
    process.exit(1);
  }
}
initDb();

// ---------- Helper functions ----------
const safeParseJSON = (v, fallback) => {
  if (!v) return fallback;
  try { return JSON.parse(v); } catch (e) { return fallback; }
};

const safeStringify = (v) => {
  try { return JSON.stringify(v || []); } catch (e) { return '[]'; }
};

// ---------- API routes ----------

// GET all posts (with user info and chat counts)
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.findAll({
      order: [['createdAt', 'DESC']],
      include: [{ model: User, attributes: ['id', 'name', 'email', 'role'] }]
    });

    // include chat messages for each post
    const result = await Promise.all(posts.map(async p => {
      const chats = await ChatMessage.findAll({ where: { postId: p.id }, order: [['createdAt', 'ASC']] });
      return {
        _id: String(p.id),
        id: String(p.id),
        title: p.title,
        desc: p.desc,
        image: p.image,
        price: p.price,
        credits: p.credits,
        likes: p.likes,
        likedBy: safeParseJSON(p.likedBy, []),
        comments: safeParseJSON(p.comments, []),
        status: p.status,
        user: p.User ? { id: p.User.id, name: p.User.name, email: p.User.email, role: p.User.role } : null,
        chatMessages: chats.map(c => ({
          id: c.id,
          fromUserId: c.fromUserId,
          text: c.text,
          seenBy: safeParseJSON(c.seenBy, []),
          createdAt: c.createdAt
        })),
        createdAt: p.createdAt,
        updatedAt: p.updatedAt
      };
    }));

    res.json(result);
  } catch (err) {
    console.error('GET /api/posts error', err);
    res.status(500).json({ error: 'server error' });
  }
});

// GET users (simple list) - helpful for frontend
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.findAll({ attributes: ['id', 'name', 'email', 'role', 'createdAt'] });
    res.json(users);
  } catch (err) {
    console.error('GET /api/users error', err);
    res.status(500).json({ error: 'server error' });
  }
});

// Create a new post
app.post('/api/posts', async (req, res) => {
  try {
    const {
      title, desc, image, price = 0, credits = 0, userId
    } = req.body;

    if (!userId) return res.status(400).json({ error: 'userId required' });

    const post = await Post.create({
      title, desc, image, price, credits, userId: Number(userId),
      likedBy: safeStringify([]), comments: safeStringify([])
    });

    res.json({ success: true, post: { id: post.id, _id: String(post.id) } });
  } catch (err) {
    console.error('POST /api/posts error', err);
    res.status(500).json({ error: 'server error' });
  }
});

// Update a post
app.put('/api/posts/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const update = { ...req.body };
    // Prevent accidental typed arrays — store JSON fields as strings
    if (update.likedBy) update.likedBy = safeStringify(update.likedBy);
    if (update.comments) update.comments = safeStringify(update.comments);

    const [count] = await Post.update(update, { where: { id } });
    if (!count) return res.status(404).json({ error: 'post not found' });

    const updated = await Post.findByPk(id);
    res.json({ success: true, post: updated });
  } catch (err) {
    console.error('PUT /api/posts/:id error', err);
    res.status(500).json({ error: 'server error' });
  }
});

// Append chat message to a post
app.post('/api/posts/:id/chat', async (req, res) => {
  try {
    const postId = Number(req.params.id);
    const { fromUserId, text } = req.body;
    if (!text) return res.status(400).json({ error: 'text required' });

    // verify post exists
    const post = await Post.findByPk(postId);
    if (!post) return res.status(404).json({ error: 'post not found' });

    const msg = await ChatMessage.create({
      postId,
      fromUserId: fromUserId ? Number(fromUserId) : null,
      text,
      seenBy: safeStringify([]),
      createdAt: new Date()
    });

    res.json({
      success: true,
      message: {
        id: msg.id,
        postId,
        fromUserId: msg.fromUserId,
        text: msg.text,
        seenBy: [],
        createdAt: msg.createdAt
      }
    });
  } catch (err) {
    console.error('POST /api/posts/:id/chat error', err);
    res.status(500).json({ error: 'server error' });
  }
});

// Mark chat messages as seen by a user for a post
app.put('/api/posts/:id/chat/mark-seen', async (req, res) => {
  try {
    const postId = Number(req.params.id);
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const messages = await ChatMessage.findAll({ where: { postId } });
    for (const msg of messages) {
      const seen = safeParseJSON(msg.seenBy, []);
      if (!seen.includes(String(userId))) {
        seen.push(String(userId));
        msg.seenBy = safeStringify(seen);
        await msg.save();
      }
    }
    res.json({ success: true });
  } catch (err) {
    console.error('PUT /api/posts/:id/chat/mark-seen error', err);
    res.status(500).json({ error: 'server error' });
  }
});

// Register user
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'name/email/password required' });

    // check unique email
    const found = await User.findOne({ where: { email } });
    if (found) return res.status(400).json({ error: 'email already registered' });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const newUser = await User.create({ name, email, password_hash: hash, role: role || 'user' });

    // return simplified user object (no password)
    res.json({ id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role });
  } catch (err) {
    console.error('POST /api/register error', err);
    res.status(500).json({ error: 'server error' });
  }
});

// Login user
// expects { name, password, loginRole } — loginRole may be 'admin' for admin login
app.post('/api/login', async (req, res) => {
  try {
    const { name, password, loginRole } = req.body;
    if (!name || !password) return res.status(400).json({ error: 'name and password required' });

    // find user by name
    const user = await User.findOne({ where: { name } });
    if (!user) return res.status(401).json({ error: 'invalid credentials' });

    // If trying to login as admin, enforce name === 'bajaish' (as project previously required)
    if (loginRole === 'admin' && String(user.name).toLowerCase() !== 'bajaish') {
      return res.status(403).json({ error: 'only authorised access allowed, try logging in as user' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return res.status(401).json({ error: 'invalid credentials' });

    // return public user info (frontend will store session)
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    console.error('POST /api/login error', err);
    res.status(500).json({ error: 'server error' });
  }
});

// fallback
app.get('/', (req, res) => res.json({ ok: true }));

// ---------- Start server ----------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
