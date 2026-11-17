import React from 'react';
import { UserRole } from '../types';
import { translations, Language } from '../translations';
import { 
  Layers, 
  Kanban, 
  TicketCheck, 
  Users, 
  Package, 
  BellRing,
  Plus,
  Sun,
  Moon,
  UserCheck,
  Award,
  BarChart3
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'kanban' | 'issues' | 'employees' | 'kpi' | 'reports' | 'customers' | 'products' | 'reminders';

interface NavbarProps {
  currentTab: ActiveTab;
  setTab: (tab: ActiveTab) => void;
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  lang: Language;
  setLang: (l: Language) => void;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  onOpenNewIssue: () => void;
  unresolvedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setTab,
  currentRole,
  setRole,
  lang,
  setLang,
  theme,
  setTheme,
  onOpenNewIssue,
  unresolvedCount
}) => {
  const t = translations[lang];

  const navItems: { id: ActiveTab; label: string; icon: any; code: string; badge?: number }[] = [
    { id: 'dashboard', label: t.nav.dashboard, icon: Layers, code: '01' },
    { id: 'kanban', label: t.nav.kanban, icon: Kanban, code: '02' },
    { id: 'issues', label: t.nav.issues, icon: TicketCheck, code: '03', badge: unresolvedCount },
    { id: 'employees', label: t.nav.employees, icon: UserCheck, code: '04' },
    { id: 'kpi', label: t.nav.kpi, icon: Award, code: '05' },
    { id: 'reports', label: t.nav.reports, icon: BarChart3, code: '06' },
    { id: 'customers', label: t.nav.customers, icon: Users, code: '07' },
    { id: 'products', label: t.nav.products, icon: Package, code: '08' },
    { id: 'reminders', label: t.nav.reminders, icon: BellRing, code: '09' }
  ];

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-sm transition-colors">
      {/* Top Telemetry Header */}
      <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-hicyan text-white flex items-center justify-center font-mono font-black text-sm tracking-wider shadow-inner border border-slate-800 dark:border-hicyan">
            TC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black tracking-tight text-slate-900 dark:text-white text-lg font-mono">TASK CONTROL</span>
              <span className="px-2 py-0.5 rounded bg-hicyan-light dark:bg-hicyan/20 text-hicyan-dark dark:text-hicyan-neon border border-hicyan/30 text-xs font-mono font-bold">
                HI-TECH v2.0
              </span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-himint-light dark:bg-himint/20 text-himint-dark dark:text-himint-neon border border-himint/30 text-xs font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-himint animate-pulse" />
                <span>ONLINE</span>
              </div>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {t.tagline}
            </div>
          </div>
        </div>

        {/* Center Hi-Tech Protocol Banner */}
        <div className="hidden xl:flex items-center gap-2 px-3.5 py-1.5 bg-hiamber-light dark:bg-hiamber-dark/20 border border-hiamber/40 rounded-lg text-xs text-hiamber-dark dark:text-hiamber-neon font-medium">
          <span className="w-2 h-2 rounded-full bg-hiamber animate-ping" />
          <span className="font-mono font-bold">{t.coreRuleBadge}:</span>
          <span>{t.coreRuleText}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2.5">
          {/* Theme Switcher: Light / Dark Mode */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors text-xs font-semibold"
            title={theme === 'light' ? 'Tungi rejimga o\'tish' : 'Kunduzgi rejimga o\'tish'}
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-4 h-4 text-slate-600" />
                <span className="hidden sm:inline">Tungi</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Kunduzgi</span>
              </>
            )}
          </button>

          {/* Lang Selector */}
          <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-800">
            <button
              onClick={() => setLang('UZ')}
              className={`px-2 py-1 rounded text-xs font-mono font-bold transition-all ${
                lang === 'UZ'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              UZ
            </button>
            <button
              onClick={() => setLang('RU')}
              className={`px-2 py-1 rounded text-xs font-mono font-bold transition-all ${
                lang === 'RU'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              RU
            </button>
          </div>

          {/* Role Simulator Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-bold uppercase hidden md:inline">Rol:</span>
            <select
              value={currentRole}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
            >
              <option value="SUPER_ADMIN" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">{t.roles.SUPER_ADMIN}</option>
              <option value="MANAGER" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">{t.roles.MANAGER}</option>
              <option value="OPERATOR" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">{t.roles.OPERATOR}</option>
              <option value="MUTAXASSIS" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">{t.roles.MUTAXASSIS}</option>
            </select>
          </div>

          {/* New Issue Action */}
          <button
            onClick={onOpenNewIssue}
            className="flex items-center gap-2 px-3.5 py-2 bg-hicyan hover:bg-hicyan-dark active:scale-95 text-white rounded-lg font-medium text-xs shadow-md shadow-hicyan/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="font-bold">{t.actions.newIssue}</span>
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="px-5 flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium rounded-lg transition-all relative whitespace-nowrap ${
                isActive
                  ? 'text-hicyan-dark dark:text-hicyan-neon font-bold bg-hicyan-light/70 dark:bg-hicyan/10'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <span className={`font-mono text-[10px] ${isActive ? 'text-hicyan dark:text-hicyan-neon' : 'text-slate-400'}`}>
                {item.code}
              </span>
              <Icon className={`w-4 h-4 ${isActive ? 'text-hicyan-dark dark:text-hicyan-neon' : 'text-slate-400'}`} />
              <span className="text-sm">{item.label}</span>
              {typeof item.badge === 'number' && item.badge > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-hiamber text-white">
                  {item.badge}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-hicyan dark:bg-hicyan-neon rounded-t-full shadow-[0_0_8px_rgba(2,132,199,0.6)]" />
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
