# Repository Guidance

## Project

ParsingDemo is a Next.js App Router application for uploading documents,
converting supported formats to PDF, extracting text, and running AI-assisted
analysis over selected files. The app uses Firebase Auth, Firestore, Firebase
Storage, Stripe payments, Zustand state stores, and conversion route handlers
under `src/app/api`.

## Commands

- `npm ci` installs dependencies from `package-lock.json`.
- `npm run dev` starts the local Next.js server.
- `npm run lint` runs ESLint over the repository.
- `npm run build` runs the production Next.js build.
- `npm start` starts a built production server.

Node.js 20.9.0 or newer is expected by the Next.js 16 stack.

## Architecture Notes

- `src/app` contains App Router pages and API route handlers.
- `src/app/api/convert*` contains file-conversion endpoints. Shared helpers live
  in `src/app/api/_shared.ts`.
- `src/components` contains client UI components for auth, documents, payments,
  profile, layout, and file handling.
- `src/firebase` initializes Firebase client and admin SDKs.
- `src/lib` contains server actions for AI streaming and Stripe payment
  operations.
- `src/utils` contains client-side conversion and Firebase file utilities.
- `src/zustand` contains auth, profile, payments, and store-initialization state.

## Safety Rules

- Do not read, edit, stage, or commit local secret files such as `.env`,
  `.env.local`, or `service_key.json`.
- Keep generated or local-only directories out of commits unless they are
  workflow reports under `agent-runs/`.
- Preserve the client/server boundary: browser components should not import
  Firebase Admin or server-only Stripe code.
- Keep API route changes small and verify with `npm run lint`; run
  `npm run build` when changing server routes, Next config, or runtime behavior.
- Prefer updates to existing helpers in `src/app/api/_shared.ts` and
  `src/utils/convertUtils.ts` before adding new route-local duplication.
- Treat Firestore and Storage writes as multi-step operations that need clear
  failure handling and cleanup behavior.

## Current Validation Baseline

- `npm ci` completed successfully from the lockfile on 2026-06-20.
- `npm run lint` passes after dependencies are installed.
- `npm ci` reported 28 audit findings: 2 low, 16 moderate, 8 high, and
  2 critical. Package cleanup should inspect these with `npm audit` before
  applying fixes.
