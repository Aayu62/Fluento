# Fluento - Design System & UI/UX Specification

Version: 1.0

Status: Locked

Document Type: Design System

Product: Fluento

---

# 1. Design Vision

## Product Identity

Fluento is a communication training platform.

The experience should feel like:

* A personal communication handbook
* A learning journal
* A communication academy
* A lifelong skill-building companion

The interface should not feel like:

* A chatbot
* An AI tool
* A generic SaaS dashboard
* A language learning game

The goal is to create a timeless educational experience that encourages daily practice, reflection, and mastery.

---

# 2. Design Philosophy

## Communication is a Craft

Fluento treats communication as a skill that is developed through deliberate practice.

The interface should reinforce this philosophy.

Every screen should feel like part of a structured learning journey.

---

## Learning First

Content is always more important than interface decoration.

Users should focus on:

* Speaking
* Practicing
* Reflecting
* Improving

The UI should quietly support those goals.

---

## Calm Over Excitement

Many modern applications compete for attention.

Fluento should create focus.

Design decisions should reduce cognitive load and create a calm environment.

---

## Reflection Over Gamification

Progress should feel meaningful and earned.

The product should celebrate improvement without relying on excessive rewards, animations, or game mechanics.

---

## Timeless Design

Design choices should remain attractive and usable for years.

Avoid trends that may quickly become outdated.

---

# 3. Brand Personality

Fluento should feel like:

### Knowledgeable

Guides users through structured improvement.

---

### Encouraging

Supports growth without being overly cheerful.

---

### Professional

Useful for students, professionals, and job seekers.

---

### Trustworthy

Users should trust both the feedback and the learning process.

---

### Thoughtful

The interface should encourage deliberate practice.

---

# 4. Visual Language

## Design Style

Editorial Learning Experience

Characteristics:

* Structured layouts
* Strong typography
* Reading-focused design
* Learning-oriented presentation
* Journal-like organization
* Minimal visual noise

---

## Visual Metaphor

The application should feel like:

* A communication handbook
* A study journal
* A learning atlas
* A personal coaching notebook

---

# 5. Color System

## Primary Background

Warm Paper

```css
#F7F3EB
```

Purpose:

Primary application background.

---

## Secondary Background

```css
#F2EBDD
```

Purpose:

Panels, navigation areas, content sections.

---

## Primary Text

Deep Navy

```css
#17324D
```

Purpose:

Headings, navigation, primary content.

---

## Accent Color

Burnt Orange

```css
#C4623B
```

Purpose:

Active states, highlights, progress indicators.

---

## Success Color

Muted Green

```css
#5D8A6A
```

Purpose:

Achievements, progress improvements, streaks.

---

## Border Color

```css
#D8D0C0
```

Purpose:

Grid lines, dividers, card outlines.

---

## Warning Color

```css
#C98A2E
```

---

## Error Color

```css
#B85450
```

---

# 6. Typography System

## Typography Philosophy

Typography is the primary visual element of the product.

Text should carry hierarchy, emotion, and structure.

---

# Headings

Primary Typeface:

Libre Baskerville

Fallback:

Georgia

```css
font-family: "Libre Baskerville", serif;
```

Usage:

* Page titles
* Section headings
* Callout headings
* Important content

---

# Body Text

Primary Typeface:

IBM Plex Mono

Fallback:

Source Code Pro

```css
font-family: "IBM Plex Mono", monospace;
```

Usage:

* Navigation
* Labels
* Supporting text
* Metadata

---

# Reading Width

Maximum content width:

```css
700px
```

This improves readability during long sessions.

---

# Typography Scale

## Page Title

48px

Weight: Bold

---

## Section Title

32px

Weight: Semi-Bold

---

## Subsection Title

24px

Weight: Semi-Bold

---

## Body Text

18px

Line Height: 1.8

---

## Metadata

14px

Uppercase

Letter Spacing Increased

---

# 7. Layout System

## Application Layout

Desktop Structure

```text
┌─────────────────────────────────────┐
│ Top Navigation                      │
├──────────────┬──────────────────────┤
│ Sidebar      │ Main Content         │
│              │                      │
│ Learning     │ Current Page         │
│ Sections     │                      │
└──────────────┴──────────────────────┘
```

---

## Sidebar Width

Desktop

```css
320px
```

---

## Main Content Width

```css
max-width: 1000px;
```

---

## Vertical Rhythm

Use generous spacing.

Content should breathe.

Recommended spacing scale:

```css
8px
16px
24px
32px
48px
64px
```

---

# 8. Background Grid System

A subtle notebook-style grid should be visible throughout the application.

Purpose:

* Creates structure
* Reinforces journal aesthetic
* Improves visual identity

Implementation:

```css
background-size: 40px 40px;
opacity: 0.15;
```

Grid should never compete with content.

---

# 9. Navigation Design

## Top Navigation

Structure

```text
Fluento

Search

Calls
Practice
Progress
Profile
```

---

Height

```css
72px
```

---

Behavior

* Sticky
* Minimal
* Thin bottom border
* No heavy shadows

---

# Sidebar Navigation

Learning sections should be grouped like chapters.

Example:

```text
PART I

Voice Calls

PART II

Image Studies

PART III

Thought Exercises

PART IV

Progress Journal

PART V

Settings
```

---

# Active Navigation State

Active item:

* Navy background
* White text
* Rounded corners

Inactive items:

* Transparent
* Navy text

---

# 10. Dashboard Design

## Naming

Do not use:

Dashboard

Instead use:

```text
COMMUNICATION JOURNAL
```

---

# Dashboard Sections

## Today's Practice

Shows:

* Upcoming call
* Recommended challenge

---

## Communication Scores

Metrics:

* Fluency
* Grammar
* Vocabulary
* Observation
* Expressiveness

---

## Recent Sessions

Displays latest practice entries.

---

## Progress Journal

Shows historical growth.

---

## Streak Section

```text
CURRENT STREAK

14 Days
```

---

# 11. Voice Call Experience

## Incoming Call Screen

Display:

```text
COMMUNICATION SESSION

Sarah

HR Manager

Interview Practice
```

Buttons:

* Accept
* Decline

---

Style

* Paper card appearance
* Thin borders
* Elegant typography

---

# Active Call Screen

Display:

* Persona Name
* Persona Role
* Session Timer
* Live Transcript
* Audio Controls

---

The interface should resemble a guided coaching session rather than a traditional phone call screen.

---

# 12. Image Study Experience

## Naming

Use:

```text
IMAGE STUDY
```

Instead of:

```text
Image Challenge
```

---

# Layout

Left Side

Image

Right Side

Instructions

Response Area

---

Example

```text
IMAGE STUDY #24

Describe this image without using:

• river
• water
```

---

# Feedback Layout

Sections:

### Observations

### Vocabulary

### Grammar

### Expressiveness

### Missed Details

---

# 13. Thought Exercise Experience

## Naming

Use:

```text
THOUGHT EXERCISE
```

Instead of:

```text
Speaking Topic Challenge
```

---

Example

```text
TOPIC #18

Should AI replace teachers?
```

---

Modes

* Monologue
* Quick Thinking
* Debate

---

# 14. Progress Journal

## Purpose

Progress should feel documented.

Not gamified.

---

Structure

```text
PART I

January Progress

PART II

February Progress
```

---

Example Entry

```text
May 24

Interview Practice

Fluency +3

Grammar +2
```

---

# 15. Data Visualization

## Philosophy

Charts should resemble educational publications.

---

Requirements

* Thin lines
* Minimal colors
* Clean axes
* No gradients
* No 3D effects

---

Preferred Colors

* Navy
* Burnt Orange
* Muted Green

---

# 16. Cards

## Philosophy

Cards should feel like paper sections.

---

Border

```css
1px solid #D8D0C0
```

---

Radius

```css
16px
```

---

Shadow

Extremely subtle.

Nearly invisible.

---

# 17. Buttons

## Primary Button

Background:

Burnt Orange

Text:

White

---

## Secondary Button

Background:

Transparent

Border:

Deep Navy

Text:

Deep Navy

---

## Hover State

Subtle color shift.

No large movement.

---

# 18. Motion Design

## Philosophy

Motion should guide attention.

Never distract.

---

Allowed

* Fade
* Slide
* Expand

---

Avoid

* Bounce
* Flash
* Oversized transitions
* Attention-seeking effects

---

# 19. Mobile Experience

## Design Goal

The application should feel like carrying a personal communication handbook.

---

Bottom Navigation

```text
Home

Calls

Practice

Progress

Profile
```

---

Preserve:

* Editorial layouts
* Typography hierarchy
* Journal aesthetic

---

# 20. Empty States

Example

```text
YOUR JOURNAL IS WAITING

Complete your first communication exercise.
```

---

Avoid generic system messages.

---

# 21. Illustration Style

Use:

* Editorial symbols
* Simple line art
* Minimal decorative elements

---

Avoid:

* Robots
* Futuristic AI graphics
* Cartoon mascots
* 3D illustrations

---

# 22. Accessibility Standards

Requirements:

* WCAG AA compliance
* Keyboard navigation
* Screen reader support
* Adjustable text scaling
* High contrast compatibility

---

# 23. Design North Star

Fluento should feel like opening a beautifully crafted communication handbook every day.

Users should feel they are building a lifelong skill through structured practice, thoughtful feedback, and consistent reflection.

If a design decision makes Fluento look like a generic SaaS dashboard, it is likely the wrong decision.

If a design decision makes Fluento feel like a premium communication journal, it is likely the correct decision.

# End of DESIGN.md
