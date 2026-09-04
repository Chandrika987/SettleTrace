export const anomalyTrend = [
{ date: '17 Aug', fee: 3, timing: 2, missing: 0, refund: 1, chargeback: 1, unknown: 1 },
{ date: '18 Aug', fee: 4, timing: 1, missing: 1, refund: 2, chargeback: 0, unknown: 1 },
{ date: '19 Aug', fee: 2, timing: 3, missing: 0, refund: 1, chargeback: 2, unknown: 0 },
{ date: '20 Aug', fee: 5, timing: 2, missing: 1, refund: 0, chargeback: 2, unknown: 1 },
{ date: '21 Aug', fee: 3, timing: 4, missing: 0, refund: 2, chargeback: 1, unknown: 2 },
{ date: '22 Aug', fee: 2, timing: 1, missing: 0, refund: 1, chargeback: 0, unknown: 1 },
{ date: '23 Aug', fee: 4, timing: 2, missing: 1, refund: 1, chargeback: 1, unknown: 3 },
{ date: '24 Aug', fee: 6, timing: 3, missing: 0, refund: 2, chargeback: 1, unknown: 1 },
{ date: '25 Aug', fee: 3, timing: 5, missing: 1, refund: 1, chargeback: 2, unknown: 1 },
{ date: '26 Aug', fee: 5, timing: 2, missing: 0, refund: 3, chargeback: 1, unknown: 2 },
{ date: '27 Aug', fee: 4, timing: 3, missing: 2, refund: 1, chargeback: 1, unknown: 1 },
{ date: '28 Aug', fee: 7, timing: 2, missing: 1, refund: 2, chargeback: 2, unknown: 2 },
{ date: '29 Aug', fee: 5, timing: 4, missing: 1, refund: 2, chargeback: 1, unknown: 1 },
{ date: '30 Aug', fee: 4, timing: 3, missing: 1, refund: 2, chargeback: 1, unknown: 1 }];


export const settlementHealthSeries = [
{ date: '24 Aug', reconciled: 92.1, anomalous: 4.2, pending: 3.7 },
{ date: '25 Aug', reconciled: 93.4, anomalous: 3.6, pending: 3.0 },
{ date: '26 Aug', reconciled: 91.2, anomalous: 5.1, pending: 3.7 },
{ date: '27 Aug', reconciled: 89.8, anomalous: 6.4, pending: 3.8 },
{ date: '28 Aug', reconciled: 93.9, anomalous: 3.4, pending: 2.7 },
{ date: '29 Aug', reconciled: 94.6, anomalous: 3.1, pending: 2.3 },
{ date: '30 Aug', reconciled: 93.2, anomalous: 4.1, pending: 2.7 }];


export const reconciliationRate = [
{ date: '17 Aug', rate: 96.2, auto: 82.4 },
{ date: '18 Aug', rate: 96.8, auto: 83.9 },
{ date: '19 Aug', rate: 95.4, auto: 81.1 },
{ date: '20 Aug', rate: 97.1, auto: 85.2 },
{ date: '21 Aug', rate: 96.4, auto: 84.6 },
{ date: '22 Aug', rate: 98.0, auto: 88.1 },
{ date: '23 Aug', rate: 95.1, auto: 80.3 },
{ date: '24 Aug', rate: 96.6, auto: 84.0 },
{ date: '25 Aug', rate: 95.9, auto: 82.7 },
{ date: '26 Aug', rate: 97.4, auto: 86.9 },
{ date: '27 Aug', rate: 94.8, auto: 79.4 },
{ date: '28 Aug', rate: 97.0, auto: 86.1 },
{ date: '29 Aug', rate: 97.8, auto: 87.7 },
{ date: '30 Aug', rate: 96.9, auto: 85.4 }];


export const resolutionTime = [
{ bucket: 'Fee variance', ai: 0.4, human: 3.2 },
{ bucket: 'Timing mismatch', ai: 0.6, human: 5.1 },
{ bucket: 'Refund mismatch', ai: 1.1, human: 7.4 },
{ bucket: 'Chargeback', ai: 1.4, human: 9.2 },
{ bucket: 'Duplicate', ai: 0.5, human: 4.0 },
{ bucket: 'Unknown', ai: 0, human: 26.8 }];


export const recoveryImpact = [
{ month: 'Mar', recovered: 412000, written: 68000 },
{ month: 'Apr', recovered: 508000, written: 54000 },
{ month: 'May', recovered: 623000, written: 71000 },
{ month: 'Jun', recovered: 588000, written: 42000 },
{ month: 'Jul', recovered: 741000, written: 38000 },
{ month: 'Aug', recovered: 812000, written: 31000 }];


export const merchantExposure = [
{ merchant: 'HomeKart', exposure: 268750, anomalies: 4 },
{ merchant: 'LoomLane', exposure: 363870, anomalies: 4 },
{ merchant: 'UrbanCart', exposure: 73560, anomalies: 3 },
{ merchant: 'QuickServe', exposure: 45010, anomalies: 3 },
{ merchant: 'TravelNest', exposure: 110800, anomalies: 3 },
{ merchant: 'MediBridge', exposure: 13240, anomalies: 2 },
{ merchant: 'FitFuel', exposure: 6450, anomalies: 1 },
{ merchant: 'EduSphere', exposure: 4710, anomalies: 2 }];


export const analyticsKpis = [
{ label: 'Reconciliation rate', value: '96.9%', delta: '+0.7 pts', tone: 'pos' as const, note: 'vs. previous 14 days' },
{ label: 'Anomaly rate', value: '3.1%', delta: '−0.4 pts', tone: 'pos' as const, note: '412 of 13,204 settlements' },
{ label: 'Avg. resolution time', value: '4.2 hrs', delta: '−1.1 hrs', tone: 'pos' as const, note: 'first detection → journal posted' },
{ label: 'Amount investigated', value: '₹1.42 Cr', delta: '+₹18.4 L', tone: 'neutral' as const, note: 'rolling 30 days' },
{ label: 'Auto-resolved cases', value: '85.4%', delta: '+2.9 pts', tone: 'pos' as const, note: '352 of 412 anomalies' },
{ label: 'False positive rate', value: '2.8%', delta: '−0.6 pts', tone: 'pos' as const, note: '12 human overrides' }];