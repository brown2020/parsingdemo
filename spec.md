# ParsingDemo specification

This describes the application as it is built on `dev`. It is not a future design.

## Purpose

Authenticated users upload documents, convert supported formats to PDF and plain text, group the files, and send selected PDF text to Google Gemini. Guests can read the public pages and create an account. Credit packs are purchased with Stripe and granted only after a verified webhook.

## Actors and access

- Guests can open `/`, `/about`, `/privacy`, `/terms`, `/sign-in`, `/sign-up`, and `/forgot-password`.
- Cookie presence on `authToken` (or `NEXT_PUBLIC_COOKIE_NAME`) is required for `/documents`, `/account`, `/payments`, `/payment-attempt`, and `/payment-success`. Missing cookies redirect to `/sign-in?redirect=<path>`. This check is not cryptographic.
- `POST /api/session` exchanges a Firebase ID token for an httpOnly session cookie (`createSessionCookie`). `DELETE /api/session` clears it.
- Conversion routes, analysis, checkout, and profile creation call `authenticateAction()`, which runs `verifySessionCookie` with revocation check. They return 401 or throw when Admin credentials are missing.
- API routes are outside the proxy matcher. They rely on the session cookie, not on the edge redirect.

## Documents

Accepted uploads:

| Input | PDF | Text stored |
| --- | --- | --- |
| PDF | Original bytes | Text extracted by the PDF route |
| DOCX | Mammoth HTML rendered to PDF | Mammoth text |
| EML | Parsed mail rendered to PDF | Parsed mail text |
| MSG | `@kenjiuno/msgreader`, then the same PDF path | Parsed mail text |
| PNG, JPEG, and other `image/*` | Image rendered to PDF | Filename only |
| HEIC | Converted to JPEG in the browser, then to PDF | Empty placeholder |

Upload flow (`src/utils/fileUtils.ts`):

1. The browser calls the matching `/api/convert*` route. Those routes require a session and reject bodies over 4MB (`MAX_UPLOAD_BYTES`).
2. The client writes `users/{uid}` and `users/{uid}/documents/{id}`, then uploads `{uid}/documents/{id}.pdf` and `{uid}/documents/{id}.txt` to Storage.
3. A failure after the document doc is created attempts to delete the doc and any objects already uploaded.

PDF rendering (`src/app/api/_browser.ts`) sanitizes HTML, disables page JavaScript, and aborts every request that is not the document or a data image. On Vercel (`VERCEL` set) the browser is `@sparticuz/chromium`. Elsewhere it is local Puppeteer. Conversion routes set `maxDuration` to 300 and the Node.js runtime.

The documents screen lists files in Group One and Group Two (`client` field `groupOne` or `groupTwo`). Users can edit client and type metadata, delete a file, and drag files into the analysis selection.

## Analysis

`analyzeDocuments` (`src/lib/generateActions.ts`):

- Requires a verified session.
- When `PARSE_USE_FIXTURES=true`, returns fixed fixture text and does not charge credits or call a model.
- Otherwise accepts 1 to 10 HTTPS Firebase Storage URLs for `{uid}/documents/{id}.pdf` on `NEXT_PUBLIC_FIREBASE_STORAGEBUCKET`. Any other host, port, userinfo, or path is rejected.
- Each PDF download is capped at 4MB and 60 seconds, with redirects refused.
- Extracted text is concatenated and truncated at 200,000 characters.
- The model id is `gemini-2.5-flash` through `@ai-sdk/google`. The provider reads `GOOGLE_GENERATIVE_AI_API_KEY`.
- Charges 1 credit before the model call. Refunds that credit if setup throws before the stream is returned.

`continueConversation` is an exported server action with the same charge and model. The documents UI does not call it.

## Credits and payments

| Constant | Value |
| --- | --- |
| Welcome balance | 1,000 credits, written once by `ensureUserProfile` |
| Analysis price | 1 credit |
| Credit pack | 10,000 credits for 9999 cents, currency `usd`, metadata `purpose=credit_pack` |

`createPaymentIntent` requires a session, Admin config, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET`. The PaymentIntent metadata includes the signed-in uid.

`POST /api/stripe/webhook` returns 503 when the webhook secret, Stripe secret, or Admin config is missing. It accepts `payment_intent.succeeded` only after `constructEvent`. Fulfillment ignores payments that are not the fixed pack, and writes the payment doc plus the balance in one Firestore transaction. A payment id already marked `succeeded` is not granted again.

Client Firestore rules may update only `email`, `contactEmail`, `displayName`, `photoUrl`, and `emailVerified` on `users/{uid}/profile/{profileId}`. Clients cannot create or delete that profile, and cannot write `credits`. `users/{uid}/payments` is read-only for clients. Storage allows the owner to read and delete `{uid}/documents/{fileName}`, and to write only `.pdf` and `.txt` objects under 50MB.

`ensureUserProfile` also deletes legacy secret fields if they are still on the profile document (`openai_api_key`, `anthropic_api_key`, `google_gen_ai_api_key`, `mistral_api_key`, `fireworks_api_key`).

## Configuration behavior without secrets

- Missing Admin project id, client email, or private key: Admin init is skipped. Session minting returns 503. Authenticated server actions fail. The webhook returns 503.
- Missing `NEXT_PUBLIC_FIREBASE_APIKEY`: the client SDK is not initialized, so sign-in and uploads cannot run. Pages still prerender.
- Missing Stripe publishable key: the payment attempt page does not mount Elements.
- Missing webhook secret: checkout creation throws and the webhook grants nothing.

## Build and verification

- `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` are the gates.
- Tests live in `src/**/*.test.ts` (Vitest, Node environment).
- CI (`.github/workflows/ci.yml`) runs those gates plus `npm run doctor` on Node 22 with `PARSE_USE_FIXTURES=true` and no secrets.
- A second workflow scans the tree for malware IOC strings and does not execute repository code.

## Explicit non-goals of the current build

- No provider other than Google Gemini, and no model id other than `gemini-2.5-flash`.
- No client-supplied API keys.
- No automatic deploy of Firebase rules, indexes, Storage CORS, or Vercel project settings.
- Fixtures do not measure live model quality.
