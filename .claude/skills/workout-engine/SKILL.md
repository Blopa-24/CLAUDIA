---
name: workout-engine
description: Workout session engine for starting, tracking, saving and completing gym workouts. Use when implementing active workouts, sets, rest timers, supersets, progression, history or workout persistence.
---

# WORKOUT ENGINE SKILL

The workout engine is a core domain system.

It must be reliable even when the device is offline.

---

## CORE FLOW

Routine:

planned workout structure

↓

Workout Session:

actual workout instance

↓

Workout Exercise:

actual exercise performed

↓

Set:

actual performance

---

## SESSION STATES

A workout session may be:

* planned
* active
* paused
* completed
* abandoned

Avoid deleting abandoned sessions automatically.

---

## START WORKOUT

When a workout starts:

1. create session
2. snapshot routine information needed for historical accuracy
3. load exercises
4. load previous performance
5. initialize current position
6. persist immediately

The workout must survive application restarts.

---

## SET COMPLETION

When a set is completed:

1. validate input
2. persist immediately
3. update local state
4. update session statistics
5. check PR logic
6. trigger rest timer if configured
7. prepare next set

Never rely exclusively on an in-memory React state.

---

## PREVIOUS PERFORMANCE

For every exercise, show useful previous data when available.

Example:

Previous:
80 kg × 8
RIR 2

Current:
80 kg × __

Previous data must never overwrite current input.

---

## AUTO-SAVE

Workout data should save automatically.

The user should not need to press a global SAVE button after every set.

---

## REST TIMER

The timer should:

* start automatically if configured
* support pause
* support resume
* support skip
* support +15 seconds
* support -15 seconds
* optionally vibrate
* optionally play sound
* remain usable while navigating appropriate workout UI

Timer state must not destroy workout state.

---

## SUPERSETS

Support grouping:

A1
A2

The system must preserve ordering and grouping.

Completing A1 should not incorrectly mark A2 as completed.

---

## DROPSets

A dropset must be represented as a meaningful relationship between sets.

Do not treat every set as identical if the UI needs to represent dropset semantics.

---

## WARMUP SETS

Warm-up sets count separately from working sets.

Statistics should allow filtering or distinguishing them.

---

## AMRAP

AMRAP sets should support an open-ended rep count.

Do not enforce a maximum rep validation unless configured.

---

## WORKOUT COMPLETION

When finishing:

1. validate incomplete sets
2. allow user to decide whether to finish
3. persist completion timestamp
4. calculate session statistics
5. calculate PRs
6. update progress
7. mark sync state
8. show summary

Example summary:

Workout Complete

Duration
58 min

Exercises
7

Sets
23

Volume
8,420 kg

PRs
2

---

## INTERRUPTED WORKOUTS

If the app closes unexpectedly:

restore the active workout.

The user should not lose completed sets.

---

## OFFLINE

The workout engine must not depend on network availability.

Write locally first.

Synchronize later.

---

## HISTORY

Historical workout records must remain immutable unless the user explicitly edits historical data.

Changing a routine today must not rewrite yesterday's workout.

---

## TESTING

At minimum test:

* start session
* resume session
* complete set
* edit set
* pause
* finish
* abandoned session
* app restart
* offline persistence
* supersets
* PR detection
* workout summary
