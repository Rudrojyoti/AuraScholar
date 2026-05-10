require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3001,
  db: {
    url: process.env.MONGODB_URI
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: 'gemini-1.5-flash',
    embeddingModel: 'text-embedding-004'
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY,
    model: 'llama-3.1-70b-versatile'
  },
  clerk: {
    secretKey: process.env.CLERK_SECRET_KEY
  },
  uploadthing: {
    secret: process.env.UPLOADTHING_SECRET,
    appId: process.env.UPLOADTHING_APP_ID
  }
};
