# Best XI Lock-In and Average Score Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend `BestElevenComponent` with per-slot player lock-in, average XI score display, and consistent 1-decimal score formatting.

**Architecture:** New `lockedPlayers` signal stores optional player UIDs per slot. A pure `buildConstrainedScoreMatrix` utility excludes locked players/slots from the matrix, letting Hungarian run on free slots only. Locked + free results are merged. A computed `averageScore` signal derives the mean.

**Tech Stack:** Angular 19 signals, PrimeNG p-select, Vitest, Angular `number` pipe

**Spec:** `_specs/best-xi-lock-in-average-score.md`

---

## Context

The Best XI feature uses the Hungarian algorithm to optimally assign 11 players to 11 formation slots. Currently there is no way to pin a player to a specific slot. Users want to lock specific players into slots while the algorithm optimizes the rest. Additionally, scores lack consistent formatting and there is no summary average score.

## Task 1: `buildConstrainedScoreMatrix` Utility Tests (RED)

**Files:**
- Modify: `fm-stats-angular/src/app/utils/score-matrix.spec.ts`

Write failing tests for `buildConstrainedScoreMatrix` with 3 test cases:
1. Excludes locked player and slot from matrix, returns correct mappings
2. Returns empty matrix when all slots are locked
3. Returns full matrix with identity mappings when no locks

## Task 2: Implement `buildConstrainedScoreMatrix` (GREEN)

**Files:**
- Modify: `fm-stats-angular/src/app/utils/score-matrix.ts`

Add `ConstrainedMatrixResult` interface and `buildConstrainedScoreMatrix` function.

## Task 3: Component Tests for Lock-In, Average Score, and Formatting (RED)

**Files:**
- Modify: `fm-stats-angular/src/app/components/best-eleven/best-eleven.component.spec.ts`

Write failing component tests for lock-in, average score display, score formatting, reset behavior.

## Task 4: Implement Component Logic (GREEN)

**Files:**
- Modify: `fm-stats-angular/src/app/components/best-eleven/best-eleven.component.ts`

Add `lockedPlayers` signal, `availablePlayersForSlot`, `averageScore`, `onLockChange`, `reset`, rewrite `calculate()`.

## Task 5: Update Template and Styles (GREEN)

**Files:**
- Modify: `fm-stats-angular/src/app/components/best-eleven/best-eleven.component.html`
- Modify: `fm-stats-angular/src/app/components/best-eleven/best-eleven.component.scss`

Add lock-in dropdown, format scores with 1 decimal, add average score display, update reset button, add styling.
