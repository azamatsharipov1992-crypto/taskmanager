import React, { useState, useEffect } from 'react';
import { 
  SystemReportSummary, 
  RegionReportItem, 
  ProductReportItem, 
  RegionProductMatrixRow, 
  CustomerNotificationLog 
} from '../types';
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
  Check,
  MapPin,
  Download,
  Printer,
  Table as TableIcon,
  BellRing,
  Filter,
  Layers,
  Building,
  Smartphone,
  AlertCircle
} from 'lucide-react';

interface ReportsViewProps {
  lang: Language;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ lang }) => {
  const t = translations[lang];

  // Active Sub-tab
  const [activeTab, setActiveTab] = useState<'regions' | 'products' | 'matrix' | 'telegram' | 'team'>('regions');

  // Filter states
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('daily');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('ALL');
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>('ALL');

  // Data states
  const [report, setReport] = useState<SystemReportSummary | null>(null);
  const [regionStats, setRegionStats] = useState<RegionReportItem[]>([]);
  const [productStats, setProductStats] = useState<ProductReportItem[]>([]);
  const [matrixData, setMatrixData] = useState<RegionProductMatrixRow[]>([]);
  const [telegramStats, setTelegramStats] = useState<{
    totalCustomers: number;
    linkedCount: number;
    unlinkedCount: number;
    linkedPercentage: number;
    totalNotificationsSent: number;
    totalNotificationsFailed: number;
    recentLogs: CustomerNotificationLog[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [sendingTelegram, setSendingTelegram] = useState(false);
  const [telegramSent, setTelegramSent] = useState(false);

  // Fetch all report data
  const fetchAllReports = async () => {
    setLoading(true);
    try {
      const [summaryRes, regionsRes, productsRes, matrixRes, teleRes] = await Promise.all([
        fetch(`/api/reports/summary?period=${period === 'all' ? 'monthly' : period}`).then(r => r.json()).catch(() => null),
        fetch('/api/reports/regions').then(r => r.json()).catch(() => []),
        fetch('/api/reports/software-products').then(r => r.json()).catch(() => []),
        fetch('/api/reports/region-products').then(r => r.json()).catch(() => []),
        fetch('/api/reports/customer-telegram').then(r => r.json()).catch(() => null)
      ]);

      if (summaryRes) setReport(summaryRes);
      if (Array.isArray(regionsRes)) setRegionStats(regionsRes);
      if (Array.isArray(productsRes)) setProductStats(productsRes);
      if (Array.isArray(matrixRes)) setMatrixData(matrixRes);
      if (teleRes) setTelegramStats(teleRes);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllReports();
  }, [period]);

  // Send summary to Telegram
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

  // Export to CSV / Excel
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";

    if (activeTab === 'regions') {
      csvContent += "Viloyat;Mijozlar Soni;Jami Murojaatlar;Yopilgan Murojaatlar;Jarayonda;Ulush (%)\n";
      regionStats.forEach(r => {
        csvContent += `"${r.regionName}";${r.customerCount};${r.totalIssues};${r.closedIssues};${r.openIssues};${r.sharePercentage}%\n`;
      });
    } else if (activeTab === 'products') {
      csvContent += "Mahsulot;Kodi;Faol Mijozlar;Jami Murojaatlar;Yopilgan;Ochiq;Ulush (%)\n";
      productStats.forEach(p => {
        csvContent += `"${p.productName}";"${p.code}";${p.activeCustomerCount};${p.totalIssues};${p.closedIssues};${p.openIssues};${p.sharePercentage}%\n`;
      });
    } else if (activeTab === 'matrix') {
      csvContent += "Viloyat;POSCODE;RESTOPLUS;MIZAAN;Jami\n";
      matrixData.forEach(m => {
        const p1 = m.products['prod_poscode'] || 0;
        const p2 = m.products['prod_restoplus'] || 0;
        const p3 = m.products['prod_mizaan'] || 0;
        csvContent += `"${m.regionName}";${p1};${p2};${p3};${m.total}\n`;
      });
    } else if (activeTab === 'telegram') {
      csvContent += "Sana;Mijoz;Aloqa;Xabarnoma Turi;Holati\n";
      (telegramStats?.recentLogs || []).forEach(l => {
        csvContent += `"${l.sentAt}";"${l.customerName}";"${l.telegramChatId}";"${l.notificationType}";"${l.deliveryStatus}"\n`;
      });
    } else {
      csvContent += "Mutaxassis;Yopilgan;Ortacha Vaqt (soat);KPI\n";
      (report?.topSpecialists || []).forEach(s => {
        csvContent += `"${s.name}";${s.completed};${s.avgHours};${s.score}%\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `task_control_report_${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print view
  const handlePrint = () => {
    window.print();
  };

  // Filtered regions
  const filteredRegionStats = selectedRegionFilter === 'ALL'
    ? regionStats
    : regionStats.filter(r => r.regionId === selectedRegionFilter);

  // Top regions for chart (non-zero or top 6)
  const topRegions = [...regionStats]
    .sort((a, b) => b.totalIssues - a.totalIssues)
    .slice(0, 7);

  const maxRegionIssues = Math.max(...regionStats.map(r => r.totalIssues), 1);

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-hicyan-light dark:bg-hicyan/10 text-hicyan flex items-center justify-center font-bold">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white font-mono flex items-center gap-2">
              <span>ANALITIKA VA HISOBOTLAR MODULI</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-hicyan-light dark:bg-hicyan/20 text-hicyan-dark dark:text-hicyan-neon font-bold">
                14 HUDUD & DASTURLAR
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Viloyatlar, dasturiy mahsulotlar, matritsa va Telegram xabarnomalar bo‘yicha markaziy hisobot
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
          {/* Period Selector */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold">
            <button
              onClick={() => setPeriod('daily')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                period === 'daily'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              BUGUN
            </button>
            <button
              onClick={() => setPeriod('weekly')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                period === 'weekly'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              HAFTALIK
            </button>
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                period === 'monthly'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              OYLIK
            </button>
            <button
              onClick={() => setPeriod('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                period === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              BARCHASI
            </button>
          </div>

          {/* Export to CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
            title="Excel (CSV) yuklab olish"
          >
            <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Excel (CSV)</span>
          </button>

          {/* Print */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
            title="Chop etish"
          >
            <Printer className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            <span className="hidden sm:inline">Chop etish</span>
          </button>

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
                ? 'Yuborildi!'
                : sendingTelegram
                ? 'Yuborilmoqda...'
                : 'Telegramga hisobot'}
            </span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto text-xs font-mono font-bold">
        <button
          onClick={() => setActiveTab('regions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'regions'
              ? 'bg-hicyan text-white shadow-md shadow-hicyan/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>1. VILOYATLAR KESIMIDA (14 TA HUDUD)</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'products'
              ? 'bg-hicyan text-white shadow-md shadow-hicyan/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>2. DASTURIY MAHSULOTLAR</span>
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'matrix'
              ? 'bg-hicyan text-white shadow-md shadow-hicyan/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <TableIcon className="w-4 h-4" />
          <span>3. VILOYAT + MAHSULOT MATRITSASI</span>
        </button>

        <button
          onClick={() => setActiveTab('telegram')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'telegram'
              ? 'bg-hicyan text-white shadow-md shadow-hicyan/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BellRing className="w-4 h-4" />
          <span>4. TELEGRAM MIJOZLAR TAHLILI</span>
        </button>

        <button
          onClick={() => setActiveTab('team')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'team'
              ? 'bg-hicyan text-white shadow-md shadow-hicyan/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>5. XODIMLAR & KPI REYTINGI</span>
        </button>
      </div>

      {/* TAB 1: VILOYATLAR KESIMIDA (14 HUDUD) */}
      {activeTab === 'regions' && (
        <div className="space-y-6">
          {/* Top Regions Visual Bar Chart */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white font-mono uppercase flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-hicyan" />
                  <span>Yetakchi viloyatlar bo‘yicha murojaatlar taqsimoti (Top hududlar)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hududlar bo‘yicha tushgan jami murojaatlar va ularning umumiy ulushi (%)
                </p>
              </div>

              {/* Region Filter Dropdown */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={selectedRegionFilter}
                  onChange={(e) => setSelectedRegionFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  <option value="ALL">Barcha 14 ta hudud</option>
                  {regionStats.map(r => (
                    <option key={r.regionId} value={r.regionId}>{r.regionName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {topRegions.map((reg) => {
                const barWidth = Math.round((reg.totalIssues / maxRegionIssues) * 100);
                return (
                  <div key={reg.regionId} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-hicyan" />
                        {reg.regionName}
                      </span>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-slate-500">Mijozlar: <b>{reg.customerCount}</b></span>
                        <span className="text-slate-900 dark:text-white font-bold">{reg.totalIssues} ta ({reg.sharePercentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                      <div
                        className="bg-gradient-to-r from-hicyan to-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(barWidth, reg.totalIssues > 0 ? 5 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Full 14-Regions Data Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-hicyan" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white font-mono uppercase">
                  O‘zbekiston Respublikasi barcha hududlari bo‘yicha to‘liq hisobot jadvali
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">
                14 ta ma'muriy hudud
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-mono font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-5 py-3.5">#</th>
                    <th className="px-5 py-3.5">Viloyat / Hudud</th>
                    <th className="px-4 py-3.5 text-center">Faol Mijozlar</th>
                    <th className="px-4 py-3.5 text-center">Jami Murojaatlar</th>
                    <th className="px-4 py-3.5 text-center">Yopilgan</th>
                    <th className="px-4 py-3.5 text-center">Jarayonda</th>
                    <th className="px-5 py-3.5">Umumiy Ulush (%)</th>
                    <th className="px-5 py-3.5 text-right">Holat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredRegionStats.map((reg, idx) => (
                    <tr key={reg.regionId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-slate-400">{idx + 1}</td>
                      <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-hicyan" />
                        <span>{reg.regionName}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                        {reg.customerCount}
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono font-black text-slate-900 dark:text-white">
                        {reg.totalIssues}
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {reg.closedIssues}
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono font-bold text-amber-600 dark:text-amber-400">
                        {reg.openIssues}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-hicyan h-full rounded-full" 
                              style={{ width: `${reg.sharePercentage}%` }} 
                            />
                          </div>
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                            {reg.sharePercentage}%
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          reg.totalIssues > 0 
                            ? 'bg-hicyan-light dark:bg-hicyan/20 text-hicyan-dark dark:text-hicyan-neon border border-hicyan/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}>
                          {reg.totalIssues > 0 ? 'FAOL HUDUD' : 'STATIK'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DASTURIY MAHSULOTLAR KESIMIDA */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Product KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {productStats.map((prod) => (
              <div 
                key={prod.productId}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-hicyan-light dark:bg-hicyan/20 text-hicyan flex items-center justify-center font-bold">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white">{prod.productName}</h4>
                      <span className="text-[10px] font-mono text-slate-400">KODI: {prod.code}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {prod.sharePercentage}% ULUSH
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center font-mono">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">JAMI</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">{prod.totalIssues}</span>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg">
                    <span className="text-[10px] text-emerald-600 block">YOPILGAN</span>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{prod.closedIssues}</span>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg">
                    <span className="text-[10px] text-amber-600 block">OCHIQ</span>
                    <span className="text-base font-black text-amber-600 dark:text-amber-400">{prod.openIssues}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-500 font-medium flex items-center justify-between">
                  <span>Faol foydalanuvchi korxonalar:</span>
                  <b className="font-mono text-slate-800 dark:text-slate-200">{prod.activeCustomerCount} ta</b>
                </div>
              </div>
            ))}
          </div>

          {/* Product Breakdown Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-hicyan" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white font-mono uppercase">
                  Dasturiy mahsulotlar samaradorlik ko‘rsatkichlari
                </h3>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-mono font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-5 py-3.5">Dastur Nomi</th>
                    <th className="px-4 py-3.5 text-center">Kodi</th>
                    <th className="px-4 py-3.5 text-center">Faol Mijozlar</th>
                    <th className="px-4 py-3.5 text-center">Jami Murojaatlar</th>
                    <th className="px-4 py-3.5 text-center">Yopilgan</th>
                    <th className="px-4 py-3.5 text-center">Ochiq</th>
                    <th className="px-5 py-3.5">Muvaffaqiyat Ulushi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {productStats.map((prod) => {
                    const successRate = prod.totalIssues > 0 ? Math.round((prod.closedIssues / prod.totalIssues) * 100) : 100;
                    return (
                      <tr key={prod.productId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-4 font-bold text-slate-900 dark:text-white text-sm">
                          {prod.productName}
                        </td>
                        <td className="px-4 py-4 text-center font-mono font-bold text-slate-500">
                          {prod.code}
                        </td>
                        <td className="px-4 py-4 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                          {prod.activeCustomerCount} ta
                        </td>
                        <td className="px-4 py-4 text-center font-mono font-black text-slate-900 dark:text-white">
                          {prod.totalIssues} ta
                        </td>
                        <td className="px-4 py-4 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {prod.closedIssues} ta
                        </td>
                        <td className="px-4 py-4 text-center font-mono font-bold text-amber-600 dark:text-amber-400">
                          {prod.openIssues} ta
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                              <div className="bg-himint h-full rounded-full" style={{ width: `${successRate}%` }} />
                            </div>
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{successRate}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VILOYAT + MAHSULOT MATRITSASI */}
      {activeTab === 'matrix' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm space-y-0">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white font-mono uppercase flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-hicyan" />
                <span>Viloyat + Dasturiy Mahsulot Murojaatlar Matritsasi</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                14 ta hudud qatorlarda, dasturiy mahsulotlar ustunlarda ko‘rsatilgan o‘zaro kesishma tahlil
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-hicyan-light dark:bg-hicyan/10 text-hicyan-dark dark:text-hicyan-neon border border-hicyan/30">
              CROSS-TABULATION MATRIX
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 font-mono font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3.5">Viloyat / Hudud</th>
                  <th className="px-4 py-3.5 text-center">POSCODE</th>
                  <th className="px-4 py-3.5 text-center">RESTOPLUS</th>
                  <th className="px-4 py-3.5 text-center">MIZAAN</th>
                  <th className="px-5 py-3.5 text-center font-black text-slate-800 dark:text-slate-200">JAMI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {matrixData.map((row) => {
                  const pos = row.products['prod_poscode'] || 0;
                  const resto = row.products['prod_restoplus'] || 0;
                  const miz = row.products['prod_mizaan'] || 0;

                  return (
                    <tr key={row.regionId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3 font-sans font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{row.regionName}</span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className={`px-3 py-1 rounded-md font-bold ${
                          pos > 0 
                            ? 'bg-hicyan-light text-hicyan-dark dark:bg-hicyan/20 dark:text-hicyan-neon font-black border border-hicyan/40' 
                            : 'text-slate-400'
                        }`}>
                          {pos}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className={`px-3 py-1 rounded-md font-bold ${
                          resto > 0 
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-black border border-purple-400/40' 
                            : 'text-slate-400'
                        }`}>
                          {resto}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className={`px-3 py-1 rounded-md font-bold ${
                          miz > 0 
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-black border border-amber-400/40' 
                            : 'text-slate-400'
                        }`}>
                          {miz}
                        </span>
                      </td>

                      <td className="px-5 py-3 text-center">
                        <span className={`px-3 py-1 rounded-md font-black ${
                          row.total > 0 
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm' 
                            : 'text-slate-400'
                        }`}>
                          {row.total}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: TELEGRAM MIJOZLAR TAHLILI */}
      {activeTab === 'telegram' && (
        <div className="space-y-6">
          {/* Telegram KPI Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">Jami Mijozlar</span>
              <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
                {telegramStats?.totalCustomers ?? 0}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Ro‘yxatdagi korxonalar</div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] font-mono font-bold text-himint uppercase">Bog‘langan Mijozlar</span>
              <div className="text-2xl font-black font-mono text-himint-dark dark:text-himint-neon mt-1">
                {telegramStats?.linkedCount ?? 0} ({telegramStats?.linkedPercentage ?? 0}%)
              </div>
              <div className="text-[10px] text-emerald-600 mt-0.5">Telegram orqali xabar oladi</div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] font-mono font-bold text-blue-500 uppercase">Yuborilgan Xabarnomalar</span>
              <div className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400 mt-1">
                {telegramStats?.totalNotificationsSent ?? 0}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Murojaat yangilanishlari</div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] font-mono font-bold text-amber-500 uppercase">Bog‘lanmagan Mijozlar</span>
              <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400 mt-1">
                {telegramStats?.unlinkedCount ?? 0}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Havola yuborilishi kutilmoqda</div>
            </div>
          </div>

          {/* Telegram Notification Logs Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-hicyan" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white font-mono uppercase">
                  Mijozlarga yuborilgan Telegram xabarnomalari auditi (Logs)
                </h3>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-mono font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-5 py-3.5">Yuborilgan Sana</th>
                    <th className="px-5 py-3.5">Mijoz Tashkilot</th>
                    <th className="px-4 py-3.5">Murojaat Kodi</th>
                    <th className="px-4 py-3.5">Xabar Voqeasi</th>
                    <th className="px-4 py-3.5">Telegram Chat ID</th>
                    <th className="px-5 py-3.5 text-right">Holat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {telegramStats?.recentLogs && telegramStats.recentLogs.length > 0 ? (
                    telegramStats.recentLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-slate-400">
                          {new Date(log.sentAt).toLocaleString('uz-UZ')}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                          {log.customerName}
                        </td>
                        <td className="px-4 py-3.5 font-mono font-bold text-hicyan">
                          {log.issueCode || '—'}
                        </td>
                        <td className="px-4 py-3.5 font-medium">
                          {log.notificationType === 'ISSUE_CREATED' ? 'Yangi murojaat qabul qilindi' :
                           log.notificationType === 'SOLUTION_READY' ? 'Yechim tayyor (Sinovga topshirildi)' :
                           log.notificationType === 'ISSUE_CLOSED' ? 'Murojaat muvaffaqiyatli yopildi' :
                           'Test xabarnomasi'}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-500">
                          {log.telegramChatId}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            log.deliveryStatus === 'SENT' 
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' 
                              : log.deliveryStatus === 'SIMULATED'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                          }`}>
                            {log.deliveryStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-slate-400 font-mono">
                        // Hozircha Telegram orqali yuborilgan xabarlar jurnali mavjud emas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: XODIMLAR & KPI REYTINGI */}
      {activeTab === 'team' && (
        <div className="space-y-6">
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
        </div>
      )}
    </div>
  );
};
