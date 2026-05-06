# Information Architecture

## 1. Overview

This document defines how information is organized, structured, and navigated within the AI Research Paper Analyzer. It covers the content model, navigation structure, data taxonomy, and user interaction flows.

---

## 2. Content Model

### 2.1 Core Entities

```
┌─────────────────────────────────────────────────┐
│                   PAPER                         │
│  - id (UUID)                                    │
│  - filename (string)                            │
│  - upload_date (timestamp)                      │
│  - status (enum)                                │
│  - metadata (title, authors, abstract)          │
│                                                 │
│    ┌──────────────────────────────────────┐     │
│    │            CHUNKS[]                  │     │
│    │  - id (UUID)                         │     │
│    │  - paper_id (FK)                     │     │
│    │  - text (string)                     │     │
│    │  - embedding (vector)                │     │
│    │  - chunk_index (int)                 │     │
│    │  - page_number (int)                 │     │
│    └──────────────────────────────────────┘     │
│                                                 │
│    ┌──────────────────────────────────────┐     │
│    │           SUMMARY                    │     │
│    │  - overview (text)                   │     │
│    │  - methodology (text)                │     │
│    │  - contributions (text)              │     │
│    │  - limitations (text)                │     │
│    │  - future_work (text)                │     │
│    └──────────────────────────────────────┘     │
│                                                 │
│    ┌──────────────────────────────────────┐     │
│    │        CONVERSATIONS[]               │     │
│    │  - question (text)                   │     │
│    │  - answer (text)                     │     │
│    │  - sources[] (chunk references)      │     │
│    │  - timestamp (datetime)              │     │
│    │  - rating (thumbs_up/down/null)      │     │
│    └──────────────────────────────────────┘     │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 2.2 Entity Relationships

```
Paper (1) ──────── (N) Chunk
Paper (1) ──────── (1) Summary
Paper (1) ──────── (N) Conversation
Conversation (1) ── (N) Source Chunk References
```

---

## 3. Navigation Structure (Sitemap)

```
Home (/)
├── Upload Zone
│   ├── Drag-and-Drop Area
│   ├── File Picker Button
│   └── Upload Progress Indicator
│
├── Paper Dashboard (after upload)
│   ├── Paper Info Header
│   │   ├── Filename
│   │   ├── Upload Date
│   │   └── Processing Status
│   │
│   ├── Summary Panel
│   │   ├── Overview Tab
│   │   ├── Methodology Tab
│   │   ├── Contributions Tab
│   │   ├── Limitations Tab
│   │   ├── Future Work Tab
│   │   └── Export Actions (Copy / Download)
│   │
│   └── Q&A Panel
│       ├── Question Input
│       ├── Conversation Thread
│       │   ├── Question Bubble
│       │   ├── Answer Bubble
│       │   │   ├── Answer Text
│       │   │   ├── Source References
│       │   │   └── Rating Buttons
│       │   └── Timestamp
│       └── Clear History Button
│
└── Settings (Optional)
    ├── Theme Toggle (Light / Dark)
    └── About / Help
```

---

## 4. User Flows

### 4.1 Primary Flow: Upload → Analyze → Ask

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌─────────────┐
│  Landing  │────▶│  Upload PDF  │────▶│  Processing  │────▶│  Dashboard  │
│   Page    │     │              │     │   Status     │     │   Ready     │
└──────────┘     └──────────────┘     └──────────────┘     └─────┬───────┘
                                                                  │
                                                     ┌────────────┼────────────┐
                                                     ▼            ▼            ▼
                                              ┌──────────┐ ┌──────────┐ ┌──────────┐
                                              │ Generate  │ │ Ask Q&A  │ │ Extract  │
                                              │ Summary   │ │          │ │ Methods  │
                                              └──────────┘ └──────────┘ └──────────┘
```

### 4.2 Error Flow: Invalid Upload

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌─────────────┐
│  Landing  │────▶│  Upload File │────▶│  Validation  │────▶│  Error Msg  │
│   Page    │     │              │     │   Failed     │     │  + Retry    │
└──────────┘     └──────────────┘     └──────────────┘     └─────────────┘
```

---

## 5. Information Taxonomy

### 5.1 Paper Analysis Categories

| Category | Description | Source |
|---|---|---|
| **Overview** | High-level summary of the paper's purpose and findings | Full paper context |
| **Methodology** | Research design, data collection, experimental setup | Methods/Experiment sections |
| **Contributions** | Novel contributions and claims | Introduction, Conclusion |
| **Limitations** | Acknowledged weaknesses and constraints | Discussion, Limitations sections |
| **Future Work** | Proposed next steps and open questions | Conclusion, Future Work sections |

### 5.2 Data Classification

| Data Type | Sensitivity | Storage | Retention |
|---|---|---|---|
| Uploaded PDF | Medium | Temporary server storage | Deleted after processing |
| Extracted Text | Low | Server memory / temp storage | Session duration |
| Chunk Embeddings | Low | Vector database (Chroma/Pinecone) | Persistent |
| User Questions | Low | Session memory | Session duration |
| Generated Answers | Low | Session memory | Session duration |
| API Keys | High | Environment variables | Persistent (server-side only) |

---

## 6. Content Hierarchy & Priority

### 6.1 Visual Hierarchy (Z-Pattern Layout)

```
┌─────────────────────────────────────────────────────────┐
│  HEADER: Logo / Title              [Theme Toggle]       │  ← Brand zone
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────┐  ┌──────────────────────────────┐ │
│  │                  │  │                              │ │
│  │  UPLOAD ZONE     │  │  SUMMARY / Q&A PANEL        │ │
│  │  (Primary CTA)   │  │  (Content Zone)             │ │
│  │                  │  │                              │ │
│  │  Paper Info      │  │  Tabs: Summary | Q&A        │ │
│  │  Status Badge    │  │                              │ │
│  │                  │  │  [Content Area]              │ │
│  │                  │  │                              │ │
│  └─────────────────┘  └──────────────────────────────┘ │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  FOOTER: Attribution / Version                          │
└─────────────────────────────────────────────────────────┘
```

### 6.2 Content Prioritization

| Priority | Element | Rationale |
|---|---|---|
| **P0** | Upload Zone | Entry point for all user interaction |
| **P0** | Q&A Interface | Core value proposition |
| **P0** | Summary Display | Primary analysis output |
| **P1** | Source Attribution | Builds trust, validates grounding |
| **P1** | Processing Status | User awareness during wait times |
| **P2** | Export Actions | Secondary utility |
| **P2** | Theme Toggle | Comfort feature |
| **P3** | Conversation History | Session-level convenience |

---

## 7. Labeling & Terminology

### 7.1 UI Label Standards

| Concept | UI Label | Avoid |
|---|---|---|
| Upload a paper | "Upload PDF" | "Add file", "Import document" |
| Ask a question | "Ask about this paper" | "Query", "Search" |
| Generate summary | "Generate Summary" | "Summarize", "Analyze" |
| No answer found | "This information is not available in the uploaded paper." | "I don't know", "No results" |
| Processing | "Analyzing your paper..." | "Loading", "Please wait" |

### 7.2 Glossary

| Term | Definition |
|---|---|
| **RAG** | Retrieval-Augmented Generation — combining retrieval with LLM generation |
| **Chunk** | A segment of extracted paper text used for embedding and retrieval |
| **Embedding** | A numerical vector representation of a text chunk |
| **Top-k** | The number of most-relevant chunks retrieved for a query (k=5) |
| **Grounded Response** | An answer generated strictly from retrieved source content |
| **Temperature** | LLM parameter controlling response randomness (0.2 = highly deterministic) |
