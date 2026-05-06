# System Design Document

## Design Goals

-   Minimize hallucination
-   Modular architecture
-   Scalable vector storage

## Query Pipeline

1.  Embed question
2.  Retrieve top-k chunks
3.  Construct prompt
4.  Generate grounded response

## Data Model

Paper: - id - filename - upload_date

Chunk: - id - paper_id - text - embedding
