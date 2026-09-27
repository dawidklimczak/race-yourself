# Race Yourself

A goal-tracking app that reframes progress toward a deadline as a race against five AI-simulated versions of yourself — not a progress bar.

## The idea

Progress bars and streak counters are easy to ignore. Race Yourself turns any goal with a deadline and a target amount of hours (writing a thesis, training for something, learning an instrument) into a race: you log hours as you work, and five AI-controlled runners advance on their own pace next to you.

- **Lazy You**, **Busy You** and **The Plan** run at fixed tempos (50%, 80%, 100% of the pace needed to finish exactly on time).
- **Ambitious** and **Dedicated** run faster (120% / 150% by default, both configurable), so beating them means finishing early.
- **Shadow** is the interesting one: it starts slow, but its pace ratchets up on every day you don't log time, and eases only while you're actively logging — a rubber-band rival tuned to punish procrastination specifically, not just slow overall progress. It's also capped so a very long dry spell doesn't make it unbeatable.

Ranking against these six is recomputed from your logged hours and the days elapsed, live, every time you open a race. Beating "The Plan" (finishing at or ahead of the pace needed to hit your deadline) is what earns a medal — platinum/gold/silver/bronze for multi-stage races, gold/silver/bronze for one-shot ones. Medals are spendable against custom rewards you define yourself.

## Why the mechanic works (the design bet)

A single global "you're behind" signal is demotivating and vague. Racing against several named competitors gives concrete, differently-paced targets — so "I'm behind" becomes "I'm still ahead of Busy You but Shadow just passed me," which is a more specific and more actionable nudge than a percentage.

## Stack

- React 19 + TypeScript, React Router (`HashRouter`, so it works fine as a packaged mobile shell)
- Tailwind for styling, `lucide-react` for icons
- Capacitor (Android) — this is primarily a mobile app; the web build is also fully usable
- No backend: all state (races, time logs, medals, settings) lives in `localStorage` via `services/data.ts`, which also contains the entire race-simulation and medal-award logic

## Running locally

```bash
npm install
npm run dev          # http://localhost:5173
```

No API keys or backend are required to run or use the app.

### Android build

```bash
npm run sync          # builds the web app and syncs it into the Capacitor Android project
npx cap open android   # opens the project in Android Studio
```

## Project structure

- `pages/` — screens: `Home` (race list), `AddRace`, `RaceDetail` (the live race view), `Rewards`, `Settings`, `Onboarding`
- `components/Shared.tsx` — icon set and shared UI primitives
- `services/data.ts` — local storage persistence, race-progress simulation, medal-award rules
- `types.ts` — domain model and the AI roster's base configuration
