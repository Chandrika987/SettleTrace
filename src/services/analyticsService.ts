import {
  analyticsKpis,
  anomalyTrend,
  merchantExposure,
  recoveryImpact,
  reconciliationRate,
  resolutionTime,
  settlementHealthSeries,
} from '../data/analytics';

export async function getAnalytics() {
  return {
    analyticsKpis,
    merchantExposure,
    recoveryImpact,
    reconciliationRate,
    resolutionTime,
    anomalyTrend,
    settlementHealthSeries,
  };
}

export async function getAnalyticsData() {
  return {
    analyticsKpis,
    merchantExposure,
    recoveryImpact,
    reconciliationRate,
    resolutionTime,
  };
}

export {
  analyticsKpis,
  anomalyTrend,
  merchantExposure,
  recoveryImpact,
  reconciliationRate,
  resolutionTime,
  settlementHealthSeries,
};
