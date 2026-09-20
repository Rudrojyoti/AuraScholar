---
last_mapped_commit: 9c9bbf49ebf8153c62ee35c812199383f00f0066
last_mapped_at: 2026-09-20
---
# Codebase Concerns

**Analysis Date:** 2026-09-20

## Tech Debt

**1. Automated Test Coverage:**

- Issue: Neither backend nor frontend currently has automated unit or integration tests (`npm test` currently exits with an error).
- Files: `packages/backend/package.json`, `packages/frontend/package.json`
- Impact: Regressions in PDF extraction or LLM prompt formatting can only be caught at runtime.
- Fix approach: Introduce Vitest or Jest with mock fixtures for Gemini/Qwen API responses and sample PDF buffers.

**2. In-Memory Paper Store Persistence:**

- Issue: `packages/backend/src/services/paperStore.js` and `vectorService.js` store uploaded paper text and embeddings in memory (`const store = new Map()`).
- Files: `packages/backend/src/services/paperStore.js`, `packages/backend/src/services/vectorService.js`
- Impact: Restarting the server clears all previously analyzed papers, requiring users to re-upload.
- Fix approach: Connect existing Mongoose models (`Paper.js`, `PaperChunk.js`) to MongoDB or SQLite for persistent storage.

## Known Bugs & Fragile Areas

**1. Malformed Base64 / Encrypted PDF Parsing:**

- Symptoms: `pdf-parse` can reject malformed, corrupted, or password-protected PDFs without a user-friendly error explanation.
- Files: `packages/backend/src/services/pdfService.js`
- Trigger: Uploading non-standard PDFs or scanned image-only PDFs lacking an embedded text layer.
- Fix approach: Add OCR fallback (e.g. Tesseract or Gemini Vision multi-modal) for image-based PDFs.

**2. WebGL Shader Context Loss on Low-End Devices:**

- Symptoms: `AccretionDiskBackground.tsx` runs a raymarched shader with high loop iterations; on mobile or integrated GPUs, WebGL context loss can cause a black background.
- Files: `packages/frontend/src/components/ui/AccretionDiskBackground.tsx`
- Fix approach: Add a CSS radial gradient fallback when `gl.isContextLost()` or WebGL creation fails.

## Security Considerations

**API Key Exposure:**

- Risk: Hardcoded API keys or exposing backend `.env` variables to git or client builds.
- Mitigation: All AI keys (`GEMINI_API_KEY`, `MODELSCOPE_API_KEY`, `GROQ_API_KEY`) are kept on the server in `packages/backend/.env` and excluded from git via `.gitignore`.
- Rate Limiting: Introduce `express-rate-limit` on the upload and query routes to prevent API quota exhaustion.

---

*Concerns analysis: 2026-09-20*
