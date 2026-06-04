# PHASE_ROADMAP_AUDIT.md

## Authoritative Phase Roadmap
The authoritative phase roadmap is defined by IMPLEMENTATION.md. It explicitly enumerates the product phases and is the highest-level source for phase sequencing. PRD.md and FSD.md describe product requirements and functional behavior, while TDD.md describes architectural and technical details that should align with the roadmap.

---

## Phase 1
- **Phase name:** Project Setup
- **Objective:** Establish the monorepo, package/workspace infrastructure, base config, and initial app scaffolding.
- **Deliverables:**
  - package.json, pnpm-workspace.yaml, turbo.json, tsconfig.base.json
  - api, web, mobile, shared project structure
  - base NestJS, Next.js, Expo configs
- **Dependencies:** None

## Phase 2
- **Phase name:** Authentication
- **Objective:** Build user registration, login, auth flows, and secure access control.
- **Deliverables:**
  - Auth API module
  - Supabase auth integration
  - Login/register/onboarding UI
  - Guarded routes and auth state
- **Dependencies:** Phase 1

## Phase 3
- **Phase name:** Database
- **Objective:** Implement core database schema and persistence for users, calls, sessions, images, topics, and notifications.
- **Deliverables:**
  - Supabase/PostgreSQL schema
  - migrations for users, scores, streaks, calls, session reports, images, topics, push tokens
  - database access layer
- **Dependencies:** Phase 2

## Phase 4
- **Phase name:** Core Backend APIs
- **Objective:** Build core API endpoints for scheduling, calls, content, and supporting backend services.
- **Deliverables:**
  - Calls API
  - Notifications registration API
  - Topics alias endpoints
  - Admin guard and controller
  - shared schemas/types
- **Dependencies:** Phases 2, 3

## Phase 5
- **Phase name:** UI Framework
- **Objective:** Establish the web and mobile UI foundation, theme, layout, and reusable UI primitives.
- **Deliverables:**
  - Web shell and layout
  - Tailwind theme and global styles
  - React Query provider
  - UI primitives (button, input, label)
  - Mobile app shell and auth gating
  - Basic home/auth screens
- **Dependencies:** Phase 4

## Phase 6
- **Phase name:** Dashboard
- **Objective:** Deliver the core dashboard experience with progress, upcoming sessions, and recommendations.
- **Deliverables:**
  - Web dashboard page
  - Dashboard sections: streak, scores, upcoming sessions, recent activity
  - Mobile dashboard parity
- **Dependencies:** Phase 5

## Phase 7
- **Phase name:** Voice Calls
- **Objective:** Enable live AI voice call sessions, accept/decline flow, call runtime, and feedback generation.
- **Deliverables:**
  - Call scheduling UI
  - Incoming call notification handling
  - Call screen, audio controls, end-call flow
  - Session evaluation/report generation
- **Dependencies:** Phase 6

## Phase 8
- **Phase name:** Image Studies
- **Objective:** Add image description challenges with evaluation.
- **Deliverables:**
  - Image challenge screens
  - Image metadata and prompt modes
  - Voice/text response capture
  - Evaluation feedback
- **Dependencies:** Phase 6

## Phase 9
- **Phase name:** Thought Exercises
- **Objective:** Add speaking topic challenges and spontaneous speaking practice.
- **Deliverables:**
  - Topic selection UI
  - Challenge prompt handling
  - Response capture
  - Feedback generation
- **Dependencies:** Phase 6

## Phase 10
- **Phase name:** Progress Journal
- **Objective:** Build progress tracking, reports, and learning journal features.
- **Deliverables:**
  - Progress views
  - Session history
  - Score charts and recommendations
- **Dependencies:** Phases 6–9

## Phase 11
- **Phase name:** Streak System
- **Objective:** Implement streak tracking and daily consistency features.
- **Deliverables:**
  - Streak state tracking
  - Streak calendar/notifications
  - Rewards or milestones
- **Dependencies:** Phase 10

## Phase 12
- **Phase name:** Notifications
- **Objective:** Implement full push notification delivery for scheduled calls and reminders.
- **Deliverables:**
  - Push provider integration (Expo/FCM/APNs)
  - Scheduled notification queue/worker
  - Accept/decline notification actions
  - Notification reliability/retry
- **Dependencies:** Phases 7, 8, 9, 11

## Phase 13
- **Phase name:** AI Integration
- **Objective:** Integrate the AI stack for speech recognition, response generation, and TTS.
- **Deliverables:**
  - Whisper transcription
  - Qwen response generation
  - Piper TTS
  - AI call automation pipeline
- **Dependencies:** Phases 7, 12

## Phase 14
- **Phase name:** Testing
- **Objective:** Add comprehensive automated tests and validation across the system.
- **Deliverables:**
  - Unit tests
  - Integration tests
  - E2E tests
  - Test harness configuration
- **Dependencies:** Phases 1–13

## Phase 15
- **Phase name:** Deployment
- **Objective:** Deploy the application to production infrastructure.
- **Deliverables:**
  - Dockerization
  - Hosting config for web, mobile, API
  - CI/CD pipeline
- **Dependencies:** Phases 1–14

---

> Note: The repo currently also contains early phase 12 notification work, which should be marked as future-phase implementation if retained.