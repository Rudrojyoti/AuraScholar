# System Architecture

## 1. Overview

The AI Research Paper Analyzer implements a Retrieval-Augmented Generation (RAG) pipeline to provide grounded, hallucination-minimized analysis of research papers. This document describes the system's architectural design, component interaction, deployment model, and scalability strategy.

---

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                               │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                     React Frontend (SPA)                      │  │
│  │  ┌────────────┐  ┌─────────────┐  ┌────────────────────────┐ │  │
│  │  │ Upload     │  │ Summary     │  │ Q&A Chat               │ │  │
│  │  │ Component  │  │ Component   │  │ Component              │ │  │
│  │  └─────┬──────┘  └──────┬──────┘  └──────────┬─────────────┘ │  │
│  │        │                │                     │               │  │
│  │        └────────────────┼─────────────────────┘               │  │
│  │                         │                                     │  │
│  │                  ┌──────▼──────┐                               │  │
│  │                  │ API Client  │ (Axios / Fetch)               │  │
│  │                  └──────┬──────┘                               │  │
│  └─────────────────────────┼─────────────────────────────────────┘  │
│                            │  HTTP/REST                              │
└────────────────────────────┼────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY LAYER                           │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                   Node.js + Express Server                    │  │
│  │                                                               │  │
│  │  ┌──────────┐  ┌──────────────┐  ┌─────────────────────────┐│  │
│  │  │ Routes   │  │ Middleware   │  │ Controllers             ││  │
│  │  │ /upload  │  │ - CORS       │  │ - UploadController      ││  │
│  │  │ /ask     │  │ - Validation │  │ - QueryController       ││  │
│  │  │ /summary │  │ - Rate Limit │  │ - SummaryController     ││  │
│  │  └──────────┘  │ - Error Hdlr │  └─────────────────────────┘│  │
│  │                └──────────────┘                               │  │
│  └──────────┬──────────────┬──────────────────┬──────────────────┘  │
│             │              │                  │                      │
└─────────────┼──────────────┼──────────────────┼─────────────────────┘
              │              │                  │
              ▼              ▼                  ▼
┌─────────────────┐ ┌───────────────┐ ┌────────────────────┐
│  PROCESSING     │ │  RETRIEVAL    │ │  GENERATION        │
│  LAYER          │ │  LAYER        │ │  LAYER             │
│                 │ │               │ │                    │
│ ┌─────────────┐│ │ ┌───────────┐ │ │ ┌────────────────┐ │
│ │ pdf-parse   ││ │ │ Embedding │ │ │ │  LLM API       │ │
│ │ (Extract)   ││ │ │ API       │ │ │ │  (GPT/Claude)  │ │
│ └──────┬──────┘│ │ └─────┬─────┘ │ │ └────────┬───────┘ │
│        │       │ │       │       │ │          │         │
│ ┌──────▼──────┐│ │ ┌─────▼─────┐ │ │ ┌────────▼───────┐ │
│ │ Chunking    ││ │ │ Vector DB │ │ │ │ Prompt Engine  │ │
│ │ Engine      ││ │ │ Chroma /  │ │ │ │ (RAG Strict)   │ │
│ │             ││ │ │ Pinecone  │ │ │ │                │ │
│ └─────────────┘│ │ └───────────┘ │ │ └────────────────┘ │
│                 │ │               │ │                    │
└─────────────────┘ └───────────────┘ └────────────────────┘
```

---

## 3. Component Specifications

### 3.1 Frontend Layer — React SPA

| Aspect | Detail |
|---|---|
| **Framework** | React 18+ with functional components and hooks |
| **State Management** | React Context API / Zustand (lightweight) |
| **HTTP Client** | Axios with interceptors for error handling |
| **Styling** | CSS Modules or Styled Components |
| **Build Tool** | Vite |
| **Key Components** | `UploadZone`, `SummaryPanel`, `QAChat`, `StatusBadge` |

### 3.2 API Layer — Node.js + Express

| Aspect | Detail |
|---|---|
| **Runtime** | Node.js 20 LTS |
| **Framework** | Express 4.x |
| **File Handling** | `multer` for multipart uploads |
| **Validation** | `express-validator` + custom middleware |
| **Rate Limiting** | `express-rate-limit` (100 req/min per IP) |
| **CORS** | Configured for frontend origin only |
| **Logging** | `winston` with structured JSON logging |

### 3.3 Processing Layer

| Component | Technology | Purpose |
|---|---|---|
| **PDF Extraction** | `pdf-parse` | Extract raw text from PDF files |
| **Chunking Engine** | Custom (recursive character splitter) | Split text into overlapping chunks (512 tokens, 50 token overlap) |
| **Text Cleaning** | Custom utils | Remove headers/footers, normalize whitespace, handle special characters |

### 3.4 Retrieval Layer

| Component | Technology | Purpose |
|---|---|---|
| **Embedding API** | OpenAI `text-embedding-3-small` / Cohere | Convert text chunks into vector representations |
| **Vector Database** | Chroma (dev) / Pinecone (prod) | Store and retrieve embeddings via similarity search |
| **Retrieval Strategy** | Top-k cosine similarity (k=5) | Fetch most relevant chunks for a query |

### 3.5 Generation Layer

| Component | Technology | Purpose |
|---|---|---|
| **LLM API** | OpenAI GPT-4 / Claude 3 | Generate grounded responses from retrieved context |
| **Prompt Engine** | Custom template system | Construct strict RAG prompts with system instructions |
| **Temperature** | 0.2 | Low creativity for factual accuracy |
| **Response Validation** | Post-processing checks | Verify response is grounded in provided context |

---

## 4. Data Flow

### 4.1 Upload & Ingestion Pipeline

```
User uploads PDF
       │
       ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Validate    │────▶│  Extract     │────▶│  Clean       │
│  (type, size)│     │  (pdf-parse) │     │  (normalize) │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                                  ▼
                     ┌──────────────┐     ┌──────────────┐
                     │  Store in    │◀────│  Generate    │
                     │  Vector DB   │     │  Embeddings  │
                     └──────────────┘     └──────────────┘
                                                  ▲
                                                  │
                                          ┌──────────────┐
                                          │  Chunk Text  │
                                          │  (512 tokens)│
                                          └──────────────┘
```

### 4.2 Query Pipeline

```
User asks question
       │
       ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Embed       │────▶│  Retrieve    │────▶│  Construct   │
│  Question    │     │  Top-5 Chunks│     │  RAG Prompt  │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                                  ▼
                                          ┌──────────────┐
                                          │  LLM         │
                                          │  Generate    │
                                          │  Response    │
                                          └──────┬───────┘
                                                  │
                                                  ▼
                                          ┌──────────────┐
                                          │  Validate &  │
                                          │  Return      │
                                          └──────────────┘
```

---

## 5. Security Architecture

### 5.1 Defense Layers

```
        Internet
            │
     ┌──────▼──────┐
     │  HTTPS/TLS  │ ── Encrypted transport
     └──────┬──────┘
            │
     ┌──────▼──────┐
     │  CORS       │ ── Origin restriction
     └──────┬──────┘
            │
     ┌──────▼──────┐
     │  Rate Limit │ ── DDoS prevention
     └──────┬──────┘
            │
     ┌──────▼──────┐
     │  Input      │ ── File validation, sanitization
     │  Validation │
     └──────┬──────┘
            │
     ┌──────▼──────┐
     │  API Key    │ ── Server-side only, env vars
     │  Protection │
     └──────────────┘
```

### 5.2 Security Measures

| Layer | Measure | Implementation |
|---|---|---|
| **Transport** | HTTPS/TLS 1.3 | Reverse proxy (Nginx/Caddy) |
| **Input** | PDF-only validation | MIME type + magic bytes check |
| **Input** | Size limit | 20 MB max enforced at Multer level |
| **Input** | Filename sanitization | Strip path traversal characters |
| **API** | Rate limiting | 100 requests/min per IP |
| **API** | CORS | Whitelist frontend origin |
| **Secrets** | API key protection | `.env` + `dotenv`, never in client bundle |
| **Prompts** | Strict RAG prompting | System prompt prevents hallucination |

---

## 6. Scalability Strategy

### 6.1 Horizontal Scaling Points

| Component | Scaling Strategy |
|---|---|
| **Frontend** | CDN deployment (Vercel/Netlify), static assets |
| **API Server** | Multiple instances behind load balancer, stateless design |
| **Vector DB** | Pinecone (managed, auto-scales) or Chroma cluster |
| **LLM/Embedding** | API-based, scales with provider's infrastructure |

### 6.2 Performance Targets

| Operation | Target Latency | Strategy |
|---|---|---|
| PDF Upload (10-page) | < 2s | Streaming upload |
| Text Extraction | < 5s | Async processing |
| Embedding Generation | < 5s | Batch embedding API calls |
| Q&A Response | < 5s | Cached embeddings, optimized retrieval |
| Summary Generation | < 15s | Parallel section generation |

---

## 7. Technology Stack Summary

| Layer | Technology | Justification |
|---|---|---|
| **Frontend** | React 18, Vite | Fast development, rich ecosystem, SPA support |
| **Backend** | Node.js 20, Express 4 | JavaScript full-stack, async I/O for API calls |
| **PDF Parsing** | `pdf-parse` | Lightweight, well-maintained npm package |
| **Embeddings** | OpenAI / Cohere API | State-of-the-art quality, managed service |
| **Vector Store** | Chroma (dev) / Pinecone (prod) | Dev flexibility + production reliability |
| **LLM** | OpenAI GPT-4 / Claude | Best-in-class generation quality |
| **Deployment** | Docker, Vercel (FE), Railway/Render (BE) | Simplified CI/CD, managed infrastructure |
