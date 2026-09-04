import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ReconProvider } from './contexts/ReconContext';
import { ToastProvider } from './contexts/ToastContext';
import { Overview } from './pages/Overview';
import { Reconciliation } from './pages/Reconciliation';
import { AnomalyIntelligence } from './pages/AnomalyIntelligence';
import { SettlementExplorer } from './pages/SettlementExplorer';
import { Investigation } from './pages/Investigation';
import { ApprovalQueue } from './pages/ApprovalQueue';
import { AuditTrail } from './pages/AuditTrail';
import { Analytics } from './pages/Analytics';
import { DataSources } from './pages/DataSources';
import { Settings } from './pages/Settings';

interface AppProps {
  /** Row and cell density for the financial tables across the product. */
  density?: 'comfortable' | 'compact';
}

export function App({ density = 'comfortable' }: AppProps) {
  return (
    <div data-density={density} className="h-full w-full font-sans text-ink-100 antialiased">
      <ReconProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<AppShell />}>
                <Route path="/" element={<Overview />} />
                <Route path="/reconciliation" element={<Reconciliation />} />
                <Route path="/anomalies" element={<AnomalyIntelligence />} />
                <Route path="/explorer" element={<SettlementExplorer />} />
                <Route path="/investigation/:settlementId" element={<Investigation />} />
                <Route path="/approvals" element={<ApprovalQueue />} />
                <Route path="/audit" element={<AuditTrail />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/sources" element={<DataSources />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </ReconProvider>
    </div>);

}