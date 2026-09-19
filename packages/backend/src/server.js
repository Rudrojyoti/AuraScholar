const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config');

const PORT = config.port;

const startServer = () => {
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  const shutdown = () => {
    console.log('Signal received: closing HTTP server');
    server.close(() => {
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        mongoose.connection.close(false, () => {
          console.log('MongoDB connection closed');
          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

// Check if MongoDB connection string is provided
if (config.db && config.db.url) {
  console.log('Connecting to MongoDB...');
  mongoose.connect(config.db.url)
    .then(() => {
      console.log('Connected to MongoDB');
      startServer();
    })
    .catch((error) => {
      console.warn('MongoDB connection failed:', error.message);
      console.log('Starting server in standalone mode with in-memory storage...');
      startServer();
    });
} else {
  console.log('[Storage] No MONGODB_URI provided. Starting server in standalone mode with in-memory storage.');
  startServer();
}
