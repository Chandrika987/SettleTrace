import app from './app';
import { checkDatabaseConnection } from './config/db';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const PORT = parseInt(process.env.PORT || '4000', 10);

const startServer = async () => {
  console.log('Testing PostgreSQL connection...');
  const isDbConnected = await checkDatabaseConnection();
  if (!isDbConnected) {
    console.error('ERROR: Could not establish database connection. Server startup aborted.');
    process.exit(1);
  }

  console.log('PostgreSQL connection established successfully.');

  app.listen(PORT, () => {
    console.log(`SettleTrace Backend running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
};

startServer().catch((err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
