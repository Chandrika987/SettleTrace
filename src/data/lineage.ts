import type { LineageNode } from '../types';

export interface LineageChain {
  settlementId: string;
  merchant: string;
  nodes: LineageNode[];
  breakAt?: LineageNode['stage'];
  note: string;
}

export const lineageChains: LineageChain[] = [
{
  settlementId: 'SET_104821',
  merchant: 'UrbanCart',
  breakAt: 'bank',
  note: 'Bank credit is ₹3,730 below the generated settlement — fee adjustment applied after batch creation.',
  nodes: [
  { id: 'MRC_2201', stage: 'merchant', label: 'UrbanCart', sub: 'MRC_2201 · Marketplace', amount: 486160, status: 'ok' },
  { id: 'PAY_88104', stage: 'payment', label: 'Capture window', sub: '1,842 payments · 30 Aug', amount: 486160, status: 'ok' },
  { id: 'TXN_5510428', stage: 'transaction', label: 'Net of refunds', sub: '11 refunds · RFD_88104', amount: 482430, status: 'ok' },
  { id: 'SET_104821', stage: 'settlement', label: 'SET_104821', sub: 'BAT_2026_08_30_A · Razorpay', amount: 482430, status: 'variance' },
  { id: 'BNK_4471', stage: 'bank', label: 'HDFC ••4471', sub: 'UTR HDFCN26243891104', amount: 478700, status: 'variance' },
  { id: 'JRN_44120', stage: 'ledger', label: 'Journal pending', sub: 'Awaiting approval', amount: 478700, status: 'variance' }]

},
{
  settlementId: 'SET_104818',
  merchant: 'TravelNest',
  breakAt: 'bank',
  note: 'Settlement generated but no bank credit traced — payout still queued at the processor.',
  nodes: [
  { id: 'MRC_2214', stage: 'merchant', label: 'TravelNest', sub: 'MRC_2214 · Travel', amount: 86010, status: 'ok' },
  { id: 'PAY_88097', stage: 'payment', label: 'Capture window', sub: '214 payments · 29 Aug', amount: 86010, status: 'ok' },
  { id: 'TXN_5510301', stage: 'transaction', label: 'Net of fees', sub: 'Fee 2.1% · ₹1,810', amount: 84200, status: 'ok' },
  { id: 'SET_104818', stage: 'settlement', label: 'SET_104818', sub: 'BAT_2026_08_30_A · queued', amount: 84200, status: 'variance' },
  { id: 'BNK_8802', stage: 'bank', label: 'ICICI ••8802', sub: 'No UTR issued', amount: 0, status: 'missing' },
  { id: 'JRN_NA', stage: 'ledger', label: 'Not posted', sub: 'Blocked on bank credit', amount: 0, status: 'missing' }]

},
{
  settlementId: 'SET_104809',
  merchant: 'HomeKart',
  breakAt: 'bank',
  note: 'Bank credit ₹2,48,000 short with no processor advice attached — cause unattributed.',
  nodes: [
  { id: 'MRC_2231', stage: 'merchant', label: 'HomeKart', sub: 'MRC_2231 · Home', amount: 2546000, status: 'ok' },
  { id: 'PAY_88088', stage: 'payment', label: 'Capture window', sub: '2,960 payments · 30 Aug', amount: 2546000, status: 'ok' },
  { id: 'TXN_5510188', stage: 'transaction', label: 'Net of fees', sub: 'Fee 2.0% · ₹50,000', amount: 2496000, status: 'ok' },
  { id: 'SET_104809', stage: 'settlement', label: 'SET_104809', sub: 'BAT_2026_08_30_B · PayU', amount: 2496000, status: 'variance' },
  { id: 'BNK_6634', stage: 'bank', label: 'Kotak ••6634', sub: 'UTR KKBKN26243880554', amount: 2248000, status: 'variance' },
  { id: 'JRN_SUS', stage: 'ledger', label: 'Suspense 1990', sub: 'Held pending investigation', amount: 2248000, status: 'variance' }]

},
{
  settlementId: 'SET_104804',
  merchant: 'MediBridge',
  note: 'Clean chain — expected, credited and posted amounts agree to the rupee.',
  nodes: [
  { id: 'MRC_2208', stage: 'merchant', label: 'MediBridge', sub: 'MRC_2208 · Healthcare', amount: 753980, status: 'ok' },
  { id: 'PAY_88075', stage: 'payment', label: 'Capture window', sub: '1,204 payments · 30 Aug', amount: 753980, status: 'ok' },
  { id: 'TXN_5510044', stage: 'transaction', label: 'Net of fees', sub: 'Fee 2.1% · ₹15,830', amount: 738150, status: 'ok' },
  { id: 'SET_104804', stage: 'settlement', label: 'SET_104804', sub: 'BAT_2026_08_30_A · Razorpay', amount: 738150, status: 'ok' },
  { id: 'BNK_4471b', stage: 'bank', label: 'HDFC ••4471', sub: 'UTR HDFCN26243874210', amount: 738150, status: 'ok' },
  { id: 'JRN_44108', stage: 'ledger', label: 'Journal JRN_44108', sub: 'Posted 30 Aug 12:04', amount: 738150, status: 'ok' }]

}];


export const STAGE_LABEL: Record<LineageNode['stage'], string> = {
  merchant: 'Merchant',
  payment: 'Payment',
  transaction: 'Transaction',
  settlement: 'Settlement',
  bank: 'Bank credit',
  ledger: 'Ledger entry'
};