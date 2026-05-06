# Development Phases

## 1. Overview

The AI Research Paper Analyzer is developed across **5 phases** over a **10-week timeline**. Each phase has defined deliverables, dependencies, and exit criteria.

---

## 2. Phase Timeline

```
Week  1   2   3   4   5   6   7   8   9   10
      ├───┤───┤───┤───┤───┤───┤───┤───┤───┤───┤
      │ Phase 1   │ Phase 2   │ Phase 3   │ P4  │ P5│
      │Foundation │Core Pipeln│RAG+Genertn│ FE  │Pol│
      └───────────┴───────────┴───────────┴─────┴───┘
```

---

## 3. Phase Details

---

### Phase 1: Foundation Setup (Weeks 1–2)

**Goal:** Establish project infrastructure, development environment, and CI/CD pipeline.

| Task | Owner | Priority | Est. |
|---|---|---|---|
| Initialize monorepo with npm workspaces | Backend | P0 | 2h |
| Set up Express server boilerplate | Backend | P0 | 3h |
| Scaffold React project with Vite | Frontend | P0 | 2h |
| Create PostgreSQL schema + migrations | Backend | P0 | 4h |
| Set up Docker Compose (Postgres, Chroma) | DevOps | P0 | 3h |
| Configure ESLint, Prettier, Husky hooks | DevOps | P0 | 2h |
| Set up GitHub Actions CI pipeline | DevOps | P0 | 3h |
| Create `.env.example` and config module | Backend | P0 | 1h |
| Implement health check endpoint | Backend | P0 | 1h |
| Set up Winston logger | Backend | P1 | 2h |
| Create shared constants package | Shared | P1 | 1h |
| Write project README | Docs | P1 | 1h |

**Exit Criteria:**
- [x] `npm run dev` starts both frontend and backend
- [x] Docker Compose spins up Postgres + Chroma
- [x] `GET /health` returns 200
- [x] CI pipeline runs lint + tests on push
- [x] Database migrations execute successfully

**Dependencies:** None

---

### Phase 2: Core Processing Pipeline (Weeks 3–4)

**Goal:** Implement PDF upload, text extraction, chunking, and embedding storage.

| Task | Owner | Priority | Est. |
|---|---|---|---|
| Implement `POST /upload` endpoint | Backend | P0 | 4h |
| Add Multer file upload middleware | Backend | P0 | 2h |
| Build file validation middleware (type, size) | Backend | P0 | 3h |
| Integrate `pdf-parse` for text extraction | Backend | P0 | 4h |
| Build chunking engine (512 tokens, 50 overlap) | Backend | P0 | 6h |
| Implement text cleaning utilities | Backend | P0 | 3h |
| Integrate embedding API (OpenAI) | Backend | P0 | 4h |
| Store embeddings in Chroma vector DB | Backend | P0 | 4h |
| Build paper status tracking (DB updates) | Backend | P0 | 3h |
| Create Upload Zone UI component | Frontend | P0 | 4h |
| Build Upload Progress indicator | Frontend | P1 | 3h |
| Write unit tests for chunking engine | Testing | P0 | 3h |
| Write integration tests for upload endpoint | Testing | P0 | 4h |

**Exit Criteria:**
- [x] PDF upload creates paper record in DB
- [x] Text is extracted and chunked correctly
- [x] Embeddings are stored in Chroma
- [x] Status transitions: uploading → extracting → chunking → embedding → ready
- [x] Invalid files are rejected with proper error messages
- [x] All unit and integration tests pass

**Dependencies:** Phase 1 complete

---

### Phase 3: RAG Pipeline & Generation (Weeks 5–6)

**Goal:** Implement the query pipeline, summary generation, and scoring engine.

| Task | Owner | Priority | Est. |
|---|---|---|---|
| Build query embedding service | Backend | P0 | 3h |
| Implement top-k vector retrieval from Chroma | Backend | P0 | 4h |
| Design and implement RAG prompt templates | Backend | P0 | 6h |
| Integrate LLM API (OpenAI GPT-4) | Backend | P0 | 4h |
| Implement `POST /papers/:id/ask` endpoint | Backend | P0 | 4h |
| Implement `POST /papers/:id/summary` endpoint | Backend | P0 | 5h |
| Build relevance scoring module | Backend | P0 | 4h |
| Build groundedness scoring module | Backend | P1 | 6h |
| Implement confidence score aggregation | Backend | P1 | 3h |
| Create strict system prompts (zero hallucination) | Backend | P0 | 4h |
| Store conversations in DB | Backend | P0 | 2h |
| Write unit tests for scoring engine | Testing | P0 | 4h |
| Write integration tests for Q&A and summary | Testing | P0 | 5h |

**Exit Criteria:**
- [x] Q&A returns grounded answers with source chunks
- [x] Summary generates 5 structured sections
- [x] Ungrounded queries return fallback response
- [x] Relevance scores are >= 0.7 for returned chunks
- [x] Response time < 5s for Q&A (P95)
- [x] All scoring tests pass

**Dependencies:** Phase 2 complete

---

### Phase 4: Frontend Integration (Weeks 7–8)

**Goal:** Build the complete user interface and integrate with backend APIs.

| Task | Owner | Priority | Est. |
|---|---|---|---|
| Build Q&A Chat component | Frontend | P0 | 6h |
| Build Message Bubble (question/answer) | Frontend | P0 | 3h |
| Build Question Input with submit | Frontend | P0 | 2h |
| Build Summary Panel with tabbed sections | Frontend | P0 | 6h |
| Build Summary Section component | Frontend | P0 | 3h |
| Build Source Attribution display | Frontend | P0 | 4h |
| Build Rating Buttons (thumbs up/down) | Frontend | P1 | 2h |
| Build Status Badge component | Frontend | P0 | 2h |
| Build Error Boundary component | Frontend | P0 | 2h |
| Build Loading Spinner / Skeleton screens | Frontend | P0 | 2h |
| Implement API service layer (Axios) | Frontend | P0 | 3h |
| Implement custom hooks (useUpload, useChat, useSummary) | Frontend | P0 | 4h |
| Implement responsive layout (desktop/tablet/mobile) | Frontend | P0 | 4h |
| Implement dark mode toggle | Frontend | P1 | 3h |
| Write component unit tests | Testing | P0 | 6h |
| Conduct cross-browser testing | Testing | P1 | 3h |

**Exit Criteria:**
- [x] Full upload → summary → Q&A flow works in browser
- [x] Source chunks are displayed with answers
- [x] Responsive on desktop, tablet, and mobile
- [x] Error states display correctly
- [x] Loading states show during API calls
- [x] All component tests pass

**Dependencies:** Phase 3 complete (backend APIs functional)

---

### Phase 5: Polish, Testing & Deployment (Weeks 9–10)

**Goal:** End-to-end testing, performance optimization, security hardening, and production deployment.

| Task | Owner | Priority | Est. |
|---|---|---|---|
| End-to-end testing (full user flows) | Testing | P0 | 6h |
| Performance profiling & optimization | Backend | P0 | 4h |
| Security audit (API keys, CORS, validation) | Backend | P0 | 3h |
| Load testing (100 concurrent users) | Testing | P1 | 4h |
| Set up production environment variables | DevOps | P0 | 2h |
| Deploy frontend to Vercel | DevOps | P0 | 2h |
| Deploy backend to Railway/Render | DevOps | P0 | 3h |
| Set up Pinecone (production vector DB) | DevOps | P0 | 2h |
| Set up production PostgreSQL | DevOps | P0 | 2h |
| Configure monitoring & alerting | DevOps | P1 | 3h |
| Write deployment documentation | Docs | P1 | 2h |
| Finalize all project documentation | Docs | P1 | 3h |
| Smoke test on production | Testing | P0 | 2h |
| Bug fixes and final polish | All | P0 | 6h |

**Exit Criteria:**
- [x] All E2E tests pass
- [x] Production deployment accessible and functional
- [x] P95 Q&A latency < 5s on production
- [x] No high/critical security vulnerabilities
- [x] Monitoring and alerting configured
- [x] Documentation complete

**Dependencies:** Phase 4 complete

---

## 4. Resource Allocation

| Role | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 |
|---|---|---|---|---|---|
| **Backend Engineer** | 60% | 80% | 90% | 20% | 40% |
| **Frontend Engineer** | 20% | 20% | 10% | 80% | 30% |
| **DevOps** | 20% | 10% | 0% | 0% | 40% |
| **QA / Testing** | 0% | 15% | 20% | 20% | 50% |

---

## 5. Risk Mitigation per Phase

| Phase | Key Risk | Mitigation |
|---|---|---|
| Phase 1 | Dependency version conflicts | Pin versions, test Docker builds early |
| Phase 2 | Poor PDF parsing quality | Test with diverse PDFs from day 1 |
| Phase 3 | LLM hallucinations | Iteratively refine prompts with test set |
| Phase 4 | API integration mismatches | Use API contracts doc as source of truth |
| Phase 5 | Production environment differences | Mirror production config in staging |
