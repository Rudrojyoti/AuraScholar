const mongoose = require('mongoose');

const paperSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Clerk user ID
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  summary: { type: String },
  methodology: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Paper', paperSchema);
