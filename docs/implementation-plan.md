# DriveFollow Web Demo Implementation Plan

**Goal:** Deliver a locally runnable automotive sales workflow demo and a recruiter-facing portfolio page.

**Architecture:** A dependency-free Node HTTP server serves ES modules and a planning endpoint. Pure business rules are shared by server and browser. Browser storage persists each viewer's simulated CRM, tasks, bookings, feedback and evaluation runs. An optional server-side model adapter enriches drafts; the default deterministic mode is visibly labeled.

**Tech Stack:** Node 22+, native ES modules, semantic HTML, CSS, Node test runner; bundled Playwright for browser verification.

**Spec:** [汽车营销Agent-作品集项目提案.md](汽车营销Agent-作品集项目提案.md) and the user's approved deliverable: runnable Web Demo plus portfolio explanation page.

## Global constraints

- Vehicle records use real NIO models with official source URLs. Customer, dealership and scheduling records are simulated and labeled.
- No invented interviews, conversion improvements, production usage or model invocation claims.
- Demonstration clock: 2026-11-19, Asia/Shanghai.
- Contact refusal and unresolved complaints block invitation generation and booking.
- Expired campaign information never enters an invitation draft.
- Booking requires explicit customer confirmation and an available slot; repeat confirmation cannot duplicate records.
- API keys stay in server environment variables and are never returned to the browser.
- Changes live in the dedicated drivefollow-web directory. The repository has no initial commit, so a Git worktree cannot be created from an existing commit.

## 1. Workflow rules and persistence

Files: public/modules/data.js, domain.js, store.js, evaluation.js; tests/domain.test.mjs.

Interface: createInitialState() returns customers, bookings, tasks, runs, feedback, evaluations. assessLead(lead) produces priority and blockers. buildPlan(lead) returns source-backed draft, action, warnings and trace. createTask(state, leadId, plan) and reserveSlot(state, leadId, slotId, confirmed) validate and update state idempotently.

- [x] Write failing behavioral tests for refusal, complaints, expired offers, missing fields, booking confirmation/conflicts and duplicate tasks.
- [x] Run with `node --test tests/domain.test.mjs` and inspect failures.
- [x] Implement the rules against hand-checked fictional fixtures; run the same tests to green.
- [x] Add schema-versioned local persistence and an explicit reset action.

## 2. Runtime and optional model adapter

Files: server.mjs, package.json, .env.example; tests/server.test.mjs.

Interface: GET /api/config reports demo/model mode without secrets. POST /api/plan accepts a customer and returns a validated plan, execution mode and trace. Static serving is restricted to public/.

- [x] Write failing integration tests for config, malformed input, source-backed plans and blocked customers.
- [x] Implement the dependency-free HTTP server and optional server-side chat-completions adapter using fetch with a timeout.
- [x] Test that model failure is reported with a labeled rule fallback; test invalid API input and static path boundaries.

## 3. Sales workspace

Files: public/index.html, app.js, styles.css, modules/icons.js, modules/views.js.

- [x] Build the responsive sidebar, date/context header, overview metrics, searchable/filterable customer list and client action panel.
- [x] Connect plan generation, editable draft, source inspection, adoption/rejection and task creation.
- [x] Add task completion, validated booking, new customer entry, JSON export and reset.
- [x] Add knowledge browsing and executable synthetic-case evaluation; keep observed usage separate from business outcomes.

## 4. Portfolio and handoff

Files: public/portfolio.html, portfolio.css, portfolio.md; README.md, start.sh.

- [x] Explain the problem hypothesis, target users, scope, decision flow, product capability mapping and evidence boundaries.
- [x] Link to the runnable demo and downloadable case study.
- [x] Document one-command startup, optional model configuration, persistence scope and actual validation.

## 5. Verification

- [x] Run all Node behavioral/integration tests.
- [x] Verify the complete browser loop: select lead → generate → inspect source → edit/adopt → task → confirmed booking → refresh persistence.
- [x] Verify refusal/complaint handling, slot collision, search/filter, evaluation results and portfolio navigation.
- [x] Capture desktop and mobile screenshots, inspect overflow and console errors, and fix any findings.
- [x] Open the final demo in Codex and report URLs and actual limitations.

## Verified delivery

2026-11-19: 18 Node behavioral/integration tests passed. Playwright completed desktop (1440×1000) and mobile (390×844) checks, including normal and blocked flows, confirmation, collisions, reload persistence, customer editing, search, filters, feedback, exports, 8 executable rule cases, portfolio navigation and document download. No console/page errors were observed. Model adapter contract and failure paths are tested with an isolated transport; no live provider credentials were supplied.
