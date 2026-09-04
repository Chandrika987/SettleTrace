import { lineageChains, STAGE_LABEL, type LineageChain } from '../data/lineage';

export { STAGE_LABEL, type LineageChain };

export async function getLineageChains(): Promise<LineageChain[]> {
  return lineageChains;
}

export async function getLineageById(settlementId: string): Promise<LineageChain | undefined> {
  return lineageChains.find((c) => c.settlementId === settlementId);
}
