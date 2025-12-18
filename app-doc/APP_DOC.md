# TRAIDA — COMPLETE APPLICATION DOCUMENT
(Master Planning, Phases, Tech Stack & Governance)

## 1. PRODUCT OVERVIEW
- **App Name**: TRAIDA
- **Platform**: Web-only (Desktop + Mobile Web, Mobile-first UX)
- **Theme**: Pixel / Retro-modern aesthetic
- **Core Concept**: A daily, anonymous, challenge-based social platform where users evolve traits, personality archetypes, and social identity through consistency, logic, and interaction — not personal data.

## 2. CORE PRODUCT PRINCIPLES (NON-NEGOTIABLE)
1. **Anonymous-first** (no personal details)
2. **Skill & consistency > money**
3. **No pay-to-win mechanics**
4. **Minimal economy influence**
5. **Strong moderation & admin control**
6. **Mobile experience is as important as desktop**
7. **Deterministic logic** (no AI dependency)

## 3. USER IDENTITY & AUTHENTICATION
### Authentication
- Email + Password
- Forgot Password flow
- **No social logins** (Phase 1–2)

### Identity Rules
- Unique username (mandatory)
- Username change allowed using **1 SPCoin**
- No personal details stored
- Friends list visible only to the user

### Signup Rewards
- 150 Coins
- 3 SPCoins

## 4. DAILY CHALLENGE SYSTEM (CORE LOOP)
### Daily Structure
- 3 challenges released daily
- User must solve at least 1 to:
  - Maintain streak
  - Update traits
- User may solve all 3 for:
  - Small perks (coins, emoji unlock chance, badge progress)

### Rules
- **Timer-based**
- **Single attempt per challenge**
- Score = Accuracy + Time
- Global ranking per challenge
- Rankings reset daily

### Practice Mode — LIBER
- Unlimited practice tasks
- No streak impact
- No trait impact
- **Rewards**: Badges, Small coin rewards
- Badge milestones every 25–50 completions

## 5. TRAITS, STREAKS & PERSONALITY
### Traits (Example)
- Logic
- Speed
- Consistency
- Creativity
- Ethics

### Trait Rules
- Traits update **only** from daily challenges
- Liber does not affect traits
- Coins never affect traits

### Streak System
- Daily streak maintained by solving ≥1 challenge
- **Rewards**: Coins, Premium emoji unlocks, Streak shields
- 3 streak shields earned via milestones
- Shields can also be purchased using coins
- Shield prevents one missed day

### Personality System
- Personality Archetype derived from traits
- Daily / Weekly / Monthly / Yearly insights
- **Deterministic logic** (no AI generation)

## 6. SOCIAL SYSTEM (AMIGO)
### Amigos (Friends)
- Amigo request → Accept / Decline / Block
- Friend chat (text + emojis only)
- Friends list private

### Chat Rules
- Text + emojis only
- **No images, no links**
- No reactions
- Strict moderation

## 7. ROOMS & CLUBS
### Challenge Rooms
- One room per challenge
- Accessible only after solving the challenge
- Valid for 24 hours
- Auto-expire

### Clubs (Persistent Communities)
- **Creation cost**: 5 SPCoins
- Admin approval required (within 24h)
- **Club profile**: Name, 1 of 5 predefined club marks
- **Membership**: User request → owner approval; Owner can invite users
- **Features**: Club chat, Club rooms, Internal rankings, Emoji + text only

## 8. ECONOMY SYSTEM
### Currency Types
1. **Coins** (Common)
   - Cosmetic & convenience use
   - **Earned via**: Challenges, Streaks, Liber, Events
2. **SPCoins** (Rare)
   - 1 SPCoin = 100 Coins
   - **Earned via**: Long streaks, Trait milestones, Admin grants
   - **Used for**: Username change, Club creation, Special unlocks

**Rule**: Coins & SPCoins NEVER affect score or traits.

## 9. EMOJIS, AVATARS & COSMETICS
### Emojis
- **Default pack**: 25 everyday emojis
- **Premium pack**: 25 emojis (Locked initially)
- Unlock via streaks, perks, coins
- **Rare / Ultra-rare emojis**: Event-based, Long streaks, Admin-granted
- Premium emojis visually distinct (Glow, Metallic, Pixel-gem)
- Once unlocked → permanent

### Avatars
- Predefined pixel-style avatars
- Free & premium sets
- Unlock via streaks, challenges, coins

### Personality Card Customization
- Background, Border, Theme, Badge placement, Emoji highlight
- **Cosmetic only**

## 10. NOTIFICATIONS
- Only critical notifications:
  - Daily challenge available
  - Streak at risk
  - Amigo request
  - Club invite
  - Admin action
- **No engagement spam**

## 11. FEEDBACK & REPORTING
### Feedback System
- Categories: Bug, Suggestion, Abuse, Performance
- Admin review
- AI-assisted review optional (future)

### Reporting
- User reports, Message reports, System failure reports

## 12. ADMIN DASHBOARD (3 ADMINS MAX)
### Admin Powers
- **Users**: Warn, mute, ban, Grant/revoke coins & SPCoins, Reset streaks
- **Challenges**: Create/edit, Disable broken ones
- **Clubs**: Approve/reject, Suspend, Transfer ownership
- **Moderation**: Delete messages, Shadow mute, Review reports
- **System**: Maintenance mode, Feature toggles, Audit logs, Analytics dashboard

### Admin Power Boundaries
- **Admins CAN**:
    - Mute / ban users
    - Resolve reports
    - View stats
    - View audit logs
- **Admins CANNOT**:
    - Modify scores
    - Modify traits
    - Enter private rooms invisibly
    - See friend lists

### User Moderation States
- **ACTIVE**: Normal access.
- **MUTED**: Chat blocked, can still play challenges.
- **BANNED**: Login blocked.

## 13. TECH STACK (SAFE & LOW-RISK)
### Frontend
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Vanilla CSS + CSS Variables
- **Layouts**: Mobile-first
- **Effects**: CSS animations only

### Backend
- **Logic**: Next.js Server Actions / API Routes
- **Database**: SQLite (Phase 1–3), PostgreSQL (future migration)

### State
- React Context (session, traits)
- No heavy state libraries initially

### Realtime
- Polling (Phase 1)
- WebSockets (future)

### Design
- Pixel / retro-modern UI
- Low-resolution intentional visuals
- High readability typography

## 14. PHASED DEVELOPMENT PLAN
### Phase 0 — Foundation
- Lock product rules
- Create APP_DOC
- Define DB schema

### Phase 1 — MVP Core
- Auth & anonymous identity
- Daily challenges
- Scoring & traits
- Rooms & chat
- Profile & personality card

### Phase 2A — Stability, Safety & Governance
- **Reports**: User reporting system.
- **Moderation**: Simple profanity filter (No AI, static list), User states (ACTIVE, MUTED, BANNED).
- **Admin Dashboard**: Stats, Audit logs, User management.
- **Rate Limiting**: In-memory limiter (Non-distributed, acceptable for MVP).

### Phase 2B — Social Foundations
- Amigo system, Friend requests, Private rooms.

### Phase 2C — Economy Foundations
- Coins, Emoji unlocks, Streak shields.

### Phase 3 — Mobile Polish & Retention (Refined)
**Goal**: Improve retention and comfort. No new competitive mechanics.

#### 1. Liber (Practice Mode)
- **Route**: `/liber`
- **Logic**: Unlimited random challenges. No score/trait updates. No history saved.
- **UI**: "Practice Mode" label. Infinite loop.

#### 2. Streak Shields
- **Concept**: Consumable protection for missed days.
- **Mechanism**: Stored in Inventory. Auto-consumed on missed day check.
- **Acquisition**: Earned via milestones or bought (Coins).

#### 3. Username Change
- **Cost**: 1 SP Coin.
- **Logic**: Validates uniqueness. Logs transaction.

#### 4. Mobile Polish
- **Viewport**: `100dvh` layout.
- **Interactions**: 48px+ touch targets.
- **Performance**: Reduced reflows.

### Phase 4 — Communities (Clubs)
**Goal**: Interest-based, non-competitive social groups.
**Philosophy**: No leaderboards, no scores, no "Top Clubs". Semi-anonymous.

#### 1. Club Identity (Rules)
- **Size**: Max 30 Members.
- **Limit**: Max 2 Clubs per user.
- **Entry**:
    - **Public**: Join directly (No approval).
    - **Private**: Invite-only (No requests).
- **Lifetime**: Persistent until deleted by Creator.

#### 2. Roles & Permissions
- **Creator**: Delete Club (Irreversible, wipes data), Promote/Demote Mods.
- **Moderator**: Invite, Remove Members, Announcements.
- **Member**: Chat, Leave.

#### 3. Creation & Safety
- **Cost**: 5 SP Coins.
- **Approval**: Admin approval required (SP held, refunded if rejected).
- **Rate Limit**: Max 1 pending request.

#### 4. Club Chat
- **Scope**: Persistent, separate from Global.
- **Limits**: Same rate limits as Global Chat.
- **Restrictions**: No Media, No Voice, No External Links.
- **Moderation**: Standard Report system applies.


### Phase 5 — Insights
- Future expansion.

## 15. GOVERNANCE RULE
- This document is the single source of truth.
- Any feature not listed here must be explicitly approved before implementation.
- All development tasks must reference this document.

## 16. PHASE 1 (MVP) — COMPLETE

### Phase 1 – Implementation Walkthrough
#### Features Delivered
- **Authentication**: Register/Login with Retro UI, Secure Session Cookies.
- **Daily Challenges**: Dashboard lists 3 daily cards, Interactive Game Interface with Timer, Scoring Logic (Accuracy + Time).
- **Traits & Profile**: Profile Page `/profile`, Visualizes Logic/Speed/Pattern traits, Shows Archetype and Coin Balance.
- **Social**: Challenge-Gated Chat Rooms, Real-time message posting.

#### How to Test
1. **Register**: Go to `/register`, create an account.
2. **Play**: Select a challenge from Dashboard. Solve it (Check `scripts/seed-challenges.js` for answers like "Echo", "42").
3. **Check Profile**: See your traits increase.
4. **Chat**: After solving, click **ENTER_ROOM** on the result screen to chat with others.
5. **Mobile Testing**: Open Chrome DevTools (F12) -> Toggle Device Toolbar -> Select 'iPhone 12' or 'Pixel 5'. Ensure UI is touch-friendly.

### Phase 1 Rules & Constraints
- **Challenge Limits**: User can attempt all 3 challenges, but:
    - Only the **first solved challenge** affects streak & traits.
- **Chat Room Access**: Accessible **only after solving** the specific challenge.
- **Trait Updates**: Deterministic logic based on challenge type (e.g., Logic Puzzle -> Logic +1). No randomness.
- **Coins**: Cosmetic use only (Phase 1). No economic impact on gameplay.

### Known Limitations (MVP)
- **No Friends System**: Amigo requests not yet implemented.
- **No Private Rooms**: Only public challenge rooms exist.
- **No Emoji Economy**: Coins gather but cannot be spent yet.
- **No Admin Dashboard**: Management must be done via DB scripts.
- **No Moderation Tools**: Relying on honor system for Phase 1.
- **No Club System**: Clubs feature locked until Phase 3.

### Mobile Testing Notes
> [!IMPORTANT]
> **Mobile-First Validation**: Always validate logic and UI on a mobile viewport simulator. The application is designed for touch interactions and vertical scrolling.
