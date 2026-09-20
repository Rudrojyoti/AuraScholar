---
last_mapped_commit: 9c9bbf49ebf8153c62ee35c812199383f00f0066
last_mapped_at: 2026-09-20
---
# Codebase Structure

**Analysis Date:** 2026-09-20

## Directory Layout

```
[d:/Only work]/
├── package.json              # Monorepo root configuration & concurrent runner scripts
├── package-lock.json         # Workspace dependency tree lockfile
├── .agents/                  # GSD agent definitions, skills, tools, and workflows
│   ├── gsd-core/             # Core GSD CLI tools, templates, and runtime libraries
│   └── skills/               # GSD modular skills (gsd-next, gsd-plan-phase, etc.)
├── .planning/                # Project planning, roadmap, state, and codebase maps
│   └── codebase/             # 7 structured codebase documentation maps
├── packages/
│   ├── backend/              # Node.js + Express REST API server
│   │   ├── package.json      # Backend dependencies and scripts
│   │   ├── .env              # Environment secrets (ignored)
│   │   ├── .env.example      # Sample environment variables
│   │   └── src/
│   │       ├── app.js        # Express application configuration & middleware
│   │       ├── server.js     # Server entry point (binds to port 3001)
│   │       ├── config/       # Environment & credential configuration
│   │       ├── controllers/  # Request handlers (upload, query, health)
│   │       ├── models/       # Mongoose data schemas (Paper, PaperChunk)
│   │       ├── routes/       # Express route handlers
│   │       └── services/     # Core services (pdfService, llmService, vectorService)
│   └── frontend/             # React 18 + Vite + Tailwind SPA
│       ├── package.json      # Frontend dependencies and Vite build scripts
│       ├── vite.config.js    # Vite bundling and dev server configuration
│       ├── tailwind.config.js# Tailwind theme and styling configuration
│       ├── tsconfig.json     # TypeScript compiler options
│       └── src/
│           ├── main.jsx      # React root mount point
│           ├── App.jsx       # Root routing & state component
│           ├── index.css     # Global CSS and Tailwind directives
│           ├── components/   # Reusable UI components
│           │   └── ui/       # Three.js/WebGL background & layout elements
│           └── pages/        # Top-level route pages (Dashboard, SpaceAuth, UserProfile)
```

## Directory Purposes

**`packages/backend/src/services`:**

- Purpose: Encapsulates all heavy business logic, AI integrations, PDF extraction, and vector calculations
- Key files: `llmService.js`, `pdfService.js`, `vectorService.js`, `paperStore.js`

**`packages/backend/src/controllers`:**

- Purpose: HTTP request parsing, payload validation, orchestrating services, and sending formatted responses
- Key files: `uploadController.js`, `queryController.js`, `healthController.js`

**`packages/frontend/src/pages`:**

- Purpose: Primary application views and user flows
- Key files: `Dashboard.jsx`, `SpaceAuthPage.tsx`, `UserProfile.jsx`

**`packages/frontend/src/components/ui`:**

- Purpose: Visual experience components, WebGL particle canvas, space backgrounds
- Key files: `AccretionDiskBackground.tsx`, `hero-section.tsx`, `SettingsModal.jsx`

## Key File Locations

**Entry Points:**

- `packages/backend/src/server.js`: Starts Express HTTP listener
- `packages/frontend/src/main.jsx`: Mounts React DOM

**Configuration:**

- `packages/backend/src/config/index.js`: Loads environment variables and provides API credentials
- `packages/frontend/vite.config.js`: Configures Vite build system

**Core Logic:**

- `packages/backend/src/services/llmService.js`: Prompts AI models and formats paper analysis
- `packages/frontend/src/pages/Dashboard.jsx`: Coordinates PDF upload, tab rendering, and paper queries

## Naming Conventions

**Files:**

- Backend: `camelCase.js` (e.g. `uploadController.js`, `llmService.js`)
- Frontend Components: `PascalCase.jsx` / `PascalCase.tsx` (e.g. `Dashboard.jsx`, `AccretionDiskBackground.tsx`)
- Configs: `kebab-case.js` or standard config names (`vite.config.js`, `tailwind.config.js`)

**Directories:**

- Plural lowercase (e.g. `controllers`, `services`, `routes`, `models`, `components`, `pages`)

## Where to Add New Code

**New API Endpoint:**

- Route: add to `packages/backend/src/routes/<feature>Routes.js` and mount in `packages/backend/src/app.js`
- Controller: add logic in `packages/backend/src/controllers/<feature>Controller.js`
- Service: add business logic in `packages/backend/src/services/<feature>Service.js`

**New UI Component / Visual Feature:**

- Add to `packages/frontend/src/components/` or `packages/frontend/src/components/ui/`
- Import and render in `packages/frontend/src/pages/Dashboard.jsx` or relevant page

---

*Structure analysis: 2026-09-20*
