const pdfService = require('../services/pdfService');
const ragService = require('../services/ragService');

const uploadPdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No file uploaded' });
    }

    const { originalname, buffer } = req.file;
    const paperId = originalname.replace(/\.[^/.]+$/, ""); // Remove extension for ID
    
    // 1. Extract text and chunk
    const rawText = await pdfService.extractText(buffer);
    const chunks = pdfService.chunkText(rawText);

    if (chunks.length === 0) {
      return res.status(400).json({ status: 'error', message: 'Could not extract text from PDF' });
    }

    // 2. Store in Vector DB (Chroma)
    const collectionName = await ragService.storeDocument(paperId, chunks);

    // 3. Generate initial summary
    const initialData = await ragService.generateQuickSummary(chunks);

    return res.status(200).json({
      status: 'success',
      data: {
        paperId: collectionName,
        summary: initialData.summary,
        methodology: initialData.methodology,
        message: `Successfully processed ${chunks.length} text chunks.`
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Error processing PDF file'
    });
  }
};

module.exports = {
  uploadPdf
};
