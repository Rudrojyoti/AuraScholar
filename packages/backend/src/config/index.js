require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3001,
  db: {
    url: process.env.DATABASE_URL
  },
  chroma: {
    url: process.env.CHROMA_URL || 'http://localhost:8000'
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || 'AIzaSyAS79tZtQd5CFLlTQ9GpJWKY2Sd5M1wHsc'
  }
};
