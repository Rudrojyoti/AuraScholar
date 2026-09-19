# AuraScholar | Autonomous Scientific Synthesis & Research Paper Analyzer

AuraScholar is an orbital deep-research platform designed to ingest complex multi-page research papers, preprints (arXiv/bioRxiv), and technical documentation, transforming them into verified executive summaries, mathematical invariant extractions, and interactive multi-model consensus dialogues.

---

## Architecture Overview

```
├── packages/
│   ├── backend/               # Node.js / Express API Service
│   │   ├── src/
│   │   │   ├── config/        # Environment & API configurations
│   │   │   ├── controllers/   # Upload, Query & Health controllers
│   │   │   ├── models/        # Paper & Chunk data structures
│   │   │   ├── routes/        # Express REST route endpoints
│   │   │   ├── services/      # RAG pipeline, LLMs, PDF & vector services
│   │   │   ├── app.js         # Express application setup
│   │   │   └── server.js      # Server entry point (port 3001)
│   │   └── package.json
│   │
│   └── frontend/              # React (Vite) + Tailwind CSS Application
│       ├── src/
│       │   ├── components/ui/ # AccretionDiskBackground, HeroSection, SettingsModal, Click, Cursor
│       │   ├── pages/         # SpaceAuthPage, Dashboard (Corpus + Deep Analysis Workstation)
│       │   ├── lib/           # Tailwind / utility helpers
│       │   ├── utils/         # Upload helpers
│       │   ├── App.jsx        # Root router & authentication orchestration
│       │   ├── main.jsx       # React DOM root mounting
│       │   └── index.css      # Core styles & cosmic glassmorphism definitions
│       ├── index.html
│       ├── vite.config.js
│       └── package.json
│
├── package.json               # Monorepo workspaces definition
└── README.md
```

---

## Key Features

- **Procedural WebGL Black Hole Shader**: Interactive, GPU-accelerated accretion disk simulation with gravitational lensing, relativistic Doppler beaming, and starfield twinkling.
- **Autonomous Vector Ingestion**: Extracts text, formulas, and structural chunks from PDF research papers.
- **HNSW Vector Indexing & Hybrid Search**: Local fallback vectorizer (384-dim) or frontier cloud embeddings for high-dimensional cosine similarity.
- **Multi-Model Consensus Engine**: Dissects methodology, verifies mathematical derivations, and generates strictly grounded citations.
- **Self-Contained Analytical Workstation**: Interactive dual-pane analysis with LaTeX equation display, multi-tab syntheses, and real-time consensus Q&A.

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
From the repository root:
```bash
npm install
```

### Running Locally
Run both backend and frontend concurrently:
```bash
npm run dev
```

- **Frontend Application**: `http://localhost:5173/`
- **Backend API**: `http://localhost:3001/`
