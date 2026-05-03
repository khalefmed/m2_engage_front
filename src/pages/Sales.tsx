import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/common/Card'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { 
  FileTextIcon, 
  CalendarIcon, 
  ChevronRightIcon, 
  Cross1Icon, 
  CubeIcon, 
  PersonIcon,
  CounterClockwiseClockIcon,
  ArrowTopRightIcon, // À la place de TrendingUpIcon
  ArchiveIcon,
  BarChartIcon // À la place de PieChartIcon si disponible, sinon StitchesLogoIcon ou MixerHorizontalIcon
} from '@radix-ui/react-icons'
import { getSaleById, getSalesChartData, getSalesStats, listSales } from '../api/sales'

// --- HELPERS ---
const formatAmount = (value: string | number) => {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MRU' }).format(num || 0)
}

const formatDate = (value?: string) => {
  if (!value) return '-'
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export function Sales() {
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null)

  // Queries
  const statsQuery = useQuery({ queryKey: ['sales-stats'], queryFn: getSalesStats })
  const chartQuery = useQuery({ queryKey: ['sales-chart'], queryFn: getSalesChartData })
  const salesQuery = useQuery({ queryKey: ['sales-list'], queryFn: () => listSales({}) })

  const saleDetailsQuery = useQuery({
    queryKey: ['sales-detail', selectedSaleId],
    queryFn: () => getSaleById(String(selectedSaleId)),
    enabled: selectedSaleId !== null,
  })

  // Préparation du graphique
  const chartData = chartQuery.data ?? []
  const maxSalesValue = Math.max(...chartData.map((d) => d.sales), 1)

  return (
    <div className="space-y-8 animate-fade-in pb-10 text-slate-900">
      {/* Header avec bouton d'export ou action */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Registre des Ventes</h1>
          <p className="text-sm text-slate-500 flex items-center gap-2">
            <CounterClockwiseClockIcon /> Flux de transactions en temps réel.
          </p>
        </div>
      </div>

      {/* Dans la section Top Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Revenu total" 
          value={formatAmount(statsQuery.data?.total_revenue ?? 0)} 
          icon={<ArrowTopRightIcon className="text-emerald-500 w-5 h-5" />} 
        />
        <StatCard 
          title="Panier moyen" 
          value={formatAmount(statsQuery.data?.average_order_value ?? 0)} 
          icon={<BarChartIcon className="text-blue-500 w-5 h-5" />} 
        />
        <StatCard 
          title="Volume commandes" 
          value={(statsQuery.data?.total_orders_count ?? 0).toLocaleString()} 
          icon={<ArchiveIcon className="text-amber-500 w-5 h-5" />} 
        />
        
        {/* La carte de Croissance Violette */}
        <Card className="border-none shadow-lg bg-violet-600 text-white">
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <p className="text-[10px] font-black uppercase opacity-70 tracking-widest">Performance</p>
            <div className="flex items-end justify-between mt-2">
              <span className="text-2xl font-black">{statsQuery.data?.growth_percentage ?? '+0%'}</span>
              <ArrowTopRightIcon className="w-6 h-6 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section Graphique & Top Catégories */}
      {/* <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-none shadow-elegant bg-white">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">Tendance des Ventes</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-end gap-3 px-4 pb-4">
            {chartData.length > 0 ? chartData.slice(-12).map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div 
                  className="w-full rounded-t-sm bg-indigo-500/20 group-hover:bg-indigo-500 transition-all" 
                  style={{ height: `${(item.sales / maxSalesValue) * 100}%` }} 
                />
                <span className="text-[9px] text-slate-400 font-bold uppercase truncate w-full text-center">
                  {item.date.split('-').slice(1).reverse().join('/')}
                </span>
              </div>
            )) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 italic">Analyse des flux en cours...</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-elegant bg-white">
          <CardHeader>
            <CardTitle className="text-base">Top Catégories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(statsQuery.data?.revenue_by_category ?? {}).slice(0, 4).map(([cat, val]) => (
              <div key={cat} className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                  <span className="text-slate-500">{cat}</span>
                  <span>{formatAmount(val as number)}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-violet-500 rounded-full" 
                    style={{ width: `${Math.min(((val as number) / (statsQuery.data?.total_revenue || 1)) * 100, 100)}%` }} 
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div> */}

      {/* Liste des Ventes - Refonte en mode "Clean List" */}
      <Card className="border-none shadow-elegant bg-white overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Historique des Transactions</CardTitle>
            <Badge className="bg-slate-200 text-slate-600 border-none font-mono">
              {salesQuery.data?.results.length || 0} ITEMS
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {salesQuery.data?.results.map((sale) => (
              <div 
                key={sale.id} 
                className="group flex items-center justify-between p-4 hover:bg-slate-50 transition-all cursor-pointer"
                onClick={() => setSelectedSaleId(sale.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                    <FileTextIcon />
                  </div>
                  <div>
                    <p className="text-sm font-black">CMD #{sale.id}</p>
                    <p className="text-xs text-slate-500 font-medium">
                      {sale.client_details?.first_name} {sale.client_details?.last_name} • {formatDate(sale.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-black text-violet-600">{formatAmount(sale.total_amount)}</p>
                    <Badge className="text-[9px] h-4 bg-emerald-500/10 text-emerald-600 border-none px-1">COMPLÉTÉ</Badge>
                  </div>
                  <ChevronRightIcon className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal Facture Détail */}
      {selectedSaleId !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-2xl bg-white shadow-2xl border-none overflow-hidden animate-in zoom-in-95 duration-200">
            <CardHeader className="bg-slate-50 border-b relative">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-600 rounded-lg text-white"><FileTextIcon className="w-5 h-5" /></div>
                <div>
                  <CardTitle className="text-xl">Détails de la Vente</CardTitle>
                  <CardDescription>ID Transaction: {selectedSaleId}</CardDescription>
                </div>
              </div>
              <button onClick={() => setSelectedSaleId(null)} className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600"><Cross1Icon /></button>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              {saleDetailsQuery.data && (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Acheteur</p>
                      <p className="text-sm font-bold">{saleDetailsQuery.data.client_details?.first_name} {saleDetailsQuery.data.client_details?.last_name}</p>
                      <p className="text-xs text-slate-500">{saleDetailsQuery.data.client_details?.email}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date de transaction</p>
                      <p className="text-sm font-bold">{formatDate(saleDetailsQuery.data.created_at)}</p>
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[9px]">PAIEMENT CONFIRMÉ</Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Articles commandés</p>
                    <div className="divide-y border rounded-xl overflow-hidden">
                      {saleDetailsQuery.data.items?.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50/30">
                          <div className="flex items-center gap-3">
                            <span className="h-6 w-6 rounded bg-violet-100 text-violet-600 flex items-center justify-center text-[10px] font-bold">{item.quantity}x</span>
                            <p className="text-sm font-bold">{item.product_name}</p>
                          </div>
                          <p className="text-sm font-black font-mono">{formatAmount(item.subtotal)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total de la commande</p>
                      <p className="text-[10px] text-slate-400 italic">Toutes taxes comprises</p>
                    </div>
                    <span className="text-4xl font-black text-violet-600 tracking-tighter">
                      {formatAmount(saleDetailsQuery.data.total_amount)}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// Sous-composant StatCard
function StatCard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
  return (
    <Card className="border-none shadow-sm bg-white">
      <CardContent className="p-5 flex items-center align-center justify-center gap-4">
        <div className="p-3 bg-slate-50 rounded-2xl">{icon}</div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
          <p className="text-xl font-black tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}