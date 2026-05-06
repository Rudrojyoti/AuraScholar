const pdfParse = require('pdf-parse');

/**
 * Extracts text from a PDF buffer
 * @param {Buffer} dataBuffer - The PDF file buffer
 * @returns {Promise<string>} - Extracted text
 */
const extractText = async (dataBuffer) => {
  try {
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to parse PDF file. Details: ' + error.message);
  }
};

/**
 * Splits text into overlapping chunks
 * @param {string} text - The full text
 * @param {number} chunkSize - Number of characters per chunk
 * @param {number} overlap - Number of overlapping characters
 * @returns {string[]} - Array of text chunks
 */
const chunkText = (text, chunkSize = 2000, overlap = 200) => {
  // Normalize whitespace
  const normalizedText = text.replace(/\s+/g, ' ').trim();
  const chunks = [];
  let i = 0;

  while (i < normalizedText.length) {
    const end = Math.min(i + chunkSize, normalizedText.length);
    let chunk = normalizedText.slice(i, end);

    // If we're not at the end, try to break at the last space to avoid cutting words in half
    if (end < normalizedText.length) {
      const lastSpaceIdx = chunk.lastIndexOf(' ');
      if (lastSpaceIdx > overlap) {
        chunk = chunk.slice(0, lastSpaceIdx);
        i += lastSpaceIdx;
      } else {
        i += chunkSize;
      }
    } else {
      i += chunkSize;
    }
    
    chunks.push(chunk.trim());
    
    // Move back by the overlap amount to create overlapping chunks
    // But don't go backwards infinitely
    if (i < normalizedText.length) {
      i -= overlap;
    }
  }

  return chunks;
};

module.exports = {
  extractText,
  chunkText
};
