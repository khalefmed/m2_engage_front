import { apiRequest } from './http'
import type { AnalyticsKpis, DashboardAnalytics } from '../types/api'

/**
 * Récupère les indicateurs clés (KPIs) de performance.
 * Correspond à : path('kpis/', KPIStatsView.as_view())
 */
export function getKpis() {
  // Ajusté de '/analytics/kpis/' vers '/analytics/kpis/' 
  // (Assurez-vous que le préfixe de l'URL dans votre config http inclut /api)
  return apiRequest<AnalyticsKpis>('/analytics/kpis/', { auth: true })
}

/**
 * Récupère les données de distribution (villes, genres, tendances).
 * Correspond à : path('dashboard/', GlobalDashboardView.as_view())
 */
export function getDashboardAnalytics() {
  return apiRequest<DashboardAnalytics>('/analytics/dashboard/', { auth: true })
}

/**
 * Récupère les points géographiques pour la carte.
 * Correspond à : path('map-points/', MapDataView.as_view())
 */
export function getMapData() {
  return apiRequest<any[]>('/analytics/map-points/', { auth: true })
}