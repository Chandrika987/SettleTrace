import { Request, Response } from 'express';
import { checkDatabaseConnection } from '../config/db';
import { HealthCheckResponse } from '../types';

export const getHealth = async (_req: Request, res: Response): Promise<void> => {
  const isDbConnected = await checkDatabaseConnection();

  if (isDbConnected) {
    const payload: HealthCheckResponse = {
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(payload);
  } else {
    const payload: HealthCheckResponse = {
      status: 'error',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
    };
    res.status(500).json(payload);
  }
};
