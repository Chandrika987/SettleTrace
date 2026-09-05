import { Request, Response } from 'express';
import { getMerchants } from '../services/merchantService';

export const listMerchants = async (_req: Request, res: Response): Promise<void> => {
  try {
    res.json({ items: await getMerchants() });
  } catch (error) {
    console.error('Unable to load merchants:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Unable to load merchants',
      },
    });
  }
};
