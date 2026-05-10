const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config');

const PORT = config.port;

// Connect to MongoDB
mongoose.connect(config.db.url)
  .then(() => {
    console.log('Connected to MongoDB');
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    // Handle graceful shutdown
    const shutdown = () => {
      console.log('Signal received: closing HTTP server and MongoDB connection');
      server.close(() => {
        mongoose.connection.close(false, () => {
          console.log('MongoDB connection closed');
          process.exit(0);
        });
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  });

