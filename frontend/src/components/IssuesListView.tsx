import React, { useState } from 'react';
import { Issue, Priority, StageId } from '../types';
import { translations, Language } from '../translations';
import { Search, Filter, ShieldCheck, Clock, User, ArrowUpDown, ChevronRight } from 'lucide-react';

interface IssuesListViewProps {
  issues: Issue[];
  lang: Language;
  onSelectIssue: (issue: Issue) => void;
}

export const IssuesListView: React.FC<IssuesListViewProps> = ({
  issues,
  lang,
  onSelectIssue
}) => {
  const t = translations[lang];
  const [search, setSearch] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');

  const filteredIssues = issues.filter((iss) => {
    const matchesSearch = 
      iss.code.toLowerCase().includes(search.toLowerCase()) ||
      iss.title.toLowerCase().includes(search.toLowerCase()) ||
      iss.customerName.toLowerCase().includes(search.toLowerCase()) ||
      iss.productName.toLowerCase().includes(search.toLowerCase());

    const matchesStage = selectedStage === 'ALL' || iss.stage === selectedStage;
    const matchesPriority = selectedPriority === 'ALL' || iss.priority === selectedPriority;

    return matchesSearch && matchesStage && matchesPriority;
  });

  return (
    <div className="space-y-4 font-sans">
      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 font-mono text-xs transition-colors">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Qidiruv: Kod, muammo nomi, mijoz..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-10 pr-3.5 py-2 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-hicyan transition-colors font-sans"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto text-xs">
          {/* Stage filter */}
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl">
            <span>BOSQICH:</span>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-white dark:bg-slate-900">BARCHASI</option>
              <option value="STAGE_1_ACCEPTED" className="bg-white dark:bg-slate-900">STAGE 01: QABUL & DEV</option>
              <option value="STAGE_2_RESOLVED" className="bg-white dark:bg-slate-900">STAGE 02: YECHIM TAYYOR</option>
              <option value="STAGE_3_DISPATCHED" className="bg-white dark:bg-slate-900">STAGE 03: YETKAZILDI</option>
              <option value="STAGE_4_CONFIRMED" className="bg-white dark:bg-slate-900">STAGE 04: TASDIQLANDI</option>
            </select>
          </div>

          {/* Priority filter */}
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl">
            <span>PRIORITET:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-white dark:bg-slate-900">BARCHASI</option>
              <option value="CRITICAL" className="bg-white dark:bg-slate-900">CRITICAL</option>
              <option value="HIGH" className="bg-white dark:bg-slate-900">HIGH</option>
              <option value="MEDIUM" className="bg-white dark:bg-slate-900">MEDIUM</option>
              <option value="LOW" className="bg-white dark:bg-slate-900">LOW</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono font-bold uppercase tracking-wider text-xs">
                <th className="py-3.5 px-4">KOD // MUAMMO</th>
                <th className="py-3.5 px-4">MIJOZ</th>
                <th className="py-3.5 px-4">DASTUR & MODUL</th>
                <th className="py-3.5 px-4">MAS'UL</th>
                <th className="py-3.5 px-4">PRIORITET</th>
                <th className="py-3.5 px-4">4 BOSQICHLI HOLAT</th>
                <th className="py-3.5 px-4 text-right">AMAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-slate-400 font-mono text-sm">
                    // QIDIRUV BO'YICHA MA'LUMOT TOPILMADI //
                  </td>
                </tr>
              ) : (
                filteredIssues.map((iss) => (
                  <tr
                    key={iss.id}
                    onClick={() => onSelectIssue(iss)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  >
                    {/* Code & Title */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-hicyan bg-hicyan-light/60 dark:bg-hicyan/20 px-2.5 py-0.5 rounded border border-hicyan/30">
                          {iss.code}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white group-hover:text-hicyan transition-colors text-sm">
                          {iss.title}
                        </span>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-4 px-4 text-slate-800 dark:text-slate-200 font-medium text-xs">
                      🏢 {iss.customerName}
                    </td>

                    {/* Product & Module */}
                    <td className="py-4 px-4 font-mono text-xs">
                      <div className="text-slate-900 dark:text-white font-bold">{iss.productName}</div>
                      <div className="text-slate-500 dark:text-slate-400 text-[11px]">{iss.moduleName}</div>
                    </td>

                    {/* Assignee */}
                    <td className="py-4 px-4 text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{iss.assignedDevName || 'Biriktirilmagan'}</span>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="py-4 px-4 font-mono">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                        iss.priority === 'CRITICAL' ? 'bg-hiamber-light dark:bg-hiamber/20 text-hiamber-dark dark:text-hiamber-neon border border-hiamber/40' :
                        iss.priority === 'HIGH' ? 'bg-hiamber-light/70 dark:bg-hiamber/15 text-hiamber-dark dark:text-hiamber-neon border border-hiamber/30' :
                        'bg-hicyan-light dark:bg-hicyan/20 text-hicyan-dark dark:text-hicyan-neon border border-hicyan/30'
                      }`}>
                        {iss.priority}
                      </span>
                    </td>

                    {/* 4-Stage Progress */}
                    <td className="py-4 px-4 font-mono">
                      <div className="space-y-1.5">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded inline-block ${
                          iss.stage === 'STAGE_4_CONFIRMED' ? 'bg-himint-light dark:bg-himint/20 text-himint-dark dark:text-himint-neon border border-himint/40' :
                          iss.stage === 'STAGE_3_DISPATCHED' ? 'bg-hiamber-light dark:bg-hiamber/20 text-hiamber-dark dark:text-hiamber-neon border border-hiamber/40' :
                          iss.stage === 'STAGE_2_RESOLVED' ? 'bg-hiamber-light dark:bg-hiamber/20 text-hiamber-dark dark:text-hiamber-neon border border-hiamber/40' :
                          'bg-hicyan-light dark:bg-hicyan/20 text-hicyan-dark dark:text-hicyan-neon border border-hicyan/30'
                        }`}>
                          {iss.stage === 'STAGE_1_ACCEPTED' ? '01 // QABUL & DEV' :
                           iss.stage === 'STAGE_2_RESOLVED' ? '02 // YECHIM TAYYOR' :
                           iss.stage === 'STAGE_3_DISPATCHED' ? '03 // YETKAZILDI' : '04 // TASDIQLANDI'}
                        </span>

                        {/* Progress Bar with 3 colors */}
                        <div className="w-32 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex border border-slate-200 dark:border-slate-700">
                          <div className={`h-full ${iss.stage ? 'bg-hicyan w-1/4' : ''}`} />
                          <div className={`h-full ${iss.stage === 'STAGE_2_RESOLVED' || iss.stage === 'STAGE_3_DISPATCHED' || iss.stage === 'STAGE_4_CONFIRMED' ? 'bg-hiamber w-1/4' : ''}`} />
                          <div className={`h-full ${iss.stage === 'STAGE_3_DISPATCHED' || iss.stage === 'STAGE_4_CONFIRMED' ? 'bg-hiamber-dark w-1/4' : ''}`} />
                          <div className={`h-full ${iss.stage === 'STAGE_4_CONFIRMED' ? 'bg-himint w-1/4' : ''}`} />
                        </div>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 text-right">
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-hicyan inline-block transition-transform group-hover:translate-x-1" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
