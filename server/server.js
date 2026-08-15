require('dotenv').config();
const app = require('./src/app');
const http = require('http');
const { Server } = require('socket.io');
const { sequelize } = require('./src/models');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const { initSocket } = require('./src/socket');
initSocket(io);

// Ensure all model tables exist (creates missing tables without altering existing ones),
// then start the server.
sequelize.sync()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database sync failed:', err);
    process.exit(1);
  });
