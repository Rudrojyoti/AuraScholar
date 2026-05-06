# Database Schema

## 1. Overview

This document defines the complete database schema for the AI Research Paper Analyzer. The system uses a **hybrid storage approach**: a relational database (PostgreSQL) for structured metadata, and a vector database (Chroma / Pinecone) for embeddings and similarity search.

---

## 2. Storage Architecture

```
┌──────────────────────────────┐     ┌──────────────────────────────┐
│       PostgreSQL             │     │    Vector Database           │
│       (Metadata Store)       │     │    (Chroma / Pinecone)      │
│                              │     │                              │
│  ┌────────────────────────┐  │     │  ┌────────────────────────┐  │
│  │  papers                │  │     │  │  paper_chunks          │  │
│  │  chunks (metadata)     │  │     │  │  (collection)          │  │
│  │  summaries             │  │     │  │                        │  │
│  │  conversations         │  │     │  │  - id                  │  │
│  │  ratings               │  │     │  │  - embedding (vector)  │  │
│  └────────────────────────┘  │     │  │  - metadata            │  │
│                              │     │  │  - document (text)     │  │
└──────────────────────────────┘     │  └────────────────────────┘  │
                                     └──────────────────────────────┘
```

---

## 3. Relational Schema (PostgreSQL)

### 3.1 Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────────┐
│   papers     │       │   chunks     │       │   summaries      │
│──────────────│       │──────────────│       │──────────────────│
│ PK id        │──┐    │ PK id        │       │ PK id            │
│    filename  │  ├───▶│ FK paper_id  │       │ FK paper_id      │◀──┐
│    title     │  │    │    text      │       │    overview      │   │
│    upload_at │  │    │    index     │       │    methodology   │   │
│    status    │  │    │    page_num  │       │    contributions │   │
│    file_size │  │    │    token_cnt │       │    limitations   │   │
│    page_cnt  │  │    │    vec_id    │       │    future_work   │   │
│    checksum  │  │    │    created_at│       │    created_at    │   │
└──────────────┘  │    └──────────────┘       └──────────────────┘   │
                  │                                                    │
                  │    ┌──────────────────┐                           │
                  │    │  conversations   │                           │
                  │    │──────────────────│                           │
                  └───▶│ PK id            │                           │
                       │ FK paper_id      │──────────────────────────┘
                       │    question      │
                       │    answer        │
                       │    source_chunks │
                       │    rating        │
                       │    latency_ms    │
                       │    created_at    │
                       └──────────────────┘
```

### 3.2 Table Definitions

#### `papers`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Unique paper identifier |
| `filename` | `VARCHAR(255)` | `NOT NULL` | Original uploaded filename |
| `title` | `VARCHAR(500)` | `NULLABLE` | Extracted paper title |
| `status` | `ENUM` | `NOT NULL, DEFAULT 'uploading'` | Processing status |
| `file_size_bytes` | `INTEGER` | `NOT NULL` | File size in bytes |
| `page_count` | `INTEGER` | `NULLABLE` | Number of pages |
| `checksum` | `VARCHAR(64)` | `NOT NULL, UNIQUE` | SHA-256 hash for deduplication |
| `upload_date` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Upload timestamp |
| `processed_at` | `TIMESTAMPTZ` | `NULLABLE` | Processing completion timestamp |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Record creation time |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Last update time |

**Status Enum Values:** `'uploading'`, `'extracting'`, `'chunking'`, `'embedding'`, `'ready'`, `'failed'`

```sql
CREATE TYPE paper_status AS ENUM (
  'uploading', 'extracting', 'chunking', 'embedding', 'ready', 'failed'
);

CREATE TABLE papers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename      VARCHAR(255) NOT NULL,
  title         VARCHAR(500),
  status        paper_status NOT NULL DEFAULT 'uploading',
  file_size_bytes INTEGER NOT NULL,
  page_count    INTEGER,
  checksum      VARCHAR(64) NOT NULL UNIQUE,
  upload_date   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_papers_status ON papers(status);
CREATE INDEX idx_papers_upload_date ON papers(upload_date DESC);
```

---

#### `chunks`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Unique chunk identifier |
| `paper_id` | `UUID` | `NOT NULL, FK → papers.id ON DELETE CASCADE` | Parent paper reference |
| `text` | `TEXT` | `NOT NULL` | Raw chunk text content |
| `chunk_index` | `INTEGER` | `NOT NULL` | Order of chunk within paper |
| `page_number` | `INTEGER` | `NULLABLE` | Source page number |
| `token_count` | `INTEGER` | `NOT NULL` | Token count for this chunk |
| `vector_id` | `VARCHAR(100)` | `NOT NULL` | Reference ID in vector database |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Record creation time |

```sql
CREATE TABLE chunks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id      UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  text          TEXT NOT NULL,
  chunk_index   INTEGER NOT NULL,
  page_number   INTEGER,
  token_count   INTEGER NOT NULL,
  vector_id     VARCHAR(100) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(paper_id, chunk_index)
);

CREATE INDEX idx_chunks_paper_id ON chunks(paper_id);
CREATE INDEX idx_chunks_vector_id ON chunks(vector_id);
```

---

#### `summaries`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Unique summary identifier |
| `paper_id` | `UUID` | `NOT NULL, UNIQUE, FK → papers.id ON DELETE CASCADE` | Parent paper (1:1) |
| `overview` | `TEXT` | `NULLABLE` | High-level paper summary |
| `methodology` | `TEXT` | `NULLABLE` | Research methodology extraction |
| `contributions` | `TEXT` | `NULLABLE` | Key contributions |
| `limitations` | `TEXT` | `NULLABLE` | Paper limitations |
| `future_work` | `TEXT` | `NULLABLE` | Future work proposals |
| `model_used` | `VARCHAR(50)` | `NOT NULL` | LLM model that generated the summary |
| `generation_time_ms` | `INTEGER` | `NOT NULL` | Time taken to generate (ms) |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Record creation time |

```sql
CREATE TABLE summaries (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id            UUID NOT NULL UNIQUE REFERENCES papers(id) ON DELETE CASCADE,
  overview            TEXT,
  methodology         TEXT,
  contributions       TEXT,
  limitations         TEXT,
  future_work         TEXT,
  model_used          VARCHAR(50) NOT NULL,
  generation_time_ms  INTEGER NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

#### `conversations`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Unique conversation entry ID |
| `paper_id` | `UUID` | `NOT NULL, FK → papers.id ON DELETE CASCADE` | Associated paper |
| `question` | `TEXT` | `NOT NULL` | User's question |
| `answer` | `TEXT` | `NOT NULL` | Generated answer |
| `source_chunk_ids` | `UUID[]` | `NOT NULL` | Array of chunk IDs used as sources |
| `rating` | `SMALLINT` | `NULLABLE, CHECK (rating IN (-1, 0, 1))` | -1=down, 0=neutral, 1=up |
| `latency_ms` | `INTEGER` | `NOT NULL` | End-to-end response time (ms) |
| `model_used` | `VARCHAR(50)` | `NOT NULL` | LLM model used |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Timestamp |

```sql
CREATE TABLE conversations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id          UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  question          TEXT NOT NULL,
  answer            TEXT NOT NULL,
  source_chunk_ids  UUID[] NOT NULL,
  rating            SMALLINT CHECK (rating IN (-1, 0, 1)),
  latency_ms        INTEGER NOT NULL,
  model_used        VARCHAR(50) NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conversations_paper_id ON conversations(paper_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);
```

---

## 4. Vector Database Schema (Chroma / Pinecone)

### 4.1 Collection: `paper_chunks`

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Matches `chunks.vector_id` in PostgreSQL |
| `embedding` | `float[]` | Vector representation (1536 dimensions for OpenAI) |
| `document` | `string` | Original chunk text (for retrieval display) |
| `metadata.paper_id` | `string` | Paper UUID for filtering |
| `metadata.chunk_index` | `integer` | Chunk order within paper |
| `metadata.page_number` | `integer` | Source page number |
| `metadata.token_count` | `integer` | Token count |

### 4.2 Index Configuration

```json
{
  "collection_name": "paper_chunks",
  "embedding_dimension": 1536,
  "distance_metric": "cosine",
  "metadata_config": {
    "indexed_fields": ["paper_id", "chunk_index"]
  }
}
```

---

## 5. Data Lifecycle

| Stage | Action | Storage Impact |
|---|---|---|
| **Upload** | Create `papers` record with status `uploading` | PostgreSQL insert |
| **Extract** | Update status to `extracting`, parse PDF | Temporary file storage |
| **Chunk** | Create `chunks` records, update status to `chunking` | PostgreSQL inserts |
| **Embed** | Store embeddings in vector DB, update status to `embedding` | Vector DB inserts |
| **Ready** | Update status to `ready` | Status update |
| **Query** | Read chunks + vector DB, create `conversations` record | Read + insert |
| **Summary** | Create `summaries` record | PostgreSQL insert |
| **Cleanup** | Delete paper → cascades to chunks, summaries, conversations | Cascade deletes |

---

## 6. Migration Strategy

```
migrations/
├── 001_create_paper_status_enum.sql
├── 002_create_papers_table.sql
├── 003_create_chunks_table.sql
├── 004_create_summaries_table.sql
├── 005_create_conversations_table.sql
└── 006_create_indexes.sql
```

Use `node-pg-migrate` or `knex` for version-controlled migrations.
