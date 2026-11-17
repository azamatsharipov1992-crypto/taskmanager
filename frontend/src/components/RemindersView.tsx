import React, { useState } from 'react';
import { ReminderLog, TelegramRecipient } from '../types';
import { Language } from '../translations';
import { 
  BellRing, 
  Send, 
  RefreshCw, 
  AlertTriangle, 
  Clock, 
  Bot, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  UserCheck, 
  Sparkles,
  ShieldCheck,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

interface RemindersViewProps {
  reminders: ReminderLog[];
  recipients: TelegramRecipient[];
  lang: Language;
  onTriggerCheck: () => Promise<void>;
  onAddRecipient: (data: { name: string; role: string; chatId: string; username: string }) => Promise<void>;
  onRemoveRecipient: (id: string) => Promise<void>;
  onToggleRecipient: (id: string) => Promise<void>;
  onTestRecipient: (chatId: string, name: string) => Promise<void>;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  reminders,
  recipients,
  lang,
  onTriggerCheck,
  onAddRecipient,
  onRemoveRecipient,
  onToggleRecipient,
  onTestRecipient
}) => {
  const [triggerLoading, setTriggerLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Dasturchi');
  const [newChatId, setNewChatId] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [savingRecipient, setSavingRecipient] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);

  const handleTrigger = async () => {
    setTriggerLoading(true);
    try {
      await onTriggerCheck();
    } finally {
      setTriggerLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newChatId.trim()) return;
    setSavingRecipient(true);
    try {
      await onAddRecipient({
        name: newName,
        role: newRole,
        chatId: newChatId,
        username: newUsername
      });
      setShowAddModal(false);
      setNewName('');
      setNewChatId('');
      setNewUsername('');
    } finally {
      setSavingRecipient(false);
    }
  };

  const handleTest = async (recip: TelegramRecipient) => {
    setTestingId(recip.id);
    try {
      await onTestRecipient(recip.chatId, recip.name);
    } finally {
      setTestingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xs px-2.5 py-1 rounded bg-himint-light dark:bg-himint/20 text-himint-dark dark:text-himint-neon border border-himint/30 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-himint animate-pulse" />
              TELEGRAM BOT: ULANGAN VA FAOL
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
              FAOL AKKAUNTLAR: {recipients.filter(r => r.isActive).length} TA
            </span>
          </div>

          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Bot className="w-6 h-6 text-hicyan" />
            <span>TELEGRAM BOT & REAL-TIME REMINDER SCHEDULER</span>
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-sans mt-1 max-w-2xl">
            Vazifalar kechikganda va mijoz tasdig'i kutilganda avtomatik Telegram eslatmalari tizimga ulangan barcha administrator va mas'ul shaxslar akkauntlariga yetkaziladi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-mono font-bold rounded-xl shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 text-hicyan" />
            <span>+ AKKAUNT QO'SHISH</span>
          </button>
          <button
            onClick={handleTrigger}
            disabled={triggerLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-hicyan hover:bg-hicyan-dark disabled:opacity-50 text-white text-xs font-mono font-bold rounded-xl shadow-sm transition-all flex-shrink-0 active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${triggerLoading ? 'animate-spin' : ''}`} />
            <span>ESLATMALARNI TEKSHIRISH</span>
          </button>
        </div>
      </div>

      {/* NEW FIELD SECTION: Telegram Notification Recipients Management */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 font-mono">
              <Send className="w-5 h-5 text-hicyan" />
              <span>// TELEGRAM BILDIRISHNOMA QABUL QILUVCHILAR</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
              Ushbu ro'yxatdagi barcha faol Telegram akkauntlar tizimdan zudlik bilan eslatmalar va ogohlantirishlarni oladi.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-hicyan-light dark:bg-hicyan/20 text-hicyan-dark dark:text-hicyan-neon border border-hicyan/30 hover:border-hicyan rounded-lg text-xs font-mono font-bold transition-colors w-fit"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>YANGI POLYA (AKKAUNT) QO'SHISH</span>
          </button>
        </div>

        {/* Recipients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {recipients.map((recip) => (
            <div
              key={recip.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                recip.isActive
                  ? 'bg-slate-50/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                  : 'bg-slate-100/50 dark:bg-slate-900/40 border-dashed border-slate-300 dark:border-slate-800 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{recip.name}</span>
                    </h4>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      Lavozim: <strong className="text-slate-700 dark:text-slate-300">{recip.role}</strong>
                    </span>
                  </div>

                  <button
                    onClick={() => onToggleRecipient(recip.id)}
                    title={recip.isActive ? "O'chirish (Nofaol qilish)" : "Yoqish"}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {recip.isActive ? (
                      <span className="px-2 py-0.5 rounded bg-himint-light dark:bg-himint/20 text-himint-dark dark:text-himint-neon border border-himint/30 text-[11px] font-mono font-bold">
                        FAOL
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-500 text-[11px] font-mono font-bold">
                        TO'XTATILGAN
                      </span>
                    )}
                  </button>
                </div>

                <div className="mt-3 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 font-mono text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="text-slate-400 dark:text-slate-500">CHAT ID:</span>
                    <strong className="text-hicyan">{recip.chatId}</strong>
                  </div>
                  {recip.username && (
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                      <span className="text-slate-400 dark:text-slate-500">USERNAME:</span>
                      <span className="text-slate-600 dark:text-slate-400">@{recip.username}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 font-mono text-xs">
                <button
                  onClick={() => handleTest(recip)}
                  disabled={testingId === recip.id || !recip.isActive}
                  className="flex items-center gap-1 text-hicyan hover:underline font-bold disabled:opacity-40"
                >
                  <Send className={`w-3 h-3 ${testingId === recip.id ? 'animate-bounce' : ''}`} />
                  <span>{testingId === recip.id ? 'Yuborilmoqda...' : 'TEST XABAR'}</span>
                </button>

                {recip.id !== 'recip_admin_main' && (
                  <button
                    onClick={() => onRemoveRecipient(recip.id)}
                    className="text-hiamber hover:text-red-600 p-1 transition-colors"
                    title="Akkauntni o'chirish"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3 Core Rules Card (3 Light Accent Colors) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
        {/* Rule 1 */}
        <div className="p-4 bg-hiamber-light/50 dark:bg-hiamber/10 border border-hiamber/40 rounded-xl space-y-1.5 transition-colors">
          <div className="flex items-center gap-1.5 text-hiamber-dark dark:text-hiamber-neon font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-hiamber" />
            <span>01 // STAGE 02: YECHIM YETKAZILMAGAN</span>
          </div>
          <p className="text-slate-700 dark:text-slate-300 font-sans text-xs leading-relaxed">
            Dasturchi yechim berganidan so'ng 2 soat ichida mijozga yuborilmasa, Telegram orqali barcha faol akkauntlarga eslatma jo'natiladi.
          </p>
        </div>

        {/* Rule 2 */}
        <div className="p-4 bg-hiamber-light/30 dark:bg-hiamber/5 border border-hiamber/30 rounded-xl space-y-1.5 transition-colors">
          <div className="flex items-center gap-1.5 text-hiamber-dark dark:text-hiamber-neon font-bold text-sm">
            <Clock className="w-4 h-4 text-hiamber" />
            <span>02 // STAGE 03: MIJOZ TASDIG'I</span>
          </div>
          <p className="text-slate-700 dark:text-slate-300 font-sans text-xs leading-relaxed">
            Yechim mijozga yetkazilgach, har 24 soatda mijoz tasdiqlaguncha barcha eslatma qabul qiluvchilarga qayta xabar beriladi.
          </p>
        </div>

        {/* Rule 3 */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1.5 transition-colors">
          <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold text-sm">
            <BellRing className="w-4 h-4 text-hicyan" />
            <span>03 // MUDDAT KECHIKISHI (OVERDUE)</span>
          </div>
          <p className="text-slate-700 dark:text-slate-300 font-sans text-xs leading-relaxed">
            Belgilangan muddat (deadline) o'tib ketganda mas'ul shaxs va barcha administratorlarga har 4 soatda signal yuboriladi.
          </p>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 font-mono transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
          <span className="font-bold text-slate-900 dark:text-white text-sm">// TELEGRAM DISPATCH LOGS</span>
          <span className="text-slate-500 dark:text-slate-400 font-bold">JAMI: {reminders.length} XABAR</span>
        </div>

        {reminders.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm font-mono">
            // ESLATMALAR JURNALI BO'SH //
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors space-y-2 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-hicyan bg-hicyan-light dark:bg-hicyan/20 px-2.5 py-0.5 rounded border border-hicyan/30">
                      [{log.issueCode}]
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 font-sans text-xs">
                      Qabul qiluvchi: <strong className="text-slate-900 dark:text-white font-mono">{log.targetRecipient}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(log.sentAt).toLocaleString()}</span>
                    <span className="px-2 py-0.5 rounded bg-himint-light dark:bg-himint/20 text-himint-dark dark:text-himint-neon border border-himint/30 font-bold text-[10px]">
                      DELIVERED
                    </span>
                  </div>
                </div>

                <div 
                  className="p-3.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono text-xs whitespace-pre-wrap leading-relaxed shadow-inner"
                  dangerouslySetInnerHTML={{ __html: log.message }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Recipient Modal (Yangi Polya) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-mono flex items-center gap-2">
              <Bot className="w-5 h-5 text-hicyan" />
              <span>// YANGI TELEGRAM AKKAUNT QO'SHISH</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ushbu akkaunt egasi tizimdan real-vaqtda bildirishnoma va eslatmalarni qabul qiladi.
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Xodim ismi *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Masalan: Sardor Aliyev"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-hicyan text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Lavozim / Mas'uliyat</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-hicyan text-xs font-mono"
                >
                  <option value="Administrator">Administrator</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Bosh Dasturchi">Bosh Dasturchi</option>
                  <option value="Navbatchi Texnik">Navbatchi Texnik</option>
                  <option value="Mijozlar Bilan Aloqa">Mijozlar Bilan Aloqa</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Telegram Chat ID *</label>
                <input
                  type="text"
                  required
                  value={newChatId}
                  onChange={(e) => setNewChatId(e.target.value)}
                  placeholder="Masalan: 53663779 yoki 12345678"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-hicyan text-xs font-mono"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Foydalanuvchi Telegram'da <code>@userinfobot</code> orqali o'z Chat ID sini bilib olishi mumkin.
                </span>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Telegram Username</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="masalan: sardor_dev (ixtiyoriy)"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-hicyan text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 font-mono">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold"
                >
                  BEKOR QILISH
                </button>
                <button
                  type="submit"
                  disabled={savingRecipient}
                  className="px-4 py-2 bg-hicyan hover:bg-hicyan-dark disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-sm"
                >
                  {savingRecipient ? 'SAQLANMOQDA...' : 'SAQLASH & ULANISH'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
