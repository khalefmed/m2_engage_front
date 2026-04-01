import { useQuery } from '@tanstack/react-query'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { 
  BarChartIcon, ArrowUpIcon, ArrowDownIcon, 
  DownloadIcon, TargetIcon, PersonIcon, 
  LightningBoltIcon, LoopIcon, LayersIcon 
} from '@radix-ui/react-icons'
import { getDashboardAnalytics, getKpis } from '../api/analytics'

export function Analytics() {
  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['analytics-kpis'],
    queryFn: getKpis
  })

  const { data: dashboardData, isLoading: statsLoading } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: getDashboardAnalytics
  })

  // --- LOGIQUE GÉNÉRATION PDF ---
  const generatePDF = () => {
    const doc = new jsPDF()
    const now = new Date().toLocaleDateString('fr-FR')

    // Design du Header
    doc.setFillColor(79, 70, 229) // Violet Indigo
    doc.rect(0, 0, 210, 40, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.text('RAPPORT ANALYTIQUE', 14, 22)
    doc.setFontSize(10)
    doc.text(`Généré le : ${now} | Confidentialité : Haute`, 14, 32)

    // Section KPIs
    doc.setTextColor(40, 40, 40)
    doc.setFontSize(14)
    doc.text('Indicateurs Clés de Performance', 14, 55)
    
    autoTable(doc, {
      startY: 60,
      head: [['Indicateur', 'Valeur', 'Description']],
      body: [
        ['Revenu Global', `${kpis?.total_revenue?.toLocaleString()} MRU`, 'Chiffre d\'affaires total'],
        ['Panier Moyen', `${kpis?.average_order_value} MRU`, 'Moyenne par commande'],
        ['Taux de Réachat', `${kpis?.retention_rate}%`, 'Fidélité client'],
        ['Taux d\'Activité', `${kpis?.active_customers_rate}%`, 'Clients actifs (30j)'],
      ],
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] }
    })

    // Section Géographique
    doc.text('Analyse Géographique & Rentabilité', 14, doc.lastAutoTable.finalY + 15)
    
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Ville', 'Volume Clients', 'Revenu Total (MRU)']],
      body: dashboardData?.by_city?.map(city => [
        city.city,
        city.value.toString(),
        city.revenue?.toLocaleString()
      ]) || [],
      headStyles: { fillColor: [30, 41, 59] } // Slate
    })

    // Footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150)
      doc.text(`Page ${i} sur ${pageCount} - Votre Dashboard Analytics`, 105, 285, { align: 'center' })
    }

    doc.save(`Rapport_Business_${now.replace(/\//g, '-')}.pdf`)
  }

  if (kpisLoading || statsLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-600 border-t-transparent" />
          <p className="text-slate-500 font-medium">Analyse des données...</p>
        </div>
      </div>
    )
  }

  const churnRate = 100 - (kpis?.active_customers_rate ?? 0)

  return (
    <div className="space-y-8 animate-fade-in pb-10 text-slate-900 dark:text-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6 dark:border-white/10">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Analytics</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Analyse de la rentabilité et segmentation.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right mr-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Croissance</p>
            <p className="text-lg font-bold text-emerald-500">+{kpis?.growth_rate ?? 0}%</p>
          </div>
          {/* BOUTON PDF ACTIVÉ */}
          <Button onClick={generatePDF} variant="default" className="gap-2 shadow-lg bg-violet-600 hover:bg-violet-700">
            <DownloadIcon className="h-4 w-4" /> Export Rapport PDF
          </Button>
        </div>
      </div>

      {/* Cartes de Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Revenu Global" value={`${kpis?.total_revenue.toFixed(1)?.toLocaleString()} MRU`} sub="CA Total" icon={<LightningBoltIcon className="text-amber-500" />} />
        <StatCard title="Panier Moyen" value={`${kpis?.average_order_value.toFixed(1)} MRU`} sub="Moyenne" icon={<BarChartIcon className="text-violet-500" />} />
        <StatCard title="Réachat" value={`${kpis?.retention_rate}%`} sub="Fidélité" icon={<LoopIcon className="text-blue-500" />} />
        <StatCard title="Attrition" value={`${churnRate.toFixed(1)}%`} sub="Perte" icon={<PersonIcon className="text-rose-500" />} trend="down" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Segmentation */}
        <Card className="border-none shadow-elegant">
          <CardHeader>
            <CardTitle className="text-md flex items-center gap-2">
              <TargetIcon /> État de la Base
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {dashboardData?.customer_segments?.map((seg, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                  <span>{seg.segment}</span>
                  <span className="text-slate-400">{seg.percentage}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-violet-500' : 'bg-rose-400'}`} 
                    style={{ width: `${seg.percentage}%` }} 
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Catégories */}
        <Card className="border-none shadow-elegant">
          <CardHeader>
            <CardTitle className="text-md flex items-center gap-2">
              <LayersIcon /> Revenu par Catégorie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {dashboardData?.category_performance?.map((cat, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-28 text-[11px] font-bold truncate uppercase text-slate-500">{cat.product__category}</div>
                <div className="flex-1 h-3 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500" 
                    style={{ width: `${(cat.revenue / (Math.max(...dashboardData.category_performance.map(c => c.revenue)) || 1)) * 100}%` }} 
                  />
                </div>
                <div className="text-[11px] font-bold font-mono">{cat.revenue?.toLocaleString()}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Tableau Géographique */}
      <Card className="border-none shadow-elegant overflow-hidden">
        <CardHeader className="bg-slate-50/50 dark:bg-white/5 border-b dark:border-white/5">
          <CardTitle className="text-md">Performance Géographique</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto text-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-slate-400 border-b dark:border-white/10">
                  <th className="px-6 py-4 font-bold">Ville</th>
                  <th className="px-6 py-4 font-bold text-center">Volume Clients</th>
                  <th className="px-6 py-4 font-bold text-right">Revenu (MRU)</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-white/5">
                {dashboardData?.by_city?.map((city, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-white/5">
                    <td className="px-6 py-4 font-bold">{city.city}</td>
                    <td className="px-6 py-4 text-center">{city.value}</td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-emerald-600">
                      {city.revenue?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ title, value, sub, icon, trend = "up" }: any) {
  return (
    <Card className="border-none shadow-sm bg-white dark:bg-white/5">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
            {icon}
          </div>
          <Badge className={`text-[9px] font-black tracking-tighter border-none ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
            {trend === 'up' ? 'OPT' : 'LOW'}
          </Badge>
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
        <p className="text-2xl font-black mt-1">{value}</p>
        <p className="text-[10px] text-slate-400 mt-1 italic">{sub}</p>
      </CardContent>
    </Card>
  )
}