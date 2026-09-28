---
name: qa
description: Quality assurance and testing procedures for the gym application. Use when validating features, writing tests, debugging regressions, reviewing UI or preparing releases.
---

# QA SKILL

Never consider a feature complete because it compiles.

---

## QUALITY CHECK

For every feature verify:

### Functional

* happy path
* invalid input
* empty state
* loading
* error
* offline

### UI

* small phone
* large phone
* dark mode
* light mode
* keyboard
* scrolling
* touch targets
* accessibility

### Data

* create
* read
* update
* delete where appropriate
* persistence
* restart
* synchronization

---

## AUTOMATED TESTING

Prefer tests for deterministic business logic.

Examples:

* calculateVolume()
* calculateEstimated1RM()
* detectPR()
* convertWeight()
* calculateWorkoutDuration()
* calculateProgress()

---

## INTEGRATION TESTS

Test important flows:

Create routine
→ add exercise
→ save routine

Start workout
→ complete set
→ complete workout
→ inspect history

Add body weight
→ save
→ reopen
→ inspect chart

---

## E2E

At minimum test the critical workout journey:

Open app
→ start routine
→ perform exercise
→ complete sets
→ finish workout
→ inspect workout history

---

## REGRESSION

Before modifying an important shared component:

identify what other features use it.

After modification:

run relevant tests.

---

## BUG FIXING

When fixing a bug:

1. reproduce
2. identify root cause
3. create regression test
4. fix
5. run regression tests
6. verify related functionality

Do not merely patch the visible symptom.

---

## PERFORMANCE

Watch for:

* unnecessary renders
* giant lists
* expensive charts
* excessive database calls
* image memory usage
* slow startup

Do not prematurely optimize.

Measure where possible.

---

## RELEASE CHECKLIST

Before release:

* typecheck
* lint
* unit tests
* integration tests
* E2E where available
* production build
* environment variables checked
* no secrets committed
* migrations checked
* crash/error handling checked
* offline workout flow checked
* authentication checked
* data export checked

---

## FINAL QA PRINCIPLE

Ask:

"Would I trust this application with six months of my workout history?"

If the answer is not clearly yes, investigate what is missing.
