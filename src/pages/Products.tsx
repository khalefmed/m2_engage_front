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
  LayersIcon
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

  const { data: products = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['products', search, activeFilter],
    queryFn: () =>
      listProducts({
        search,
        is_active: activeFilter === 'all' ? undefined : activeFilter === 'active',
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
      {/* Header Responsive */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Produits</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          Catalogue et catégories de produits disponibles.
        </p>
      </div>

      <Card className="border-none shadow-elegant overflow-hidden bg-white dark:bg-white/5">
        <CardHeader className="px-4 py-5 border-b dark:border-white/5 bg-slate-50/30 dark:bg-transparent">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Catalogue produits</CardTitle>
              <Badge variant="info" className="text-[10px] uppercase font-black tracking-tighter">
                {products.length} produits
              </Badge>
            </div>

            {/* Barre de Recherche Responsive */}
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
                  className="pl-9 h-11 border-slate-200 dark:border-white/10 bg-white dark:bg-transparent rounded-xl"
                />
              </div>
              <Button type="submit" variant="secondary" className="h-11 px-4 text-xs font-bold uppercase tracking-widest">
                <span className="hidden sm:inline">Rechercher</span>
                <MagnifyingGlassIcon className="sm:hidden w-5 h-5" />
              </Button>
            </form>

            {/* Filtres d'état */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <FilterButton active={activeFilter === 'all'} onClick={() => setActiveFilter('all')}>Tous</FilterButton>
              <FilterButton active={activeFilter === 'active'} onClick={() => setActiveFilter('active')}>Actifs</FilterButton>
              <FilterButton active={activeFilter === 'inactive'} onClick={() => setActiveFilter('inactive')}>Inactifs</FilterButton>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y dark:divide-white/5">
            {isLoading && <div className="p-12 text-center animate-pulse text-slate-400 font-medium">Chargement du catalogue...</div>}

            {isError && (
              <div className="m-4 p-4 rounded-2xl border border-red-100 bg-red-50 text-center">
                <p className="text-sm text-red-700 font-medium mb-3">Erreur de chargement.</p>
                <Button variant="destructive" size="sm" onClick={() => void refetch()}>Réessayer</Button>
              </div>
            )}

            {!isLoading && !isError && products.length === 0 && (
              <div className="p-12 text-center text-slate-400 text-sm italic">Aucun produit trouvé.</div>
            )}

            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                onClick={() => setSelectedProductId(product.id)}
              >
                <div className="min-w-0 flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-bold truncate group-hover:text-violet-600 transition-colors">{product.name}</p>
                    <Badge variant={product.is_active ? 'success' : 'warning'} className="text-[8px] h-4 px-1 uppercase font-black shrink-0">
                      {product.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium tracking-tight mb-1">
                    {product.category} • {product.total_sales} ventes
                  </p>
                  <p className="text-xs font-black text-violet-700 dark:text-violet-300">
                    {formatCurrency(product.price)}
                  </p>
                </div>

                <div className="shrink-0">
                   <Button size="sm" variant="secondary" className="h-9 w-9 p-0 sm:w-auto sm:px-4 rounded-xl">
                      <ChevronRightIcon className="sm:hidden w-5 h-5" />
                      <span className="hidden sm:inline text-xs font-bold">Détails</span>
                   </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Tags de catégories détectées */}
          {categories.length > 0 && (
            <div className="p-4 bg-slate-50/50 dark:bg-white/5 border-t dark:border-white/5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <LayersIcon /> Catégories détectées
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Badge key={category} variant="default" className="bg-white dark:bg-white/10 text-slate-600 dark:text-slate-300 border-none px-3 py-1 text-[10px] font-bold">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL / DRAWER PROFIL PRODUIT */}
      {selectedProductId !== null && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-xl bg-white dark:bg-[#0b0b13] shadow-2xl border-none rounded-t-[2.5rem] sm:rounded-3xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            <CardHeader className="bg-slate-50/50 dark:bg-white/5 border-b dark:border-white/10 p-6 relative">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
                  <ArchiveIcon className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black tracking-tight">Détails Produit</CardTitle>
                  <CardDescription className="font-bold uppercase text-[10px] tracking-widest text-violet-500">Référence #{selectedProductId}</CardDescription>
                </div>
              </div>
              <button 
                onClick={() => setSelectedProductId(null)}
                className="absolute right-6 top-6 p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"
              >
                <Cross2Icon className="w-5 h-5" />
              </button>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              {isDetailsLoading ? (
                <div className="py-12 text-center animate-pulse text-slate-400 font-bold">Récupération des stocks...</div>
              ) : isDetailsError ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-red-500 font-bold mb-4">Erreur de chargement.</p>
                  <Button onClick={() => void refetchDetails()}>Réessayer</Button>
                </div>
              ) : productDetails && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <DetailBox label="Nom du produit" value={productDetails.name} />
                  <DetailBox label="Prix de vente" value={formatCurrency(productDetails.price)} isHighlight />
                  <DetailBox label="Total des ventes" value={`${productDetails.total_sales} unités`} />
                  <DetailBox label="Revenu généré" value={formatCurrency(productDetails.total_revenue)} />
                  <div className="sm:col-span-2">
                    <DetailBox label="Dernière vente enregistrée" value={formatDate(productDetails.last_sale_date)} />
                  </div>
                  
                  <div className="flex gap-3 pt-4 sm:col-span-2 border-t dark:border-white/5 mt-2">
                    <Button variant="secondary" className="flex-1 font-bold h-11" onClick={() => setSelectedProductId(null)}>
                      Fermer
                    </Button>
                    {/* <Button className="flex-1 bg-violet-600 hover:bg-violet-700 font-bold h-11 shadow-lg shadow-violet-500/20">
                      Éditer
                    </Button> */}
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

// --- SOUS-COMPOSANTS UI ---

function FilterButton({ children, active, onClick }: { children: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
        active 
        ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20' 
        : 'bg-slate-100 text-slate-500 dark:bg-white/5 hover:bg-slate-200'
      }`}
    >
      {children}
    </button>
  )
}

function DetailBox({ label, value, isHighlight }: { label: string, value?: string, isHighlight?: boolean }) {
  return (
    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{label}</p>
      <p className={`text-sm font-bold ${isHighlight ? 'text-violet-600 dark:text-violet-400' : 'text-slate-900 dark:text-white'}`}>
        {value || '-'}
      </p>
    </div>
  )
}