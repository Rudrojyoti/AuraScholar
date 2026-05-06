# Testing Strategy

## 1. Overview

This document defines the testing strategy for the AI Research Paper Analyzer, covering unit, integration, end-to-end, performance, and security testing. The goal is to ensure reliability, accuracy, and zero-hallucination compliance across the RAG pipeline.

---

## 2. Testing Pyramid

```
                    ┌─────────┐
                    │  E2E    │   ~10% of tests
                    │  Tests  │   Cypress / Playwright
                    ├─────────┤
                    │  Integr │   ~30% of tests
                    │  Tests  │   Supertest + Test DB
                    ├─────────┤
                    │  Unit   │   ~60% of tests
                    │  Tests  │   Jest / Vitest
                    └─────────┘
```

| Layer | Framework | Count (Target) | Coverage Target |
|---|---|---|---|
| **Unit Tests** | Jest (backend), Vitest (frontend) | ~120 tests | 80% line coverage |
| **Integration Tests** | Supertest + Jest | ~40 tests | 100% endpoint coverage |
| **E2E Tests** | Playwright | ~15 scenarios | All critical user flows |
| **Performance Tests** | k6 / Artillery | ~5 scenarios | P95 latency within SLA |

---

## 3. Unit Testing

### 3.1 Backend Unit Tests

#### Chunking Engine
```
tests/unit/chunker.test.js
├── should split text into chunks of 512 tokens
├── should create 50-token overlap between chunks
├── should handle text shorter than chunk size
├── should handle empty input gracefully
├── should preserve sentence boundaries where possible
├── should assign sequential chunk indices
└── should calculate accurate token counts
```

#### Text Cleaner
```
tests/unit/textCleaner.test.js
├── should remove excessive whitespace
├── should normalize line breaks
├── should strip headers/footers
├── should handle special characters
├── should preserve meaningful formatting
└── should handle empty strings
```

#### Scoring Engine
```
tests/unit/scoringService.test.js
├── calculateChunkQuality
│   ├── should return high score for information-dense chunks
│   ├── should return low score for sparse/empty chunks
│   ├── should penalize chunks with excessive special characters
│   └── should return 0 for empty input
├── calculateRelevance
│   ├── should return high score for semantically similar content
│   ├── should return low score for unrelated content
│   └── should handle edge cases (identical vectors, zero vectors)
├── calculateGroundedness
│   ├── should return 1.0 when all claims are supported
│   ├── should return 0.0 when no claims are supported
│   ├── should correctly identify partially grounded responses
│   └── should handle single-sentence answers
└── calculateConfidence
    ├── should weight groundedness at 50%
    ├── should return HIGH for scores >= 0.85
    ├── should return LOW for scores < 0.65
    └── should return correct breakdown
```

#### PDF Service
```
tests/unit/pdfService.test.js
├── should extract text from valid PDF
├── should throw error for corrupted PDF
├── should handle multi-page PDFs
├── should extract page count
└── should handle PDFs with images (text-only extraction)
```

#### Prompt Templates
```
tests/unit/prompts.test.js
├── qaPrompt
│   ├── should include system instruction for grounding
│   ├── should include all source chunks in context
│   ├── should include the user question
│   └── should enforce "not available" response for missing info
├── summaryPrompt
│   ├── should request all 5 summary sections
│   ├── should include grounding instructions
│   └── should specify output format
└── systemPrompt
    ├── should contain hallucination prevention rules
    └── should contain source-only response instructions
```

### 3.2 Frontend Unit Tests

#### Components
```
tests/components/
├── UploadZone.test.jsx
│   ├── should render drag-and-drop area
│   ├── should accept PDF files
│   ├── should reject non-PDF files
│   ├── should show file size error for large files
│   └── should display upload progress
├── SummaryPanel.test.jsx
│   ├── should render all 5 summary tabs
│   ├── should display summary content
│   ├── should handle empty sections
│   └── should support copy to clipboard
├── QAChat.test.jsx
│   ├── should render question input
│   ├── should display message bubbles
│   ├── should show loading state during API call
│   ├── should display source attribution
│   └── should show error on failed request
└── RatingButtons.test.jsx
    ├── should render thumbs up/down buttons
    ├── should call API on rating click
    └── should toggle active state on selection
```

#### Hooks
```
tests/hooks/
├── useUpload.test.js
│   ├── should track upload state
│   ├── should handle upload errors
│   └── should reset state on new upload
├── useChat.test.js
│   ├── should maintain conversation history
│   ├── should handle API errors
│   └── should clear history
└── useSummary.test.js
    ├── should fetch and store summary
    ├── should detect existing summary
    └── should handle generation errors
```

---

## 4. Integration Testing

### 4.1 API Endpoint Tests

```
tests/integration/
├── upload.integration.test.js
│   ├── POST /upload — should accept valid PDF and return 201
│   ├── POST /upload — should reject non-PDF with 400
│   ├── POST /upload — should reject oversized file with 400
│   ├── POST /upload — should detect duplicate paper with 409
│   └── POST /upload — should process PDF and set status to 'ready'
├── query.integration.test.js
│   ├── POST /papers/:id/ask — should return grounded answer
│   ├── POST /papers/:id/ask — should include source chunks
│   ├── POST /papers/:id/ask — should reject empty question with 400
│   ├── POST /papers/:id/ask — should reject when paper not ready with 409
│   └── POST /papers/:id/ask — should return fallback for unanswerable questions
├── summary.integration.test.js
│   ├── POST /papers/:id/summary — should generate 5-section summary
│   ├── GET /papers/:id/summary — should retrieve existing summary
│   ├── POST /papers/:id/summary — should reject when paper not ready
│   └── POST /papers/:id/summary — should reject duplicate generation
├── paper.integration.test.js
│   ├── GET /papers/:id — should return paper metadata
│   ├── GET /papers/:id — should return 404 for unknown ID
│   └── DELETE /papers/:id — should cascade delete all data
└── health.integration.test.js
    ├── GET /health — should return 200 with service status
    └── GET /health — should report unhealthy when DB is down
```

### 4.2 Database Integration

```
tests/integration/database/
├── paperModel.test.js — CRUD operations on papers table
├── chunkModel.test.js — Chunk storage and retrieval
├── summaryModel.test.js — Summary creation and retrieval
├── conversationModel.test.js — Conversation logging
└── cascadeDelete.test.js — Verify CASCADE on paper delete
```

### 4.3 Test Database Setup

```javascript
// tests/setup.js
beforeAll(async () => {
  await db.migrate.latest();    // Run migrations on test DB
  await db.seed.run();           // Seed test data
});

afterEach(async () => {
  await db('conversations').del();
  await db('summaries').del();
  await db('chunks').del();
  await db('papers').del();
});

afterAll(async () => {
  await db.destroy();
});
```

---

## 5. End-to-End Testing

### 5.1 E2E Test Scenarios (Playwright)

```
tests/e2e/
├── upload-flow.spec.js
│   ├── should upload PDF and see processing status
│   ├── should show ready status when processing completes
│   └── should display error for invalid file
├── summary-flow.spec.js
│   ├── should generate summary after upload
│   ├── should display all 5 summary sections
│   └── should copy summary to clipboard
├── qa-flow.spec.js
│   ├── should ask question and receive grounded answer
│   ├── should display source chunks with answer
│   ├── should show conversation history
│   └── should rate an answer (thumbs up/down)
├── error-handling.spec.js
│   ├── should display network error gracefully
│   ├── should handle LLM timeout
│   └── should show retry option on failure
└── responsive.spec.js
    ├── should render correctly on desktop (1920x1080)
    ├── should render correctly on tablet (768x1024)
    └── should render correctly on mobile (375x812)
```

---

## 6. RAG-Specific Testing

### 6.1 Hallucination Testing

The most critical test category for this system.

```
tests/rag/
├── groundedness.test.js
│   ├── should NOT generate information not in source
│   ├── should return "not available" for out-of-scope questions
│   ├── should attribute all claims to source chunks
│   ├── should not confuse information between chunks
│   └── should not embellish factual data
├── retrieval-quality.test.js
│   ├── should retrieve relevant chunks for topic questions
│   ├── should handle ambiguous queries gracefully
│   ├── should return consistent results for same query
│   └── should not return irrelevant chunks
└── prompt-injection.test.js
    ├── should resist "ignore previous instructions" attacks
    ├── should not reveal system prompt
    └── should maintain grounding constraints under adversarial input
```

### 6.2 Benchmark Test Set

Maintain a curated set of papers with known ground-truth answers:

| Paper | Questions | Expected Answers | Purpose |
|---|---|---|---|
| `attention-is-all-you-need.pdf` | 10 | Pre-verified | Standard benchmark |
| `bert-paper.pdf` | 10 | Pre-verified | NLP domain |
| `resnet-paper.pdf` | 10 | Pre-verified | CV domain |
| `unanswerable-questions.json` | 15 | "Not available" | Hallucination detection |

```javascript
// tests/rag/benchmark.test.js
describe('RAG Benchmark', () => {
  const benchmarkPapers = loadBenchmarkSet();

  for (const paper of benchmarkPapers) {
    for (const qa of paper.questions) {
      it(`[${paper.name}] ${qa.question}`, async () => {
        const response = await askQuestion(paper.id, qa.question);
        const groundedness = calculateGroundedness(response.answer, paper.chunks);
        expect(groundedness).toBeGreaterThanOrEqual(0.7);
      });
    }
  }
});
```

---

## 7. Performance Testing

### 7.1 Load Test Scenarios (k6)

```javascript
// tests/performance/load-test.js
export const options = {
  stages: [
    { duration: '1m', target: 10 },   // Ramp up
    { duration: '3m', target: 50 },   // Sustain
    { duration: '1m', target: 100 },  // Peak
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'],  // 95% of requests < 5s
    http_req_failed: ['rate<0.01'],     // < 1% failure rate
  },
};
```

### 7.2 Performance Targets

| Metric | Target | Measurement |
|---|---|---|
| Q&A response time (P95) | < 5,000 ms | k6 latency metric |
| Summary generation time (P95) | < 15,000 ms | k6 latency metric |
| Upload processing time | < 30,000 ms | Server-side instrumentation |
| Concurrent users | 100 | Sustained for 3 minutes |
| Error rate under load | < 1% | k6 failure rate |

---

## 8. Security Testing

### 8.1 Security Test Cases

| Category | Test | Tool |
|---|---|---|
| File validation | Upload non-PDF disguised as PDF | Manual + automated |
| File validation | Upload PDF with embedded scripts | Manual |
| Path traversal | Filename with `../` sequences | Automated |
| Rate limiting | Exceed rate limit, verify 429 response | k6 |
| CORS | Cross-origin request from unauthorized origin | Browser + curl |
| API key exposure | Verify no keys in client bundle | Build inspection |
| Prompt injection | "Ignore previous instructions" in query | Automated |
| SQL injection | Malicious input in question field | SQLMap / manual |
| XSS | Script tags in question input | Manual |

---

## 9. Test Configuration

### 9.1 Test Scripts (package.json)

```json
{
  "scripts": {
    "test": "npm test --workspaces",
    "test:unit": "jest --config jest.unit.config.js",
    "test:integration": "jest --config jest.integration.config.js --runInBand",
    "test:e2e": "playwright test",
    "test:perf": "k6 run tests/performance/load-test.js",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch"
  }
}
```

### 9.2 CI Integration

```yaml
# In CI pipeline
- name: Unit Tests
  run: npm run test:unit

- name: Integration Tests
  run: npm run test:integration
  env:
    DATABASE_URL: postgresql://test:testpass@localhost:5432/test_db

- name: E2E Tests
  run: npm run test:e2e

- name: Coverage Report
  run: npm run test:coverage
  
- name: Upload Coverage
  uses: codecov/codecov-action@v4
```

---

## 10. Test Quality Gates

All PRs must pass these gates before merge:

| Gate | Requirement |
|---|---|
| Unit tests | 100% pass, ≥ 80% coverage |
| Integration tests | 100% pass |
| Linting | Zero ESLint errors |
| Build | Successful frontend + backend build |
| Type safety | No type errors (if using TypeScript) |

Production releases additionally require:

| Gate | Requirement |
|---|---|
| E2E tests | 100% pass |
| RAG benchmark | Groundedness ≥ 0.7 on all benchmark papers |
| Performance | P95 latency within SLA |
| Security scan | No high/critical vulnerabilities |
