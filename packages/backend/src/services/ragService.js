const { ChromaClient } = require('chromadb');
const OpenAI = require('openai');
const config = require('../config');

// Initialize clients
const chroma = new ChromaClient({ path: config.chroma.url });
const openai = new OpenAI({ apiKey: config.openai.apiKey });

/**
 * Stores text chunks into ChromaDB with embeddings
 * @param {string} collectionName - Unique ID/name for the paper
 * @param {string[]} chunks - Array of text chunks
 */
const storeDocument = async (collectionName, chunks) => {
  // Ensure a clean collection name (Chroma has naming restrictions: 3-63 chars, alphanumeric/hyphens/underscores)
  const safeName = collectionName.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 63);
  
  // Get or create the collection
  const collection = await chroma.getOrCreateCollection({
    name: safeName,
    metadata: { "description": "Paper chunks" }
  });

  // Generate embeddings for all chunks
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: chunks,
  });

  const embeddings = response.data.map(item => item.embedding);
  const ids = chunks.map((_, idx) => `chunk_${idx}`);
  const metadatas = chunks.map((_, idx) => ({ source: safeName, chunkIndex: idx }));

  // Store in ChromaDB
  await collection.add({
    ids: ids,
    embeddings: embeddings,
    metadatas: metadatas,
    documents: chunks,
  });

  return safeName;
};

/**
 * Queries the document to answer a question
 * @param {string} collectionName - The name of the collection to query
 * @param {string} question - The user's question
 * @returns {Promise<string>} - The LLM's answer
 */
const askQuestion = async (collectionName, question) => {
  const safeName = collectionName.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 63);
  
  // 1. Embed the question
  const questionEmbeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: question,
  });
  const questionEmbedding = questionEmbeddingResponse.data[0].embedding;

  // 2. Query ChromaDB for top 5 most relevant chunks
  const collection = await chroma.getCollection({ name: safeName });
  const results = await collection.query({
    queryEmbeddings: [questionEmbedding],
    nResults: 5,
  });

  const retrievedChunks = results.documents[0]; // Array of text chunks
  
  if (!retrievedChunks || retrievedChunks.length === 0) {
    return "I couldn't find any relevant information in the uploaded paper to answer your question.";
  }

  // 3. Prompt the LLM with the context
  const contextText = retrievedChunks.join('\n\n---\n\n');
  
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are an expert AI research assistant. You answer questions strictly based on the provided paper context. If the answer is not in the context, say "I don't know based on the provided paper." Do not hallucinate.`
      },
      {
        role: 'user',
        content: `Context from paper:\n${contextText}\n\nQuestion: ${question}`
      }
    ],
    temperature: 0.2,
  });

  return completion.choices[0].message.content;
};

/**
 * Generates a high-level summary/methodology using a sample of the text
 * @param {string[]} chunks - Array of text chunks
 */
const generateQuickSummary = async (chunks) => {
  // Take the first few chunks to generate a high-level summary to save tokens
  const sampleText = chunks.slice(0, 3).join('\n\n');
  
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `Analyze the provided abstract/introduction of the research paper and provide a JSON response with two keys: "summary" (a 2-3 sentence overview) and "methodology" (a 1-2 sentence description of their approach).`
      },
      {
        role: 'user',
        content: sampleText
      }
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,
  });

  return JSON.parse(completion.choices[0].message.content);
};

module.exports = {
  storeDocument,
  askQuestion,
  generateQuickSummary
};
