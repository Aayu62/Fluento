# Fluento - Technical Design Document (TDD)

Version: 1.0

Status: Approved

Related Documents:

* PRD v1.0
* FSD v1.0

---

# 1. Overview

## Product

Fluento

## Description

Fluento is an AI-powered communication training platform that helps users improve communication skills through:

* AI Voice Calls
* Image Description Challenges
* Speaking Topic Challenges
* Personalized AI Feedback
* Progress Tracking
* Streak Management

Supported Platforms:

* Web Application
* Mobile Application

---

# 2. System Architecture

## High-Level Architecture

```text
                    ┌──────────────────┐
                    │  Web Application │
                    │    Next.js       │
                    └────────┬─────────┘
                             │

                    ┌────────▼─────────┐
                    │  API Gateway     │
                    │    NestJS        │
                    └────────┬─────────┘
                             │

        ┌────────────────────┼─────────────────────┐
        │                    │                     │

┌───────▼────────┐  ┌────────▼────────┐  ┌────────▼────────┐
│ PostgreSQL     │  │ AI Services     │  │ Notification    │
│ Supabase       │  │ Ollama Stack    │  │ Service         │
└────────────────┘  └─────────────────┘  └─────────────────┘

        │                    │
        │                    │
        │          ┌─────────▼─────────┐
        │          │ Faster Whisper    │
        │          └───────────────────┘
        │
        │          ┌─────────▼─────────┐
        │          │ Qwen              │
        │          └───────────────────┘
        │
        │          ┌─────────▼─────────┐
        │          │ Piper TTS         │
        │          └───────────────────┘

```

---

# 3. Technology Stack

## Frontend

### Web

Framework:

Next.js 15

Language:

TypeScript

Styling:

TailwindCSS

State Management:

Zustand

Data Fetching:

TanStack Query

Forms:

React Hook Form

Charts:

Recharts

---

### Mobile

Framework:

React Native

Platform:

Expo

Language:

TypeScript

State Management:

Zustand

Notifications:

Expo Notifications

---

# 4. Backend

Framework:

NestJS

Language:

TypeScript

Architecture:

Modular Monolith

---

## Modules

```text
Auth Module

User Module

Call Module

Challenge Module

Image Module

Topic Module

Evaluation Module

Progress Module

Notification Module

Admin Module
```

---

# 5. Database Design

Database:

PostgreSQL

Provider:

Supabase

---

# 5.1 Users Table

```sql
users
```

| Column     | Type      |
| ---------- | --------- |
| id         | uuid      |
| email      | varchar   |
| full_name  | varchar   |
| created_at | timestamp |
| updated_at | timestamp |

---

# 5.2 User Scores

```sql
user_scores
```

| Column         | Type      |
| -------------- | --------- |
| id             | uuid      |
| user_id        | uuid      |
| fluency        | numeric   |
| grammar        | numeric   |
| vocabulary     | numeric   |
| observation    | numeric   |
| expressiveness | numeric   |
| updated_at     | timestamp |

---

# 5.3 Streaks

```sql
user_streaks
```

| Column             | Type    |
| ------------------ | ------- |
| user_id            | uuid    |
| current_streak     | integer |
| best_streak        | integer |
| last_activity_date | date    |

---

# 5.4 Images

```sql
images
```

| Column     | Type      |
| ---------- | --------- |
| id         | uuid      |
| image_url  | text      |
| difficulty | varchar   |
| metadata   | jsonb     |
| created_at | timestamp |

---

# Example Metadata

```json
{
  "scene_type": "park",
  "primary_objects": [
    "trees",
    "bench",
    "dog"
  ],
  "secondary_objects": [
    "bicycle"
  ],
  "activities": [
    "walking"
  ],
  "relationships": [
    {
      "subject": "dog",
      "relation": "walking_with",
      "object": "person"
    }
  ],
  "atmosphere": [
    "peaceful"
  ],
  "reference_description": "...",
  "advanced_description": "..."
}
```

---

# 5.5 Speaking Topics

```sql
topics
```

| Column     | Type    |
| ---------- | ------- |
| id         | uuid    |
| title      | varchar |
| category   | varchar |
| difficulty | varchar |
| prompt     | text    |

---

# 5.6 Call Scenarios

```sql
call_scenarios
```

| Column          | Type    |
| --------------- | ------- |
| id              | uuid    |
| title           | varchar |
| category        | varchar |
| persona_name    | varchar |
| persona_role    | varchar |
| prompt_template | text    |

---

# 5.7 Scheduled Calls

```sql
scheduled_calls
```

| Column         | Type      |
| -------------- | --------- |
| id             | uuid      |
| user_id        | uuid      |
| scenario_id    | uuid      |
| scheduled_time | timestamp |
| status         | varchar   |

---

Status Values:

```text
scheduled

active

completed

missed

cancelled
```

---

# 5.8 Session Reports

```sql
session_reports
```

| Column       | Type      |
| ------------ | --------- |
| id           | uuid      |
| user_id      | uuid      |
| session_type | varchar   |
| score_json   | jsonb     |
| feedback     | text      |
| created_at   | timestamp |

---

# 6. Authentication

Provider:

Supabase Auth

---

Supported Methods

### Email + Password

### Google OAuth

---

Flow

```text
Client

↓

Supabase Auth

↓

JWT

↓

NestJS

↓

Protected APIs
```

---

# 7. AI Architecture

## Core AI Pipeline

```text
User Voice

↓

Whisper

↓

Transcript

↓

Qwen

↓

Response

↓

Piper

↓

Audio
```

---

# 8. Speech-to-Text Layer

Tool:

Faster Whisper

---

Responsibilities

* Voice transcription
* Timestamp generation
* Language detection

---

Input

```text
wav

mp3

m4a
```

---

Output

```json
{
  "text":"Hello..."
}
```

---

# 9. LLM Layer

Model

Qwen 3

Served Through

Ollama

---

Responsibilities

### AI Conversations

### Feedback Generation

### Grammar Evaluation

### Vocabulary Evaluation

### Speaking Assessment

### Image Challenge Evaluation

---

# 10. Text-to-Speech Layer

Tool

Piper TTS

---

Responsibilities

Convert AI response into audio.

---

Output

```text
wav
```

---

# 11. Voice Call Architecture

## Scheduling Flow

```text
User

↓

Schedule Call

↓

scheduled_calls table

↓

Notification Queue
```

---

## Execution Flow

```text
Scheduled Time

↓

Push Notification

↓

Accept

↓

Call Session Starts

↓

Conversation Engine

↓

Session Report
```

---

# 12. Image Ingestion Pipeline

## Upload Flow

```text
Admin Uploads Image

↓

Storage

↓

Vision Model

↓

Metadata Generation

↓

Database Storage
```

---

# Vision Processing Model

Recommended:

Qwen2.5-VL

---

Generated Data

### Scene Type

### Primary Objects

### Secondary Objects

### Activities

### Atmosphere

### Relationships

### Reference Description

### Advanced Description

---

# 13. Image Evaluation Pipeline

```text
Image Metadata

+

User Response

↓

Qwen

↓

Evaluation
```

---

Outputs

```json
{
  "observation":85,
  "grammar":76,
  "vocabulary":81,
  "expressiveness":72
}
```

---

# 14. Speaking Topic Evaluation Pipeline

```text
Prompt

↓

User Response

↓

Qwen

↓

Evaluation
```

---

Metrics

* Fluency
* Grammar
* Vocabulary
* Clarity
* Argument Quality

---

# 15. Progress Engine

## Purpose

Update communication scores.

---

Algorithm

Each session contributes weighted score updates.

Example:

```text
Old Fluency = 70

New Session = 80

Updated = 72
```

Weighted rolling average.

---

# 16. Notification System

## Provider

Expo Notifications

---

Notification Types

### Scheduled Call

### Practice Reminder

### Streak Reminder

---

Example

```text
Sarah (HR Manager) is calling...
```

Actions

```text
Accept

Decline
```

---

# 17. Storage Design

Provider

Supabase Storage

---

Buckets

```text
images

audio-recordings

generated-audio

reports
```

---

# 18. API Design

## Auth

```http
POST /auth/login

POST /auth/register

POST /auth/logout
```

---

## Calls

```http
POST /calls/schedule

GET /calls/upcoming

POST /calls/start

POST /calls/end
```

---

## Challenges

```http
GET /challenges/image

POST /challenges/image/submit

GET /topics/random

POST /topics/submit
```

---

## Progress

```http
GET /progress/dashboard

GET /progress/history
```

---

## Streak

```http
GET /streak
```

---

# 19. Deployment Architecture

## Frontend

Web

Vercel

---

Mobile

Expo EAS Build

---

## Backend

Dockerized NestJS

Hosted on:

* Railway
  or
* Render
  or
* VPS

---

## Database

Supabase

---

## AI Server

Dedicated GPU Machine

Hosts:

```text
Ollama

Qwen

Whisper

Piper
```

---

# 20. MVP Scalability Targets

Concurrent Users:

100

---

Daily Active Users:

1000

---

Monthly Active Users:

10000

---

Average Session Length:

10–20 minutes

---

# 21. Monitoring

Tools

Sentry

PostHog

---

Track

* API failures
* AI failures
* Notification failures
* User engagement
* Retention

---

# 22. Security

Requirements

* HTTPS only
* JWT authentication
* Rate limiting
* Input validation
* Secure file uploads

---

# 23. Future Architecture Extensions

Post-MVP

### Real-Time Voice Streaming

### Resume-Aware Interviews

### Company-Specific Interviews

### AI Coach Persona Marketplace

### Public Speaking Trainer

### Group Discussions

### Enterprise Training Platform

---

# End of Technical Design Document (TDD)

Fluento v1.0
