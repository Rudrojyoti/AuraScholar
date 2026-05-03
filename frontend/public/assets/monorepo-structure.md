# Monorepo Structure

## 1. Overview

The AI Research Paper Analyzer follows a **monorepo architecture** using npm workspaces. This structure colocates the frontend (React), backend (Node.js + Express), and shared utilities in a single repository with clearly defined package boundaries.

---

## 2. Directory Tree

```
ai-research-paper-analyzer/
│
├── .github/                          # CI/CD workflows
│   └── workflows/
│       ├── ci.yml                    # Lint, test, build pipeline
│       ├── deploy-frontend.yml       # Frontend deployment
│       └── deploy-backend.yml        # Backend deployment
│
├── .husky/                           # Git hooks
│   ├── pre-commit                    # Lint staged files
│   └── commit-msg                    # Conventional commit check
│
├── packages/                         # Monorepo packages
│   │
│   ├── frontend/                     # React SPA
│   │   ├── public/
│   │   │   ├── index.html
│   │   │   └── favicon.ico
│   │   ├── src/
│   │   │   ├── assets/               # Static assets (icons, images)
│   │   │   ├── components/           # Reusable UI components
│   │   │   │   ├── common/           # Shared components
│   │   │   │   │   ├── Button/
│   │   │   │   │   │   ├── Button.jsx
│   │   │   │   │   │   ├── Button.module.css
│   │   │   │   │   │   └── Button.test.jsx
│   │   │   │   │   ├── StatusBadge/
│   │   │   │   │   ├── LoadingSpinner/
│   │   │   │   │   └── ErrorBoundary/
│   │   │   │   ├── upload/
│   │   │   │   │   ├── UploadZone.jsx
│   │   │   │   │   └── UploadProgress.jsx
│   │   │   │   ├── summary/
│   │   │   │   │   ├── SummaryPanel.jsx
│   │   │   │   │   ├── SummarySection.jsx
│   │   │   │   │   └── ExportActions.jsx
│   │   │   │   └── chat/
│   │   │   │       ├── QAChat.jsx
│   │   │   │       ├── MessageBubble.jsx
│   │   │   │       ├── QuestionInput.jsx
│   │   │   │       └── RatingButtons.jsx
│   │   │   ├── hooks/                # Custom React hooks
│   │   │   │   ├── useUpload.js
│   │   │   │   ├── useSummary.js
│   │   │   │   ├── useChat.js
│   │   │   │   └── useTheme.js
│   │   │   ├── services/             # API client layer
│   │   │   │   ├── api.js            # Axios instance config
│   │   │   │   ├── paperService.js
│   │   │   │   └── chatService.js
│   │   │   ├── context/              # React Context providers
│   │   │   │   ├── PaperContext.jsx
│   │   │   │   └── ThemeContext.jsx
│   │   │   ├── styles/               # Global styles
│   │   │   │   ├── globals.css
│   │   │   │   ├── variables.css     # CSS custom properties
│   │   │   │   └── themes.css        # Light/dark theme tokens
│   │   │   ├── utils/                # Frontend utilities
│   │   │   │   ├── formatters.js
│   │   │   │   └── validators.js
│   │   │   ├── App.jsx               # Root component
│   │   │   └── main.jsx              # Entry point
│   │   ├── vite.config.js
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── backend/                      # Node.js + Express API
│   │   ├── src/
│   │   │   ├── config/               # Configuration
│   │   │   │   ├── index.js          # Centralized config from env
│   │   │   │   ├── database.js       # PostgreSQL connection
│   │   │   │   └── vectorDb.js       # Chroma/Pinecone connection
│   │   │   ├── controllers/          # Route handlers
│   │   │   │   ├── uploadController.js
│   │   │   │   ├── queryController.js
│   │   │   │   ├── summaryController.js
│   │   │   │   └── healthController.js
│   │   │   ├── middleware/            # Express middleware
│   │   │   │   ├── errorHandler.js
│   │   │   │   ├── fileValidator.js
│   │   │   │   ├── rateLimiter.js
│   │   │   │   └── requestLogger.js
│   │   │   ├── models/               # Database models
│   │   │   │   ├── Paper.js
│   │   │   │   ├── Chunk.js
│   │   │   │   ├── Summary.js
│   │   │   │   └── Conversation.js
│   │   │   ├── services/             # Business logic
│   │   │   │   ├── pdfService.js       # PDF extraction & chunking
│   │   │   │   ├── embeddingService.js # Embedding API calls
│   │   │   │   ├── vectorService.js    # Vector DB operations
│   │   │   │   ├── ragService.js       # RAG pipeline orchestration
│   │   │   │   ├── llmService.js       # LLM API calls
│   │   │   │   └── scoringService.js   # Relevance scoring
│   │   │   ├── prompts/              # LLM prompt templates
│   │   │   │   ├── systemPrompt.js
│   │   │   │   ├── qaPrompt.js
│   │   │   │   └── summaryPrompt.js
│   │   │   ├── routes/               # Express routes
│   │   │   │   ├── index.js          # Route aggregator
│   │   │   │   ├── uploadRoutes.js
│   │   │   │   ├── paperRoutes.js
│   │   │   │   └── healthRoutes.js
│   │   │   ├── utils/                # Backend utilities
│   │   │   │   ├── chunker.js        # Text chunking logic
│   │   │   │   ├── textCleaner.js    # Text normalization
│   │   │   │   ├── hashUtils.js      # SHA-256 checksum
│   │   │   │   └── logger.js         # Winston logger setup
│   │   │   └── app.js               # Express app setup
│   │   ├── migrations/              # Database migrations
│   │   │   ├── 001_create_papers.sql
│   │   │   ├── 002_create_chunks.sql
│   │   │   ├── 003_create_summaries.sql
│   │   │   └── 004_create_conversations.sql
│   │   ├── seeds/                   # Test data seeds
│   │   │   └── sample-papers.js
│   │   ├── server.js                # Server entry point
│   │   ├── package.json
│   │   └── README.md
│   │
│   └── shared/                      # Shared constants & types
│       ├── src/
│       │   ├── constants.js          # Shared constants (status enums, limits)
│       │   ├── errors.js             # Error code definitions
│       │   └── validators.js         # Shared validation schemas
│       ├── package.json
│       └── README.md
│
├── scripts/                         # Dev & deployment scripts
│   ├── setup.sh                     # Initial project setup
│   ├── seed-db.sh                   # Database seeding
│   └── run-migrations.sh           # Run database migrations
│
├── docs/                            # Project documentation
│   ├── product-requirements.md
│   ├── user-stories-and-acceptance-criteria.md
│   ├── information-architecture.md
│   ├── system-architecture.md
│   ├── database-schema.md
│   ├── api-contracts.md
│   ├── monorepo-structure.md
│   ├── scoring-engine-spec.md
│   ├── engineering-scope-definition.md
│   ├── development-phases.md
│   ├── environment-and-devops.md
│   └── testing-strategy.md
│
├── .env.example                     # Environment variable template
├── .gitignore
├── .eslintrc.json                   # ESLint configuration
├── .prettierrc                      # Prettier configuration
├── docker-compose.yml               # Local development stack
├── Dockerfile.frontend              # Frontend container
├── Dockerfile.backend               # Backend container
├── package.json                     # Root package (workspaces config)
├── turbo.json                       # Turborepo configuration (optional)
└── README.md                        # Project README
```

---

## 3. Workspace Configuration

### 3.1 Root `package.json`

```json
{
  "name": "ai-research-paper-analyzer",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "packages/frontend",
    "packages/backend",
    "packages/shared"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:frontend": "npm run dev -w packages/frontend",
    "dev:backend": "npm run dev -w packages/backend",
    "build": "npm run build -w packages/shared && npm run build -w packages/frontend && npm run build -w packages/backend",
    "test": "npm test --workspaces",
    "lint": "eslint packages/*/src/**/*.{js,jsx}",
    "lint:fix": "eslint packages/*/src/**/*.{js,jsx} --fix",
    "format": "prettier --write packages/*/src/**/*.{js,jsx,css,json}",
    "migrate": "npm run migrate -w packages/backend",
    "seed": "npm run seed -w packages/backend",
    "clean": "rm -rf packages/*/node_modules packages/*/dist"
  },
  "devDependencies": {
    "concurrently": "^8.0.0",
    "eslint": "^8.50.0",
    "prettier": "^3.0.0",
    "husky": "^9.0.0",
    "lint-staged": "^15.0.0"
  }
}
```

### 3.2 Package Dependency Graph

```
shared (no dependencies)
   ▲
   │
   ├── frontend (depends on shared)
   │
   └── backend (depends on shared)
```

---

## 4. Key Conventions

### 4.1 Naming Conventions

| Type | Convention | Example |
|---|---|---|
| **Files** | camelCase for JS, PascalCase for components | `pdfService.js`, `UploadZone.jsx` |
| **Directories** | lowercase, kebab-case if multi-word | `components/`, `vector-db/` |
| **Components** | PascalCase | `SummaryPanel`, `QAChat` |
| **Hooks** | camelCase with `use` prefix | `useUpload`, `useChat` |
| **Services** | camelCase with `Service` suffix | `embeddingService`, `ragService` |
| **Controllers** | camelCase with `Controller` suffix | `uploadController` |
| **Constants** | SCREAMING_SNAKE_CASE | `MAX_FILE_SIZE`, `TOP_K` |

### 4.2 Import Aliases

```javascript
// vite.config.js (frontend)
resolve: {
  alias: {
    '@': '/src',
    '@components': '/src/components',
    '@hooks': '/src/hooks',
    '@services': '/src/services',
    '@shared': '../shared/src'
  }
}
```

### 4.3 Git Conventions

- **Branching:** `main` → `develop` → `feature/*`, `fix/*`, `chore/*`
- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`)
- **PRs:** Require 1 approval, pass CI checks, no merge conflicts

---

## 5. Docker Compose (Local Development)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: paper_analyzer
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: devpassword
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  chroma:
    image: chromadb/chroma:latest
    ports:
      - "8000:8000"
    volumes:
      - chromadata:/chroma/chroma

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://dev:devpassword@postgres:5432/paper_analyzer
      - CHROMA_URL=http://chroma:8000
    depends_on:
      - postgres
      - chroma

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  pgdata:
  chromadata:
```
