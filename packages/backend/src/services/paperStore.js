const mongoose = require('mongoose');
const Paper = require('../models/Paper');

// In-memory fallback map for when MongoDB is not connected
const inMemoryPapers = new Map();

class InMemoryPaper {
  constructor({ id, userId, title, fileUrl, summary = '', methodology = '', createdAt = new Date() }) {
    this._id = id || `paper_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    this.userId = userId;
    this.title = title;
    this.fileUrl = fileUrl;
    this.summary = summary;
    this.methodology = methodology;
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

const createPaper = async ({ userId, title, fileUrl }) => {
  if (isMongoConnected()) {
    const paper = new Paper({ userId, title, fileUrl });
    return await paper.save();
  } else {
    const paper = new InMemoryPaper({ userId, title, fileUrl });
    return await paper.save();
  }
};

const findPaperByIdAndUser = async (paperId, userId) => {
  if (isMongoConnected()) {
    return await Paper.findOne({ _id: paperId, userId });
  } else {
    const paper = inMemoryPapers.get(paperId?.toString());
    if (!paper) return null;
    if (userId && paper.userId !== userId && paper.userId !== 'guest_user') {
      return null;
    }
    return paper;
  }
};

const listPapersByUser = async (userId) => {
  if (isMongoConnected()) {
    return await Paper.find({ userId }).sort({ createdAt: -1 });
  } else {
    return Array.from(inMemoryPapers.values()).filter(p => !userId || p.userId === userId || p.userId === 'guest_user');
  }
};

module.exports = {
  createPaper,
  findPaperByIdAndUser,
  listPapersByUser,
  isMongoConnected
};
