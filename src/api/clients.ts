import { apiRequest } from './http'
import type { ClientDetail, ClientItem, PaginatedResponse } from '../types/api'

interface ListClientsParams {
  page?: number
  search?: string
  country?: string
}

export function listClients(params: ListClientsParams = {}) {
  const query = new URLSearchParams()

  if (params.page) query.set('page', String(params.page))
  if (params.search) query.set('search', params.search)
  if (params.country) query.set('country', params.country)

  const suffix = query.toString() ? `?${query.toString()}` : ''
  return apiRequest<PaginatedResponse<ClientItem>>(`/clients/${suffix}`, { auth: true })
}

export function getClientById(id: number) {
  return apiRequest<ClientDetail>(`/clients/${id}/`, { auth: true })
}

/**
 * Récupère les statistiques de répartition des clients par ville
 * pour l'affichage sur la carte (5000+ enregistrements).
 */
export function getMapStats() {
  return apiRequest<Record<string, number>>('/clients/map_stats/', { auth: true })
}