---
last_mapped_commit: bf05bbc1293679b67bf5a0157db176634f728c9b
last_mapped_at: 2026-09-20
---
# Technology Stack

**Analysis Date:** 2026-09-20

## Languages

**Primary:**

- JavaScript (ES2022 / Node.js CommonJS) - `packages/backend`
- TypeScript (5.0.0) / TSX & JSX (React 18) - `packages/frontend`

**Secondary:**

- GLSL (WebGL Shaders) - Custom WebGL accretion disk shaders in `packages/frontend/src/components/ui/AccretionDiskBackground.tsx`

## Runtime

**Environment:**

- Node.js (>= 18.x)
- Browser environment supporting WebGL and ESNext modules

**Package Manager:**

- npm (Workspaces monorepo)
- Lockfile: `package-lock.json` present at root

## Frameworks

**Core:**

- Express (5.2.1) - REST API backend in `packages/backend/src/app.js`
- React (18.2.0) - Frontend SPA in `packages/frontend/src`
- Vite (4.0.0) - Frontend build tool and development server (`packages/frontend/vite.config.js`)

**Styling & UI:**

- Tailwind CSS (3.4.0) with PostCSS and Autoprefixer
- Three.js (0.155.0) & `@react-three/fiber` (8.13.0) - 3D scene rendering
- Framer Motion (8.0.0) - UI animations and transitions
- Lucide React (0.263.0) - Iconography
- Radix UI Slot (`@radix-ui/react-slot` 1.0.2) - Unstyled accessible component primitives

**Build/Dev:**

- Concurrently (9.1.0) - Concurrent execution of backend and frontend dev servers from root `package.json`
- Nodemon (3.1.14) - Automatic backend server restart during development
- TypeScript (5.0.0) - Frontend type checking and compilation

## Key Dependencies

**Critical:**

- `@google/genai` (2.0.1) / `@google/generative-ai` (0.24.1) - Google Gemini SDK for LLM analysis, embeddings, and chat in `packages/backend/src/services/llmService.js` and `packages/backend/src/services/vectorService.js`
- `pdf-parse` (1.1.1) - Server-side PDF document parsing and text extraction in `packages/backend/src/services/pdfService.js`
- `groq-sdk` (1.1.2) - Fast LLM inference alternative in `packages/backend/src/services/llmService.js`
- `@clerk/clerk-react` (5.61.6) & `@clerk/express` (2.1.15) - Authentication and user management across frontend and backend

**Infrastructure:**

- `mongoose` (9.6.2) - MongoDB ODM (configured in backend models)
- `pg` (8.20.0) - PostgreSQL client
- `cors` (2.8.6) - Cross-origin resource sharing middleware in `packages/backend/src/app.js`
- `dotenv` (17.4.2) - Environment configuration loader
- `winston` (3.19.0) - Structured backend logging

## Configuration

**Environment:**

- Root coordinates `packages/backend` and `packages/frontend` via npm workspaces
- Backend environment managed via `packages/backend/.env` (cloned from `.env.example`)
- Required variables: `PORT`, `GEMINI_API_KEY`, `MODELSCOPE_API_KEY`, `GROQ_API_KEY`, `CLERK_SECRET_KEY`, `VITE_CLERK_PUBLISHABLE_KEY`

**Build:**

- Root: `package.json` with scripts `dev`, `dev:backend`, `dev:frontend`, `build`, `start`
- Frontend: `packages/frontend/vite.config.js`, `packages/frontend/tailwind.config.js`, `packages/frontend/tsconfig.json`

## Platform Requirements

**Development:**

- Windows / Linux / macOS with Node.js >= 18 and npm >= 9
- WebGL-enabled browser for interactive 3D particle backgrounds

**Production:**

- Backend: Node.js container or serverless runtime hosting Express app on port 3001
- Frontend: Static web host (Vercel, Netlify, Cloudflare Pages) hosting Vite production bundle

---

*Stack analysis: 2026-09-20*
