# AI Mock Interview Coach

Practice technical interviews and get instant AI-powered feedback on your answers.

## Tech Stack
- **Frontend + Backend:** Next.js 16 (App Router)
- **Grading:** OpenRouter chat completions
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Vercel

## Features
- 🎤 Record answers via browser microphone (up to 2 minutes)
- 🔊 Groq Whisper automatically transcribes audio to text
- 🤖 GPT-4o-mini grades on 5 parameters: Overall, Communication, Content, Confidence, Relevance
- 💡 Specific strengths and improvement tips after every answer
- 📝 Sample better answer from AI
- 📊 Session history with score tracking
- 🗂️ 15 questions across HR, Technical, and DSA categories

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Get an OpenRouter API key
1. Go to openrouter.ai
2. Create an API key
3. Choose a model slug, or keep the default `openai/gpt-4o-mini`

### 3. Optional: Set up Supabase
1. Create an account at supabase.com
2. Create a new project, then copy the Project URL and anon key
3. Go to SQL Editor and run `supabase-schema.sql`

### 4. Environment variables
```bash
cp .env.local.example .env.local
# Fill in your actual keys
```

Minimum for feedback:
```env
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_MODEL=openai/gpt-4o-mini
```

Optional history storage:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 5. Run locally
```bash
npm run dev
# Open http://localhost:3000
```

## Deploy to Vercel
1. Push to GitHub
2. Import repo on vercel.com
3. Add environment variables in Vercel dashboard
4. Deploy

## Project Structure
```text
app/
  page.tsx              - Homepage
  interview/page.tsx    - Typed answer and feedback flow
  history/page.tsx      - Past sessions
  api/
    grade/route.ts      - OpenRouter grading
    history/route.ts    - Fetch sessions
components/
  FeedbackCard.tsx      - Score display
lib/
  supabase.ts           - Supabase client
  questions.ts          - Question bank
```
