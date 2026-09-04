import type { Settlement, SettlementStatus } from '../types';
import { settlements as seedSettlements } from '../data/settlements';

export type Decision = 'approved' | 'investigating' | 'rejected';

const STATUS_BY_DECISION: Record<Decision, SettlementStatus> = {
  approved: 'approved',
  investigating: 'investigating',
  rejected: 'investigating',
};

// In-memory decision store shared across the service layer
const decisionStore: Record<string, Decision> = {};

export async function getSettlements(): Promise<Settlement[]> {
  return seedSettlements.map((s) =>
    decisionStore[s.id]
      ? { ...s, status: STATUS_BY_DECISION[decisionStore[s.id]] }
      : s
  );
}

export async function getSettlementById(id: string): Promise<Settlement | undefined> {
  const all = await getSettlements();
  return all.find((s) => s.id === id);
}

export function setDecisionInStore(id: string, decision: Decision): void {
  decisionStore[id] = decision;
}

export function getDecisionFromStore(id: string): Decision | undefined {
  return decisionStore[id];
}

export function getDecisionStore(): Record<string, Decision> {
  return { ...decisionStore };
}
