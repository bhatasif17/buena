import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const config = {
  port: process.env.PORT || 3001,
  env: process.env.NODE_ENV || 'development',

  paths: {
    root: join(__dirname, '..', '..'),
    uploads: join(__dirname, '..', '..', 'uploads'),
    database: join(__dirname, '..', '..', 'data', 'buena.db')
  },

  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  },

  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  }
};

export default config;
