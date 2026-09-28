---
name: mobile-ui
description: Mobile UI and UX standards for the gym tracking application. Use when designing screens, components, navigation, animations, forms, charts, workout interfaces or responsive mobile layouts.
---

# MOBILE UI SKILL

## PRODUCT FEEL

The application should feel:

* premium
* focused
* athletic
* modern
* calm
* fast
* reliable

Avoid generic AI-generated interfaces.

---

## MOBILE-FIRST

Design for phones first.

Primary interactions should be comfortable with one hand.

Important controls should have sufficiently large touch targets.

Avoid requiring precision taps.

---

## ACTIVE WORKOUT PRIORITY

The active workout screen must prioritize:

1. current exercise
2. current set
3. weight
4. reps
5. completion
6. previous performance
7. rest timer

Everything else is secondary.

---

## VISUAL HIERARCHY

Use a clear hierarchy:

Primary:

* current exercise
* current set
* completion action

Secondary:

* previous performance
* RIR
* RPE
* rest

Tertiary:

* notes
* advanced options
* metadata

---

## COMPONENT SYSTEM

Create reusable components instead of duplicated UI.

Examples:

* AppButton
* AppInput
* NumberInput
* WeightInput
* RepInput
* ExerciseCard
* SetRow
* WorkoutHeader
* RestTimer
* ProgressChart
* PRBadge
* RoutineCard
* EmptyState
* ErrorState
* LoadingState
* BottomSheet
* Modal

---

## STATES

Every important screen should consider:

loading
empty
error
offline
success

Avoid blank screens.

---

## DARK MODE

Dark mode must be intentionally designed.

Do not simply invert colors.

Pay attention to:

* contrast
* elevation
* borders
* text hierarchy
* disabled states
* chart readability

---

## LIGHT MODE

Light mode should use the same design system.

Do not create completely different component logic for themes.

---

## FORMS

Inputs for gym data should be optimized for numeric entry.

Weight:

[ 80.0 kg ]

Reps:

[ 8 ]

RIR:

[ 2 ]

Avoid opening unnecessary screens for simple data entry.

---

## ANIMATIONS

Use animation for:

* completing a set
* PR achievement
* navigation transitions
* timer transitions
* expanding/collapsing content

Do not animate everything.

Animations must never slow down workout logging.

---

## CHARTS

Charts should prioritize clarity.

Support:

* weight trend
* volume trend
* strength trend
* frequency
* body measurements

Always show meaningful labels and units.

Do not create decorative charts without useful information.

---

## ACCESSIBILITY

Support:

* screen readers
* sufficient contrast
* accessible labels
* large text where possible
* touch targets
* meaningful focus order

Never communicate important information through color alone.

---

## UX PRINCIPLE

For frequent actions:

REDUCE TAPS.

For dangerous/destructive actions:

ADD CONFIRMATION.

For obvious reversible actions:

PREFER UNDO OVER CONFIRMATION.
