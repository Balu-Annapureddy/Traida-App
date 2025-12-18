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
- **Limitation**: Admins cannot modify rankings or traits arbitrarily

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

### Phase 2 — Stability & Safety
- Moderation, Reporting, Rate limiting, Admin dashboard

### Phase 3 — Social Depth
- Amigos, DMs, Club system

### Phase 4 — Economy & Cosmetics
- Emojis, Avatars, Card customization

### Phase 5 — Insights
- Weekly/monthly reports, Personality evolution

### Phase 6 — Scale & Polish
- DB migration, Performance, PWA support

### Phase 7 — Monetization (Locked)
- Premium features (UI only), Payments marked “Coming Soon”

## 15. GOVERNANCE RULE
- This document is the single source of truth.
- Any feature not listed here must be explicitly approved before implementation.
- All development tasks must reference this document.
