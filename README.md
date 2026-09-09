# KelanaAI ✈️

An AI-powered travel planning application that generates personalized itineraries, answers travel questions via a knowledge base, and lets you chat with an AI travel assistant.

---

## Features

- **AI Trip Planning** — Generate full day-by-day itineraries with activities, food, and transport suggestions
- **Travel Chat** — Persistent chat with an AI assistant using conversation history
- **Ask the Knowledge Base** — Grounded answers from your own documents (AWS Bedrock Knowledge Base)
- **Trip History** — Save, browse, and revisit all generated trips
- **JWT Authentication** — Secure login and registration

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Backend   | FastAPI, SQLAlchemy, PostgreSQL    |
| Frontend  | Next.js 16, Tailwind CSS          |
| AI        | AWS Bedrock (Amazon Nova Lite)    |
| Database  | Neon (PostgreSQL, serverless)     |
| Auth      | JWT (python-jose + bcrypt)        |
| Deploy    | FastAPI Cloud + Vercel            |

---

## Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (local) or Neon account

### Backend Setup

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1      # Windows
# source .venv/bin/activate       # Mac/Linux

pip install -r requirements.txt
```

Create `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/kelana_db
AWS_REGION=ap-southeast-2
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
MODEL_ID=amazon.nova-lite-v1:0
KNOWLEDGE_BASE_ID=your_kb_id
KNOWLEDGE_BASE_MODEL_ARN=arn:aws:bedrock:ap-southeast-2::foundation-model/amazon.nova-lite-v1:0
SECRET_KEY=your-secret-key
```

Run the backend:
```bash
uvicorn main:app --reload
```

API docs available at: `http://localhost:8000/docs`

### Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run the frontend:
```bash
npm run dev
```

App available at: `http://localhost:3000`

---

## Deployment

### Backend — FastAPI Cloud

1. Push code to GitHub
2. Connect repo to [FastAPI Cloud](https://fastapicloud.dev)
3. Set environment variables in FastAPI Cloud dashboard:
   - `DATABASE_URL` — Neon connection string with `?sslmode=require`
   - `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
   - `MODEL_ID`, `KNOWLEDGE_BASE_ID`, `KNOWLEDGE_BASE_MODEL_ARN`
   - `SECRET_KEY`
4. Deploy — FastAPI Cloud auto-detects `requirements.txt`

### Frontend — Vercel

1. Connect GitHub repo to [Vercel](https://vercel.com)
2. Set root directory to `frontend`
3. Add environment variable in Vercel dashboard:
   - `NEXT_PUBLIC_API_URL` = your FastAPI Cloud URL (no trailing slash)
4. Deploy

### Database — Neon

1. Create a project at [neon.tech](https://neon.tech)
2. Copy the connection string from Dashboard → Connection Details
3. Use `?sslmode=require` at the end (remove `&channel_binding=require`)
4. Tables are created automatically on first startup via `init_db()`

---

## Project Structure

```
├── backend/
│   ├── main.py                  # FastAPI app + all endpoints
│   ├── database.py              # SQLAlchemy engine + session
│   ├── models/
│   │   ├── user.py
│   │   ├── trip.py
│   │   └── conversation.py
│   ├── services/
│   │   ├── auth_service.py      # JWT + bcrypt
│   │   ├── bedrock_service.py   # AI trip generation
│   │   ├── trip_service.py      # Business logic
│   │   └── kb_service.py        # Knowledge Base RAG
│   └── requirements.txt
│
└── frontend/
    ├── app/
    │   ├── page.tsx             # Trip planner
    │   ├── trips/               # Trip history
    │   ├── chat/                # AI chat
    │   ├── ask/                 # Knowledge base Q&A
    │   ├── profile/             # User profile
    │   ├── login/
    │   ├── register/
    │   └── about/
    ├── components/
    │   ├── NavBar.tsx
    │   └── TripCard.tsx
    └── services/
        ├── authService.ts
        ├── tripService.ts
        ├── chatService.ts
        └── askService.ts
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login, returns JWT |
| GET | `/api/v1/auth/me` | Get current user profile |
| POST | `/api/v1/trips` | Generate AI trip |
| GET | `/api/v1/trips` | List user's trips |
| GET | `/api/v1/trips/{id}` | Get single trip |
| PUT | `/api/v1/trips/{id}` | Update trip |
| DELETE | `/api/v1/trips/{id}` | Delete trip |
| POST | `/api/v1/ask` | Ask knowledge base |
| POST | `/api/v1/conversations` | Create conversation |
| GET | `/api/v1/conversations` | List conversations |
| POST | `/api/v1/conversations/{id}/messages` | Send message + get AI reply |
| GET | `/api/v1/conversations/{id}/messages` | Get message history |
