# ParsingDemo Current-State Specification

## Purpose

ParsingDemo lets authenticated users upload documents, convert supported file
formats to PDF, extract text, organize files into groups, and send selected
document text to an AI model for analysis.

## Implemented Workflows

- Guest users can view public pages such as the home, about, privacy, terms,
  sign-in, and sign-up pages.
- Authenticated users can access document management and account/profile flows.
- Document upload supports PDF, DOCX, EML, MSG, images, and HEIC conversion.
- Uploaded files are converted into PDF and text artifacts and stored in
  Firebase Storage with metadata in Firestore.
- Document lists are grouped into `groupOne` and `groupTwo` in the documents UI.
- Selected document PDFs can be fetched, parsed, combined, truncated at
  200,000 characters, and sent to Google Gemini through the Vercel AI SDK.
- Users can buy credits through Stripe payment intents and payment-success
  validation.

## Architecture Summary

- Next.js 16 App Router owns pages, layouts, API route handlers, and server
  actions.
- Firebase client SDK handles browser authentication, Firestore, and Storage
  access.
- Firebase Admin SDK is configured for server-only admin usage, but current
  document conversion routes do not require server-side session validation.
- Zustand stores hold auth, profile, payment, and initialization state.
- File conversion code is split between browser helpers in
  `src/utils/convertUtils.ts`, upload orchestration in `src/utils/fileUtils.ts`,
  and route handlers in `src/app/api/convert*`.
- Shared route helpers live in `src/app/api/_shared.ts`.

## Validation

- `npm run lint` is the primary quality gate and passes after running `npm ci`.
- No test script is currently defined in `package.json`.
- No typecheck-only script is currently defined; `npm run build` is the closest
  broad Next.js and TypeScript verification command.

## Known Quality Risks

- `src/utils/fileUtils.ts` performs multi-step Firestore and Storage writes
  during upload. A failure after document metadata creation can leave orphaned
  metadata or storage artifacts.
- `src/app/api/_shared.ts` validates upload size after converting the full file
  to an in-memory buffer, which weakens the 40 MB guard for large uploads.
- Text routes for EML and MSG still duplicate email-address formatting already
  available in `src/app/api/_shared.ts`.
- Empty API route directories remain at `src/app/api/analyzePdf` and
  `src/app/api/process-pdfs`.
- `src/zustand/useProfileStore.ts` includes API key fields in client-managed
  profile state and Firestore profile documents. This needs product/security
  direction before behavior changes.
- `npm ci` reports audit findings that need package-cleanup triage before
  applying automatic fixes.

## Non-Goals For This Codebase-Improvement Run

- This workflow will not approve new product roadmap priorities.
- This workflow will not change authentication or payment product behavior
  without a locally verifiable bug fix.
- This workflow will not read or commit local secret files.
