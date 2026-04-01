import { apiRequest } from './http'
import type { CampaignItem, CampaignPayload, CampaignSendResponse, PaginatedResponse } from '../types/api'

/**
 * Récupère la liste des campagnes.
 * Gère à la fois le format tableau brut et le format paginé de Django REST Framework.
 */
export async function listCampaigns(): Promise<CampaignItem[]> {
  const response = await apiRequest<CampaignItem[] | PaginatedResponse<CampaignItem>>('/campaigns/', { 
    auth: true 
  })

  // Si le backend renvoie un objet de pagination { count, results, ... }
  if ('results' in response && Array.isArray(response.results)) {
    return response.results
  }
  
  // Si le backend renvoie un tableau brut
  if (Array.isArray(response)) {
    return response
  }

  return []
}

/**
 * Crée une nouvelle campagne (statut draft par défaut).
 */
export function createCampaign(payload: CampaignPayload): Promise<CampaignItem> {
  return apiRequest<CampaignItem>('/campaigns/', {
    method: 'POST',
    auth: true,
    body: JSON.stringify(payload),
  })
}

/**
 * Met à jour une campagne existante (uniquement si statut est draft).
 */
export function updateCampaign(id: number, payload: Partial<CampaignPayload>): Promise<CampaignItem> {
  return apiRequest<CampaignItem>(`/campaigns/${id}/`, {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify(payload),
  })
}

/**
 * Déclenche l'envoi asynchrone via Celery.
 */
export function sendCampaign(id: number): Promise<CampaignSendResponse> {
  return apiRequest<CampaignSendResponse>(`/campaigns/${id}/send/`, {
    method: 'POST',
    auth: true,
  })
}