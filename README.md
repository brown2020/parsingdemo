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

- **Next.js 16**: App Router, Route Handlers, Server Actions.
- **Tailwind CSS v4**: Utility-first styling (plus a small set of reusable global “UI primitives” in `src/app/globals.css`).
- **Firebase**: Provides authentication, Firestore, and cloud storage.
- **Clerk**: Manages user authentication and login.
- **Stripe**: Handles payment processing.
- **Mammoth**: Converts DOCX to HTML or plain text.
- **Mailparser**: Parses email files (EML and MSG).
- **Puppeteer**: Renders HTML to PDF.
- **pdf-parse**: Extracts text from PDFs.
- **pdf-lib**: Modifies and adds metadata to PDFs.
- **React DnD**: Implements drag-and-drop functionality.
- **React Spinners**: Displays loading states.
- **Zustand**: Manages application state.
- **ESLint (flat config)**: Linting via `eslint.config.mjs`.
- **Vercel AI SDK**: Streaming AI analysis from server actions (`src/lib/generateActions.ts`).

---

## Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Yarn](https://yarnpkg.com/) (optional, but recommended)
- A Firebase account with a project set up.
- A Clerk account for user authentication.
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

Create a `.env.local` file based on the `.env.example` file provided. Set up your environment variables for Firebase, Clerk, Stripe, and any other API keys.

```bash
cp .env.example .env.local
```

Edit the `.env.local` file with your keys:

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_APIKEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTHDOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECTID=your_project_id

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Stripe
NEXT_PUBLIC_STRIPE_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PRODUCT_NAME=credits

# AI APIs
OPENAI_API_KEY=your_openai_api_key
GOOGLE_GENERATIVE_AI_API_KEY=your_google_generative_ai_api_key
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

## Route Protection (Next.js 16)

This project uses **`src/proxy.ts`** (Next.js 16) to protect routes with Clerk.

- Public routes: `/`, `/sign-in(.*)`, `/sign-up(.*)`
- All other routes are protected via `auth.protect()`

---

## Contributing

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add your feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

## Contact

For more information, contact **[info@ignitechannel.com](mailto:info@ignitechannel.com)**.
