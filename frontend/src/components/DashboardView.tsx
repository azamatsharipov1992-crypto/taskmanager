import React from 'react';
import { DashboardStats, Issue, Customer } from '../types';
import { translations, Language } from '../translations';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Layers, 
  Send, 
  ShieldAlert, 
  UserCheck, 
  ArrowUpRight,
  Sparkles,
  BellRing,
  Activity,
  Building2,
  Users,
  MapPin,
  Package,
  TrendingUp,
  Link as LinkIcon
} from 'lucide-react';

interface DashboardViewProps {
  stats: DashboardStats | null;
  issues: Issue[];
  customers?: Customer[];
  lang: Language;
  onSelectIssue: (issue: Issue) => void;
  onNavigateToTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  issues,
  customers = [],
  lang,
  onSelectIssue,
  onNavigateToTab
}) => {
  const t = translations[lang];

  const pendingCustomerDispatch = issues.filter(i => i.stage === 'STAGE_2_RESOLVED' && i.status === 'SOLUTION_READY');
  const pendingCustomerConfirmation = issues.filter(i => i.stage === 'STAGE_3_DISPATCHED' && i.status === 'CUSTOMER_CONFIRM');

  const totalIssuesCount = stats?.totalIssues || 0;
  const maxProductCount = Math.max(...(stats?.productDistribution?.map(p => p.count) || [1]), 1);

  return (
    <div className="space-y-6">
      {/* Hi-Tech Mission Control Hero */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-hicyan-light dark:bg-hicyan/20 text-hicyan-dark dark:text-hicyan-neon border border-hicyan/30 font-bold">
              // TELEMETRY: REAL-TIME
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              CLUSTER: NODE-1 // ASIA-TASHKENT (14 HUDUD)
            </span>
          </div>

          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>{lang === 'UZ' ? 'Boshqaruv & Nazorat Markazi' : 'Центр Управления и Контроля'}</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl font-medium">
            {lang === 'UZ' 
              ? 'Mijozlar hisobi, 14 ta hudud kesimidagi murojaatlar va Telegram xabarnomalar monitoringi.' 
              : 'Учет клиентов, обращения в разрезе 14 регионов и мониторинг Telegram уведомлений.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
          <button
            onClick={() => onNavigateToTab('customers')}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors font-bold cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-hicyan" />
            <span>MIJOZLAR BAZASI</span>
          </button>
          <button
            onClick={() => onNavigateToTab('reports')}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors font-bold cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-emerald-500" />
            <span>VILOYATLAR</span>
          </button>
          <button
            onClick={() => onNavigateToTab('kanban')}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-hicyan dark:hover:bg-hicyan-dark text-white rounded-xl transition-colors font-bold shadow-sm cursor-pointer"
          >
            <span>KANBAN</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 6 Hi-Tech Primary KPI Tiles (Incorporating Customer Metrics) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 font-mono">
        {/* Total Issues */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1 text-xs font-bold">
            <span>TOTAL ISSUES</span>
            <Layers className="w-4 h-4 text-hicyan" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stats?.totalIssues || 0}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-sans font-medium">Jami murojaatlar</div>
        </div>

        {/* Today Issues */}
        <div className="bg-hicyan-light/30 dark:bg-hicyan/10 border border-hicyan/30 p-4 rounded-2xl shadow-sm transition-colors">
          <div className="flex items-center justify-between text-hicyan-dark dark:text-hicyan-neon mb-1 text-xs font-bold">
            <span>TODAY</span>
            <Clock className="w-4 h-4 text-hicyan" />
          </div>
          <div className="text-3xl font-black text-hicyan-dark dark:text-hicyan-neon tracking-tight">{stats?.todayIssues || 0}</div>
          <div className="text-[11px] text-hicyan-dark dark:text-hicyan-neon mt-1 font-sans font-medium">Bugungi yangi</div>
        </div>

        {/* Total Customers */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm transition-colors cursor-pointer hover:border-hicyan/50" onClick={() => onNavigateToTab('customers')}>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1 text-xs font-bold">
            <span>CUSTOMERS</span>
            <Building2 className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stats?.totalCustomers || 0}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-sans font-medium">Jami korxonalar</div>
        </div>

        {/* Active Customers */}
        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 p-4 rounded-2xl shadow-sm transition-colors cursor-pointer" onClick={() => onNavigateToTab('customers')}>
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300 mb-1 text-xs font-bold">
            <span>ACTIVE CLIENTS</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">{stats?.activeCustomers || 0}</div>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-1 font-sans font-medium">Faol foydalanuvchi</div>
        </div>

        {/* Telegram Linked */}
        <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 p-4 rounded-2xl shadow-sm transition-colors cursor-pointer" onClick={() => onNavigateToTab('reports')}>
          <div className="flex items-center justify-between text-blue-700 dark:text-blue-300 mb-1 text-xs font-bold">
            <span>TG CONNECTED</span>
            <BellRing className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tight">{stats?.telegramLinkedCustomers || 0}</div>
          <div className="text-[11px] text-blue-700 dark:text-blue-300 mt-1 font-sans font-medium">Telegram ulangan</div>
        </div>

        {/* Closed Issues */}
        <div className="bg-himint-light/40 dark:bg-himint/10 border border-himint/40 dark:border-himint/30 p-4 rounded-2xl shadow-sm transition-colors">
          <div className="flex items-center justify-between text-himint-dark dark:text-himint-neon mb-1 text-xs font-bold">
            <span>STAGE 04: CLOSED</span>
            <CheckCircle2 className="w-4 h-4 text-himint" />
          </div>
          <div className="text-3xl font-black text-himint dark:text-himint-neon tracking-tight">{stats?.closedIssues || 0}</div>
          <div className="text-[11px] text-himint-dark dark:text-himint-neon mt-1 font-sans font-medium">Mijoz tasdiqlagan</div>
        </div>
      </div>

      {/* 4-Stage Control Funnel Radar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-sm font-mono">
          <span className="font-bold text-slate-900 dark:text-white">// 4-STAGE PIPELINE RADAR</span>
          <span className="text-slate-500 dark:text-slate-400 font-semibold text-xs">ENFORCED BUSINESS RULES</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 font-mono">
          {/* Stage 1 */}
          <div className="p-4 bg-hicyan-light/30 dark:bg-hicyan/10 border border-hicyan/30 rounded-xl">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-hicyan-dark dark:text-hicyan-neon">01 // QABUL & DEV</span>
              <span className="text-sm font-bold bg-white dark:bg-slate-800 text-hicyan px-2.5 py-0.5 rounded border border-hicyan/20">
                {stats?.stagesCount.stage1 || 0}
              </span>
            </div>
            <p className="text-xs font-sans text-slate-600 dark:text-slate-300 mt-1">
              Dasturchi muammoni tahlil qilmoqda va tuzatmoqda
            </p>
          </div>

          {/* Stage 2 */}
          <div className="p-4 bg-hiamber-light/60 dark:bg-hiamber/15 border border-hiamber/50 rounded-xl">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-hiamber-dark dark:text-hiamber-neon">02 // YECHIM TAYYOR</span>
              <span className="text-sm font-bold bg-white dark:bg-slate-800 text-hiamber px-2.5 py-0.5 rounded border border-hiamber/30">
                {stats?.stagesCount.stage2 || 0}
              </span>
            </div>
            <p className="text-xs font-sans text-slate-700 dark:text-slate-300 mt-1">
              Dasturchi yechim topshirdi. Mijozga yetkazish shart!
            </p>
          </div>

          {/* Stage 3 */}
          <div className="p-4 bg-hiamber-light/40 dark:bg-hiamber/10 border border-hiamber/40 rounded-xl">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-hiamber-dark dark:text-hiamber-neon">03 // YETKAZILDI</span>
              <span className="text-sm font-bold bg-white dark:bg-slate-800 text-hiamber px-2.5 py-0.5 rounded border border-hiamber/30">
                {stats?.stagesCount.stage3 || 0}
              </span>
            </div>
            <p className="text-xs font-sans text-slate-700 dark:text-slate-300 mt-1">
              Mijoz sinovdan o'tkazmoqda, tasdiq kutilmoqda
            </p>
          </div>

          {/* Stage 4 */}
          <div className="p-4 bg-himint-light/50 dark:bg-himint/15 border border-himint/40 rounded-xl">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-himint-dark dark:text-himint-neon">04 // TASDIQLANDI</span>
              <span className="text-sm font-bold bg-white dark:bg-slate-800 text-himint px-2.5 py-0.5 rounded border border-himint/30">
                {stats?.stagesCount.stage4 || 0}
              </span>
            </div>
            <p className="text-xs font-sans text-slate-700 dark:text-slate-300 mt-1">
              Mijoz to'liq rozi bo'lgach rasman yopilgan
            </p>
          </div>
        </div>
      </div>

      {/* NEW WIDGETS: TOP REGIONS & SOFTWARE PRODUCTS BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Regions Widget */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100 dark:border-slate-800 font-mono text-xs">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-hicyan" />
              <span>// TOP VILOYATLAR (MUROJAATLAR TAQSIMOTI)</span>
            </span>
            <button
              onClick={() => onNavigateToTab('reports')}
              className="text-hicyan hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>14 HUDUD MATRITSASI</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {stats?.topRegions && stats.topRegions.length > 0 ? (
              stats.topRegions.slice(0, 5).map((reg) => {
                const pct = totalIssuesCount > 0 ? Math.round((reg.count / totalIssuesCount) * 100) : 0;
                return (
                  <div key={reg.regionId} className="space-y-1">
                    <div className="flex items-center justify-between text-slate-800 dark:text-slate-200">
                      <span className="font-sans font-bold flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {reg.regionName}
                      </span>
                      <span className="font-bold">
                        {reg.count} ta <span className="text-slate-400 font-normal">({pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="bg-hicyan h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(pct, reg.count > 0 ? 8 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-slate-400">Hududlar ma'lumotlari kutilmoqda</div>
            )}
          </div>
        </div>

        {/* Software Products Distribution Widget */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100 dark:border-slate-800 font-mono text-xs">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-purple-500" />
              <span>// DASTURIY MAHSULOTLAR KESIMIDA</span>
            </span>
            <button
              onClick={() => onNavigateToTab('reports')}
              className="text-hicyan hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>HISOBOTNI KO‘RISH</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {stats?.productDistribution && stats.productDistribution.length > 0 ? (
              stats.productDistribution.map((prod) => {
                const pct = totalIssuesCount > 0 ? Math.round((prod.count / totalIssuesCount) * 100) : 0;
                return (
                  <div key={prod.productId} className="space-y-1">
                    <div className="flex items-center justify-between text-slate-800 dark:text-slate-200">
                      <span className="font-sans font-bold flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-slate-400" />
                        {prod.productName}
                      </span>
                      <span className="font-bold">
                        {prod.count} ta <span className="text-slate-400 font-normal">({pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(pct, prod.count > 0 ? 8 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-slate-400">Mahsulotlar ma'lumotlari kutilmoqda</div>
            )}
          </div>
        </div>
      </div>

      {/* Critical Stage 2 & Stage 3 Alert Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Stage 2 Action Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100 dark:border-slate-800 font-mono text-xs">
            <span className="font-bold text-hiamber flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-hiamber" />
              <span>// STAGE 02: MIJOZGA YETKAZILMAGAN YECHIMLAR</span>
            </span>
            <span className="px-2.5 py-1 rounded bg-hiamber-light dark:bg-hiamber/20 text-hiamber-dark dark:text-hiamber-neon font-bold">
              {pendingCustomerDispatch.length} TA
            </span>
          </div>

          {pendingCustomerDispatch.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400 font-mono border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              // Barcha yechimlar mijozlarga yetkazilgan
            </div>
          ) : (
            <div className="space-y-2.5 font-mono text-xs">
              {pendingCustomerDispatch.map((iss) => (
                <div
                  key={iss.id}
                  onClick={() => onSelectIssue(iss)}
                  className="p-3.5 bg-hiamber-light/30 dark:bg-hiamber/10 border border-hiamber/30 hover:border-hiamber rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-hiamber-dark dark:text-hiamber-neon">[{iss.code}]</span>
                      <span className="font-sans font-semibold text-slate-900 dark:text-white group-hover:text-hiamber transition-colors text-sm">
                        {iss.title}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-1 flex items-center gap-2">
                      <span>🏢 {iss.customerName}</span>
                      <span>•</span>
                      <span>📍 {iss.regionName || 'Hudud'}</span>
                      <span>•</span>
                      <span>👨‍💻 {iss.current_specialist_name || iss.assignedDevName}</span>
                    </div>
                  </div>
                  <span className="text-xs text-hiamber font-bold group-hover:translate-x-1 transition-transform">
                    YETKAZISH →
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stage 3 Action Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100 dark:border-slate-800 font-mono text-xs">
            <span className="font-bold text-hiamber flex items-center gap-2">
              <Clock className="w-5 h-5 text-hiamber" />
              <span>// STAGE 03: MIJOZ TASDIG'I KUTILMOQDA</span>
            </span>
            <span className="px-2.5 py-1 rounded bg-hiamber-light dark:bg-hiamber/20 text-hiamber-dark dark:text-hiamber-neon font-bold">
              {pendingCustomerConfirmation.length} TA
            </span>
          </div>

          {pendingCustomerConfirmation.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400 font-mono border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              // Tasdiq kutilayotgan murojaat yo'q
            </div>
          ) : (
            <div className="space-y-2.5 font-mono text-xs">
              {pendingCustomerConfirmation.map((iss) => (
                <div
                  key={iss.id}
                  onClick={() => onSelectIssue(iss)}
                  className="p-3.5 bg-hiamber-light/20 dark:bg-hiamber/10 border border-hiamber/30 hover:border-hiamber rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-hiamber-dark dark:text-hiamber-neon">[{iss.code}]</span>
                      <span className="font-sans font-semibold text-slate-900 dark:text-white group-hover:text-hiamber transition-colors text-sm">
                        {iss.title}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-1 flex items-center gap-2">
                      <span>🏢 {iss.customerName}</span>
                      <span>•</span>
                      <span>📱 {iss.dispatchMethod || 'Telegram'}</span>
                    </div>
                  </div>
                  <span className="text-xs text-hiamber font-bold group-hover:translate-x-1 transition-transform">
                    TASDIQLATISH →
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Issues Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm transition-colors">
        <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100 dark:border-slate-800 font-mono text-xs">
          <span className="font-bold text-slate-900 dark:text-white text-sm">// RECENT INCIDENTS & LOGS</span>
          <button
            onClick={() => onNavigateToTab('issues')}
            className="text-hicyan hover:underline font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <span>BARCHASINI KO'RISH</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {issues.slice(0, 6).map((iss) => (
            <div
              key={iss.id}
              onClick={() => onSelectIssue(iss)}
              className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 px-3 rounded-xl cursor-pointer transition-colors"
            >
              <div className="flex items-start md:items-center gap-3">
                <span className="font-mono text-xs font-bold text-hicyan bg-hicyan-light/60 dark:bg-hicyan/20 px-2.5 py-1 rounded border border-hicyan/30">
                  {iss.code}
                </span>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">{iss.title}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">🏢 {iss.customerName}</span>
                    {iss.customerInn && <span className="font-mono text-[11px] text-hicyan font-bold">STIR: {iss.customerInn}</span>}
                    {iss.regionName && <span className="text-[11px] text-emerald-600 dark:text-emerald-400">📍 {iss.regionName}</span>}
                    <span>•</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">💻 {iss.productName} ({iss.moduleName})</span>
                    <span>•</span>
                    <span>Mas'ul: {iss.current_specialist_name || iss.assignedDevName || 'Biriktirilmagan'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 font-mono">
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded ${
                  iss.priority === 'CRITICAL' ? 'bg-hiamber-light dark:bg-hiamber/20 text-hiamber-dark dark:text-hiamber-neon border border-hiamber/40' :
                  iss.priority === 'HIGH' ? 'bg-hiamber-light/70 dark:bg-hiamber/15 text-hiamber-dark dark:text-hiamber-neon border border-hiamber/30' :
                  'bg-hicyan-light dark:bg-hicyan/20 text-hicyan-dark dark:text-hicyan-neon border border-hicyan/30'
                }`}>
                  {iss.priority}
                </span>

                <span className={`text-xs font-bold px-2.5 py-0.5 rounded ${
                  iss.stage === 'STAGE_4_CONFIRMED' ? 'bg-himint-light dark:bg-himint/20 text-himint-dark dark:text-himint-neon border border-himint/40' :
                  iss.stage === 'STAGE_3_DISPATCHED' ? 'bg-hiamber-light dark:bg-hiamber/20 text-hiamber-dark dark:text-hiamber-neon border border-hiamber/40' :
                  iss.stage === 'STAGE_2_RESOLVED' ? 'bg-hiamber-light dark:bg-hiamber/20 text-hiamber-dark dark:text-hiamber-neon border border-hiamber/40' :
                  'bg-hicyan-light dark:bg-hicyan/20 text-hicyan-dark dark:text-hicyan-neon border border-hicyan/40'
                }`}>
                  {iss.stage === 'STAGE_1_ACCEPTED' ? 'STAGE 01' :
                   iss.stage === 'STAGE_2_RESOLVED' ? 'STAGE 02' :
                   iss.stage === 'STAGE_3_DISPATCHED' ? 'STAGE 03' : 'STAGE 04'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
