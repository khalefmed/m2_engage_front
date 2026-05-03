import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { LatLngExpression } from 'leaflet'
import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup } from 'react-leaflet'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/common/Card'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import { 
  MagnifyingGlassIcon, 
  GlobeIcon, 
  ViewHorizontalIcon, 
  Cross2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UploadIcon,
  MixerHorizontalIcon
} from '@radix-ui/react-icons'
import { getClientById, listClients, getMapStats, importClients } from '../api/clients'

import 'leaflet/dist/leaflet.css'

// --- CONFIGURATION ---
const CITY_COORDS: Record<string, LatLngExpression> = {
  'Nouakchott': [18.0889, -15.9789],
  'Nouadhibou': [20.9310, -17.0373],
  'Kiffa': [16.6167, -11.4000],
  'Rosso': [16.5167, -15.8050],
  'Atar': [20.5169, -13.0499],
}

function formatDate(value?: string) {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('fr-FR')
}

export function Clients() {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list')
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  
  // États des filtres
  const [genderFilter, setGenderFilter] = useState('')
  const [minAge, setMinAge] = useState('')
  const [maxAge, setMaxAge] = useState('')
  
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null)

  // 1. Liste des clients (Synchronisée avec le Backend pour filtres + pagination)
  const { data, isLoading } = useQuery({
    queryKey: ['clients', page, search, genderFilter, minAge, maxAge],
    queryFn: () => listClients({ 
      page, 
      search, 
      gender: genderFilter,
      min_age: minAge ? Number(minAge) : undefined,
      max_age: maxAge ? Number(maxAge) : undefined
    }),
  })

  // 2. Stats pour la carte
  const { data: mapData } = useQuery<Record<string, number>>({
    queryKey: ['clients-map-stats'],
    queryFn: getMapStats, 
    enabled: activeTab === 'map',
  })

  // 3. Détails d'un client
  const { data: clientDetails, isLoading: isDetailsLoading } = useQuery({
    queryKey: ['client-details', selectedClientId],
    queryFn: () => getClientById(selectedClientId as number),
    enabled: selectedClientId !== null,
  })

  // 4. Mutation pour l'importation
  const importMutation = useMutation({
    mutationFn: importClients,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      alert("Importation réussie !")
    },
    onError: (err: any) => alert(err.message || "Erreur lors de l'importation.")
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      importMutation.mutate(file, {
        onSettled: () => {
          if (fileInputRef.current) fileInputRef.current.value = ''
        }
      })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10 text-slate-900">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium italic">
            Visualisation et segmentation multicritères.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <input type="file" ref={fileInputRef} className="hidden" accept=".csv, .xlsx, .xls" onChange={handleFileChange} />
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={importMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 gap-2 h-9 text-xs"
          >
            <UploadIcon /> {importMutation.isPending ? 'Traitement...' : 'Importer'}
          </Button>

          <div className="flex bg-slate-100 p-1 rounded-xl border shrink-0">
            <Button variant={activeTab === 'list' ? 'default' : 'ghost'} size="sm" className="h-8 px-3 text-xs" onClick={() => setActiveTab('list')}>
              <ViewHorizontalIcon className="mr-2" /> Liste
            </Button>
            <Button variant={activeTab === 'map' ? 'default' : 'ghost'} size="sm" className="h-8 px-3 text-xs" onClick={() => setActiveTab('map')}>
              <GlobeIcon className="mr-2" /> Carte
            </Button>
          </div>
        </div>
      </div>

      {activeTab === 'list' ? (
        <Card className="border-none shadow-elegant overflow-hidden bg-white">
          <CardHeader className="px-4 py-5 border-b bg-slate-50/30">
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault()
                setPage(1)
                setSearch(searchInput.trim())
              }}
            >
              {/* Ligne 1 : Recherche + Genre */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 group">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                  <Input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Nom, email, ville..."
                    className="pl-9 h-10 border-slate-200 bg-white"
                  />
                </div>

                <div className="relative min-w-[160px]">
                  <MixerHorizontalIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3" />
                  <select 
                    value={genderFilter}
                    onChange={(e) => { setGenderFilter(e.target.value); setPage(1); }}
                    className="w-full pl-8 h-10 bg-white border border-slate-200 rounded-md text-[11px] font-bold uppercase outline-none focus:ring-2 ring-violet-500/20"
                  >
                    <option value="">Tous les Genres</option>
                    <option value="M">Homme</option>
                    <option value="F">Femme</option>
                  </select>
                </div>
              </div>

              {/* Ligne 2 : Filtres d'âge + Bouton */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-slate-400">Âge :</span>
                  <Input 
                    type="number" 
                    placeholder="Min" 
                    value={minAge}
                    onChange={(e) => { setMinAge(e.target.value); setPage(1); }}
                    className="w-20 h-9 text-xs" 
                  />
                  <span className="text-slate-300">-</span>
                  <Input 
                    type="number" 
                    placeholder="Max" 
                    value={maxAge}
                    onChange={(e) => { setMaxAge(e.target.value); setPage(1); }}
                    className="w-20 h-9 text-xs" 
                  />
                </div>
                
                <div className="flex-1" />

                <Button type="submit" className="h-9 px-8 bg-violet-600 hover:bg-violet-700 font-bold text-[10px] uppercase tracking-widest">
                  Appliquer les filtres
                </Button>
              </div>
            </form>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="divide-y">
              {isLoading ? (
                <div className="p-12 text-center animate-pulse text-slate-400 font-medium tracking-widest uppercase text-[10px]">Filtrage des données en cours...</div>
              ) : data?.results.map((client) => (
                <div 
                  key={client.id} 
                  className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => setSelectedClientId(client.id)}
                >
                  <div className="flex items-center gap-4 min-w-0 pr-4">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-violet-500 border border-slate-200 shrink-0">
                      {client.first_name[0]}{client.last_name?.[0] || ''}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate group-hover:text-violet-600 transition-colors">
                        {client.first_name} {client.last_name || ''}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium truncate uppercase tracking-tight">{client.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="hidden md:block text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase">Infos</p>
                      <p className="text-xs font-bold">{client.city} • {client.gender}</p>
                    </div>
                    <Badge variant={client.is_active ? 'success' : 'secondary'} className="text-[9px] font-black px-2 py-0.5 uppercase tracking-tighter">
                      {client.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                    <ChevronRightIcon className="w-5 h-5 text-slate-300 group-hover:text-violet-500 transition-colors" />
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINATION */}
            <div className="p-4 bg-slate-50/50 flex items-center justify-between border-t">
              <Button variant="ghost" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="text-[10px] font-bold uppercase">
                <ChevronLeftIcon className="mr-1" /> Précédent
              </Button>
              <div className="flex items-center gap-4">
                 <Badge variant="outline" className="text-[10px] font-black">{data?.count ?? 0} Clients trouvés</Badge>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page {page}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setPage((p) => p + 1)} disabled={!data?.next} className="text-[10px] font-bold uppercase">
                Suivant <ChevronRightIcon className="ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* VUE CARTE */
        <Card className="overflow-hidden border-none shadow-elegant rounded-2xl bg-white">
          <CardContent className="p-0">
            <div className="h-[600px] w-full relative">
              <MapContainer center={[18.5, -12.5]} zoom={6} style={{ height: '100%', width: '100%', background: '#0f172a' }}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
                {mapData && Object.entries(CITY_COORDS).map(([cityName, coords]) => {
                  const count = mapData[cityName] || 0
                  if (count === 0) return null
                  return (
                    <CircleMarker key={cityName} center={coords} radius={15 + Math.sqrt(count) * 1.5} pathOptions={{ color: '#8b5cf6', fillColor: '#8b5cf6', fillOpacity: 0.4, weight: 2 }}>
                      <Tooltip permanent direction="center" className="custom-map-label border-none bg-transparent shadow-none">
                        <span className="font-black text-[12px] text-white drop-shadow-lg">{count}</span>
                      </Tooltip>
                    </CircleMarker>
                  )
                })}
              </MapContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* MODAL PROFIL */}
      {selectedClientId !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-xl bg-white shadow-2xl border-none rounded-3xl overflow-hidden animate-in zoom-in-95 duration-300">
            <CardHeader className="bg-slate-50/50 border-b p-6 relative">
              <div className="flex items-center gap-4">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-white font-black text-xl ${clientDetails?.is_active ? 'bg-emerald-500' : 'bg-slate-500'}`}>
                  {clientDetails?.first_name[0]}
                </div>
                <div>
                  <CardTitle className="text-xl font-black">{clientDetails?.first_name} {clientDetails?.last_name}</CardTitle>
                  <CardDescription className="font-bold uppercase text-[10px] text-violet-500 tracking-widest">ID Client: {selectedClientId}</CardDescription>
                </div>
              </div>
              <button onClick={() => setSelectedClientId(null)} className="absolute right-6 top-6 p-2 text-slate-400 hover:bg-slate-100 rounded-full">
                <Cross2Icon className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="p-6">
              {isDetailsLoading ? (
                <div className="py-12 text-center animate-pulse text-[10px] font-black uppercase text-slate-400">Chargement...</div>
              ) : clientDetails && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <DetailBox label="Email" value={clientDetails.email} isHighlight />
                    <DetailBox label="Téléphone" value={clientDetails.phone} />
                    <DetailBox label="Ville" value={clientDetails.city} />
                    <DetailBox label="Âge" value={`${clientDetails.age} ans`} />
                  </div>
                  <Button className="w-full bg-violet-600 hover:bg-violet-700 font-bold uppercase text-[10px] tracking-widest h-11" onClick={() => setSelectedClientId(null)}>
                    Fermer le profil
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function DetailBox({ label, value, isHighlight }: { label: string, value?: string | number, isHighlight?: boolean }) {
  return (
    <div className="p-3 rounded-xl bg-slate-50 border">
      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">{label}</p>
      <p className={`text-xs font-bold truncate ${isHighlight ? 'text-violet-500' : ''}`}>{value || '-'}</p>
    </div>
  )
}