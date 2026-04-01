import { Link } from 'react-router-dom'
import { Badge } from '../components/common/Badge'
import { buttonVariants } from '../components/common/Button'
import { Card, CardContent } from '../components/common/Card'
import { cn } from '../utils/cn'

const features = [
  {
    title: 'Segmentation prédictive',
    description: 'Ciblez vos clients selon leur localisation, comportement d’achat et potentiel de fidélisation en temps réel.',
  },
  {
    title: 'Automation intelligente',
    description: 'Déclenchez des scénarios personnalisés au moment précis où vos clients sont les plus réceptifs.',
  },
  {
    title: 'Analyse de conversion',
    description: 'Mesurez l’impact direct de chaque message sur votre chiffre d’affaires et l’engagement global.',
  },
  {
    title: 'Hub de communication',
    description: 'Centralisez vos envois Email, SMS et notifications Push depuis une interface unique et fluide.',
  },
]

const workflow = [
  {
    step: '01',
    title: 'Unifier la donnée',
    description: 'Connectez vos sources de données pour obtenir une vision client à 360° sans effort.',
  },
  {
    step: '02',
    title: 'Segmenter & Cibler',
    description: 'Créez des groupes d’audience ultra-précis basés sur des critères démographiques et comportementaux.',
  },
  {
    step: '03',
    title: 'Activer la croissance',
    description: 'Lancez vos campagnes et optimisez vos performances grâce à nos indicateurs décisionnels.',
  },
]

const useCases = [
  // Basé sur 'by_city' et 'active_customers_rate'
  'Ciblage des campagnes de réactivation pour les clients inactifs',
  
  // Basé sur 'customer_segments' (Fidèles)
  'Mise en place d\'offres privilèges pour le segment "Fidèles"',
  
  // Basé sur 'category_performance' et 'average_order_value'
  'Analyse de la rentabilité par catégorie de produit pour optimiser les stocks prioritaires',
  
  // Basé sur 'peak_shopping_hours'
  'Planification des envois marketing (SMS/Emails) durant les pics d\'activité constatés',
  
  // Basé sur 'retention_rate' et 'churnRate'
  'Réduction du taux d\'attrition par l\'identification précoce des clients "À Risque"',
]

const contactItems = [
  { label: 'Email', value: 'contact@m2engage.com' },
  { label: 'Mobile', value: '+222 44 30 20 57' },
  { label: 'Siège', value: 'Nouakchott, Mauritanie' },
]

const pricingPlans = [
  {
    name: 'Mensuel',
    price: '9 900',
    unit: 'MRU/mois',
    description: 'Idéal pour tester la puissance de la segmentation sur vos premières campagnes.',
    features: ['Jusqu’à 5 000 contacts', 'Canaux SMS & Email', 'Support standard'],
    cta: 'Démarrer le mois',
    highlight: false
  },
  {
    name: 'Annuel',
    price: '99 000',
    unit: 'MRU/an',
    description: 'La solution complète pour une stratégie marketing durable et performante.',
    features: ['Contacts illimités', 'Omnicanalité complète', 'Analytique avancée', '2 mois offerts'],
    cta: 'Choisir l’annuel',
    highlight: true
  },
  {
    name: 'Sur-mesure',
    price: 'Contact',
    unit: '',
    description: 'Besoin de déploiements spécifiques ou d’un accompagnement dédié ?',
    features: ['Infrastructure dédiée', 'API personnalisée', 'Account Manager dédié'],
    cta: 'Discuter avec nous',
    highlight: false
  }
]

export function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.06),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(147,51,234,0.06),transparent_30%)]" />

      <header className="mx-auto flex w-full max-w-[1320px] items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        {/* <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-sm font-black text-white shadow-lg shadow-indigo-200">
            M2
          </div>
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-900">M2 Engage</p>
            <p className="text-[10px] uppercase tracking-[0.4em] text-indigo-600 font-semibold">Marketing</p>
          </div>
        </div> */}
        <img src="../logo.png" className='h-12'  alt="" />

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-500 lg:flex">
          <a href="#main" className="transition hover:text-indigo-600">Acceuil</a>
          <a href="#services" className="transition hover:text-indigo-600">Solutions</a>
          <a href="#features" className="transition hover:text-indigo-600">Fonctionnalités</a>
          <a href="#pricing" className="transition hover:text-indigo-600">Tarifs</a>
          <a href="#contact" className="transition hover:text-indigo-600">Contact</a>
        </nav>

        <Link to="/login" className={cn(buttonVariants({ variant: 'secondary' }), 'hidden sm:inline-flex border-slate-200 bg-white hover:bg-slate-50')}>
          Connexion
        </Link>
      </header>

      <main id='main' className="mx-auto flex w-full max-w-[1320px] flex-col gap-24 px-4 pb-24 pt-14 sm:px-6 lg:px-8">
        {/* HERO SECTION - (Identique à ton code) */}
        <section className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-8">
            <Badge variant="default" className="bg-indigo-50 text-indigo-700 border-indigo-100 px-4 py-1">
              CRM & Marketing Automation
            </Badge>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl leading-[1.15]">
                Une plateforme intuitive pour segmenter, engager et mesurer vos performances.
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-slate-600">
                M2 Engage permet aux entreprises de transformer leurs données clients en leviers de croissance concrets grâce à une segmentation dynamique et des campagnes multicanales.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/app/dashboard" className={cn(buttonVariants(), 'h-11 px-6 bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100')}>
                Lancer l'application
              </Link>
              <a href="#contact" className={cn(buttonVariants({ variant: 'secondary' }), 'h-11 px-6 border-slate-200 bg-white')}>
                Demander une démo
              </a>
            </div>
          </div>

          <Card className="border border-slate-200 bg-white/80 backdrop-blur-sm shadow-xl ring-1 ring-slate-900/5">
            <CardContent className="space-y-7 p-9">
              <div className="space-y-2 border-b border-slate-100 pb-6">
                <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-500 font-bold">Aperçu Dashboard</p>
                <p className="text-2xl font-bold tracking-tight text-slate-900">Le moteur de votre activation client.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                    {label: 'Canaux', val: 'Email, SMS, Push'},
                    {label: 'Audience', val: 'Segments Dynamiques'},
                    {label: 'Pilotage', val: 'KPIs & Conversion'},
                    {label: 'Vitesse', val: 'Envois Instantanés'}
                ].map((item) => (
                    <div key={item.label} className="rounded-2xl bg-slate-50 p-4 border border-slate-100/50">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400 font-bold">{item.label}</p>
                        <p className="mt-2 text-sm font-bold text-indigo-600">{item.val}</p>
                    </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        

        {/* SECTION FEATURES (Garder ton code d'origine) */}
        <section id="services" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="border border-slate-100 bg-white transition-all hover:shadow-md">
                <CardContent className="space-y-5 p-7">
                  <div className="h-1.5 w-8 rounded-full bg-indigo-500" />
                  <h3 className="text-lg font-bold text-slate-900">{feature.title}</h3>
                  <p className="text-sm leading-7 text-slate-500">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
        </section>

        {/* SECTION PROCESSUS - (Garder ton code d'origine) */}
        <section id='features'  className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
          <Card className="border-none bg-indigo-700 text-white shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 blur-3xl" />
            <CardContent className="space-y-6 p-10">
              <Badge variant="default" className="bg-white/10 text-indigo-200 border-none ring-0">Processus</Badge>
              <h2 className="text-3xl font-bold tracking-tight">Une boucle d'exécution fluide.</h2>
              <div className="grid gap-4">
                {workflow.map((item) => (
                  <div key={item.step} className="flex gap-5 items-start rounded-2xl border border-slate-50/20 bg-white/[0.03] p-5">
                    <div className="text-2xl font-black text-slate-100/60">{item.step}</div>
                    <div>
                      <p className="text-lg font-bold">{item.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-300">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white">
            <CardContent className="space-y-6 p-10">
              <Badge variant="default" className="bg-slate-100 text-slate-600 border-none">Cas d’application</Badge>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Scénarios concrets.</h2>
              <div className="space-y-3">
                {useCases.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-5 py-4 text-sm font-medium text-slate-700 border border-slate-100/50">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    {item}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>


        {/* SECTION PRICING - NOUVELLE SECTION */}
        <section id="pricing" className="space-y-12">
          <div className="text-center space-y-4">
            <Badge variant="default" className="bg-slate-100 text-slate-600 border-none">Tarifs</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Des plans adaptés à votre croissance.</h2>
            <p className="mx-auto max-w-2xl text-slate-500">
              Choisissez la flexibilité du mensuel ou l’avantage de l’annuel pour piloter votre marketing.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {pricingPlans.map((plan) => (
              <Card key={plan.name} className={cn(
                "relative border transition-all duration-300",
                plan.highlight ? "border-indigo-500 shadow-2xl scale-105 z-10 bg-white" : "border-slate-200 bg-white/50 hover:bg-white"
              )}>
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-600 text-[10px] font-bold text-white rounded-full uppercase tracking-widest">
                    Plus Populaire
                  </div>
                )}
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{plan.name}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold tracking-tight">{plan.price}</span>
                      <span className="text-sm font-medium text-slate-500">{plan.unit}</span>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-500 min-h-[48px]">{plan.description}</p>
                  <ul className="space-y-3 border-t border-slate-100 pt-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {/* <button className={cn(
                    "w-full h-11 rounded-xl text-sm font-bold transition-all",
                    plan.highlight 
                      ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100" 
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}>
                    {plan.cta}
                  </button> */}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* SECTION CONTACT - (Identique à ton code) */}
        <section id="contact">
          <Card className="border-none bg-white text-slate-800 shadow-sm border border-slate-100">
            <CardContent className="space-y-6 p-9">
              <Badge variant="default" className="bg-indigo-500 text-white border-none">Contact</Badge>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Modernisez votre écosystème CRM dès aujourd'hui.</h2>
              <p className="max-w-2xl text-sm leading-7 text-slate-500">
                Nos experts vous accompagnent dans la structuration de vos segments et la mise en production de vos dispositifs marketing pour un impact durable.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {contactItems.map((item) => (
                  <div key={item.label} className="rounded-2xl bg-slate-50 p-4 border border-slate-100/50 transition-colors hover:border-indigo-500/20">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-indigo-500 font-bold">{item.label}</p>
                    <p className="mt-2 text-sm font-bold text-slate-700">{item.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="mx-auto max-w-[1320px] px-4 pb-12 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300">
        © 2026 M2 Engage • Nouakchott, Mauritanie
      </footer>
    </div>
  )
}