---
last_mapped_commit: bf05bbc1293679b67bf5a0157db176634f728c9b
last_mapped_at: 2026-09-20
---
# External Integrations

**Analysis Date:** 2026-09-20

## APIs & External Services

**LLM & AI Providers:**

- **Google Gemini API** (`@google/genai`):
  - Used for: Primary paper summarization, section extraction, QA, and vector embeddings (`gemini-2.5-flash`, `gemini-embedding-001`)
  - Config/Auth: `GEMINI_API_KEY` loaded in `packages/backend/src/config/index.js`
  - Implementation: `packages/backend/src/services/llmService.js`, `packages/backend/src/services/vectorService.js`
- **ModelScope / Qwen API** (OpenAI-compatible inference):
  - Used for: Qwen/Qwen3.8-27B fallback and fast parsing
  - Config/Auth: `MODELSCOPE_API_KEY`, `MODELSCOPE_BASE_URL`, `MODELSCOPE_MODEL`
  - Implementation: `packages/backend/src/services/llmService.js`
- **Groq API** (`groq-sdk`):
  - Used for: Ultra-fast LLM inference (`llama-3.1-70b-versatile`)
  - Config/Auth: `GROQ_API_KEY`
  - Implementation: `packages/backend/src/config/index.js`

**File Processing & Upload:**

- **UploadThing** (`uploadthing`, `@uploadthing/react`):
  - Used for: Cloud PDF document upload handling
  - Config/Auth: `UPLOADTHING_SECRET`, `UPLOADTHING_APP_ID`
  - Implementation: `packages/backend/src/config/index.js`, frontend components

## Data Storage

**Databases:**

- **MongoDB** (`mongoose` 9.6.2):
  - Used for: Structured paper metadata, chunk collections
  - Connection: `MONGODB_URI`
  - Models: `packages/backend/src/models/Paper.js`, `packages/backend/src/models/PaperChunk.js`
- **In-Memory Store** (Fallback):
  - In-memory paper and vector indexing via `packages/backend/src/services/paperStore.js` and `packages/backend/src/services/vectorService.js`

**File Storage:**

- Base64 direct payload processing via `/api/upload/base64`
- Multi-part file buffer parsing via `pdf-parse`

**Caching & Vector Storage:**

- Local in-memory cosine similarity and embedding cache in `packages/backend/src/services/vectorService.js`

## Authentication & Identity

**Auth Provider:**

- **Clerk** (`@clerk/clerk-react`, `@clerk/express`):
  - Frontend: `packages/frontend/src/pages/SpaceAuthPage.tsx`
  - Backend: Optional middleware via `CLERK_SECRET_KEY` in `packages/backend/src/config/index.js`
  - Publishable Key: `VITE_CLERK_PUBLISHABLE_KEY`

## Monitoring & Observability

**Error Tracking:**

- None external; structured logging via `winston`

**Logs:**

- Console logger with Winston levels configured in backend services

## CI/CD & Deployment

**Hosting:**

- Local development via `npm run dev` (concurrent backend on :3001 and frontend on :5173)

**CI Pipeline:**

- None configured in repository

## Environment Configuration

**Required env vars:**

- `GEMINI_API_KEY` - Google AI Studio API key
- `MODELSCOPE_API_KEY` - ModelScope access key (optional/fallback)
- `GROQ_API_KEY` - Groq API key (optional)
- `PORT` - Backend HTTP port (defaults to 3001)

**Secrets location:**

- Local `packages/backend/.env` file (gitignored)

## Webhooks & Callbacks

**Incoming:**

- None

**Outgoing:**

- None

---

*Integration audit: 2026-09-20*
