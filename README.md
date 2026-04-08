# Juggle (Formerly PAC)

A revolutionary productivity command center that seamlessly merges a robust Kanban task manager with a highly polished calendar grid using a continuous "Unified Canvas" paradigm.

> **Note:** For a full breakdown of the project goals, philosophy, and UI architecture, please see [VISION.md](./VISION.md). For granular step-by-step development tasks, see the local `implementation_plan.md` artifact.

## The Core Concept
Traditional productivity forces you to jump between a task board and a calendar. **Juggle** eliminates mode-switching by treating both Status (Kanban) and Time (Calendar) as physical spaces on an infinitely panning horizontal canvas. Drag a task from your `Backlog` column directly onto `Tuesday at 2:00 PM` to time-box it instantly.

## Tech Stack
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Vanilla CSS (CSS Modules & Global CSS Variables for premium aesthetics)
- **Database**: SQLite (local dev) using Prisma ORM
- **Text Editing**: Tiptap (for the Daily Journal rich-text)
- **Date Utilities**: `date-fns`

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Generate Prisma Client & Sync DB:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure
- `src/app`: Contains the Next.js routing, the primary Canvas UI, and layout shells.
- `src/components`: Reusable UI components (Interactive Grid Cells, Task Cards, Modals).
- `prisma`: Database schema definition reflecting the unified Event, Task, Subtask, and Journal models.

## Development Principles
- **Living Documents**: Always keep `VISION.md`, README, and implementation plans strictly aligned with the codebase.
- **Premium UI**: Utilizing high quality Vanilla CSS for fluid animations, gradients, and a borderless modern aesthetic.
- **Robust Data Engine**: Ensure the hybrid Task/Event database model maintains integrity.
- **Atomic Commits**: Ensure small, atomic commits for a clean repository history.
