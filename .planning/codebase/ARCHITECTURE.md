---
last_mapped_commit: 9c9bbf49ebf8153c62ee35c812199383f00f0066
last_mapped_at: 2026-09-20
---
<!-- refreshed: 2026-09-20 -->

# Architecture

**Analysis Date:** 2026-09-20

## System Overview

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                      Client Layer (Vite + React SPA)                    │
├───────────────────────┬─────────────────────────┬───────────────────────┤
│    Dashboard Page     │     SpaceAuthPage       │     UserProfile       │
│ `pages/Dashboard.jsx` │ `pages/SpaceAuthPage.ts`│ `pages/UserProfile.js`│
└───────────┬───────────┴────────────┬────────────┴───────────┬───────────┘
            │                        │                        │
            ▼                        ▼                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                 REST API Layer (Express 5 - Port 3001)                  │
│                        `packages/backend/src/app.js`                    │
├───────────────────────┬─────────────────────────┬───────────────────────┤
│     Upload Routes     │       Query Routes      │     Health Routes     │
│ `routes/uploadRoutes` │   `routes/queryRoutes`  │  `routes/healthRoutes`│
└───────────┬───────────┴────────────┬────────────┴───────────┬───────────┘
            │                        │                        │
            ▼                        ▼                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       Service & Processing Layer                        │
├───────────────────────┬─────────────────────────┬───────────────────────┤
│      PDF Service      │       LLM Service       │     Vector Service    │
│ `services/pdfService` │  `services/llmService`  │`services/vectorService`│
└───────────┬───────────┴────────────┬────────────┴───────────┬───────────┘
            │                        │                        │
            ▼                        ▼                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     Storage & External Model APIs                       │
│  - In-Memory Paper Store (`services/paperStore.js`)                     │
│  - Google Gemini API (`gemini-2.5-flash`, `gemini-embedding-001`)       │
│  - ModelScope / Qwen Fallback (`Qwen/Qwen3.8-27B`)                      │
└─────────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| **Server Entry** | Bootstraps Express app, attaches middleware and starts HTTP server on port 3001 | `packages/backend/src/server.js` |
| **Express App** | Configures CORS, express.json(limit: 50mb), and mounts route modules | `packages/backend/src/app.js` |
| **Upload Controller** | Validates PDF base64 payloads, invokes PDF text extraction and LLM analyzer | `packages/backend/src/controllers/uploadController.js` |
| **Query Controller** | Handles chat and RAG Q&A queries against parsed research papers | `packages/backend/src/controllers/queryController.js` |
| **PDF Service** | Extracts raw text from binary PDF data using `pdf-parse` | `packages/backend/src/services/pdfService.js` |
| **LLM Service** | Prompts Gemini and Qwen to extract summaries, methodologies, contributions, limitations | `packages/backend/src/services/llmService.js` |
| **Vector Service** | Generates embeddings, chunks text, and calculates cosine similarity for paper Q&A | `packages/backend/src/services/vectorService.js` |
| **Paper Store** | In-memory cache holding current active research papers by ID | `packages/backend/src/services/paperStore.js` |
| **Frontend Dashboard** | 5-tab analysis view (Summary, Methodology, Contributions, Limitations, Future Work) + Chat | `packages/frontend/src/pages/Dashboard.jsx` |
| **Accretion Disk Background** | Custom WebGL interactive relativistic black hole simulation with bloom & distortion | `packages/frontend/src/components/ui/AccretionDiskBackground.tsx` |

## Pattern Overview

**Overall:** Monorepo Decoupled Client-Server (REST API + React SPA)

**Key Characteristics:**

- Separation of backend processing from browser presentation via standard JSON HTTP endpoints
- Dual AI model resilience: Google Gemini with automatic fallback to ModelScope/Qwen
- In-memory quick storage for zero-dependency local paper analysis alongside optional MongoDB schema models

## Layers

**Presentation Layer (`packages/frontend`):**

- Purpose: Interactive analysis dashboard, WebGL canvas visuals, PDF upload zone, and interactive paper conversation
- Entry Point: `packages/frontend/src/main.jsx` -> `packages/frontend/src/App.jsx`
- Depends on: Backend REST API at `http://localhost:3001/api`

**Routing & Controller Layer (`packages/backend/src/routes`, `controllers`):**

- Purpose: HTTP request sanitization, routing, response wrapping
- Entry Point: `packages/backend/src/routes/*.js`

**Business & AI Logic Layer (`packages/backend/src/services`):**

- Purpose: Text parsing, token chunking, prompt engineering, embedding generation, vector similarity

## Data Flow

### Primary PDF Analysis Flow

1. User uploads a research PDF or drops file in `packages/frontend/src/pages/Dashboard.jsx`
2. Frontend converts file to Base64 data URL and POSTs to `/api/upload/base64` (`packages/backend/src/controllers/uploadController.js`)
3. `uploadController` strips data prefix and passes buffer to `pdfService.extractTextFromBuffer` (`packages/backend/src/services/pdfService.js`)
4. Extracted text is sent to `llmService.analyzePaper(text)` (`packages/backend/src/services/llmService.js`)
5. Gemini (or Qwen fallback) parses document into structured JSON: `summary`, `methodology`, `contributions`, `limitations`, `futureWork`
6. `vectorService.indexPaper(paperId, text)` chunks paper and builds vector embeddings for RAG Q&A
7. Response returns to frontend and populates the 5 analysis tabs and interactive chat sidebar

## Key Abstractions

- **Paper Analysis Object**: Standardized structured JSON output defining `summary`, `methodology`, `contributions`, `limitations`, `futureWork`
- **Vector Document Index**: Chunks with embedding vectors and cosine similarity search in `packages/backend/src/services/vectorService.js`

## Entry Points

- **Backend:** `packages/backend/src/server.js` (starts Express server on PORT 3001)
- **Frontend:** `packages/frontend/src/main.jsx` (mounts React root on `#root`)

## Architectural Constraints

- **Single-threaded Event Loop:** Node.js CommonJS backend. Large PDF processing is handled asynchronously.
- **Payload Limits:** `express.json({ limit: '50mb' })` configured in `app.js` to support large base64 PDF uploads.

## Error Handling

- Centralized try/catch in controller actions with standardized `{ success: false, message: ... }` response payloads
- LLM fallback chain: if Gemini fails or lacks key, falls back to Qwen; if Qwen fails, returns informative error response

---

*Architecture analysis: 2026-09-20*
