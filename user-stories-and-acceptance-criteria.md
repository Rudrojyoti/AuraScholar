# User Stories & Acceptance Criteria

## Epic 1: PDF Upload & Processing

### US-1.1: Upload a Research Paper
**As a** researcher,
**I want to** upload a PDF research paper,
**So that** the system can analyze its content for me.

**Acceptance Criteria:**
- [ ] User can select a PDF file via a file picker or drag-and-drop
- [ ] System accepts PDF files up to 20 MB
- [ ] System rejects non-PDF files with a clear error message
- [ ] System rejects files exceeding 20 MB with a size-limit error
- [ ] Upload progress indicator is displayed during file transfer
- [ ] Upon successful upload, user sees a confirmation with the paper title/filename
- [ ] Uploaded PDF is parsed and text is extracted within 10 seconds for a typical paper

### US-1.2: View Upload Status
**As a** user,
**I want to** see the processing status of my uploaded paper,
**So that** I know when the analysis is ready.

**Acceptance Criteria:**
- [ ] Status transitions: `Uploading → Extracting Text → Chunking → Embedding → Ready`
- [ ] Each status change is reflected in the UI in real-time
- [ ] If processing fails, user sees a descriptive error message with a retry option
- [ ] Total processing time for a 20-page paper is under 30 seconds

---

## Epic 2: Structured Summary Generation

### US-2.1: Generate Paper Summary
**As a** student,
**I want to** generate a structured summary of an uploaded paper,
**So that** I can quickly understand its key points without reading the full paper.

**Acceptance Criteria:**
- [ ] User can click a "Generate Summary" button after paper processing is complete
- [ ] Summary is broken into sections: Overview, Methodology, Contributions, Limitations, Future Work
- [ ] Each section contains 2–5 sentences of grounded content
- [ ] Summary generation completes within 15 seconds
- [ ] All summary content is traceable to specific chunks of the source paper
- [ ] If a section cannot be identified in the paper, it is labeled "Not explicitly stated in the paper"

### US-2.2: Copy / Export Summary
**As a** researcher,
**I want to** copy or export the generated summary,
**So that** I can use it in my literature review or notes.

**Acceptance Criteria:**
- [ ] User can copy the full summary to clipboard with one click
- [ ] User can download the summary as a Markdown (.md) file
- [ ] Exported summary includes the source paper filename and generation timestamp

---

## Epic 3: Strict Q&A (Grounded Answers)

### US-3.1: Ask a Question About the Paper
**As a** technical professional,
**I want to** ask a natural-language question about the uploaded paper,
**So that** I can get a specific, accurate answer grounded in the paper's content.

**Acceptance Criteria:**
- [ ] User can type a question in a text input field and submit it
- [ ] System retrieves the top-5 most relevant chunks from the vector database
- [ ] Answer is generated using only the retrieved chunks (strict RAG)
- [ ] Response is displayed within 5 seconds
- [ ] Answer includes source attribution (e.g., relevant section or page reference)
- [ ] If the answer cannot be found in the paper, the system responds: "This information is not available in the uploaded paper."

### US-3.2: View Conversation History
**As a** user,
**I want to** see my previous questions and answers in a conversation thread,
**So that** I can reference earlier interactions.

**Acceptance Criteria:**
- [ ] Questions and answers are displayed in a scrollable chat-like interface
- [ ] Each Q&A pair is timestamped
- [ ] Conversation history persists for the duration of the session
- [ ] User can clear the conversation history

### US-3.3: Rate Answer Quality
**As a** researcher,
**I want to** rate the quality of an answer (thumbs up / thumbs down),
**So that** the system can track accuracy and improve over time.

**Acceptance Criteria:**
- [ ] Each answer has a thumbs-up and thumbs-down button
- [ ] Rating is submitted to the backend for analytics
- [ ] User can change their rating before the session ends
- [ ] Aggregated ratings feed into the hallucination rate metric

---

## Epic 4: Methodology Extraction

### US-4.1: Extract Research Methodology
**As a** researcher,
**I want to** extract the methodology section of a research paper,
**So that** I can understand the experimental design and approach.

**Acceptance Criteria:**
- [ ] System identifies and extracts methodology-related content from the paper
- [ ] Extraction covers: research design, data collection, experimental setup, evaluation metrics
- [ ] Output is displayed in a clean, readable format
- [ ] If no clear methodology is found, the system states: "No explicit methodology section identified."

---

## Epic 5: Security & Validation

### US-5.1: File Validation
**As a** system administrator,
**I want** uploaded files to be validated before processing,
**So that** the system is protected from malicious or invalid inputs.

**Acceptance Criteria:**
- [ ] Only `.pdf` MIME type files are accepted
- [ ] File size validation rejects files > 20 MB before upload completes
- [ ] Uploaded files are scanned for basic integrity (not corrupted)
- [ ] Filenames are sanitized to prevent path traversal or injection attacks

### US-5.2: API Key Security
**As a** developer,
**I want** all third-party API keys to be securely managed,
**So that** they are never exposed to the frontend or in logs.

**Acceptance Criteria:**
- [ ] API keys are stored in environment variables, never hardcoded
- [ ] API keys are not included in client-side bundles
- [ ] Server logs do not contain API key values
- [ ] `.env` file is listed in `.gitignore`

---

## Epic 6: UI / UX

### US-6.1: Responsive Single-Page Interface
**As a** user,
**I want** a clean, intuitive single-page application,
**So that** I can upload papers and interact with the analysis without navigating multiple pages.

**Acceptance Criteria:**
- [ ] UI is a responsive SPA built with React
- [ ] Layout adapts to desktop (1200px+), tablet (768px–1199px), and mobile (< 768px)
- [ ] Primary actions (upload, ask, summarize) are accessible within 2 clicks from the landing view
- [ ] Loading states and error states are clearly communicated with visual indicators

### US-6.2: Dark Mode Support
**As a** user,
**I want** a dark mode option,
**So that** I can use the application comfortably in low-light environments.

**Acceptance Criteria:**
- [ ] User can toggle between light and dark modes
- [ ] Preference is saved in local storage
- [ ] All text, backgrounds, and interactive elements adapt correctly

---

## Traceability Matrix

| User Story | Feature | API Endpoint | Priority |
|---|---|---|---|
| US-1.1 | PDF Upload | `POST /upload` | P0 |
| US-1.2 | Upload Status | `POST /upload` (response) | P0 |
| US-2.1 | Summary Generation | `POST /generate-summary` | P0 |
| US-2.2 | Export Summary | Client-side | P1 |
| US-3.1 | Q&A | `POST /ask` | P0 |
| US-3.2 | Conversation History | Client-side | P1 |
| US-3.3 | Answer Rating | `POST /rate` (future) | P2 |
| US-4.1 | Methodology Extraction | `POST /generate-summary` | P0 |
| US-5.1 | File Validation | `POST /upload` | P0 |
| US-5.2 | API Key Security | Infrastructure | P0 |
| US-6.1 | Responsive UI | Client-side | P0 |
| US-6.2 | Dark Mode | Client-side | P1 |
