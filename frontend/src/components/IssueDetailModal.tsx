import React, { useState } from 'react';
import { Issue, StageId, UserRole } from '../types';
import { StageStepper } from './StageStepper';
import { Language } from '../translations';
import { 
  X, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ExternalLink, 
  User, 
  ShieldAlert,
  Star,
  RotateCcw,
  Cpu,
  Lock,
  Pause,
  Play,
  ArrowRight,
  History,
  MessageSquare
} from 'lucide-react';

interface IssueDetailModalProps {
  issue: Issue;
  currentRole: UserRole;
  lang: Language;
  onClose: () => void;
  onAcceptTask: (issueId: string) => Promise<void>;
  onPauseTask: (issueId: string, reason: string) => Promise<void>;
  onResumeTask: (issueId: string) => Promise<void>;
  onSubmitSolution: (issueId: string, solutionData: { solutionNote: string; commitUrl: string; appVersion: string }) => Promise<void>;
  onDispatchToCustomer: (issueId: string, dispatchData: { dispatchMethod: string; dispatchNote: string }) => Promise<void>;
  onConfirmClose: (issueId: string, closeData: { customerFeedback: string; customerRating: number }) => Promise<void>;
  onReopen: (issueId: string, reason: string) => Promise<void>;
  onAddComment: (issueId: string, content: string) => Promise<void>;
}

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  issue,
  currentRole,
  lang,
  onClose,
  onAcceptTask,
  onPauseTask,
  onResumeTask,
  onSubmitSolution,
  onDispatchToCustomer,
  onConfirmClose,
  onReopen,
  onAddComment
}) => {
  const [activeTab, setActiveTab] = useState<'workflow' | 'cycles' | 'comments'>('workflow');
  
  // Pause reason
  const [pauseReason, setPauseReason] = useState('');
  const [showPauseModal, setShowPauseModal] = useState(false);

  // Stage 2 inputs
  const [solutionNote, setSolutionNote] = useState('');
  const [commitUrl, setCommitUrl] = useState('');
  const [appVersion, setAppVersion] = useState('');
  
  // Stage 3 inputs
  const [dispatchMethod, setDispatchMethod] = useState<'TELEGRAM' | 'PHONE' | 'MEETING' | 'REMOTE'>('TELEGRAM');
  const [dispatchNote, setDispatchNote] = useState('');

  // Stage 4 inputs
  const [customerFeedback, setCustomerFeedback] = useState('Mijoz tekshirib ko\'rdi va muammo bartaraf etilganini tasdiqladi.');
  const [customerRating, setCustomerRating] = useState(5);

  // Reopen input
  const [reopenReason, setReopenReason] = useState('');
  const [showReopenForm, setShowReopenForm] = useState(false);

  // New comment input
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  const isMutaxassis = currentRole === 'MUTAXASSIS' || (currentRole as string) === 'DEVELOPER';
  const isOperator = currentRole === 'OPERATOR';
  const isAdminOrManager = currentRole === 'SUPER_ADMIN' || currentRole === 'MANAGER';

  // Format seconds to human readable
  const formatSec = (sec: number) => {
    if (sec < 60) return `${sec}s`;
    const m = Math.floor(sec / 60);
    if (m < 60) return `${m} daqiqa`;
    const h = Math.floor(m / 60);
    const rm = m % 60;
    return `${h} soat ${rm > 0 ? `${rm} d.` : ''}`;
  };

  // Handlers
  const handleAccept = async () => {
    setLoading(true);
    try {
      await onAcceptTask(issue.id);
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pauseReason.trim()) return;
    setLoading(true);
    try {
      await onPauseTask(issue.id, pauseReason.trim());
      setShowPauseModal(false);
      setPauseReason('');
    } finally {
      setLoading(false);
    }
  };

  const handleResume = async () => {
    setLoading(true);
    try {
      await onResumeTask(issue.id);
    } finally {
      setLoading(false);
    }
  };

  const handleSolutionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solutionNote.trim()) return;
    setLoading(true);
    try {
      await onSubmitSolution(issue.id, { solutionNote, commitUrl, appVersion });
    } finally {
      setLoading(false);
    }
  };

  const handleDispatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onDispatchToCustomer(issue.id, { dispatchMethod, dispatchNote });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onConfirmClose(issue.id, { customerFeedback, customerRating });
    } finally {
      setLoading(false);
    }
  };

  const handleReopenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reopenReason.trim()) return;
    setLoading(true);
    try {
      await onReopen(issue.id, reopenReason);
      setShowReopenForm(false);
      setReopenReason('');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      await onAddComment(issue.id, newComment);
      setNewComment('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono font-black text-sm px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
              {issue.code}
            </span>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                issue.priority === 'CRITICAL' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' :
                issue.priority === 'HIGH' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
              }`}>
                {issue.priority}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {issue.productName} ({issue.moduleName})
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Issue Title & Description */}
        <div className="px-6 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800/60">
          <h2 className="text-lg font-black text-slate-900 dark:text-white mb-1">
            {issue.title}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
            {issue.description}
          </p>

          {/* PERMANENT OPERATOR LOCK BANNER */}
          <div className="mt-3 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-semibold">
              <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <span>Qabul qilgan operator: <b>{issue.created_by_operator_name}</b> (O'zgarmas nazoratchi)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium">
              <span>Mas'ul mutaxassis: <b>{issue.current_specialist_name || 'Biriktirilmagan'}</b></span>
              {issue.reopenCount > 0 && (
                <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-bold font-mono">
                  Sikl #{issue.currentCycleNumber} ({issue.reopenCount} marta qaytarilgan)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 4-Stage Stepper Component */}
        <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
          <StageStepper currentStage={issue.stage} status={issue.status} lang={lang} />
        </div>

        {/* Tab Controls */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 text-xs font-mono font-bold">
          <button
            onClick={() => setActiveTab('workflow')}
            className={`py-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'workflow'
                ? 'border-hicyan text-hicyan dark:text-hicyan-neon'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            NAZORAT VA YECHIM JARAYONI
          </button>
          <button
            onClick={() => setActiveTab('cycles')}
            className={`py-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'cycles'
                ? 'border-hicyan text-hicyan dark:text-hicyan-neon'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>ISH SIKLLARI ({issue.cycles?.length || 1})</span>
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`py-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'comments'
                ? 'border-hicyan text-hicyan dark:text-hicyan-neon'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>IZOHLAR VA TARIX ({issue.comments?.length || 0})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'workflow' && (
            <div className="space-y-6">
              {/* STAGE 1: MUTAXASSIS ISHGA QABUL QILISHI / BOSHLASHI */}
              <div className={`p-4 rounded-xl border ${
                issue.stage === 'STAGE_1_ACCEPTED' 
                  ? 'border-hicyan/60 bg-hicyan-light/20 dark:bg-hicyan/10' 
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs uppercase font-mono text-slate-700 dark:text-slate-300">
                    1-Bosqich: Murojaat qabul qilindi & Mutaxassis topshirig'i
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {new Date(issue.reportedAt).toLocaleString('uz-UZ')}
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <div>Mijoz: <b>{issue.customerName}</b> ({issue.customerPhone || 'Telefon kiritilmagan'})</div>
                  <div>Qabul qilgan operator: <b>{issue.created_by_operator_name}</b></div>
                  <div>Mas'ul mutaxassis: <b>{issue.current_specialist_name || 'Biriktirilmagan'}</b></div>
                  <div>Holat: <b className="font-mono text-hicyan-dark dark:text-hicyan-neon">{issue.status}</b></div>
                </div>

                {/* Mutaxassis status controls */}
                {issue.stage === 'STAGE_1_ACCEPTED' && (
                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-2">
                    {issue.status === 'ASSIGNED' || issue.status === 'NEW' || issue.status === 'REOPENED' ? (
                      <button
                        onClick={handleAccept}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-hicyan hover:bg-hicyan-dark text-white rounded-lg text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                      >
                        <Play className="w-4 h-4" />
                        <span>Vazifani qabul qilish & Boshlash</span>
                      </button>
                    ) : issue.status === 'IN_PROGRESS' ? (
                      <>
                        <button
                          onClick={() => setShowPauseModal(true)}
                          disabled={loading}
                          className="flex items-center gap-2 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                        >
                          <Pause className="w-4 h-4" />
                          <span>Kutish rejimiga o'tkazish</span>
                        </button>
                        <span className="text-xs text-slate-500">Mutaxassis kod yoki texnik tahlil ustida ishlamoqda...</span>
                      </>
                    ) : issue.status === 'WAITING' ? (
                      <button
                        onClick={handleResume}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        <Play className="w-4 h-4" />
                        <span>Kutishdan chiqarish & Davom ettirish</span>
                      </button>
                    ) : null}
                  </div>
                )}
              </div>

              {/* STAGE 2: MUTAXASSIS YECHIMINI TOPSHIRISHI (OPERATORGA QAYTARISH) */}
              <div className={`p-4 rounded-xl border ${
                issue.stage === 'STAGE_1_ACCEPTED' && issue.status === 'IN_PROGRESS'
                  ? 'border-blue-400 bg-blue-50/40 dark:bg-blue-950/20'
                  : issue.stage === 'STAGE_2_RESOLVED'
                  ? 'border-himint/60 bg-himint-light/20 dark:bg-himint/10'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs uppercase font-mono text-slate-700 dark:text-slate-300">
                    2-Bosqich: Mas'ul mutaxassis yechimi (Operatorga topshirish)
                  </span>
                  {issue.resolvedAt && (
                    <span className="text-xs font-mono text-slate-400">
                      {new Date(issue.resolvedAt).toLocaleString('uz-UZ')}
                    </span>
                  )}
                </div>

                {issue.resolvedAt ? (
                  <div className="text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                    <div><b>Yechim izohi:</b> {issue.solutionNote}</div>
                    {issue.appVersion && <div><b>Dastur versiyasi:</b> <code>{issue.appVersion}</code></div>}
                    {issue.commitUrl && (
                      <div>
                        <b>Commit havolasi:</b>{' '}
                        <a href={issue.commitUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                          {issue.commitUrl}
                        </a>
                      </div>
                    )}
                    <div className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px] mt-2">
                      ✅ Yechim operator ({issue.created_by_operator_name}) ga topshirildi. Mijozga yetkazish kutilmoqda.
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-slate-500 mb-3">
                      Mutaxassis muammoni to'liq hal qilib, natijani operatorga qaytaradi. Mutaxassis murojaatni mustaqil yopa olmaydi.
                    </p>
                    {/* Submit solution form (Active if in progress) */}
                    {(issue.status === 'IN_PROGRESS' || issue.status === 'WAITING' || issue.status === 'ASSIGNED') && (
                      <form onSubmit={handleSolutionSubmit} className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Yechim tavsifi <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            required
                            rows={3}
                            value={solutionNote}
                            onChange={(e) => setSolutionNote(e.target.value)}
                            placeholder="Qanday tuzatish kiritildi, qaysi fayllar yangilandi..."
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-himint"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Commit URL (Ixtiyoriy)
                            </label>
                            <input
                              type="url"
                              value={commitUrl}
                              onChange={(e) => setCommitUrl(e.target.value)}
                              placeholder="https://github.com/.../commit/..."
                              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Yangi build/versiya (Ixtiyoriy)
                            </label>
                            <input
                              type="text"
                              value={appVersion}
                              onChange={(e) => setAppVersion(e.target.value)}
                              placeholder="v2.4.2"
                              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-white"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={loading || !solutionNote.trim()}
                          className="px-4 py-2 bg-himint hover:bg-himint-dark text-white rounded-lg text-xs font-bold shadow-md shadow-himint/20 cursor-pointer disabled:opacity-50"
                        >
                          {loading ? 'Yuborilmoqda...' : 'Yechimni operatorga topshirish'}
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>

              {/* STAGE 3: OPERATOR MIJOZGA YETKAZISHI */}
              <div className={`p-4 rounded-xl border ${
                issue.stage === 'STAGE_2_RESOLVED' && issue.status === 'SOLUTION_READY'
                  ? 'border-hiamber/80 bg-hiamber-light/20 dark:bg-hiamber/10'
                  : issue.stage === 'STAGE_3_DISPATCHED'
                  ? 'border-blue-400 bg-blue-50/30 dark:bg-blue-950/20'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs uppercase font-mono text-slate-700 dark:text-slate-300">
                    3-Bosqich: Operator yechimni mijozga yetkazishi
                  </span>
                  {issue.dispatchedAt && (
                    <span className="text-xs font-mono text-slate-400">
                      {new Date(issue.dispatchedAt).toLocaleString('uz-UZ')}
                    </span>
                  )}
                </div>

                {issue.dispatchedAt ? (
                  <div className="text-xs space-y-1 text-slate-700 dark:text-slate-300">
                    <div><b>Yetkazish usuli:</b> {issue.dispatchMethod}</div>
                    <div><b>Operator izohi:</b> {issue.dispatchNote}</div>
                    <div><b>Mas'ul operator:</b> {issue.dispatchedByName}</div>
                  </div>
                ) : issue.stage === 'STAGE_2_RESOLVED' ? (
                  <form onSubmit={handleDispatchSubmit} className="space-y-3">
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      ⚠️ Mutaxassis muammoni hal qildi. Operator mijoz bilan bog'lanib yangilanishni yetkazishi shart.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Aloqa usuli
                        </label>
                        <select
                          value={dispatchMethod}
                          onChange={(e) => setDispatchMethod(e.target.value as any)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white"
                        >
                          <option value="TELEGRAM">Telegram orqali</option>
                          <option value="PHONE">Telefon qo'ng'irog'i</option>
                          <option value="REMOTE">Masofaviy o'rnatish (AnyDesk/TeamViewer)</option>
                          <option value="MEETING">Shaxsiy uchrashuv / Obyektga borish</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Yetkazilganlik izohi
                        </label>
                        <input
                          type="text"
                          value={dispatchNote}
                          onChange={(e) => setDispatchNote(e.target.value)}
                          placeholder="Mijozga yangi versiya o'rnatib berildi..."
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      {loading ? 'Belgilanmoqda...' : 'Mijozga yetkazilganini tasdiqlash'}
                    </button>
                  </form>
                ) : (
                  <p className="text-xs text-slate-400">Mutaxassis yechim berishi kutilmoqda.</p>
                )}
              </div>

              {/* STAGE 4: MIJOZ NATIJANI TASDIQLADI & YOPILDI / QAYTARILDI */}
              <div className={`p-4 rounded-xl border ${
                issue.status === 'CLOSED'
                  ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
                  : issue.stage === 'STAGE_3_DISPATCHED'
                  ? 'border-purple-400 bg-purple-50/30 dark:bg-purple-950/20'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs uppercase font-mono text-slate-700 dark:text-slate-300">
                    4-Bosqich: Mijoz natijani tasdiqladi (Rasmiy yopish)
                  </span>
                  {issue.closedAt && (
                    <span className="text-xs font-mono text-slate-400">
                      {new Date(issue.closedAt).toLocaleString('uz-UZ')}
                    </span>
                  )}
                </div>

                {issue.status === 'CLOSED' ? (
                  <div className="text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                      <span>Mijoz bahosi:</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${
                              s <= (issue.customerRating || 5)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div><b>Mijoz fikri:</b> <i>"{issue.customerFeedback}"</i></div>
                    <div><b>Yopgan operator:</b> {issue.closedByName}</div>
                    <div className="text-emerald-600 dark:text-emerald-400 font-bold mt-2">
                      🎉 Murojaat barcha 4 bosqichdan muvaffaqiyatli o'tdi va mijoz tasdig'i bilan yopildi.
                    </div>
                  </div>
                ) : (issue.stage === 'STAGE_3_DISPATCHED' || issue.stage === 'STAGE_2_RESOLVED') ? (
                  <div className="space-y-4">
                    {/* Confirmation form */}
                    <form onSubmit={handleCloseSubmit} className="space-y-3">
                      <div className="flex items-center gap-3">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Mijoz bahosi:
                        </label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setCustomerRating(s)}
                              className="focus:outline-none cursor-pointer"
                            >
                              <Star
                                className={`w-5 h-5 ${
                                  s <= customerRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Mijoz tasdig'i va fikri
                        </label>
                        <input
                          type="text"
                          required
                          value={customerFeedback}
                          onChange={(e) => setCustomerFeedback(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                        >
                          {loading ? 'Yopilmoqda...' : 'Mijoz tasdiqladi & Rasman yopish'}
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowReopenForm(!showReopenForm)}
                          className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800 rounded-lg text-xs font-bold cursor-pointer"
                        >
                          Mijoz qanoatlanmadi (Qaytarish)
                        </button>
                      </div>
                    </form>

                    {/* Reopen form */}
                    {showReopenForm && (
                      <form onSubmit={handleReopenSubmit} className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg space-y-2">
                        <span className="font-bold text-xs text-red-700 dark:text-red-300">
                          Mijoz e'tirozi / Muammo bartaraf bo'lmaganligi sababi:
                        </span>
                        <textarea
                          required
                          rows={2}
                          value={reopenReason}
                          onChange={(e) => setReopenReason(e.target.value)}
                          placeholder="Mijoz nima dedi? Nega yechim ishlamadi?..."
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-red-300 dark:border-red-700 rounded-lg text-xs text-slate-900 dark:text-white"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setShowReopenForm(false)}
                            className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 rounded text-xs"
                          >
                            Bekor qilish
                          </button>
                          <button
                            type="submit"
                            disabled={loading || !reopenReason.trim()}
                            className="px-4 py-1.5 bg-red-600 text-white rounded text-xs font-bold"
                          >
                            Mutaxassisga qaytarish (Yangi sikl)
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Avvalgi bosqichlar tugallanishi kutilmoqda.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ISH SIKLLARI TAHLILI */}
          {activeTab === 'cycles' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white font-mono uppercase">
                  Murojaatning barcha ish sikllari ({issue.cycles?.length || 1} ta)
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Qaytarilishlar: {issue.reopenCount} marta
                </span>
              </div>

              {issue.cycles?.map((c) => (
                <div key={c.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white">
                      Ish Sikli #{c.cycleNumber}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      Biriktirildi: {new Date(c.assignedAt).toLocaleString('uz-UZ')}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 dark:text-slate-300 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                    <div>
                      <span className="text-slate-400 block">Mutaxassis:</span>
                      <span className="font-bold">{c.specialistName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Kutish vaqti:</span>
                      <span className="font-mono font-bold text-amber-600">{formatSec(c.waitingSeconds)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Faol ishlangan vaqt:</span>
                      <span className="font-mono font-bold text-emerald-600">{formatSec(c.activeSeconds)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Jami sikl vaqti:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{formatSec(c.totalSeconds)}</span>
                    </div>
                  </div>

                  {c.solutionNote && (
                    <div className="text-xs bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-800 mt-2">
                      <span className="font-bold text-slate-800 dark:text-white">Taqdim etilgan yechim:</span> {c.solutionNote}
                    </div>
                  )}

                  {c.returnReason && (
                    <div className="text-xs bg-red-50 dark:bg-red-950/40 p-2.5 rounded border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 mt-2">
                      <span className="font-bold">Mijozning qaytarish sababi:</span> {c.returnReason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: IZOHLAR VA TARIX */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              <div className="space-y-3">
                {issue.comments?.map((com) => (
                  <div key={com.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {com.authorName} ({com.authorRole})
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {new Date(com.createdAt).toLocaleString('uz-UZ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {com.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Add Comment */}
              <form onSubmit={handleCommentSubmit} className="pt-2 flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Izoh yozing..."
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={loading || !newComment.trim()}
                  className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-bold"
                >
                  Yuborish
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-bold cursor-pointer"
          >
            Yopish
          </button>
        </div>
      </div>

      {/* PAUSE MODAL */}
      {showPauseModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md shadow-2xl">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">
              Kutish rejimiga o'tkazish sababi
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Kutish vaqtida faol taymer to'xtatiladi va mutaxassisning KPI yechish tezligiga salbiy ta'sir qilmaydi.
            </p>
            <form onSubmit={handlePause} className="space-y-3">
              <textarea
                required
                rows={3}
                value={pauseReason}
                onChange={(e) => setPauseReason(e.target.value)}
                placeholder="Masalan: Mijozdan log fayli kutilmoqda / Tashqi servis javob bermayapti..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPauseModal(false)}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-xs rounded font-bold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 bg-amber-500 text-white text-xs font-bold rounded"
                >
                  Kutishga qo'yish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
