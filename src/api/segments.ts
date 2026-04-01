import { apiRequest } from './http'
import type { SegmentItem, SegmentPayload } from '../types/api'

export async function listSegments() {
  const response = await apiRequest<SegmentItem[] | { results?: SegmentItem[] }>('/segments/', { auth: true })
  if (Array.isArray(response)) return response
  return Array.isArray(response.results) ? response.results : []
}

export function createSegment(payload: SegmentPayload) {
  return apiRequest<SegmentItem>('/segments/', {
    method: 'POST',
    auth: true,
    body: JSON.stringify(payload),
  })
}

export function updateSegment(id: number, payload: Partial<SegmentPayload>) {
  return apiRequest<SegmentItem>(`/segments/${id}/`, {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify(payload),
  })
}

export function deleteSegment(id: number) {
  return apiRequest<null>(`/segments/${id}/`, {
    method: 'DELETE',
    auth: true,
  })
}
