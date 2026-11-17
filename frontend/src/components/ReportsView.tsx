import React, { useState, useEffect } from 'react';
import { SystemReportSummary } from '../types';
import { Language, translations } from '../translations';
import { 
  BarChart3, 
  Send, 
  CheckCircle2, 
  Calendar, 
  TrendingUp, 
  RotateCcw, 
  Clock, 
  Award, 
  Package, 
  ShieldCheck, 
  Users, 
  ArrowUpRight,
  Check
} from 'lucide-react';

interface ReportsViewProps {
  lang: Language;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ lang }) => {
  const t = translations[lang];
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [report, setReport] = useState<SystemReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingTelegram, setSendingTelegram] = useState(false);
  const [telegramSent, setTelegramSent] = useState(false);

  const fetchReport = async (p: 'daily' | 'weekly' | 'monthly') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/summary?period=${p}`);
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      }
    } catch (err) {
      console.error('Error fetching report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(period);
  }, [period]);

  const handleSendTelegram = async () => {
    setSendingTelegram(true);
    try {
      const res = await fetch('/api/reports/send-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period })
      });
      if (res.ok) {
        setTelegramSent(true);
        setTimeout(() => setTelegramSent(false), 4000);
      }
    } catch (err) {
      console.error('Failed to send report to Telegram:', err);
    } finally {
      setSendingTelegram(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-hicyan-light dark:bg-hicyan/10 text-hicyan flex items-center justify-center font-bold">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white font-mono">
              SUPERADMIN VA MENEJER HISOBOTLARI
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Vazifalar, xodimlar samaradorligi va Telegram orqali yuboriladigan umumiy tahliliy hisobotlar
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {/* Period Selector */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setPeriod('daily')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                period === 'daily'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              KUNLIK (BUGUN)
            </button>
            <button
              onClick={() => setPeriod('weekly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                period === 'weekly'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              HAFTALIK
            </button>
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                period === 'monthly'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              OYLIK
            </button>
          </div>

          {/* Send to Telegram Button */}
          <button
            onClick={handleSendTelegram}
            disabled={sendingTelegram}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
              telegramSent
                ? 'bg-himint text-white shadow-himint/20'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20 active:scale-95'
            }`}
          >
            {telegramSent ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
            <span>
              {telegramSent
                ? 'Telegramga yuborildi!'
                : sendingTelegram
                ? 'Yuborilmoqda...'
                : 'Telegramga hisobot jo\'natish'}
            </span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">Jami kelib tushgan</span>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
            {report?.totalReceived ?? 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">murojaatlar</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-mono font-bold text-hicyan uppercase">Bajarilmoqda</span>
          <div className="text-2xl font-black font-mono text-hicyan-dark dark:text-hicyan-neon mt-1">
            {report?.currentlyInProgress ?? 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">mutaxassisda</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-mono font-bold text-amber-500 uppercase">Mijoz kutilmoqda</span>
          <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400 mt-1">
            {report?.waitingForCustomer ?? 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">yechim yetkazilgan</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-mono font-bold text-himint uppercase">Yopilgan</span>
          <div className="text-2xl font-black font-mono text-himint-dark dark:text-himint-neon mt-1">
            {report?.totalClosed ?? 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">mijoz tasdiqlagan</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-mono font-bold text-red-500 uppercase">Qaytarilgan</span>
          <div className="text-2xl font-black font-mono text-red-600 dark:text-red-400 mt-1">
            {report?.totalReopened ?? 0}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">qayta ishlangan</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-mono font-bold text-purple-500 uppercase">O'rtacha vaqt</span>
          <div className="text-2xl font-black font-mono text-purple-600 dark:text-purple-400 mt-1">
            {report?.averageResolutionHours ?? 0}s
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">yechish tezligi</div>
        </div>
      </div>

      {/* Top Performers Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Specialists */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white font-mono uppercase">
                Yetakchi Mutaxassislar
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">KPI reytingi</span>
          </div>

          <div className="space-y-3">
            {report?.topSpecialists.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-black text-xs font-mono">
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">{s.name}</div>
                    <div className="text-xs text-slate-400">
                      {s.completed} ta yopilgan | O'rtacha: {s.avgHours} soat
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono font-black bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    KPI: {s.score}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Operators */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white font-mono uppercase">
                Yetakchi Operatorlar
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Mijoz tasdiqlari</span>
          </div>

          <div className="space-y-3">
            {report?.topOperators.map((o, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center font-black text-xs font-mono">
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">{o.name}</div>
                    <div className="text-xs text-slate-400">
                      {o.registered} ta qabul | {o.closed} ta to'liq tasdiqlangan
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono font-black bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    KPI: {o.score}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-hicyan" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white font-mono uppercase">
              Dasturlar va Tizimlar Kesimida Statistik Murojaatlar
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">Dastur Nomi</th>
                <th className="px-4 py-3.5">Murojaatlar Soni</th>
                <th className="px-4 py-3.5">Yopilgan Murojaatlar</th>
                <th className="px-4 py-3.5">Muvaffaqiyat Ulushi</th>
                <th className="px-5 py-3.5 text-right">Holat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {report?.productStats.map((prod) => {
                const percentage = prod.count > 0 ? Math.round((prod.closedCount / prod.count) * 100) : 100;
                return (
                  <tr key={prod.productId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                      {prod.productName}
                    </td>
                    <td className="px-4 py-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {prod.count} ta
                    </td>
                    <td className="px-4 py-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {prod.closedCount} ta
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div className="bg-himint h-full rounded-full" style={{ width: `${percentage}%` }} />
                        </div>
                        <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">{percentage}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-hicyan-light dark:bg-hicyan/10 text-hicyan-dark dark:text-hicyan-neon border border-hicyan/30">
                        BARQAROR
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
