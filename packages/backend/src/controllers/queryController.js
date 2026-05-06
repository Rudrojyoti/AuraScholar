const ragService = require('../services/ragService');

const askQuestion = async (req, res) => {
  try {
    const { paperId, question } = req.body;

    if (!paperId || !question) {
      return res.status(400).json({ status: 'error', message: 'Missing paperId or question in request body' });
    }

    const answer = await ragService.askQuestion(paperId, question);

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
