# AI Research Paper Analyzer (RAG-Based)

## Architecture Document

## Overview

The system implements Retrieval-Augmented Generation (RAG) to analyze
research papers with minimal hallucination.

## High-Level Architecture

User → React Frontend → Node Backend → Embedding Model → Vector DB → LLM
→ Response

## Components

-   React (UI)
-   Node + Express (API layer)
-   pdf-parse (PDF extraction)
-   Embedding API
-   Vector Database (Chroma / Pinecone)
-   LLM API

## Data Flow

Upload → Extract → Chunk → Embed → Store Query → Embed Question →
Retrieve → Generate Answer

## Security

-   File validation
-   Strict RAG prompting
-   API key protection
