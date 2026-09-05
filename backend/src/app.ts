import express, { Express } from 'express';
import cors from 'cors';
import healthRoutes from './routes/health.routes';
import reconciliationRoutes from './routes/reconciliation.routes';
import settlementRoutes from './routes/settlement.routes';
import merchantRoutes from './routes/merchant.routes';
import { notFoundHandler, errorHandler } from './middleware/error.middleware';

const app: Express = express();
const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Request logging middleware
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/', healthRoutes);
app.use('/api/reconciliation', reconciliationRoutes);
app.use('/api/settlements', settlementRoutes);
app.use('/api/merchants', merchantRoutes);

// Fallback handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
