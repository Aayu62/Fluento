# Fluento - Functional Specification Document (FSD)

Version: 1.0

Status: Approved for MVP Development

Related Document:
PRD v1.0

---

# 1. Introduction

## Purpose

This document defines the detailed functional behavior of all MVP features within Fluento.

It specifies:

* User workflows
* Screen behavior
* Business rules
* System actions
* Validation requirements
* Success criteria

---

# 2. User Roles

## Student/User

Primary platform user.

Permissions:

* Register account
* Schedule AI calls
* Complete challenges
* View progress
* Manage profile

---

## Admin

Internal content manager.

Permissions:

* Upload images
* Create speaking topics
* Create call scenarios
* View analytics

---

# 3. Authentication Module

## Registration

Supported Methods:

### Email + Password

Required Fields:

* Full Name
* Email
* Password

Validation:

* Email must be unique
* Password minimum 8 characters

---

### Google Login

Supported.

User record automatically created.

---

## Login

Fields:

* Email
* Password

Validation:

* Correct credentials required

---

## Forgot Password

User submits email.

Reset link sent.

---

# 4. Onboarding Module

## First-Time User Flow

After signup:

### Screen 1

Welcome to Fluento

Purpose:

Introduce platform.

---

### Screen 2

Goal Selection

Options:

* Interview Preparation
* Improve Fluency
* Sales Practice
* General Communication

User may select multiple.

---

### Screen 3

Skill Assessment

User self-rates:

* Beginner
* Intermediate
* Advanced

---

### Screen 4

Dashboard Entry

Profile initialized.

Initial scores:

50/100 baseline.

---

# 5. Dashboard Module

## Overview

Landing page after login.

Acts as central hub.

---

## Dashboard Sections

### Current Streak

Display:

Current Streak

Best Streak

---

### Communication Scores

Display:

* Fluency
* Grammar
* Vocabulary
* Observation
* Expressiveness

---

### Upcoming Sessions

Display next scheduled AI call.

Fields:

* Persona
* Scenario
* Date
* Time

---

### Recommended Challenges

Generated based on:

* Weakest skill
* Recent performance

---

### Recent Activity

Display last 10 activities.

---

# 6. AI Voice Calls Module

## Purpose

Provide roleplay-based speaking practice.

---

# 6.1 Schedule Call

## User Flow

User clicks:

Schedule Call

---

### Step 1

Select Category

Options:

* Interview
* Sales
* Daily Conversation

Required.

---

### Step 2

Select Scenario

Example:

Interview

↓

Software Engineer Interview

---

### Step 3

Select Date

Required.

Past dates not allowed.

---

### Step 4

Select Time

Required.

---

### Step 5

Confirm Schedule

System creates session.

Status:

Scheduled

---

# 6.2 Scheduled Notification

At scheduled time:

System sends push notification.

---

Notification Content

Sarah (HR Manager) is calling...

Actions:

* Accept
* Decline

---

# 6.3 Accept Action

If user accepts:

Application opens call screen.

Session status:

Active

---

# 6.4 Decline Action

Session status:

Missed

Notification dismissed.

No call begins.

---

# 6.5 Call Screen

Display:

* Persona Name
* Persona Role
* Call Timer
* Microphone Indicator
* Speaker Toggle
* End Call Button

---

## Speaker Toggle

Modes:

### Speaker

Audio routed to loudspeaker.

---

### Earpiece

Audio routed to earpiece.

---

# 6.6 Conversation Flow

AI always initiates conversation.

Example:

HR Manager:

"Tell me about yourself."

---

User responds.

Speech captured.

Speech converted to text.

AI generates next response.

Conversation continues.

---

# 6.7 End Call

Call ends when:

* User presses End Call
* Scenario completes
* Timeout reached

Default timeout:

20 minutes

---

# 6.8 Post Call Report

Generated automatically.

Display:

### Fluency Score

### Grammar Score

### Vocabulary Score

### Confidence Score

### Communication Effectiveness Score

---

Feedback Sections:

Strengths

Improvements

Recommended Exercises

---

# 7. Image Description Challenge Module

## Purpose

Improve descriptive communication.

---

# 7.1 Challenge Types

### Standard Mode

Describe image freely.

---

### Forbidden Word Mode

System displays restricted words.

Example:

Do not use:

* river
* water

---

### Emotion Mode

System provides emotion.

Example:

Describe image as peaceful.

---

### Perspective Mode

System provides role.

Example:

Describe image as a journalist.

---

# 7.2 Challenge Flow

User selects challenge.

System loads image.

Prompt displayed.

---

User chooses:

### Speak

or

### Type

---

# 7.3 Voice Submission

User records answer.

Speech converted to text.

Evaluation begins.

---

# 7.4 Text Submission

User submits text.

Evaluation begins.

---

# 7.5 Evaluation Engine

Inputs:

* User response
* Image metadata
* Challenge type

Outputs:

* Observation score
* Grammar score
* Vocabulary score
* Expressiveness score

---

# 7.6 Feedback Screen

Display:

### Overall Score

### Strengths

### Missing Observations

### Better Vocabulary Suggestions

### Grammar Corrections

---

# 8. Speaking Topic Challenge Module

## Purpose

Improve spontaneous communication.

---

# 8.1 Categories

### Personal

### Professional

### Opinion

### General

---

# 8.2 Modes

### Monologue

Continuous speaking.

---

### Quick Thinking

30-second preparation timer.

---

### Debate

AI challenges user position.

---

# 8.3 Submission Types

### Voice

### Text

---

# 8.4 Evaluation

Metrics:

* Fluency
* Grammar
* Vocabulary
* Clarity
* Argument Strength

---

# 9. Progress Journal Module

## Purpose

Track communication improvement.

---

# 9.1 Score Tracking

Tracked Metrics:

* Fluency
* Grammar
* Vocabulary
* Observation
* Expressiveness

---

# 9.2 Time Views

### Daily

### Weekly

### Monthly

### All-Time

---

# 9.3 Trend Visualization

Display:

* Score trends
* Growth percentages
* Personal bests

---

# 10. Streak Module

## Purpose

Encourage consistency.

---

# 10.1 Streak Rules

A day counts as completed when user finishes at least one:

* AI Call
* Image Challenge
* Speaking Challenge

---

# 10.2 Streak Increment

Completed practice:

Current Streak +1

---

# 10.3 Streak Reset

No activity for one calendar day:

Current Streak = 0

---

# 10.4 Streak Display

Display:

Current Streak

Best Streak

Monthly Calendar

---

# 11. Admin Content Management

## Image Management

Admin can:

* Upload image
* Edit image
* Delete image

---

## Automatic Image Processing

Upon upload:

Vision model generates:

* Scene Type
* Primary Objects
* Secondary Objects
* Activities
* Relationships
* Atmosphere
* Reference Description
* Advanced Description

Stored in database.

---

## Topic Management

Admin can:

* Create topic
* Edit topic
* Delete topic

---

## Scenario Management

Admin can:

* Create call scenario
* Edit scenario
* Delete scenario

---

# 12. Notification System

## Supported Notifications

### Scheduled Call Reminder

### Streak Reminder

### Practice Recommendation

---

# 13. Error Handling

## Speech Recognition Failure

Display:

"Could not understand your speech. Please try again."

---

## Network Failure

Display:

"Connection lost. Please reconnect."

---

## Evaluation Failure

Display:

"Unable to generate feedback at the moment."

Retry available.

---

# 14. Accessibility

Requirements:

* Keyboard navigation
* Screen reader support
* Adjustable text size
* High contrast compatibility

---

# 15. Audit Events

Track:

* Login
* Logout
* Challenge Completion
* Call Completion
* Score Updates
* Streak Updates

---

# 16. Acceptance Criteria

MVP is considered complete when:

✓ Users can register and login

✓ Users can schedule AI calls

✓ Incoming call notification works

✓ Voice conversations function correctly

✓ Image challenges evaluate correctly

✓ Speaking topic challenges evaluate correctly

✓ Progress dashboard updates automatically

✓ Streak system works correctly

✓ Feedback reports generate successfully

✓ Mobile and Web versions achieve feature parity

End of FSD v1.0
