import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/common/Card'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import { 
  MagnifyingGlassIcon, 
  ArchiveIcon, 
  ChevronRightIcon, 
  Cross2Icon,
  LayersIcon,
  CalendarIcon,
  BarChartIcon
} from '@radix-ui/react-icons'
import { getProductById, listProducts } from '../api/products'

function formatCurrency(value: string | number) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return String(value)
  return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'MRU' })
}

function formatDate(value?: string) {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('fr-FR')
}

export function Products() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)

  // Nouveaux états pour la performance
  const [performanceOrder, setPerformanceOrder] = useState('-total_revenue')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  const { data: products = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['products', search, activeFilter, performanceOrder, dateRange],
    queryFn: () =>
      listProducts({
        search,
        is_active: activeFilter === 'all' ? undefined : activeFilter === 'active',
        ordering: performanceOrder,
        start_date: dateRange.start,
        end_date: dateRange.end,
      }),
  })

  const {
    data: productDetails,
    isLoading: isDetailsLoading,
    isError: isDetailsError,
    refetch: refetchDetails,
  } = useQuery({
    queryKey: ['product-details', selectedProductId],
    queryFn: () => getProductById(selectedProductId as number),
    enabled: selectedProductId !== null,
  })

  const categories = useMemo(() => {
    return [...new Set(products.map((product) => product.category).filter(Boolean))]
  }, [products])

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Produits</h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Analyse de performance et catalogue de produits.
        </p>
      </div>

      <Card className="border-none shadow-elegant overflow-hidden bg-white">
        <CardHeader className="px-4 py-5 border-b bg-slate-50/30">
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Catalogue produits</CardTitle>
              <Badge variant="info" className="text-[10px] uppercase font-black tracking-tighter">
                {products.length} produits
              </Badge>
            </div>

            {/* Recherche */}
            <form
              className="relative flex w-full gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                setSearch(searchInput.trim())
              }}
            >
              <div className="relative flex-1 group">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Rechercher un produit..."
                  className="pl-9 h-11 border-slate-200 bg-white rounded-xl"
                />
              </div>
              <Button type="submit" variant="secondary" className="h-11 px-4 text-xs font-bold uppercase tracking-widest">
                <span className="hidden sm:inline">Rechercher</span>
                <MagnifyingGlassIcon className="sm:hidden w-5 h-5" />
              </Button>
            </form>

            {/* BLOC PERFORMANCE (Nouveau) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-violet-50/50 border border-violet-100 shadow-sm">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-violet-600 flex items-center gap-2">
                  <BarChartIcon className="w-3 h-3" /> Trier par Performance
                </label>
                <select 
                  value={performanceOrder}
                  onChange={(e) => setPerformanceOrder(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold shadow-sm focus:ring-2 focus:ring-violet-500 transition-all outline-none"
                >
                  <option value="-total_revenue">Meilleur Revenu</option>
                  <option value="total_revenue">Moins de Revenu</option>
                  <option value="-total_sales">Plus de Ventes (Unités)</option>
                  <option value="total_sales">Moins de Ventes (Unités)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-violet-600 flex items-center gap-2">
                  <CalendarIcon className="w-3 h-3" /> Période d'analyse
                </label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="date" 
                    className="h-10 text-[10px] font-bold"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  />
                  <span className="text-slate-400 text-[10px] font-bold uppercase">au</span>
                  <Input 
                    type="date" 
                    className="h-10 text-[10px] font-bold"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Filtres d'état */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <FilterButton active={activeFilter === 'all'} onClick={() => setActiveFilter('all')}>Tous</FilterButton>
              <FilterButton active={activeFilter === 'active'} onClick={() => setActiveFilter('active')}>Actifs</FilterButton>
              <FilterButton active={activeFilter === 'inactive'} onClick={() => setActiveFilter('inactive')}>Inactifs</FilterButton>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y">
            {isLoading && <div className="p-12 text-center animate-pulse text-slate-400 font-medium italic">Analyse des performances en cours...</div>}

            {!isLoading && !isError && products.length === 0 && (
              <div className="p-12 text-center text-slate-400 text-sm italic">Aucun produit trouvé.</div>
            )}

            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                onClick={() => setSelectedProductId(product.id)}
              >
                <div className="min-w-0 flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold truncate group-hover:text-violet-600 transition-colors">{product.name}</p>
                    <Badge variant={product.is_active ? 'success' : 'warning'} className="text-[8px] h-4 px-1 uppercase font-black shrink-0">
                      {product.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                  <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
                    <span className="text-[11px] text-slate-500 font-medium">{product.category}</span>
                    <div className="flex items-center gap-1">
                       <span className="text-[11px] font-bold text-violet-600">{product.total_sales}</span>
                       <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">unités</span>
                    </div>
                    <div className="flex items-center gap-1">
                       <span className="text-[11px] font-bold text-emerald-600">{formatCurrency(product.total_revenue)}</span>
                       {/* <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">CA</span> */}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-4">
                  <p className="hidden sm:block text-xs font-black text-slate-700">
                    {formatCurrency(product.price)}
                  </p>
                  <Button size="sm" variant="secondary" className="h-9 w-9 p-0 sm:w-auto sm:px-4 rounded-xl shadow-sm">
                    <ChevronRightIcon className="w-5 h-5" />
                    <span className="hidden sm:inline text-xs font-bold ml-1">Détails</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {categories.length > 0 && (
            <div className="p-4 bg-slate-50/50 border-t">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <LayersIcon /> Catégories actives
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Badge key={category} variant="default" className="bg-white text-slate-600 border-none shadow-sm px-3 py-1 text-[10px] font-bold">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL DÉTAILS */}
      {selectedProductId !== null && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-xl bg-white shadow-2xl border-none rounded-t-[2.5rem] sm:rounded-3xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            <CardHeader className="bg-slate-50/50 border-b p-6 relative">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
                  <ArchiveIcon className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black tracking-tight">Analyse Produit</CardTitle>
                  <CardDescription className="font-bold uppercase text-[10px] tracking-widest text-violet-500">ID #{selectedProductId}</CardDescription>
                </div>
              </div>
              <button 
                onClick={() => setSelectedProductId(null)}
                className="absolute right-6 top-6 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
              >
                <Cross2Icon className="w-5 h-5" />
              </button>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              {isDetailsLoading ? (
                <div className="py-12 text-center animate-pulse text-slate-400 font-bold italic">Génération du rapport...</div>
              ) : isDetailsError ? (
                <div className="py-8 text-center text-red-500 font-bold">Échec du chargement des statistiques.</div>
              ) : productDetails && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <DetailBox label="Produit" value={productDetails.name} />
                  <DetailBox label="Prix catalogue" value={formatCurrency(productDetails.price)} isHighlight />
                  <DetailBox label="Volume de ventes" value={`${productDetails.total_sales} unités`} />
                  <DetailBox label="Revenu Total (CA)" value={formatCurrency(productDetails.total_revenue)} />
                  <div className="sm:col-span-2">
                    <DetailBox label="Statut de l'analyse" value={dateRange.start ? `Depuis le ${formatDate(dateRange.start)}` : 'Historique complet'} />
                  </div>
                  
                  <div className="flex gap-3 pt-4 sm:col-span-2 border-t mt-2">
                    <Button variant="secondary" className="flex-1 font-bold h-11 rounded-xl" onClick={() => setSelectedProductId(null)}>
                      Fermer l'analyse
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function FilterButton({ children, active, onClick }: { children: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-tighter transition-all whitespace-nowrap ${
        active 
        ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30 ring-2 ring-violet-500/20' 
        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
      }`}
    >
      {children}
    </button>
  )
}

function DetailBox({ label, value, isHighlight }: { label: string, value?: string, isHighlight?: boolean }) {
  return (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{label}</p>
      <p className={`text-sm font-bold ${isHighlight ? 'text-violet-600' : 'text-slate-900'}`}>
        {value || '-'}
      </p>
    </div>
  )
}