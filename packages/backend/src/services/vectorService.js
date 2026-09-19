const mongoose = require('mongoose');
const PaperChunk = require('../models/PaperChunk');
const llmService = require('./llmService');

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
 * Stores text chunks with their vector embeddings
 * @param {string} paperId - The ID of the Paper
 * @param {string[]} chunks - Array of text chunks
 */
const storeChunks = async (paperId, chunks) => {
  // Generate embeddings for all chunks via batching and local fallback
  const embeddings = await llmService.generateBatchEmbeddings(chunks);

  const paperChunks = chunks.map((chunkText, i) => ({
    paperId: paperId.toString(),
    chunkIndex: i,
    text: chunkText,
    embedding: embeddings[i] || []
  }));

  if (isMongoConnected()) {
    // Bulk insert into MongoDB
    await PaperChunk.insertMany(paperChunks);
  } else {
    // Store in-memory
    inMemoryChunks.push(...paperChunks);
  }
};

/**
 * Queries for chunks similar to the question
 * @param {string} paperId - The ID of the Paper
 * @param {string} question - The user's question
 * @param {number} topK - Number of top chunks to return
 * @returns {Promise<string[]>} - Array of top text chunks
 */
const findSimilarChunks = async (paperId, question, topK = 5) => {
  const pidStr = paperId.toString();
  const relevantChunks = inMemoryChunks.filter(c => c.paperId === pidStr);

  // Detect dimension of the stored chunk embeddings (e.g. 3072 from Gemini or 384 from local)
  const sampleDim = relevantChunks[0]?.embedding?.length || null;

  // 1. Embed the question matching the paper's vector dimension
  const questionEmbedding = await llmService.generateEmbedding(question, sampleDim);

  if (isMongoConnected()) {
    // Perform vector search in Atlas
    try {
      const results = await PaperChunk.aggregate([
        {
          "$vectorSearch": {
            "index": "vector_index",
            "path": "embedding",
            "queryVector": questionEmbedding,
            "numCandidates": 50,
            "limit": topK,
            "filter": {
              "paperId": paperId
            }
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
      console.warn('[VectorService] MongoDB $vectorSearch failed, falling back to in-memory cosine search:', err.message);
    }
  }

  // In-memory hybrid search (Cosine Vector Similarity + Keyword Term Matching)
  const qTerms = (question.toLowerCase().match(/\b[a-z0-9]{3,}\b/g) || []);

  const scored = relevantChunks.map(chunk => {
    let vecScore = 0;
    if (questionEmbedding && chunk.embedding && questionEmbedding.length === chunk.embedding.length) {
      vecScore = cosineSimilarity(questionEmbedding, chunk.embedding);
    }

    // Keyword matching score
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
