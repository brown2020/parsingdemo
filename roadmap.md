# ParsingDemo roadmap

Punchlist as of 2026-11-02. Nothing here is a commitment. Open GitHub issues and pull requests: none at the time this was written.

## Needs a person

- Deploy `firestore.rules` and `storage.rules`. CI does not deploy them. There is no `firestore.indexes.json`; add one only if a new query needs a composite index.
- Apply Storage CORS from `cors.json` after adding the production origin. The file in git allows `http://localhost:3000` only.
- Confirm the host has the env names in `README.md`, especially `STRIPE_WEBHOOK_SECRET`, `STRIPE_SECRET_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, the Firebase Admin trio (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`), and `NEXT_PUBLIC_FIREBASE_STORAGEBUCKET`. Checkout and credit grants stay disabled until the webhook secret and Admin credentials exist. Register `payment_intent.succeeded` on `POST /api/stripe/webhook`.
- CI already uses Node 24 (`actions/setup-node` `node-version: "24"`), which meets the nested `@firebase/*` engine of `>=24.12.0` on current 24.x releases. The Vercel project is Node 24 (see Deployment). This update was installed and tested on Node 24.22.2.
- Move to TypeScript 7.0.2 only after `@typescript-eslint/parser` widens its peer range past `<6.1.0`. The parser at 8.72.1 still rejects it. The app stays on TypeScript 6.0.3 so lint keeps working.
- Remove or intentionally wire the unused `.env.example` names: `FIREBASE_UNIVERSE_DOMAIN`, `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`, `MISTRAL_API_KEY`, `OPENAI_API_KEY`.

## Known bugs

- Analysis refunds the 1 credit only when `analyzeDocuments` throws before it returns the stream. A Gemini failure while `SelectedFiles` is reading the stream leaves the credit spent. `continueConversation` has the same gap.
- `continueConversation` is a public server action, charges 1 credit, and does not cap message size. The UI never calls it.
- Image PDFs store only the filename as text, and HEIC stores an empty text file. Analysis uses `pdf-parse` on the PDF, so those files often contribute no document text.
- `deleteFile` deletes Storage objects with `Promise.allSettled` and then always deletes the Firestore document. A failed object delete leaves an orphan in Storage.
- `cleanupPartialUpload` can also fail partway. The upload throws after logging that, so a retry can leave a duplicate document or object.
- Firestore allows the owner to set `profile.emailVerified`. That flag is not Firebase Auth's `emailVerified`. A client can mark the profile verified.
- `serverAuth` treats `verifyIdToken` as the "Admin is real" probe, then calls `verifySessionCookie`. `src/proxy.ts` still says the server check is `verifyIdToken`.
- The documents UI prints the PDF download URL next to each selected file.

## Next product work

- Charge or refund from the stream's terminal result, and hide or delete `continueConversation` until a chat UI needs it.
- Run OCR or a vision pass for image and HEIC uploads if those files should be analyzable. Do not change the Gemini model id as part of unrelated cleanup.
- Make delete and failed-upload cleanup retry, or record a cleanup job, so Firestore and Storage do not diverge.
- Add a production origin to `cors.json` only in the deployed bucket config, not as `*`.
- Add tests around `ensureUserProfile` (welcome balance once, secret-field deletion) and around stream failure refunds once that behavior exists.
- Re-run `npm audit` when bumping Firebase, Puppeteer, ESLint, or `eslint-plugin-react`. On 2026-11-02 the audit reported 2 moderate findings: `eslint-plugin-react` 7.37.5 → `minimatch` 3.1.5 (GHSA-g3hv-75wg-m249). Minimatch 11.0.4 is overridden for ESLint and typescript-eslint. It is not overridden for `eslint-plugin-react`, because that plugin calls `minimatch()` as a function and minimatch 11's CommonJS export is not callable. `npm audit fix --force` would downgrade the plugin to 7.22.0. `glob` is overridden to 14.0.3 (GHSA-3g3m-2fjr-6pw4). No high or critical findings.
- Keep the `jwks-rsa` → `jose@5.10.0` override until `firebase-admin` no longer depends on `jwks-rsa` 4 or that package can load current `jose` without `ERR_REQUIRE_ESM`. `@grpc/grpc-js` stays overridden to the current release (`1.14.7`).

## Deployment

Vercel project linked Oct 28, 2026 (team `ignitechannel`, project `parsingdemo`, Node 24). Dev previews are served at `https://parsingdemo-git-dev-ignitechannel.vercel.app`. Sign-in, parsing, and checkout need the Firebase, AI, and Stripe env vars set in Vercel. Those values are not set yet.
