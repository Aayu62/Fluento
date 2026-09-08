# Fluento

## Overview

Fluento is an AI-powered communication training platform that helps users improve their spoken communication skills through realistic practice and personalized feedback.

Unlike traditional language-learning applications that focus on grammar lessons, vocabulary memorization, and passive content consumption, Fluento focuses on active communication training.

Users improve through:
- Scheduled AI voice calls
- Image description challenges
- Speaking topic challenges
- Personalized communication feedback
- Progress tracking
- Daily streaks

Fluento positions communication as a trainable skill similar to fitness.

## Tech Stack

### Backend
- **Framework:** NestJS 10 (Node.js & TypeScript)
- **Architecture:** Modular Monolith
- **Validation:** Zod (`@fluento/shared`)
- **API Documentation:** Swagger / OpenAPI

### Frontend
- **Framework:** Next.js 15 (React 19 & TypeScript)
- **Styling:** TailwindCSS (Editorial "Warm Paper" design system)
- **State Management:** Zustand
- **Data Fetching:** TanStack Query (React Query)
- **Forms:** React Hook Form

### Mobile
- **Framework:** React Native with Expo (TypeScript)
- **Navigation:** Expo Router (File-based routing)
- **State Management:** Zustand
- **Push Notifications:** Expo Notifications

### Database
- **Engine:** PostgreSQL (via Supabase)
- **Access Layer:** `@supabase/supabase-js` with Row-Level Security (RLS) policies

### AI Stack
- **Speech-to-Text:** Faster Whisper
- **LLM / Evaluation:** Qwen 3 via Ollama
- **Text-to-Speech:** Piper TTS
- **AI Gateway Server:** FastAPI (Python 3.11)

## Monorepo Structure

```text
fluento/
├── apps/
│   ├── api/          # NestJS backend API application
│   ├── mobile/       # React Native / Expo mobile app
│   └── web/          # Next.js 15 web application
├── packages/
│   └── shared/       # Shared TypeScript types, Zod schemas, and DTOs
├── docker/
│   ├── ai-server/    # Python FastAPI server for Whisper STT and Piper TTS
│   └── docker-compose.yml # Development environment composition
├── PRD.md            # Product Requirements Document
├── FSD.md            # Functional Specification Document
├── TDD.md            # Technical Design Document
├── Design.md         # Design System & UI/UX Specification
├── IMPLEMENTATION.md # Implementation Master Plan
├── PHASE_ROADMAP_AUDIT.md # Authoritative Phase Roadmap
├── Project_Governance.md  # Project Document Governance Rules
└── PROJECT_CURRENT_STATUS.md # Comprehensive Project Status & Phase Audit
```

## Prerequisites

- **Node.js:** `>= 20.0.0`
- **pnpm:** `9.15.9` (or `pnpm >= 9.0.0`)
- **Docker & Docker Compose:** Required for AI server and Ollama containers
- **Supabase Account / Local Supabase CLI:** Required for PostgreSQL database & Auth

## Environment Variables

The following environment variables are required across services. All variables listed below are extracted directly from codebase declarations without invention:

### Backend (`apps/api/.env`)
```env
PORT=3001
NODE_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_EMAILS=admin@fluento.app
AI_SERVER_URL=http://localhost:8000
WHISPER_MODEL=base
OLLAMA_URL=http://localhost:11434
QWEN_MODEL=qwen3:8b
PIPER_URL=http://localhost:5000
EXPO_ACCESS_TOKEN=your-expo-access-token
```

### Web Frontend (`apps/web/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Mobile App (`apps/mobile/.env`)
```env
API_URL=http://localhost:3001
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Installation

1. Install all monorepo dependencies:
   ```bash
   pnpm install
   ```

2. Build the shared package (required prior to running apps):
   ```bash
   pnpm build:shared
   ```

## Database Setup

1. Configure your Supabase project instance or local Supabase CLI database.
2. Execute the SQL database migration files in numerical order:
   - `apps/api/src/database/migrations/001_auth_and_users.sql`
   - `apps/api/src/database/migrations/002_content_and_sessions.sql`
   - `apps/api/src/database/migrations/003_fix_declined_to_missed.sql`
3. Execute the initial seed data script to populate default scenarios, topics, and images:
   - `apps/api/src/database/migrations/003_seed_data.sql`

## Running the Project

### Start All Applications (via Turborepo)
```bash
pnpm dev
```

### Run Backend API Only
```bash
pnpm dev:api
```
*(Runs NestJS API at `http://localhost:3001`)*

### Run Web Frontend Only
```bash
pnpm dev:web
```
*(Runs Next.js web application at `http://localhost:3000`)*

### Run Mobile App Only
```bash
pnpm dev:mobile
```
*(Starts Expo CLI for iOS / Android / Web)*

### Run Docker AI Services
```bash
cd docker
docker-compose up -d
```
*(Spins up Ollama container at port `11434` and AI Server container at port `8000`)*

## Testing

Run tests across the entire monorepo:
```bash
pnpm test
```

Run NestJS backend tests:
```bash
cd apps/api && pnpm test
```

## Build Commands

Build all monorepo apps and packages:
```bash
pnpm build
```

Build `@fluento/shared` package only:
```bash
pnpm build:shared
```

Run TypeScript type check:
```bash
pnpm type-check
```

Run ESLint code linting:
```bash
pnpm lint
```

## Deployment Notes

- **Backend API:** Designed to deploy on Node.js container environments (Docker, AWS ECS, Google Cloud Run, or Render).
- **Web Frontend:** Designed to deploy on Vercel or Node.js SSR hosts.
- **Mobile App:** Configured for Expo Application Services (EAS Build) targeting iOS App Store and Google Play Store.
- **AI Services:** Require GPU-enabled instances (e.g., RunPod, AWS EC2 GPU instances) executing Docker containers for Ollama (Qwen 3) and Python AI Server (Faster Whisper + Piper).

## Current Project Status

*(Summary generated from [`PROJECT_CURRENT_STATUS.md`](file:///c:/Users/KIIT0001/Fluento/PROJECT_CURRENT_STATUS.md))*

- **Last Completed Phase:** Phase 14 (Testing)
- **Current Active Phase:** Phase 15 (Deployment) - 0% Complete
- **Next Recommended Action:** Implement Phase 15 Deployment (Production Dockerization, Cloud hosting manifests, CI/CD pipeline)
- **Overall Completion Estimate:** ~93% of total roadmap (Phases 1–14 complete; Phase 15 unstarted/scaffolded)


