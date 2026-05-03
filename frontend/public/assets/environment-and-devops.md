# Environment & DevOps

## 1. Overview

This document defines the environment configuration, CI/CD pipelines, deployment strategy, and operational tooling for the AI Research Paper Analyzer.

---

## 2. Environments

| Environment | Purpose | Infrastructure | URL |
|---|---|---|---|
| **Local** | Development & debugging | Docker Compose | `http://localhost:3000` (FE), `:3001` (BE) |
| **CI** | Automated testing & linting | GitHub Actions runners | N/A |
| **Staging** | Pre-production validation | Vercel Preview + Railway (dev) | `https://staging.paperanalyzer.app` |
| **Production** | Live user-facing service | Vercel + Railway + Pinecone | `https://paperanalyzer.app` |

---

## 3. Environment Variables

### 3.1 Variable Reference

| Variable | Description | Local | Staging | Production |
|---|---|---|---|---|
| `NODE_ENV` | Runtime environment | `development` | `staging` | `production` |
| `PORT` | Backend server port | `3001` | Auto | Auto |
| `FRONTEND_URL` | Frontend origin for CORS | `http://localhost:3000` | Preview URL | Production URL |
| `DATABASE_URL` | PostgreSQL connection string | Docker local | Managed DB | Managed DB |
| `CHROMA_URL` | Chroma DB URL | `http://localhost:8000` | N/A | N/A |
| `PINECONE_API_KEY` | Pinecone API key | N/A | Set | Set |
| `PINECONE_ENVIRONMENT` | Pinecone environment | N/A | `gcp-starter` | `gcp-production` |
| `PINECONE_INDEX` | Pinecone index name | N/A | `papers-staging` | `papers-prod` |
| `OPENAI_API_KEY` | OpenAI API key | Set | Set | Set |
| `EMBEDDING_MODEL` | Embedding model name | `text-embedding-3-small` | Same | Same |
| `LLM_MODEL` | LLM model name | `gpt-4` | Same | Same |
| `LLM_TEMPERATURE` | Generation temperature | `0.2` | `0.2` | `0.2` |
| `TOP_K` | Retrieval top-k | `5` | `5` | `5` |
| `MAX_FILE_SIZE_MB` | Max upload size | `20` | `20` | `20` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `60000` | `60000` | `60000` |
| `RATE_LIMIT_MAX` | Rate limit max requests | `100` | `100` | `100` |
| `LOG_LEVEL` | Logging level | `debug` | `info` | `warn` |

### 3.2 `.env.example`

```bash
# Server
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://dev:devpassword@localhost:5432/paper_analyzer

# Vector Database (choose one)
CHROMA_URL=http://localhost:8000
# PINECONE_API_KEY=
# PINECONE_ENVIRONMENT=
# PINECONE_INDEX=

# AI APIs
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMBEDDING_MODEL=text-embedding-3-small
LLM_MODEL=gpt-4
LLM_TEMPERATURE=0.2

# Retrieval
TOP_K=5
MAX_FILE_SIZE_MB=20

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=debug
```

---

## 4. Docker Configuration

### 4.1 `docker-compose.yml` (Local Development)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: paper_analyzer
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: devpassword
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U dev -d paper_analyzer"]
      interval: 10s
      timeout: 5s
      retries: 5

  chroma:
    image: chromadb/chroma:0.4.22
    restart: unless-stopped
    ports:
      - "8000:8000"
    volumes:
      - chromadata:/chroma/chroma

volumes:
  pgdata:
  chromadata:
```

### 4.2 `Dockerfile.backend`

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/backend/package.json ./packages/backend/
RUN npm ci --workspace=packages/backend --workspace=packages/shared

# Copy source
COPY packages/shared/ ./packages/shared/
COPY packages/backend/ ./packages/backend/

# Run
EXPOSE 3001
CMD ["node", "packages/backend/server.js"]
```

### 4.3 `Dockerfile.frontend`

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/frontend/package.json ./packages/frontend/
RUN npm ci --workspace=packages/frontend --workspace=packages/shared

COPY packages/shared/ ./packages/shared/
COPY packages/frontend/ ./packages/frontend/
RUN npm run build -w packages/frontend

FROM nginx:alpine
COPY --from=build /app/packages/frontend/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

---

## 5. CI/CD Pipelines

### 5.1 CI Pipeline (`ci.yml`)

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    needs: lint
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: test_db
          POSTGRES_USER: test
          POSTGRES_PASSWORD: testpass
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm test
        env:
          DATABASE_URL: postgresql://test:testpass@localhost:5432/test_db

  build:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
```

### 5.2 Deployment Pipeline (`deploy-frontend.yml`)

```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]
    paths:
      - 'packages/frontend/**'
      - 'packages/shared/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### 5.3 Deployment Pipeline (`deploy-backend.yml`)

```yaml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths:
      - 'packages/backend/**'
      - 'packages/shared/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Deploy to Railway
        uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: backend
```

---

## 6. Deployment Architecture

```
                    ┌──────────────────────┐
                    │     Cloudflare       │
                    │     (DNS + CDN)      │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
   ┌──────────────────┐  ┌──────────────┐  ┌──────────────┐
   │   Vercel          │  │  Railway     │  │  Pinecone    │
   │   (Frontend)      │  │  (Backend)   │  │  (Vector DB) │
   │                    │  │              │  │              │
   │   React SPA       │  │  Node.js     │  │  Managed     │
   │   Static Assets   │  │  Express     │  │  Index       │
   │   Edge CDN        │  │  Auto-scale  │  │              │
   └──────────────────┘  └──────┬───────┘  └──────────────┘
                                │
                       ┌────────┼────────┐
                       │                 │
                       ▼                 ▼
              ┌──────────────┐  ┌──────────────┐
              │  PostgreSQL  │  │  OpenAI API  │
              │  (Railway)   │  │  (External)  │
              │              │  │              │
              │  Managed DB  │  │  Embeddings  │
              │              │  │  + LLM       │
              └──────────────┘  └──────────────┘
```

---

## 7. Monitoring & Observability

### 7.1 Logging

| Component | Tool | Format | Retention |
|---|---|---|---|
| Backend | Winston → stdout | Structured JSON | 7 days (Railway logs) |
| Frontend | Browser console + Sentry | Error events | 30 days |
| Database | PostgreSQL logs | Standard | 3 days |

### 7.2 Health Monitoring

| Check | Endpoint / Method | Frequency | Alert |
|---|---|---|---|
| API health | `GET /health` | Every 60s | Slack / Email on failure |
| Database connectivity | Health check in `/health` | Every 60s | Included in health |
| Vector DB connectivity | Health check in `/health` | Every 60s | Included in health |
| Frontend availability | Vercel status | Automatic | Vercel dashboard |

### 7.3 Alerting Thresholds

| Metric | Warning | Critical |
|---|---|---|
| API response time (P95) | > 5s | > 10s |
| Error rate (5xx) | > 1% | > 5% |
| API health check failure | 1 failure | 3 consecutive |
| Database connection pool | > 80% used | > 95% used |

---

## 8. Secrets Management

| Secret | Storage | Rotation |
|---|---|---|
| `OPENAI_API_KEY` | Railway env vars / Vercel env | Quarterly |
| `DATABASE_URL` | Railway env vars | On compromise |
| `PINECONE_API_KEY` | Railway env vars | Quarterly |
| `VERCEL_TOKEN` | GitHub Secrets | Annually |
| `RAILWAY_TOKEN` | GitHub Secrets | Annually |

**Rules:**
- Never commit secrets to version control
- Use platform-native secret stores (Railway, Vercel, GitHub Secrets)
- Rotate all secrets immediately upon suspected compromise
- `.env` files are in `.gitignore`
