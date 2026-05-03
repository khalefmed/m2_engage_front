import { apiRequest } from './http'
import type { ClientDetail, ClientItem, PaginatedResponse } from '../types/api'

interface ListClientsParams {
  page?: number
  search?: string
  country?: string
  gender?: string
  // AJOUT DES PARAMÈTRES D'ÂGE
  min_age?: number
  max_age?: number
}

/**
 * Récupère la liste paginée des clients avec filtres (Recherche, Genre, Âge)
 */
export function listClients(params: ListClientsParams = {}) {
  const query = new URLSearchParams()

  // On boucle sur les paramètres pour construire la query string proprement
  if (params.page) query.set('page', String(params.page))
  if (params.search) query.set('search', params.search)
  if (params.country) query.set('country', params.country)
  if (params.gender) query.set('gender', params.gender)
  
  // CRITIQUE : Envoi des filtres d'âge au backend snake_case
  if (params.min_age !== undefined && params.min_age !== null) {
    query.set('min_age', String(params.min_age))
  }
  if (params.max_age !== undefined && params.max_age !== null) {
    query.set('max_age', String(params.max_age))
  }

  const suffix = query.toString() ? `?${query.toString()}` : ''
  return apiRequest<PaginatedResponse<ClientItem>>(`/clients/${suffix}`, { auth: true })
}

/**
 * Récupère les détails complets d'un client spécifique
 */
export function getClientById(id: number) {
  return apiRequest<ClientDetail>(`/clients/${id}/`, { auth: true })
}

/**
 * Récupère les statistiques de répartition des clients par ville
 */
export function getMapStats() {
  return apiRequest<Record<string, number>>('/clients/map_stats/', { auth: true })
}

/**
 * Importation massive de clients via un fichier Excel ou CSV.
 */
export async function importClients(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  return apiRequest<{ message: string; total_rows_processed: number }>(
    '/clients/import-external/',
    {
      method: 'POST',
      auth: true,
      body: formData,
    }
  )
}