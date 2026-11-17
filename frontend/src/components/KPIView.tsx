import React, { useState, useEffect } from 'react';
import { OperatorKPI, SpecialistKPI } from '../types';
import { Language, translations } from '../translations';
import { 
  Award, 
  Clock, 
  TrendingUp, 
  RotateCcw, 
  CheckCircle2, 
  Star, 
  ShieldAlert, 
  Sparkles, 
  Users, 
  Flame, 
  Info,
  ChevronRight
} from 'lucide-react';

interface KPIViewProps {
  lang: Language;
}

export const KPIView: React.FC<KPIViewProps> = ({ lang }) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'specialists' | 'operators'>('specialists');
  const [specialists, setSpecialists] = useState<SpecialistKPI[]>([]);
  const [operators, setOperators] = useState<OperatorKPI[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchKPIData = async () => {
    try {
      const [specRes, opRes] = await Promise.all([
        fetch('/api/kpi/specialists').then((r) => r.json()),
        fetch('/api/kpi/operators').then((r) => r.json())
      ]);
      setSpecialists(specRes || []);
      setOperators(opRes || []);
    } catch (err) {
      console.error('Error fetching KPI data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKPIData();
  }, []);

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return '0 daqiqa';
    if (seconds < 60) return `${seconds} soniya`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins} daqiqa`;
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hours} soat ${remMins > 0 ? `${remMins} d.` : ''}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-himint-dark dark:text-himint-neon bg-himint-light dark:bg-himint/10 border-himint/30';
    if (score >= 75) return 'text-hicyan-dark dark:text-hicyan-neon bg-hicyan-light dark:bg-hicyan/10 border-hicyan/30';
    if (score >= 60) return 'text-hiamber-dark dark:text-hiamber-neon bg-hiamber-light dark:bg-hiamber/10 border-hiamber/30';
    return 'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-950/40 border-red-300 dark:border-red-800';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Tab Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white font-mono">
                XODIMLAR KPI VA SAMARADORLIK TAHLILI
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Vazifalarni bajarish tezligi, sifat ko'rsatkichlari va mijozlar qoniqishi bo'yicha avtomatik baholash
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('specialists')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
              activeTab === 'specialists'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <Flame className="w-4 h-4 text-emerald-500" />
            <span>MUTAXASSISLAR KPI</span>
            <span className="px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded text-[10px]">
              {specialists.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('operators')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
              activeTab === 'operators'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <Users className="w-4 h-4 text-amber-500" />
            <span>OPERATORLAR KPI</span>
            <span className="px-1.5 py-0.2 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded text-[10px]">
              {operators.length}
            </span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION A: MUTAXASSISLAR KPI                             */}
      {/* ======================================================== */}
      {activeTab === 'specialists' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Top Mutaxassis</span>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-1.5 truncate">
                {specialists[0]?.name || '—'}
              </div>
              <div className="text-xs text-himint-dark dark:text-himint-neon font-bold mt-1">
                {specialists[0] ? `KPI: ${specialists[0].kpiScore}% ball` : 'Xodimlar kiritilmagan'}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">O'rtacha yechish vaqti</span>
              <div className="text-xl font-black font-mono text-slate-900 dark:text-white mt-1.5">
                {specialists.length > 0 && specialists[0].averageResolutionSeconds > 0
                  ? formatDuration(specialists[0].averageResolutionSeconds)
                  : '0 daqiqa'}
              </div>
              <div className="text-xs text-slate-500 mt-1">Kutish vaqti hisobga olinmagan</div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Qaytarilish darajasi</span>
              <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1.5">
                {specialists.length > 0 ? `${specialists[0].returnRatePercentage}%` : '0%'}
              </div>
              <div className="text-xs text-slate-500 mt-1">Mijoz qaytargan sikllar ulushi</div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">O'z vaqtida bajarish (SLA)</span>
              <div className="text-xl font-black font-mono text-hicyan-dark dark:text-hicyan-neon mt-1.5">
                {specialists.length > 0 ? `${specialists[0].onTimePercentage}%` : '100%'}
              </div>
              <div className="text-xs text-slate-500 mt-1">Belgilangan muddat ichida</div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase font-mono">
                Mutaxassislar Reytingi va KPI Ko'rsatkichlari
              </h3>
              <span className="text-xs text-slate-400 font-mono">Real vaqt rejimida yangilangan</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-5 py-3.5">O'rin & Mutaxassis</th>
                    <th className="px-4 py-3.5">Biriktirilgan</th>
                    <th className="px-4 py-3.5">Yopilgan</th>
                    <th className="px-4 py-3.5">O'rtacha yechish vaqti</th>
                    <th className="px-4 py-3.5">Qaytarilish %</th>
                    <th className="px-4 py-3.5">SLA (O'z vaqtida)</th>
                    <th className="px-5 py-3.5 text-right">KPI Balli</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {specialists.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16 text-slate-400">
                        <Flame className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                        <div className="font-bold text-slate-600 dark:text-slate-400 font-mono text-sm">
                          // HOZIRCHA HECH QANDAY MUTAXASSIS KIRITILMAGAN //
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          «Xodimlar» bo'limiga kirib yangi mutaxassis qo'shishingiz mumkin.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    specialists.map((spec, idx) => (
                      <tr key={spec.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-black text-xs ${
                              idx === 0 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                              idx === 1 ? 'bg-slate-200 text-slate-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              #{idx + 1}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white">{spec.name}</div>
                              <div className="text-xs font-mono text-slate-400">{spec.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                          {spec.assignedCount} ta
                        </td>
                        <td className="px-4 py-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {spec.completedCount} ta
                        </td>
                        <td className="px-4 py-4 font-mono text-slate-700 dark:text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{formatDuration(spec.averageResolutionSeconds)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-mono font-bold">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            spec.returnRatePercentage === 0
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}>
                            {spec.returnRatePercentage}%
                          </span>
                        </td>
                        <td className="px-4 py-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                          {spec.onTimePercentage}%
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border font-mono font-black text-sm ${getScoreColor(spec.kpiScore)}`}>
                            <Award className="w-4 h-4" />
                            <span>{spec.kpiScore}%</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION B: OPERATORLAR KPI                               */}
      {/* ======================================================== */}
      {activeTab === 'operators' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Top Operator</span>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-1.5 truncate">
                {operators[0]?.name || '—'}
              </div>
              <div className="text-xs text-amber-600 dark:text-amber-400 font-bold mt-1">
                {operators[0] ? `KPI: ${operators[0].kpiScore}% ball` : 'Xodimlar kiritilmagan'}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Qabul qilingan murojaatlar</span>
              <div className="text-xl font-black font-mono text-slate-900 dark:text-white mt-1.5">
                {operators.reduce((sum, o) => sum + o.totalRegistered, 0)} ta
              </div>
              <div className="text-xs text-slate-500 mt-1">Barcha operatorlar kesimida</div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Mijoz bilan bog'lanish tezligi</span>
              <div className="text-xl font-black font-mono text-hicyan-dark dark:text-hicyan-neon mt-1.5">
                {operators.length > 0 && operators[0].averageContactSeconds > 0
                  ? formatDuration(operators[0].averageContactSeconds)
                  : '0 daqiqa'}
              </div>
              <div className="text-xs text-slate-500 mt-1">Yechim chiqqandan mijozga yetkazish</div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Mijoz qoniqishi</span>
              <div className="text-xl font-black font-mono text-amber-500 mt-1.5 flex items-center gap-1">
                <span>{operators.length > 0 ? operators[0].averageRating : '5.0'}</span>
                <Star className="w-4 h-4 fill-amber-400 text-amber-400 inline" />
              </div>
              <div className="text-xs text-slate-500 mt-1">Mijozlarning o'rtacha bahosi</div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase font-mono">
                Operatorlar Reytingi va KPI Ko'rsatkichlari
              </h3>
              <span className="text-xs text-slate-400 font-mono">Mijozlar bilan aloqa sifati nazorati</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-5 py-3.5">O'rin & Operator</th>
                    <th className="px-4 py-3.5">Qabul qilingan</th>
                    <th className="px-4 py-3.5">Mijozga yetkazilgan</th>
                    <th className="px-4 py-3.5">Tasdiqlangan & Yopilgan</th>
                    <th className="px-4 py-3.5">Bog'lanish tezligi</th>
                    <th className="px-4 py-3.5">Mijoz Bahosi</th>
                    <th className="px-5 py-3.5 text-right">KPI Balli</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {operators.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16 text-slate-400">
                        <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                        <div className="font-bold text-slate-600 dark:text-slate-400 font-mono text-sm">
                          // HOZIRCHA HECH QANDAY OPERATOR KIRITILMAGAN //
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          «Xodimlar» bo'limiga kirib yangi operator qo'shishingiz mumkin.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    operators.map((op, idx) => (
                      <tr key={op.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-black text-xs ${
                              idx === 0 ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-slate-100 text-slate-600'
                            }`}>
                              #{idx + 1}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white">{op.name}</div>
                              <div className="text-xs font-mono text-slate-400">{op.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                          {op.totalRegistered} ta
                        </td>
                        <td className="px-4 py-4 font-mono text-blue-600 dark:text-blue-400">
                          {op.solutionDeliveredCount} ta
                        </td>
                        <td className="px-4 py-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {op.closedCount} ta
                        </td>
                        <td className="px-4 py-4 font-mono text-slate-700 dark:text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{formatDuration(op.averageContactSeconds)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-mono font-bold text-amber-500">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span>{op.averageRating} / 5.0</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border font-mono font-black text-sm ${getScoreColor(op.kpiScore)}`}>
                            <Award className="w-4 h-4" />
                            <span>{op.kpiScore}%</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION C: KPI FORMULA EXPLANATION                       */}
      {/* ======================================================== */}
      <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-hicyan" />
          <h4 className="font-bold text-xs uppercase font-mono text-slate-700 dark:text-slate-300">
            Shaffof KPI hisoblash formulalari (Superadmin standartlari)
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-400 mt-2">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Mutaxassis formulasi (100%):</span>
            <ul className="list-disc pl-4 space-y-1">
              <li><b>40% — Ish tezligi:</b> Faol yechish vaqti (Kutish/WAITING rejimi chegirib tashlanadi).</li>
              <li><b>30% — Sifat kafolati:</b> Qaytarilish darajasining pastligi (kam qaytarilsa ball yuqori).</li>
              <li><b>30% — Belgilangan muddat (SLA):</b> Vazifalarni vaqtida bajarish foizi.</li>
            </ul>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white block mb-1">Operator formulasi (100%):</span>
            <ul className="list-disc pl-4 space-y-1">
              <li><b>35% — Mijozga yetkazish tezligi:</b> Yechim tayyor bo'lganidan so'ng mijoz bilan bog'lanish vaqti.</li>
              <li><b>35% — Mijoz qoniqishi:</b> Yopishda mijoz bergan yulduzli baho (1-5).</li>
              <li><b>30% — Yakunlanganlik ulushi:</b> Qabul qilingan murojaatlarni oxirigacha yetkazib yopish ko'rsatkichi.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
