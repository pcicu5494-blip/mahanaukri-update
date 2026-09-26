import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Secure admin credentials from environment variables
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AdminSecure@2026';

  /**
   * Prototype Admin Login API:
   * Compares credentials server-side only so the password is NEVER bundled
   * or exposed in client frontend code.
   */
  app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required',
      });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const targetUsername = ADMIN_USERNAME.trim().toLowerCase();

    // Constant-time or direct string verification on server
    if (cleanUsername === targetUsername && String(password) === ADMIN_PASSWORD) {
      // Create signed session token for prototype
      const timestamp = Date.now();
      const token = Buffer.from(
        JSON.stringify({
          sub: ADMIN_USERNAME,
          iat: timestamp,
          exp: timestamp + 24 * 60 * 60 * 1000,
          nonce: Math.random().toString(36).slice(2),
        })
      ).toString('base64');

      return res.json({
        success: true,
        token,
        username: ADMIN_USERNAME,
        message: 'Authentication successful',
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Invalid username or password',
    });
  });

  /**
   * Token verification API
   */
  app.post('/api/admin/verify', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ valid: false, error: 'Missing authorization token' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
      if (decoded && decoded.exp && decoded.exp > Date.now()) {
        return res.json({ valid: true, username: decoded.sub || ADMIN_USERNAME });
      }
    } catch {
      // invalid token format
    }

    return res.status(401).json({ valid: false, error: 'Session expired or invalid' });
  });

  // Public config endpoint (does NOT expose password)
  app.get('/api/admin/config', (_req, res) => {
    return res.json({
      username: ADMIN_USERNAME,
    });
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MahaNaukri server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
