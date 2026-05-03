# API Contracts

## 1. Overview

This document defines the REST API contracts for the AI Research Paper Analyzer backend. All endpoints are served by the Node.js + Express server.

**Base URL:** `http://localhost:3001/api/v1`
**Content Type:** `application/json` (unless otherwise specified)
**Authentication:** None (MVP) — API key–based auth planned for v2

---

## 2. Endpoints Summary

| Method | Endpoint | Description | Priority |
|---|---|---|---|
| `POST` | `/upload` | Upload and process a PDF research paper | P0 |
| `GET` | `/papers/:paperId` | Get paper metadata and status | P0 |
| `DELETE` | `/papers/:paperId` | Delete a paper and all associated data | P1 |
| `POST` | `/papers/:paperId/ask` | Ask a question about a paper | P0 |
| `POST` | `/papers/:paperId/summary` | Generate structured summary | P0 |
| `GET` | `/papers/:paperId/summary` | Retrieve existing summary | P0 |
| `GET` | `/papers/:paperId/conversations` | Get conversation history | P1 |
| `POST` | `/papers/:paperId/conversations/:convId/rate` | Rate an answer | P2 |
| `GET` | `/health` | Health check | P0 |

---

## 3. Endpoint Specifications

---

### 3.1 `POST /upload`

Upload a PDF file for processing.

**Request:**
- Content-Type: `multipart/form-data`

| Field | Type | Required | Description |
|---|---|---|---|
| `file` | `File` | Yes | PDF file (max 20 MB) |

```bash
curl -X POST http://localhost:3001/api/v1/upload \
  -F "file=@research-paper.pdf"
```

**Response: `201 Created`**
```json
{
  "success": true,
  "data": {
    "paperId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "filename": "research-paper.pdf",
    "status": "extracting",
    "fileSizeBytes": 1548230,
    "uploadDate": "2026-03-04T00:22:37.000Z"
  }
}
```

**Error Responses:**

| Status | Code | Description |
|---|---|---|
| `400` | `INVALID_FILE_TYPE` | File is not a PDF |
| `400` | `FILE_TOO_LARGE` | File exceeds 20 MB limit |
| `400` | `NO_FILE_PROVIDED` | No file in request body |
| `409` | `DUPLICATE_PAPER` | Paper with same checksum already exists |
| `500` | `PROCESSING_ERROR` | Internal server error during upload |

```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE_TYPE",
    "message": "Only PDF files are accepted. Received: image/png"
  }
}
```

---

### 3.2 `GET /papers/:paperId`

Retrieve paper metadata and processing status.

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `paperId` | `UUID` | Paper identifier |

**Response: `200 OK`**
```json
{
  "success": true,
  "data": {
    "paperId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "filename": "research-paper.pdf",
    "title": "Attention Is All You Need",
    "status": "ready",
    "fileSizeBytes": 1548230,
    "pageCount": 15,
    "chunkCount": 42,
    "uploadDate": "2026-03-04T00:22:37.000Z",
    "processedAt": "2026-03-04T00:23:02.000Z"
  }
}
```

**Error Responses:**

| Status | Code | Description |
|---|---|---|
| `404` | `PAPER_NOT_FOUND` | Paper ID does not exist |

---

### 3.3 `DELETE /papers/:paperId`

Delete a paper and all associated data (chunks, embeddings, summaries, conversations).

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `paperId` | `UUID` | Paper identifier |

**Response: `200 OK`**
```json
{
  "success": true,
  "message": "Paper and all associated data deleted successfully."
}
```

---

### 3.4 `POST /papers/:paperId/ask`

Ask a natural-language question about an uploaded paper. Uses RAG pipeline for grounded answers.

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `paperId` | `UUID` | Paper identifier |

**Request Body:**
```json
{
  "question": "What methodology did the authors use for evaluation?"
}
```

| Field | Type | Required | Constraints |
|---|---|---|---|
| `question` | `string` | Yes | 1–500 characters |

**Response: `200 OK`**
```json
{
  "success": true,
  "data": {
    "conversationId": "f1e2d3c4-b5a6-7890-fedc-ba0987654321",
    "question": "What methodology did the authors use for evaluation?",
    "answer": "The authors evaluated their model using BLEU scores on the WMT 2014 English-to-German and English-to-French translation tasks. They compared against existing state-of-the-art models including ensemble models.",
    "sources": [
      {
        "chunkId": "c1d2e3f4-a5b6-7890-cdef-ab1234567890",
        "text": "We trained our models on the standard WMT 2014 English-German dataset...",
        "pageNumber": 8,
        "relevanceScore": 0.94
      },
      {
        "chunkId": "d2e3f4a5-b6c7-8901-defa-bc2345678901",
        "text": "Our model achieves 28.4 BLEU on the WMT 2014 English-to-German...",
        "pageNumber": 9,
        "relevanceScore": 0.91
      }
    ],
    "latencyMs": 3200,
    "modelUsed": "gpt-4",
    "timestamp": "2026-03-04T00:25:10.000Z"
  }
}
```

**Error Responses:**

| Status | Code | Description |
|---|---|---|
| `400` | `EMPTY_QUESTION` | Question field is empty |
| `400` | `QUESTION_TOO_LONG` | Question exceeds 500 characters |
| `404` | `PAPER_NOT_FOUND` | Paper ID does not exist |
| `409` | `PAPER_NOT_READY` | Paper is still processing |
| `503` | `LLM_UNAVAILABLE` | LLM API is not responding |

---

### 3.5 `POST /papers/:paperId/summary`

Generate a structured summary of the paper.

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `paperId` | `UUID` | Paper identifier |

**Request Body:** *(empty — no body required)*

**Response: `200 OK`**
```json
{
  "success": true,
  "data": {
    "paperId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "summary": {
      "overview": "This paper introduces the Transformer architecture, a novel model based entirely on attention mechanisms, dispensing with recurrence and convolutions.",
      "methodology": "The authors train on WMT 2014 English-German and English-French datasets using 8 NVIDIA P100 GPUs. They employ label smoothing, dropout, and the Adam optimizer with a custom learning rate schedule.",
      "contributions": "The Transformer achieves state-of-the-art BLEU scores (28.4 on EN-DE, 41.0 on EN-FR) while being significantly more parallelizable and requiring less training time.",
      "limitations": "The paper primarily evaluates on machine translation tasks. Generalization to other sequence-to-sequence tasks is discussed but not extensively validated.",
      "futureWork": "The authors plan to extend the Transformer to other modalities including images, audio, and video, and to investigate local, restricted attention mechanisms for efficiently handling large inputs."
    },
    "generationTimeMs": 8500,
    "modelUsed": "gpt-4",
    "createdAt": "2026-03-04T00:26:30.000Z"
  }
}
```

**Error Responses:**

| Status | Code | Description |
|---|---|---|
| `404` | `PAPER_NOT_FOUND` | Paper ID does not exist |
| `409` | `PAPER_NOT_READY` | Paper is still processing |
| `409` | `SUMMARY_EXISTS` | Summary already generated (use GET to retrieve) |
| `503` | `LLM_UNAVAILABLE` | LLM API is not responding |

---

### 3.6 `GET /papers/:paperId/summary`

Retrieve an existing summary.

**Response: `200 OK`** — Same format as POST response.

**Error Responses:**

| Status | Code | Description |
|---|---|---|
| `404` | `PAPER_NOT_FOUND` | Paper does not exist |
| `404` | `SUMMARY_NOT_FOUND` | Summary has not been generated yet |

---

### 3.7 `GET /papers/:paperId/conversations`

Retrieve conversation history for a paper.

**Query Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `limit` | `integer` | 50 | Max number of records |
| `offset` | `integer` | 0 | Pagination offset |

**Response: `200 OK`**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "conversationId": "f1e2d3c4-b5a6-7890-fedc-ba0987654321",
        "question": "What is the main contribution?",
        "answer": "The main contribution is the Transformer architecture...",
        "rating": 1,
        "timestamp": "2026-03-04T00:25:10.000Z"
      }
    ],
    "total": 1,
    "limit": 50,
    "offset": 0
  }
}
```

---

### 3.8 `POST /papers/:paperId/conversations/:convId/rate`

Rate a Q&A response.

**Request Body:**
```json
{
  "rating": 1
}
```

| Field | Type | Required | Values |
|---|---|---|---|
| `rating` | `integer` | Yes | `-1` (thumbs down), `1` (thumbs up) |

**Response: `200 OK`**
```json
{
  "success": true,
  "message": "Rating submitted successfully."
}
```

---

### 3.9 `GET /health`

Health check endpoint.

**Response: `200 OK`**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": 3600,
  "services": {
    "database": "connected",
    "vectorDb": "connected",
    "llmApi": "available"
  }
}
```

---

## 4. Common Response Envelope

All responses follow a consistent envelope:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error description"
  }
}
```

---

## 5. Rate Limiting

| Endpoint | Limit | Window |
|---|---|---|
| `POST /upload` | 10 requests | Per minute per IP |
| `POST /ask` | 30 requests | Per minute per IP |
| `POST /summary` | 10 requests | Per minute per IP |
| All other endpoints | 100 requests | Per minute per IP |

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1709510400
```

---

## 6. CORS Configuration

```javascript
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type'],
  maxAge: 86400
};
```
