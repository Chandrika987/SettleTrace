import { Router } from 'express';
import { listMerchants } from '../controllers/merchant.controller';

const router = Router();

router.get('/', listMerchants);

export default router;
