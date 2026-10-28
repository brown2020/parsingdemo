# ParsingDemo

Upload documents, convert them to PDF and text, organize the results, and send selected PDF text to Google Gemini for analysis. Accounts, file metadata, and credit balances live in Firebase. Credit packs are sold through Stripe and applied only by a signed webhook.

Deploy your own Next.js instance. This repository does not set a GitHub homepage URL.

## Features

- Public pages: home, about, privacy, and terms
- Auth pages: sign-in, sign-up, and forgot-password (email/password and Google)
- httpOnly Firebase session cookie from `POST /api/session`, cleared by `DELETE /api/session`
- Route gate in `src/proxy.ts` (cookie presence). Server Actions and conversion routes verify the session cookie with Firebase Admin
- Documents UI: dropzone upload, `groupOne` / `groupTwo`, drag-and-drop selection
- Conversion routes: PDF to text, DOCX to PDF/text, EML to PDF/text, MSG to PDF/text, images (including HEIC) to PDF
- Analysis server action using the Vercel AI SDK and `@ai-sdk/google` (`gemini-2.5-flash`). Combined extracted text is capped at 200,000 characters. Up to 10 PDFs, each at most 4MB, and only the signed-in user's Firebase Storage PDFs
- `PARSE_USE_FIXTURES=true` skips live Gemini calls
- Stripe PaymentIntent for one fixed pack: 9999 cents, `usd`, 10,000 credits. New profiles start at 1,000 credits. Analysis costs 1 credit
- Credits change only through the Admin SDK (webhook fulfillment and analysis charge/refund). Checkout stays off when `STRIPE_WEBHOOK_SECRET` or Admin credentials are missing
- Profile page for identity fields. Clients cannot write `credits`

## Tech stack

Versions are the ranges in `package.json`.

| Area | Packages |
| --- | --- |
| Framework | Next.js `^16.4.3`, React `^19.3.1`, React DOM `^19.3.1` |
| Language | TypeScript `^6.0.3` (TypeScript 7 is published; ESLint's parser does not accept it yet) |
| Styling | Tailwind CSS `^4.3.3`, `@tailwindcss/postcss` `^4.3.3` |
| State | Zustand `^5.0.16` |
| Auth and data | `firebase` `^13.1.0`, `firebase-admin` `^14.5.0` |
| AI | `ai` `^7.0.156`, `@ai-sdk/google` `^4.0.107`, `@ai-sdk/rsc` `^3.0.156` |
| Payments | `stripe` `^23.0.1`, `@stripe/stripe-js` `^10.2.0`, `@stripe/react-stripe-js` `^7.0.1` |
| Parsing and PDF | `pdf-parse` `^2.4.5`, `pdf-lib` `^1.17.1`, `mammoth` `^1.13.0`, `mailparser` `^3.12.4`, `@kenjiuno/msgreader` `^1.29.0`, `sanitize-html` `^2.18.1`, `puppeteer` `^25.16.0`, `@sparticuz/chromium` `^153.0.0`, `heic2any` `^0.0.4` |
| Validation | `zod` `^4.6.7` |
| Tests | Vitest `^5.0.5`, Vite `^8.3.5` |
| Lint | ESLint `^10.13.0`, `typescript-eslint` `^8.72.1` |

`firebase-admin` 14 pulls `jwks-rsa` 4. `package.json` overrides that package's `jose` dependency to `5.10.0`. `@grpc/grpc-js` is overridden to `1.14.6` (the current release).

## Project structure

```
src/
  app/
    page.tsx, about/, privacy/, terms/
    sign-in/, sign-up/, forgot-password/, account/
    documents/, payments/, payment-attempt/, payment-success/
    api/convert*/route.ts
    api/session/route.ts
    api/stripe/webhook/route.ts
  components/
  firebase/          firebaseClient.ts, firebaseAdmin.ts
  lib/               generateActions, billing, paymentActions, profileActions
  zustand/
  utils/
  proxy.ts
firestore.rules
storage.rules
cors.json
.env.example
fixtures/
.github/workflows/ci.yml
.github/workflows/malware-scan.yml
spec.md
roadmap.md
```

## Getting started

### Prerequisites

- Node.js 22 (the version CI uses). Next.js 16 requires Node `>=20.9.0`. Nested `@firebase/*` packages declare `engines.node >= 24.12.0` and npm prints `EBADENGINE` on Node 22; the app still installs and builds here. See `roadmap.md` before moving the runtime
- npm
- A Firebase project with Auth, Firestore, and Storage, plus a service account for Admin
- A Google AI key for live analysis
- A Stripe account if you want checkout

### Install

```bash
git clone https://github.com/brown2020/parsingdemo.git
cd parsingdemo
npm ci
```

### Environment variables

Copy `.env.example` to `.env.local` and replace the placeholders. Do not commit `.env.local`. Names only; never put real values in git.

The production build and CI succeed when these are unset. Firebase and Stripe init are skipped, checkout is disabled, and the webhook returns 503.

#### Required for a working local app

| Name | Role |
| --- | --- |
| `FIREBASE_PROJECT_ID` | Admin project id. With the email and private key, this enables Admin |
| `FIREBASE_CLIENT_EMAIL` | Service account email |
| `FIREBASE_PRIVATE_KEY` | Service account private key. Keep newline escapes as `\n` in env files |
| `NEXT_PUBLIC_FIREBASE_APIKEY` | Web API key. Client SDK init waits until this is set |
| `NEXT_PUBLIC_FIREBASE_AUTHDOMAIN` | Auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECTID` | Web project id |
| `NEXT_PUBLIC_FIREBASE_STORAGEBUCKET` | Storage bucket. Also the allowlist for analysis PDF URLs and the Admin bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID` | Messaging sender id |
| `NEXT_PUBLIC_FIREBASE_APPID` | Web app id |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Key read by `@ai-sdk/google` for `gemini-2.5-flash` |
| `NEXT_PUBLIC_STRIPE_KEY` | Publishable key for Payment Element |
| `STRIPE_SECRET_KEY` | Secret key for PaymentIntents and webhook verification |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for `POST /api/stripe/webhook`. Checkout and credit grants stay off when this is empty |

`FIREBASE_TYPE`, `FIREBASE_PRIVATE_KEY_ID`, `FIREBASE_CLIENT_ID`, `FIREBASE_AUTH_URI`, `FIREBASE_TOKEN_URI`, `FIREBASE_AUTH_PROVIDER_X509_CERT_URL`, and `FIREBASE_CLIENT_CERTS_URL` are forwarded into the Admin credential when set. A Firebase service-account JSON contains them.

#### Optional

| Name | Role |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENTID` | Analytics measurement id. Omitted from client init when empty |
| `NEXT_PUBLIC_STRIPE_PRODUCT_NAME` | PaymentIntent metadata label. Defaults to `credits` |
| `NEXT_PUBLIC_COOKIE_NAME` | Session cookie name. Defaults to `authToken` |
| `PARSE_USE_FIXTURES` | `true` returns fixture analysis text and does not call Gemini |

#### Present in `.env.example` but not read

`FIREBASE_UNIVERSE_DOMAIN`, `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`, `MISTRAL_API_KEY`, `OPENAI_API_KEY`.

### Firebase and Stripe setup

1. Enable Email/Password and Google sign-in. Add your authorized domains.
2. Deploy `firestore.rules` and `storage.rules` yourself. This repo does not deploy them. There is no `firestore.indexes.json`.
3. Apply `cors.json` to the Storage bucket if browser uploads fail. The committed file allows `http://localhost:3000` only. Add the production origin before applying it. Do not use `*`.
4. Point a Stripe webhook at `https://<your-host>/api/stripe/webhook` for `payment_intent.succeeded`, and set `STRIPE_WEBHOOK_SECRET`.
5. Conversion uploads are capped at 4MB. On Vercel, HTML-to-PDF uses `@sparticuz/chromium`. Conversion routes set `maxDuration` to 300 seconds.

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
PARSE_USE_FIXTURES=true npm run dev
```

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Next.js development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest |
| `npm run doctor` | `react-doctor` 0.9.18, offline |

## Testing and CI

Unit tests cover session path rules, auth errors, the credit-pack amount check, PDF URL allowlisting, HTML sanitization, webhook rejection when the signing secret is missing, and parse fixtures.

`.github/workflows/ci.yml` runs on pushes and pull requests to `dev` and `main`: `npm ci --ignore-scripts`, lint, typecheck, test, react-doctor, and the production build. Node 22. `PARSE_USE_FIXTURES=true`. No Actions secrets are required.

`.github/workflows/malware-scan.yml` runs `scripts/malware-scan.sh` (static IOC match only).

## Deployment

Deploy as a Next.js app and set the env var names above in the host's secret store. Do not put keys in workflow files.

Firestore rules, Storage rules, and bucket CORS are not applied by CI. Apply them from this repo when you are ready.

## Contributing

1. Branch from `dev`.
2. Use `PARSE_USE_FIXTURES=true` for automated AI runs.
3. Run lint, typecheck, tests, and the production build before opening a PR.
4. Do not commit `.env`, `.env.local`, or `service_key.json`.

## License

[GNU Affero General Public License v3.0](LICENSE.md) (AGPL-3.0).
