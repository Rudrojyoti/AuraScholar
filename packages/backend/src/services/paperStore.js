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

const getUserStats = async (userId) => {
  let totalPapers = 0;
  let totalChunks = 0;

  if (isSupabaseConfigured()) {
    try {
      // 1. Count user papers
      let paperQuery = supabase.from('papers').select('id', { count: 'exact', head: true });
      if (userId && userId !== 'guest_user') {
        paperQuery = paperQuery.eq('user_id', userId);
      }
      const { count: paperCount, error: pErr } = await paperQuery;
      if (!pErr && typeof paperCount === 'number') {
        totalPapers = paperCount;
      }

      // 2. Count user paper chunks
      if (userId && userId !== 'guest_user') {
        const { data: userPaperIds } = await supabase.from('papers').select('id').eq('user_id', userId);
        if (userPaperIds && userPaperIds.length > 0) {
          const ids = userPaperIds.map(p => p.id);
          const { count: chunkCount, error: cErr } = await supabase
            .from('paper_chunks')
            .select('id', { count: 'exact', head: true })
            .in('paper_id', ids);
          if (!cErr && typeof chunkCount === 'number') {
            totalChunks = chunkCount;
          }
        }
      } else {
        const { count: chunkCount, error: cErr } = await supabase
          .from('paper_chunks')
          .select('id', { count: 'exact', head: true });
        if (!cErr && typeof chunkCount === 'number') {
          totalChunks = chunkCount;
        }
      }

      return { totalPapers, totalChunks };
    } catch (err) {
      console.warn('⚠️ Supabase getUserStats failed:', err.message);
    }
  }

  // Fallback if Supabase not reachable
  const userPapers = await listPapersByUser(userId);
  totalPapers = userPapers.length;
  totalChunks = totalPapers * 14; // Average 14 chunks per research paper
  return { totalPapers, totalChunks };
};

module.exports = {
  createPaper,
  findPaperByIdAndUser,
  listPapersByUser,
  getUserStats,
  isMongoConnected,
  isSupabaseConfigured
};
