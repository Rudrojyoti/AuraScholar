---
last_mapped_commit: bf05bbc1293679b67bf5a0157db176634f728c9b
last_mapped_at: 2026-09-20
---
# Testing Patterns

**Analysis Date:** 2026-09-20

## Test Framework

**Current Status:**

- `packages/backend`: Test script placeholder in `package.json`: `"test": "echo \"Error: no test specified\" && exit 1"`
- `packages/frontend`: No active test suite configured yet; frontend validation is verified through manual Vite dev preview and browser testing.

**Recommended Test Stack for Next Phases:**

- Backend: Jest or Vitest with Supertest for API integration testing
- Frontend: Vitest + React Testing Library for UI components

## Run Commands

```bash

# Backend test command (to be implemented)

npm test -w packages/backend

# Frontend test command (to be implemented)

npm test -w packages/frontend
```

## Manual Verification Patterns

**Backend Endpoints:**

- Health Check: `GET http://localhost:3001/api/health` -> `{ "status": "healthy", "timestamp": ... }`
- Base64 Upload: `POST http://localhost:3001/api/upload/base64` with JSON body `{ paperName: "...", fileBase64: "data:application/pdf;base64,..." }`
- Paper Query: `POST http://localhost:3001/api/query` with `{ paperId: "...", question: "..." }`

**Frontend Flows:**

- Accretion Disk WebGL rendering: verified via canvas element in `Dashboard.jsx`
- PDF Dropzone: verifies file reading, Base64 conversion, upload progress bar, and 5-tab analysis rendering

---

*Testing analysis: 2026-09-20*
