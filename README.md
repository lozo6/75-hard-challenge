# 75 Hard Challenge Tracker

A minimal, offline-first web app to track the **75 Hard** challenge.

Built with:

- [Next.js](https://nextjs.org/) (App Router, TypeScript)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- LocalStorage for persistence
- PWA support (installable on mobile & desktop)

---

## Features

- Daily checklist for all 75 Hard tasks:

  - 2x workouts (one must be outdoors)
  - Follow your diet
  - No alcohol / cheat meals
  - 10 pages of non-fiction reading
  - Progress picture
  - 1 gallon of water

- **Hard / Soft modes**

  - **Hard mode**
    - If you try to move to the next day with incomplete tasks, the app prompts you to restart at **Day 1**, in line with 75 Hard rules.
    - Fully complete days can move forward normally.
  - **Soft mode**
    - You can move to the next day even with incomplete tasks (no forced restart).
    - Great for people easing into the structure.

- Daily reflection

  - Optional text area to journal how the day went.
  - Reflections are stored per day.

- History view

  - See previous days (completion % + reflection snippet) on this device.
  - History is local-only and can be cleared at any time.

- Offline-first & PWA
  - Installable as an app on mobile and desktop.
  - Data is stored in localStorage; no account or backend required.

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```
