# PAC (Personalized Assisted Calendar)

A highly polished, modern Google Calendar clone built as a foundation for advanced AI scheduling features.

## Tech Stack
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Vanilla CSS (CSS Modules & Global CSS Variables)
- **Database**: SQLite (local dev) using Prisma ORM
- **Date Utilities**: `date-fns`

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure
- `src/app`: Contains the Next.js routing and primary pages.
- `src/components`: Reusable UI components (Modals, Buttons, Grid cells).
- `prisma`: Database schema definition and generated client.

## Development Principles
- **Clean Architecture**: Follow modern React server-component patterns.
- **Premium UI**: Utilizing high quality Vanilla CSS for layout, gradients, and micro-interactions.
- **Robust Git History**: Ensure small, atomic commits for a clean repository history.
