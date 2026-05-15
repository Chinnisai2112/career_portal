# Career Portal — Simple Setup Guide

## What this project is

A **career development website** with:

| Feature | What it does |
|---------|----------------|
| **Resume Lab** | ATS resume check + AI resume builder |
| **Mock Interview** | Practice interviews with AI feedback |
| **Performance** | Turn goals/wins/blockers into a growth plan |
| **Career Guidance** | Ask career questions (roadmaps, jobs, skills) |
| **Documents** | Upload PDF/TXT and send text to resume tools |
| **History** | Saves your AI answers in the database |
| **Login** | Register / sign in (data tied to your account) |
| **Admin** | Host can see users (if your email is in `ADMIN_HOST_EMAIL`) |

**Tech stack**

- Frontend: React (`client/` folder) → http://localhost:3000  
- Backend: Node + Express → http://localhost:5000  
- Database: **MongoDB** (stores users + AI history)

---

## Folder structure (simple)

```
career_portal-1/
├── client/          ← React website (UI)
├── server.js        ← API server entry
├── controllers/     ← API logic (auth, AI, admin)
├── models/          ← Database schemas (User)
├── routes/          ← API URLs
├── services/        ← AI API calls (Groq, Gemini, OpenRouter)
├── .env             ← SECRETS (never share this file)
├── .env.example     ← Template (safe to share)
└── SETUP.md         ← This file
```

---

## Step 1 — Install Node.js

Install **Node.js 18+** from https://nodejs.org if you do not have it.

---

## Step 2 — Database (MongoDB)

Your app **must** have MongoDB. Data (users, passwords hash, AI history) is stored there.

### Option A — MongoDB Atlas (recommended, free, no local install)

1. Go to https://www.mongodb.com/cloud/atlas/register  
2. Create a **free M0 cluster**.  
3. **Database Access** → add a user (username + password).  
4. **Network Access** → Add IP → **Allow Access from Anywhere** (for learning) or your IP.  
5. **Connect** → Drivers → copy the connection string, e.g.  
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/career_portal`  
6. Open `.env` in the project root and set:

```env
MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/career_portal
```

Replace `YOUR_USER`, `YOUR_PASSWORD`, and the cluster URL.

### Option B — MongoDB on your PC (local)

1. Install **MongoDB Community Server** for Windows.  
2. Start the **MongoDB** service.  
3. In `.env` use:

```env
MONGO_URI=mongodb://127.0.0.1:27017/career_portal
```

The database `career_portal` is created automatically on first use.

### Check database connection

```bash
npm run check:db
```

You should see `OK: Connected to database`.

Or open in browser (after starting the server):

http://localhost:5000/api/health

Look for `"database": "connected"`.

---

## Step 2b — Fix `.env` (important)

The server reads **`e:\career_portal-1\.env`** (project root).

- File must be **saved** (Ctrl+S). An empty `.env` causes: `Set MONGO_URI in .env`.  
- Copy `.env.example` if needed, then fill in values.  
- Add your **AI API keys** (Groq, Gemini, OpenRouter) — see `.env.example` comments.

---

## Step 3 — AI API keys (optional but needed for AI tools)

| Variable | Get key from |
|----------|----------------|
| `GROQ_API_KEY_RESUME_CHECKER` | https://console.groq.com |
| `GEMINI_API_KEY_*` | https://aistudio.google.com/apikey |
| `OPENROUTER_API_KEY` | https://openrouter.ai |

Each feature can use a **different key** so you get more free quota.

---

## Step 4 — Install and run

Open terminal in the project folder:

```bash
npm run install:all
```

Start **backend + frontend** together:

```bash
npm run dev:full
```

Or run in **two terminals**:

```bash
# Terminal 1
npm run dev

# Terminal 2
npm run client
```

| URL | Purpose |
|-----|---------|
| http://localhost:3000 | Website |
| http://localhost:5000 | API |
| http://localhost:5000/api/health | DB + API status |

### If port 3000 is busy

Close the other app using port 3000, or set `PORT=3001` in `client/.env`.

---

## Step 5 — Test that data is saved

1. Open http://localhost:3000/login → **Register** (name, email, password).  
2. **Sign in**.  
3. Use **Career Guidance** or **Resume Lab** (with API keys set).  
4. Open **History** — you should see saved entries.  
5. Run `npm run check:db` — user count should be ≥ 1.

Data is stored in MongoDB collection: **`users`** (field: `history` array).

---

## Sharing this project locally (USB / zip / another PC)

**Yes, you can share the project folder** with a friend or another computer.

### Safe to share

- All code folders (`client/`, `controllers/`, etc.)  
- `.env.example`  
- `README.md`, `SETUP.md`  
- `package.json`

### Do NOT share

- **`.env`** — contains passwords, JWT secret, API keys  
- **`node_modules/`** — huge; run `npm run install:all` on the other PC  
- **`uploads/`** — temporary files  
- **`client/build/`** — can be rebuilt  

### How to share

1. Zip the project **without** `node_modules`, `.env`, and `uploads`.  
2. On the other PC: unzip → copy `.env.example` to `.env` → fill in MongoDB + keys.  
3. Run `npm run install:all` then `npm run dev:full`.

### Using Git

`.env` is already in `.gitignore`. Never commit API keys.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Set MONGO_URI in .env` | Save `.env` in project root; set `MONGO_URI=...` |
| `injected env (0)` / DB Error | `.env` was empty — save file or use steps above |
| `ECONNREFUSED` MongoDB | Start local MongoDB or use Atlas URI |
| AI tools fail | Add API keys in `.env`; sign in first |
| Port 3000 in use | Stop other React app or change `PORT` in `client/.env` |
| Register/login fails | Check `npm run check:db` and `/api/health` |

---

## What was built (summary)

1. **Separate AI APIs** per feature (Groq for ATS, Gemini for interview/career/builder, etc.).  
2. **Modern UI** — dashboard, feature pages, markdown results, provider status badges.  
3. **Auth** — register, login, JWT, logout.  
4. **MongoDB** — users + AI history per account.  
5. **Document upload** — PDF/TXT text extraction.  
6. **Admin page** — for host email in `ADMIN_HOST_EMAIL`.
