import { Request, Response } from 'express';
import { getSettlementDetail, getSettlements } from '../services/settlementService';

const parsePageNumber = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : fallback;
};

const sendError = (res: Response, code: string, message: string, status = 500): void => {
  res.status(status).json({ error: { code, message } });
};

export const listSettlements = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = await getSettlements({
      merchantId: typeof req.query.merchantId === 'string' ? req.query.merchantId : undefined,
      currency: typeof req.query.currency === 'string' ? req.query.currency : undefined,
      status: typeof req.query.status === 'string' ? req.query.status : undefined,
      limit: parsePageNumber(req.query.limit, 100),
      offset: parsePageNumber(req.query.offset, 0),
    });
    res.json(payload);
  } catch (error) {
    console.error('Unable to load settlements:', error);
    sendError(res, 'INTERNAL_ERROR', 'Unable to load settlements');
  }
};

export const settlementDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const detail = await getSettlementDetail(req.params.id);
    if (!detail) {
      sendError(res, 'NOT_FOUND', 'Settlement not found', 404);
      return;
    }
    res.json(detail);
  } catch (error) {
    console.error('Unable to load settlement detail:', error);
    sendError(res, 'INTERNAL_ERROR', 'Unable to load settlement detail');
  }
};
