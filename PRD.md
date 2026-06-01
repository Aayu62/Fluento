# Fluento - Product Requirements Document (PRD)

Version: 1.0

Status: Approved for MVP Development

Author: Founding Team

---

# 1. Executive Summary

Fluento is an AI-powered communication training platform that helps users improve their spoken communication skills through realistic practice and personalized feedback.

Unlike traditional language-learning applications that focus on grammar lessons, vocabulary memorization, and passive content consumption, Fluento focuses on active communication training.

Users improve through:

* Scheduled AI voice calls
* Image description challenges
* Speaking topic challenges
* Personalized communication feedback
* Progress tracking
* Daily streaks

Fluento positions communication as a trainable skill similar to fitness.

The platform aims to become the "Duolingo for Communication" while maintaining a professional, premium, and career-oriented experience.

---

# 2. Product Vision

To become the world's most effective communication training platform.

Fluento helps users practice real conversations, build confidence, improve fluency, and communicate effectively in professional and everyday situations.

---

# 3. Mission Statement

Practice Real Conversations.
Build Real Confidence.

---

# 4. Problem Statement

Millions of people understand English but struggle to communicate confidently.

Common challenges include:

* Fear of speaking
* Lack of real conversation practice
* Interview anxiety
* Difficulty expressing ideas
* Weak vocabulary recall during conversations
* Limited opportunities for feedback

Current solutions primarily teach language.

Very few solutions train communication.

Fluento bridges this gap.

---

# 5. Target Audience

## Primary Users

### Students

Age: 16-25

Goals:

* Improve speaking confidence
* Crack interviews
* Improve communication skills

---

### Job Seekers

Goals:

* Interview preparation
* HR round preparation
* Improve self-introduction

---

### Working Professionals

Goals:

* Better workplace communication
* Client interactions
* Meetings and presentations

---

### Non-Native English Speakers

Goals:

* Improve fluency
* Reduce hesitation
* Build confidence

---

# 6. Product Principles

## Communication First

The product trains communication, not grammar memorization.

---

## Practice Over Theory

Users should spend most of their time speaking and practicing.

---

## Consistency Beats Intensity

Daily practice is more important than occasional long sessions.

---

## Feedback Must Be Actionable

Every session should tell users:

* What they did well
* What they should improve
* How to improve

---

## Beautiful Learning Experience

The product should feel like a premium learning journal rather than a generic SaaS dashboard.

---

# 7. Design Philosophy

## Visual Inspiration

Inspired by WhyTheWorld.

The interface should resemble:

* A beautifully designed book
* A communication journal
* A learning atlas

Not:

* A chatbot
* A generic AI SaaS product
* A language-learning game

---

## Theme

Light Theme Only

Characteristics:

* Warm paper backgrounds
* Deep navy typography
* Burnt orange accents
* Elegant serif headings
* Editorial layouts
* Notebook-inspired structure

---

## Emotional Goal

Users should feel:

* Calm
* Focused
* Motivated
* Improving every day

---

# 8. MVP Features

---

# FEATURE 1

## Scheduled AI Voice Calls

### Objective

Provide realistic communication practice through AI-powered conversations.

---

## Supported Scenarios

### Interview Practice

Examples:

* Software Engineer Interview
* HR Interview
* Product Manager Interview

---

### Sales Practice

Examples:

* Sell a Java Course
* Sell a SaaS Product

---

### Daily Conversation

Examples:

* Hobbies
* Travel
* Weekend Plans

---

## User Flow

1. User selects scenario
2. User selects date and time
3. Session is scheduled
4. Notification appears at scheduled time
5. User accepts call
6. Conversation starts
7. Feedback report generated

---

## Incoming Call Experience

Notification:

Sarah (HR Manager) is calling...

Actions:

* Accept
* Decline

Accept opens call screen.

Decline dismisses session.

---

## Call Interface

Display:

* AI persona
* Call duration
* End call button
* Speaker toggle
* Microphone status

---

## Post Call Feedback

Metrics:

* Fluency
* Grammar
* Vocabulary
* Confidence
* Communication Effectiveness

---

# FEATURE 2

## Image Description Challenge

### Objective

Improve observation, vocabulary, and descriptive communication skills.

---

## Input Types

### Voice

Record response.

---

### Text

Type response.

---

## Challenge Modes

### Standard Description

Describe image freely.

---

### Forbidden Words

Example:

Do not use:

* river
* water

---

### Emotion Mode

Describe image as:

* Exciting
* Peaceful
* Lonely
* Sad

---

### Perspective Mode

Describe image as:

* Journalist
* Child
* Travel Blogger
* Teacher

---

## Evaluation Areas

### Observation Skills

### Fluency

### Grammar

### Vocabulary

### Expressiveness

---

# FEATURE 3

## Speaking Topic Challenge

### Objective

Improve spontaneous communication.

---

## Categories

### Personal

* My Dream Job
* My Hometown

---

### Professional

* Why Should We Hire You

---

### Opinion

* AI in Education
* Social Media Impact

---

## Modes

### Monologue

Speak continuously.

---

### Quick Thinking

30-second preparation.

---

### Debate Mode

AI challenges user's viewpoint.

---

## Evaluation Areas

### Communication Clarity

### Vocabulary

### Grammar

### Fluency

### Argument Strength

---

# FEATURE 4

## Progress Journal

### Objective

Show measurable communication growth.

---

## Metrics

### Fluency Score

Measures speaking smoothness.

---

### Grammar Score

Measures correctness.

---

### Vocabulary Score

Measures word variety.

---

### Observation Score

Measures ability to identify important details.

---

### Expressiveness Score

Measures creativity and emotional depth.

---

## Visualizations

### Daily Progress

### Weekly Progress

### Monthly Progress

### Historical Trends

---

# FEATURE 5

## Streak System

### Objective

Encourage consistency.

---

## Rules

Practice completed today:

+1 streak

Missed day:

Reset streak

---

## Display

Current Streak

Best Streak

Practice Calendar

---

# 9. AI Evaluation Framework

## Speech Processing

Voice

↓

Speech-to-Text

↓

Analysis Engine

↓

Feedback Report

---

## Evaluation Categories

### Fluency

* Speaking speed
* Hesitations
* Fillers

---

### Grammar

* Tenses
* Articles
* Sentence structure

---

### Vocabulary

* Repetition
* Diversity
* Sophistication

---

### Observation Skills

* Scene understanding
* Important details

---

### Expressiveness

* Emotional richness
* Creativity

---

# 10. Content Architecture

## Voice Call Scenarios

Stored in database.

Each scenario contains:

* Persona
* Goal
* Difficulty
* Conversation rules

---

## Speaking Topics

Stored in database.

Each topic contains:

* Category
* Difficulty
* Prompt

---

## Images

Stored in database with metadata.

Metadata includes:

* Scene type
* Primary objects
* Secondary objects
* Activities
* Relationships
* Atmosphere
* Reference description
* Difficulty

Vision analysis occurs only once during image ingestion.

---

# 11. Success Metrics

## Product Metrics

* Daily Active Users
* Weekly Active Users
* Monthly Active Users

---

## Engagement Metrics

* Calls Completed
* Challenges Completed
* Average Session Length

---

## Retention Metrics

* Day 7 Retention
* Day 30 Retention

---

## Learning Metrics

Average improvement in:

* Fluency
* Grammar
* Vocabulary
* Observation
* Expressiveness

---

# 12. MVP Scope

Included:

✅ Scheduled AI Voice Calls

✅ Image Description Challenge

✅ Speaking Topic Challenge

✅ AI Feedback

✅ Progress Dashboard

✅ Streak System

✅ Mobile App

✅ Web App

---

Excluded:

❌ Real Telecom Calls

❌ Group Discussions

❌ Live Human Tutors

❌ Marketplace

❌ Certification

❌ Community Features

---

# 13. Long-Term Vision

Fluento becomes the world's leading communication training platform.

Future capabilities:

* Company-specific interview preparation
* Resume-aware mock interviews
* Public speaking coaching
* Presentation practice
* Sales training
* Customer support training
* AI communication mentor
* Communication certification

The long-term goal is to make communication training as structured, measurable, and habit-forming as physical fitness training.
