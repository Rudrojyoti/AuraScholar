# MVP Technical Documentation

## Goal

Deliver a working RAG pipeline with PDF upload and grounded Q&A.

## Tech Stack

Frontend: React Backend: Node + Express PDF Parsing: pdf-parse
Embeddings: API-based Vector DB: Chroma / Pinecone LLM: API-based

## Endpoints

POST /upload POST /ask POST /generate-summary

## Constraints

-   Max 20MB PDF
-   Top-k retrieval: 5
-   Temperature: 0.2
