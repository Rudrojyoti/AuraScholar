-- ==============================================================================
-- AuraScholar Supabase Database Schema & Vector Search Setup
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. Enable pgvector extension for dense vector similarity search
create extension if not exists vector;

-- 2. Papers Table (Metadata, Summaries, Extracted Sections)
create table if not exists public.papers (
  id text primary key,
  user_id text not null,
  title text not null,
  file_url text,
  summary text,
  methodology text,
  contributions text,
  limitations text,
  future_work text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for instant lookup of papers belonging to a user
create index if not exists idx_papers_user_id on public.papers (user_id);
create index if not exists idx_papers_created_at on public.papers (created_at desc);

-- 3. Paper Chunks Table (Text Chunks & Embeddings)
create table if not exists public.paper_chunks (
  id uuid primary key default gen_random_uuid(),
  paper_id text references public.papers(id) on delete cascade not null,
  chunk_index integer not null,
  text text not null,
  embedding vector(384) -- Default 384 dim (all-MiniLM-L6 / deterministic term vectors)
);

-- Index for fetching chunks belonging to a paper
create index if not exists idx_paper_chunks_paper_id on public.paper_chunks (paper_id);

-- Optional HNSW index for ultra-fast approximate nearest neighbor vector search
-- create index if not exists idx_paper_chunks_embedding on public.paper_chunks using hnsw (embedding vector_cosine_ops);

-- 4. Vector Match RPC Function (Used by backend for RAG retrieval)
create or replace function match_paper_chunks (
  query_embedding vector(384),
  filter_paper_id text,
  match_count int default 5
) returns table (
  id uuid,
  text text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    paper_chunks.id,
    paper_chunks.text,
    1 - (paper_chunks.embedding <=> query_embedding) as similarity
  from paper_chunks
  where paper_chunks.paper_id = filter_paper_id
  order by paper_chunks.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- 5. Row Level Security (RLS) Policies (Optional)
alter table public.papers enable row level security;
alter table public.paper_chunks enable row level security;

-- Policy to allow backend service role full access
create policy "Service role has full access to papers"
  on public.papers
  for all
  using (true)
  with check (true);

create policy "Service role has full access to paper_chunks"
  on public.paper_chunks
  for all
  using (true)
  with check (true);
