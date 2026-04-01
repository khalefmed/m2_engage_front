export interface TokenPair {
  access: string
  refresh: string
}

export interface LoginMfaResponse {
  mfa_required?: boolean
  mfa_setup_required?: boolean
  user_id?: number
  access?: string
}

export interface MfaSetupResponse {
  secret: string
  qr_code_base64: string | null
  otp_auth_url: string
}

export interface AuthMe {
  id: number
  username: string
  first_name: string
  last_name?: string
  email: string
  role: string
  is_mfa_enabled: boolean
}

export interface ClientItem {
  id: number
  first_name: string
  email: string
  city: string
}

export interface ClientDetail extends ClientItem {
  last_name?: string
  country?: string
  phone?: string
  created_at?: string
  updated_at?: string
}

export interface SegmentRules {
  city?: string
  country?: string
  gender?: 'M' | 'F' | 'O' | string
  min_age?: number
  max_age?: number
  last_purchase_days_gt?: number
}

export interface SegmentItem {
  id: number
  name: string
  rules: SegmentRules
  customer_count: number
  created_by: string
  created_at: string
}

export interface SegmentPayload {
  name: string
  rules: SegmentRules
}

export interface ProductItem {
  id: number
  name: string
  description?: string
  category: string
  price: string
  is_active: boolean
  total_sales: number
  total_revenue: number
  created_at: string
}

export interface ProductDetail {
  id: number
  name: string
  description?: string
  category?: string
  price: string
  is_active?: boolean
  total_sales: number
  total_revenue: number
  last_sale_date?: string
  created_at?: string
}

export interface CampaignSegmentSummary {
  id: number
  name: string
}

export interface CampaignItem {
  id: number
  name: string
  subject: string
  content: string // Retirer le '?' pour éviter les erreurs dans le textarea
  status: 'draft' | 'queued' | 'sending' | 'sent' | 'failed'
  segments: number[]
  segment_details?: CampaignSegmentSummary[]
  created_at: string
  sent_at?: string | null
}

export interface CampaignPayload {
  name: string
  subject: string
  content: string
  segments: number[]
}

export interface CampaignSendResponse {
  message: string
  status: string
}

export interface SaleClientSummary {
  id: number
  first_name: string
  last_name: string
  email: string
}

export interface SaleItem {
  id: number
  client: number
  client_details: SaleClientSummary
  total_amount: string
  status: string
  created_at: string
}

export interface SalesListResponse {
  count: number
  results: SaleItem[]
}

export interface SalesStats {
  total_revenue: number
  average_order_value: number
  total_orders_count: number
  growth_percentage: string
  revenue_by_category: Record<string, number>
}

export interface SalesChartItem {
  date: string
  sales: number
  orders: number
}

export interface SaleInvoiceItem {
  id: number
  product: number
  product_name: string
  quantity: number
  unit_price: string
  subtotal: string
}

export interface SaleDetail {
  id: number
  client: number
  client_details: SaleClientSummary
  total_amount: string
  items: SaleInvoiceItem[]
  created_at: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  results: T[]
}

export interface AnalyticsKpis {
  total_revenue: number;
  average_order_value: number;
  total_orders: number;
  total_customers: number;
  active_customers_rate: number;
  growth_rate: number;
  retention_rate: number; // Nouveau
}




export interface DashboardAnalytics {
  sales_trend: { period: string; value: number }[];
  by_gender: { gender: string; value: number }[];
  by_city: { city: string; value: number }[]; // Ajoutez cette ligne
  by_country?: { country: string; value: number }[];
  customer_segments: { segment: string; count: number; percentage: number }[];
  category_performance: { product__category: string; revenue: number; units: number }[];
  peak_shopping_hours: { hour: number; count: number }[];
}



