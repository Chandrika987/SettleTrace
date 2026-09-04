import type { ApprovalCase } from '../types';
import { approvalCases as seedApprovals } from '../data/approvals';
import { getDecisionFromStore } from './settlementService';

export async function getApprovalCases(): Promise<ApprovalCase[]> {
  return seedApprovals.filter((a) => !getDecisionFromStore(a.settlementId));
}
