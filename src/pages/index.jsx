import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowDown, ArrowRight, ArrowUpRight, BadgeCheck, Banknote, BarChart3, BriefcaseBusiness,
  Building2, Check, ChevronRight, CircleCheck, Clock3, Code2, Download,
  FileText, Fingerprint, Headphones, Landmark, Layers3, LockKeyhole, Mail, MapPin,
  Network, Phone, Search, ShieldCheck, Smartphone, Sparkles, UsersRound, X,
} from 'lucide-react'
import { api, getErrorMessage, withAuth } from '../services/api'
import FormField from '../components/FormField'
import Logo from '../components/Logo'
import PageIntro from '../components/PageIntro'
import SiteLayout from '../layouts/SiteLayout'
import { listingStatus, listingStatusText } from '../services/jobListings'

const ApplicationForm = lazy(() => import('./ApplicationForm'))

const reveal = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

const solutionItems = [
  { icon: Layers3, name: 'CUSTODIAN Core Banking', detail: 'A complete core banking platform for cooperative banks and credit societies.' },
  { icon: Smartphone, name: 'Mobile Banking', detail: 'Digital banking access for balances, statements and everyday transactions.' },
  { icon: Network, name: 'Connected Banking', detail: 'Connect banking services, channels and systems through integrated workflows.' },
  { icon: ShieldCheck, name: 'Compliance & Risk', detail: 'Tools for audit, AML, early warning and regulatory-oriented operations.' },
  { icon: Banknote, name: 'Payments & Collections', detail: 'Support for payment, collection and agency banking workflows.' },
  { icon: FileText, name: 'Lending & Documentation', detail: 'Support lending processes with appraisal and document management.' },
]

const facts = [
  { value: '100+', label: 'cooperative banks & credit societies' },
  { value: '800+', label: 'branches supported' },
  { value: '1997', label: 'company start year, as stated on its website' },
]

function Eyebrow({ children, light = false }) {
  return <div className={`eyebrow ${light ? 'eyebrow-light' : ''}`}><span />{children}</div>
}

function SectionTitle({ eyebrow, title, text, centered = false }) {
  return <div className={`section-title ${centered ? 'text-center' : ''}`}><Eyebrow>{eyebrow}</Eyebrow><h2>{title}</h2>{text && <p>{text}</p>}</div>
}

function ArrowLink({ to, children, light = false, className = '' }) {
  return <Link className={`arrow-link ${light ? 'arrow-link-light' : ''} ${className}`} to={to}>{children}<ArrowUpRight size={17} /></Link>
}

function Home() {
  const [jobs, setJobs] = useState([])
  const [jobsError, setJobsError] = useState('')
  useEffect(() => { api.get('/jobs').then(({ data }) => setJobs(data.slice(0, 2))).catch((reason) => setJobsError(getErrorMessage(reason))) }, [])
  return <>
    <section className="relative isolate overflow-hidden bg-[#071b35] text-white">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_76%_42%,rgba(71,161,185,0.25),transparent_38%),linear-gradient(125deg,#071b35_0%,#0b2948_58%,#103d59_100%)]" />
      <div aria-hidden="true" className="absolute -right-36 -top-44 h-[34rem] w-[34rem] rounded-full border border-white/10 shadow-[0_0_0_44px_rgba(255,255,255,0.025),0_0_0_88px_rgba(255,255,255,0.02)]" />
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 pb-16 pt-16 sm:px-8 lg:grid-cols-[1.03fr_0.97fr] lg:gap-10 lg:pb-24 lg:pt-24">
        <motion.div initial="hidden" animate="show" variants={reveal} className="relative z-10 max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#9edccf]/25 bg-[#9edccf]/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#a9e3d4]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#a9e3d4]" /> Technology with a human core
          </div>
          <h1 className="max-w-[13ch] font-['Manrope'] text-5xl font-semibold leading-[1.06] tracking-[-0.06em] sm:text-6xl lg:text-[4.5rem]">
            Banking, built around <span className="text-[#a7e6d3]">people.</span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
            Purpose-built banking software for cooperative banks and credit societies—bringing everyday banking, branches and digital channels together.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/solutions" className="group inline-flex min-h-12 items-center gap-3 rounded-md bg-[#c9ef9c] px-5 text-sm font-bold text-[#0b2340] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-[#daf5b8]">
              Explore our solutions <ArrowRight size={17} className="transition group-hover:translate-x-1" />
            </Link>
            <Link to="/about" className="inline-flex min-h-12 items-center gap-3 rounded-md border border-white/20 px-5 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/5">
              Get to know LIST <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="mt-8 flex items-center gap-3 text-xs text-slate-300">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-[#a7e6d3] text-[#092443]"><Check size={13} /></span>
            Built for the way cooperative banking works
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.12, ease: 'easeOut' }}
          className="relative mx-auto w-full max-w-[570px] py-6 sm:py-10"
        >
          <div aria-hidden="true" className="absolute inset-x-12 top-12 h-72 rounded-full bg-[#46a8ac]/20 blur-3xl" />
          <div className="absolute -left-2 top-14 z-10 hidden items-center gap-3 rounded-xl border border-white/70 bg-white px-4 py-3 text-[#102b48] shadow-xl shadow-black/15 sm:flex">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#e7f4f2] text-[#24858b]"><Landmark size={18} /></span>
            <span><b className="block text-xs">Branch operations</b><small className="mt-1 block text-[10px] text-slate-500">Connected core banking</small></span>
          </div>
          <div className="absolute -right-1 bottom-12 z-10 hidden items-center gap-3 rounded-xl border border-white/70 bg-white px-4 py-3 text-[#102b48] shadow-xl shadow-black/15 sm:flex">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#e9f4f8] text-[#267da0]"><Smartphone size={18} /></span>
            <span><b className="block text-xs">Digital channels</b><small className="mt-1 block text-[10px] text-slate-500">Illustrative concept</small></span>
          </div>
          <div className="relative rounded-2xl border border-white/15 bg-white/[0.08] p-3 shadow-[0_30px_90px_rgba(0,0,0,0.3)] backdrop-blur-md sm:p-5">
            <div className="rounded-xl bg-[#f7fbfc] p-5 text-[#152d47] sm:p-7">
              <div className="flex items-center justify-between border-b border-[#e5edf0] pb-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#e4f3f1] text-[#21858c]"><Layers3 size={20} /></span>
                  <div><b className="block font-['Manrope'] text-sm">CUSTODIAN</b><span className="text-[9px] font-bold tracking-[0.14em] text-slate-500">CORE BANKING</span></div>
                </div>
                <span className="rounded-full border border-[#dce9ec] px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-[#67808f]">Platform map</span>
              </div>
              <div className="py-6">
                <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#338c91]">An illustrative view</span>
                <h2 className="mt-2 font-['Manrope'] text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">One connected banking ecosystem.</h2>
                <p className="mt-2 max-w-sm text-xs leading-6 text-slate-500">Core systems, branches and digital services—brought into a considered flow.</p>
              </div>
              <div className="relative grid grid-cols-3 gap-2 sm:gap-3">
                <div className="absolute left-[16%] right-[16%] top-1/2 h-px bg-[#b7d7d9]" />
                {[{ icon: Landmark, title: 'Branches' }, { icon: Network, title: 'Core' }, { icon: Smartphone, title: 'Channels' }].map(({ icon: Icon, title }, index) => (
                  <motion.div key={title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 + index * 0.12 }} className={`relative z-[1] rounded-lg border p-3 text-center sm:p-4 ${index === 1 ? 'border-[#a9d8d2] bg-[#eaf6f3]' : 'border-[#e5edf0] bg-white'}`}>
                    <span className="mx-auto grid h-9 w-9 place-items-center rounded-lg bg-[#edf5f7] text-[#267c91]"><Icon size={17} /></span>
                    <span className="mt-2 block text-[10px] font-bold text-[#29445d] sm:text-xs">{title}</span>
                  </motion.div>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between rounded-lg bg-[#edf4f6] px-4 py-3 text-[9px] text-slate-500">
                <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#3fa78f]" /> Visual concept only</span>
                <span className="font-semibold uppercase tracking-wider">No live data</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <div className="mx-auto flex max-w-7xl items-center justify-between border-t border-white/10 px-6 py-4 text-[10px] tracking-wide text-slate-400 sm:px-8">
        <span>Designed for cooperative finance</span>
        <span className="flex items-center gap-2"><ArrowDown size={13} /> Scroll to explore</span>
      </div>
    </section>

    <section className="border-b border-slate-100 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 text-center sm:px-8 md:flex-row md:items-center md:justify-between md:text-left">
        <span className="text-xs font-semibold text-slate-600">Supporting the cooperative banking ecosystem</span>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-medium text-slate-500 md:justify-end">
          <span className="inline-flex items-center gap-2"><Landmark size={15} className="text-[#398f95]" /> Banks</span>
          <span className="hidden text-slate-300 sm:inline">/</span>
          <span className="inline-flex items-center gap-2"><Building2 size={15} className="text-[#398f95]" /> Credit societies</span>
          <span className="hidden text-slate-300 sm:inline">/</span>
          <span className="inline-flex items-center gap-2"><Network size={15} className="text-[#398f95]" /> Connected branches</span>
        </div>
      </div>
    </section>

    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 sm:px-8 lg:grid-cols-2 lg:items-end lg:gap-20">
        <div>
          <Eyebrow>Banking, understood</Eyebrow>
          <h2 className="mt-5 max-w-xl font-['Manrope'] text-3xl font-semibold leading-tight tracking-[-0.045em] text-[#0b2442] sm:text-4xl">
            Technology that keeps communities <span className="text-[#26889a]">moving forward.</span>
          </h2>
        </div>
        <div className="max-w-xl">
          <p className="text-sm leading-7 text-slate-600 sm:text-base">For cooperative banks, technology has to do more than process transactions. It needs to work across branches, support local service and stay ready for what customers expect next.</p>
          <ArrowLink to="/about" className="mt-6">Discover LIST Software</ArrowLink>
        </div>
      </div>
    </section>

    <section className="bg-[#f5f8fb] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="mb-10 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl"><Eyebrow>A connected suite</Eyebrow><h2 className="mt-4 font-['Manrope'] text-3xl font-semibold tracking-[-0.045em] text-[#0b2442] sm:text-4xl">One ecosystem. Many ways to bank.</h2><p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">From the branch counter to a customer’s phone, explore technology for the everyday realities of cooperative banking.</p></div>
          <ArrowLink to="/solutions" className="shrink-0">Explore all solutions</ArrowLink>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {solutionItems.slice(0, 3).map((item, index) => {
            const Icon = item.icon
            return <motion.article key={item.name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.4, delay: index * 0.08 }} className="group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,42,67,0.025)] transition duration-300 hover:-translate-y-1 hover:border-[#c5e0e1] hover:shadow-[0_18px_40px_rgba(15,42,67,0.08)] sm:p-7">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#eaf5f3] text-[#24888f] transition group-hover:bg-[#dff0ed]"><Icon size={22} strokeWidth={1.7} /></span>
              <h3 className="mt-6 font-['Manrope'] text-lg font-bold text-[#102a48]">{item.name}</h3>
              <p className="mt-2 min-h-[3rem] text-sm leading-6 text-slate-500">{item.detail}</p>
              <Link to="/solutions" className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-[#187c96]">Explore solution <ArrowUpRight size={15} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></Link>
              <span aria-hidden="true" className="absolute -right-10 -top-10 h-28 w-28 rounded-full border border-[#e9f1f2] transition group-hover:scale-125" />
            </motion.article>
          })}
        </div>
      </div>
    </section>

    <section className="relative overflow-hidden bg-[#092343] py-20 text-white sm:py-24">
      <div aria-hidden="true" className="absolute -right-20 top-0 h-96 w-96 rounded-full border border-white/10 shadow-[0_0_0_40px_rgba(255,255,255,0.025),0_0_0_80px_rgba(255,255,255,0.02)]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20">
        <div><Eyebrow light>Built on experience</Eyebrow><h2 className="mt-5 max-w-md font-['Manrope'] text-3xl font-semibold leading-tight tracking-[-0.045em] sm:text-4xl">Focused on a sector that matters.</h2><p className="mt-5 max-w-md text-sm leading-7 text-slate-300">Company-published facts shown on LIST Software’s website. Figures are presented as published and have not been independently audited for this demo.</p></div>
        <div className="grid gap-3 sm:grid-cols-3">
          {facts.map((item, index) => <motion.div key={item.label} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }} className="rounded-xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur sm:p-6">
            <strong className="block font-['Manrope'] text-4xl font-semibold tracking-[-0.05em] text-[#a7e6d3] sm:text-5xl">{item.value}</strong>
            <span className="mt-3 block text-xs leading-5 text-slate-300">{item.label}</span>
          </motion.div>)}
        </div>
      </div>
    </section>

    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 sm:px-8 lg:grid-cols-2 lg:gap-20">
        <div className="relative grid min-h-[320px] place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#eef7f7] via-[#f7fafb] to-[#e9f2f8] p-8">
          <div aria-hidden="true" className="absolute h-56 w-56 rounded-full border border-[#cddfe3] shadow-[0_0_0_32px_rgba(205,223,227,0.22),0_0_0_64px_rgba(205,223,227,0.13)]" />
          <div className="relative grid h-28 w-28 place-items-center rounded-full border border-[#dfebec] bg-white text-[#1f7e8d] shadow-xl shadow-[#1c506b]/10"><div className="flex flex-col items-center gap-2"><Code2 size={26} /><span className="text-[9px] font-bold uppercase tracking-wider">Banking tech</span></div></div>
          {[{ icon: Smartphone, label: 'Mobile', position: 'left-1/2 top-7 -translate-x-1/2' }, { icon: Landmark, label: 'Branches', position: 'left-5 top-1/2 -translate-y-1/2 sm:left-10' }, { icon: Network, label: 'Network', position: 'right-5 top-1/2 -translate-y-1/2 sm:right-10' }, { icon: ShieldCheck, label: 'Security', position: 'bottom-7 left-1/2 -translate-x-1/2' }].map(({ icon: Icon, label, position }) => <div key={label} className={`absolute ${position} inline-flex items-center gap-2 rounded-lg border border-slate-100 bg-white px-3 py-2 text-[10px] font-semibold text-slate-600 shadow-md shadow-slate-900/5`}><Icon size={15} className="text-[#3b9295]" />{label}</div>)}
        </div>
        <div>
          <Eyebrow>Thoughtfully connected</Eyebrow>
          <h2 className="mt-4 font-['Manrope'] text-3xl font-semibold leading-tight tracking-[-0.045em] text-[#0b2442] sm:text-4xl">Modern banking should feel <span className="text-[#26889a]">effortless.</span></h2>
          <p className="mt-5 text-sm leading-7 text-slate-600">LIST’s solutions span core banking, digital channels, payments and operational workflows—helping cooperative institutions bring more of their work into one connected environment.</p>
          <ul className="mt-6 space-y-3">
            {['Core banking designed for cooperative institutions', 'Digital access that extends beyond the branch', 'Solutions to support compliance and operations'].map((feature) => <li key={feature} className="flex items-start gap-3 text-sm text-slate-600"><CircleCheck size={18} className="mt-0.5 shrink-0 text-[#32988c]" />{feature}</li>)}
          </ul>
          <ArrowLink to="/banking-technology" className="mt-7">How banking technology fits together</ArrowLink>
        </div>
      </div>
    </section>

    <section className="bg-[#f5f8fb] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl"><Eyebrow>Careers at LIST</Eyebrow><h2 className="mt-4 font-['Manrope'] text-3xl font-semibold tracking-[-0.045em] text-[#0b2442] sm:text-4xl">Build meaningful technology with us.</h2><p className="mt-3 text-sm leading-7 text-slate-600">Explore role formats in banking technology. Demo listings are not confirmed vacancies.</p></div>
          <ArrowLink to="/careers" className="shrink-0">Explore careers</ArrowLink>
        </div>
        {jobs.length ? <div className="grid gap-4 md:grid-cols-2">{jobs.map((job) => <JobCard key={job.id} job={job} compact />)}</div> : <div className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center sm:p-7">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#eaf5f3] text-[#24888f]"><UsersRound size={22} /></span>
          <div className="flex-1"><b className="font-['Manrope'] text-base text-[#102a48]">{jobsError ? 'Sample roles could not load.' : 'Curious about working with us?'}</b><p className="mt-1 text-sm leading-6 text-slate-500">{jobsError || 'Visit the careers portal to explore demo role formats. Availability is unverified.'}</p></div>
          <ArrowLink to="/careers" className="shrink-0">View career information</ArrowLink>
        </div>}
      </div>
    </section>
    <ContactCta />
  </>
}

function ContactCta() {
  return <section className="cta-section"><div className="container cta-layout"><div><Eyebrow light>Let’s start a conversation</Eyebrow><h2>Looking for a banking<br />technology partner?</h2><p>Share what your institution needs. The LIST team can help you explore the next step.</p></div><Link className="button button-white" to="/contact">Talk to our team <ArrowUpRight size={16} /></Link></div></section>
}

function About() {
  const values = [
    ['Sector focus', 'A long-standing focus on the needs of cooperative banks and credit societies.'],
    ['Service mindset', 'The company describes a service-oriented approach and dedicated support teams.'],
    ['Practical innovation', 'Building banking products around real operational needs and changing customer expectations.'],
  ]
  return <>
    <PageIntro label="About LIST Software" title={<>Technology with a<br />cooperative spirit.</>} description="A banking software company with its roots in the cooperative sector and its base in Kolhapur, Maharashtra." />
    <section className="section"><div className="container story-layout"><div><Eyebrow>Our story</Eyebrow><h2>Deep knowledge of the work behind every transaction.</h2></div><div className="story-copy"><p>LIST Software Pvt. Ltd. builds software for cooperative banks and credit societies. Its company website describes operations beginning in 1997 and a focus on core banking, customer service and product development.</p><p>From its Kolhapur base, the company’s product portfolio connects core banking with digital channels, payments and supporting operational tools.</p><div className="source-note"><BadgeCheck size={16} /> Company background summarized from the official website. Facts are not independently audited for this demo.</div></div></div></section>
    <section className="section section-soft"><div className="container"><SectionTitle eyebrow="What guides us" title="Built around banking realities." text="A sector-specific perspective informs how LIST describes its approach to products and service." /><div className="values-grid">{values.map(([title, text], i) => <div className="value-card" key={title}><span className="value-num">0{i + 1}</span><div className="value-icon">{i === 0 ? <Landmark /> : i === 1 ? <Headphones /> : <Sparkles />}</div><h3>{title}</h3><p>{text}</p></div>)}</div></div></section>
    <section className="section"><div className="container"><div className="facts-band"><div className="facts-intro"><Eyebrow>At a glance</Eyebrow><h2>Company-published milestones.</h2><p>Figures shown as stated on listspl.co.in; not independently verified.</p></div>{facts.map((fact) => <div key={fact.label} className="fact-box"><strong>{fact.value}</strong><span>{fact.label}</span></div>)}</div></div></section>
    <ContactCta />
  </>
}

function Solutions() {
  const [search, setSearch] = useState('')
  const visible = solutionItems.filter((item) => `${item.name} ${item.detail}`.toLowerCase().includes(search.toLowerCase()))
  return <>
    <PageIntro label="Our solutions" title={<>Technology for the<br />whole banking journey.</>} description="A connected portfolio supporting core banking, digital channels and day-to-day operations for cooperative institutions." />
    <section className="section"><div className="container"><div className="solutions-intro"><SectionTitle eyebrow="Explore the portfolio" title="Designed to work together." text="Each institution’s needs are different. Discover the capabilities LIST describes across its banking technology portfolio." /><label className="search-field solution-search"><Search size={17} /><input placeholder="Find a solution" value={search} onChange={(event) => setSearch(event.target.value)} /><span>{visible.length}</span></label></div><div className="solution-catalog">{visible.map((item, i) => <motion.div key={item.name} className="solution-row" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .04 }}><div className="solution-row-icon"><item.icon size={22} /></div><div className="solution-row-copy"><span>0{i + 1} / SOLUTION</span><h3>{item.name}</h3><p>{item.detail}</p></div><ArrowLink to="/banking-technology">Explore details</ArrowLink></motion.div>)}</div>{visible.length === 0 && <p className="empty-note">No solutions match that search. Try another term.</p>}</div></section>
    <section className="section section-soft"><div className="container segment-layout"><div><Eyebrow>Who it serves</Eyebrow><h2>Made for institutions that bring finance closer.</h2></div><div className="segment-cards"><div><Landmark /><b>Cooperative banks</b><p>Branch and customer services for the cooperative banking environment.</p></div><div><Building2 /><b>Credit societies</b><p>Technology supporting operational and member-facing needs.</p></div></div></div></section>
    <ContactCta />
  </>
}

function BankingTechnology() {
  const steps = [
    ['01', 'Core', 'CUSTODIAN CBS supports core banking functions across branches connected to a central datacenter.'],
    ['02', 'Channels', 'Mobile, internet, ATM, POS and kiosk channels can extend services beyond the branch.'],
    ['03', 'Operations', 'Supporting modules connect payments, compliance, lending and document workflows.'],
    ['04', 'Service', 'Implementation and support teams help institutions use and maintain their banking environment.'],
  ]
  return <>
    <PageIntro label="Banking technology" title={<>One banking platform.<br />Connected experiences.</>} description="See how the core, channels and supporting services come together across LIST Software’s published portfolio." />
    <section className="section tech-overview"><div className="container tech-overview-grid"><div><Eyebrow>Core banking, at the center</Eyebrow><h2>CUSTODIAN is built for cooperative banking.</h2><p>LIST describes CUSTODIAN as a core banking solution for cooperative banks, with centralized data and applications that branches can access over network connections.</p><p>ATM, internet, mobile, POS and kiosk channels are listed as extensions to the banking environment.</p><ArrowLink to="/solutions">Explore the solutions portfolio</ArrowLink></div><div className="tech-diagram"><div className="diagram-center"><Landmark size={25} /><b>CUSTODIAN</b><span>CORE BANKING</span></div><div className="diagram-node node-n"><Smartphone />Mobile</div><div className="diagram-node node-e"><Network />Internet</div><div className="diagram-node node-s"><Banknote />Payments</div><div className="diagram-node node-w"><Building2 />Branches</div><div className="diagram-line line-v" /><div className="diagram-line line-h" /><div className="diagram-line line-d1" /><div className="diagram-line line-d2" /></div></div></section>
    <section className="section section-soft"><div className="container"><SectionTitle eyebrow="A connected approach" title="From core systems to customer channels." text="A simplified view of the elements described across the official product portfolio." /><div className="steps-grid">{steps.map(([num, name, desc]) => <article key={num} className="step-card"><span>{num}</span><h3>{name}</h3><p>{desc}</p><ChevronRight size={19} /></article>)}</div><div className="source-note wide-note"><BadgeCheck size={16} /> Descriptions are paraphrased from the official LIST Software website; product details should be confirmed with the company.</div></div></section>
    <ContactCta />
  </>
}

function ListingStatusBadge({ job }) {
  const status = listingStatus(job)
  const style = status === 'current_verified'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
    : status === 'historical'
      ? 'border-slate-200 bg-slate-100 text-slate-600'
      : 'border-amber-200 bg-amber-50 text-amber-800'
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${style}`}>
    <span className={`h-1.5 w-1.5 rounded-full ${status === 'current_verified' ? 'bg-emerald-500' : status === 'historical' ? 'bg-slate-400' : 'bg-amber-500'}`} />
    {listingStatusText[status]}
  </span>
}

function JobCard({ job, compact = false }) {
  const status = listingStatus(job)
  return <motion.article initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} className={`job-card ${compact ? 'job-card-compact' : ''} !rounded-xl !border-slate-200 !p-5 sm:!p-6`}>
    <div className="flex flex-wrap items-center justify-between gap-2">
      <span className="job-dept">{job.department}</span><ListingStatusBadge job={job} />
    </div>
    <h3 className="!mt-5 !text-lg"><Link to={`/careers/${job.id}`}>{job.title}</Link></h3>
    <p className="!min-h-0 !text-xs !leading-6">{job.summary}</p>
    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-slate-600">
      <span className="inline-flex items-center gap-1.5"><MapPin size={14} className="text-[#4c8995]" />{job.location}</span>
      <span className="inline-flex items-center gap-1.5"><BriefcaseBusiness size={14} className="text-[#4c8995]" />{job.experience}</span>
      <span className="inline-flex items-center gap-1.5"><Clock3 size={14} className="text-[#4c8995]" />{job.employment_type}</span>
    </div>
    {status !== 'illustrative' && job.listing_date && <p className="mt-3 text-[10px] text-slate-500">{status === 'historical' ? 'Advertised' : 'Verified'} {new Date(`${job.listing_date}T00:00:00`).toLocaleDateString()}</p>}
    <div className="job-card-bottom !mt-5 !pt-4">
      <small>{status === 'illustrative' ? 'Not a historical ad or confirmed vacancy' : status === 'historical' ? 'Closed · applications unavailable' : 'Source-backed listing · confirm details'}</small>
      <Link to={`/careers/${job.id}`}>{status === 'current_verified' ? 'View vacancy' : 'View profile'} <ArrowUpRight size={15} /></Link>
    </div>
  </motion.article>
}

function Careers() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ q: '', department: '', experience: '', type: '', status: '' })
  useEffect(() => {
    api.get('/jobs').then(({ data }) => setJobs(data)).catch((reason) => setError(getErrorMessage(reason))).finally(() => setLoading(false))
  }, [])
  const departments = [...new Set(jobs.map((job) => job.department))]
  const experiences = [...new Set(jobs.map((job) => job.experience))]
  const types = [...new Set(jobs.map((job) => job.employment_type))]
  const statuses = [...new Set(jobs.map(listingStatus))]
  const verifiedCount = jobs.filter((job) => listingStatus(job) === 'current_verified').length
  const historicalCount = jobs.filter((job) => listingStatus(job) === 'historical').length
  const filtered = jobs.filter((job) => {
    const text = `${job.title} ${job.summary} ${job.description} ${job.responsibilities} ${job.skills} ${job.qualification} ${job.department} ${job.location}`.toLowerCase()
    return text.includes(filters.q.trim().toLowerCase())
      && (!filters.department || job.department === filters.department)
      && (!filters.experience || job.experience === filters.experience)
      && (!filters.type || job.employment_type === filters.type)
      && (!filters.status || listingStatus(job) === filters.status)
  })
  function update(key, value) { setFilters((state) => ({ ...state, [key]: value })) }
  function clearFilters() { setFilters({ q: '', department: '', experience: '', type: '', status: '' }) }
  return <>
    <PageIntro label="Careers" title={<>Build technology<br />for cooperative banking.</>} description="Explore illustrative role profiles connected to LIST Software’s published banking technology portfolio." ><a className="intro-mail" href="mailto:career@listspl.co.in"><Mail size={15} /> career@listspl.co.in <ArrowUpRight size={14} /></a></PageIntro>
    <section className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="grid gap-4 rounded-2xl border border-[#dce9ed] bg-gradient-to-br from-[#f3f9fa] to-white p-5 sm:p-7 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#277d89]"><BadgeCheck size={15} /> Public careers information</div>
            <h2 className="mt-3 font-['Manrope'] text-xl font-semibold tracking-[-0.03em] text-[#102b48]">{verifiedCount ? `${verifiedCount} currently verified ${verifiedCount === 1 ? 'vacancy' : 'vacancies'} in this portal.` : 'No specific vacancy is currently verified here.'}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">The official careers page invites candidates to submit a resume and says LIST will contact them if a suitable position is open; it does not list specific openings. Historical ads and current vacancies are shown separately only when a dated official source is provided. Otherwise, profiles are illustrative—not advertisements.</p>
            <a href="https://listspl.co.in/career/" target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#167a94] hover:text-[#0c536d]">Check the official careers page <ArrowUpRight size={14} /></a>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-emerald-100 bg-white p-4"><span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Verified current</span><strong className="mt-2 block font-['Manrope'] text-2xl text-emerald-800">{verifiedCount}</strong><span className="text-[10px] text-slate-500">vacancies in this demo</span></div>
            <div className="rounded-xl border border-slate-200 bg-white p-4"><span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Historical ads</span><strong className="mt-2 block font-['Manrope'] text-2xl text-slate-700">{historicalCount}</strong><span className="text-[10px] text-slate-500">dated official sources</span></div>
          </div>
        </div>
      </div>
    </section>
    <section className="bg-[#f5f8fb] pb-20 pt-5 sm:pb-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><Eyebrow>Illustrative profiles</Eyebrow><h2 className="mt-3 font-['Manrope'] text-3xl font-semibold tracking-[-0.045em] text-[#0b2442]">Find a role that fits.</h2><p className="mt-2 text-sm text-slate-600">Examples based on published product areas; not company-authored job specifications.</p></div>
          <span className="text-xs font-semibold text-slate-500" aria-live="polite">{loading ? 'Loading profiles…' : `${filtered.length} of ${jobs.length} profiles`}</span>
        </div>
        <div className="mb-5 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr_auto] lg:items-center">
          <label className="relative sm:col-span-2 lg:col-span-1">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="min-h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#6daeb2] focus:ring-4 focus:ring-[#338f9415]" value={filters.q} onChange={(event) => update('q', event.target.value)} placeholder="Search title, skill or keyword" aria-label="Search jobs" />
          </label>
          <select className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#6daeb2]" value={filters.department} onChange={(event) => update('department', event.target.value)} aria-label="Filter by department"><option value="">All departments</option>{departments.map((value) => <option key={value}>{value}</option>)}</select>
          <select className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#6daeb2]" value={filters.experience} onChange={(event) => update('experience', event.target.value)} aria-label="Filter by experience"><option value="">Any experience</option>{experiences.map((value) => <option key={value}>{value}</option>)}</select>
          <select className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#6daeb2]" value={filters.type} onChange={(event) => update('type', event.target.value)} aria-label="Filter by employment type"><option value="">Any employment type</option>{types.map((value) => <option key={value}>{value}</option>)}</select>
          <select className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#6daeb2]" value={filters.status} onChange={(event) => update('status', event.target.value)} aria-label="Filter by listing status"><option value="">All listing statuses</option>{statuses.map((value) => <option key={value} value={value}>{listingStatusText[value]}</option>)}</select>
          <button type="button" onClick={clearFilters} className="min-h-11 rounded-lg px-3 text-xs font-bold text-[#247b8e] transition hover:bg-[#eff7f7]">Clear</button>
        </div>
        {loading && <div className="grid gap-4 md:grid-cols-2"><div className="h-52 animate-pulse rounded-xl bg-slate-200" /><div className="h-52 animate-pulse rounded-xl bg-slate-200" /></div>}
        {!loading && error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800"><b>Couldn’t load role profiles.</b><p className="mt-1">{error} Check that the API is available and retry.</p></div>}
        {!loading && !error && filtered.length > 0 && <div className="grid gap-4 md:grid-cols-2">{filtered.map((job) => <JobCard key={job.id} job={job} />)}</div>}
        {!loading && !error && filtered.length === 0 && <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center"><BriefcaseBusiness size={24} className="mx-auto text-slate-400" /><b className="mt-4 block font-['Manrope'] text-lg text-[#102b48]">No profiles match those filters.</b><p className="mt-2 text-sm text-slate-500">Adjust your search, or contact LIST Software directly about genuine opportunities.</p><button type="button" onClick={clearFilters} className="mt-4 text-sm font-bold text-[#187c96]">Clear all filters</button></div>}
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#d9e8e5] bg-[#eff7f4] p-4 text-xs leading-6 text-[#47645e]">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#348a7c]" />
          <p><b>Demo applications stay in this project.</b> Applying to an illustrative profile does not submit your information to LIST Software. For genuine recruitment enquiries, use the <a href="https://listspl.co.in/career/" target="_blank" rel="noreferrer" className="font-bold underline">official careers page</a> or email <a className="font-bold underline" href="mailto:career@listspl.co.in">career@listspl.co.in</a>.</p>
        </div>
      </div>
    </section>
  </>
}

function JobDetails() {
  const { jobId } = useParams()
  const [job, setJob] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { api.get(`/jobs/${jobId}`).then(({ data }) => setJob(data)).catch((reason) => setError(getErrorMessage(reason))) }, [jobId])
  if (error) return <PageIntro label="Careers" title="This listing isn’t available." description={error}><Link to="/careers" className="button button-lime">Back to careers <ArrowRight size={16} /></Link></PageIntro>
  if (!job) return <div className="container loading-page"><span className="loader" /> Loading listing…</div>
  const status = listingStatus(job)
  const listingDate = job.listing_date ? new Date(`${job.listing_date}T00:00:00`).toLocaleDateString() : ''
  return <>
    <PageIntro label="Career profile" title={job.title} description={job.summary}><Link to="/careers" className="back-link"><ArrowRight className="back-arrow" size={15} /> All careers</Link></PageIntro>
    <section className="bg-white py-12 sm:py-16">
      <div className="mx-auto grid max-w-7xl items-start gap-8 px-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12">
        <article className="min-w-0">
          <div className={`flex items-start gap-3 rounded-xl border p-4 text-sm leading-6 ${status === 'current_verified' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : status === 'historical' ? 'border-slate-200 bg-slate-100 text-slate-700' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
            <ShieldCheck size={19} className="mt-0.5 shrink-0" />
            <div><ListingStatusBadge job={job} />
              {status === 'illustrative' && <p className="mt-2">This is an illustrative profile, not a historical advertisement or confirmed vacancy. Example duties are informed by LIST Software’s published product areas; they are not a company-authored job specification.</p>}
              {status === 'historical' && <p className="mt-2">This past advertisement is closed and is not accepting applications.{listingDate && ` Advertised ${listingDate}.`}</p>}
              {status === 'current_verified' && <p className="mt-2">Marked verified on {listingDate}. Confirm details on the official source before applying.</p>}
              {job.listing_source && <a href={job.listing_source} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 font-bold underline">View official source <ArrowUpRight size={13} /></a>}
            </div>
          </div>
          <div className="mt-9">
            <Eyebrow>Role overview</Eyebrow>
            <h2 className="mt-3 font-['Manrope'] text-2xl font-semibold tracking-[-0.04em] text-[#102b48]">About this profile</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{job.description}</p>
          </div>
          <div className="mt-8 space-y-7">
            <DetailSection title="Responsibilities" text={job.responsibilities} />
            <DetailSection title="Example skills" text={job.skills} />
            <DetailSection title="Qualification" text={job.qualification} />
          </div>
        </article>
        <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_12px_36px_rgba(15,42,67,0.05)] sm:p-6 lg:sticky lg:top-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4"><span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Role overview</span><BriefcaseBusiness size={19} className="text-[#26858c]" /></div>
          <div className="mt-4"><ListingStatusBadge job={job} /></div>
          {[['Department', job.department], ['Experience', job.experience], ['Employment type', job.employment_type], ['Location', job.location]].map(([label, value]) => <div key={label} className="border-b border-slate-100 py-3"><span className="block text-[10px] text-slate-500">{label}</span><b className="mt-1 block text-sm text-slate-800">{value}</b></div>)}
          {status === 'historical'
            ? <div className="mt-5 rounded-lg bg-slate-100 p-3 text-xs leading-5 text-slate-600">This advertisement is closed. <a href="mailto:career@listspl.co.in" className="font-bold text-[#167a94] underline">Contact LIST about future opportunities</a>.</div>
            : <><Link className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#0b2442] px-4 text-sm font-bold text-white transition hover:bg-[#143b5b]" to={`/careers/${job.id}/apply`}>Apply Now <ArrowRight size={16} /></Link><p className="mt-3 text-[10px] leading-5 text-slate-500">{status === 'illustrative' ? 'Demo only: applications are stored in this project and are not sent to LIST Software.' : 'Review the official source and verify the opening is still accepting applications.'}</p></>}
        </aside>
      </div>
    </section>
  </>
}

function DetailSection({ title, text }) {
  return <div className="detail-section"><h3>{title}</h3>{text?.split('\n').filter(Boolean).map((line) => <div className="detail-bullet" key={line}><CircleCheck size={16} /><span>{line}</span></div>)}</div>
}

function Contact() {
  const [values, setValues] = useState({ name: '', email: '', phone: '', message: '' })
  const [state, setState] = useState({ busy: false, error: '', success: '' })
  function change(event) { setValues((current) => ({ ...current, [event.target.name]: event.target.value })) }
  async function submit(event) {
    event.preventDefault(); setState({ busy: true, error: '', success: '' })
    try { const { data } = await api.post('/contact', values); setState({ busy: false, error: '', success: data.message }); setValues({ name: '', email: '', phone: '', message: '' }); event.target.reset() }
    catch (reason) { setState({ busy: false, error: getErrorMessage(reason), success: '' }) }
  }
  return <>
    <PageIntro label="Contact" title={<>Good conversations<br />start with a hello.</>} description="Connect with LIST Software to talk about cooperative banking technology and services." />
    <section className="section"><div className="container contact-layout"><div className="contact-details"><Eyebrow>Visit or reach us</Eyebrow><h2>We’re based in Kolhapur.</h2><p>For product and partnership enquiries, reach the LIST Software team using the details published on its official website.</p><div className="contact-info"><div><span><MapPin size={19} /></span><div><small>OFFICE</small><p>6th Floor, Elixa Park, C.S.No. 517 A/1, E Ward, Old Pune–Bangalore Highway, Shahupuri, Kolhapur, Maharashtra 416001</p></div></div><div><span><Phone size={19} /></span><div><small>PHONE</small><a href="tel:+912312669164">+91 231 266 9164</a></div></div><div><span><Mail size={19} /></span><div><small>EMAIL</small><a href="mailto:bankingsales@listspl.co.in">bankingsales@listspl.co.in</a></div></div><div><span><Clock3 size={19} /></span><div><small>WORKING HOURS</small><p>Monday – Saturday, 9.00 am – 6.00 pm</p></div></div></div><div className="demo-warning">Demo contact form messages are stored only in this project’s database and are not delivered to LIST Software.</div></div>
      <form className="contact-form" onSubmit={submit}><div className="form-section-title"><span><Mail size={18} /></span><div><h2>Send an enquiry</h2><p>Fields marked <b>*</b> are required.</p></div></div><FormField label="Your name" name="name" value={values.name} onChange={change} required minLength={2} placeholder="Full name" /><FormField label="Work email" name="email" type="email" value={values.email} onChange={change} required placeholder="you@organization.com" /><FormField label="Phone number" name="phone" type="tel" value={values.phone} onChange={change} placeholder="Optional" /><label className="form-field"><span>How can we help? <i>*</i></span><textarea name="message" value={values.message} onChange={change} required minLength={10} maxLength={5000} rows="5" placeholder="Tell us a little about your enquiry…" /></label>{state.error && <div role="alert" className="form-alert form-alert-error">{state.error}</div>}{state.success && <div role="status" className="form-alert form-alert-success"><CircleCheck size={17} />{state.success}</div>}<button className="button button-navy submit-button" disabled={state.busy}>{state.busy ? 'Sending…' : 'Send enquiry'} <ArrowRight size={16} /></button></form>
    </div></section>
  </>
}

function AdminLogin() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  function change(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })) }
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('')
    try { const { data } = await api.post('/auth/login', form); sessionStorage.setItem('list_admin_token', data.access_token); navigate('/admin/dashboard') }
    catch (reason) { setError(getErrorMessage(reason)) }
    finally { setBusy(false) }
  }
  return <section className="admin-login-page"><div className="admin-login-card"><div className="login-brand"><Logo /><span>RECRUITMENT PORTAL</span></div><div className="login-icon"><LockKeyhole size={22} /></div><Eyebrow>Secure access</Eyebrow><h1>Welcome back.</h1><p>Sign in to manage roles and applications.</p><form onSubmit={submit}><FormField label="Admin email" type="email" name="email" value={form.email} onChange={change} required autoComplete="username" placeholder="admin@example.com" /><FormField label="Password" type="password" name="password" value={form.password} onChange={change} required autoComplete="current-password" placeholder="Enter your password" />{error && <div role="alert" className="form-alert form-alert-error">{error}</div>}<button className="button button-navy button-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in securely'} <ArrowRight size={16} /></button></form><div className="login-security"><ShieldCheck size={15} /> Authorized administrators only</div><Link to="/" className="login-back"><ArrowRight className="back-arrow" size={13} /> Return to website</Link></div><div className="admin-login-art"><div className="login-art-orbit" /><div className="login-art-icon"><Landmark size={30} /></div><h2>People-powered<br />banking technology.</h2><p>Independent LIST Software demo portal</p></div></section>
}

const emptyJob = { title: '', department: '', employment_type: 'Full-time', experience: '', location: 'Kolhapur, Maharashtra', summary: '', description: '', responsibilities: '', skills: '', qualification: '', availability_note: 'Illustrative role profile only — not a historical advertisement; no current vacancy verified.', listing_status: 'illustrative', listing_source: '', listing_date: '', is_published: false }

function AdminDashboard() {
  const navigate = useNavigate()
  const token = sessionStorage.getItem('list_admin_token')
  const auth = useMemo(() => withAuth(token || ''), [token])
  const [stats, setStats] = useState(null)
  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [jobFilter, setJobFilter] = useState('')
  const [tab, setTab] = useState('applications')
  const [editingJob, setEditingJob] = useState(null)
  const [viewingApplication, setViewingApplication] = useState(null)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishingJobId, setPublishingJobId] = useState(null)
  async function loadDashboard() {
    setError('')
    try {
      const [statsResponse, jobsResponse, appsResponse] = await Promise.all([
        api.get('/admin/dashboard', auth), api.get('/admin/jobs', auth), api.get('/admin/applications', { ...auth, params: { q: query || undefined, status: statusFilter || undefined, job_id: jobFilter || undefined } }),
      ])
      setStats(statsResponse.data); setJobs(jobsResponse.data); setApplications(appsResponse.data)
    } catch (reason) {
      if (reason?.response?.status === 401) { sessionStorage.removeItem('list_admin_token'); navigate('/admin/login', { replace: true }); return }
      setError(getErrorMessage(reason))
    } finally { setLoading(false) }
  }
  useEffect(() => { if (!token) { navigate('/admin/login', { replace: true }); return } loadDashboard() }, [token, query, statusFilter, jobFilter])
  async function saveJob(event) {
    event.preventDefault(); setSaving(true); setError(''); setNotice('')
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries())
    payload.is_published = payload.is_published === 'on'
    try {
      if (editingJob?.id) await api.put(`/admin/jobs/${editingJob.id}`, payload, auth)
      else await api.post('/admin/jobs', payload, auth)
      setNotice(editingJob?.id ? 'Role updated.' : 'Role created.'); setEditingJob(null); await loadDashboard()
    } catch (reason) { setError(getErrorMessage(reason)) }
    finally { setSaving(false) }
  }
  async function removeJob(job) {
    if (!window.confirm(`Delete “${job.title}”?`)) return
    setError(''); setNotice('')
    try { await api.delete(`/admin/jobs/${job.id}`, auth); setNotice('Role deleted.'); await loadDashboard() }
    catch (reason) { setError(getErrorMessage(reason)) }
  }
  async function togglePublished(job) {
    setError(''); setNotice(''); setPublishingJobId(job.id)
    try {
      await api.put(`/admin/jobs/${job.id}`, { ...job, is_published: !job.is_published }, auth)
      setNotice(job.is_published ? 'Role unpublished.' : 'Role published.')
      await loadDashboard()
    } catch (reason) { setError(getErrorMessage(reason)) }
    finally { setPublishingJobId(null) }
  }
  async function updateStatus(id, value) {
    setError(''); setNotice('')
    try { await api.patch(`/admin/applications/${id}`, { status: value }, auth); setNotice('Application status updated.'); await loadDashboard() }
    catch (reason) { setError(getErrorMessage(reason)) }
  }
  async function downloadResume(application) {
    try {
      const { data } = await api.get(`/admin/applications/${application.id}/resume`, { ...auth, responseType: 'blob' })
      const url = URL.createObjectURL(data); const link = document.createElement('a'); link.href = url; link.download = application.resume_filename; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (reason) { setError(getErrorMessage(reason)) }
  }
  function logout() { sessionStorage.removeItem('list_admin_token'); navigate('/admin/login', { replace: true }) }
  if (!token) return null
  return <div className="admin-dashboard"><aside className="admin-sidebar"><div className="admin-side-brand"><Logo light /><span>CAREERS ADMIN</span></div><div className="admin-side-label">WORKSPACE</div><button className={tab === 'applications' ? 'active' : ''} onClick={() => setTab('applications')}><UsersRound size={17} /> Applications</button><button className={tab === 'jobs' ? 'active' : ''} onClick={() => setTab('jobs')}><BriefcaseBusiness size={17} /> Job listings</button><Link to="/"><ArrowRight className="back-arrow" size={16} /> View website</Link><button className="admin-logout" onClick={logout}><X size={17} /> Sign out</button></aside><main className="admin-main"><header className="admin-topbar"><div><span>LIST SOFTWARE DEMO</span><h1>Recruitment dashboard</h1></div><div className="admin-user"><span>AD</span><div><b>Administrator</b><small>Secure session</small></div><button onClick={logout}>Sign out</button></div></header>
    <div className="admin-content">{error && <div role="alert" className="form-alert form-alert-error">{error}</div>}{notice && <div role="status" className="form-alert form-alert-success"><CircleCheck size={17} />{notice}</div>}
      {stats && <div className="admin-stats">{[['Total roles', stats.jobs, BriefcaseBusiness], ['Published', stats.published_jobs, Check], ['Applications', stats.applications, UsersRound], ['New applications', stats.new_applications, Clock3], ['Enquiries', stats.enquiries, Mail]].map(([label, value, Icon]) => <div className="admin-stat" key={label}><span><Icon size={17} /></span><small>{label}</small><b>{value}</b></div>)}</div>}
      <div className="admin-tab-heading"><div><h2>{tab === 'applications' ? 'Applications' : 'Job listings'}</h2><p>{tab === 'applications' ? 'Review submitted applicant information and update progress.' : 'Create, edit and publish career role listings.'}</p></div>{tab === 'jobs' && <button className="button button-navy" onClick={() => setEditingJob({ ...emptyJob })}>+ Add a role</button>}</div>
      {loading && <div className="empty-state"><span className="loader" /> Loading dashboard…</div>}
      {!loading && tab === 'applications' && <><div className="admin-filters"><label className="search-field"><Search size={16} /><input placeholder="Search name, email or skill" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search applicants" /></label><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by application status"><option value="">All statuses</option>{['received', 'reviewing', 'shortlisted', 'rejected', 'hired'].map((value) => <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</option>)}</select><select value={jobFilter} onChange={(event) => setJobFilter(event.target.value)} aria-label="Filter by job role"><option value="">All roles</option>{jobs.map((job) => <option key={job.id} value={job.id}>{job.title}</option>)}</select></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>APPLICANT</th><th>ROLE</th><th>EXPERIENCE</th><th>RECEIVED</th><th>STATUS</th><th>RESUME</th></tr></thead><tbody>{applications.map((application) => <tr key={application.id}><td><b>{application.name}</b><small>{application.email}</small><small>{application.phone}</small><button className="application-details-link" onClick={() => setViewingApplication(application)}>View details</button></td><td>{application.job_title}</td><td>{application.experience}</td><td>{new Date(application.created_at).toLocaleDateString()}</td><td><select className={`status-select status-${application.status}`} value={application.status} onChange={(event) => updateStatus(application.id, event.target.value)} aria-label={`Status for ${application.name}`}>{['received', 'reviewing', 'shortlisted', 'rejected', 'hired'].map((value) => <option key={value} value={value}>{value}</option>)}</select></td><td><button className="download-button" onClick={() => downloadResume(application)}><Download size={15} /> Download</button></td></tr>)}</tbody></table>{applications.length === 0 && <div className="empty-state">No applications found. Adjust the search or filters to see more results.</div>}</div></>}
      {!loading && tab === 'jobs' && <div className="admin-jobs-list">{jobs.map((job) => <article key={job.id}><div><span className={`publish-badge ${job.is_published ? 'is-published' : ''}`}>{job.is_published ? 'Published' : 'Unpublished'}</span><h3>{job.title}</h3><p>{job.department} · {job.location} · {job.employment_type}</p><ListingStatusBadge job={job} /><small className="mt-2 block">{job.listing_date ? `${job.listing_status === 'historical' ? 'Advertised' : 'Verified'} ${new Date(`${job.listing_date}T00:00:00`).toLocaleDateString()} · ` : ''}{job.availability_note}</small></div><div className="admin-job-actions"><button onClick={() => togglePublished(job)} disabled={publishingJobId === job.id}>{publishingJobId === job.id ? 'Saving…' : job.is_published ? 'Unpublish' : 'Publish'}</button><button onClick={() => setEditingJob(job)}>Edit</button><button className="danger-action" onClick={() => removeJob(job)}>Delete</button></div></article>)}{jobs.length === 0 && <div className="empty-state">No roles yet. Add your first role to get started.</div>}</div>}
      {viewingApplication && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setViewingApplication(null) }}><section className="job-edit-modal application-detail-modal" role="dialog" aria-modal="true" aria-labelledby="application-detail-title"><div className="modal-title"><div><Eyebrow>Candidate application</Eyebrow><h2 id="application-detail-title">{viewingApplication.name}</h2></div><button type="button" onClick={() => setViewingApplication(null)} aria-label="Close application details"><X size={20} /></button></div><dl className="application-detail-grid">{[['Email', viewingApplication.email], ['Phone', viewingApplication.phone], ['Role', viewingApplication.job_title], ['Experience', viewingApplication.experience], ['Qualification', viewingApplication.qualification], ['Location', viewingApplication.location]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || 'Not provided'}</dd></div>)}<div className="application-detail-wide"><dt>Skills</dt><dd>{viewingApplication.skills || 'Not provided'}</dd></div><div className="application-detail-wide"><dt>Cover letter</dt><dd>{viewingApplication.cover_letter || 'No cover letter provided.'}</dd></div></dl><div className="modal-actions"><button className="download-button" onClick={() => downloadResume(viewingApplication)}><Download size={15} /> Download resume</button><button type="button" className="button button-outline" onClick={() => setViewingApplication(null)}>Close</button></div></section></div>}
      {editingJob && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditingJob(null) }}><form className="job-edit-modal" onSubmit={saveJob}><div className="modal-title"><div><Eyebrow>Job editor</Eyebrow><h2>{editingJob.id ? 'Edit role' : 'Add a role'}</h2></div><button type="button" onClick={() => setEditingJob(null)} aria-label="Close"><X size={20} /></button></div><div className="form-grid">{[['title', 'Role title'], ['department', 'Department'], ['experience', 'Experience'], ['location', 'Location'], ['employment_type', 'Employment type']].map(([name, label]) => <label key={name} className="form-field"><span>{label} <i>*</i></span><input name={name} defaultValue={editingJob[name] || ''} required /></label>)}<label className="form-field full-width"><span>Summary <i>*</i></span><input name="summary" defaultValue={editingJob.summary || ''} required minLength={10} maxLength={320} /></label><label className="form-field"><span>Listing status <i>*</i></span><select name="listing_status" defaultValue={editingJob.listing_status || 'illustrative'}><option value="illustrative">Illustrative profile (default)</option><option value="historical">Historical advertisement (closed)</option><option value="current_verified">Currently verified vacancy</option></select></label><label className="form-field"><span>Advertisement / verification date</span><input name="listing_date" type="date" defaultValue={editingJob.listing_date || ''} /></label><label className="form-field full-width"><span>Official source URL</span><input name="listing_source" type="url" defaultValue={editingJob.listing_source || ''} placeholder="https://listspl.co.in/..." /><small className="text-[9px] leading-5 text-slate-500">Historical and currently verified listings require an official listspl.co.in source and date.</small></label>{[['description', 'Description'], ['responsibilities', 'Responsibilities (one per line)'], ['skills', 'Required skills (one per line)'], ['qualification', 'Qualification'], ['availability_note', 'Availability note']].map(([name, label]) => <label key={name} className="form-field full-width"><span>{label} {name !== 'responsibilities' && name !== 'skills' && <i>*</i>}</span><textarea name={name} defaultValue={editingJob[name] || ''} required={name !== 'responsibilities' && name !== 'skills'} rows={name === 'description' ? 3 : 2} /></label>)}<label className="publish-checkbox"><input type="checkbox" name="is_published" defaultChecked={Boolean(editingJob.is_published)} /> Publish listing on public careers page</label></div>{error && <div role="alert" className="form-alert form-alert-error">{error}</div>}<div className="modal-actions"><button type="button" onClick={() => setEditingJob(null)} className="button button-outline">Cancel</button><button className="button button-navy" disabled={saving}>{saving ? 'Saving…' : 'Save role'} <Check size={15} /></button></div></form></div>}
    </div></main></div>
}

function NotFound() {
  return <PageIntro label="404 · Not found" title="This page took a wrong turn." description="The page you’re looking for isn’t here."><Link to="/" className="button button-lime">Return home <ArrowRight size={16} /></Link></PageIntro>
}

export default function App() {
  return <AnimatePresence mode="wait"><Routes>
    <Route path="/" element={<SiteLayout><Home /></SiteLayout>} />
    <Route path="/about" element={<SiteLayout><About /></SiteLayout>} />
    <Route path="/solutions" element={<SiteLayout><Solutions /></SiteLayout>} />
    <Route path="/banking-technology" element={<SiteLayout><BankingTechnology /></SiteLayout>} />
    <Route path="/careers" element={<SiteLayout><Careers /></SiteLayout>} />
    <Route path="/careers/:jobId" element={<SiteLayout><JobDetails /></SiteLayout>} />
    <Route path="/careers/:jobId/apply" element={<SiteLayout><Suspense fallback={<div className="container loading-page"><span className="loader" /> Loading application…</div>}><ApplicationForm /></Suspense></SiteLayout>} />
    <Route path="/contact" element={<SiteLayout><Contact /></SiteLayout>} />
    <Route path="/admin/login" element={<AdminLogin />} />
    <Route path="/admin/dashboard" element={<AdminDashboard />} />
    <Route path="*" element={<SiteLayout><NotFound /></SiteLayout>} />
  </Routes></AnimatePresence>
}
