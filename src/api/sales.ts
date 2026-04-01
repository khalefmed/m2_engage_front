import { apiRequest } from './http'
import type {
  SaleDetail,
  SalesChartItem,
  SalesListResponse,
  SalesStats,
} from '../types/api'

interface ListSalesParams {
  client_id?: number
  product_id?: number
  start_date?: string
  end_date?: string
}

export async function listSales(params: ListSalesParams = {}) {
  const query = new URLSearchParams()
  if (params.client_id) query.set('client_id', String(params.client_id))
  if (params.product_id) query.set('product_id', String(params.product_id))
  if (params.start_date) query.set('start_date', params.start_date)
  if (params.end_date) query.set('end_date', params.end_date)

  const suffix = query.toString() ? `?${query.toString()}` : ''
  const response = await apiRequest<SalesListResponse | { results?: SalesListResponse['results']; count?: number }>(
    `/sales/${suffix}`,
    { auth: true }
  )

  if ('count' in response && Array.isArray(response.results)) {
    return { count: response.count ?? response.results.length, results: response.results }
  }

  return { count: 0, results: [] }
}

export function getSalesStats() {
  return apiRequest<SalesStats>('/sales/stats/', { auth: true })
}

export async function getSalesChartData() {
  const response = await apiRequest<SalesChartItem[] | { results?: SalesChartItem[] }>('/sales/chart-data/', {
    auth: true,
  })
  if (Array.isArray(response)) return response
  return Array.isArray(response.results) ? response.results : []
}

export function getSaleById(id: string) {
  return apiRequest<SaleDetail>(`/sales/${id}/`, { auth: true })
}
