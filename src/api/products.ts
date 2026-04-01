import { apiRequest } from './http'
import type { ProductDetail, ProductItem } from '../types/api'

interface ListProductsParams {
  search?: string
  category?: string
  is_active?: boolean
}

export async function listProducts(params: ListProductsParams = {}) {
  const query = new URLSearchParams();
  
  if (params.search) query.append('search', params.search);
  if (params.category) query.append('category', params.category);
  
  // Correction ici : Django préfère souvent 1/0 ou true/false en minuscule
  if (params.is_active !== undefined) {
    query.append('is_active', params.is_active ? 'true' : 'false');
  }

  const url = `/products/${query.toString() ? `?${query.toString()}` : ''}`;
  console.log("Appel API vers :", url); // <--- Ajoute ceci pour debugger dans la console F12

  const response = await apiRequest<ProductItem[] | { results?: ProductItem[] }>(url, { auth: true });
  
  if (Array.isArray(response)) return response;
  return response.results || [];
}

export function getProductById(id: number) {
  return apiRequest<ProductDetail>(`/products/${id}/`, { auth: true })
}
