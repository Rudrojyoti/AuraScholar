# AuraScholar | Autonomous Scientific Synthesis & Research Paper Analyzer

[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.2+-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4+-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-pgvector-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=flat&logo=clerk&logoColor=white)](https://clerk.com/)
[![Qwen](https://img.shields.io/badge/ModelScope-Qwen_3.8_Flash--Next-624AFF?style=flat)](https://modelscope.cn/)
[![Gemini](https://img.shields.io/badge/Google-Gemini_2.5_Flash-4285F4?style=flat&logo=google&logoColor=white)](https://ai.google.dev/)

**AuraScholar** is an orbital deep-research platform and analytical workstation built to ingest complex multi-page research papers, preprints (arXiv/bioRxiv), and technical documentation. It transforms dense academic literature into verified executive summaries, mathematical invariant extractions with KaTeX rendering, and multi-model consensus dialogues.

---

## Key Features

- **Procedural WebGL Accretion Disk Simulation**: Custom GLSL fragment and vertex shaders delivering GPU-accelerated gravitational lensing, relativistic Doppler beaming, dynamic accretion matter flow, and a twinkling starfield.
- **Dual-Engine AI Consensus (Qwen 3.8 & Gemini 2.5)**: Deep reasoning powered by ModelScope's `Qwen3.8-Flash-Next` coupled with Google's `Gemini 2.5 Flash` for multimodal ingestion, citation grounding, and fallback resilience.
- **Enterprise Storage & Database Pipeline**:
  - **Supabase (PostgreSQL + pgvector)**: Scalable vector embeddings, relational paper metadata, chunk indexing, and live telemetry stats.
  - **UploadThing CDN**: High-speed cloud file pipeline for large-scale document distribution and streaming ingest.
- **Deep Research Workstation**:
  - Split-pane observatory interface with interactive KaTeX mathematical formula rendering.
  - Automated LaTeX invariant extraction from methodology sections.
  - Real-time vector search and hybrid cosine similarity chunk ranking.
  - Interactive multi-turn Q&A grounded strictly in paper citations.
- **Zero-Trust Clerk Authentication**:
  - NIST-compliant passkey, password, and social authentication with JWT sessions.
  - Automatic routing to account creation when an email is not recognized.
  - **Dev Mode Bypass**: Instant 1-click verification bypass for swift local prototyping without waiting on email delivery.
- **Zero-Secret Security Architecture**: Strict `.gitignore` enforcement protecting all `.env` secrets and credentials, prepared for open-source hosting with standardized `.env.example` templates.

---

## Monorepo Architecture

```
├── packages/
│   ├── backend/                       # Node.js & Express REST API Engine
│   │   ├── src/
│   │   │   ├── config/                # Environment variables, Clerk, Supabase, UploadThing
│   │   │   ├── controllers/           # Paper upload, search, telemetry & health
│   │   │   ├── models/                # Paper and Chunk data schemas
│   │   │   ├── routes/                # REST API route handlers (/api/papers, /api/health)
│   │   │   ├── services/              # Ingestion, RAG, Qwen/Gemini LLMs, PDF & vector services
│   │   │   ├── app.js                 # Express application & middleware configuration
│   │   │   └── server.js              # HTTP server entry point (Port 3001)
│   │   ├── .env.example               # Backend environment variables template
│   │   └── package.json
│   │
│   └── frontend/                      # React 18 + Vite + Tailwind CSS SPA
│       ├── src/
│       │   ├── components/ui/         # WebGL Accretion Disk, HeroSection, SettingsModal, Click & Cursor
│       │   ├── pages/                 # SpaceAuthPage, Dashboard (Corpus + Deep Analysis Workstation)
│       │   ├── lib/                   # Utility helpers & class variance authority
│       │   ├── utils/                 # UploadThing client helpers
│       │   ├── App.jsx                # Clerk authentication & router orchestration
│       │   ├── main.jsx               # React DOM root entry
│       │   └── index.css              # Cosmic glassmorphism & Tailwind utility styling
│       ├── .env.example               # Frontend environment variables template
│       ├── vite.config.js             # Vite build & plugin settings
│       └── package.json
│
├── package.json                       # Monorepo workspace configuration
├── .gitignore                         # Strict rules preventing secret/credential leaks
└── README.md
```

---

## Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- API Keys for optional external services:
  - [ModelScope API Key](https://modelscope.cn/) (for Qwen 3.8 Flash-Next)
  - [Google Gemini API Key](https://aistudio.google.com/) (for Gemini 2.5 Flash)
  - [Clerk API Keys](https://clerk.com/) (for authentication)
  - [Supabase Project URL & Service Key](https://supabase.com/) (for pgvector storage)
  - [UploadThing Token](https://uploadthing.com/) (for cloud file uploads)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/your-username/aurascholar.git
cd aurascholar

# Install all monorepo dependencies across backend and frontend
npm install
```

### 2. Configure Environment Variables

#### Backend Setup
Copy the backend template and insert your credentials:
```bash
cp packages/backend/.env.example packages/backend/.env
```

Edit `packages/backend/.env`:
```env
PORT=3001

# ModelScope Qwen (Reasoning Engine)
MODELSCOPE_BASE_URL=https://api-inference.modelscope.ai/v1
MODELSCOPE_API_KEY=your_modelscope_api_key
MODELSCOPE_MODEL=Qwen-Ambassador/Qwen3.8-Flash-Next

# Google Gemini (Multimodal Analysis & Embeddings)
GEMINI_API_KEY=your_gemini_api_key

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key

# Supabase (PostgreSQL & pgvector)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_secret_service_role_key

# UploadThing (Cloud PDF CDN)
UPLOADTHING_TOKEN=your_uploadthing_token
```

#### Frontend Setup
Copy the frontend template and insert your Clerk publishable key:
```bash
cp packages/frontend/.env.example packages/frontend/.env
```

Edit `packages/frontend/.env`:
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
VITE_API_URL=http://localhost:3001/api
```

### 3. Launch Development Environment

Run both the backend API and frontend Vite dev server concurrently from the monorepo root:
```bash
npm run dev
```

- **Frontend**: [http://localhost:5173/](http://localhost:5173/)
- **Backend API**: [http://localhost:3001/](http://localhost:3001/)

---

## API Reference

The backend provides a clean RESTful interface:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/papers/upload` | Upload a research paper (PDF), extract text, parse sections, and index chunks |
| `POST` | `/api/papers/query` | Submit a research inquiry with semantic search & multi-model consensus response |
| `GET` | `/api/papers` | List all ingested papers, summaries, and extracted mathematical invariants |
| `GET` | `/api/papers/:id` | Fetch full details, chunks, and citations for a specific paper |
| `GET` | `/api/papers/stats` | Real-time corpus telemetry (total papers, chunks, average latency, active engine) |
| `GET` | `/api/health` | Service health status check and operational metrics |

---

## Security & Privacy

- **Safe Open-Source Repository**: `.env` and all credential files are excluded from Git via `.gitignore`.
- **Public / Secret Key Separation**: Only `VITE_` prefixed public keys are loaded into client-side bundles; all service-role keys and LLM tokens remain exclusively on the backend.
- **Clerk Zero-Trust**: Requests can be authenticated with verified Clerk JWT session bearer tokens.

---

## License

This project is open source and available under the [MIT License](LICENSE).
