import { Request, Response } from 'express';
import {
  getReconciliationCaseDetail,
  getReconciliationCases,
  getReconciliationSummary,
  ReconciliationStatus,
} from '../services/reconciliationService';

const STATUSES: ReconciliationStatus[] = ['MATCHED', 'VARIANCE', 'PARTIAL', 'MISSING', 'DUPLICATE'];

const parsePageNumber = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : fallback;
};

const sendError = (res: Response, code: string, message: string, status = 500): void => {
  res.status(status).json({ error: { code, message } });
};

export const listReconciliationCases = async (req: Request, res: Response): Promise<void> => {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status.toUpperCase() : undefined;
    if (status && !STATUSES.includes(status as ReconciliationStatus)) {
      sendError(res, 'INVALID_STATUS', 'Unsupported reconciliation status filter', 400);
      return;
    }

    const payload = await getReconciliationCases({
      status: status as ReconciliationStatus | undefined,
      merchantId: typeof req.query.merchantId === 'string' ? req.query.merchantId : undefined,
      currency: typeof req.query.currency === 'string' ? req.query.currency : undefined,
      limit: parsePageNumber(req.query.limit, 100),
      offset: parsePageNumber(req.query.offset, 0),
    });
    res.json(payload);
  } catch (error) {
    console.error('Unable to load reconciliation cases:', error);
    sendError(res, 'INTERNAL_ERROR', 'Unable to load reconciliation cases');
  }
};

export const reconciliationSummary = async (_req: Request, res: Response): Promise<void> => {
  try {
    res.json(await getReconciliationSummary());
  } catch (error) {
    console.error('Unable to load reconciliation summary:', error);
    sendError(res, 'INTERNAL_ERROR', 'Unable to load reconciliation summary');
  }
};

export const reconciliationDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const detail = await getReconciliationCaseDetail(req.params.caseId);
    if (!detail) {
      sendError(res, 'NOT_FOUND', 'Reconciliation case not found', 404);
      return;
    }
    res.json(detail);
  } catch (error) {
    console.error('Unable to load reconciliation case detail:', error);
    sendError(res, 'INTERNAL_ERROR', 'Unable to load reconciliation case detail');
  }
};
