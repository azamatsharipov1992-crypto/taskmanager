import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Language, translations } from '../translations';
import { 
  UserCheck, 
  Search, 
  Plus, 
  Phone, 
  Send, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Clock, 
  Award, 
  ExternalLink, 
  Copy, 
  Check, 
  UserPlus, 
  X,
  AlertCircle,
  Pencil,
  Trash2
} from 'lucide-react';

interface EmployeesViewProps {
  users: User[];
  onRefresh: () => void;
  lang: Language;
}

export const EmployeesView: React.FC<EmployeesViewProps> = ({ users, onRefresh, lang }) => {
  const t = translations[lang];
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // New Employee Form State
  const [newFio, setNewFio] = useState('');
  const [newPhone, setNewPhone] = useState('+998 ');
  const [newRole, setNewRole] = useState<UserRole>('MUTAXASSIS');
  const [newLogin, setNewLogin] = useState('');
  const [newPassword, setNewPassword] = useState('123456');
  const [newTgUsername, setNewTgUsername] = useState('');
  const [newTgChatId, setNewTgChatId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Edit Employee Form State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFio, setEditFio] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('MUTAXASSIS');
  const [editLogin, setEditLogin] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editTgUsername, setEditTgUsername] = useState('');
  const [editTgChatId, setEditTgChatId] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editError, setEditError] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // Link telegram modal state
  const [linkingUser, setLinkingUser] = useState<User | null>(null);
  const [manualChatId, setManualChatId] = useState('');

  // Filtered employees
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search) ||
      u.login.toLowerCase().includes(search.toLowerCase()) ||
      (u.telegramUsername && u.telegramUsername.toLowerCase().includes(search.toLowerCase()));

    const matchRole = roleFilter === 'ALL' || u.role === roleFilter || (roleFilter === 'MUTAXASSIS' && (u.role as string) === 'DEVELOPER');
    const matchStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' ? u.isActive : !u.isActive);

    return matchSearch && matchRole && matchStatus;
  });

  const totalEmployees = users.length;
  const activeEmployees = users.filter((u) => u.isActive).length;
  const telegramConnected = users.filter((u) => !!u.telegramChatId).length;
  const avgKpi = totalEmployees > 0 ? '100%' : '0%';

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      const res = await fetch(`/api/employees/${userId}/toggle`, { method: 'PATCH' });
      if (res.ok) {
        onRefresh();
        if (selectedProfile && selectedProfile.id === userId) {
          setSelectedProfile((prev: any) => ({ ...prev, isActive: !prev.isActive }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenProfile = async (user: User) => {
    try {
      const res = await fetch(`/api/employees/${user.id}`);
      if (res.ok) {
        const fullData = await res.json();
        setSelectedProfile(fullData);
      } else {
        setSelectedProfile(user);
      }
    } catch (err) {
      setSelectedProfile(user);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setEditFio(user.name);
    setEditPhone(user.phone);
    setEditRole((user.role === 'DEVELOPER' ? 'MUTAXASSIS' : user.role) as UserRole);
    setEditLogin(user.login);
    setEditPassword(user.password || '');
    setEditTgUsername(user.telegramUsername ? `@${user.telegramUsername}` : '');
    setEditTgChatId(user.telegramChatId || '');
    setEditIsActive(user.isActive);
    setEditError(null);
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditError(null);

    if (!editFio.trim() || !editPhone.trim() || !editLogin.trim()) {
      setEditError('FIO, telefon raqami va login to\'ldirilishi shart!');
      return;
    }

    setSavingEdit(true);
    try {
      const res = await fetch(`/api/employees/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editFio.trim(),
          phone: editPhone.trim(),
          role: editRole,
          login: editLogin.trim().toLowerCase(),
          password: editPassword,
          telegramUsername: editTgUsername.replace('@', '').trim(),
          telegramChatId: editTgChatId.trim(),
          isActive: editIsActive
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error || 'Tahrirlashda xatolik yuz berdi!');
        setSavingEdit(false);
        return;
      }

      setEditingUser(null);
      onRefresh();
    } catch (err) {
      setEditError('Server bilan aloqa uzildi!');
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete employee
  const handleDeleteUser = async (user: User) => {
    const confirm = window.confirm(`Haqiqatan ham "${user.name}" xodimini tizimdan o'chirmoqchimisiz?`);
    if (!confirm) return;

    try {
      const res = await fetch(`/api/employees/${user.id}`, { method: 'DELETE' });
      if (res.ok) {
        if (selectedProfile && selectedProfile.id === user.id) {
          setSelectedProfile(null);
        }
        onRefresh();
      } else {
        const d = await res.json();
        alert(d.error || 'Xodimni o\'chirishda xatolik!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!newFio.trim() || !newPhone.trim() || !newLogin.trim()) {
      setFormError('FIO, telefon raqami va login to\'ldirilishi shart!');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFio.trim(),
          phone: newPhone.trim(),
          role: newRole,
          login: newLogin.trim().toLowerCase(),
          password: newPassword,
          telegramUsername: newTgUsername.trim(),
          telegramChatId: newTgChatId.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Xatolik yuz berdi!');
        setSubmitting(false);
        return;
      }

      setNewFio('');
      setNewPhone('+998 ');
      setNewLogin('');
      setNewTgUsername('');
      setNewTgChatId('');
      setIsAddModalOpen(false);
      onRefresh();
    } catch (err) {
      setFormError('Server bilan aloqa uzildi!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleManualLinkTelegram = async () => {
    if (!linkingUser || !manualChatId.trim()) return;
    try {
      const res = await fetch(`/api/employees/${linkingUser.id}/link-telegram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: manualChatId.trim() })
      });
      if (res.ok) {
        setLinkingUser(null);
        setManualChatId('');
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 dark:border-purple-800">Superadmin</span>;
      case 'MANAGER':
        return <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800">Menejer</span>;
      case 'OPERATOR':
        return <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">Operator</span>;
      case 'MUTAXASSIS':
      case 'DEVELOPER':
      default:
        return <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">Mutaxassis</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Jami Xodimlar</span>
            <div className="w-8 h-8 rounded-lg bg-hicyan-light dark:bg-hicyan/10 text-hicyan flex items-center justify-center font-bold">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono mt-2 text-slate-900 dark:text-white">
            {totalEmployees}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">Barcha ro'yxatga olingan xodimlar</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-himint-dark dark:text-himint uppercase tracking-wider">Faol Xodimlar</span>
            <div className="w-8 h-8 rounded-lg bg-himint-light dark:bg-himint/10 text-himint flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono mt-2 text-himint-dark dark:text-himint-neon">
            {activeEmployees}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">Hozirda topshiriq olishi mumkin</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Telegram Bog'langan</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center font-bold">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono mt-2 text-blue-600 dark:text-blue-400">
            {telegramConnected} <span className="text-base text-slate-400 font-normal">/ {totalEmployees}</span>
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">Avtomatik bildirishnoma oluvchilar</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-hiamber-dark dark:text-hiamber uppercase tracking-wider">O'rtacha KPI</span>
            <div className="w-8 h-8 rounded-lg bg-hiamber-light dark:bg-hiamber/10 text-hiamber flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono mt-2 text-hiamber-dark dark:text-hiamber-neon">
            {avgKpi}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">Jamoa umumiy samaradorligi</div>
        </div>
      </div>

      {/* Action Bar: Search, Filters & Add Employee */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="FIO, telefon yoki login bo'yicha qidirish..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-hicyan"
          />
        </div>

        {/* Filters & Add Button */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">Barcha Rollar</option>
            <option value="SUPER_ADMIN">Superadmin</option>
            <option value="MANAGER">Menejer</option>
            <option value="OPERATOR">Operator</option>
            <option value="MUTAXASSIS">Mutaxassis</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">Barcha Holatlar</option>
            <option value="ACTIVE">Faqat Faol</option>
            <option value="INACTIVE">Nofaol</option>
          </select>

          {/* Add Employee Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-himint hover:bg-himint-dark active:scale-95 text-white rounded-lg text-xs font-bold shadow-md shadow-himint/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Xodim qo'shish</span>
          </button>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">Xodim FIO & Login</th>
                <th className="px-4 py-3.5">Telefon</th>
                <th className="px-4 py-3.5">Rol</th>
                <th className="px-4 py-3.5">Telegram Bog'lanish</th>
                <th className="px-4 py-3.5">Holati</th>
                <th className="px-5 py-3.5 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400">
                    <UserCheck className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                    <div className="font-bold text-slate-600 dark:text-slate-400 font-mono text-sm">
                      // HOZIRCHA HECH QANDAY XODIM KIRITILMAGAN //
                    </div>
                    <p className="text-xs text-slate-400 mt-1 mb-3">
                      Tizimdan foydalanish uchun yuqoridagi «Xodim qo'shish» tugmasi orqali jamoangiz xodimlarini kiriting.
                    </p>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-himint hover:bg-himint-dark text-white rounded-lg text-xs font-bold"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Yangi xodim qo'shish</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    {/* FIO & Login */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-sm text-slate-700 dark:text-slate-300">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{user.name}</span>
                            {!user.isActive && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 font-mono">
                                Nofaol
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-mono text-slate-400">
                            @{user.login}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {user.phone}
                    </td>

                    {/* Role */}
                    <td className="px-4 py-4">
                      {getRoleBadge(user.role)}
                    </td>

                    {/* Telegram Connection */}
                    <td className="px-4 py-4">
                      {user.telegramChatId ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs font-mono text-blue-700 dark:text-blue-300 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                          <span>ID: {user.telegramChatId}</span>
                          {user.telegramUsername && (
                            <span className="text-slate-400">(@{user.telegramUsername})</span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 font-mono">
                            Bog'lanmagan
                          </span>
                          <button
                            onClick={() => setLinkingUser(user)}
                            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold underline cursor-pointer"
                          >
                            Bog'lash
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Active Status Toggle */}
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          user.isActive
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        <span>{user.isActive ? 'Faol' : 'Faol emas'}</span>
                      </button>
                    </td>

                    {/* Actions: Edit, Profile, Delete */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          title="Tahrirlash"
                          className="p-1.5 bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/50 text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-300 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenProfile(user)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                        >
                          Profil & KPI
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          title="O'chirish"
                          className="p-1.5 bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-950/50 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-300 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: ADD EMPLOYEE                                    */}
      {/* ======================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-himint-light dark:bg-himint/10 text-himint flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Yangi xodim qo'shish</h3>
                  <p className="text-xs text-slate-500">Tizimga yangi mutaxassis, operator yoki menejer biriktirish</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Familiya, Ism va Sharif (FIO) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newFio}
                  onChange={(e) => setNewFio(e.target.value)}
                  placeholder="Masalan: Jamshid Karimov"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:border-himint"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Telefon raqami (Takrorlanmas) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+998 90 123-45-67"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-himint"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Tizimdagi Roli <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-himint"
                  >
                    <option value="MUTAXASSIS">Mutaxassis (Yechim ishlab chiquvchi)</option>
                    <option value="OPERATOR">Operator (Murojaat qabul qiluvchi)</option>
                    <option value="MANAGER">Menejer / PM</option>
                    <option value="SUPER_ADMIN">Superadmin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Tizim logini <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newLogin}
                    onChange={(e) => setNewLogin(e.target.value)}
                    placeholder="masalan: jamshid_spec"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-himint"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Boshlang'ich Parol
                  </label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-himint"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Telegram Username
                  </label>
                  <input
                    type="text"
                    value={newTgUsername}
                    onChange={(e) => setNewTgUsername(e.target.value)}
                    placeholder="@username"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:border-himint"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Telegram Chat ID (Ixtiyoriy)
                  </label>
                  <input
                    type="text"
                    value={newTgChatId}
                    onChange={(e) => setNewTgChatId(e.target.value)}
                    placeholder="53663779"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-himint"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-himint hover:bg-himint-dark active:scale-95 text-white rounded-lg text-xs font-bold shadow-md shadow-himint/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Qo\'shilmoqda...' : 'Xodimni saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EDIT EMPLOYEE (TAHRIRLASH)                      */}
      {/* ======================================================== */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Xodimni tahrirlash</h3>
                  <p className="text-xs text-slate-500">{editingUser.name} ma'lumotlarini yangilash</p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              {editError && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Familiya, Ism va Sharif (FIO) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editFio}
                  onChange={(e) => setEditFio(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Telefon raqami <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Tizimdagi Roli <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="MUTAXASSIS">Mutaxassis (Yechim ishlab chiquvchi)</option>
                    <option value="OPERATOR">Operator (Murojaat qabul qiluvchi)</option>
                    <option value="MANAGER">Menejer / PM</option>
                    <option value="SUPER_ADMIN">Superadmin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Tizim logini <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editLogin}
                    onChange={(e) => setEditLogin(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Parol (O'zgartirish uchun)
                  </label>
                  <input
                    type="text"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Eski parolni qoldirish..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Telegram Username
                  </label>
                  <input
                    type="text"
                    value={editTgUsername}
                    onChange={(e) => setEditTgUsername(e.target.value)}
                    placeholder="@username"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Telegram Chat ID
                  </label>
                  <input
                    type="text"
                    value={editTgChatId}
                    onChange={(e) => setEditTgChatId(e.target.value)}
                    placeholder="53663779"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Status Toggle */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Xodim faoliyati</span>
                  <span className="text-[11px] text-slate-500">Faol emas xodimga topshiriq biriktirib bo'lmaydi</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditIsActive(!editIsActive)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    editIsActive
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                  }`}
                >
                  {editIsActive ? 'Faol' : 'Faol emas'}
                </button>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {savingEdit ? 'Saqlanmoqda...' : 'O\'zgarishlarni saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: EMPLOYEE PROFILE & KPI                          */}
      {/* ======================================================== */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-black text-xl text-slate-800 dark:text-white">
                  {selectedProfile.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">{selectedProfile.name}</h3>
                    {getRoleBadge(selectedProfile.role)}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    Login: @{selectedProfile.login} | Tel: {selectedProfile.phone}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedProfile(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                      Telegram Xabarnomalar Holati
                    </span>
                  </div>
                  {selectedProfile.telegramChatId ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      FAOL VA BOG'LANGAN
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      BOG'LANMAGAN
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">Telegram Chat ID:</span>
                    <div className="font-mono font-bold text-slate-800 dark:text-white mt-0.5">
                      {selectedProfile.telegramChatId || 'Kiritilmagan'}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Telegram Havola Kodi:</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <code className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded font-mono font-bold">
                        {selectedProfile.telegramLinkCode || `TC-${selectedProfile.id.toUpperCase()}`}
                      </code>
                      <button
                        onClick={() => handleCopy(`/start link_${selectedProfile.telegramLinkCode || selectedProfile.id}`)}
                        className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-bold flex items-center gap-1"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Nusxalash</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-wider mb-3">
                  Faoliyat va Murojaatlar Ko'rsatkichlari
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="text-xs text-slate-500">Biriktirilgan</span>
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
                      {selectedProfile.stats?.assignedCount ?? 0}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="text-xs text-slate-500">Jarayonda</span>
                    <div className="text-2xl font-black font-mono text-hicyan-dark dark:text-hicyan-neon mt-1">
                      {selectedProfile.stats?.inProgressCount ?? 0}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="text-xs text-slate-500">Yechim topshirilgan</span>
                    <div className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400 mt-1">
                      {selectedProfile.stats?.solutionReadyCount ?? 0}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="text-xs text-slate-500">Qaytarilganlar</span>
                    <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400 mt-1">
                      {selectedProfile.stats?.reopenedCount ?? 0}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="text-xs text-slate-500">Muvaffaqiyatli yopilgan</span>
                    <div className="text-2xl font-black font-mono text-himint-dark dark:text-himint-neon mt-1">
                      {(selectedProfile.stats?.closedSpecialistCount ?? 0) + (selectedProfile.stats?.closedOperatorCount ?? 0)}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="text-xs text-slate-500">KPI Samaradorlik</span>
                    <div className="text-2xl font-black font-mono text-purple-600 dark:text-purple-400 mt-1">
                      100%
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">Tizimga kirish holati</div>
                  <div className="text-xs text-slate-500">
                    {selectedProfile.isActive
                      ? 'Xodim hozirda faol. Murojaatlarni qabul qila oladi.'
                      : 'Xodim vaqtinchalik muzlatilgan. Yangi vazifa biriktirilmaydi.'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedProfile(null);
                      handleOpenEdit(selectedProfile);
                    }}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
                  >
                    Tahrirlash
                  </button>
                  <button
                    onClick={() => handleToggleStatus(selectedProfile.id)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedProfile.isActive
                        ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                    }`}
                  >
                    {selectedProfile.isActive ? 'Nofaol qilish' : 'Qayta faollashtirish'}
                  </button>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
              <button
                onClick={() => setSelectedProfile(null)}
                className="px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-bold cursor-pointer"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: MANUAL LINK TELEGRAM                            */}
      {/* ======================================================== */}
      {linkingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md shadow-2xl p-6">
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
              {linkingUser.name} — Telegram bog'lash
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Xodimning Telegram Chat ID sini qo'lda kiritish yoki maxsus kod orqali bog'lash:
            </p>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-200 dark:border-blue-900 mb-4 text-xs font-mono">
              <div className="text-blue-800 dark:text-blue-300 font-bold mb-1">Bot orqali bog'lanish:</div>
              <div className="text-slate-600 dark:text-slate-400">
                Telegram botga kirib yozing: <code>/start link_{linkingUser.telegramLinkCode || linkingUser.id}</code>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                Telegram Chat ID (qo'lda kiritish)
              </label>
              <input
                type="text"
                value={manualChatId}
                onChange={(e) => setManualChatId(e.target.value)}
                placeholder="Masalan: 53663779"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setLinkingUser(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleManualLinkTelegram}
                disabled={!manualChatId.trim()}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-600/20 disabled:opacity-50"
              >
                Bog'lashni saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
