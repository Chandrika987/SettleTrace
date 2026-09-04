import type { AuditEntry } from '../types';
import { auditTrail as seedAudit } from '../data/audit';

const extraAuditEntries: AuditEntry[] = [];

export async function getAuditEntries(): Promise<AuditEntry[]> {
  return [...extraAuditEntries, ...seedAudit];
}

export function recordAuditEntry(entry: AuditEntry): void {
  extraAuditEntries.unshift(entry);
}
