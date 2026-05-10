const pdfService = require('../services/pdfService');
const vectorService = require('../services/vectorService');
const llmService = require('../services/llmService');
const Paper = require('../models/Paper');

const uploadPdf = async (req, res) => {
  try {
    const { fileUrl, paperName } = req.body;
    const userId = req.auth?.userId; // Ensure Clerk middleware is passing auth

    if (!fileUrl || !paperName) {
      return res.status(400).json({ status: 'error', message: 'Missing fileUrl or paperName' });
    }

    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    // 1. Fetch the PDF buffer from Uploadthing URL
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch file from URL: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Extract text and chunk
    const rawText = await pdfService.extractText(buffer);
    const chunks = pdfService.chunkText(rawText);

    if (chunks.length === 0) {
      return res.status(400).json({ status: 'error', message: 'Could not extract text from PDF' });
    }

    // 3. Create Paper record in MongoDB
    const paper = new Paper({
      userId,
      title: paperName,
      fileUrl
    });
    await paper.save();

    // 4. Store chunks in Vector DB (MongoDB Atlas)
    await vectorService.storeChunks(paper._id, chunks);

    // 5. Generate initial summary
    const initialData = await llmService.generateQuickSummary(chunks);

    // 6. Update Paper with summary
    paper.summary = initialData.summary;
    paper.methodology = initialData.methodology;
    await paper.save();

    return res.status(200).json({
      status: 'success',
      data: {
        paperId: paper._id,
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

