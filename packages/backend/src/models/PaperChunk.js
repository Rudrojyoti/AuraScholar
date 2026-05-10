const mongoose = require('mongoose');

const paperChunkSchema = new mongoose.Schema({
  paperId: { type: mongoose.Schema.Types.ObjectId, ref: 'Paper', required: true },
  chunkIndex: { type: Number, required: true },
  text: { type: String, required: true },
  embedding: { type: [Number], required: true }, // 768 dimensions for text-embedding-004
});

module.exports = mongoose.model('PaperChunk', paperChunkSchema);
