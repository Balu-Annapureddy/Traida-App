# ARENA MVP Implementation Plan
Date: 2025-12-18

ARENA is a daily, anonymous, challenge-based social platform. Phase 1 focuses on the core loop: Daily Selection -> Challenge -> Result/Traits -> Chat.

## User Review Required
> [!IMPORTANT]
> **Database Choice**: For this local MVP, I plan to use **SQLite** (stored locally in the project folder). This requires no external setup and is perfect for a self-contained prototype.
> **Styling**: Using Vanilla CSS with CSS custom properties (variables) for the design system to ensure a "Premium" feel without heavy framework dependencies.

## Proposed Changes

### Tech Stack / Architecture
- **Framework**: Next.js 14+ (App Router).
- **Language**: TypeScript.
- **Styling**: Vanilla CSS (Global styles + CSS Modules for components).
- **Database**: `bettersqlite3` or `sqlite` (Local file).
- **State Management**: React Context for User Session/Traits.

### Project Structure
- `/app`: Next.js App Router pages.
- `/components`: Reusable UI components (Buttons, Cards, Modals).
- `/lib`: Helper functions (Scoring logic, DB connection).
- `/styles`: Global CSS variables and typography.

### 1. Project Setup
#### [NEW] Setup
- Initialize Next.js app.
- Define `globals.css` with HSL color variables for the "Dark/Premium" theme.
- Configure fonts (Inter/Outfit).

### 2. Database Schema (SQLite)
#### [NEW] `lib/db.ts` & Schema
- **Users**: `id`, `username`, `archetype`, `traits_json` (Logic, Speed, etc.), `coins`.
- **Challenges**: `id`, `date`, `type`, `content_json`, `solution`.
- **Attempts**: `user_id`, `challenge_id`, `score`, `duration_ms`, `timestamp`.
- **Messages**: `room_id` (challenge_id), `user_id`, `content`, `timestamp`.

### 3. Core Features (Phase 1)
#### [NEW] Daily Challenges
- `app/page.tsx`: Landing page / Daily Selection.
- `app/challenge/[id]/page.tsx`: The actual game interface.
- Logic to lock users to 1 challenge per day.

#### [NEW] Scoring & Traits
- `lib/scoring.ts`: Calculate score based on time remaining and accuracy.
- Update User Traits in DB after submission.

#### [NEW] Chat System
- `app/challenge/[id]/room/page.tsx`: Chat room for the specific challenge.
- Simple polling mechanism or `SWR` for message updates (simpler than WebSockets for MVP, but upgradable).

#### [NEW] Profile & Cards
- `app/profile/page.tsx`: Visualizing the user's progress and archetype.

## Verification Plan

### Automated Tests
- Unit tests for Scoring Logic (ensure speed/accuracy calc is correct).

### Manual Verification
- **User Flow**:
    1. Open App -> Generate Anon User.
    2. See 3 Challenges -> Pick 1.
    3. Complete Challenge -> Verify Score & Traits update.
    4. Enter Chat Room -> Post message.
    5. Try to play another challenge -> Verify blocked.
- **Mobile Responsiveness**: Check layout on mobile view.
