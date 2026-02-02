# CLAUDE.md - ParsingDemo

## Project Overview

ParsingDemo is a document parsing and conversion platform that standardizes multiple file formats into PDFs, extracts text content, and enables AI-driven analysis. Built with Next.js 16, React 19, and TypeScript.

## Commands

```bash
npm run dev        # Start development server (localhost:3000)
npm run build      # Production build
npm start          # Start production server
npm run lint       # Run ESLint
```

**Requires Node.js v20.9.0+**

## Project Structure

```
src/
├── app/                 # Next.js App Router pages and API routes
│   ├── api/            # Document conversion endpoints (POST, multipart/form-data)
│   ├── documents/      # Main file management page
│   ├── payments/       # Stripe payment pages
│   ├── account/        # User profile page
│   └── sign-in|up/     # Firebase Auth pages
├── components/         # React client components
├── firebase/           # Firebase client & admin SDK initialization
├── lib/               # Server actions (AI streaming, payments)
├── zustand/           # State stores (auth, payments, profile)
├── utils/             # Utility functions for conversions
└── types/             # TypeScript type definitions
```

## Tech Stack

- **Framework**: Next.js 16 (App Router, Server Actions)
- **UI**: React 19, Tailwind CSS 4
- **Auth**: Firebase Auth (Google sign-in, email/password)
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Payments**: Stripe
- **State**: Zustand
- **AI**: Vercel AI SDK with Google/OpenAI providers

## API Routes

All routes are POST endpoints accepting `multipart/form-data` with `file` field:

| Route | Input | Output |
|-------|-------|--------|
| `/api/convertDocxToPdf` | DOCX | PDF |
| `/api/convertDocxToText` | DOCX | Text |
| `/api/convertEmlToPdf` | EML | PDF |
| `/api/convertEmlToText` | EML | Text |
| `/api/convertMsgToPdf` | MSG | PDF |
| `/api/convertMsgToText` | MSG | Text |
| `/api/convertImageToPdf` | PNG/JPG/HEIC | PDF |
| `/api/convertPdfToText` | PDF | Text |

All routes have 300s timeout and 40MB max file size.

## Key Libraries

- **Mammoth**: DOCX to HTML/text
- **Mailparser**: EML/MSG parsing
- **Puppeteer**: HTML to PDF rendering
- **pdf-lib**: PDF metadata/modification
- **pdf-parse**: PDF text extraction

## Firestore Structure

```
users/{uid}/
├── profile/userData    # User profile, credits, API keys
└── payments/{id}       # Payment transaction records
```

## Firebase Storage Structure

```
{userId}/{group}/{fileType}/{fileName}
```

## Environment Variables

See `.env.example` for full list. Key groups:
- `FIREBASE_*` - Server-side Firebase Admin SDK
- `NEXT_PUBLIC_FIREBASE_*` - Client-side Firebase config (includes auth)
- `NEXT_PUBLIC_STRIPE_KEY` / `STRIPE_SECRET_KEY` - Stripe payments
- `GEMINI_API_KEY`, `OPENAI_API_KEY`, etc. - AI providers

## Code Conventions

- TypeScript strict mode enabled
- Path aliases: `@/*` maps to `src/*`
- Client components use `"use client"` directive
- Server actions in `src/lib/` with `"use server"` directive
- ESLint flat config with Next.js, React, TypeScript rules
