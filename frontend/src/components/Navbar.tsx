import React, { useState } from 'react';
import { User, UserRole } from '../types';
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
  BarChart3,
  LogOut,
  ShieldCheck,
  ChevronDown,
  User as UserIcon,
  RefreshCw
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'kanban' | 'issues' | 'employees' | 'kpi' | 'reports' | 'customers' | 'products' | 'reminders';

interface NavbarProps {
  currentTab: ActiveTab;
  setTab: (tab: ActiveTab) => void;
  currentUser: User | null;
  onLogout: () => void;
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
  currentUser,
  onLogout,
  lang,
  setLang,
  theme,
  setTheme,
  onOpenNewIssue,
  unresolvedCount
}) => {
  const t = translations[lang];
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const currentRole: UserRole = currentUser?.role || 'SUPER_ADMIN';

  // Role badge styles
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return { label: 'SUPERADMIN', color: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-300 dark:border-red-800' };
      case 'MANAGER':
        return { label: 'MENEJER', color: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-300 dark:border-purple-800' };
      case 'OPERATOR':
        return { label: 'OPERATOR', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-800' };
      case 'MUTAXASSIS':
      case 'DEVELOPER':
        return { label: 'MUTAXASSIS', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' };
      default:
        return { label: role, color: 'bg-slate-100 text-slate-700' };
    }
  };

  const roleBadge = getRoleBadge(currentRole);

  // Tabs filtered by Role Permissions
  const allNavItems: { id: ActiveTab; label: string; icon: any; code: string; badge?: number; roles: UserRole[] }[] = [
    { id: 'dashboard', label: t.nav.dashboard, icon: Layers, code: '01', roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATOR', 'MUTAXASSIS', 'DEVELOPER'] },
    { id: 'kanban', label: t.nav.kanban, icon: Kanban, code: '02', roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATOR', 'MUTAXASSIS', 'DEVELOPER'] },
    { id: 'issues', label: t.nav.issues, icon: TicketCheck, code: '03', badge: unresolvedCount, roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATOR', 'MUTAXASSIS', 'DEVELOPER'] },
    { id: 'employees', label: t.nav.employees, icon: UserCheck, code: '04', roles: ['SUPER_ADMIN'] },
    { id: 'kpi', label: t.nav.kpi, icon: Award, code: '05', roles: ['SUPER_ADMIN', 'MANAGER', 'MUTAXASSIS', 'DEVELOPER'] },
    { id: 'reports', label: t.nav.reports, icon: BarChart3, code: '06', roles: ['SUPER_ADMIN', 'MANAGER'] },
    { id: 'customers', label: t.nav.customers, icon: Users, code: '07', roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATOR'] },
    { id: 'products', label: t.nav.products, icon: Package, code: '08', roles: ['SUPER_ADMIN', 'MANAGER'] },
    { id: 'reminders', label: t.nav.reminders, icon: BellRing, code: '09', roles: ['SUPER_ADMIN', 'MANAGER', 'OPERATOR'] }
  ];

  const visibleNavItems = allNavItems.filter(item => item.roles.includes(currentRole));

  // Can create new issue? (Only Operators, Managers, Superadmins)
  const canCreateIssue = currentRole === 'SUPER_ADMIN' || currentRole === 'MANAGER' || currentRole === 'OPERATOR';

  // Initials
  const getInitials = (name?: string) => {
    if (!name) return 'TC';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

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
          {/* Theme Switcher */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors text-xs font-semibold cursor-pointer"
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
              className={`px-2 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                lang === 'UZ'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              UZ
            </button>
            <button
              onClick={() => setLang('RU')}
              className={`px-2 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                lang === 'RU'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              RU
            </button>
          </div>

          {/* ACTIVE USER PROFILE & LOGOUT POPUP */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-hicyan text-white font-mono font-black text-xs flex items-center justify-center shadow-sm">
                {getInitials(currentUser?.name)}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[120px]">
                  {currentUser?.name || 'Foydalanuvchi'}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold border ${roleBadge.color}`}>
                    {roleBadge.label}
                  </span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Profile Menu Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 z-50 animate-fadeIn space-y-2">
                <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Faol Foydalanuvchi:</span>
                  <div className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                    {currentUser?.name}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    @{currentUser?.login} • {currentUser?.phone}
                  </div>
                  <div className="mt-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${roleBadge.color}`}>
                      {roleBadge.label}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-500 px-2 py-1 space-y-1">
                  <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Huquqlar darajasi:</div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    {currentRole === 'SUPER_ADMIN' ? 'To‘liq boshqaruv, barcha hisobotlar va xodimlar' :
                     currentRole === 'MANAGER' ? 'Murojaatlar nazorati, tahlil va qayta biriktirish' :
                     currentRole === 'OPERATOR' ? 'Mijoz arizalari, bog‘lanish va arizalarni yopish' :
                     'Texnik topshiriqlarni qabul qilish va yechim topshirish'}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout();
                    }}
                    className="flex items-center gap-2 w-full p-2 rounded-xl text-left text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Tizimdan chiqish (Log out)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* New Issue Action (Hidden for Specialist) */}
          {canCreateIssue && (
            <button
              onClick={onOpenNewIssue}
              className="flex items-center gap-2 px-3.5 py-2 bg-hicyan hover:bg-hicyan-dark active:scale-95 text-white rounded-lg font-medium text-xs shadow-md shadow-hicyan/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="font-bold">{t.actions.newIssue}</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Navigation Tabs (Filtered by Role Permissions) */}
      <div className="px-5 flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium rounded-lg transition-all relative whitespace-nowrap cursor-pointer ${
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
