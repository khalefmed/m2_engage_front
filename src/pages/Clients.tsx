import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
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
  ChevronRightIcon
} from '@radix-ui/react-icons'
import { getClientById, listClients, getMapStats } from '../api/clients'

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
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list')
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null)

  // 1. Liste des clients
  const { data, isLoading } = useQuery({
    queryKey: ['clients', page, search],
    queryFn: () => listClients({ page, search }),
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

  return (
    <div className="space-y-6 animate-fade-in pb-10 text-slate-900 dark:text-white">
      {/* HEADER RESPONSIVE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">Gestion et cartographie de la base.</p>
        </div>
        
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl border dark:border-white/10 shrink-0">
            <Button 
              variant={activeTab === 'list' ? 'default' : 'ghost'} 
              size="sm" 
              className="h-8 px-3 text-xs"
              onClick={() => setActiveTab('list')}
            >
              <ViewHorizontalIcon className="mr-2" /> Liste
            </Button>
            <Button 
              variant={activeTab === 'map' ? 'default' : 'ghost'} 
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => setActiveTab('map')}
            >
              <GlobeIcon className="mr-2" /> Carte
            </Button>
          </div>
          <Badge variant="info" className="text-[10px] px-2 py-1">
            {data?.count ?? 0} au total
          </Badge>
        </div>
      </div>

      {activeTab === 'list' ? (
        <Card className="border-none shadow-elegant overflow-hidden bg-white dark:bg-white/5">
          <CardHeader className="px-4 py-5 border-b dark:border-white/5 bg-slate-50/30 dark:bg-transparent">
            <div className="flex flex-col gap-4">
              <CardTitle className="text-lg">Base de données</CardTitle>
              <form
                className="relative flex w-full gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  setPage(1)
                  setSearch(searchInput.trim())
                }}
              >
                <div className="relative flex-1 group">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                  <Input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Nom, email, ville..."
                    className="pl-9 h-10 border-slate-200 dark:border-white/10 bg-white dark:bg-transparent"
                  />
                </div>
                <Button type="submit" variant="secondary" className="h-10 px-4 font-bold text-xs uppercase tracking-widest">
                  Filtrer
                </Button>
              </form>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="divide-y dark:divide-white/5">
              {isLoading ? (
                <div className="p-12 text-center animate-pulse text-slate-400 font-medium">Chargement des profils...</div>
              ) : data?.results.map((client) => (
                <div 
                  key={client.id} 
                  className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                  onClick={() => setSelectedClientId(client.id)}
                >
                  <div className="min-w-0 pr-4">
                    <p className="text-sm font-bold truncate group-hover:text-violet-600 transition-colors">
                      {client.first_name} {(client as any).last_name || ''}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{client.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="default" className="hidden sm:inline-flex text-[10px] bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300 border-none font-bold">
                      {client.city}
                    </Badge>
                    <Button variant="secondary" size="sm" className="h-8 w-8 p-0 sm:w-auto sm:px-3">
                      <ChevronRightIcon className="sm:hidden" />
                      <span className="hidden sm:inline text-xs">Voir profil</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINATION */}
            <div className="p-4 bg-slate-50/50 dark:bg-white/5 flex items-center justify-between border-t dark:border-white/10">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setPage((p) => Math.max(1, p - 1))} 
                disabled={page === 1}
                className="text-[10px] font-bold uppercase tracking-widest"
              >
                <ChevronLeftIcon className="mr-1" /> Précédent
              </Button>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page {page}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setPage((p) => p + 1)} 
                disabled={!data?.next}
                className="text-[10px] font-bold uppercase tracking-widest"
              >
                Suivant <ChevronRightIcon className="ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden border-none shadow-elegant rounded-2xl bg-white dark:bg-white/5">
          <CardContent className="p-0">
            <div className="h-[500px] sm:h-[650px] w-full relative">
              <MapContainer 
                center={[18.5, -12.5]} 
                zoom={6}
                style={{ height: '100%', width: '100%', background: '#0f172a' }}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; CARTO'
                />
                {mapData && Object.entries(CITY_COORDS).map(([cityName, coords]) => {
                    const count = mapData[cityName] || 0
                    if (count === 0) return null
                    return (
                      <CircleMarker 
                        key={cityName}
                        center={coords}
                        radius={15 + Math.sqrt(count) * 1.5}
                        pathOptions={{ 
                          color: '#8b5cf6', 
                          fillColor: '#8b5cf6', 
                          fillOpacity: 0.4, 
                          weight: 2 
                        }}
                      >
                        <Tooltip permanent direction="center" className="custom-map-label border-none bg-transparent shadow-none">
                          <span className="font-black text-[12px] text-white drop-shadow-lg">{count}</span>
                        </Tooltip>
                        <Popup>
                          <div className="p-1 text-center">
                            <p className="font-bold text-violet-600">{cityName}</p>
                            <p className="text-xs text-slate-500 font-bold">{count} clients inscrits</p>
                          </div>
                        </Popup>
                      </CircleMarker>
                    )
                  })}
              </MapContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* MODAL / DRAWER PROFIL */}
      {selectedClientId !== null && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-xl bg-white dark:bg-[#0b0b13] shadow-2xl border-none rounded-t-[2.5rem] sm:rounded-3xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            <CardHeader className="bg-slate-50/50 dark:bg-white/5 border-b dark:border-white/10 p-6 relative">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
                  <ViewHorizontalIcon className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black tracking-tight">Fiche Client</CardTitle>
                  <CardDescription className="font-bold uppercase text-[10px] tracking-widest text-violet-500">Dossier #{selectedClientId}</CardDescription>
                </div>
              </div>
              <button 
                onClick={() => setSelectedClientId(null)}
                className="absolute right-6 top-6 p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"
              >
                <Cross2Icon className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {isDetailsLoading ? (
                <div className="py-12 text-center animate-pulse text-slate-400 font-bold">Récupération des données...</div>
              ) : clientDetails && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <DetailBox label="Prénom" value={clientDetails.first_name} />
                  <DetailBox label="Nom" value={(clientDetails as any).last_name} />
                  <div className="sm:col-span-2">
                    <DetailBox label="Adresse Email" value={clientDetails.email} isHighlight />
                  </div>
                  <DetailBox label="Ville de résidence" value={clientDetails.city} />
                  <DetailBox label="Membre depuis" value={formatDate(clientDetails.created_at)} />
                  
                  <div className="flex gap-3 pt-4 sm:col-span-2 border-t dark:border-white/5 mt-2">
                    <Button variant="secondary" className="flex-1 font-bold h-11" onClick={() => setSelectedClientId(null)}>
                      Fermer
                    </Button>
                    {/* <Button className="flex-1 bg-violet-600 hover:bg-violet-700 font-bold h-11 shadow-lg shadow-violet-500/20">
                      Envoyer Message
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
function DetailBox({ label, value, isHighlight }: { label: string, value?: string, isHighlight?: boolean }) {
  return (
    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-violet-500/30 transition-colors">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{label}</p>
      <p className={`text-sm font-bold ${isHighlight ? 'text-violet-600 dark:text-violet-400' : 'text-slate-900 dark:text-white'}`}>
        {value || '-'}
      </p>
    </div>
  )
}