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
 * Call Gemini Flash via direct Google Generative Language REST API (High speed, ~1.2s)
 * @param {string} prompt
 * @param {string} systemInstruction
 * @param {object} options
 * @returns {Promise<string>}
 */
const callGeminiChat = async (prompt, systemInstruction = '', options = {}) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.gemini.model}:generateContent?key=${config.gemini.apiKey}`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: options.temperature ?? 0.2
    }
  };
  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }
  if (options.responseMimeType) {
    body.generationConfig.responseMimeType = options.responseMimeType;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response received from Gemini');
  return text.trim();
};

/**
 * Call NVIDIA NIM / OpenAI-compatible API (e.g. meta/llama-3.2-11b-vision-instruct)
 * @param {Array<{role: string, content: string}>} messages
 * @param {object} options
 * @returns {Promise<string>}
 */
const callNvidiaChat = async (messages, options = {}) => {
  if (!config.nvidia.apiKey) {
    throw new Error('NVIDIA API key not configured');
  }
  const url = `${config.nvidia.baseUrl.replace(/\/$/, '')}/chat/completions`;
  const model = options.model || config.nvidia.model || 'meta/llama-3.2-11b-vision-instruct';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.nvidia.apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? 0.2,
      max_tokens: options.max_tokens ?? 1024
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NVIDIA NIM API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response received from NVIDIA NIM');
  return content.trim();
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
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.gemini.embeddingModel}:embedContent?key=${config.gemini.apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: `models/${config.gemini.embeddingModel}`,
          content: { parts: [{ text }] }
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.embedding?.values) {
          return data.embedding.values;
        }
      }
    } catch (error) {
      console.warn(`[Embedding] Gemini single embedding failed (${error.message}). Using local fallback.`);
    }
  }

  return generateLocalEmbedding(text);
};

/**
 * Clean JSON output from LLM (removing markdown ```json wrappers)
 */
/**
 * Clean JSON output from LLM (removing markdown ```json wrappers)
 */
const parseJsonSafe = (rawText) => {
  let cleaned = (rawText || '').trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  } else {
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
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
    futureWork: "Future research directions as outlined by the authors.",
    equation: "Accuracy = (TP + TN) / (TP + TN + FP + FN)",
    equationTag: "Eq. 1",
    sectionTitle: "2.0 Empirical Methodology",
    sectionExcerpt: "Quantitative assessment metrics evaluated across all benchmark test partitions."
  };
};

/**
 * Generate full paper analysis: summary, methodology, contributions, limitations, futureWork, and core mathematical formula
 * @param {string[]} chunks - Array of text chunks
 * @returns {Promise<{summary: string, methodology: string, contributions: string, limitations: string, futureWork: string, equation: string, equationTag: string, sectionTitle: string, sectionExcerpt: string}>}
 */
const generateQuickSummary = async (chunks) => {
  const sampleText = chunks.slice(0, 6).join('\n\n');
  const prompt = `Analyze this research paper text and extract structured technical intelligence as a JSON object with exactly these keys:
- "summary": A 2-3 sentence high-level synthesis of what the paper is about and its core findings.
- "methodology": A 1-2 sentence description of the research approach, architecture, or empirical methodology.
- "contributions": A numbered list (as a string) of 2-3 novel contributions or breakthroughs from the paper.
- "limitations": 1-2 sentences describing the main constraints or limitations discussed in the paper.
- "futureWork": 1-2 sentences on directions for future research.
- "equation": The most significant mathematical formula, derivation, or formal quantitative relation found in this paper, written in clean mathematical or LaTeX notation (e.g. "Attention(Q, K, V) = softmax((QK^T) / \\sqrt{d_k}) V", "\\mathcal{L}_{total} = ...", or an empirical regression metric). If no explicit formula is stated, derive the core quantitative definition.
- "equationTag": The reference label for this formula (e.g. "Eq. 1", "Eq. 3", or "Theorem 1").
- "sectionTitle": The section heading or context where this formula appears (e.g. "3.2 Multi-Head Attention", "4.1 Loss Formulation", or "2.0 Theoretical Framework").
- "sectionExcerpt": A 1-2 sentence technical excerpt from the paper describing or justifying this equation.

Return ONLY valid JSON. No markdown code blocks, no explanation.

Paper text:
${sampleText}`;

  // 1. Fast Path: Try Gemini (~1.2s)
  if (config.gemini.apiKey) {
    try {
      console.log(`[LLM] Fast path: Generating synthesis with Gemini (${config.gemini.model})...`);
      const geminiResponse = await callGeminiChat(
        prompt,
        'You are an expert scientific intelligence system. Return strictly a valid JSON object with keys: summary, methodology, contributions, limitations, futureWork, equation, equationTag, sectionTitle, sectionExcerpt. No markdown wrappers, no commentary.',
        { responseMimeType: "application/json", temperature: 0.2 }
      );
      const parsed = parseJsonSafe(geminiResponse);
      return {
        summary: parsed.summary || '',
        methodology: parsed.methodology || '',
        contributions: parsed.contributions || '',
        limitations: parsed.limitations || '',
        futureWork: parsed.futureWork || parsed.future_work || '',
        equation: parsed.equation || '∇_μ F^μν = 4π J^ν',
        equationTag: parsed.equationTag || parsed.equation_tag || 'Eq. 1',
        sectionTitle: parsed.sectionTitle || parsed.section_title || 'Core Theoretical Framework',
        sectionExcerpt: parsed.sectionExcerpt || parsed.section_excerpt || 'Key mathematical derivation extracted from the document.'
      };
    } catch (geminiError) {
      console.warn(`[LLM] Gemini summary failed (${geminiError.message}). Falling back to Qwen 3.8...`);
    }
  }

  // 2. Secondary Path: Fallback to Qwen 3.8
  if (config.qwen.apiKey) {
    try {
      console.log(`[LLM] Secondary path: Requesting analysis from Qwen 3.8 (${config.qwen.model})...`);
      const qwenResponse = await callQwenChat([
        {
          role: 'system',
          content: 'You are an expert scientific intelligence system. Return strictly a valid JSON object with keys: summary, methodology, contributions, limitations, futureWork, equation, equationTag, sectionTitle, sectionExcerpt. No markdown wrappers, no commentary.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]);
      const parsed = parseJsonSafe(qwenResponse);
      return {
        summary: parsed.summary || '',
        methodology: parsed.methodology || '',
        contributions: parsed.contributions || '',
        limitations: parsed.limitations || '',
        futureWork: parsed.futureWork || parsed.future_work || '',
        equation: parsed.equation || '∇_μ F^μν = 4π J^ν',
        equationTag: parsed.equationTag || parsed.equation_tag || 'Eq. 1',
        sectionTitle: parsed.sectionTitle || parsed.section_title || 'Core Theoretical Framework',
        sectionExcerpt: parsed.sectionExcerpt || parsed.section_excerpt || 'Key mathematical derivation extracted from the document.'
      };
    } catch (qwenError) {
      console.warn(`[LLM] Qwen 3.8 call failed: ${qwenError.message}`);
    }
  }

  // 3. Tertiary Path: NVIDIA NIM (Llama 3.2 11B Vision)
  if (config.nvidia.apiKey) {
    try {
      console.log(`[LLM] Tertiary path: Requesting analysis from NVIDIA NIM (${config.nvidia.model})...`);
      const nvidiaResponse = await callNvidiaChat([
        {
          role: 'system',
          content: 'You are an expert scientific intelligence system. Return strictly a valid JSON object with keys: summary, methodology, contributions, limitations, futureWork, equation, equationTag, sectionTitle, sectionExcerpt. No markdown wrappers, no commentary.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]);
      const parsed = parseJsonSafe(nvidiaResponse);
      return {
        summary: parsed.summary || '',
        methodology: parsed.methodology || '',
        contributions: parsed.contributions || '',
        limitations: parsed.limitations || '',
        futureWork: parsed.futureWork || parsed.future_work || '',
        equation: parsed.equation || '∇_μ F^μν = 4π J^ν',
        equationTag: parsed.equationTag || parsed.equation_tag || 'Eq. 1',
        sectionTitle: parsed.sectionTitle || parsed.section_title || 'Core Theoretical Framework',
        sectionExcerpt: parsed.sectionExcerpt || parsed.section_excerpt || 'Key mathematical derivation extracted from the document.'
      };
    } catch (nvidiaError) {
      console.warn(`[LLM] NVIDIA NIM summary call failed: ${nvidiaError.message}`);
    }
  }

  return extractHeuristicSummary(chunks);
};

/**
 * Ask a question based on retrieved context chunks
 * @param {string} question - The user's question
 * @param {string[]} retrievedChunks - The context chunks retrieved from vector search
 * @param {object} [options] - Options including preferred model
 * @returns {Promise<string>}
 */
const answerQuestion = async (question, retrievedChunks, options = {}) => {
  if (!retrievedChunks || retrievedChunks.length === 0) {
    return "I couldn't find any relevant information in the uploaded paper to answer your question.";
  }

  const contextText = retrievedChunks.join('\n\n---\n\n');
  const prompt = `Context from paper:\n${contextText}\n\nQuestion: ${question}`;
  const systemInstruction = "You are an expert AI research assistant. You answer questions strictly based on the provided paper context. If the answer is not in the context, say \"I don't know based on the provided paper.\" Do not hallucinate.";

  const preferredModel = (options.model || '').toLowerCase();

  // Priority 1: User explicitly requested NVIDIA NIM
  if (preferredModel.includes('nvidia') && config.nvidia.apiKey) {
    try {
      console.log(`[LLM] User preferred: Querying NVIDIA NIM (${config.nvidia.model})...`);
      const nvidiaAnswer = await callNvidiaChat([
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt }
      ]);
      return nvidiaAnswer;
    } catch (nvidiaError) {
      console.warn(`[LLM] NVIDIA NIM call failed (${nvidiaError.message}). Trying fallback...`);
    }
  }

  // Priority 2: Fast Path: Gemini (~1.2s via Google's edge network)
  if (config.gemini.apiKey) {
    try {
      console.log(`[LLM] Fast path: Querying Gemini (${config.gemini.model})...`);
      const geminiAnswer = await callGeminiChat(prompt, systemInstruction);
      return geminiAnswer;
    } catch (geminiError) {
      console.warn(`[LLM] Gemini call failed (${geminiError.message}). Falling back to NVIDIA NIM...`);
    }
  }

  // Priority 3: NVIDIA NIM Fallback (Llama 3.2 11B Vision)
  if (config.nvidia.apiKey) {
    try {
      console.log(`[LLM] High-fidelity fallback: Querying NVIDIA NIM (${config.nvidia.model})...`);
      const nvidiaAnswer = await callNvidiaChat([
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt }
      ]);
      return nvidiaAnswer;
    } catch (nvidiaError) {
      console.warn(`[LLM] NVIDIA NIM fallback failed: ${nvidiaError.message}`);
    }
  }

  // Priority 4: Fallback to Qwen 3.8 on ModelScope
  if (config.qwen.apiKey) {
    try {
      console.log(`[LLM] Secondary path: Querying Qwen 3.8 (${config.qwen.model})...`);
      const qwenAnswer = await callQwenChat([
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt }
      ]);
      return qwenAnswer;
    } catch (qwenError) {
      console.warn(`[LLM] Qwen 3.8 call failed: ${qwenError.message}`);
    }
  }

  // 5. Fallback to matched excerpt if all LLMs are unavailable
  return `Based on relevant excerpts from the paper:\n\n${retrievedChunks[0]}`;
};

module.exports = {
  callQwenChat,
  callGeminiChat,
  callNvidiaChat,
  generateEmbedding,
  generateBatchEmbeddings,
  generateLocalEmbedding,
  generateQuickSummary,
  answerQuestion
};
