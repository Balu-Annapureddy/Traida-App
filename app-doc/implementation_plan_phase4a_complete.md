# Phase 4A Implementation Plan: Clubs (Backend & Governance)

## Goal Description
Implement the backend foundations for Communities (Clubs). This includes the database schema, API endpoints for creation/joining/messaging, and Admin governance APIs.
**Scope:** Backend Only. No Frontend UI components.

## User Review Required
> [!IMPORTANT]
> **Hardening Rules:**
> - `club_members`: UNIQUE(club_id, user_id).
> - **Isolation:** Club data must NEVER be exposed in global/profile APIs.
> - **Admin:** Rejection keeps club row (Status: REJECTED) but clears messages (if any).

## Proposed Changes

### Database
#### [NEW] [Tables]
- **`clubs`**: `id`, `name`, `description`, `creator_id`, `is_private` (0/1), `status` ('PENDING','ACTIVE','REJECTED'), `created_at`.
- **`club_members`**: `club_id`, `user_id`, `role` ('CREATOR','MODERATOR','MEMBER'), `joined_at`. **UNIQUE(club_id, user_id)**.
- **`club_join_requests`**: `id`, `club_id`, `user_id`, `status` ('PENDING','APPROVED','REJECTED'), `created_at`.
- **`club_messages`**: `id`, `club_id`, `user_id`, `content`, `timestamp`.

### Backend (API)
#### [NEW] [api/clubs/create/route.ts]
- `POST`: Create Club.
  - Cost: 5 SP (Deduct immediately).
  - Validation: Name uniqueness.
  - Action: Insert Club (PENDING), Insert Creator (CREATOR).

#### [NEW] [api/clubs/[id]/join/route.ts]
- `POST`: Join Club.
  - Logic: Public clubs only (for now).
  - Checks: Max 2 clubs/user, Max 30 members/club.
  - Action: Insert `club_members`.

#### [NEW] [api/clubs/[id]/messages/route.ts]
- `GET`: Fetch messages (Auth: Member only).
- `POST`: Send message (Auth: Member only, Rate Limits apply).

#### [NEW] [api/admin/clubs/pending/route.ts]
- `GET`: List clubs with status 'PENDING'.

#### [NEW] [api/admin/clubs/[id]/approve/route.ts] & [reject/route.ts]
- `POST`: Approve (Set ACTIVE).
- `POST`: Reject (Set REJECTED, Refund 5 SP, Log Transaction).

## Verification Plan
### Automated Tests
- **Create**: Verify SP deduction and DB row creation.
- **Approve/Reject**: Verify Status update and SP Refund (on reject).
- **Join**: Verify Limits (30 members, 2 clubs).
- **Chat**: Verify member-only access.
