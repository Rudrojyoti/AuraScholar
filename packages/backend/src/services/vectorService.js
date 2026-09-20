const mongoose = require('mongoose');
const PaperChunk = require('../models/PaperChunk');
const llmService = require('./llmService');
const { supabase, isConfigured: isSupabaseConfigured } = require('./supabaseClient');

// In-memory fallback chunk storage
const inMemoryChunks = [];

/**
 * Calculate cosine similarity between two numeric vectors
 */
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

const isMongoConnected = () => {
  return mongoose.connection && mongoose.connection.readyState === 1;
};

/**
 * Stores text chunks with their vector embeddings in Supabase (or MongoDB / In-Memory)
 * @param {string} paperId - The ID of the Paper
 * @param {string[]} chunks - Array of text chunks
 */
const storeChunks = async (paperId, chunks) => {
  const pidStr = paperId.toString();

  // Generate embeddings for all chunks via batching and local fallback
  const embeddings = await llmService.generateBatchEmbeddings(chunks);

  // Always keep in-memory cache for ultra-low latency retrieval
  const localChunks = chunks.map((chunkText, i) => ({
    paperId: pidStr,
    chunkIndex: i,
    text: chunkText,
    embedding: embeddings[i] || []
  }));
  inMemoryChunks.push(...localChunks);

  // 1. Supabase Persistent Storage
  if (isSupabaseConfigured()) {
    try {
      const supabaseChunks = chunks.map((chunkText, i) => ({
        paper_id: pidStr,
        chunk_index: i,
        text: chunkText,
        embedding: embeddings[i] && embeddings[i].length > 0 ? embeddings[i] : null
      }));

      // Batch insert chunks in chunks of 50 to avoid request size limits
      const BATCH_SIZE = 50;
      for (let i = 0; i < supabaseChunks.length; i += BATCH_SIZE) {
        const batch = supabaseChunks.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from('paper_chunks').insert(batch);
        if (error) {
          console.warn(`⚠️ Supabase chunk insert batch error (items ${i}-${i + batch.length}):`, error.message);
        }
      }
      return;
    } catch (err) {
      console.warn('⚠️ Supabase storeChunks error, saved to in-memory store:', err.message);
    }
  }

  // 2. MongoDB Atlas Storage
  if (isMongoConnected()) {
    try {
      await PaperChunk.insertMany(localChunks);
    } catch (err) {
      console.warn('⚠️ MongoDB insertMany error:', err.message);
    }
  }
};

/**
 * Queries for chunks similar to the question using Supabase pgvector or local cosine similarity
 * @param {string} paperId - The ID of the Paper
 * @param {string} question - The user's question
 * @param {number} topK - Number of top chunks to return
 * @returns {Promise<string[]>} - Array of top text chunks
 */
const findSimilarChunks = async (paperId, question, topK = 5) => {
  const pidStr = paperId.toString();

  // 1. Check local chunks first for dimension detection
  let relevantChunks = inMemoryChunks.filter(c => c.paperId === pidStr);
  const sampleDim = relevantChunks[0]?.embedding?.length || 384;

  // Generate embedding for the question
  const questionEmbedding = await llmService.generateEmbedding(question, sampleDim);

  // 2. Supabase Retrieval
  if (isSupabaseConfigured()) {
    try {
      // First attempt: call pgvector match_paper_chunks RPC if available
      const { data: rpcData, error: rpcError } = await supabase.rpc('match_paper_chunks', {
        query_embedding: questionEmbedding,
        filter_paper_id: pidStr,
        match_count: topK
      });

      if (!rpcError && rpcData && rpcData.length > 0) {
        return rpcData.map(item => item.text);
      }

      // Second attempt: fetch chunks from Supabase table if not found locally
      if (relevantChunks.length === 0) {
        const { data: dbChunks, error: dbError } = await supabase
          .from('paper_chunks')
          .select('text, chunk_index, embedding')
          .eq('paper_id', pidStr);

        if (!dbError && dbChunks && dbChunks.length > 0) {
          relevantChunks = dbChunks.map(c => ({
            paperId: pidStr,
            chunkIndex: c.chunk_index,
            text: c.text,
            embedding: typeof c.embedding === 'string' ? JSON.parse(c.embedding) : (c.embedding || [])
          }));
          // Cache in memory for subsequent questions
          inMemoryChunks.push(...relevantChunks);
        }
      }
    } catch (err) {
      console.warn('⚠️ Supabase vector query warning:', err.message);
    }
  }

  // 3. MongoDB Atlas vector search fallback
  if (isMongoConnected()) {
    try {
      const results = await PaperChunk.aggregate([
        {
          "$vectorSearch": {
            "index": "vector_index",
            "path": "embedding",
            "queryVector": questionEmbedding,
            "numCandidates": 50,
            "limit": topK,
            "filter": { "paperId": pidStr }
          }
        },
        {
          "$project": {
            "text": 1,
            "score": { "$meta": "vectorSearchScore" }
          }
        }
      ]);
      if (results && results.length > 0) {
        return results.map(doc => doc.text);
      }
    } catch (err) {
      // Silently continue to in-memory scoring
    }
  }

  // 4. In-Memory Hybrid Search (Cosine Vector Similarity + Keyword Term Matching)
  const qTerms = (question.toLowerCase().match(/\b[a-z0-9]{3,}\b/g) || []);

  const scored = relevantChunks.map(chunk => {
    let vecScore = 0;
    if (questionEmbedding && chunk.embedding && questionEmbedding.length === chunk.embedding.length) {
      vecScore = cosineSimilarity(questionEmbedding, chunk.embedding);
    }

    let matchCount = 0;
    const chunkLower = chunk.text.toLowerCase();
    for (const term of qTerms) {
      if (chunkLower.includes(term)) matchCount++;
    }
    const keywordScore = qTerms.length > 0 ? matchCount / qTerms.length : 0;

    return {
      text: chunk.text,
      score: vecScore * 0.6 + keywordScore * 0.4
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map(item => item.text);
};

module.exports = {
  storeChunks,
  findSimilarChunks
};
