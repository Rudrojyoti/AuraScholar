const { GoogleGenAI } = require('@google/genai');
const config = require('../config');

// Initialize Gemini client (used for embeddings and fallback LLM)
const ai = new GoogleGenAI({ apiKey: config.gemini.apiKey });

/**
 * Call Qwen 3.8 via ModelScope OpenAI-compatible API
 * @param {Array<{role: string, content: string}>} messages
 * @param {object} options
 * @returns {Promise<string>}
 */
const callQwenChat = async (messages, options = {}) => {
  const url = `${config.qwen.baseUrl.replace(/\/$/, '')}/chat/completions`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.qwen.apiKey}`
    },
    body: JSON.stringify({
      model: config.qwen.model,
      messages: messages,
      temperature: options.temperature ?? 0.2
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ModelScope Qwen error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
};

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
 * Clean JSON output from LLM (removing markdown ```json wrappers)
 */
const parseJsonSafe = (rawText) => {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned);
};

/**
 * Generate quick summary and methodology from sample text
 * @param {string[]} chunks - Array of text chunks
 * @returns {Promise<{summary: string, methodology: string}>}
 */
const generateQuickSummary = async (chunks) => {
  const sampleText = chunks.slice(0, 3).join('\n\n');
  const prompt = `Analyze the provided abstract/introduction of the research paper and provide a JSON response with two keys: "summary" (a 2-3 sentence overview) and "methodology" (a 1-2 sentence description of their approach). Here is the text:\n\n${sampleText}`;

  // 1. Try Qwen 3.8 first
  try {
    console.log(`[LLM] Requesting summary from Qwen 3.8 (${config.qwen.model})...`);
    const qwenResponse = await callQwenChat([
      {
        role: 'system',
        content: 'You are an AI research assistant. Provide your answer strictly as a valid JSON object with keys "summary" and "methodology". Do not add introductory or closing remarks.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]);
    return parseJsonSafe(qwenResponse);
  } catch (qwenError) {
    console.warn(`[LLM] Qwen 3.8 call failed: ${qwenError.message}. Falling back to Gemini 2.5 Flash...`);
  }

  // 2. Fallback to Gemini 2.5 Flash
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
    console.error('Error generating summary with Gemini fallback:', error);
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

  // 1. Try Qwen 3.8 first
  try {
    console.log(`[LLM] Asking Qwen 3.8 (${config.qwen.model})...`);
    const qwenAnswer = await callQwenChat([
      {
        role: 'system',
        content: "You are an expert AI research assistant. You answer questions strictly based on the provided paper context. If the answer is not in the context, say \"I don't know based on the provided paper.\" Do not hallucinate."
      },
      {
        role: 'user',
        content: prompt
      }
    ]);
    return qwenAnswer;
  } catch (qwenError) {
    console.warn(`[LLM] Qwen 3.8 call failed: ${qwenError.message}. Falling back to Gemini 2.5 Flash...`);
  }

  // 2. Fallback to Gemini 2.5 Flash
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
    console.error('Error answering question with Gemini fallback:', error);
    throw new Error('Failed to answer question');
  }
};

module.exports = {
  callQwenChat,
  generateEmbedding,
  generateQuickSummary,
  answerQuestion
};
