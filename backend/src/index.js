import app from './app.js';
import config from './config/index.js';

const server = app.listen(config.port, () => {
  console.log(`
╔════════════════════════════════════════════╗
║     Buena Property Management API          ║
╠════════════════════════════════════════════╣
║  Server running on port ${config.port}     ║
║  Environment: ${config.env.padEnd(24)}     ║
║  URL: http://localhost:${config.port}      ║
╚════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

export default server;
