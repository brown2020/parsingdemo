# ParsingDemo

ParsingDemo is a robust document parsing solution that handles multiple file formats, standardizes them into PDFs, and extracts text content for further processing. The project supports various file types, including DOCX, EML, MSG, and image files. It includes drag-and-drop functionality for file handling and integrates AI-driven analysis by sending parsed content to language models (LLMs) for further insights.

## Table of Contents

- [Motivation and Process](#motivation-and-process)
- [Features](#features)
- [Supported File Types](#supported-file-types)
- [Tech Stack](#tech-stack)
- [Setup Instructions](#setup-instructions)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Development Server](#running-the-development-server)
- [API Routes](#api-routes)
  - [Convert DOCX to PDF](#convert-docx-to-pdf)
  - [Convert DOCX to Text](#convert-docx-to-text)
  - [Convert EML to PDF](#convert-eml-to-pdf)
  - [Convert EML to Text](#convert-eml-to-text)
  - [Convert MSG to PDF](#convert-msg-to-pdf)
  - [Convert MSG to Text](#convert-msg-to-text)
  - [Convert Image to PDF](#convert-image-to-pdf)
  - [Convert PDF to Text](#convert-pdf-to-text)
- [DnD Functionality](#dnd-functionality)
- [AI Analysis Functionality](#ai-analysis-functionality)
- [Authentication & Route Protection](#authentication--route-protection)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Motivation and Process

### Motivation

The main objective of ParsingDemo is to handle various document formats by first converting them to a common format (PDF). Once in PDF format, we can apply consistent parsing logic using **pdf-parse** to extract text from all files. This standardization simplifies the text extraction process and ensures uniformity, allowing us to parse, search, and analyze document content efficiently.

### Process Overview

1. **Convert All Files to PDF**:
   - Supported files (DOCX, EML, MSG, and image files) are first converted to PDF format using tools like **Mammoth**, **Puppeteer**, and **pdf-lib**.
2. **Parse PDFs**:
   - Once everything is in PDF format, we use **pdf-parse** to extract text from the documents.
3. **AI Analysis**:
   - The extracted text can then be sent to an AI language model (LLM) for further insights, such as document summarization, entity recognition, or content generation.

---

## Features

- **File Conversion**: Supports converting DOCX, EML, MSG, and image files into PDFs.
- **Text Parsing**: Extracts text from all files consistently by converting them to PDFs first and using **pdf-parse**.
- **Drag-and-Drop File Upload**: Intuitive DnD functionality to move and organize files.
- **AI Integration**: Sends parsed text to AI models (e.g., OpenAI, Gemini) for further analysis and insights.
- **Real-time Processing**: All operations are done in real-time, with feedback provided via the user interface.

---

## Supported File Types

1. **DOCX** (Microsoft Word)
2. **EML** (Email file)
3. **MSG** (Microsoft Outlook email)
4. **PDF** (Portable Document Format)
5. **Image files** (e.g., PNG, JPG, HEIC)

---

## Tech Stack

- **Next.js 16.0.3**: App Router, Route Handlers, Server Actions.
- **React 19.0.0**: UI runtime.
- **Tailwind CSS 4.0.8**: Utility-first styling (plus a small set of reusable global “UI primitives” in `src/app/globals.css`).
- **Firebase 12.6.0**: Authentication (Google sign-in, email/password), Firestore database, and Cloud Storage.
- **Firebase Admin 13.0.1**: Server-side Firebase operations.
- **Stripe 20.0.0**: Handles payment processing.
- **Mammoth 1.8.0**: Converts DOCX to HTML or plain text.
- **Mailparser 3.7.1**: Parses email files (EML and MSG).
- **Puppeteer 24.2.1**: Renders HTML to PDF.
- **pdf-parse 2.4.5**: Extracts text from PDFs.
- **pdf-lib 1.17.1**: Modifies and adds metadata to PDFs.
- **React DnD 16.0.1**: Implements drag-and-drop functionality.
- **React Spinners 0.17.0**: Displays loading states.
- **Zustand 5.0.0**: Manages application state.
- **ESLint 9.15.0 (flat config)**: Linting via `eslint.config.mjs`.
- **Vercel AI SDK 6.0.3**: Streaming AI analysis from server actions (`src/lib/generateActions.ts`).

---

## Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) (**v20.9.0 or higher**) — required by Next.js 16.
- [Yarn](https://yarnpkg.com/) (optional, but recommended)
- A Firebase account with a project set up (Authentication, Firestore, and Storage).
- A Stripe account for payment processing.

### Installation

1. Clone the repository:

```bash
git clone https://github.com/brown2020/parsingdemo.git
cd parsingdemo
```

2. Install dependencies:

```bash
npm install
```

or

```bash
yarn install
```

### Environment Variables

Create a `.env.local` file based on the `.env.example` file provided. Set up your environment variables for Firebase (client and server), Stripe, and any AI API keys.

```bash
cp .env.example .env.local
```

Edit the `.env.local` file with your keys:

```bash
# Firebase Client Config
NEXT_PUBLIC_FIREBASE_APIKEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTHDOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECTID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGEBUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APPID=your_app_id

# Firebase Server Config (Service Account)
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_CLIENT_ID=your_client_id

# Stripe
NEXT_PUBLIC_STRIPE_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PRODUCT_NAME=credits

# AI APIs
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
```

### Running the Development Server

Start the development server:

```bash
npm run dev
```

or

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## API Routes

All conversion routes are **POST** endpoints and accept **`multipart/form-data`**:

- **Field**: `file` (required)
- **Optional fields**:
  - `userId` (string) - used only for PDF metadata authoring
  - `filenameBase` (string) - used to name the output file

Example:

```bash
curl -X POST "http://localhost:3000/api/convertPdfToText" \
  -F "file=@./example.pdf"
```

### Convert DOCX to PDF

- **Route**: `/api/convertDocxToPdf`
- **Description**: Converts DOCX files to PDFs using **Mammoth** and **Puppeteer**.
- **Use Case**: Converts Microsoft Word documents into a PDF format.

### Convert DOCX to Text

- **Route**: `/api/convertDocxToText`
- **Description**: Converts DOCX files to plain text using **Mammoth**.
- **Use Case**: Extracts raw text from DOCX files for further analysis or storage.

### Convert EML to PDF

- **Route**: `/api/convertEmlToPdf`
- **Description**: Converts EML (email) files into PDFs using **Mailparser** and **Puppeteer**.
- **Use Case**: Converts email files into a printable and shareable PDF format.

### Convert EML to Text

- **Route**: `/api/convertEmlToText`
- **Description**: Converts EML files to plain text using **Mailparser**.
- **Use Case**: Extracts email content and metadata in text format.

### Convert MSG to PDF

- **Route**: `/api/convertMsgToPdf`
- **Description**: Converts MSG (Outlook email) files into PDFs using **Mailparser** and **Puppeteer**.
- **Use Case**: Converts Outlook email files into a shareable PDF format.

### Convert MSG to Text

- **Route**: `/api/convertMsgToText`
- **Description**: Converts MSG files to plain text using **Mailparser**.
- **Use Case**: Extracts email content and metadata in plain text.

### Convert Image to PDF

- **Route**: `/api/convertImageToPdf`
- **Description**: Converts images to PDFs by rendering them with **Puppeteer**.
- **Use Case**: Converts scanned documents or images into a PDF format.

### Convert PDF to Text

- **Route**: `/api/convertPdfToText`
- **Description**: Extracts text from existing PDF files using **pdf-parse**.
- **Use Case**: Parses PDF files and extracts readable text content.

---

## DnD Functionality

The **drag-and-drop (DnD)** functionality allows users to easily upload and move files within the system. It simplifies file handling by providing an intuitive way to manage file organization and uploading.

- **Technology**: Powered by **React DnD** and **react-dropzone**.
- **Use Case**: Easily move files around within the interface, visually managing file operations.

---

## AI Analysis Functionality

The **AI analysis functionality** streams results from a server action (`src/lib/generateActions.ts`) using the Vercel AI SDK. Selected PDFs are converted to text, combined, and then sent to the configured model for analysis.

- **Supported Models**: Includes integration with AI models like OpenAI, Google Gemini, and Anthropic.
- **Use Case**: After parsing document content, send it to an AI model for further insights or enhancements.

---

## Authentication & Route Protection

This project uses **Firebase Authentication** for user management with client-side route protection.

### Authentication Methods

- **Google Sign-In**: One-click authentication via Google OAuth.
- **Email/Password**: Traditional email and password registration/login.

### Architecture

- **`AuthProvider`** (`src/components/AuthProvider.tsx`): Wraps the app and listens to Firebase auth state changes via `onAuthStateChanged`. Updates the Zustand auth store when users sign in/out.
- **`AuthGuard`** (`src/components/AuthGuard.tsx`): Client-side route protection component. Redirects unauthenticated users to `/sign-in`.
- **`useAuthStore`** (`src/zustand/useAuthStore.ts`): Zustand store that holds user auth state (uid, email, display name, photo URL, etc.).

### Public Routes

- `/` (home)
- `/sign-in`
- `/sign-up`
- `/about`
- `/privacy`
- `/terms`

### Protected Routes

All other routes (e.g., `/documents`, `/account`, `/payments`) require authentication and are wrapped with `AuthGuard`.

---

## Contributing

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add your feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.

---

## License

This project is licensed under the **GNU Affero General Public License v3.0**. See [`LICENSE.md`](LICENSE.md) for details.

> Note: AGPL-3.0 has network-copyleft requirements; if you deploy a modified version and make it accessible over a network, you must provide users access to the corresponding source as described in the license.

---

## Contact

For more information, contact **[info@ignitechannel.com](mailto:info@ignitechannel.com)**.
