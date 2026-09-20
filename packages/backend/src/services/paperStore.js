const mongoose = require('mongoose');
const Paper = require('../models/Paper');
const { supabase, isConfigured: isSupabaseConfigured } = require('./supabaseClient');

// In-memory fallback map for when persistent databases are not connected
const inMemoryPapers = new Map();

class InMemoryPaper {
  constructor({ id, userId, title, fileUrl, summary = '', methodology = '', contributions = '', limitations = '', futureWork = '', createdAt = new Date() }) {
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

const createPaper = async ({ userId, title, fileUrl, summary = '', methodology = '', contributions = '', limitations = '', futureWork = '' }) => {
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
        future_work: futureWork
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
        createdAt: data.created_at,
        async save() {
          await supabase.from('papers').update({
            summary: this.summary,
            methodology: this.methodology,
            contributions: this.contributions,
            limitations: this.limitations,
            future_work: this.futureWork
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
  const paper = new InMemoryPaper({ userId, title, fileUrl, summary, methodology, contributions, limitations, futureWork });
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
          createdAt: data.created_at,
          async save() {
            await supabase.from('papers').update({
              summary: this.summary,
              methodology: this.methodology,
              contributions: this.contributions,
              limitations: this.limitations,
              future_work: this.futureWork
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

module.exports = {
  createPaper,
  findPaperByIdAndUser,
  listPapersByUser,
  isMongoConnected,
  isSupabaseConfigured
};
