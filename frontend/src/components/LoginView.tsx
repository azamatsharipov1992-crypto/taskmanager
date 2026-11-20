import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Language, translations } from '../translations';
import { 
  Lock, 
  User as UserIcon, 
  ShieldCheck, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sun, 
  Moon, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Cpu,
  Layers,
  UserCheck,
  Award
} from 'lucide-react';

interface LoginViewProps {
  onLogin: (user: User, token: string) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  lang,
  setLang,
  theme,
  setTheme
}) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Quick Demo Accounts
  const demoAccounts: {
    role: UserRole;
    title: string;
    name: string;
    login: string;
    color: string;
    icon: any;
    desc: string;
  }[] = [
    {
      role: 'SUPER_ADMIN',
      title: 'Superadmin',
      name: 'Narzullayev Akbar',
      login: 'pc_sam_akbar',
      color: 'border-red-500/40 bg-red-50/50 dark:bg-red-950/20 text-red-700 dark:text-red-300',
      icon: ShieldCheck,
      desc: 'Barcha tizim, hisobotlar va xodimlarni boshqarish'
    },
    {
      role: 'MANAGER',
      title: 'Menejer',
      name: 'Sheribov Zafarbek',
      login: 'pc_urg_zafarbek',
      color: 'border-purple-500/40 bg-purple-50/50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300',
      icon: Layers,
      desc: 'Murojaatlar nazorati, qayta biriktirish va tahlil'
    },
    {
      role: 'OPERATOR',
      title: 'Operator',
      name: 'Farrux Bakpolatov',
      login: 'pc_urg_farrux',
      color: 'border-hicyan/40 bg-hicyan-light/50 dark:bg-hicyan/10 text-hicyan-dark dark:text-hicyan-neon',
      icon: UserCheck,
      desc: 'Murojaat qabul qilish, yechim yetkazish va yopish'
    },
    {
      role: 'MUTAXASSIS',
      title: 'Mutaxassis',
      name: 'Akrom Rustamov',
      login: 'pc_spec_akrom',
      color: 'border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300',
      icon: Award,
      desc: 'Topshiriqni qabul qilish va yechim topshirish'
    }
  ];

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!login.trim() || !password.trim()) {
      setError(lang === 'UZ' ? 'Login va parolni kiriting!' : 'Введите логин и пароль!');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: login.trim(), password: password.trim() })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || (lang === 'UZ' ? 'Kirishda xatolik yuz berdi' : 'Ошибка авторизации'));
        return;
      }

      if (rememberMe) {
        localStorage.setItem('task_control_token', data.token);
        localStorage.setItem('task_control_user', JSON.stringify(data.user));
      }

      onLogin(data.user, data.token);
    } catch (err: any) {
      setError(err.message || 'Server bilan aloqa uzildi');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (accLogin: string) => {
    setLogin(accLogin);
    setPassword('123456');
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: accLogin, password: '123456' })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (rememberMe) {
          localStorage.setItem('task_control_token', data.token);
          localStorage.setItem('task_control_user', JSON.stringify(data.user));
        }
        onLogin(data.user, data.token);
      } else {
        setError(data.error || 'Kirish xatosi');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0F1D] text-slate-800 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6 transition-colors duration-200">
      {/* Top Header Controls */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-hicyan text-white flex items-center justify-center font-mono font-black text-sm tracking-wider shadow-inner">
            TC
          </div>
          <div>
            <div className="font-mono font-black text-base text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>TASK CONTROL</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-hicyan-light dark:bg-hicyan/20 text-hicyan-dark dark:text-hicyan-neon font-bold">
                ENTERPRISE v2.0
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              4 Bosqichli Nazorat & Xodimlar Tizimi
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Switcher */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Rejimni o‘zgartirish"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Lang Switcher */}
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-800 text-xs font-mono font-bold">
            <button
              onClick={() => setLang('UZ')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                lang === 'UZ' ? 'bg-slate-900 dark:bg-hicyan text-white' : 'text-slate-400'
              }`}
            >
              UZ
            </button>
            <button
              onClick={() => setLang('RU')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                lang === 'RU' ? 'bg-slate-900 dark:bg-hicyan text-white' : 'text-slate-400'
              }`}
            >
              RU
            </button>
          </div>
        </div>
      </div>

      {/* Main Login Card & Quick Role Selectors */}
      <div className="max-w-4xl w-full mx-auto my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Login Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-600 dark:text-slate-300 mb-3">
              <Lock className="w-3.5 h-3.5 text-hicyan" />
              <span>XAVFSIZLIK VA AVTORIZATSIYA</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Tizimga kirish
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Shaxsiy login yoki telefon raqamingiz orqali tizimga kiring.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 text-xs text-red-600 dark:text-red-300 flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase font-mono">
                Login yoki Telefon raqam
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="Masalan: pc_sam_akbar yoki +998901234567"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-hicyan transition-colors"
                />
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase font-mono">
                Maxfiy Parol
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-hicyan transition-colors"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-hicyan rounded border-slate-300 focus:ring-hicyan cursor-pointer"
                />
                <span className="text-slate-600 dark:text-slate-400 font-medium">Meni eslab qolish</span>
              </label>

              <span className="text-slate-400 font-mono text-[11px]">
                Standart parol: <code className="font-bold text-slate-700 dark:text-slate-300">123456</code>
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-hicyan dark:hover:bg-hicyan-dark text-white rounded-xl text-xs font-bold font-mono transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <span>{loading ? 'Tekshirilmoqda...' : 'TIZIMGA KIRISH'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right Side: Quick Role Profiles (1-Click Test Access) */}
        <div className="lg:col-span-5 space-y-3.5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-xs uppercase font-mono text-slate-900 dark:text-white">
                  Tezkor Sinov Profillari (1-Klik)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">4 XIL ROL</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Rollar kesimidagi huquqlar va cheklovlarni tekshirish uchun quyidagi akkauntlardan birini tanlang:
            </p>

            <div className="space-y-2">
              {demoAccounts.map((acc) => {
                const Icon = acc.icon;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleQuickLogin(acc.login)}
                    disabled={loading}
                    className={`w-full text-left p-3 rounded-2xl border transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-between group ${acc.color}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center font-bold">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs flex items-center gap-2">
                          <span>{acc.title}:</span>
                          <span className="font-normal opacity-90">{acc.name}</span>
                        </div>
                        <div className="text-[10px] opacity-75 mt-0.5 line-clamp-1">
                          {acc.desc}
                        </div>
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-200 space-y-1">
            <span className="font-bold block flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-amber-600" />
              Rollar bo‘yicha cheklovlar qoidasi:
            </span>
            <p className="text-[11px] opacity-90">
              • <b>Superadmin / Menejer:</b> Barcha bo‘limlar, xodimlar va viloyatlar hisobotlari.<br/>
              • <b>Operator:</b> Mijozlar qabuli, yangi murojaat ochish va mijoz bilan bog‘lanish.<br/>
              • <b>Mutaxassis:</b> Faqat texnik topshiriqni qabul qilish va yechim topshirish. Murojaatni yopish huquqi berilmaydi!
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl w-full mx-auto py-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 font-mono gap-2">
        <span>© 2026 TASK CONTROL Enterprise Inc. Barcha huquqlar himoyalangan.</span>
        <span>SECURITY PROTOCOL: ENCRYPTED // TLS 1.3</span>
      </div>
    </div>
  );
};
