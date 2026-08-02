# AI Mock Interview Coach

An AI-powered mock interview platform where you record your answers, get them transcribed, and receive detailed feedback on communication, content, and confidence.

## Live Demo
> Coming soon (Vercel deployment)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend + Backend | Next.js 14 (App Router) |
| Audio Recording | MediaRecorder API (browser built-in) |
| Transcription | Groq Whisper (free, fast) |
| LLM Grading | OpenRouter → GPT-4o-mini |
| Database | Supabase (PostgreSQL) |
| Deployment | Vercel |

## Features

-  Record answers via browser microphone (up to 2 minutes)
-  Groq Whisper automatically transcribes audio to text
-  GPT-4o-mini grades on 5 parameters: Overall, Communication, Content, Confidence, Relevance
-  Specific strengths and improvement tips after every answer
-  Sample better answer from AI
-  Session history with score tracking
-  15 questions across HR, Technical, and DSA categories

## Project Structure

mock-interview-coach/
├── app/
│ ├── page.tsx → Homepage
│ ├── interview/page.tsx → Recording + feedback flow
│ ├── history/page.tsx → Past sessions
│ └── api/
│ ├── transcribe/ → Groq Whisper transcription
│ ├── grade/ → OpenRouter LLM grading
│ └── history/ → Fetch sessions from Supabase
├── components/
│ ├── Recorder.tsx → MediaRecorder UI
│ └── FeedbackCard.tsx → Score display
└── lib/
├── supabase.ts → Supabase client
└── questions.ts → Question bank (15 questions)


## Setup

### 1. Clone the repo
```bash
git clone https://github.com/prateekchaurasia11-lab/mock-interview-coach.git
cd mock-interview-coach
```

### 2. Install dependencies
```bash
npm install
```

### 3. Get API keys
- **Groq** (free): [console.groq.com](https://console.groq.com) → API Keys → Create
- **OpenRouter**: [openrouter.ai/keys](https://openrouter.ai/keys) → Create key
- **Supabase**: [supabase.com](https://supabase.com) → New project → Settings → API

### 4. Setup environment variables
```bash
cp .env.local.example .env.local
```
Fill in your keys in `.env.local`.

### 5. Setup Supabase database
Run `supabase-schema.sql` in Supabase → SQL Editor → New Query → Run.

### 6. Run locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_MODEL=openai/gpt-4o-mini
GROQ_API_KEY=your-groq-api-key
```

## How It Works

1. User selects a category (HR / Technical / DSA)
2. Question is displayed with a hint
3. User records their answer (up to 2 minutes)
4. Audio is sent to Groq Whisper → transcript generated
5. Transcript + question sent to GPT-4o-mini → JSON feedback
6. Scores, strengths, improvements, and better answer displayed
7. Session saved to Supabase for history tracking

## Made By

Prateek Chaurasia — Final Year B.Tech IT, HBTU Kanpur

Ctrl+S → phir push karo:

powershell
git add README.md
git commit -m "docs: update README with full setup guide"
git push origin main