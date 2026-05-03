import { apiRequest } from './http'
import type { AnalyticsKpis, DashboardAnalytics } from '../types/api'

/**
 * Interface pour les filtres analytiques.
 */
interface AnalyticsParams {
  start_date?: string;
  end_date?: string;
  segment?: string;
}

/**
 * Récupère les indicateurs clés (KPIs) de performance filtrés.
 * Correspond à : path('kpis/', KPIStatsView.as_view())
 */
export function getKpis(params: AnalyticsParams = {}) {
  const query = new URLSearchParams();
  
  if (params.start_date) query.append('start_date', params.start_date);
  if (params.end_date) query.append('end_date', params.end_date);
  if (params.segment && params.segment !== 'all') query.append('segment', params.segment);

  const queryString = query.toString();
  const url = `/analytics/kpis/${queryString ? `?${queryString}` : ''}`;
  
  return apiRequest<AnalyticsKpis>(url, { auth: true });
}

/**
 * Récupère les données de distribution (villes, tendances, campagnes).
 * Correspond à : path('dashboard/', GlobalDashboardView.as_view())
 */
export function getDashboardAnalytics(params: AnalyticsParams = {}) {
  const query = new URLSearchParams();
  
  if (params.start_date) query.append('start_date', params.start_date);
  if (params.end_date) query.append('end_date', params.end_date);
  if (params.segment && params.segment !== 'all') query.append('segment', params.segment);

  const queryString = query.toString();
  const url = `/analytics/dashboard/${queryString ? `?${queryString}` : ''}`;

  return apiRequest<DashboardAnalytics>(url, { auth: true });
}

/**
 * Récupère les points géographiques pour la carte.
 * Correspond à : path('map-points/', MapDataView.as_view())
 */
export function getMapData() {
  // Généralement la carte reste globale, mais on pourrait aussi y ajouter des filtres si besoin
  return apiRequest<any[]>('/analytics/map-points/', { auth: true });
}