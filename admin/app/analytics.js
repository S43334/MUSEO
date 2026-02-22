import { getAnalytics, refreshAnalyticsViews } from './content.js';

export async function loadAdvancedAnalytics() {
  return getAnalytics();
}

export async function refreshAndLoadAnalytics() {
  await refreshAnalyticsViews();
  return loadAdvancedAnalytics();
}
