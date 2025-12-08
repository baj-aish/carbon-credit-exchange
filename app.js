const qs = id => document.getElementById(id);
const qsa = sel => [...document.querySelectorAll(sel)];
const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

const API_BASE = "https://carbon-credit-exchange-backend.onrender.com";
const SESSION_KEY = "ccx_session_v1";
const LAST_SECTION_KEY = "ccx_last_section_v1";
const PROTECTED_SECTIONS = ["feed", "upload", "calculator", "admin", "inbox"];

let state = { users: [], posts: [], currentUser: null };
let currentChatPostId = null;

const saveSession = () => {
  if (state.currentUser)
    localStorage.setItem(SESSION_KEY, JSON.stringify(state.currentUser));
  else localStorage.removeItem(SESSION_KEY);
};

const restoreSession = () => {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return;
  try {
    const saved = JSON.parse(raw);
    let u = state.users.find(x => x.name === saved.name);
    if (!u) {
      // prevents re-register after refresh
      state.users.push({
        id: saved.id,
        name: saved.name,
        email: saved.email,
        role: saved.role,
        createdAt: Date.now()
      });
      syncState();
    }
    state.currentUser = saved;
    updateAuthUI();
  } catch {}
};

const syncState = () => {
  fetch(API_BASE + "/api/state", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({users: state.users, posts: state.posts})
  });
};

const loadState = () => {
  fetch(API_BASE + "/api/state")
    .then(r => r.json())
    .then(data => {
      state.users = data.users || [];
      state.posts = data.posts || [];
      restoreSession();
      showSection(localStorage.getItem(LAST_SECTION_KEY) || "landing");
      renderFeed();
      renderInbox();
    });
};

const refreshFromServer = () => {
  fetch(API_BASE + "/api/state")
    .then(r => r.json())
    .then(data => {
      state.posts = data.posts || [];
      renderChatLive();
      updateUnreadIndicator();
    });
};

setInterval(refreshFromServer, 1000);

// ✅ INBOX = ONE CONVERSATION PER USER
const getInboxThreads = () => {
  if (!state.currentUser) return [];
  const me = state.currentUser.name;
  const map = {};

  state.posts.forEach(p => {
    (p.chatMessages || []).forEach(m => {
      const key = [p.id, m.from === me ? p.user : m.from].join("_");
      if (!map[key]) map[key] = {postId:p.id,name:m.from,text:m.text,time:m.time,seen:m.seen};
    });
  });
  return Object.values(map).sort((a,b)=>b.time-a.time);
};

const renderInbox = () => {
  const inboxList = qs("inboxList");
  if (!state.currentUser) return inboxList.innerHTML = "Login to view inbox.";
  const threads = getInboxThreads();
  inboxList.innerHTML = threads.map(t=>`
    <div class="bg-slate-900 p-3 rounded-xl flex justify-between">
      <div>
        <p>${t.name}</p><p class="text-xs">${t.text}</p>
      </div>
      <span class="text-xs ${t.seen?"":"text-red-400"}">
        ${t.seen?"Seen":"Unread"}
      </span>
    </div>`).join("");
  updateUnreadIndicator();
};

const updateUnreadIndicator = () => {
  const dot = qs("inboxIndicator");
  const unread = getInboxThreads().some(i => !i.seen);
  unread ? dot.classList.remove("hidden") : dot.classList.add("hidden");
};

// ✅ CHAT = SINGLE CONVERSATION LIVE
const renderChatLive = () => {
  if (!currentChatPostId) return;
  const post = state.posts.find(p=>p.id==currentChatPostId);
  if (!post) return;
  renderChatMessages(post);
};

const renderChatMessages = post => {
  qs("chatMessages").innerHTML = post.chatMessages.map(m=>`
    <div class="${m.from===state.currentUser.name?"text-right":""}">
      <b>${m.from}</b>: ${m.text}
    </div>`).join("");
};

on(qs("chatForm"),"submit",e=>{
  e.preventDefault();
  const post = state.posts.find(p=>p.id==currentChatPostId);
  post.chatMessages.push({
    id:Date.now(),
    from:state.currentUser.name,
    text:qs("chatInput").value,
    seen:false,
    time:Date.now()
  });
  syncState();
  qs("chatInput").value="";
});

on(qs("logoutBtn"),"click",()=>{
  state.currentUser=null;
  saveSession();
  location.reload();
});

loadState();
