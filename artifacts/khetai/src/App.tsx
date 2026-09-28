import { useMemo, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  ChevronRight,
  CircleCheck,
  Clock3,
  FileImage,
  History as HistoryIcon,
  IndianRupee,
  Info,
  Leaf,
  MapPin,
  Menu,
  RefreshCw,
  ScanLine,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sprout,
  Store,
  TrendingUp,
  Upload,
  X,
} from 'lucide-react';
import {
  getGetDashboardSummaryQueryKey,
  getGetMandiPricesQueryKey,
  getGetScanQueryKey,
  getListScansQueryKey,
  useCreateScan,
  useGetDashboardSummary,
  useGetMandiPrices,
  useGetScan,
  useListScans,
} from '@workspace/api-client-react';
import type {
  DashboardSummary,
  GetMandiPricesParams,
  MandiPrice,
  Scan,
} from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Link, Route, Router as WouterRouter, Switch, useLocation, useRoute } from 'wouter';
import './index.css';

const queryClient = new QueryClient();

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-3" data-testid="link-brand">
      <span className="leaf-mark" aria-hidden="true"><span className="leaf-stem" /></span>
      <span>
        <span className="block font-display text-[25px] leading-none text-[#E8F5E1]">KhetAI</span>
        <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8FA888]">field companion</span>
      </span>
    </Link>
  );
}

const navItems = [
  { href: '/', label: 'Overview', icon: Sprout },
  { href: '/scan', label: 'Scan a crop', icon: ScanLine },
  { href: '/mandi', label: 'Mandi prices', icon: Store },
  { href: '/history', label: 'Scan history', icon: HistoryIcon },
];

function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="app-noise min-h-[100dvh] bg-[#0E1A0F] text-[#E8F5E1]">
      <aside className={`fixed inset-y-0 left-0 z-30 flex w-[248px] flex-col border-r border-[#243625] bg-[#111C12] px-5 py-7 transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-14 flex items-center justify-between">
          <Brand />
          <button className="rounded-lg p-2 text-[#8FA888] hover:bg-[#1C2B1D] lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation" data-testid="button-close-navigation">
            <X size={18} />
          </button>
        </div>
        <div className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.24em] text-[#658060]">Your field kit</div>
        <nav className="space-y-1.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = href === '/' ? location === '/' : location.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`group flex items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-semibold transition-all duration-200 ${active ? 'bg-[#253D24] text-[#9ADB6B]' : 'text-[#8FA888] hover:bg-[#1A2A1B] hover:text-[#E8F5E1]'}`}
                data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`}
              >
                <Icon size={19} strokeWidth={active ? 2.4 : 1.8} />
                <span>{label}</span>
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#D4A843]" />}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto rounded-lg border border-[#30452F] bg-[#172519] p-4">
          <div className="mb-2 flex items-center gap-2 text-[#D4A843]"><ShieldCheck size={17} /><span className="text-xs font-bold uppercase tracking-wider">Built for the field</span></div>
          <p className="text-[13px] leading-5 text-[#8FA888]">Clear answers for the next decision, right from your phone.</p>
        </div>
      </aside>
      {mobileOpen && <button className="fixed inset-0 z-20 bg-[#081008]/70 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu overlay" data-testid="button-menu-overlay" />}
      <main className="min-h-[100dvh] lg:pl-[248px]">
        <header className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b border-[#1D2D1E] bg-[#0E1A0F]/95 px-5 backdrop-blur-md sm:px-8 lg:px-12">
          <button className="rounded-lg p-2 text-[#8FA888] hover:bg-[#1A2A1B] lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation" data-testid="button-open-navigation"><Menu size={21} /></button>
          <div className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-[#658060] lg:block">A quieter way to farm smarter</div>
          <div className="ml-auto flex items-center gap-3 text-xs text-[#8FA888]"><span className="hidden h-2 w-2 rounded-full bg-[#7AC74F] sm:block" /><span className="hidden sm:block">India field mode</span><span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#385133] bg-[#20341F] text-sm font-bold text-[#9ADB6B]">क</span></div>
        </header>
        <div className="mx-auto max-w-[1320px] px-5 pb-28 pt-8 sm:px-8 lg:px-12 lg:pb-12">{children}</div>
      </main>
      <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-20 flex border-t border-[#2A4029] bg-[#111C12]/95 px-2 pt-2 backdrop-blur-md lg:hidden">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? location === '/' : location.startsWith(href);
          return <Link key={href} href={href} className={`flex flex-1 flex-col items-center gap-1 py-1 text-[11px] font-semibold ${active ? 'text-[#9ADB6B]' : 'text-[#718A6C]'}`} data-testid={`link-mobile-${label.toLowerCase().replaceAll(' ', '-')}`}><Icon size={19} /><span>{label.replace(' a crop', '')}</span></Link>;
        })}
      </nav>
    </div>
  );
}

function SectionTitle({ eyebrow, title, detail }: { eyebrow: string; title: string; detail?: string }) {
  return <div className="mb-7"><div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[#D4A843]"><span className="h-px w-6 bg-[#D4A843]" />{eyebrow}</div><h1 className="font-display text-4xl leading-[1.05] text-[#E8F5E1] sm:text-5xl">{title}</h1>{detail && <p className="mt-3 max-w-2xl text-base leading-6 text-[#8FA888]">{detail}</p>}</div>;
}

function ActionLink({ href, children, secondary = false, testId }: { href: string; children: ReactNode; secondary?: boolean; testId: string }) {
  return <Link href={href} className={`group inline-flex items-center justify-center gap-3 rounded-lg px-5 py-3 text-[15px] font-bold transition-all duration-200 hover:-translate-y-0.5 ${secondary ? 'border border-[#46613D] bg-[#1A2A1B] text-[#D8EBD0] hover:border-[#7AC74F]' : 'bg-[#7AC74F] text-[#0E1A0F] hover:bg-[#91D967]'}`} data-testid={testId}>{children}<ArrowRight size={17} className="transition-transform duration-200 group-hover:translate-x-1" /></Link>;
}

function ErrorPanel({ message = 'We could not load this field note.', retry }: { message?: string; retry: () => void }) {
  return <div className="rounded-xl border border-[#593531] bg-[#231918] p-7 text-center"><AlertTriangle className="mx-auto mb-3 text-[#D77C68]" size={26} /><h3 className="font-display text-2xl text-[#F2DDD5]">A small patch of trouble</h3><p className="mx-auto mt-2 max-w-md text-sm text-[#B89B94]">{message}</p><button onClick={retry} className="mt-5 inline-flex items-center gap-2 rounded-lg border border-[#815147] px-4 py-2 text-sm font-bold text-[#F2DDD5] hover:bg-[#35201D]" data-testid="button-retry"><RefreshCw size={15} />Try again</button></div>;
}

function SkeletonBlock({ className = '' }: { className?: string }) { return <div className={`skeleton rounded-lg ${className}`} />; }
function LoadingCards() { return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[1, 2, 3, 4].map((item) => <SkeletonBlock key={item} className="h-[124px]" />)}</div>; }

function formatDate(value?: string | null) {
  if (!value) return 'Not yet';
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
}
function formatTime(value?: string | null) {
  if (!value) return 'No update';
  return new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}
function money(value: number, unit?: string) { return `₹${value.toLocaleString('en-IN')}${unit ? ` / ${unit}` : ''}`; }
function statusCopy(status: Scan['status']) {
  return status === 'healthy' ? 'Looking healthy' : status === 'attention' ? 'Needs attention' : 'Action needed';
}
function StatusPill({ status }: { status: Scan['status'] }) {
  const healthy = status === 'healthy';
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${healthy ? 'border-[#3E6636] bg-[#1C351A] text-[#9ADB6B]' : status === 'attention' ? 'border-[#80622D] bg-[#302818] text-[#E6C66D]' : 'border-[#78453B] bg-[#321D1A] text-[#E89A83]'}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{statusCopy(status)}</span>;
}

function StatCard({ label, value, detail, icon: Icon, tone = 'green' }: { label: string; value: string | number; detail: string; icon: typeof Sprout; tone?: 'green' | 'gold' }) {
  return <div className="group rounded-xl border border-[#263A26] bg-[#162118] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#486942]"><div className="mb-7 flex items-start justify-between"><span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8FA888]">{label}</span><span className={`rounded-lg p-2 ${tone === 'gold' ? 'bg-[#332B19] text-[#D4A843]' : 'bg-[#223B20] text-[#7AC74F]'}`}><Icon size={18} /></span></div><div className="font-display text-4xl text-[#E8F5E1]">{value}</div><div className="mt-1 text-sm text-[#718A6C]">{detail}</div></div>;
}

function Home() {
  const summaryQuery = useGetDashboardSummary({ query: { queryKey: getGetDashboardSummaryQueryKey() } });
  const summary = summaryQuery.data as DashboardSummary | undefined;
  if (summaryQuery.isLoading) return <div className="page-enter space-y-8"><SkeletonBlock className="h-64" /><LoadingCards /><SkeletonBlock className="h-64" /></div>;
  if (summaryQuery.isError || !summary) return <div className="page-enter pt-10"><ErrorPanel retry={() => summaryQuery.refetch()} /></div>;
  return <div className="page-enter space-y-10">
    <section className="hero-radial relative overflow-hidden rounded-xl border border-[#2A4528] bg-[#142116] px-6 py-9 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
      <div className="relative z-[1] max-w-2xl"><div className="mb-5 flex items-center gap-3 text-sm font-semibold text-[#D4A843]"><span className="h-px w-8 bg-[#D4A843]" />शुभ दिन, किसान</div><h1 className="font-display text-[clamp(2.7rem,6vw,5.8rem)] leading-[0.95] tracking-[-0.03em] text-[#E8F5E1]">आपकी फसल,<br /><em className="text-[#8FD466]">आपका फैसला।</em></h1><p className="mt-5 text-lg font-semibold text-[#BBD3B2] sm:text-xl">Your Crop. Your Decision.</p><p className="mt-2 max-w-lg text-base leading-6 text-[#8FA888]">Detect disease in seconds. Sell at the best mandi price today.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><ActionLink href="/scan" testId="link-scan-hero">Scan My Crop →</ActionLink><ActionLink href="/mandi" secondary testId="link-mandi-hero">Check Mandi Prices →</ActionLink></div></div><div className="pointer-events-none absolute -right-3 bottom-2 hidden opacity-70 sm:block lg:right-16 lg:bottom-8"><div className="leaf-illustration"><span className="stem" /><span className="vein" /></div></div><div className="absolute bottom-5 right-6 hidden text-right text-xs text-[#658060] sm:block"><span className="block text-[#9ADB6B]">Built for small farms</span><span className="mt-1 block">Practical answers, local context</span></div>
    </section>
     <section><div className="mb-4 flex items-end justify-between"><div><div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#658060]">At a glance</div><h2 className="mt-1 font-display text-3xl text-[#E8F5E1]">Your field, in focus</h2></div><span className="hidden text-sm text-[#718A6C] sm:block">Your scans: {summary.totalScans}</span></div><div className="grid gap-4 sm:grid-cols-3"><StatCard label="Farmers reached" value="2.3Cr+" detail="across India" icon={Sprout} /><StatCard label="Crop diseases" value="600+" detail="in our field guide" icon={Leaf} /><StatCard label="Avg income saved" value="₹12,000" detail="per informed decision" icon={TrendingUp} tone="gold" /></div></section>
    <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
      <section className="rounded-xl border border-[#263A26] bg-[#162118] p-6 sm:p-7"><div className="mb-6 flex items-center justify-between"><div><div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#658060]">Most recent scan</div><h2 className="mt-1 font-display text-2xl text-[#E8F5E1]">A note from your field</h2></div><Link href="/history" className="text-sm font-bold text-[#9ADB6B] hover:text-[#D4A843]" data-testid="link-view-history-home">View history <ChevronRight className="inline" size={15} /></Link></div>{summary.latestScan ? <div className="flex flex-col gap-5 sm:flex-row"><div className="flex h-36 w-full shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#324B31] bg-[#1C2B1D] sm:w-40">{summary.latestScan.imageData ? <img src={summary.latestScan.imageData} alt={`${summary.latestScan.crop} scan`} className="h-full w-full object-cover" /> : <div className="leaf-illustration scale-[.52]"><span className="stem" /><span className="vein" /></div>}</div><div className="flex-1"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm text-[#8FA888]">{formatDate(summary.latestScan.createdAt)}</p><h3 className="mt-1 font-display text-3xl text-[#E8F5E1]">{summary.latestScan.crop}</h3></div><StatusPill status={summary.latestScan.status} /></div><p className="mt-3 line-clamp-2 text-sm leading-5 text-[#8FA888]">{summary.latestScan.summary}</p><Link href={`/history/${summary.latestScan.id}`} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#9ADB6B]" data-testid={`link-latest-scan-${summary.latestScan.id}`}>Read full finding <ArrowRight size={14} /></Link></div></div> : <EmptyState compact icon={ScanLine} title="Your first scan is waiting" body="Take a clear photo of a leaf or fruit to get a field-ready finding." action={<ActionLink href="/scan" testId="link-start-first-scan">Start a scan</ActionLink>} />}</section>
      <section className="rounded-xl border border-[#3E3924] bg-[#1A1F15] p-6 sm:p-7"><div className="mb-6 flex items-center justify-between"><div><div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#D4A843]"><span className="h-1.5 w-1.5 rounded-full bg-[#D4A843]" />Best nearby price</div><h2 className="mt-1 font-display text-2xl text-[#E8F5E1]">Mandi watch</h2></div><Link href="/mandi" className="text-sm font-bold text-[#D4A843] hover:text-[#E8F5E1]" data-testid="link-view-mandi-home">Explore <ChevronRight className="inline" size={15} /></Link></div>{summary.topMandiPrice ? <div><div className="flex items-end justify-between gap-4"><div><h3 className="font-display text-4xl text-[#E8F5E1]">{summary.topMandiPrice.commodity}</h3><p className="mt-1 flex items-center gap-1.5 text-sm text-[#8FA888]"><MapPin size={14} className="text-[#D4A843]" />{summary.topMandiPrice.market}, {summary.topMandiPrice.state}</p></div><div className="text-right"><div className="font-display text-3xl text-[#D4A843]">{money(summary.topMandiPrice.modalPrice)}</div><div className="text-xs text-[#718A6C]">{summary.topMandiPrice.unit}</div></div></div><div className="mt-7 border-t border-[#3C3A26] pt-4 text-xs text-[#8FA888]">Modal price · updated {formatTime(summary.topMandiPrice.updatedAt)}</div></div> : <EmptyState compact icon={Store} title="No price on the board" body="Check the mandi page for live wholesale rates in your region." action={<ActionLink href="/mandi" secondary testId="link-check-mandi-empty">Check prices</ActionLink>} />}</section>
     </div>
     <section className="grid gap-4 sm:grid-cols-3">
       <Link href="/scan" className="group rounded-xl border border-[#263A26] bg-[#162118] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#4B6D42]" data-testid="link-feature-disease-scan"><div className="mb-8 flex h-10 w-10 items-center justify-center rounded-lg bg-[#223B20] text-[#7AC74F]"><ScanLine size={19} /></div><div className="flex items-end justify-between gap-3"><div><h3 className="font-display text-2xl text-[#E8F5E1]">Disease scan</h3><p className="mt-1 text-sm text-[#8FA888]">Know what changed on your plant.</p></div><ArrowRight size={17} className="text-[#7AC74F] transition-transform group-hover:translate-x-1" /></div></Link>
       <Link href="/mandi" className="group rounded-xl border border-[#3E3924] bg-[#1A1F15] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#806B35]" data-testid="link-feature-mandi-rates"><div className="mb-8 flex h-10 w-10 items-center justify-center rounded-lg bg-[#332B19] text-[#D4A843]"><Store size={19} /></div><div className="flex items-end justify-between gap-3"><div><h3 className="font-display text-2xl text-[#E8F5E1]">Mandi rates</h3><p className="mt-1 text-sm text-[#8FA888]">Compare before you take it to market.</p></div><ArrowRight size={17} className="text-[#D4A843] transition-transform group-hover:translate-x-1" /></div></Link>
       <Link href="/history" className="group rounded-xl border border-[#263A26] bg-[#162118] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#4B6D42]" data-testid="link-feature-history-log"><div className="mb-8 flex h-10 w-10 items-center justify-center rounded-lg bg-[#223B20] text-[#7AC74F]"><HistoryIcon size={19} /></div><div className="flex items-end justify-between gap-3"><div><h3 className="font-display text-2xl text-[#E8F5E1]">History log</h3><p className="mt-1 text-sm text-[#8FA888]">Keep every field finding close.</p></div><ArrowRight size={17} className="text-[#7AC74F] transition-transform group-hover:translate-x-1" /></div></Link>
     </section>
  </div>;
}

function EmptyState({ icon: Icon, title, body, action, compact = false }: { icon: typeof Sprout; title: string; body: string; action?: ReactNode; compact?: boolean }) {
  return <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-4' : 'min-h-[280px] rounded-xl border border-dashed border-[#395137] bg-[#142016] p-8'}`}><div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#3B5D34] bg-[#20341F] text-[#7AC74F]"><Icon size={21} /></div><h3 className="font-display text-2xl text-[#E8F5E1]">{title}</h3><p className="mt-2 max-w-sm text-sm leading-5 text-[#8FA888]">{body}</p>{action && <div className="mt-5">{action}</div>}</div>;
}

function ScanPage() {
  const [imageData, setImageData] = useState('');
  const [fileName, setFileName] = useState('');
  const [crop, setCrop] = useState('');
  const [result, setResult] = useState<Scan | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const createScan = useCreateScan();
  const qc = useQueryClient();
  const onFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setImageData(String(reader.result || ''));
    reader.readAsDataURL(file);
  };
  const submit = () => {
    if (!imageData) return;
    createScan.mutate({ data: { imageData, fileName: fileName || undefined, crop: crop || undefined } }, {
      onSuccess: (scan) => {
        setResult(scan);
        void qc.invalidateQueries({ queryKey: getListScansQueryKey({ limit: 50 }) });
        void qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      },
    });
  };
  return <div className="page-enter"><SectionTitle eyebrow="Crop check" title="See what your plant is telling you." detail="A clear photo is the fastest way to understand what needs attention. Photograph one leaf in good daylight, without a shadow over the detail." />
    {result ? <ScanResult scan={result} onScanAgain={() => { setResult(null); setImageData(''); setFileName(''); }} /> : <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
      <section className="rounded-xl border border-[#304A2D] bg-[#162118] p-5 sm:p-7"><div className="mb-5 flex items-center justify-between"><div><div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#658060]">Step 01</div><h2 className="mt-1 font-display text-2xl text-[#E8F5E1]">Add a crop photo</h2></div><span className="rounded-full border border-[#3A5835] px-3 py-1 text-xs text-[#8FA888]">JPG or PNG</span></div>
        <div className={`relative flex min-h-[310px] items-center justify-center overflow-hidden rounded-lg border border-dashed ${imageData ? 'border-[#7AC74F] bg-[#0F1C10]' : 'border-[#486342] bg-[#1B2A1B]'}`}>{imageData ? <><img src={imageData} alt="Selected crop" className="absolute inset-0 h-full w-full object-contain p-2" /><button onClick={() => { setImageData(''); setFileName(''); }} className="absolute right-3 top-3 rounded-full bg-[#0E1A0F]/90 p-2 text-[#E8F5E1] hover:text-[#D4A843]" aria-label="Remove selected photo" data-testid="button-remove-photo"><X size={17} /></button></> : <div className="px-6 text-center"><div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[#476440] bg-[#213820] text-[#7AC74F]"><FileImage size={27} /></div><h3 className="font-display text-2xl text-[#D8EBD0]">Place your leaf here</h3><p className="mx-auto mt-2 max-w-xs text-sm leading-5 text-[#8FA888]">Use a photo with the affected area in focus and enough natural light.</p><div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row"><button onClick={() => fileRef.current?.click()} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#7AC74F] px-4 py-2.5 text-sm font-bold text-[#0E1A0F] hover:bg-[#91D967]" data-testid="button-upload-photo"><Upload size={16} />Upload photo</button><button onClick={() => cameraRef.current?.click()} className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#4A6843] px-4 py-2.5 text-sm font-bold text-[#D8EBD0] hover:bg-[#243B24]" data-testid="button-capture-photo"><Camera size={16} />Use camera</button></div></div>}<input ref={fileRef} onChange={onFile} type="file" accept="image/*" className="hidden" data-testid="input-upload-photo" /><input ref={cameraRef} onChange={onFile} type="file" accept="image/*" capture="environment" className="hidden" data-testid="input-capture-photo" /></div>
        {fileName && <div className="mt-3 flex items-center gap-2 text-sm text-[#9ADB6B]"><Check size={15} />{fileName}</div>}
      </section>
      <section className="rounded-xl border border-[#263A26] bg-[#162118] p-6 sm:p-7"><div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#658060]">Step 02</div><h2 className="mt-1 font-display text-2xl text-[#E8F5E1]">Tell us the crop</h2><p className="mt-2 text-sm leading-5 text-[#8FA888]">Optional, but it helps us make the finding more useful for your field.</p><label className="mt-7 block text-sm font-semibold text-[#BBD3B2]" htmlFor="crop-select">Crop name</label><select id="crop-select" value={crop} onChange={(event) => setCrop(event.target.value)} className="mt-2 w-full rounded-lg border border-[#3D5739] bg-[#101B11] px-3 py-3 text-[#E8F5E1] outline-none transition-colors focus:border-[#7AC74F]" data-testid="select-crop"><option value="">Select if you know it</option><option value="Rice">Rice</option><option value="Wheat">Wheat</option><option value="Cotton">Cotton</option><option value="Tomato">Tomato</option><option value="Potato">Potato</option><option value="Chilli">Chilli</option><option value="Other">Other crop</option></select><div className="mt-7 rounded-lg border border-[#324B31] bg-[#1B2B1C] p-4"><div className="flex gap-3"><Info size={17} className="mt-0.5 shrink-0 text-[#D4A843]" /><p className="text-sm leading-5 text-[#8FA888]">KhetAI gives an informed starting point. For a serious infestation, confirm with your local agriculture officer.</p></div></div><button onClick={submit} disabled={!imageData || createScan.isPending} className="mt-7 flex w-full items-center justify-center gap-2 rounded-lg bg-[#7AC74F] px-5 py-3.5 text-[15px] font-bold text-[#0E1A0F] transition-all hover:bg-[#91D967] disabled:cursor-not-allowed disabled:opacity-40" data-testid="button-submit-scan">{createScan.isPending ? <><RefreshCw size={17} className="animate-spin" />Reading your crop...</> : <>Get my crop finding <ArrowRight size={17} /></>}</button>{createScan.isError && <p className="mt-3 text-center text-sm text-[#E89A83]" data-testid="status-scan-error">We could not read that image. Please try another clear photo.</p>}</section>
    </div>}
  </div>;
}

function ScanResult({ scan, onScanAgain }: { scan: Scan; onScanAgain: () => void }) {
  return <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]"><section className="rounded-xl border border-[#304A2D] bg-[#162118] p-5 sm:p-7"><div className="mb-5 flex items-center justify-between"><div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#658060]">Finding ready</div><StatusPill status={scan.status} /></div><div className="flex min-h-[260px] items-center justify-center overflow-hidden rounded-lg bg-[#1B2A1B]">{scan.imageData ? <img src={scan.imageData} alt={`${scan.crop} diagnosis`} className="h-full max-h-[370px] w-full object-contain" /> : <div className="leaf-illustration"><span className="stem" /><span className="vein" /></div>}</div><button onClick={onScanAgain} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#9ADB6B] hover:text-[#D4A843]" data-testid="button-scan-again"><ScanLine size={15} />Scan another crop</button></section><section className="rounded-xl border border-[#263A26] bg-[#162118] p-6 sm:p-8"><div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#2B412A] pb-5"><div><p className="text-sm text-[#8FA888]">{formatDate(scan.createdAt)}</p><h2 className="mt-1 font-display text-4xl text-[#E8F5E1]">{scan.crop || 'Your crop'}</h2><p className="mt-1 text-lg text-[#BBD3B2]">{scan.disease}</p></div><div className="rounded-lg bg-[#213820] px-4 py-3 text-right"><div className="font-display text-3xl text-[#9ADB6B]">{Math.round(scan.confidence)}%</div><div className="text-xs text-[#8FA888]">confidence</div></div></div><p className="mt-6 text-base leading-7 text-[#C0D4B9]">{scan.summary}</p><div className="mt-8 grid gap-6 sm:grid-cols-2"><div><h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#D4A843]"><ShieldCheck size={16} />What to do now</h3><ul className="space-y-3">{scan.treatment.map((item, index) => <li key={item} className="flex gap-2 text-sm leading-5 text-[#BBD3B2]"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#7AC74F]" />{item}</li>)}</ul></div><div><h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#D4A843]"><Leaf size={16} />Keep it from returning</h3><ul className="space-y-3">{scan.prevention.map((item) => <li key={item} className="flex gap-2 text-sm leading-5 text-[#BBD3B2]"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D4A843]" />{item}</li>)}</ul></div></div></section></div>;
}

function MandiPage() {
  const [commodity, setCommodity] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const params = useMemo<GetMandiPricesParams>(() => ({ commodity: commodity || undefined, district: district || undefined, state: state || undefined, limit: 50 }), [commodity, district, state]);
  const pricesQuery = useGetMandiPrices(params, { query: { queryKey: getGetMandiPricesQueryKey(params) } });
  const data = pricesQuery.data;
  return <div className="page-enter"><SectionTitle eyebrow="Mandi watch" title="Know the market before you sell." detail="Current wholesale prices from mandis, so you can make a better call on where and when to take your harvest." />
    <section className="mb-6 rounded-xl border border-[#3E3924] bg-[#1A1F15] p-4 sm:p-5"><div className="flex flex-col gap-3 md:flex-row"><label className="relative flex-1"><Search size={17} className="absolute left-3 top-3.5 text-[#718A6C]" /><input value={commodity} onChange={(event) => setCommodity(event.target.value)} placeholder="Search commodity, e.g. wheat" className="w-full rounded-lg border border-[#4E4A2B] bg-[#111A10] py-3 pl-10 pr-3 text-[#E8F5E1] placeholder:text-[#718A6C] outline-none focus:border-[#D4A843]" data-testid="input-search-commodity" /></label><button onClick={() => setShowFilters(!showFilters)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#4E4A2B] px-4 py-3 text-sm font-bold text-[#D4A843] hover:bg-[#2A281B]" data-testid="button-toggle-mandi-filters"><SlidersHorizontal size={16} />Filters</button>{(commodity || district || state) && <button onClick={() => { setCommodity(''); setDistrict(''); setState(''); }} className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-bold text-[#8FA888] hover:text-[#E8F5E1]" data-testid="button-clear-mandi-filters"><X size={16} />Clear</button>}</div>{showFilters && <div className="mt-4 grid gap-3 border-t border-[#3C3A26] pt-4 sm:grid-cols-2"><label className="text-sm font-semibold text-[#BBD3B2]">District<input value={district} onChange={(event) => setDistrict(event.target.value)} placeholder="Your district" className="mt-2 w-full rounded-lg border border-[#3D5739] bg-[#101B11] px-3 py-2.5 font-normal text-[#E8F5E1] placeholder:text-[#718A6C] outline-none focus:border-[#D4A843]" data-testid="input-filter-district" /></label><label className="text-sm font-semibold text-[#BBD3B2]">State<input value={state} onChange={(event) => setState(event.target.value)} placeholder="Your state" className="mt-2 w-full rounded-lg border border-[#3D5739] bg-[#101B11] px-3 py-2.5 font-normal text-[#E8F5E1] placeholder:text-[#718A6C] outline-none focus:border-[#D4A843]" data-testid="input-filter-state" /></label></div>}</section>
    {pricesQuery.isLoading ? <div className="space-y-3">{[1, 2, 3, 4, 5].map((item) => <SkeletonBlock key={item} className="h-20" />)}</div> : pricesQuery.isError || !data ? <ErrorPanel message="Mandi prices are taking a little longer to arrive." retry={() => pricesQuery.refetch()} /> : <><div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm text-[#8FA888]"><span>{data.prices.length} rates found</span><span className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${data.isLive ? 'bg-[#7AC74F]' : 'bg-[#D4A843]'}`} />{data.isLive ? 'Live rates' : 'Latest available'} · {formatTime(data.lastUpdated)}</span></div>{data.prices.length === 0 ? <EmptyState icon={Store} title="No prices match those filters" body="Try a broader commodity, district, or state search." action={<button onClick={() => { setCommodity(''); setDistrict(''); setState(''); }} className="rounded-lg border border-[#4E6A43] px-4 py-2 text-sm font-bold text-[#9ADB6B]" data-testid="button-reset-empty-mandi">Reset filters</button>} /> : <MandiTable prices={data.prices} source={data.source} />}</>}
  </div>;
}

function MandiTable({ prices, source }: { prices: MandiPrice[]; source: string }) {
  return <div className="overflow-hidden rounded-xl border border-[#2B412A] bg-[#162118]"><div className="hidden overflow-x-auto md:block"><table className="w-full text-left"><thead className="border-b border-[#2B412A] bg-[#1B2B1C] text-[11px] uppercase tracking-[0.16em] text-[#718A6C]"><tr><th className="px-5 py-4">Commodity</th><th className="px-4 py-4">Market</th><th className="px-4 py-4">Min / max</th><th className="px-4 py-4 text-right">Modal price</th><th className="px-5 py-4 text-right">Updated</th></tr></thead><tbody className="divide-y divide-[#263A26]">{prices.map((price) => <tr key={price.id} className="transition-colors hover:bg-[#1A2A1B]" data-testid={`row-mandi-price-${price.id}`}><td className="px-5 py-5"><div className="font-display text-xl text-[#E8F5E1]">{price.commodity}</div><div className="text-sm text-[#8FA888]">{price.variety} · {price.unit}</div></td><td className="px-4 py-5"><div className="flex items-center gap-1.5 font-semibold text-[#BBD3B2]"><MapPin size={14} className="text-[#D4A843]" />{price.market}</div><div className="ml-5 text-xs text-[#718A6C]">{price.district}, {price.state}</div></td><td className="px-4 py-5 text-sm text-[#8FA888]">₹{price.minPrice.toLocaleString('en-IN')} – ₹{price.maxPrice.toLocaleString('en-IN')}</td><td className="px-4 py-5 text-right"><div className="font-display text-2xl text-[#D4A843]">₹{price.modalPrice.toLocaleString('en-IN')}</div><div className="text-xs text-[#718A6C]">per {price.unit}</div></td><td className="px-5 py-5 text-right text-xs text-[#718A6C]">{formatTime(price.updatedAt)}</td></tr>)}</tbody></table></div><div className="divide-y divide-[#263A26] md:hidden">{prices.map((price) => <div key={price.id} className="p-5" data-testid={`card-mandi-price-${price.id}`}><div className="flex items-start justify-between gap-3"><div><h3 className="font-display text-2xl text-[#E8F5E1]">{price.commodity}</h3><p className="mt-0.5 text-sm text-[#8FA888]">{price.variety} · {price.market}</p></div><div className="text-right"><div className="font-display text-2xl text-[#D4A843]">₹{price.modalPrice.toLocaleString('en-IN')}</div><div className="text-xs text-[#718A6C]">per {price.unit}</div></div></div><div className="mt-4 flex items-center justify-between border-t border-[#2B412A] pt-3 text-xs text-[#718A6C]"><span>{price.district}, {price.state}</span><span>₹{price.minPrice.toLocaleString('en-IN')} – ₹{price.maxPrice.toLocaleString('en-IN')}</span></div></div>)}</div><div className="border-t border-[#2B412A] px-5 py-3 text-xs text-[#718A6C]">Source: {source}</div></div>;
}

function HistoryPage() {
  const scansQuery = useListScans({ limit: 50 }, { query: { queryKey: getListScansQueryKey({ limit: 50 }) } });
  const scans = scansQuery.data as Scan[] | undefined;
  return <div className="page-enter"><SectionTitle eyebrow="Your records" title="Every scan, kept close." detail="A simple record of what you saw in the field, so you can notice patterns across the season." />{scansQuery.isLoading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <SkeletonBlock key={item} className="h-64" />)}</div> : scansQuery.isError ? <ErrorPanel message="Your scan history could not be opened." retry={() => scansQuery.refetch()} /> : scans && scans.length > 0 ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{scans.map((scan, index) => <ScanCard key={scan.id} scan={scan} index={index} />)}</div> : <EmptyState icon={HistoryIcon} title="No field notes yet" body="Your completed crop scans will appear here, with the finding and steps to take next." action={<ActionLink href="/scan" testId="link-history-first-scan">Make your first scan</ActionLink>} />}</div>;
}

function ScanCard({ scan, index }: { scan: Scan; index: number }) {
  return <Link href={`/history/${scan.id}`} className={`group page-enter stagger-${Math.min(index + 1, 3)} overflow-hidden rounded-xl border border-[#263A26] bg-[#162118] transition-all duration-300 hover:-translate-y-1 hover:border-[#4B6D42]`} data-testid={`link-scan-card-${scan.id}`}><div className="relative flex h-40 items-center justify-center overflow-hidden bg-[#1B2A1B]">{scan.imageData ? <img src={scan.imageData} alt={`${scan.crop} scan`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="leaf-illustration scale-[.42]"><span className="stem" /><span className="vein" /></div>}<div className="absolute left-3 top-3"><StatusPill status={scan.status} /></div></div><div className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-[#718A6C]">{formatDate(scan.createdAt)}</p><h3 className="mt-1 font-display text-2xl text-[#E8F5E1]">{scan.crop || 'Crop scan'}</h3></div><ChevronRight size={18} className="mt-2 text-[#658060] transition-transform group-hover:translate-x-1 group-hover:text-[#9ADB6B]" /></div><p className="mt-2 line-clamp-2 text-sm text-[#8FA888]">{scan.disease}</p><div className="mt-5 flex items-center justify-between border-t border-[#2B412A] pt-3 text-xs text-[#718A6C]"><span>{Math.round(scan.confidence)}% confidence</span><span>{formatTime(scan.createdAt)}</span></div></div></Link>;
}

function ScanDetailPage() {
  const [, params] = useRoute<{ id: string }>('/history/:id');
  const [, setLocation] = useLocation();
  const id = Number(params?.id || 0);
  const scanQuery = useGetScan(id, { query: { enabled: id > 0, queryKey: getGetScanQueryKey(id) } });
  return <div className="page-enter"><Link href="/history" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-[#8FA888] hover:text-[#9ADB6B]" data-testid="link-back-history"><ArrowLeft size={16} />Back to scan history</Link>{scanQuery.isLoading ? <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]"><SkeletonBlock className="h-[480px]" /><SkeletonBlock className="h-[480px]" /></div> : scanQuery.isError || !scanQuery.data ? <ErrorPanel message="This scan is not available right now." retry={() => scanQuery.refetch()} /> : <ScanResult scan={scanQuery.data} onScanAgain={() => setLocation('/scan')} />}</div>;
}

function Router() {
  return <RoutedErrorBoundary><Shell><Switch><Route path="/" component={Home} /><Route path="/scan" component={ScanPage} /><Route path="/mandi" component={MandiPage} /><Route path="/history/:id" component={ScanDetailPage} /><Route path="/history" component={HistoryPage} /><Route component={NotFound} /></Switch></Shell></RoutedErrorBoundary>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;