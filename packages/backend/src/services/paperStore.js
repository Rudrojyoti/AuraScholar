const mongoose = require('mongoose');
const Paper = require('../models/Paper');
const { supabase, isConfigured: isSupabaseConfigured } = require('./supabaseClient');

// In-memory fallback map for when persistent databases are not connected
const inMemoryPapers = new Map();

class InMemoryPaper {
  constructor({ id, userId, title, fileUrl, summary = '', methodology = '', contributions = '', limitations = '', futureWork = '', equation = null, equationTag = null, sectionTitle = null, sectionExcerpt = null, createdAt = new Date() }) {
    this._id = id || `paper_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    this.id = this._id;
    this.userId = userId;
    this.title = title;
    this.fileUrl = fileUrl;
    this.summary = summary;
    this.methodology = methodology;
    this.contributions = contributions;
    this.limitations = limitations;
    this.futureWork = futureWork;
    this.equation = equation;
    this.equationTag = equationTag;
    this.sectionTitle = sectionTitle;
    this.sectionExcerpt = sectionExcerpt;
    this.createdAt = createdAt;
  }

  async save() {
    inMemoryPapers.set(this._id.toString(), this);
    return this;
  }
}

const defaultSeedPapers = [
  {
    id: 'default_paper_1',
    userId: 'system',
    title: 'Attention Is All You Need.pdf',
    fileUrl: 'in_memory',
    summary: 'Introduces the Transformer, a revolutionary neural architecture dispensing with recurrences and convolutions entirely, relying solely on self-attention mechanisms. Achieves 28.4 BLEU on English-to-German and 41.8 BLEU on English-to-French translation benchmarks with unprecedented GPU parallelization efficiency.',
    methodology: 'Features a 6-layer encoder-decoder topology. Each layer combines multi-head self-attention and position-wise feed-forward networks, wrapped with residual connections and layer normalization. Positional encodings are injected via sinusoidal frequency vectors.',
    contributions: '1. Pure self-attention without recurrent inductive biases.\n2. O(1) sequential operation complexity enabling massive context parallelization.\n3. State-of-the-art translation with drastically reduced training compute requirements.',
    limitations: 'Quadratic O(N²) memory complexity with respect to sequence length N; lack of native recurrence necessitates explicit sinusoidal position encoding vectors.',
    futureWork: 'Extending self-attention to multi-modal video/audio tensors and sparse attention mechanisms for million-token contexts.',
    equation: 'Attention(Q, K, V) = softmax( (QKᵀ) / √dₖ ) V',
    equationTag: 'Eq. 1',
    sectionTitle: '3.2 Multi-Head Attention Manifold & Dot-Product Scaling',
    sectionExcerpt: 'Assuming queries and keys of dimension d_k, and values of dimension d_v, we compute the matrix of attention outputs over all positions simultaneously without recurrent dependencies.'
  },
  {
    id: 'default_paper_2',
    userId: 'system',
    title: 'Llama 3 Herd of Models Technical Report.pdf',
    fileUrl: 'in_memory',
    summary: 'Details the training and architecture of Llama 3 405B, 70B, and 8B models. Highlights massive compute scaling, data filtering pipelines, and post-training alignment strategies matching closed frontier models.',
    methodology: 'Standard dense auto-regressive transformer with Grouped-Query Attention (GQA) and RoPE (Rotary Position Embeddings) scaling up to 128k context windows.',
    contributions: 'Public weights for state-of-the-art 405B parameter dense model; exhaustive empirical scaling laws up to 15T tokens.',
    limitations: 'Massive hardware footprint required to serve 405B FP16; susceptible to standard generative hallucinations on ultra-niche domains.',
    futureWork: 'Adaptive inference-time reasoning compute and agentic tool synthesis.',
    equation: 'L_total = L_CLM + λ_DPO * E(log σ(β * Δlog π_θ))',
    equationTag: 'Eq. 7',
    sectionTitle: '4.1 Dense Autoregressive Scaling & Post-Training Alignment',
    sectionExcerpt: 'Pre-trained on 15 trillion multilingual tokens using 4D parallelism across 16,384 H100 GPUs, followed by iterative DPO (Direct Preference Optimization) and rejection sampling.'
  },
  {
    id: 'default_paper_3',
    userId: 'system',
    title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP.pdf',
    fileUrl: 'in_memory',
    summary: 'Framework combining a pre-trained sequence-to-sequence model (BART) with an external dense retrieval index (DPR). Reduces factual hallucinations on Natural Questions and TriviaQA benchmarks.',
    methodology: 'Dense passage retrieval via bi-encoder, combined with marginal likelihood generation across retrieved documents.',
    contributions: 'First end-to-end differentiable RAG framework; proven reduction in factual errors over purely parametric models.',
    limitations: 'High retrieval latency overhead; dependency on index staleness and embedding drift.',
    futureWork: 'Iterative multi-hop document retrieval and real-time index re-ranking.',
    equation: 'P(y|x) = ∑ z∈top-k P_η(z|x) ∏ P_θ(y_i | x, z, y_{1:i-1})',
    equationTag: 'Eq. 2',
    sectionTitle: '2.1 Parametric & Non-Parametric Memory',
    sectionExcerpt: 'Combines a pre-trained sequence-to-sequence generator with dense vector index retrieval over Wikipedia using Maximum Inner Product Search (MIPS).'
  }
];

// Initialize default seed papers in memory
defaultSeedPapers.forEach((paperData, index) => {
  const paperObj = new InMemoryPaper(paperData);
  inMemoryPapers.set(paperData.id, paperObj);
  inMemoryPapers.set(String(index + 1), paperObj);
});


const isMongoConnected = () => {
  return mongoose.connection && mongoose.connection.readyState === 1;
};

const createPaper = async ({ userId, title, fileUrl, summary = '', methodology = '', contributions = '', limitations = '', futureWork = '', equation = null, equationTag = null, sectionTitle = null, sectionExcerpt = null }) => {
  // 1. Supabase PostgreSQL (Primary Persistent DB)
  if (isSupabaseConfigured()) {
    try {
      const generatedId = `paper_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const { data, error } = await supabase.from('papers').insert({
        id: generatedId,
        user_id: userId,
        title,
        file_url: fileUrl,
        summary,
        methodology,
        contributions,
        limitations,
        future_work: futureWork,
        equation,
        equation_tag: equationTag,
        section_title: sectionTitle,
        section_excerpt: sectionExcerpt
      }).select().single();

      if (error) throw error;

      return {
        _id: data.id,
        id: data.id,
        userId: data.user_id,
        title: data.title,
        fileUrl: data.file_url,
        summary: data.summary,
        methodology: data.methodology,
        contributions: data.contributions,
        limitations: data.limitations,
        futureWork: data.future_work,
        equation: data.equation,
        equationTag: data.equation_tag,
        sectionTitle: data.section_title,
        sectionExcerpt: data.section_excerpt,
        createdAt: data.created_at,
        async save() {
          await supabase.from('papers').update({
            summary: this.summary,
            methodology: this.methodology,
            contributions: this.contributions,
            limitations: this.limitations,
            future_work: this.futureWork,
            equation: this.equation,
            equation_tag: this.equationTag,
            section_title: this.sectionTitle,
            section_excerpt: this.sectionExcerpt
          }).eq('id', this._id);
          return this;
        }
      };
    } catch (err) {
      console.warn('⚠️ Supabase createPaper failed, falling back to local store:', err.message);
    }
  }

  // 2. MongoDB Fallback (if connected)
  if (isMongoConnected()) {
    const paper = new Paper({ userId, title, fileUrl, summary, methodology });
    return await paper.save();
  }

  // 3. In-Memory Fallback
  const paper = new InMemoryPaper({ userId, title, fileUrl, summary, methodology, contributions, limitations, futureWork, equation, equationTag, sectionTitle, sectionExcerpt });
  return await paper.save();
};

const findPaperByIdAndUser = async (paperId, userId) => {
  const pidStr = paperId?.toString();

  // 0. Seeded system papers (public defaults accessible to all users)
  const seedPaper = inMemoryPapers.get(pidStr);
  if (seedPaper && seedPaper.userId === 'system') {
    return seedPaper;
  }

  // 1. Supabase
  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('papers').select('*').eq('id', pidStr);
      if (userId && userId !== 'guest_user') {
        query = query.eq('user_id', userId);
      }
      const { data, error } = await query.single();
      if (!error && data) {
        return {
          _id: data.id,
          id: data.id,
          userId: data.user_id,
          title: data.title,
          fileUrl: data.file_url,
          summary: data.summary,
          methodology: data.methodology,
          contributions: data.contributions,
          limitations: data.limitations,
          futureWork: data.future_work,
          equation: data.equation,
          equationTag: data.equation_tag,
          sectionTitle: data.section_title,
          sectionExcerpt: data.section_excerpt,
          createdAt: data.created_at,
          async save() {
            await supabase.from('papers').update({
              summary: this.summary,
              methodology: this.methodology,
              contributions: this.contributions,
              limitations: this.limitations,
              future_work: this.futureWork,
              equation: this.equation,
              equation_tag: this.equationTag,
              section_title: this.sectionTitle,
              section_excerpt: this.sectionExcerpt
            }).eq('id', this._id);
            return this;
          }
        };
      }
    } catch (err) {
      console.warn('⚠️ Supabase findPaper failed, falling back to local store:', err.message);
    }
  }

  // 2. MongoDB
  if (isMongoConnected()) {
    return await Paper.findOne({ _id: paperId, userId });
  }

  // 3. In-Memory
  const paper = inMemoryPapers.get(pidStr);
  if (!paper) return null;
  if (userId && paper.userId !== userId && paper.userId !== 'guest_user') {
    return null;
  }
  return paper;
};

const listPapersByUser = async (userId) => {
  // 1. Supabase
  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('papers').select('*').order('created_at', { ascending: false });
      if (userId && userId !== 'guest_user') {
        query = query.eq('user_id', userId);
      }
      const { data, error } = await query;
      if (!error && data) {
        return data.map(d => ({
          _id: d.id,
          id: d.id,
          userId: d.user_id,
          title: d.title,
          fileUrl: d.file_url,
          summary: d.summary,
          methodology: d.methodology,
          contributions: d.contributions,
          limitations: d.limitations,
          futureWork: d.future_work,
          equation: d.equation,
          equationTag: d.equation_tag,
          sectionTitle: d.section_title,
          sectionExcerpt: d.section_excerpt,
          createdAt: d.created_at
        }));
      }
    } catch (err) {
      console.warn('⚠️ Supabase listPapers failed, falling back to local store:', err.message);
    }
  }

  // 2. MongoDB
  if (isMongoConnected()) {
    return await Paper.find({ userId }).sort({ createdAt: -1 });
  }

  // 3. In-Memory
  return Array.from(inMemoryPapers.values()).filter(p => !userId || p.userId === userId || p.userId === 'guest_user');
};

const statsCache = new Map();

const getUserStats = async (userId) => {
  const cacheKey = userId || 'guest_user';
  const now = Date.now();
  const cached = statsCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  let totalPapers = 0;
  let totalChunks = 0;

  if (isSupabaseConfigured()) {
    try {
      if (userId && userId !== 'guest_user') {
        const [paperCountRes, userPaperIdsRes] = await Promise.all([
          supabase.from('papers').select('id', { count: 'exact', head: true }).eq('user_id', userId),
          supabase.from('papers').select('id').eq('user_id', userId)
        ]);

        if (!paperCountRes.error && typeof paperCountRes.count === 'number') {
          totalPapers = paperCountRes.count;
        }
        if (!userPaperIdsRes.error && userPaperIdsRes.data && userPaperIdsRes.data.length > 0) {
          const ids = userPaperIdsRes.data.map(p => p.id);
          const { count: chunkCount, error: cErr } = await supabase
            .from('paper_chunks')
            .select('id', { count: 'exact', head: true })
            .in('paper_id', ids);
          if (!cErr && typeof chunkCount === 'number') {
            totalChunks = chunkCount;
          }
        }
      } else {
        const [paperCountRes, chunkCountRes] = await Promise.all([
          supabase.from('papers').select('id', { count: 'exact', head: true }),
          supabase.from('paper_chunks').select('id', { count: 'exact', head: true })
        ]);
        if (!paperCountRes.error && typeof paperCountRes.count === 'number') {
          totalPapers = paperCountRes.count;
        }
        if (!chunkCountRes.error && typeof chunkCountRes.count === 'number') {
          totalChunks = chunkCountRes.count;
        }
      }

      const result = { totalPapers, totalChunks };
      statsCache.set(cacheKey, { data: result, expiresAt: now + 30000 });
      return result;
    } catch (err) {
      console.warn('⚠️ Supabase getUserStats failed:', err.message);
    }
  }

  // Fallback if Supabase not reachable
  const userPapers = await listPapersByUser(userId);
  totalPapers = userPapers.length;
  totalChunks = totalPapers * 14; // Average 14 chunks per research paper
  const result = { totalPapers, totalChunks };
  statsCache.set(cacheKey, { data: result, expiresAt: now + 30000 });
  return result;
};

module.exports = {
  createPaper,
  findPaperByIdAndUser,
  listPapersByUser,
  getUserStats,
  isMongoConnected,
  isSupabaseConfigured
};
