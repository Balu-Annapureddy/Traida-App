# TRAIDA Task List (Phase 1 In Progress) - Archived 2025-12-18

**Source of Truth**: `app-doc/APP_DOC.md`

- [x] **Phase 0: Foundation**
    - [x] Create APP_DOC
    - [x] **Project Initialization**
        - [x] Initialize Next.js (App Router, TS)
        - [x] Setup Vanilla CSS Framework (Variables, Pixel/Retro Theme)
        - [x] Create `app-doc` history tracking
    - [x] **Database & Schema**
        - [x] Setup SQLite (better-sqlite3) wrapper
        - [x] Define Schema: Users (with coins/spcoins/traits)
        - [x] Define Schema: Challenges (Day/type/content)
        - [x] Define Schema: Attempts & Streaks
        - [x] Define Schema: RoomMessages

- [ ] **Phase 1: MVP Core**
    - [x] **Auth & Identity**
        - [x] Implement Email+Password Auth (or simple mock for Phase 1 dev)
        - [x] Create User Model (Username, Avatar, Traits default)
        - [x] "Forgot Password" mock flow
    - [ ] **Daily Challenge Engine**
        - [ ] UI: 3 Daily Challenge Selection Screen
        - [ ] Logic: Single Attempt Restriction
        - [ ] Logic: Scoring (Accuracy + Time)
        - [ ] Data: Pre-seed 3 example challenges
    - [ ] **Traits & Progress**
        - [ ] Logic: Update Traits based on challenge result
        - [ ] Logic: Streak calculation
        - [ ] UI: Profile Page (Rank, Traits, Archetype)
