import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { PageHeader } from '../components/ui/PageHeader';
import { Panel, PanelHeader } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { Tag } from '../components/ui/StatusBadge';
import {
  NumberField,
  SelectField,
  SettingRow,
  Slider,
  Toggle } from
'../components/settings/Controls';
import { getMerchants } from '../services/merchantService';
import type { Merchant } from '../types';
import { useToast } from '../contexts/ToastContext';

const SECTIONS = [
  { id: 'rules', label: 'Reconciliation rules' },
  { id: 'thresholds', label: 'Anomaly thresholds' },
  { id: 'approvals', label: 'Approval thresholds' },
  { id: 'merchants', label: 'Merchant configuration' },
  { id: 'confidence', label: 'AI confidence' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'roles', label: 'User roles' }
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];

export function Settings() {
  const [section, setSection] = useState<SectionId>('rules');
  const { notify } = useToast();

  return (
    <div>
      <PageHeader
        eyebrow="Settings"
        title="Controls & policy"
        subtitle="Thresholds decide what the engine may propose on its own — and what always needs a person."
        right={
        <Button
          variant="primary"
          onClick={() =>
          notify({
            title: 'Policy changes saved',
            detail: 'Threshold updates are versioned and written to the audit trail.'
          })
          }>
          
            Save changes
          </Button>
        } />
      

      <div className="grid grid-cols-1 gap-4 px-5 py-5 lg:px-7 lg:py-6 xl:grid-cols-[minmax(0,240px)_minmax(0,1fr)]">
        <Panel className="h-fit">
          <nav aria-label="Settings sections">
            <ul className="divide-y divide-hairline">
              {SECTIONS.map((s) =>
              <li key={s.id}>
                  <button
                  type="button"
                  onClick={() => setSection(s.id)}
                  aria-current={section === s.id}
                  className={twMerge(
                    'w-full px-4 py-2.5 text-left text-[13px] transition-colors duration-150 ease-out hover:bg-canvas',
                    section === s.id ?
                    'border-l-2 border-accent bg-accent-soft pl-[14px] font-medium text-accent-600' :
                    'text-ink-600'
                  )}>
                  
                    {s.label}
                  </button>
                </li>
              )}
            </ul>
          </nav>
        </Panel>

        <div className="space-y-4">
          {section === 'rules' ? <RulesSection /> : null}
          {section === 'thresholds' ? <ThresholdsSection /> : null}
          {section === 'approvals' ? <ApprovalsSection /> : null}
          {section === 'merchants' ? <MerchantsSection /> : null}
          {section === 'confidence' ? <ConfidenceSection /> : null}
          {section === 'notifications' ? <NotificationsSection /> : null}
          {section === 'roles' ? <RolesSection /> : null}
        </div>
      </div>
    </div>);

}

function RulesSection() {
  const [rules, setRules] = useState([
  { id: 'exact', label: 'Exact UTR match', hint: 'Match settlement to bank credit on UTR and amount.', on: true, mode: 'Blocking' },
  { id: 'amount', label: 'Amount + date window match', hint: 'Fallback match within a ±1 day window when no UTR is present.', on: true, mode: 'Advisory' },
  { id: 'fee', label: 'Fee band validation', hint: 'Compare effective fee against the contracted band per merchant.', on: true, mode: 'Blocking' },
  { id: 'refund', label: 'Refund netting reconciliation', hint: 'Reconcile refunds netted at the processor against ledger reversals.', on: true, mode: 'Advisory' },
  { id: 'dup', label: 'Duplicate capture detection', hint: 'Flag captures settled more than once inside a batch.', on: true, mode: 'Blocking' },
  { id: 'fx', label: 'FX reference rate check', hint: 'Validate conversion against the RBI reference rate for the settlement date.', on: false, mode: 'Advisory' }]
  );

  return (
    <Panel>
      <PanelHeader
        eyebrow="Reconciliation rules"
        title="Matching logic, in priority order"
        subtitle="Blocking rules stop a settlement from auto-closing. Advisory rules annotate it." />
      
      <div>
        {rules.map((r) =>
        <SettingRow key={r.id} label={r.label} hint={r.hint}>
            <SelectField
            label={`${r.label} mode`}
            value={r.mode}
            options={['Blocking', 'Advisory']}
            onChange={(mode) =>
            setRules((prev) => prev.map((x) => x.id === r.id ? { ...x, mode } : x))
            } />
          
            <Toggle
            label={`Enable ${r.label}`}
            checked={r.on}
            onChange={(on) => setRules((prev) => prev.map((x) => x.id === r.id ? { ...x, on } : x))} />
          
          </SettingRow>
        )}
      </div>
    </Panel>);

}

function ThresholdsSection() {
  const [tolerance, setTolerance] = useState('0.18');
  const [minVariance, setMinVariance] = useState('500');
  const [timingDays, setTimingDays] = useState('1');
  const [feeCeiling, setFeeCeiling] = useState('2.4');

  return (
    <Panel>
      <PanelHeader
        eyebrow="Anomaly thresholds"
        title="When a difference becomes an anomaly"
        subtitle="Tighter thresholds catch more, but raise review volume. Current settings flag ~3.1% of settlements." />
      
      <div>
        <SettingRow
          label="Variance tolerance"
          hint="Percentage of settlement value treated as acceptable rounding.">
          
          <NumberField label="Variance tolerance" value={tolerance} onChange={setTolerance} suffix="%" />
        </SettingRow>
        <SettingRow label="Minimum variance to raise a case" hint="Absolute floor, regardless of percentage.">
          <NumberField label="Minimum variance" value={minVariance} onChange={setMinVariance} prefix="₹" />
        </SettingRow>
        <SettingRow
          label="Settlement timing window"
          hint="Days a credit may lag before it is treated as missing rather than delayed.">
          
          <NumberField label="Timing window" value={timingDays} onChange={setTimingDays} suffix="days" />
        </SettingRow>
        <SettingRow
          label="Fee ceiling before escalation"
          hint="Effective fee above this is escalated as a fee variance anomaly.">
          
          <NumberField label="Fee ceiling" value={feeCeiling} onChange={setFeeCeiling} suffix="%" />
        </SettingRow>
      </div>
    </Panel>);

}

function ApprovalsSection() {
  const [single, setSingle] = useState('1,00,000');
  const [dual, setDual] = useState('5,00,000');
  const [auto, setAuto] = useState('5,000');
  const [sla, setSla] = useState('24');

  return (
    <Panel>
      <PanelHeader
        eyebrow="Approval thresholds"
        title="Who may authorise what"
        subtitle="Amount bands decide how many humans must sign a reconciliation entry." />
      
      <div>
        <SettingRow label="Auto-approve below" hint="Entries under this value post without human review when confidence ≥ 95%.">
          <NumberField label="Auto-approve limit" value={auto} onChange={setAuto} prefix="₹" />
        </SettingRow>
        <SettingRow label="Single approver limit" hint="A Controller may authorise up to this amount alone.">
          <NumberField label="Single approver limit" value={single} onChange={setSingle} prefix="₹" />
        </SettingRow>
        <SettingRow label="Dual approval required above" hint="Requires Controller plus Head of Finance.">
          <NumberField label="Dual approval limit" value={dual} onChange={setDual} prefix="₹" />
        </SettingRow>
        <SettingRow label="Authorisation SLA" hint="Hours before an open approval is marked as breached.">
          <NumberField label="Authorisation SLA" value={sla} onChange={setSla} suffix="hrs" />
        </SettingRow>
      </div>
      <div className="border-t border-line bg-canvas px-4 py-3 text-xs leading-5 text-ink-500">
        Regardless of these limits, no entry above ₹5,00,000 can be posted by the engine alone. This
        is enforced in policy and cannot be disabled from the interface.
      </div>
    </Panel>);

}

function MerchantsSection() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);

  useEffect(() => {
    getMerchants().then(setMerchants);
  }, []);

  return (
    <Panel>
      <PanelHeader
        eyebrow="Merchant configuration"
        title="Per-merchant fee bands and cycles"
        subtitle="Contracted terms the engine validates every settlement against." />
      
      <div className="rr-scroll overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-line bg-canvas/70">
              {['Merchant', 'ID', 'Category', 'Fee band', 'Settlement cycle', 'Tolerance'].map((h) =>
              <th
                key={h}
                scope="col"
                className="whitespace-nowrap px-4 py-2 text-left font-mono text-2xs font-medium uppercase tracking-label text-ink-400">
                
                  {h}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {merchants.map((m, i) =>
            <tr key={m.id} className="border-b border-hairline hover:bg-canvas/60">
                <td className="rr-cell px-4 text-ink-900">{m.name}</td>
                <td className="rr-cell tnum px-4 font-mono text-xs text-ink-500">{m.id}</td>
                <td className="rr-cell px-4 text-xs text-ink-600">{m.category}</td>
                <td className="rr-cell tnum px-4 font-mono text-xs text-ink-800">
                  {[2.0, 2.1, 2.2, 2.3][i % 4].toFixed(1)}% – {[2.3, 2.4, 2.5, 2.6][i % 4].toFixed(1)}%
                </td>
                <td className="rr-cell px-4 text-xs text-ink-600">{i % 3 === 0 ? 'T+1' : i % 3 === 1 ? 'T+2' : 'Weekly, Fri'}</td>
                <td className="rr-cell tnum px-4 font-mono text-xs text-ink-800">
                  {[0.15, 0.18, 0.2, 0.25][i % 4].toFixed(2)}%
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>);

}

function ConfidenceSection() {
  const [autoPropose, setAutoPropose] = useState(75);
  const [autoResolve, setAutoResolve] = useState(95);
  const [escalate, setEscalate] = useState(60);

  return (
    <Panel>
      <PanelHeader
        eyebrow="AI confidence thresholds"
        title="What the engine may claim"
        subtitle="Confidence bands govern whether the engine drafts an entry, asks for review, or refuses to attribute a cause." />
      
      <div>
        <SettingRow label="Draft a reconciliation entry at or above" hint="Below this, the engine states a finding but proposes nothing.">
          <Slider label="Auto-propose threshold" value={autoPropose} min={50} max={95} onChange={setAutoPropose} />
        </SettingRow>
        <SettingRow label="Post without human review at or above" hint="Applies only under the auto-approve amount limit.">
          <Slider label="Auto-resolve threshold" value={autoResolve} min={80} max={99} onChange={setAutoResolve} />
        </SettingRow>
        <SettingRow label="Escalate to a named investigator below" hint="Cases the engine cannot attribute are assigned to a human owner.">
          <Slider label="Escalation threshold" value={escalate} min={40} max={75} onChange={setEscalate} />
        </SettingRow>
      </div>
      <div className="border-t border-line bg-canvas px-4 py-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-ink-600">
          <Tag tone="accent" mono>
            Current effect
          </Tag>
          At these thresholds, {autoResolve >= 95 ? '85.4%' : '91.2%'} of anomalies close without a
          human, and {escalate <= 60 ? '3' : '6'} cases per day are escalated for manual attribution.
        </div>
      </div>
    </Panel>);

}

function NotificationsSection() {
  const [prefs, setPrefs] = useState([
  { id: 'critical', label: 'Critical anomaly detected', hint: 'Variance above ₹1,00,000 or unattributed cause.', email: true, slack: true },
  { id: 'sla', label: 'Approval SLA breach', hint: 'A case has been awaiting authorisation for 24 hours.', email: true, slack: true },
  { id: 'missing', label: 'Missing settlement', hint: 'Expected payout with no bank credit traced.', email: true, slack: false },
  { id: 'digest', label: 'Daily control digest', hint: 'Position, exposure and open items at 09:00 IST.', email: true, slack: false },
  { id: 'source', label: 'Source degraded', hint: 'A connector fails or falls behind its cadence.', email: false, slack: true }]
  );

  return (
    <Panel>
      <PanelHeader
        eyebrow="Notifications"
        title="What reaches you, and where"
        subtitle="Financial alerts only. SettleTrace never notifies on routine successful matches." />
      
      <div>
        {prefs.map((p) =>
        <SettingRow key={p.id} label={p.label} hint={p.hint}>
            <div className="flex items-center gap-2">
              <span className="font-mono text-2xs uppercase tracking-label text-ink-400">Email</span>
              <Toggle
              label={`${p.label} email`}
              checked={p.email}
              onChange={(email) =>
              setPrefs((prev) => prev.map((x) => x.id === p.id ? { ...x, email } : x))
              } />
            
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-2xs uppercase tracking-label text-ink-400">Slack</span>
              <Toggle
              label={`${p.label} slack`}
              checked={p.slack}
              onChange={(slack) =>
              setPrefs((prev) => prev.map((x) => x.id === p.id ? { ...x, slack } : x))
              } />
            
            </div>
          </SettingRow>
        )}
      </div>
    </Panel>);

}

function RolesSection() {
  const users = [
  { name: 'Anusha Rangan', email: 'anusha.rangan@finops.in', role: 'Controller', limit: '₹1,00,000', mfa: true },
  { name: 'Rohit Bansal', email: 'rohit.bansal@finops.in', role: 'Reconciliation analyst', limit: '₹25,000', mfa: true },
  { name: 'Meera Iyer', email: 'meera.iyer@finops.in', role: 'Investigator', limit: 'No approval rights', mfa: true },
  { name: 'Karthik Menon', email: 'karthik.menon@finops.in', role: 'Head of Finance', limit: '₹25,00,000', mfa: true },
  { name: 'Divya Suresh', email: 'divya.suresh@finops.in', role: 'Auditor (read-only)', limit: 'No approval rights', mfa: false }];


  return (
    <Panel>
      <PanelHeader
        eyebrow="User roles"
        title="Who can see and authorise"
        subtitle="Approval rights are role-bound. Auditors have permanent read access and cannot be removed by an admin." />
      
      <div className="rr-scroll overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-line bg-canvas/70">
              {['User', 'Role', 'Approval limit', 'MFA', 'Status'].map((h) =>
              <th
                key={h}
                scope="col"
                className="whitespace-nowrap px-4 py-2 text-left font-mono text-2xs font-medium uppercase tracking-label text-ink-400">
                
                  {h}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {users.map((u) =>
            <tr key={u.email} className="border-b border-hairline hover:bg-canvas/60">
                <td className="rr-cell px-4">
                  <div className="text-ink-900">{u.name}</div>
                  <div className="font-mono text-2xs text-ink-400">{u.email}</div>
                </td>
                <td className="rr-cell px-4 text-xs text-ink-700">{u.role}</td>
                <td className="rr-cell tnum px-4 font-mono text-xs text-ink-800">{u.limit}</td>
                <td className="rr-cell px-4">
                  <Tag tone={u.mfa ? 'pos' : 'warn'} mono>
                    {u.mfa ? 'Enforced' : 'Pending'}
                  </Tag>
                </td>
                <td className="rr-cell px-4">
                  <Tag tone="neutral" dot>
                    Active
                  </Tag>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>);

}
