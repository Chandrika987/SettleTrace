import { Router } from 'express';
import { listSettlements, settlementDetail } from '../controllers/settlement.controller';

const router = Router();

router.get('/', listSettlements);
router.get('/:id', settlementDetail);

export default router;
