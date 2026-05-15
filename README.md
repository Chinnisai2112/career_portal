# Career Development Portal

A React + Express career development portal with:

- ATS resume checker
- AI resume builder
- Mock interview AI
- Performance analysis
- Career guidance
- Document upload for `.txt` and `.pdf`
- Auth, backend APIs, MongoDB user history

## AI Provider Setup

The app is configured so every AI feature can use its own API key. This keeps quota usage separated.

Create a `.env` file in the project root:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/career_portal
JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=1d
ADMIN_HOST_EMAIL=host@example.com

# Resume ATS checker - Groq free tier
GROQ_API_KEY_RESUME_CHECKER=your_groq_key
GROQ_RESUME_MODEL=llama-3.1-8b-instant

# Resume builder - Gemini free tier
GEMINI_API_KEY_RESUME_BUILDER=your_gemini_key
GEMINI_RESUME_BUILDER_MODEL=gemini-2.0-flash

# Mock interview - Gemini free tier
GEMINI_API_KEY_INTERVIEW=your_gemini_key
GEMINI_INTERVIEW_MODEL=gemini-2.0-flash

# Career guidance - Gemini free tier
GEMINI_API_KEY_CAREER=your_gemini_key
GEMINI_CAREER_MODEL=gemini-2.0-flash

# Performance analysis - OpenRouter free model first, Gemini, then Groq fallback
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_PERFORMANCE_MODEL=google/gemma-2-9b-it:free
GEMINI_API_KEY_PERFORMANCE=your_gemini_key
GEMINI_PERFORMANCE_MODEL=gemini-2.0-flash
GROQ_API_KEY_PERFORMANCE=your_groq_key
GROQ_PERFORMANCE_MODEL=llama-3.1-8b-instant
```

Fallbacks are supported:

- `GROQ_API_KEY` can be used when a feature-specific Groq key is not set.
- `GEMINI_API_KEY` can be used when a feature-specific Gemini key is not set.

## Run Locally

Install backend + frontend dependencies (one command):

```bash
npm run install:all
```

Or install separately:

```bash
npm install
npm run client:install
```

Start the backend API (project root):

```bash
npm run dev
```

Start the React frontend (in another terminal):

```bash
npm run client
```

On Windows you can also double-click `client/start.bat`.

Optional: copy `client/.env.example` to `client/.env` if you need a custom `REACT_APP_API_URL`.

Run both together:

```bash
npm run dev:full
```

Frontend: `http://localhost:3000`

Backend: `http://localhost:5000`

## Admin Monitor

The host can monitor users at `http://localhost:3000/admin`.

Admin access is allowed when either condition is true:

- The logged-in user's email is listed in `ADMIN_HOST_EMAIL`.
- The user's MongoDB document has `isAdmin: true`.

The admin page shows total users, new users in the last 7 days, users with AI history, admin users, searchable user rows, and truncated per-user AI history previews.
