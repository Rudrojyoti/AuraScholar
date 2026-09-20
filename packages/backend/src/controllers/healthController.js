const supabaseClient = require('../services/supabaseClient');

const getHealth = async (req, res) => {
  let dbStatus = {
    provider: 'in_memory',
    status: 'active'
  };

  if (supabaseClient.isConfigured()) {
    const check = await supabaseClient.checkConnection();
    dbStatus = {
      provider: 'supabase_postgres',
      status: check.connected ? 'connected' : 'connection_error',
      details: check.error || `Connected (${check.papersCountSample} papers sampled)`
    };
  }

  res.status(200).json({
    status: 'success',
    message: 'API is running successfully',
    database: dbStatus,
    fileStorage: {
      provider: 'uploadthing',
      status: process.env.UPLOADTHING_TOKEN ? 'connected' : 'not_configured'
    },
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  getHealth
};
