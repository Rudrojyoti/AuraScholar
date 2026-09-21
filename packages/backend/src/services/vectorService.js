const mongoose = require('mongoose');
const PaperChunk = require('../models/PaperChunk');
const llmService = require('./llmService');
const { supabase, isConfigured: isSupabaseConfigured } = require('./supabaseClient');

// In-memory fallback chunk storage
const inMemoryChunks = [];

const defaultPaperChunks = [
  // Paper 1: Attention Is All You Need
  {
    paperId: 'default_paper_1',
    text: "Attention Is All You Need (Vaswani et al., 2017). Abstract: The dominant sequence transduction models are based on complex recurrent or convolutional neural networks in an encoder-decoder configuration. We propose the Transformer, a model architecture eschewing recurrence and relying entirely on an attention mechanism to draw global dependencies between input and output. The Transformer allows for significantly more parallelization and can reach a new state of the art in translation quality after being trained for as little as twelve hours on eight P100 GPUs."
  },
  {
    paperId: 'default_paper_1',
    text: "Scaled Dot-Product Attention: An attention function maps a query and a set of key-value pairs to an output. The output is computed as a weighted sum of the values, where the weight assigned to each value is computed by a compatibility function of the query with the corresponding key. We compute the matrix of outputs as: Attention(Q, K, V) = softmax( (QK^T) / sqrt(d_k) ) V. We divide by sqrt(d_k) because for large values of d_k, dot products grow large in magnitude, pushing the softmax function into regions with extremely small gradients."
  },
  {
    paperId: 'default_paper_1',
    text: "Multi-Head Attention: Instead of performing a single attention function with d_model-dimensional queries, keys and values, we found it beneficial to linearly project queries, keys and values h times with different learned linear projections to d_k, d_k and d_v dimensions. MultiHead(Q, K, V) = Concat(head_1, ..., head_h) W^O, where head_i = Attention(Q W_i^Q, K W_i^K, V W_i^V). Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions simultaneously."
  },
  {
    paperId: 'default_paper_1',
    text: "Positional Encoding: Since our model contains no recurrence and no convolution, in order for the model to make use of the order of the sequence, we inject information about the relative or absolute positions of tokens. We add positional encodings to the input embeddings at the bottoms of the encoder and decoder stacks. We use sine and cosine functions of different frequencies: PE(pos, 2i) = sin(pos / 10000^(2i/d_model)) and PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))."
  },
  {
    paperId: 'default_paper_1',
    text: "Architecture and Complexity: The Transformer follows an encoder-decoder structure using stacked self-attention and point-wise, fully connected layers for both the encoder and decoder. Both encoder and decoder have N=6 identical layers. Self-attention layers connect all positions with a constant O(1) sequential operations, whereas recurrent layers require O(n) sequential operations. The computational complexity per layer is O(n^2 * d) for self-attention."
  },
  {
    paperId: 'default_paper_1',
    text: "Experimental Results: On the WMT 2014 English-to-German translation task, the big transformer model achieves a state-of-the-art BLEU score of 28.4, outperforming the best existing models by over 2.0 BLEU. On the English-to-French task, it achieves 41.8 BLEU after training for 3.5 days on eight GPUs."
  },

  // Paper 2: Llama 3 Herd of Models
  {
    paperId: 'default_paper_2',
    text: "Llama 3 Herd of Models Technical Report (Meta AI, 2024). Abstract: We introduce the Llama 3 herd of models, natively supporting multilinguality, coding, reasoning, and tool usage. Our flagship model is a dense Transformer with 405B parameters and a context window of up to 128K tokens. Llama 3 405B rivals leading frontier closed models such as GPT-4 in knowledge, math, and code capabilities."
  },
  {
    paperId: 'default_paper_2',
    text: "Pre-training Infrastructure: Llama 3 405B was pre-trained on a corpus of 15.6 trillion multilingual tokens using a cluster of 16,384 NVIDIA H100 GPUs with 700W TDP, interconnected via RoCE v2 networks. Training employed 4D parallelism combining Tensor Parallelism (TP=8), Pipeline Parallelism (PP=16), Context Parallelism (CP), and Data Parallelism (FSDP)."
  },
  {
    paperId: 'default_paper_2',
    text: "Architecture & Context: Standard dense autoregressive Transformer architecture enhanced with Grouped-Query Attention (GQA) with 8 key-value heads to optimize inference memory bandwidth and KV cache consumption. RoPE positional embeddings use base frequency theta=500,000 to enable context length scaling up to 128K tokens."
  },
  {
    paperId: 'default_paper_2',
    text: "Post-training Alignment: Post-training combines multiple rounds of Supervised Fine-Tuning (SFT), Direct Preference Optimization (DPO), and rejection sampling. The loss formulation balances language modeling with preference optimization: L_total = L_CLM + lambda_DPO * E(log sigma(beta * Delta_log pi_theta))."
  },
  {
    paperId: 'default_paper_2',
    text: "Evaluation and Benchmarks: Llama 3 405B achieves state-of-the-art open-source performance on MMLU (88.6%), GSM8K (96.8%), MATH (73.8%), HumanEval (89.0%), and BFCL tool calling benchmarks."
  },

  // Paper 3: Retrieval-Augmented Generation for Knowledge-Intensive NLP
  {
    paperId: 'default_paper_3',
    text: "Retrieval-Augmented Generation for Knowledge-Intensive NLP (Lewis et al., NeurIPS 2020). Abstract: Pre-trained neural language models store factual knowledge in their parameters, but have difficulty precisely accessing and manipulating knowledge, and are prone to hallucinations. We introduce RAG models where parametric memory is a pre-trained seq2seq model (BART) and non-parametric memory is a dense vector index of Wikipedia accessed using a pre-trained neural retriever (DPR)."
  },
  {
    paperId: 'default_paper_3',
    text: "Architecture and Components: RAG integrates Dense Passage Retriever (DPR) and BART. The retriever uses a dual-encoder architecture: query encoder BERT_q and passage encoder BERT_d. It indexes 21 million 100-word passages from Wikipedia using FAISS Maximum Inner Product Search (MIPS) to retrieve top-k documents efficiently."
  },
  {
    paperId: 'default_paper_3',
    text: "Formulations: In RAG-Sequence, the model uses the same retrieved passage to generate the complete sequence: P(y|x) = sum_z P_eta(z|x) prod_i P_theta(y_i | x, z, y_{1:i-1}). In RAG-Token, the model can attend to different passages for each token: P(y|x) = prod_i sum_z P_eta(z|x) P_theta(y_i | x, z, y_{1:i-1}). Both models are trained end-to-end without direct supervision on which document should be retrieved."
  },
  {
    paperId: 'default_paper_3',
    text: "Results and Capabilities: RAG sets new state-of-the-art results on open-domain question answering benchmarks including Natural Questions (44.5% Exact Match), TriviaQA (56.8% EM), and WebQuestions (45.2% EM). RAG generation is shown to be significantly more factual, specific, and diverse than parametric-only BART."
  }
];

// Seed default paper chunks with local embeddings
defaultPaperChunks.forEach((item, i) => {
  const embedding = llmService.generateLocalEmbedding(item.text);
  inMemoryChunks.push({
    paperId: item.paperId,
    chunkIndex: i,
    text: item.text,
    embedding
  });
});

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

  const aliasMap = {
    '1': 'default_paper_1',
    '2': 'default_paper_2',
    '3': 'default_paper_3',
    'default_paper_1': '1',
    'default_paper_2': '2',
    'default_paper_3': '3'
  };
  const alternatePid = aliasMap[pidStr];

  // 1. Check local chunks first for dimension detection
  let relevantChunks = inMemoryChunks.filter(c => c.paperId === pidStr || (alternatePid && c.paperId === alternatePid));

  // If no chunks found yet, attempt to dynamically extract chunks from paper metadata
  if (relevantChunks.length === 0) {
    try {
      const paperStore = require('./paperStore');
      const paper = await paperStore.findPaperByIdAndUser(pidStr, 'guest_user');
      if (paper) {
        const metaTexts = [
          paper.title ? `Title: ${paper.title}` : '',
          paper.summary ? `Summary: ${paper.summary}` : '',
          paper.methodology ? `Methodology: ${paper.methodology}` : '',
          paper.contributions ? `Key Contributions: ${paper.contributions}` : '',
          paper.limitations ? `Limitations: ${paper.limitations}` : '',
          paper.futureWork ? `Future Directions: ${paper.futureWork}` : '',
          paper.equation ? `Key Mathematical Formulation: ${paper.equationTag || ''} ${paper.equation}. ${paper.sectionExcerpt || ''}` : ''
        ].filter(Boolean);

        if (metaTexts.length > 0) {
          await storeChunks(pidStr, metaTexts);
          relevantChunks = inMemoryChunks.filter(c => c.paperId === pidStr || (alternatePid && c.paperId === alternatePid));
        }
      }
    } catch (err) {
      console.warn('⚠️ Fallback chunk extraction warning:', err.message);
    }
  }

  const sampleDim = relevantChunks[0]?.embedding?.length || 384;

  // Generate embedding for the question
  const questionEmbedding = await llmService.generateEmbedding(question, sampleDim);

  // 2. Supabase Retrieval (Only if chunks are not already cached in local memory)
  if (relevantChunks.length === 0 && isSupabaseConfigured()) {
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
