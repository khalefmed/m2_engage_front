import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { Input } from '../components/common/Input'
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  TrashIcon, 
  Pencil1Icon, 
  TargetIcon, 
  PersonIcon, 
  MixerHorizontalIcon,
  CalendarIcon,
  Cross1Icon,
  InfoCircledIcon
} from '@radix-ui/react-icons'
import { createSegment, deleteSegment, listSegments, updateSegment } from '../api/segments'
import type { SegmentItem, SegmentRules } from '../types/api'

// --- TYPES & ETATS ---
interface SegmentFormState {
  name: string
  city: string
  country: string
  gender: '' | 'M' | 'F' | 'O'
  minAge: string
  maxAge: string
  lastPurchaseDaysGt: string
}

const EMPTY_FORM: SegmentFormState = {
  name: '',
  city: '',
  country: '',
  gender: '',
  minAge: '',
  maxAge: '',
  lastPurchaseDaysGt: '',
}

// --- HELPERS UI ---
function rulesToBadges(rules: SegmentRules) {
  if (!rules || Object.keys(rules).length === 0) return <Badge variant="default">Libre</Badge>
  const badges = []
  if (rules.city) badges.push(<Badge key="city" className="bg-blue-500/10 text-blue-600 border-none">{rules.city}</Badge>)
  if (rules.gender) badges.push(<Badge key="gender" className="bg-rose-500/10 text-rose-600 border-none">Genre: {rules.gender}</Badge>)
  if (rules.last_purchase_days_gt) badges.push(<Badge key="days" className="bg-amber-500/10 text-amber-600 border-none">{rules.last_purchase_days_gt}j+ inactif</Badge>)
  if (rules.min_age || rules.max_age) badges.push(<Badge key="age" className="bg-violet-500/10 text-violet-600 border-none">Âge: {rules.min_age ?? 0}-{rules.max_age ?? '∞'}</Badge>)
  return <div className="flex flex-wrap gap-1.5">{badges}</div>
}

export function Segments() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [form, setForm] = useState<SegmentFormState>(EMPTY_FORM)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSegment, setEditingSegment] = useState<SegmentItem | null>(null)

  const { data: segments = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['segments'],
    queryFn: listSegments,
  })

  // --- MUTATIONS ---
  const createMutation = useMutation({
    mutationFn: createSegment,
    onSuccess: () => {
      toast.success('Segment créé avec succès')
      setIsModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['segments'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { name: string; rules: SegmentRules } }) =>
      updateSegment(id, payload),
    onSuccess: () => {
      toast.success('Segment mis à jour')
      setIsModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['segments'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteSegment,
    onSuccess: () => {
      toast.success('Segment supprimé')
      queryClient.invalidateQueries({ queryKey: ['segments'] })
    },
  })

  // --- LOGIQUE FILTRES ---
  const filteredSegments = useMemo(() => {
    return segments.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
  }, [segments, search])

  const totalCustomers = segments.reduce((acc, s) => acc + s.customer_count, 0)

  // --- HANDLERS ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      name: form.name.trim(),
      rules: {
        city: form.city || undefined,
        gender: form.gender || undefined,
        min_age: form.minAge ? Number(form.minAge) : undefined,
        max_age: form.maxAge ? Number(form.maxAge) : undefined,
        last_purchase_days_gt: form.lastPurchaseDaysGt ? Number(form.lastPurchaseDaysGt) : undefined,
      } as SegmentRules,
    }

    if (editingSegment) {
      await updateMutation.mutateAsync({ id: editingSegment.id, payload })
    } else {
      await createMutation.mutateAsync(payload)
    }
  }

  const handleDelete = async (segment: SegmentItem) => {
    if (window.confirm(`Supprimer "${segment.name}" ?`)) {
      await deleteMutation.mutateAsync(segment.id)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10 text-slate-900">
      {/* Header Statistique */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Segmentation</h1>
          <p className="text-sm text-slate-500">Gérez vos audiences dynamiques pour le ciblage.</p>
        </div>
        <Button className="gap-2 bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-500/20" onClick={() => { setEditingSegment(null); setForm(EMPTY_FORM); setIsModalOpen(true); }}>
          <PlusIcon className="w-5 h-5" /> Nouveau Segment
        </Button>
      </div>

      {/* Cartes KPI Flashy */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Segments" value={segments.length} icon={<TargetIcon className="text-violet-500" />} />
        <StatCard title="Audience Totale" value={totalCustomers.toLocaleString()} icon={<PersonIcon className="text-blue-500" />} />
        <StatCard title="Moyenne / Segment" value={Math.round(totalCustomers / (segments.length || 1))} icon={<MixerHorizontalIcon className="text-emerald-500" />} />
      </div>

      {/* Barre de Recherche épurée */}
      <div className="relative group max-w-md">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
        <Input 
          className="pl-11 h-11 bg-white border-none shadow-sm focus:ring-2 ring-violet-500/20"
          placeholder="Rechercher une audience..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grille de Cartes d'Audiences */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          <p className="text-slate-500 animate-pulse">Chargement des segments...</p>
        ) : filteredSegments.map((segment) => (
          <Card key={segment.id} className="border-none shadow-elegant bg-white group hover:ring-2 ring-violet-500/20 transition-all">
            <CardHeader className="pb-3 border-b">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-base font-bold truncate pr-4">{segment.name}</CardTitle>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                    <CalendarIcon /> Créé par {segment.created_by}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 font-bold text-xs">
                  {segment.customer_count}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-5 space-y-5">
              <div className="min-h-[60px]">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Critères de ciblage</p>
                {rulesToBadges(segment.rules)}
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-1 text-[10px] text-slate-400 italic">
                  <InfoCircledIcon /> Audience dynamique
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:text-blue-500" onClick={() => {
                    setEditingSegment(segment);
                    setForm({
                      name: segment.name,
                      city: segment.rules.city || '',
                      country: segment.rules.country || '',
                      gender: (segment.rules.gender as any) || '',
                      minAge: segment.rules.min_age?.toString() || '',
                      maxAge: segment.rules.max_age?.toString() || '',
                      lastPurchaseDaysGt: segment.rules.last_purchase_days_gt?.toString() || '',
                    });
                    setIsModalOpen(true);
                  }}>
                    <Pencil1Icon />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:text-rose-500" onClick={() => handleDelete(segment)}>
                    <TrashIcon />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal - Look Premium */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-xl bg-white border-none shadow-2xl overflow-hidden">
            <CardHeader className="bg-slate-50 border-b relative">
              <CardTitle>{editingSegment ? 'Modifier l\'audience' : 'Nouveau Segment'}</CardTitle>
              <CardDescription>L'audience se mettra à jour automatiquement selon ces règles.</CardDescription>
              <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors">
                <Cross1Icon />
              </button>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Nom de l'audience</label>
                  <Input 
                    value={form.name} 
                    onChange={(e) => setForm(f => ({...f, name: e.target.value}))}
                    placeholder="Ex: Clients Inactifs - Nouadhibou" 
                    required 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormInput label="Ville" placeholder="Nouakchott" value={form.city} onChange={(v : any) => setForm(f => ({...f, city: v}))} />
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Genre</label>
                    <select 
                      value={form.gender} 
                      onChange={(e) => setForm(f => ({...f, gender: e.target.value as any}))}
                      className="w-full h-10 px-3 rounded-lg border border-slate-100 bg-transparent text-sm"
                    >
                      <option value="">Tous</option>
                      <option value="M">Hommes</option>
                      <option value="F">Femmes</option>
                    </select>
                  </div>
                  <FormInput label="Âge Min" type="number" value={form.minAge} onChange={(v : any) => setForm(f => ({...f, minAge: v}))} />
                  <FormInput label="Âge Max" type="number" value={form.maxAge} onChange={(v : any) => setForm(f => ({...f, maxAge: v}))} />
                  <div className="col-span-2">
                     <FormInput label="Inactivité (jours >)" type="number" value={form.lastPurchaseDaysGt} onChange={(v : any) => setForm(f => ({...f, lastPurchaseDaysGt: v}))} placeholder="Ex: 30" />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsModalOpen(false)}>Annuler</Button>
                  <Button type="submit" className="flex-1 bg-violet-600 hover:bg-violet-700" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingSegment ? 'Sauvegarder' : 'Créer l\'audience'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// --- SOUS-COMPOSANTS ---
function StatCard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
  return (
    <Card className="border-none shadow-sm bg-white">
      <CardContent className="p-5 flex items-center gap-4">
        <div className="p-3 bg-slate-50 rounded-2xl">{icon}</div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
          <p className="text-2xl font-black tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function FormInput({ label, type = "text", placeholder, value, onChange }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</label>
      <Input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="h-10" />
    </div>
  )
}