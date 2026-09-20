const { createClient } = require('@supabase/supabase-js');
const config = require('../config');

let supabase = null;
let isConfiguredFlag = false;

if (config.supabase && config.supabase.url && (config.supabase.serviceKey || config.supabase.anonKey)) {
  const key = config.supabase.serviceKey || config.supabase.anonKey;
  // Ensure not placeholder
  if (!config.supabase.url.includes('your-project') && !key.includes('your-service-role')) {
    try {
      supabase = createClient(config.supabase.url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      });
      isConfiguredFlag = true;
      console.log('✅ Supabase client initialized:', config.supabase.url);
    } catch (err) {
      console.warn('⚠️ Failed to initialize Supabase client:', err.message);
    }
  }
}

const isConfigured = () => {
  return isConfiguredFlag && supabase !== null;
};

const checkConnection = async () => {
  if (!isConfigured()) {
    return { connected: false, reason: 'Supabase credentials not configured in backend/.env' };
  }
  try {
    const { data, error } = await supabase.from('papers').select('id').limit(1);
    if (error) {
      return { connected: false, error: error.message };
    }
    return { connected: true, papersCountSample: data?.length || 0 };
  } catch (e) {
    return { connected: false, error: e.message };
  }
};

module.exports = {
  supabase,
  isConfigured,
  checkConnection
};
