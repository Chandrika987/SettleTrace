import type { Investigation, Settlement } from '../types';
import { CATEGORY_LABEL } from './taxonomy';
import { formatINR } from '../utils/format';
import { settlements } from './settlements';

const authored: Record<string, Investigation> = {
  SET_104821: {
    settlementId: 'SET_104821',
    finding: 'Unexpected settlement variance of ₹3,730 against expected payout.',
    probableCause: 'Gateway fee adjustment applied post-capture.',
    categoryLabel: 'Fee variance',
    evidence: [
    { label: 'Historical fee range (90d)', value: '2.0% – 2.3%', weight: 'strong' },
    { label: 'Observed effective fee', value: '4.5% on ₹4,82,430', weight: 'strong' },
    { label: 'Fee delta reconciles to variance', value: '₹3,730 — exact match', weight: 'strong' },
    {
      label: 'Precedent',
      value: 'Similar adjustment occurred twice in the previous 90 days',
      weight: 'supporting'
    },
    { label: 'Processor advice note', value: 'RZP-ADJ-88214 — "fee correction"', weight: 'supporting' },
    { label: 'Txn volume unchanged', value: '1,842 captures, 0 missing', weight: 'contextual' }],

    confidence: 94,
    impact: 3730,
    recommendedAction: 'Book gateway fee adjustment.',
    whyItMatters: 'This discrepancy appears isolated rather than systemic.',
    systemic: false,
    events: [
    {
      id: 'e1',
      time: '10:31 AM',
      day: '30 Aug 2026',
      label: 'Payment captured',
      amount: 486160,
      detail: '1,842 transactions captured by Razorpay for UrbanCart',
      source: 'processor'
    },
    {
      id: 'e2',
      time: '10:33 AM',
      day: '30 Aug 2026',
      label: 'Refund processed',
      amount: -3730,
      detail: 'Refund batch RFD_88104 — 11 orders reversed',
      source: 'processor',
      tone: 'neutral'
    },
    {
      id: 'e3',
      time: '11:02 AM',
      day: '30 Aug 2026',
      label: 'Settlement generated',
      amount: 482430,
      detail: 'Batch BAT_2026_08_30_A prepared with expected payout',
      source: 'system'
    },
    {
      id: 'e4',
      time: '11:07 AM',
      day: '30 Aug 2026',
      label: 'Fee adjustment applied',
      amount: -3730,
      detail: 'Advice RZP-ADJ-88214 — effective fee rose 2.2% → 4.5%',
      source: 'processor',
      tone: 'warn'
    },
    {
      id: 'e5',
      time: '06:14 AM',
      day: '31 Aug 2026',
      label: 'Bank credit received',
      amount: 478700,
      detail: 'UTR HDFCN26243891104 credited to HDFC ••4471',
      source: 'bank',
      tone: 'crit'
    }],

    proposal: [
    { line: 'Debit', account: 'Gateway Fee Expense · 5210', debit: 3730 },
    { line: 'Credit', account: 'Settlement Clearing Account · 1140', credit: 3730 }],

    alternates: [
    { cause: 'Undisclosed refund netting', confidence: 4 },
    { cause: 'Partial settlement / timing', confidence: 2 }]

  },
  SET_104818: {
    settlementId: 'SET_104818',
    finding: 'Settlement of ₹84,200 expected but not credited to the nodal account.',
    probableCause: 'Settlement timing mismatch across the processor cut-off.',
    categoryLabel: 'Timing mismatch',
    evidence: [
    { label: 'Capture confirmations', value: '214 of 214 present at processor', weight: 'strong' },
    { label: 'Processor payout status', value: 'queued — no UTR issued', weight: 'strong' },
    { label: 'Cut-off window', value: 'Captures landed 23 min after 22:00 IST cut-off', weight: 'strong' },
    { label: 'Precedent', value: '9 of 11 similar cases cleared on T+1', weight: 'supporting' },
    { label: 'Bank statement scan', value: 'No matching credit in ICICI ••8802', weight: 'contextual' }],

    confidence: 88,
    impact: 84200,
    recommendedAction: 'Hold for T+1 bank credit; re-verify at 09:00 IST.',
    whyItMatters:
    'The money is identified and traceable at the processor — this is a delay, not a loss.',
    systemic: false,
    events: [
    {
      id: 'e1',
      time: '09:44 PM',
      day: '29 Aug 2026',
      label: 'Payments captured',
      amount: 86010,
      detail: '214 transactions captured for TravelNest',
      source: 'processor'
    },
    {
      id: 'e2',
      time: '10:23 PM',
      day: '29 Aug 2026',
      label: 'Cut-off missed',
      detail: 'Captures posted after the 22:00 IST settlement cut-off',
      source: 'system',
      tone: 'warn'
    },
    {
      id: 'e3',
      time: '11:02 AM',
      day: '30 Aug 2026',
      label: 'Settlement generated',
      amount: 84200,
      detail: 'Expected payout computed, queued for release',
      source: 'system'
    },
    {
      id: 'e4',
      time: 'Pending',
      day: '31 Aug 2026',
      label: 'Bank credit not received',
      amount: 0,
      detail: 'No UTR assigned; nodal account shows no credit',
      source: 'bank',
      tone: 'crit'
    }],

    proposal: [
    { line: 'Debit', account: 'Settlement Receivable · 1180', debit: 84200 },
    { line: 'Credit', account: 'Settlement Clearing Account · 1140', credit: 84200 }],

    alternates: [
    { cause: 'Processor payout failure', confidence: 8 },
    { cause: 'Bank reference mismatch', confidence: 4 }]

  },
  SET_104809: {
    settlementId: 'SET_104809',
    finding: 'Unexplained shortfall of ₹2,48,000 with no matching processor advice.',
    probableCause: 'Insufficient evidence to attribute a cause.',
    categoryLabel: 'Unknown variance',
    evidence: [
    { label: 'Fee model check', value: 'Effective fee 2.0% — within range', weight: 'strong' },
    { label: 'Refund / chargeback scan', value: 'No offsetting events found', weight: 'strong' },
    { label: 'Txn reconciliation', value: '2,960 captures matched, 0 missing', weight: 'supporting' },
    { label: 'Bank credit', value: 'Single credit, UTR KKBKN26243880554', weight: 'supporting' },
    { label: 'Processor advice', value: 'None received for this batch', weight: 'contextual' }],

    confidence: 63,
    impact: 248000,
    recommendedAction: 'Manual investigation required — escalate to processor support.',
    whyItMatters:
    'Confidence is below the 75% auto-proposal threshold and the amount exceeds the ₹1,00,000 dual-approval limit.',
    systemic: true,
    events: [
    {
      id: 'e1',
      time: '08:12 AM',
      day: '30 Aug 2026',
      label: 'Payments captured',
      amount: 2546000,
      detail: '2,960 transactions captured for HomeKart via PayU',
      source: 'processor'
    },
    {
      id: 'e2',
      time: '11:04 AM',
      day: '30 Aug 2026',
      label: 'Settlement generated',
      amount: 2496000,
      detail: 'Batch BAT_2026_08_30_B, fee 2.0% applied',
      source: 'system'
    },
    {
      id: 'e3',
      time: '02:41 PM',
      day: '30 Aug 2026',
      label: 'Bank credit received',
      amount: 2248000,
      detail: 'Credit ₹2,48,000 short of expected payout — no advice attached',
      source: 'bank',
      tone: 'crit'
    },
    {
      id: 'e4',
      time: '02:46 PM',
      day: '30 Aug 2026',
      label: 'Escalated to human review',
      detail: 'Confidence 63% below auto-proposal threshold',
      source: 'system',
      tone: 'warn'
    }],

    proposal: [
    { line: 'Debit', account: 'Suspense — Unreconciled · 1990', debit: 248000 },
    { line: 'Credit', account: 'Settlement Clearing Account · 1140', credit: 248000 }],

    alternates: [
    { cause: 'Withheld reserve / rolling hold', confidence: 19 },
    { cause: 'Undisclosed chargeback block', confidence: 11 },
    { cause: 'Partial settlement split across batches', confidence: 7 }]

  }
};

const CAUSE_BY_CATEGORY: Record<string, string> = {
  fee_variance: 'Gateway fee adjustment applied post-capture.',
  timing_mismatch: 'Settlement timing mismatch across the processor cut-off.',
  missing_settlement: 'Settlement generated but never released by the processor.',
  duplicate_transaction: 'Duplicate capture settled twice in the same batch.',
  refund_mismatch: 'Refund netted at the bank but not in the settlement file.',
  chargeback_mismatch: 'Chargeback debit withheld from the settlement payout.',
  currency_variance: 'Cross-currency conversion applied at a different reference rate.',
  unknown: 'Insufficient evidence to attribute a cause.'
};

function derive(s: Settlement): Investigation {
  const impact = Math.abs(s.variance);
  return {
    settlementId: s.id,
    finding: `${s.variance < 0 ? 'Shortfall' : 'Excess credit'} of ${formatINR(impact)} against expected payout.`,
    probableCause: CAUSE_BY_CATEGORY[s.category] ?? CAUSE_BY_CATEGORY.unknown,
    categoryLabel: CATEGORY_LABEL[s.category],
    evidence: [
    { label: 'Observed effective fee', value: `${s.feePct.toFixed(1)}% on ${formatINR(s.expected)}`, weight: 'strong' },
    { label: 'Transactions matched', value: `${s.txnCount.toLocaleString('en-IN')} captures reconciled`, weight: 'strong' },
    { label: 'Bank reference', value: s.utr === '—' ? 'No UTR issued' : s.utr, weight: 'supporting' },
    { label: 'Batch', value: s.batch, weight: 'contextual' }],

    confidence: s.confidence,
    impact,
    recommendedAction:
    s.confidence >= 75 ?
    `Book ${CATEGORY_LABEL[s.category].toLowerCase()} adjustment.` :
    'Manual investigation required.',
    whyItMatters:
    s.confidence >= 75 ?
    'This discrepancy appears isolated rather than systemic.' :
    'Confidence sits below the auto-proposal threshold — a human must attribute the cause.',
    systemic: s.confidence < 75,
    events: [
    {
      id: 'e1',
      time: '09:18 AM',
      day: 'Settlement day',
      label: 'Payments captured',
      amount: s.expected + Math.round(s.expected * 0.01),
      detail: `${s.txnCount.toLocaleString('en-IN')} transactions captured for ${s.merchant}`,
      source: 'processor'
    },
    {
      id: 'e2',
      time: '11:02 AM',
      day: 'Settlement day',
      label: 'Settlement generated',
      amount: s.expected,
      detail: `${s.batch} prepared at ${s.feePct.toFixed(1)}% effective fee`,
      source: 'system'
    },
    {
      id: 'e3',
      time: '06:14 AM',
      day: 'Next day',
      label: s.received === 0 ? 'Bank credit not received' : 'Bank credit received',
      amount: s.received,
      detail: s.received === 0 ? 'No credit traced in bank statement' : `Credited to ${s.bankAccount}`,
      source: 'bank',
      tone: s.variance === 0 ? 'pos' : 'crit'
    }],

    proposal: [
    {
      line: 'Debit',
      account:
      s.confidence >= 75 ?
      `${CATEGORY_LABEL[s.category]} · 52${s.id.slice(-2)}` :
      'Suspense — Unreconciled · 1990',
      debit: impact
    },
    { line: 'Credit', account: 'Settlement Clearing Account · 1140', credit: impact }],

    alternates: [
    { cause: 'Timing / cut-off effect', confidence: Math.max(2, Math.round((100 - s.confidence) * 0.5)) },
    { cause: 'Undisclosed netting', confidence: Math.max(1, Math.round((100 - s.confidence) * 0.3)) }]

  };
}

export function getInvestigation(settlementId: string): Investigation | undefined {
  if (authored[settlementId]) return authored[settlementId];
  const s = settlements.find((x) => x.id === settlementId);
  return s ? derive(s) : undefined;
}