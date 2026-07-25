# Breathe Easy

A calm, guided breathing app to help you slow down and reset. Pick a technique, choose how long, and follow the animated breath cue. Completed sessions save to your history, with streaks and an optional mood check-in.

## Features

- **Three breathing techniques** — Box Breathing, 4-7-8 Breathing, and Calm Breathing, each with a short description and guidance on when to use it.
- **Guided breathing animation** — an expanding circle leads you through inhale, hold, and exhale phases with live text cues and a per-phase countdown. Pause, resume, end early, or restart.
- **Flexible session length** — 1, 3, or 5 minutes, or a custom duration from 1 to 30 minutes.
- **Mood check-in** — after each session, optionally log how you feel ("Much calmer", "Calmer", "About the same", "Still tense"). Your answer is saved with the session.
- **History & streaks** — track your day streak, total sessions, and total minutes, see your practice on a 12-week calendar heatmap, and review recent sessions (with the option to delete any entry).

## How it works

1. **Home** — welcome message, current streak, and a "Start Breathing" button.
2. **Pattern selection** — choose the breathing technique that fits the moment.
3. **Duration** — pick 1, 3, or 5 minutes, or set a custom length.
4. **Exercise** — follow the animated circle with on-screen cues. Pause or end early any time.
5. **Session complete** — a summary of what you just did, plus an optional mood check-in.
6. **History** — your stats, calendar heatmap, and a list of past sessions.

## Tech stack

- **React + TypeScript + Vite** — UI and build tooling.
- **Tailwind CSS** — styling and the calm visual theme.
- **lucide-react** — icons.
- **Supabase (PostgreSQL)** — stores breathing sessions, with Row-Level Security isolating each browser's data.

## Data & privacy

The app has no sign-in. Instead, each browser generates a stable device id (stored in `localStorage`) and sends it as the `x-device-id` header on every database request. Row-Level Security policies in Supabase compare each session's `device_id` against that header, so a browser can only read, insert, update, or delete its own sessions.

This is the strongest isolation possible without adding accounts, but it is inherently weaker than real auth — a determined client that spoofs another device's header could read that device's data. If you ever want true per-user privacy, the next step would be adding sign-in and scoping rows to `auth.uid()`.

## Database

The `breathing_sessions` table holds one row per completed session:

| column             | type      | notes                                            |
| ------------------ | --------- | ------------------------------------------------ |
| `id`               | uuid      | primary key, auto-generated                      |
| `device_id`        | text      | the browser's device id (from the request header)|
| `pattern`          | text      | the technique name, e.g. "Box Breathing"         |
| `duration_seconds` | integer   | actual session length in seconds                 |
| `feeling`          | text      | optional post-session mood (nullable)            |
| `completed_at`     | timestamptz | defaults to `now()`                            |

RLS is enabled, with four policies (one per CRUD verb) scoped by `device_id` via the `get_request_header('x-device-id')` helper function, which reads the value from PostgREST's `request.headers` JSON blob.

## Project structure

```
src/
  App.tsx                    # screen navigation
  screens/
    HomeScreen.tsx           # welcome + start
    PatternScreen.tsx        # technique selection
    DurationScreen.tsx       # session length
    ExerciseScreen.tsx       # animated breathing guide
    CompleteScreen.tsx       # summary + mood check-in
    HistoryScreen.tsx        # stats, heatmap, session list
  components/
    BreathingCircle.tsx      # the animated breath circle
    CalendarHeatmap.tsx      # 12-week practice calendar
    ScreenShell.tsx          # shared layout + buttons
  hooks/
    useBreathingEngine.ts    # breathing phase/animation logic
    useSessionHistory.ts     # load/save sessions from Supabase
  lib/
    patterns.ts              # breathing techniques, durations, moods
    supabase.ts              # supabase client + device id
supabase/
  migrations/                # SQL migrations (table + RLS)
```

## Local development

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

Type-check:

```bash
npm run typecheck
```

Supabase credentials are pre-populated in `.env` — no manual configuration needed.
