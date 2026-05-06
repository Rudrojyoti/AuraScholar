# Engineering Scope Definition

## 1. Overview

This document defines the engineering scope, boundaries, and deliverables for the AI Research Paper Analyzer. It clarifies what is included in each development phase, what is explicitly excluded, and the technical constraints guiding implementation.

---

## 2. Scope Summary

### 2.1 In Scope (MVP — Phase 1)

| Area | Deliverables |
|---|---|
| **Frontend** | React SPA with upload zone, summary panel, Q&A chat |
| **Backend** | Node.js + Express API with 3 core endpoints (`/upload`, `/ask`, `/generate-summary`) |
| **PDF Processing** | Text extraction via `pdf-parse`, recursive character chunking (512 tokens, 50 overlap) |
| **Embedding** | API-based embedding (OpenAI `text-embedding-3-small` or Cohere) |
| **Vector Storage** | Chroma (development) / Pinecone (production) |
| **LLM Integration** | API-based generation (OpenAI GPT-4 / Claude) with strict RAG prompts |
| **Scoring** | Relevance scoring on retrieval, basic groundedness check |
| **Security** | File validation, CORS, rate limiting, API key protection |
| **DevOps** | Docker Compose for local dev, CI pipeline (lint + test) |
| **Testing** | Unit tests for services, integration tests for API endpoints |

### 2.2 In Scope (Phase 2 — Post-MVP)

| Area | Deliverables |
|---|---|
| **Authentication** | JWT-based user auth |
| **Multi-Paper** | Upload and query across multiple papers |
| **History** | Persistent conversation history per user |
| **Advanced Scoring** | Cross-encoder re-ranking, full groundedness scoring pipeline |
| **Export** | Summary export (Markdown, PDF) |
| **Dark Mode** | Theme toggle with persisted preference |

### 2.3 Out of Scope

| Area | Reason |
|---|---|
| OCR / scanned PDF support | Requires separate ML pipeline, out of MVP budget |
| Multi-language support | English-only for initial release |
| Mobile native apps | Web-first approach, responsive design sufficient |
| Real-time collaboration | Not aligned with core use case |
| Citation graph analysis | Requires external data sources (Semantic Scholar, etc.) |
| Self-hosted LLM | API-based dependency simplifies infra, reduces cost |
| User analytics dashboard | Logging sufficient for MVP; dashboard planned for v2 |
| Payment / subscription | Free for MVP; monetization planned for v3 |

---

## 3. Technical Boundaries

### 3.1 Performance Constraints

| Constraint | Specification | Rationale |
|---|---|---|
| Max PDF size | 20 MB | Server memory limits, API cost control |
| Max pages per PDF | 100 pages | Chunk/embedding budget |
| Chunk size | 512 tokens | Optimal for embedding model context window |
| Chunk overlap | 50 tokens | Preserve context across boundaries |
| Top-k retrieval | 5 chunks | Balance between context and cost |
| LLM temperature | 0.2 | High factual accuracy, low creativity |
| Response timeout | 30 seconds | UX threshold for user patience |
| Rate limit — upload | 10 req/min/IP | Prevent abuse |
| Rate limit — query | 30 req/min/IP | Reasonable usage |

### 3.2 Third-Party Dependencies

| Dependency | Type | Fallback |
|---|---|---|
| OpenAI API | Embedding + LLM | Cohere / Anthropic |
| Chroma | Vector DB (dev) | Pinecone (prod) |
| Pinecone | Vector DB (prod) | Weaviate |
| PostgreSQL | Relational DB | SQLite (dev only) |
| Vercel | Frontend hosting | Netlify |
| Railway / Render | Backend hosting | Fly.io |

---

## 4. Engineering Deliverables per Milestone

### Milestone 1: Foundation (Week 1–2)
- [ ] Monorepo setup with npm workspaces
- [ ] Express server boilerplate with health endpoint
- [ ] React project scaffolding with Vite
- [ ] PostgreSQL schema + migrations
- [ ] Docker Compose for local development
- [ ] CI pipeline (ESLint + Prettier + tests)

### Milestone 2: Core Pipeline (Week 3–4)
- [ ] PDF upload endpoint with validation
- [ ] Text extraction with `pdf-parse`
- [ ] Chunking engine (512 tokens, 50 overlap)
- [ ] Embedding integration (OpenAI API)
- [ ] Vector DB storage (Chroma)
- [ ] Upload UI component with progress indicator

### Milestone 3: RAG & Generation (Week 5–6)
- [ ] Query embedding pipeline
- [ ] Top-k Vector retrieval
- [ ] Strict RAG prompt construction
- [ ] LLM API integration for Q&A
- [ ] Summary generation endpoint
- [ ] Scoring engine (relevance + groundedness)

### Milestone 4: Frontend Integration (Week 7–8)
- [ ] Q&A chat interface
- [ ] Summary panel with tabbed sections
- [ ] Source attribution display
- [ ] Error handling & loading states
- [ ] Responsive layout (desktop + tablet + mobile)

### Milestone 5: Polish & Deploy (Week 9–10)
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Production deployment (Vercel + Railway)
- [ ] Documentation finalization

---

## 5. Acceptance Criteria for Scope Completion

| Criterion | Measurement |
|---|---|
| All 3 API endpoints functional | Integration test pass |
| PDF upload → summary works end-to-end | Manual E2E test |
| Q&A returns grounded answers | Groundedness score > 0.7 on test set |
| Response time < 5s for Q&A | P95 latency measurement |
| Response time < 15s for summary | P95 latency measurement |
| Zero API keys exposed in client | Security audit |
| CI pipeline passes on all branches | GitHub Actions green |
| Production deployment accessible | Smoke test on production URL |

---

## 6. Risk Register

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| LLM API cost exceeds budget | Medium | High | Token usage monitoring, response caching |
| PDF parsing fails on complex layouts | Medium | Medium | Fallback parsing, pre-validation |
| Vector DB latency spikes | Low | Medium | Connection pooling, retry logic |
| Scope creep from stakeholders | High | Medium | Strict scope document, change request process |
| Developer availability issues | Medium | High | Documentation, modular architecture |
