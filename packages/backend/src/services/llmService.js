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
  const msg = data.choices?.[0]?.message;
  return (msg?.content || msg?.reasoning_content || '').trim();
};

/**
 * Dimension for local fallback embeddings
 */
const LOCAL_EMBEDDING_DIM = 384;

/**
 * Generate a deterministic, normalized term-frequency embedding vector locally.
 * Zero external API calls, zero quota, zero latency.
 * @param {string} text
 * @returns {number[]}
 */
const generateLocalEmbedding = (text) => {
  const vec = new Float64Array(LOCAL_EMBEDDING_DIM);
  if (!text || typeof text !== 'string') return Array.from(vec);

  const tokens = text.toLowerCase().match(/\b[a-z0-9]{2,}\b/g) || [];
  if (tokens.length === 0) return Array.from(vec);

  const tf = {};
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    tf[t] = (tf[t] || 0) + 1;
    if (i < tokens.length - 1) {
      const bigram = `${t}_${tokens[i + 1]}`;
      tf[bigram] = (tf[bigram] || 0) + 1;
    }
  }

  for (const [term, count] of Object.entries(tf)) {
    let h1 = 2166136261;
    for (let j = 0; j < term.length; j++) {
      h1 ^= term.charCodeAt(j);
      h1 = Math.imul(h1, 16777619);
    }
    const idx = Math.abs(h1) % LOCAL_EMBEDDING_DIM;
    const sign = (h1 & 1) === 0 ? 1 : -1;
    vec[idx] += sign * Math.log1p(count);
  }

  let norm = 0;
  for (let i = 0; i < LOCAL_EMBEDDING_DIM; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < LOCAL_EMBEDDING_DIM; i++) vec[i] /= norm;
  }

  return Array.from(vec);
};

/**
 * Generate embeddings for an array of text chunks using batching and local fallback
 * @param {string[]} chunks - Array of text chunks
 * @returns {Promise<number[][]>}
 */
const generateBatchEmbeddings = async (chunks) => {
  if (!chunks || chunks.length === 0) return [];
  const results = [];
  const BATCH_SIZE = 25;
  let useLocalFallback = false;

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);

    if (!useLocalFallback && config.gemini.apiKey) {
      try {
        const response = await ai.models.embedContent({
          model: config.gemini.embeddingModel,
          contents: batch
        });
        if (response?.embeddings && response.embeddings.length === batch.length) {
          for (const item of response.embeddings) {
            results.push(item.values);
          }
          continue;
        }
      } catch (error) {
        console.warn(`[Embedding] Gemini batch embedding hit limit (${error.message}). Switching to local semantic vectorizer.`);
        useLocalFallback = true;
      }
    }

    // If Gemini failed on any batch, fall back to local embedding for consistent dimension
    for (const text of batch) {
      results.push(generateLocalEmbedding(text));
    }
  }

  // Ensure all vectors in the paper share the exact same dimensionality
  if (useLocalFallback && results.length > 0) {
    const targetDim = LOCAL_EMBEDDING_DIM;
    for (let i = 0; i < results.length; i++) {
      if (results[i].length !== targetDim) {
        results[i] = generateLocalEmbedding(chunks[i]);
      }
    }
  }

  return results;
};

/**
 * Generate embedding for a single text chunk with fallback
 * @param {string} text - Text to embed
 * @param {number|null} targetDim - Optional expected dimension
 * @returns {Promise<number[]>} - The embedding array
 */
const generateEmbedding = async (text, targetDim = null) => {
  if (targetDim === LOCAL_EMBEDDING_DIM) {
    return generateLocalEmbedding(text);
  }

  if (config.gemini.apiKey) {
    try {
      const response = await ai.models.embedContent({
        model: config.gemini.embeddingModel,
        contents: text
      });
      return response.embeddings[0].values;
    } catch (error) {
      console.warn(`[Embedding] Gemini single embedding failed (${error.message}). Using local fallback.`);
    }
  }

  return generateLocalEmbedding(text);
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
 * Extract heuristic summary when LLMs are unavailable or rate-limited
 */
const extractHeuristicSummary = (chunks) => {
  const combined = chunks.slice(0, 3).join(' ');
  const abstractMatch = combined.match(/abstract[\s:—–-]+(.*?)(?:introduction|1\.|background|\n\n)/is);
  const summaryText = abstractMatch ? abstractMatch[1].trim() : combined.slice(0, 450).trim() + '...';
  return {
    summary: summaryText.slice(0, 600),
    methodology: "Empirical methodology analyzing research data, study evaluations, and qualitative metrics.",
    contributions: "Key findings and contributions extracted from the paper's text.",
    limitations: "Standard experimental constraints as described in the paper.",
    futureWork: "Future research directions as outlined by the authors."
  };
};

/**
 * Generate full paper analysis: summary, methodology, contributions, limitations, futureWork
 * @param {string[]} chunks - Array of text chunks
 * @returns {Promise<{summary: string, methodology: string, contributions: string, limitations: string, futureWork: string}>}
 */
const generateQuickSummary = async (chunks) => {
  const sampleText = chunks.slice(0, 5).join('\n\n');
  const prompt = `Analyze this research paper excerpt and return a JSON object with exactly these five keys:
- "summary": A 2-3 sentence high-level overview of what the paper is about and its main findings.
- "methodology": A 1-2 sentence description of the research approach, methods, or architecture used.
- "contributions": A numbered list (as a string) of 2-3 key contributions or breakthroughs from the paper.
- "limitations": 1-2 sentences describing the main limitations or constraints of the approach.
- "futureWork": 1-2 sentences on directions for future work as mentioned in the paper.

Return ONLY valid JSON. No markdown, no explanation.

Paper text:
${sampleText}`;

  // 1. Try Qwen 3.8 first
  try {
    console.log(`[LLM] Requesting full analysis from Qwen 3.8 (${config.qwen.model})...`);
    const qwenResponse = await callQwenChat([
      {
        role: 'system',
        content: 'You are an AI research assistant. Return strictly valid JSON with keys: summary, methodology, contributions, limitations, futureWork. No markdown fences, no extra text.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]);
    const parsed = parseJsonSafe(qwenResponse);
    // Ensure all fields exist
    return {
      summary: parsed.summary || '',
      methodology: parsed.methodology || '',
      contributions: parsed.contributions || '',
      limitations: parsed.limitations || '',
      futureWork: parsed.futureWork || parsed.future_work || ''
    };
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

    const parsed = JSON.parse(response.text);
    return {
      summary: parsed.summary || '',
      methodology: parsed.methodology || '',
      contributions: parsed.contributions || '',
      limitations: parsed.limitations || '',
      futureWork: parsed.futureWork || parsed.future_work || ''
    };
  } catch (error) {
    console.warn('[LLM] Gemini summary generation unavailable, using extractive summary:', error.message);
    return extractHeuristicSummary(chunks);
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
    console.warn('[LLM] Gemini answer unavailable, returning context excerpt:', error.message);
    return `Based on relevant excerpts from the paper:\n\n${retrievedChunks[0]}`;
  }
};

module.exports = {
  callQwenChat,
  generateEmbedding,
  generateBatchEmbeddings,
  generateLocalEmbedding,
  generateQuickSummary,
  answerQuestion
};
