import dotenv from 'dotenv';
import app from './app.js';
import { initDb, pool } from './config/db.js';
import { seedDemo } from './config/seed.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await initDb();
    // Seed demo users when explicitly enabled or in development by default
    const shouldSeed = process.env.DEMO_SEED
      ? process.env.DEMO_SEED === 'true'
      : (process.env.NODE_ENV !== 'production');
    if (shouldSeed) {
      await seedDemo();
    }
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log('Shutting down...');
      server.close(async () => {
        await pool.end();
        process.exit(0);
      });
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
})();
