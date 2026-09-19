const vectorService = require('../services/vectorService');
const llmService = require('../services/llmService');
const paperStore = require('../services/paperStore');

const askQuestion = async (req, res) => {
  try {
    const { paperId, question } = req.body;
    const userId = req.auth?.userId || req.body.userId || 'guest_user';

    if (!paperId || !question) {
      return res.status(400).json({ status: 'error', message: 'Missing paperId or question in request body' });
    }

    // Check ownership / existence
    const paper = await paperStore.findPaperByIdAndUser(paperId, userId);
    if (!paper) {
      return res.status(404).json({ status: 'error', message: 'Paper not found or unauthorized access' });
    }

    // 1. Find similar chunks in Atlas or In-Memory vector store
    const retrievedChunks = await vectorService.findSimilarChunks(paperId, question);

    // 2. Answer question with Qwen 3.8 / Gemini fallback
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
