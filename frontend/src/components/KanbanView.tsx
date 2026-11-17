import React from 'react';
import { Issue, IssueStatus, UserRole } from '../types';
import { translations, Language } from '../translations';
import { Clock, ShieldAlert, CheckCircle2, User, ChevronRight, AlertTriangle, Cpu } from 'lucide-react';

interface KanbanViewProps {
  issues: Issue[];
  currentRole: UserRole;
  lang: Language;
  onSelectIssue: (issue: Issue) => void;
  onUpdateStatus: (issueId: string, newStatus: IssueStatus) => void;
}

export const KanbanView: React.FC<KanbanViewProps> = ({
  issues,
  currentRole,
  lang,
  onSelectIssue,
  onUpdateStatus
}) => {
  const t = translations[lang];

  const columns: {
    id: string;
    code: string;
    titleUz: string;
    titleRu: string;
    headerClass: string;
    badgeClass: string;
    descriptionUz: string;
    descriptionRu: string;
    filter: (i: Issue) => boolean;
  }[] = [
    {
      id: 'col_stage_1',
      code: '01',
      titleUz: 'QABUL & DEV',
      titleRu: 'ПРИНЯТО И В РАБОТЕ',
      headerClass: 'border-hicyan/40 bg-hicyan-light/50 dark:bg-hicyan/15 text-hicyan-dark dark:text-hicyan-neon',
      badgeClass: 'bg-white dark:bg-slate-800 text-hicyan border-hicyan/30',
      descriptionUz: 'Dasturchilar ishlayotgan masalalar',
      descriptionRu: 'Задачи в разработке',
      filter: (i) => i.stage === 'STAGE_1_ACCEPTED' && i.status !== 'CLOSED'
    },
    {
      id: 'col_stage_2',
      code: '02',
      titleUz: 'YECHIM TAYYOR',
      titleRu: 'РЕШЕНИЕ ГОТОВО',
      headerClass: 'border-hiamber/50 bg-hiamber-light/70 dark:bg-hiamber/20 text-hiamber-dark dark:text-hiamber-neon',
      badgeClass: 'bg-white dark:bg-slate-800 text-hiamber border-hiamber/40',
      descriptionUz: 'Dasturchi yechim topshirdi, ammo murojaat ochiq!',
      descriptionRu: 'Решение сдано, но задача открыта!',
      filter: (i) => i.stage === 'STAGE_2_RESOLVED' && i.status === 'SOLUTION_READY'
    },
    {
      id: 'col_stage_3',
      code: '03',
      titleUz: 'MIJOZGA YETKAZILDI',
      titleRu: 'ПЕРЕДАНО КЛИЕНТУ',
      headerClass: 'border-hiamber/40 bg-hiamber-light/40 dark:bg-hiamber/10 text-hiamber-dark dark:text-hiamber-neon',
      badgeClass: 'bg-white dark:bg-slate-800 text-hiamber-dark dark:text-hiamber-neon border-hiamber/30',
      descriptionUz: 'Mijoz sinovdan o\'tkazmoqda, tasdiq kutilmoqda',
      descriptionRu: 'Клиент проверяет и подтверждает',
      filter: (i) => i.stage === 'STAGE_3_DISPATCHED' && i.status === 'CUSTOMER_CONFIRM'
    },
    {
      id: 'col_stage_4',
      code: '04',
      titleUz: 'MIJOZ TASDIQLADI',
      titleRu: 'ПОДТВЕРЖДЕНО',
      headerClass: 'border-himint/40 bg-himint-light/60 dark:bg-himint/15 text-himint-dark dark:text-himint-neon',
      badgeClass: 'bg-white dark:bg-slate-800 text-himint border-himint/40',
      descriptionUz: 'Mijoz rozi bo\'lgach rasman yopilgan',
      descriptionRu: 'Официально закрыто с согласия клиента',
      filter: (i) => i.stage === 'STAGE_4_CONFIRMED' || i.status === 'CLOSED'
    }
  ];

  return (
    <div className="space-y-5">
      {/* Hi-Tech Status Header */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-sm font-mono transition-colors">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <Cpu className="w-4 h-4 text-hicyan" />
          <span className="text-sm font-semibold">// KANBAN WORKFLOW: 4-STAGE PIPELINE STRICTLY ENFORCED</span>
        </div>

        {currentRole === 'DEVELOPER' && (
          <div className="text-hiamber-dark dark:text-hiamber-neon bg-hiamber-light dark:bg-hiamber/20 px-3 py-1 rounded-lg border border-hiamber/40 font-bold">
            🔒 DEVELOPER: STAGE 04 (CLOSED) YOPISH CHEKLANGAN
          </div>
        )}
      </div>

      {/* 4 Hi-tech Columns Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        {columns.map((col) => {
          const colIssues = issues.filter(col.filter);

          return (
            <div
              key={col.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col max-h-[calc(100vh-210px)] shadow-sm overflow-hidden transition-colors"
            >
              {/* Column Header */}
              <div className={`p-3.5 border-b border-slate-200 dark:border-slate-800 font-mono ${col.headerClass}`}>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-sm tracking-tight flex items-center gap-1.5">
                    <span>{col.code} //</span>
                    <span>{lang === 'UZ' ? col.titleUz : col.titleRu}</span>
                  </h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border ${col.badgeClass}`}>
                    {colIssues.length}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-sans line-clamp-1">
                  {lang === 'UZ' ? col.descriptionUz : col.descriptionRu}
                </p>
              </div>

              {/* Cards list */}
              <div className="p-3 space-y-3 overflow-y-auto flex-1 bg-slate-50/60 dark:bg-slate-950/40">
                {colIssues.length === 0 ? (
                  <div className="py-14 text-center text-xs text-slate-400 font-mono border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    // BO'SH //
                  </div>
                ) : (
                  colIssues.map((issue) => {
                    const isOverdue = issue.dueDate && new Date(issue.dueDate).getTime() < Date.now() && issue.status !== 'CLOSED';

                    return (
                      <div
                        key={issue.id}
                        onClick={() => onSelectIssue(issue)}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-hicyan dark:hover:border-hicyan rounded-xl p-4 cursor-pointer transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 group space-y-3 relative"
                      >
                        {/* Top: Code & Priority */}
                        <div className="flex items-center justify-between font-mono text-xs">
                          <span className="font-bold text-hicyan-dark dark:text-hicyan-neon bg-hicyan-light/60 dark:bg-hicyan/20 px-2 py-0.5 rounded border border-hicyan/30">
                            {issue.code}
                          </span>

                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase ${
                            issue.priority === 'CRITICAL' ? 'bg-hiamber-light dark:bg-hiamber/20 text-hiamber-dark dark:text-hiamber-neon border border-hiamber/40' :
                            issue.priority === 'HIGH' ? 'bg-hiamber-light/70 dark:bg-hiamber/15 text-hiamber-dark dark:text-hiamber-neon border border-hiamber/30' :
                            'bg-hicyan-light dark:bg-hicyan/20 text-hicyan-dark dark:text-hicyan-neon border border-hicyan/30'
                          }`}>
                            {issue.priority}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-hicyan transition-colors line-clamp-2 leading-snug">
                          {issue.title}
                        </h4>

                        {/* Product & Module tag */}
                        <div className="flex items-center gap-1.5 flex-wrap font-mono text-[11px]">
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded font-semibold border border-slate-200 dark:border-slate-700">
                            💻 {issue.productName}
                          </span>
                          <span className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                            {issue.moduleName}
                          </span>
                        </div>

                        {/* Customer */}
                        <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                          <span>🏢</span>
                          <span className="text-slate-800 dark:text-slate-200 truncate">{issue.customerName}</span>
                        </div>

                        {/* Developer & Overdue */}
                        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
                          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span className="truncate max-w-[120px]">
                              {issue.assignedDevName ? issue.assignedDevName.split(' ')[0] : 'Biriktirilmagan'}
                            </span>
                          </div>

                          {isOverdue ? (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-hiamber-dark dark:text-hiamber-neon bg-hiamber-light dark:bg-hiamber/20 px-2 py-0.5 rounded border border-hiamber/40">
                              <AlertTriangle className="w-3 h-3 text-hiamber" />
                              MUDDATI O'TDI
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 dark:text-slate-500">
                              {new Date(issue.reportedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        {/* Action prompts inside card */}
                        {issue.stage === 'STAGE_2_RESOLVED' && (
                          <div className="p-2.5 bg-hiamber-light dark:bg-hiamber/15 border border-hiamber/40 rounded-lg text-xs text-hiamber-dark dark:text-hiamber-neon font-mono font-bold flex items-center justify-between">
                            <span>MIJOZGA YETKAZISH SHART</span>
                            <span>YETKAZISH →</span>
                          </div>
                        )}

                        {issue.stage === 'STAGE_3_DISPATCHED' && (
                          <div className="p-2.5 bg-hiamber-light/60 dark:bg-hiamber/10 border border-hiamber/40 rounded-lg text-xs text-hiamber-dark dark:text-hiamber-neon font-mono font-bold flex items-center justify-between">
                            <span>TASDIQ KUTILMOQDA</span>
                            <span>TASDIQLATISH →</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
