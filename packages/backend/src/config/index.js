require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3001,
  db: {
    url: process.env.DATABASE_URL
  },
  chroma: {
    url: process.env.CHROMA_URL || 'http://localhost:8000'
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY
  }
};
