# ParsingDemo

Upload documents, convert them to PDF/text, organize files, and send selected document text to Google Gemini for analysis. Includes Firebase auth, Storage/Firestore persistence, and Stripe credit purchases.

There is no `homepageUrl` set on the GitHub repository; deploy your own Next.js instance after configuring env vars.

## Features

Verified from the current codebase:

- Public pages: home, about, privacy, terms; auth pages: sign-in, sign-up, forgot-password
- Email/password and Google sign-in (Firebase Auth); session cookie for route gating (`src/proxy.ts`)
- Authenticated documents UI with upload (dropzone), grouping (`groupOne` / `groupTwo`), and drag-and-drop selection
- Conversion API routes: PDF→text, DOCX→PDF/text, EML→PDF/text, MSG→PDF/text, image→PDF (incl. HEIC via `heic2any`)
- AI analysis server actions (`src/lib/generateActions.ts`) using Vercel AI SDK + `@ai-sdk/google` (`gemini-2.5-flash`); combined text capped at 200,000 characters
- `PARSE_USE_FIXTURES=true` skips live Gemini calls (used in CI)
- Stripe PaymentIntents for credits (`/payments`, `/payment-attempt`, `/payment-success`)
- Profile/account pages; Zustand stores for auth, profile, payments
- Firestore + Storage security rules in-repo; malware IOC scan workflow alongside CI

## Tech stack

| Area | Choice | Version (package.json) |
| --- | --- | --- |
| Framework | Next.js (App Router) | ^16.2.4 |
| UI | React | ^19.2.5 |
| Language | TypeScript | ^6.0.3 |
| Styling | Tailwind CSS | ^4.2.2 |
| State | Zustand | ^5.0.12 |
| Auth / data | Firebase client + firebase-admin | ^12.12.0 / ^13.8.0 |
| AI | `ai`, `@ai-sdk/google`, `@ai-sdk/rsc` | ai ^6.0.168 |
| Payments | Stripe + `@stripe/react-stripe-js` | stripe ^22.0.2 |
| Parsing | pdf-parse, pdf-lib, mammoth, mailparser, html-to-text, sanitize-html, puppeteer, heic2any | — |
| Tests | Vitest | ^3.2.7 |

## Project structure

```
src/
  app/
    page.tsx, about/, privacy/, terms/
    sign-in/, sign-up/, forgot-password/, account/
    documents/, payments/, payment-attempt/, payment-success/
    api/convert*/route.ts   # format conversion handlers
  components/               # Upload, file lists, auth, payments, layout
  firebase/                 # firebaseClient.ts, firebaseAdmin.ts
  lib/                      # generateActions, paymentActions
  zustand/                  # auth, profile, payments stores
  utils/                    # convertUtils, fileUtils, serverAuth, …
  proxy.ts
firestore.rules
storage.rules
.env.example
fixtures/                   # Sample inputs for PARSE_USE_FIXTURES
.github/workflows/ci.yml
.github/workflows/malware-scan.yml
```

## Getting started

### Prerequisites

- Node.js 22 (matches CI) or a current LTS
- npm
- Firebase project (Auth, Firestore, Storage) and a service account for Admin
- Google AI (Gemini) API key for live analysis
- Stripe account for payments (optional for local parsing-only experiments)

### Clone and install

```bash
git clone https://github.com/brown2020/parsingdemo.git
cd parsingdemo
npm install
```

### Environment variables

Copy `.env.example` to `.env.local` and fill in placeholders. **Never commit real values.**

#### Firebase Admin (server)

| Name | Purpose | Where to get it |
| --- | --- | --- |
| `FIREBASE_TYPE` | Service account type (usually `service_account`) | Firebase Console → Project settings → Service accounts → Generate new private key |
| `FIREBASE_PROJECT_ID` | GCP/Firebase project id | Same JSON |
| `FIREBASE_PRIVATE_KEY_ID` | Key id | Same |
| `FIREBASE_PRIVATE_KEY` | PEM private key (escape newlines as `\n` in env files) | Same |
| `FIREBASE_CLIENT_EMAIL` | Service account email | Same |
| `FIREBASE_CLIENT_ID` | Client id | Same |
| `FIREBASE_AUTH_URI` | OAuth auth URI | Same (default Google endpoint) |
| `FIREBASE_TOKEN_URI` | Token URI | Same |
| `FIREBASE_AUTH_PROVIDER_X509_CERT_URL` | Cert URL | Same |
| `FIREBASE_CLIENT_CERTS_URL` | Client cert URL | Same |

`FIREBASE_UNIVERSE_DOMAIN` appears in `.env.example` but is not read by `firebaseAdmin.ts` today.

#### Firebase client (public)

| Name | Purpose | Where to get it |
| --- | --- | --- |
| `NEXT_PUBLIC_FIREBASE_APIKEY` | Web API key | Firebase Console → Your apps |
| `NEXT_PUBLIC_FIREBASE_AUTHDOMAIN` | Auth domain | Same |
| `NEXT_PUBLIC_FIREBASE_PROJECTID` | Project id | Same |
| `NEXT_PUBLIC_FIREBASE_STORAGEBUCKET` | Storage bucket | Same |
| `NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID` | Messaging sender id | Same |
| `NEXT_PUBLIC_FIREBASE_APPID` | App id | Same |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENTID` | Analytics measurement id (optional) | Same |

Naming matches the code (`APIKEY`, `AUTHDOMAIN`, … — no underscores between words after `FIREBASE_`).

#### AI

| Name | Purpose | Where to get it |
| --- | --- | --- |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Used by `@ai-sdk/google` for `gemini-2.5-flash` in `generateActions.ts` | [Google AI Studio](https://aistudio.google.com/apikey) |

`.env.example` also lists `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`, `MISTRAL_API_KEY`, and `OPENAI_API_KEY`; they are **not referenced** in `src/` today.

#### Stripe

| Name | Purpose | Where to get it |
| --- | --- | --- |
| `NEXT_PUBLIC_STRIPE_KEY` | Publishable key for Elements / checkout UI | Stripe Dashboard → Developers → API keys |
| `STRIPE_SECRET_KEY` | Server secret for PaymentIntents | Same |
| `NEXT_PUBLIC_STRIPE_PRODUCT_NAME` | Metadata/description label (default `credits`) | Your choice / product naming |

#### Other

| Name | Purpose | Where to get it |
| --- | --- | --- |
| `NEXT_PUBLIC_COOKIE_NAME` | Optional auth cookie name (default `authToken`) | Set locally if you need a custom name |
| `PARSE_USE_FIXTURES` | When `true`, AI actions return fixture text (CI/local without Gemini spend) | Set to `true` or omit |

### Firebase / Stripe setup

1. Enable Email/Password and Google Auth; add authorized domains.
2. Deploy `firestore.rules` and `storage.rules`.
3. Apply Storage CORS if browser uploads fail from your origin (`cors.json` if present).
4. Create Stripe products/prices as needed; wire publishable + secret keys.

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For CI-like AI behavior without calling Gemini:

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
| `npm run doctor` | `react-doctor` (offline pin in package.json) |

## Testing and CI

- Unit tests cover auth constants/errors, currency helper, and parse fixtures (`PARSE_USE_FIXTURES=true` in CI).
- CI (`.github/workflows/ci.yml`): `npm ci --ignore-scripts`, lint, typecheck, test, doctor, build (Node 22). Soft-skips missing Firebase/Stripe secrets via deferred init.
- Separate `malware-scan.yml` runs static IOC matching via `scripts/malware-scan.sh`.

## Deployment

Deploy as a Next.js app. Configure all required env vars on the host. Do not inline secrets in workflows — use platform secret stores only.

## Contributing

1. Branch from `dev`.
2. Prefer fixtures for AI in automated runs.
3. Run lint, typecheck, and tests before opening a PR.
4. Never commit `.env.local` or real keys.

## License

[GNU Affero General Public License v3.0](LICENSE.md) (AGPL-3.0).
