# Orchestration Plan

## Mode Selection

- Repo: `/Users/stephenbrown/Code/OPENSOURCE/parsingdemo`
- Branch: `dev`
- Work mode: `full`
- Run folder: `agent-runs/2026-06-20-codebase-pass`
- Verifiable gates: `git ls-remote --exit-code origin HEAD`, `git pull --ff-only origin dev`, `git push --dry-run origin dev`, `npm run lint`, targeted source inspection, `git diff --check`, and `npm run build` when server/runtime changes warrant it.
- Human-decision blockers: product roadmap changes, security/product decisions about user-owned API key storage, paid/external service credentials, or broad route-auth architecture changes.
- Resume policy: re-run Git preflight, read `run-state.md` and `task-queue.md`, push any validated local phase commit first, then continue the recorded next task.

## Startup Gates

| Gate | Result | Evidence |
| --- | --- | --- |
| Writable repo | Pass | Repo root is inside `/Users/stephenbrown/Code/OPENSOURCE/parsingdemo` |
| Working tree classification | Pass | Clean before run reports; only `agent-runs/` became dirty after scaffolding |
| Remote read | Pass | `git ls-remote --exit-code origin HEAD` returned `f9b2c5e` |
| Branch sync | Pass | `git pull --ff-only origin dev` was already up to date |
| Push authorization | Pass | `git push --dry-run origin dev` reported everything up-to-date |
| Skill/run validation | Pass | `validate_skill.py --skill-dir ... --run-dir ...` returned `ok` |
| Dependency state | Pass with note | `npm ci` completed; audit findings recorded for cleanup phase |
| Lint gate | Pass | `npm run lint` passed after dependency install |

## Loop Plan

| Phase | Loop | Verify Gate | Stop Condition |
| --- | --- | --- | --- |
| Preflight and Repo Docs | Orchestration Planning Loop, Docs Sweep Loop | Run folder validates, docs match current repo, lint passes | Plan, state, queue, docs, and report pushed |
| Baseline Validation | Baseline Validation Loop | Lint/build and dependency diagnostics are recorded | Baseline clean or failures classified |
| Findings Backlog | Findings Queue Loop, Architecture Fitness Loop, Lean Code Loop | Evidence-backed backlog and scorecard | Highest-priority executable task is clear |
| Execute Fixes and Improvements | Task Queue Loop, Fix Validation Loop, Lean Code Loop | Targeted check and lint pass | Selected tasks done, deferred, or blocked |
| Package and Dead-Code Cleanup | Package Cleanup Loop, Dead Code Loop | Audit/outdated/dead-code evidence recorded; lint/build pass for kept changes | Safe cleanup completed or deferred |
| Review | Judge Loop | Diff, reports, and quality gates reviewed | PASS or bounded follow-up tasks created |
| Stabilization | Stabilization Loop, Judge Loop | Completion criteria pass | Clean branch, clean tree, no P0/P1 or high-confidence local Fail items |
| Integrator | Final Completion Gate | Remote read, dry-run push, lint, branch sync, and final report | Final report pushed or real blocker recorded |

## File Ownership

| Task | Owned Files | Notes |
| --- | --- | --- |
| T-001 | `AGENTS.md`, `SPEC.md`, `agent-runs/2026-06-20-codebase-pass/*` | Startup planning, docs, and resume state |
| T-002 | `agent-runs/2026-06-20-codebase-pass/02-baseline-validation.md`, `task-queue.md`, `run-state.md` | Baseline command evidence |
| T-003 | `agent-runs/2026-06-20-codebase-pass/03-findings-backlog.md`, `task-queue.md`, `run-state.md` | Finding log and scorecard |
| T-004 | `src/app/api/_shared.ts`, conversion routes if needed, reports | File-size guard and route-helper cleanup candidate |
| T-005 | `src/utils/fileUtils.ts`, reports | Upload partial-failure cleanup candidate |
| T-006 | `src/app/api/convertEmlToText/route.ts`, `src/app/api/convertMsgToText/route.ts`, reports | Duplicate helper cleanup candidate |
| T-007 | Package manifests/lockfile only if safe updates are applied, reports | Audit/outdated triage |

## First Executable Tasks

1. Finish Preflight and Repo Docs checkpoint.
2. Run baseline validation with `npm run lint`, `npm run build`, and `npm audit`.
3. Build the findings backlog with architecture and lean-code scorecard.
4. Execute only high-confidence, locally verifiable fixes from the queue.
