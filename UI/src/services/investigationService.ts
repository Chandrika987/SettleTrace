import type { Investigation } from '../types';
import { getInvestigation as fetchInvestigation } from '../data/investigations';

export async function getInvestigation(settlementId: string): Promise<Investigation | undefined> {
  return fetchInvestigation(settlementId);
}

export function getInvestigationSync(settlementId: string): Investigation | undefined {
  return fetchInvestigation(settlementId);
}
