import { apiRequest } from './http'
import type { ProductDetail, ProductItem } from '../types/api'

/**
 * Interface pour les paramètres de filtrage des produits.
 * Inclut désormais le tri et la plage de dates pour la performance.
 */
interface ListProductsParams {
  search?: string
  category?: string
  is_active?: boolean
  ordering?: string      // ex: '-total_revenue' ou 'total_sales'
  start_date?: string    // format YYYY-MM-DD
  end_date?: string      // format YYYY-MM-DD
}

/**
 * Récupère la liste des produits avec filtres et calculs de performance.
 */
export async function listProducts(params: ListProductsParams = {}) {
  const query = new URLSearchParams();
  
  // Paramètres de recherche et catégorie
  if (params.search) query.append('search', params.search);
  if (params.category) query.append('category', params.category);
  
  // Paramètres de performance et tri
  if (params.ordering) query.append('ordering', params.ordering);
  if (params.start_date) query.append('start_date', params.start_date);
  if (params.end_date) query.append('end_date', params.end_date);
  
  // État du produit (Actif/Inactif)
  if (params.is_active !== undefined) {
    query.append('is_active', params.is_active ? 'true' : 'false');
  }

  // Construction de l'URL finale
  const queryString = query.toString();
  const url = `/products/${queryString ? `?${queryString}` : ''}`;
  
  // Debug pour vérifier les paramètres envoyés à Railway dans la console F12
  console.log("Appel API (Performance Filter) :", url);

  const response = await apiRequest<ProductItem[] | { results?: ProductItem[] }>(url, { auth: true });
  
  // Gestion de la réponse paginée ou simple liste
  if (Array.isArray(response)) return response;
  return response.results || [];
}

/**
 * Récupère les détails complets d'un produit spécifique par son ID.
 */
export function getProductById(id: number | null) {
  if (id === null) return Promise.reject("ID manquant");
  return apiRequest<ProductDetail>(`/products/${id}/`, { auth: true });
}