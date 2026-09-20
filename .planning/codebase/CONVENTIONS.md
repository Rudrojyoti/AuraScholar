---
last_mapped_commit: bf05bbc1293679b67bf5a0157db176634f728c9b
last_mapped_at: 2026-09-20
---
# Coding Conventions

**Analysis Date:** 2026-09-20

## Naming Patterns

**Files:**

- Backend JavaScript files: `camelCase.js` (e.g. `uploadController.js`, `vectorService.js`)
- Frontend React Components: `PascalCase.jsx` or `PascalCase.tsx` (e.g. `Dashboard.jsx`, `AccretionDiskBackground.tsx`)
- Configuration files: standard lowercase names (`package.json`, `tailwind.config.js`)

**Functions & Methods:**

- JavaScript / TypeScript functions: `camelCase` (e.g. `analyzePaper`, `extractTextFromBuffer`, `handleFileUpload`)
- Controller actions: `camelCase` (e.g. `uploadBase64`, `handleQuery`)

**Variables & Constants:**

- Variables & parameters: `camelCase` (e.g. `paperText`, `extractedChunks`, `activeTab`)
- Environment variables & global constants: `UPPER_SNAKE_CASE` (e.g. `GEMINI_API_KEY`, `PORT`, `MODELSCOPE_BASE_URL`)

## Code Style

**Formatting & Linting:**

- Prettier (3.8.3) and ESLint (10.3.0) configured in `packages/backend`
- Indentation: 2 spaces
- Semicolons: standard JavaScript semicolon usage
- Quotes: single quotes preferred in backend JS, double or single quotes in JSX attributes

## Import Organization

**Backend (CommonJS):**

1. Node.js built-ins (`path`, `fs`, `crypto`)
2. External npm dependencies (`express`, `cors`, `dotenv`, `@google/genai`)
3. Internal local modules (`../services/llmService`, `../config`)

**Frontend (ESM):**

1. React & framework core imports (`import React, { useState, useEffect } from 'react'`)
2. Third-party UI / animation / utility libraries (`framer-motion`, `lucide-react`, `three`)
3. Internal components and styles (`./components/ui/AccretionDiskBackground`, `./index.css`)

## Error Handling

**Backend Strategy:**

- All asynchronous route handlers wrapped in `try...catch` blocks
- Errors logged with descriptive context using `console.error`
- Standardized error response contract returned to client:
  ```javascript
  return res.status(500).json({
    success: false,
    message: 'Error processing request',
    error: error.message
  });
  ```

**Frontend Strategy:**

- Network calls wrapped in `try...catch`
- Fallback UI states displayed when backend is offline or an upload fails (e.g. `⚠️ Backend offline` notification banner)

## Function Design

- Single responsibility per service method
- Services export standalone modular utility functions or objects of methods (e.g. `module.exports = { analyzePaper, ... }`)
- Asynchronous operations explicitly use `async/await` syntax

---

*Convention analysis: 2026-09-20*
