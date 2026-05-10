const { GoogleGenAI } = require('@google/genai');
const config = require('../config');

// Initialize Gemini client
const ai = new GoogleGenAI({ apiKey: config.gemini.apiKey });

/**
 * Generate embedding for a single text chunk
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} - The embedding array
 */
const generateEmbedding = async (text) => {
  try {
    const response = await ai.models.embedContent({
      model: config.gemini.embeddingModel,
      contents: text
    });
    return response.embeddings[0].values;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
};

/**
 * Generate quick summary and methodology from sample text
 * @param {string[]} chunks - Array of text chunks
 * @returns {Promise<{summary: string, methodology: string}>}
 */
const generateQuickSummary = async (chunks) => {
  const sampleText = chunks.slice(0, 3).join('\n\n');
  const prompt = `Analyze the provided abstract/introduction of the research paper and provide a JSON response with two keys: "summary" (a 2-3 sentence overview) and "methodology" (a 1-2 sentence description of their approach). Here is the text:\n\n${sampleText}`;

  try {
    const response = await ai.models.generateContent({
      model: config.gemini.model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error('Error generating summary:', error);
    return {
      summary: "Could not generate summary.",
      methodology: "Could not analyze methodology."
    };
  }
};

/**
 * Ask a question based on retrieved context chunks
 * @param {string} question - The user's question
 * @param {string[]} retrievedChunks - The context chunks retrieved from vector search
 * @returns {Promise<string>}
 */
const answerQuestion = async (question, retrievedChunks) => {
  if (!retrievedChunks || retrievedChunks.length === 0) {
    return "I couldn't find any relevant information in the uploaded paper to answer your question.";
  }

  const contextText = retrievedChunks.join('\n\n---\n\n');
  const prompt = `Context from paper:\n${contextText}\n\nQuestion: ${question}`;

  try {
    const response = await ai.models.generateContent({
      model: config.gemini.model,
      contents: prompt,
      config: {
        temperature: 0.2,
        systemInstruction: "You are an expert AI research assistant. You answer questions strictly based on the provided paper context. If the answer is not in the context, say \"I don't know based on the provided paper.\" Do not hallucinate."
      }
    });

    return response.text;
  } catch (error) {
    console.error('Error answering question:', error);
    throw new Error('Failed to answer question');
  }
};

module.exports = {
  generateEmbedding,
  generateQuickSummary,
  answerQuestion
};
