# Scoring Engine Specification

## 1. Overview

The Scoring Engine is a core subsystem of the AI Research Paper Analyzer responsible for evaluating the **quality, relevance, and groundedness** of generated outputs. It operates at multiple stages of the RAG pipeline to ensure responses are factually grounded in the source paper.

---

## 2. Scoring Dimensions

| Dimension | Description | Range | Applied To |
|---|---|---|---|
| **Relevance Score** | How semantically similar is a retrieved chunk to the query | 0.0 – 1.0 | Retrieved chunks |
| **Groundedness Score** | Degree to which the generated answer is supported by source chunks | 0.0 – 1.0 | Q&A answers |
| **Completeness Score** | How thoroughly the answer addresses the question | 0.0 – 1.0 | Q&A answers |
| **Confidence Score** | Overall confidence in the response quality | 0.0 – 1.0 | Q&A answers, Summaries |
| **Chunk Quality Score** | Quality of a text chunk for embedding and retrieval | 0.0 – 1.0 | Chunks (at ingestion) |

---

## 3. Scoring Pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│                       INGESTION SCORING                             │
│                                                                     │
│  Raw Text → Chunk → ┌─────────────────────┐ → Scored Chunk         │
│                      │ Chunk Quality Score │                        │
│                      │ - Token density     │                        │
│                      │ - Information value  │                        │
│                      │ - Structural quality │                        │
│                      └─────────────────────┘                        │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                       RETRIEVAL SCORING                             │
│                                                                     │
│  Query Embedding                                                    │
│       │                                                             │
│       ▼                                                             │
│  ┌──────────────┐     ┌──────────────────┐     ┌────────────────┐  │
│  │ Cosine       │────▶│ Re-ranking       │────▶│ Relevance      │  │
│  │ Similarity   │     │ (Cross-encoder)  │     │ Threshold      │  │
│  │ (Initial)    │     │                  │     │ Filter (≥ 0.7) │  │
│  └──────────────┘     └──────────────────┘     └────────────────┘  │
│                                                                     │
│  Output: Top-k chunks with relevance scores                        │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      GENERATION SCORING                             │
│                                                                     │
│  Generated Answer                                                   │
│       │                                                             │
│       ▼                                                             │
│  ┌──────────────┐     ┌──────────────────┐     ┌────────────────┐  │
│  │ Groundedness │────▶│ Completeness     │────▶│ Confidence     │  │
│  │ Check        │     │ Check            │     │ Aggregation    │  │
│  └──────────────┘     └──────────────────┘     └────────────────┘  │
│                                                                     │
│  Output: Scored response with confidence metadata                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Score Calculations

### 4.1 Chunk Quality Score (Ingestion)

Evaluates each text chunk at ingestion time to filter out low-quality chunks.

```javascript
function calculateChunkQuality(chunk) {
  const scores = {
    tokenDensity: calculateTokenDensity(chunk),       // 0-1
    informationValue: calculateInfoValue(chunk),       // 0-1
    structuralQuality: calculateStructuralQual(chunk)  // 0-1
  };

  const weights = {
    tokenDensity: 0.2,
    informationValue: 0.5,
    structuralQuality: 0.3
  };

  return weightedAverage(scores, weights);
}
```

| Sub-Score | Formula | Description |
|---|---|---|
| **Token Density** | `actual_tokens / max_tokens` | Penalize very short or sparse chunks |
| **Information Value** | `unique_terms / total_terms` | Higher diversity = more information |
| **Structural Quality** | `1 - (special_char_ratio + whitespace_ratio)` | Penalize malformed text |

**Threshold:** Chunks with quality score < **0.3** are discarded.

---

### 4.2 Relevance Score (Retrieval)

Measures semantic similarity between the query embedding and each chunk embedding.

```javascript
function calculateRelevance(queryEmbedding, chunkEmbedding) {
  // Stage 1: Cosine similarity (fast, from vector DB)
  const cosineSim = cosineSimilarity(queryEmbedding, chunkEmbedding);

  // Stage 2: Optional re-ranking (cross-encoder for top candidates)
  // Only applied to top-20 initial results
  const reRankScore = crossEncoderScore(query, chunkText);

  // Final score: weighted combination
  return (0.4 * cosineSim) + (0.6 * reRankScore);
}
```

**Retrieval Configuration:**

| Parameter | Value | Description |
|---|---|---|
| `initial_candidates` | 20 | Chunks retrieved by cosine similarity |
| `top_k` | 5 | Final chunks after re-ranking |
| `relevance_threshold` | 0.7 | Minimum score to include in context |
| `similarity_metric` | Cosine | Distance metric in vector DB |

---

### 4.3 Groundedness Score (Generation)

Verifies that the generated answer is supported by the source chunks. This is critical for minimizing hallucination.

```javascript
function calculateGroundedness(answer, sourceChunks) {
  // Split answer into individual claims/sentences
  const claims = extractClaims(answer);

  let supportedClaims = 0;

  for (const claim of claims) {
    // Check if claim is semantically supported by any source chunk
    const maxSupport = Math.max(
      ...sourceChunks.map(chunk =>
        semanticSimilarity(claim, chunk.text)
      )
    );

    if (maxSupport >= 0.75) {
      supportedClaims++;
    }
  }

  return supportedClaims / claims.length;
}
```

**Groundedness Thresholds:**

| Score Range | Classification | Action |
|---|---|---|
| 0.9 – 1.0 | **Fully Grounded** | Serve response as-is |
| 0.7 – 0.89 | **Mostly Grounded** | Serve with reduced confidence indicator |
| 0.5 – 0.69 | **Partially Grounded** | Add disclaimer: "Some information may not be directly from the paper" |
| < 0.5 | **Ungrounded** | Reject and return fallback: "Unable to provide a reliable answer" |

---

### 4.4 Completeness Score (Generation)

Measures how thoroughly the answer addresses the user's question.

```javascript
function calculateCompleteness(question, answer, sourceChunks) {
  // Extract key concepts from the question
  const questionConcepts = extractKeyConcepts(question);

  // Check how many question concepts are addressed in the answer
  let addressedConcepts = 0;

  for (const concept of questionConcepts) {
    if (answerContainsConcept(answer, concept)) {
      addressedConcepts++;
    }
  }

  return addressedConcepts / questionConcepts.length;
}
```

---

### 4.5 Confidence Score (Aggregated)

Final confidence score combining all dimensions.

```javascript
function calculateConfidence(relevanceScores, groundedness, completeness) {
  const avgRelevance = average(relevanceScores);

  const weights = {
    relevance: 0.3,
    groundedness: 0.5,    // Heavily weighted — core value proposition
    completeness: 0.2
  };

  const confidence = (
    weights.relevance * avgRelevance +
    weights.groundedness * groundedness +
    weights.completeness * completeness
  );

  return {
    score: Math.round(confidence * 100) / 100,
    level: getConfidenceLevel(confidence),
    breakdown: { avgRelevance, groundedness, completeness }
  };
}

function getConfidenceLevel(score) {
  if (score >= 0.85) return 'HIGH';
  if (score >= 0.65) return 'MEDIUM';
  if (score >= 0.45) return 'LOW';
  return 'VERY_LOW';
}
```

---

## 5. Response Metadata Schema

Every generated response includes scoring metadata:

```json
{
  "answer": "The authors used BLEU scores for evaluation...",
  "scoring": {
    "confidence": {
      "score": 0.91,
      "level": "HIGH"
    },
    "groundedness": 0.95,
    "completeness": 0.88,
    "sources": [
      {
        "chunkId": "abc-123",
        "relevanceScore": 0.94,
        "pageNumber": 8
      },
      {
        "chunkId": "def-456",
        "relevanceScore": 0.89,
        "pageNumber": 9
      }
    ]
  }
}
```

---

## 6. Scoring for Summary Generation

Summaries receive section-level scoring:

```json
{
  "summary": {
    "overview": { "text": "...", "groundedness": 0.92 },
    "methodology": { "text": "...", "groundedness": 0.88 },
    "contributions": { "text": "...", "groundedness": 0.95 },
    "limitations": { "text": "...", "groundedness": 0.78 },
    "futureWork": { "text": "...", "groundedness": 0.90 }
  },
  "overallConfidence": 0.89
}
```

---

## 7. Scoring Configuration

All scoring parameters are configurable via environment variables:

| Parameter | Default | Env Variable | Description |
|---|---|---|---|
| Relevance threshold | 0.7 | `SCORING_RELEVANCE_THRESHOLD` | Min relevance to include chunk |
| Groundedness threshold | 0.5 | `SCORING_GROUNDEDNESS_THRESHOLD` | Min groundedness to serve |
| Initial candidates | 20 | `SCORING_INITIAL_CANDIDATES` | Cosine similarity candidates |
| Top-k | 5 | `SCORING_TOP_K` | Final chunks after re-rank |
| Claim support threshold | 0.75 | `SCORING_CLAIM_THRESHOLD` | Min similarity for claim support |
| Re-ranking enabled | false | `SCORING_RERANK_ENABLED` | Enable cross-encoder re-ranking |

---

## 8. Monitoring & Analytics

### 8.1 Metrics to Track

| Metric | Description | Alert Threshold |
|---|---|---|
| `avg_groundedness_score` | Average groundedness across all responses | < 0.7 |
| `ungrounded_response_rate` | % of responses with groundedness < 0.5 | > 5% |
| `avg_relevance_score` | Average chunk relevance in retrieval | < 0.75 |
| `avg_confidence_score` | Average overall confidence | < 0.6 |
| `user_thumbs_down_rate` | % of negatively rated answers | > 15% |

### 8.2 Score Distribution Dashboard

Track score distributions over time to identify degradation:
- Groundedness score histogram (daily)
- Relevance score distribution per query
- Confidence score trend line (weekly)
- Correlation: confidence score vs. user rating
