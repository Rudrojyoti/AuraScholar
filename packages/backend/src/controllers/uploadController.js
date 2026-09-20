const pdfService = require('../services/pdfService');
const vectorService = require('../services/vectorService');
const llmService = require('../services/llmService');
const paperStore = require('../services/paperStore');

const uploadPdf = async (req, res) => {
  try {
    const { fileUrl, paperName, fileBase64 } = req.body;
    const userId = req.auth?.userId || req.body.userId || 'guest_user';

    if (!paperName || (!fileUrl && !fileBase64)) {
      return res.status(400).json({ status: 'error', message: 'Missing paperName or PDF data (fileUrl / fileBase64)' });
    }

    let buffer;
    if (fileBase64) {
      // Decode base64 PDF
      const cleanBase64 = fileBase64.replace(/^data:application\/pdf;base64,/, '');
      buffer = Buffer.from(cleanBase64, 'base64');
    } else {
      // Fetch the PDF buffer from URL
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch file from URL: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    // Extract text and chunk
    const rawText = await pdfService.extractText(buffer);
    const chunks = pdfService.chunkText(rawText);

    if (chunks.length === 0) {
      return res.status(400).json({ status: 'error', message: 'Could not extract text from PDF' });
    }

    // Create Paper record
    const paper = await paperStore.createPaper({
      userId,
      title: paperName,
      fileUrl: fileUrl || 'in_memory'
    });

    // Store chunks in Vector Store (MongoDB Atlas or In-Memory)
    await vectorService.storeChunks(paper._id, chunks);

    // Generate initial summary using Qwen 3.8 / Gemini fallback
    const initialData = await llmService.generateQuickSummary(chunks);

    // Update Paper with summary
    paper.summary = initialData.summary;
    paper.methodology = initialData.methodology;
    await paper.save();

    return res.status(200).json({
      status: 'success',
      data: {
        paperId: paper._id,
        summary: initialData.summary,
        methodology: initialData.methodology,
        contributions: initialData.contributions,
        limitations: initialData.limitations,
        futureWork: initialData.futureWork,
        numPages: chunks.length,
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

const listUserPapers = async (req, res) => {
  try {
    const userId = req.auth?.userId || req.query.userId || 'guest_user';
    const papers = await paperStore.listPapersByUser(userId);
    return res.status(200).json({
      status: 'success',
      data: { papers }
    });
  } catch (error) {
    console.error('List papers error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Error listing papers'
    });
  }
};

module.exports = {
  uploadPdf,
  listUserPapers
};
