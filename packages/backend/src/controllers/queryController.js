const vectorService = require('../services/vectorService');
const llmService = require('../services/llmService');
const Paper = require('../models/Paper');

const askQuestion = async (req, res) => {
  try {
    const { paperId, question } = req.body;
    const userId = req.auth?.userId;

    if (!paperId || !question) {
      return res.status(400).json({ status: 'error', message: 'Missing paperId or question in request body' });
    }

    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    // Check ownership
    const paper = await Paper.findOne({ _id: paperId, userId });
    if (!paper) {
      return res.status(404).json({ status: 'error', message: 'Paper not found or unauthorized access' });
    }

    // 1. Find similar chunks in Atlas
    const retrievedChunks = await vectorService.findSimilarChunks(paperId, question);

    // 2. Answer question with Gemini
    const answer = await llmService.answerQuestion(question, retrievedChunks);

    return res.status(200).json({
      status: 'success',
      data: { answer }
    });

  } catch (error) {
    console.error('Query error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Error processing your question'
    });
  }
};

module.exports = {
  askQuestion
};

