import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { Input } from '../components/common/Input'
import { 
  BarChartIcon, DownloadIcon, TargetIcon, PersonIcon, 
  LightningBoltIcon, LoopIcon, LayersIcon, CalendarIcon,
  RocketIcon, MixIcon, PieChartIcon
} from '@radix-ui/react-icons'
import { getDashboardAnalytics, getKpis } from '../api/analytics'

export function Analytics() {
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [selectedSegment, setSelectedSegment] = useState('all')

  // Requête pour les KPIs (Recalculée selon segment + dates)
  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['analytics-kpis', dateRange, selectedSegment],
    queryFn: () => getKpis({ 
      start_date: dateRange.start, 
      end_date: dateRange.end, 
      segment: selectedSegment 
    })
  })

  // Requête pour les graphiques et listes (Recalculée selon segment + dates)
  const { data: dashboardData, isLoading: statsLoading } = useQuery({
    queryKey: ['analytics-dashboard', dateRange, selectedSegment],
    queryFn: () => getDashboardAnalytics({ 
      start_date: dateRange.start, 
      end_date: dateRange.end, 
      segment: selectedSegment 
    })
  })

const generatePDF = () => {
    const doc = new jsPDF()
    const now = new Date().toLocaleDateString('fr-FR')
    const segmentName = selectedSegment === 'all' 
      ? 'Tous les clients' 
      : dashboardData?.available_segments?.find((s) => s.id.toString() === selectedSegment)?.name || selectedSegment

    // --- EN-TÊTE DESIGN ---
    doc.setFillColor(79, 70, 229) // Violet Indigo
    doc.rect(0, 0, 210, 40, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.text('RAPPORT ANALYTIQUE', 14, 22)
    doc.setFontSize(10)
    doc.text(`Segment : ${segmentName.toUpperCase()}`, 14, 32)
    doc.text(`Généré le : ${now} | Période : ${dateRange.start || 'Début'} au ${dateRange.end || 'Fin'}`, 120, 32)

    // --- SECTION 1 : KPIs DU SEGMENT ---
    doc.setTextColor(30, 41, 59)
    doc.setFontSize(14)
    doc.text('1. Indicateurs Clés (Performance Segment)', 14, 52)
    
    autoTable(doc, {
      startY: 57,
      head: [['Indicateur', 'Valeur Actuelle']],
      body: [
        ['Chiffre d\'Affaires Global', `${kpis?.total_revenue?.toLocaleString()} MRU`],
        ['Panier Moyen', `${kpis?.average_order_value?.toFixed(2)} MRU`],
        ['Taux d\'Activité', `${kpis?.active_customers_rate}%`],
        ['Taux d\'Attrition (Churn)', `${(100 - (kpis?.active_customers_rate || 0)).toFixed(1)}%`],
        ['Volume de Commandes', kpis?.total_orders?.toString() || '0'],
        ['Base Clients Ciblée', kpis?.total_customers?.toString() || '0'],
      ],
      headStyles: { fillColor: [79, 70, 229] }, // Violet
      styles: { cellPadding: 3 }
    })

    // --- SECTION 2 : VENTES CAMPAGNES (POST-CIBLAGE) ---
    let finalY = doc.lastAutoTable.finalY + 15
    doc.setTextColor(30, 41, 59)
    doc.text('2. Impact des Campagnes sur le Segment', 14, finalY)

    const campaignRows = dashboardData?.campaign_performance?.map(camp => [
      camp.name,
      camp.status.toUpperCase(),
      `x${Number(camp.roi).toFixed(1)}`,
      `${Number(camp.revenue).toLocaleString()} MRU`
    ]) || []

    autoTable(doc, {
      startY: finalY + 5,
      head: [['Campagne', 'Statut', 'ROI', 'Revenu']],
      body: campaignRows.length > 0 ? campaignRows : [['Aucune donnée pour ce segment', '-', '-', '-']],
      headStyles: { fillColor: [31, 41, 55] }, // Gris ardoise (comme votre header de carte)
    })

    // --- SECTION 3 : RÉPARTITION GÉOGRAPHIQUE ---
    finalY = doc.lastAutoTable.finalY + 15
    doc.text('3. Analyse Géographique (Top Villes)', 14, finalY)

    const cityRows = dashboardData?.by_city?.map(city => [
      city.city || 'N/A',
      city.value.toString(),
      `${Number(city.revenue).toLocaleString()} MRU`,
      `${((city.revenue / (kpis?.total_revenue || 1)) * 100).toFixed(1)}%`
    ]) || []

    autoTable(doc, {
      startY: finalY + 5,
      head: [['Ville', 'Nombre Clients', 'CA Généré', 'Poids (%)']],
      body: cityRows,
      headStyles: { fillColor: [16, 185, 129] }, // Vert émeraude (positif)
    })

    // --- PIED DE PAGE ---
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150)
      doc.text(`Rapport Analytique - Page ${i} sur ${pageCount}`, 105, 285, { align: 'center' })
    }

    doc.save(`Rapport_${segmentName.replace(/\s+/g, '_')}_${now.replace(/\//g, '-')}.pdf`)
  }

  if (kpisLoading || statsLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-600 border-t-transparent" />
          <p className="text-slate-500 font-medium">Analyse dynamique des segments...</p>
        </div>
      </div>
    )
  }

  const churnRate = 100 - (kpis?.active_customers_rate ?? 0)

  return (
    <div className="space-y-8 animate-fade-in pb-10 text-slate-900 dark:text-white">
      
      {/* HEADER AVEC FILTRES */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6 dark:border-white/10">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm italic font-medium">
            Filtre actif : {selectedSegment === 'all' ? 'Base globale' : 'Segment personnalisé'}
          </p>
        </div>
        <div className="flex gap-3">
           <Button onClick={generatePDF} className="gap-2 bg-violet-600 hover:bg-violet-700 shadow-lg">
             <DownloadIcon /> Exporter
           </Button>
        </div>
      </div>

      {/* BARRE DE FILTRES INTELLIGENTE */}
      <Card className="border-none shadow-sm bg-slate-50/50 dark:bg-white/5 backdrop-blur-sm border-l-4 border-l-violet-500">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="text-violet-500 w-4 h-4" />
              <Input 
                type="date" 
                className="w-32 h-8 text-[10px] font-bold"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({...prev, start: e.target.value}))}
              />
              <span className="text-slate-400 font-bold">→</span>
              <Input 
                type="date" 
                className="w-32 h-8 text-[10px] font-bold"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({...prev, end: e.target.value}))}
              />
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-white/10" />
            <div className="flex items-center gap-2">
              <MixIcon className="text-violet-500 w-4 h-4" />
              <select 
                className="bg-transparent text-[11px] font-black uppercase outline-none border-b-2 border-violet-500 pb-1 px-2"
                value={selectedSegment}
                onChange={(e) => setSelectedSegment(e.target.value)}
              >
                <option value="all">Tous les Clients</option>
                {dashboardData?.available_segments?.map((seg) => (
                  <option key={seg.id} value={seg.id}>SEGMENT : {seg.name}</option>
                ))}
              </select>
            </div>
          </div>
          <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
            {kpis?.total_customers} clients ciblés
          </Badge>
        </CardContent>
      </Card>

      {/* RÉCAPITULATIF COMPARATIF DES SEGMENTS */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-4 lg:grid-cols-5">
         {dashboardData?.all_segments_summary?.map((seg, i) => (
           <div key={i} className="bg-white dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/10 flex flex-col justify-between shadow-sm">
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">{seg.name}</p>
              <div>
                <p className="text-lg font-bold text-violet-600">{Number(seg.revenue).toLocaleString()} MRU</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[10px] text-slate-500">{seg.count} clients</span>
                </div>
              </div>
           </div>
         ))}
      </div>

      {/* KPIs RÉELS DU SEGMENT */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Revenu Segment" value={`${kpis?.total_revenue?.toLocaleString()} MRU`} sub="Période sélectionnée" icon={<LightningBoltIcon className="text-amber-500" />} />
        <StatCard title="Panier Moyen" value={`${kpis?.average_order_value?.toFixed(1)} MRU`} sub="Propre au segment" icon={<BarChartIcon className="text-violet-500" />} />
        <StatCard title="Taux d'Activité" value={`${kpis?.active_customers_rate}%`} sub="Interaction segment" icon={<LoopIcon className="text-blue-500" />} />
        <StatCard title="Attrition Segment" value={`${churnRate.toFixed(1)}%`} sub="Taux de désengagement" icon={<PersonIcon className="text-rose-500" />} trend="down" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* PERFORMANCE CAMPAGNES FILTRÉES */}
        <Card className="lg:col-span-2 border-none shadow-elegant overflow-hidden">
          <CardHeader className="bg-slate-50/50 dark:bg-white/5 border-b dark:border-white/5">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <RocketIcon className="text-violet-500" /> Ventes Campagnes (Post-Ciblage)
            </CardTitle>
            <CardDescription className="text-[10px]">Revenu généré par les clients du segment ciblés par ces campagnes</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y dark:divide-white/5">
              {dashboardData?.campaign_performance?.length > 0 ? (
                dashboardData.campaign_performance.map((camp, i) => (
                  <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                    <div className="space-y-1">
                      <p className="text-xs font-black uppercase tracking-tight">{camp.name}</p>
                      <Badge variant="outline" className="text-[8px] uppercase font-mono">{camp.status}</Badge>
                    </div>
                    <div className="flex gap-8 items-center">
                      <div className="text-right">
                        <p className="text-xs font-bold text-emerald-500">ROI x{Number(camp.roi).toFixed(1)}</p>
                        <p className="text-[10px] font-mono text-slate-400">{Number(camp.revenue || 0).toLocaleString()} MRU</p>
                      </div>
                      <div className="w-16 h-1 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-500" style={{ width: `${Math.min(camp.roi * 10, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-slate-400 text-xs italic">Aucune donnée sur cette sélection.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* INSIGHTS RÉELS */}
        {/* <Card className="bg-violet-600 text-white border-none shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <PieChartIcon width={120} height={120} />
          </div>
          <CardHeader>
            <CardTitle className="text-white text-md">Analyse Prédictive</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 space-y-4">
            <p className="text-sm font-medium leading-relaxed">
              Le segment <span className="font-black underline">{selectedSegment === 'all' ? 'Global' : 'Sélectionné'}</span> 
              génère un panier moyen <span className="font-black text-amber-300">
              {kpis?.average_order_value > 500 ? 'Élevé' : 'Standard'}</span> par rapport à la moyenne annuelle.
            </p>
            <div className="p-4 bg-black/20 rounded-xl border border-white/10 text-[11px] space-y-2">
              <p>📍 <strong>Localisation :</strong> {dashboardData?.by_city?.[0]?.city || 'N/A'} est la ville la plus rentable pour ce groupe.</p>
              <p>🔄 <strong>Fidélité :</strong> {kpis?.retention_rate}% des clients ont commandé plus d'une fois.</p>
            </div>
            <Button variant="secondary" className="w-full text-violet-700 font-black text-[10px] uppercase h-10 shadow-lg">
              Exporter vers CRM
            </Button>
          </CardContent>
        </Card> */}
      </div>

      {/* TOP VILLES POUR LE SEGMENT */}
      <Card className="border-none shadow-elegant overflow-hidden">
        <CardHeader className="bg-slate-50/50 dark:bg-white/5 border-b dark:border-white/10">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <LayersIcon className="text-violet-500" /> Répartition Géographique du Segment
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-slate-400 border-b dark:border-white/10">
                <th className="px-6 py-4">Ville</th>
                <th className="px-6 py-4 text-center">Nombre de Clients</th>
                <th className="px-6 py-4 text-right">CA Généré (MRU)</th>
                <th className="px-6 py-4 text-right">Poids (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-white/5 text-sm font-medium">
              {dashboardData?.by_city?.map((city, i) => (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-bold">{city.city || 'Non renseigné'}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-slate-100 dark:bg-white/10 px-2 py-1 rounded text-[10px]">{city.value}</span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-emerald-600">
                    {Number(city.revenue || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-xs text-slate-400">
                    {((city.revenue / (kpis?.total_revenue || 1)) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ title, value, sub, icon, trend = "up" }) {
  return (
    <Card className="border-none shadow-sm bg-white dark:bg-white/5 transition-transform hover:scale-[1.02]">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10">
            {icon}
          </div>
          <Badge className={`text-[9px] font-black border-none ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
            {trend === 'up' ? 'QUALIFIÉ' : 'CONTRÔLE'}
          </Badge>
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
        <p className="text-2xl font-black mt-1 tracking-tight">{value}</p>
        <p className="text-[10px] text-slate-400 mt-1 font-medium">{sub}</p>
      </CardContent>
    </Card>
  )
}