# TRAIDA Implementation Plan (Phase 0 & 1) - Archived 2025-12-18

**Ref**: `app-doc/APP_DOC.md`

## Goal
Establish the technical foundation for TRAIDA and build the Core Loop (Daily Challenge -> Score -> Chat).

## Tech Stack
- **Frontend**: Next.js 14+ (App Router), TypeScript
- **Styling**: Vanilla CSS (CSS Variables for Retro Theme)
- **DB**: SQLite (`better-sqlite3`)
- **Design Mode**: Pixel / Retro-modern (Low-res aesthetic, Monospace/Retro fonts)

## Phase 0: Foundation
### 1. Project Init
- `npx create-next-app@latest` (TS, No Tailwind, ESLint)
- **Directory Structure**:
    - `app-doc/` (Documentation)
    - `src/app/` (Routes)
    - `src/lib/` (DB, Logic)
    - `src/styles/` (Global Theme)

### 2. Design System (`globals.css`)
- **Fonts**: 'Press Start 2P' or similar retro font for headers, 'Inter' for readability.
- **Colors**: High contrast neon on dark background (Cyberpunk/Retro).
- **Components**:
    - `Button.module.css`: Pixelated borders.
    - `Card.module.css`: Retro window style.

### 3. Database Schema (`lib/db.ts`)
- **Tables**:
    - `users`: id, username, email, password_hash, coins, sp_coins, traits_json, archetype_id, current_streak, last_played_date.
    - `challenges`: id, date_active, type, difficulty, content_json, solution.
    - `attempts`: id, user_id, challenge_id, score, time_taken, is_success, timestamp.
    - `messages`: id, room_id, user_id, content, timestamp.
