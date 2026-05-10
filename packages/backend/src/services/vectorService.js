const PaperChunk = require('../models/PaperChunk');
const llmService = require('./llmService');

/**
 * Stores text chunks with their vector embeddings in MongoDB
 * @param {string} paperId - The Mongoose ObjectId of the Paper
 * @param {string[]} chunks - Array of text chunks
 */
const storeChunks = async (paperId, chunks) => {
  const paperChunks = [];

  // Generate embeddings for all chunks. 
  // Doing it sequentially to avoid rate limits on free tier, 
  // or could use Promise.all with concurrency limit if needed.
  for (let i = 0; i < chunks.length; i++) {
    const chunkText = chunks[i];
    const embedding = await llmService.generateEmbedding(chunkText);
    
    paperChunks.push({
      paperId: paperId,
      chunkIndex: i,
      text: chunkText,
      embedding: embedding
    });
  }

  // Bulk insert into MongoDB
  await PaperChunk.insertMany(paperChunks);
};

/**
 * Queries MongoDB for chunks similar to the question
 * @param {string} paperId - The Mongoose ObjectId of the Paper
 * @param {string} question - The user's question
 * @returns {Promise<string[]>} - Array of top text chunks
 */
const findSimilarChunks = async (paperId, question, topK = 5) => {
  // 1. Embed the question
  const questionEmbedding = await llmService.generateEmbedding(question);

  // 2. Perform vector search in Atlas
  const results = await PaperChunk.aggregate([
    {
      "$vectorSearch": {
        "index": "vector_index", // Name of the Atlas Search index
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

  return results.map(doc => doc.text);
};

module.exports = {
  storeChunks,
  findSimilarChunks
};
