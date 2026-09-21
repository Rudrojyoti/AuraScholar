require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3001,
  db: {
    url: process.env.MONGODB_URI
  },
  qwen: {
    baseUrl: process.env.MODELSCOPE_BASE_URL || 'https://api-inference.modelscope.ai/v1',
    apiKey: process.env.MODELSCOPE_API_KEY,
    model: process.env.MODELSCOPE_MODEL || 'Qwen-Ambassador/Qwen3.8-Flash-Next'
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
    embeddingModel: 'gemini-embedding-001'
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY,
    model: 'llama-3.1-70b-versatile'
  },
  nvidia: {
    baseUrl: process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1',
    apiKey: process.env.NVIDIA_API_KEY,
    model: process.env.NVIDIA_MODEL || 'meta/llama-3.2-11b-vision-instruct'
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
