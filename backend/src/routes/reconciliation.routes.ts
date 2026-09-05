import { Router } from 'express';
import {
  listReconciliationCases,
  reconciliationDetail,
  reconciliationSummary,
} from '../controllers/reconciliation.controller';

const router = Router();

router.get('/', listReconciliationCases);
router.get('/summary', reconciliationSummary);
router.get('/:caseId', reconciliationDetail);

export default router;
