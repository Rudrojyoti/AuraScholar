require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3001,
  db: {
    url: process.env.MONGODB_URI
  },
  qwen: {
    baseUrl: process.env.MODELSCOPE_BASE_URL || 'https://api-inference.modelscope.ai/v1',
    apiKey: process.env.MODELSCOPE_API_KEY || 'ms-f3b12670-e0ff-404e-9594-b96fdf3d7fd9',
    model: process.env.MODELSCOPE_MODEL || 'Qwen/Qwen3.8-27B'
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: 'gemini-2.5-flash',
    embeddingModel: 'gemini-embedding-001'
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY,
    model: 'llama-3.1-70b-versatile'
  },
  clerk: {
    secretKey: process.env.CLERK_SECRET_KEY
  },
  uploadthing: {
    token: process.env.UPLOADTHING_TOKEN,
    secret: process.env.UPLOADTHING_SECRET,
    appId: process.env.UPLOADTHING_APP_ID
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    anonKey: process.env.SUPABASE_ANON_KEY
  }
};
