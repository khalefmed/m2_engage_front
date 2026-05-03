import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { Input } from '../components/common/Input'
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  EnvelopeClosedIcon, 
  ChatBubbleIcon, 
  Pencil1Icon, 
  PaperPlaneIcon,
  Cross2Icon
} from '@radix-ui/react-icons'
import { createCampaign, listCampaigns, sendCampaign, updateCampaign } from '../api/campaigns'
import { listSegments } from '../api/segments'
import type { CampaignItem } from '../types/api'

type CampaignType = 'email' | 'sms'

interface CampaignFormState {
  name: string
  subject: string
  content: string
  segments: number[]
  type: CampaignType
}

const EMPTY_FORM: CampaignFormState = {
  name: '',
  subject: '',
  content: '',
  segments: [],
  type: 'email',
}

function statusVariant(status: string) {
  switch (status) {
    case 'sent': return 'success'
    case 'queued': return 'warning'
    case 'sending': return 'info'
    case 'failed': return 'danger'
    default: return 'default'
  }
}

export function Campaigns() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<CampaignItem | null>(null)
  const [form, setForm] = useState<CampaignFormState>(EMPTY_FORM)

  const campaignsQuery = useQuery({
    queryKey: ['campaigns'],
    queryFn: listCampaigns,
    refetchInterval: (query) => {
      const data = query.state.data
      if (!Array.isArray(data)) return false
      return data.some(c => c.status === 'sending' || c.status === 'queued') ? 3000 : false
    },
  })

  const segmentsQuery = useQuery({
    queryKey: ['segments', 'campaign-form'],
    queryFn: listSegments,
  })

  const createMutation = useMutation({
    mutationFn: createCampaign,
    onSuccess: () => {
      toast.success('Campagne créée.')
      closeModal()
      void queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<CampaignFormState> }) =>
      updateCampaign(id, payload),
    onSuccess: () => {
      toast.success('Campagne mise à jour.')
      closeModal()
      void queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })

  const sendMutation = useMutation({
    mutationFn: sendCampaign,
    onSuccess: (response) => {
      toast.success(response.message || 'Envoi démarré.')
      void queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })

  const campaigns = campaignsQuery.data ?? []
  const filteredCampaigns = campaigns.filter((c) => {
    const term = search.toLowerCase()
    return c.name.toLowerCase().includes(term) || c.subject?.toLowerCase().includes(term)
  })

  function closeModal() {
    setIsModalOpen(false)
    setEditingCampaign(null)
    setForm(EMPTY_FORM)
  }

  function openEditModal(campaign: CampaignItem) {
    setEditingCampaign(campaign)
    setForm({
      name: campaign.name,
      subject: campaign.subject || '',
      content: campaign.content || '',
      segments: campaign.segments || [],
      type: (campaign as any).type || 'email',
    })
    setIsModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.content || form.segments.length === 0) {
      toast.error('Champs obligatoires manquants.')
      return
    }

    const payload = {
      ...form,
      subject: form.type === 'sms' ? `SMS: ${form.name}` : form.subject
    }

    try {
      if (editingCampaign) {
        await updateMutation.mutateAsync({ id: editingCampaign.id, payload })
      } else {
        await createMutation.mutateAsync(payload)
      }
    } catch (error: any) {
      toast.error("Erreur lors de la sauvegarde.")
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10 px-1 sm:px-0">
      {/* Header Responsive */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Campagnes</h1>
          <p className="text-xs sm:text-sm text-slate-500">Diffusez vos messages par Email ou SMS.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto h-11 sm:h-10 bg-violet-600 shadow-lg shadow-violet-500/20">
          <PlusIcon className="mr-2 h-5 w-5" /> Nouvelle campagne
        </Button>
      </div>

      {/* Barre de recherche plein écran sur mobile */}
      <div className="relative group">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
        <Input 
          className="pl-10 h-11 sm:h-10 border-slate-200" 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          placeholder="Rechercher une campagne..." 
        />
      </div>

      <Card className="border-none shadow-elegant bg-white overflow-hidden">
        <CardHeader className="border-b bg-slate-50/50 px-4">
          <CardTitle className="text-base">Flux de communication</CardTitle>
          <CardDescription className="text-xs font-medium uppercase tracking-tighter">Historique des envois</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {campaignsQuery.isLoading && <div className="p-8 text-center animate-pulse text-slate-400">Chargement...</div>}
            
            {filteredCampaigns.map((campaign) => (
              <div key={campaign.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-slate-50 transition-all">
                <div className="flex items-start gap-3">
                  <div className={`mt-1 p-2.5 rounded-xl shrink-0 ${ (campaign as any).type === 'sms' ? 'bg-amber-100 text-amber-600' : 'bg-violet-100 text-violet-600' }`}>
                    {(campaign as any).type === 'sms' ? <ChatBubbleIcon className="h-5 w-5" /> : <EnvelopeClosedIcon className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <span className="font-bold text-sm text-slate-900 truncate max-w-[200px]">{campaign.name}</span>
                      <Badge variant={statusVariant(campaign.status)} className="text-[9px] h-4 px-1.5 uppercase font-black">{campaign.status}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 truncate leading-relaxed">
                      {(campaign as any).type === 'sms' ? campaign.content : campaign.subject}
                    </p>
                  </div>
                </div>

                {/* Boutons d'action adaptés au mobile */}
                <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-none">
                  {campaign.status === 'draft' && (
                    <>
                      <Button variant="ghost" size="sm" className="flex-1 sm:flex-none h-9 text-xs font-bold" onClick={() => openEditModal(campaign)}>
                        <Pencil1Icon className="mr-1.5" /> Modifier
                      </Button>
                      <Button size="sm" className="flex-1 sm:flex-none h-9 text-xs font-bold bg-indigo-500" onClick={() => sendMutation.mutate(campaign.id)}>
                        <PaperPlaneIcon className="mr-1.5" /> Envoyer
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* MODAL / DRAWER RESPONSIVE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-3xl bg-white shadow-2xl border-none rounded-t-[2rem] sm:rounded-3xl overflow-hidden max-h-[95vh] flex flex-col animate-in slide-in-from-bottom duration-300">
            <CardHeader className="border-b p-5 shrink-0 relative">
              <CardTitle className="text-lg">{editingCampaign ? 'Édition' : 'Nouvelle Campagne'}</CardTitle>
              <button onClick={closeModal} className="absolute right-4 top-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full"><Cross2Icon className="h-5 w-5"/></button>
            </CardHeader>
            
            <CardContent className="p-5 overflow-y-auto flex-1">
              <form onSubmit={handleSubmit} className="space-y-6 pb-6">
                
                {/* Sélecteur de canal Large sur mobile */}
                <div className="flex p-1 bg-slate-100 rounded-2xl w-full sm:w-fit">
                  <button
                    type="button"
                    onClick={() => setForm({...form, type: 'email'})}
                    className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${form.type === 'email' ? 'bg-white shadow-sm text-violet-600' : 'text-slate-500'}`}
                  >
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({...form, type: 'sms'})}
                    className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${form.type === 'sms' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500'}`}
                  >
                    SMS
                  </button>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Nom interne</label>
                    <Input className="h-11 rounded-xl" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="ex: Promo Ramadan" />
                  </div>
                  {form.type === 'email' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Objet</label>
                      <Input className="h-11 rounded-xl" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder="Sujet de l'email" />
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    Message {form.type === 'sms' && `(${form.content.length} car.)`}
                  </label>
                  <textarea 
                    className="w-full min-h-[120px] sm:min-h-[150px] p-4 border rounded-2xl text-sm focus:ring-2 focus:ring-violet-500 outline-none resize-none"
                    value={form.content} 
                    onChange={e => setForm({...form, content: e.target.value})} 
                    placeholder={form.type === 'sms' ? "Message SMS..." : "Contenu Email..."}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Segments cibles</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {segmentsQuery.data?.map(s => (
                      <label key={s.id} className={`flex items-center gap-3 p-4 border rounded-2xl cursor-pointer transition-all ${form.segments.includes(s.id) ? 'bg-violet-50 border-violet-200' : 'hover:bg-slate-50'}`}>
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 rounded-lg border-slate-300 text-violet-600 focus:ring-violet-500"
                          checked={form.segments.includes(s.id)}
                          onChange={() => {
                            const next = form.segments.includes(s.id) ? form.segments.filter(id => id !== s.id) : [...form.segments, s.id]
                            setForm({...form, segments: next})
                          }}
                        />
                        <span className="text-sm font-bold">{s.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Footer Modal fixe en bas sur mobile */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  <Button type="button" variant="secondary" className="order-2 sm:order-1 h-11 font-bold" onClick={closeModal}>Annuler</Button>
                  <Button type="submit" className="order-1 sm:order-2 h-11 font-bold bg-violet-600" disabled={updateMutation.isPending || createMutation.isPending}>
                    {editingCampaign ? 'Mettre à jour' : 'Lancer la campagne'}
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