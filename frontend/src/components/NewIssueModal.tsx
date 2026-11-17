import React, { useState } from 'react';
import { Customer, Product, User } from '../types';
import { Language } from '../translations';
import { X, Plus, Cpu, ShieldCheck } from 'lucide-react';

interface NewIssueModalProps {
  customers: Customer[];
  products: Product[];
  users: User[];
  lang: Language;
  onClose: () => void;
  onCreateIssue: (issueData: any) => Promise<void>;
}

export const NewIssueModal: React.FC<NewIssueModalProps> = ({
  customers,
  products,
  users,
  lang,
  onClose,
  onCreateIssue
}) => {
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [productId, setProductId] = useState(products[0]?.id || '');
  const [moduleId, setModuleId] = useState(products[0]?.modules[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  
  const specialists = users.filter(u => u.role === 'MUTAXASSIS' || (u.role as string) === 'DEVELOPER' || u.role === 'SUPER_ADMIN');
  const [assignedSpecialistId, setAssignedSpecialistId] = useState(specialists[0]?.id || '');

  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [loading, setLoading] = useState(false);

  const handleProductChange = (prodId: string) => {
    setProductId(prodId);
    const prod = products.find(p => p.id === prodId);
    if (prod && prod.modules.length > 0) {
      setModuleId(prod.modules[0].id);
    }
  };

  const currentProduct = products.find(p => p.id === productId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !customerId || !productId) return;

    setLoading(true);
    try {
      await onCreateIssue({
        customerId,
        productId,
        moduleId: moduleId || '',
        title: title.trim(),
        description: description.trim(),
        priority,
        assigned_specialist_id: assignedSpecialistId || undefined,
        dueDate: new Date(dueDate).toISOString()
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 font-sans animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 font-mono">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-hicyan-light dark:bg-hicyan/20 text-hicyan flex items-center justify-center border border-hicyan/30">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">
                // YANGI MUROJAATNI RO'YXATGA OLISH
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Operator tomonidan qabul qilinadi va mutaxassisga biriktiriladi
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Customer */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Mijoz (Tashkilot / Korxona) <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-hicyan font-medium"
            >
              {customers.length === 0 ? (
                <option value="">-- Hozircha mijoz yo'q («Mijozlar» bo'limida qo'shing) --</option>
              ) : (
                <>
                  <option value="">-- Mijozni tanlang --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName} ({c.contactPerson} - {c.phone})
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          {/* Product & Module */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Dastur / Mahsulot <span className="text-red-500">*</span>
              </label>
              <select
                value={productId}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-hicyan font-medium"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Modul / Funksional qism
              </label>
              <select
                value={moduleId}
                onChange={(e) => setModuleId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-hicyan font-medium"
              >
                {currentProduct?.modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Muammo / Murojaat qisqa sarlavhasi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masalan: Kassa chek chiqarishda fiskal timeout 408 bermoqda"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-hicyan font-medium"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Batafsil tavsif va qaydlar <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Xatolik qanday yuz berdi, qaysi qadamlar bajarildi..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-hicyan font-medium"
            />
          </div>

          {/* Priority & Responsible Specialist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Muhimlilik darajasi
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold"
              >
                <option value="LOW">Past (Rejali yangilanish)</option>
                <option value="MEDIUM">O'rta (Oddiy masala)</option>
                <option value="HIGH">Yuqori (Tezkor yechim zarur)</option>
                <option value="CRITICAL">Kritik (Biznes to'xtab qolgan!)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Mas'ul Mutaxassis (Dasturchi)
              </label>
              <select
                value={assignedSpecialistId}
                onChange={(e) => setAssignedSpecialistId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
              >
                <option value="">Biriktirmaslik (Keyinroq)</option>
                {specialists.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.phone})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due date */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Bajarilish muddati (Deadline)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-bold"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-hicyan hover:bg-hicyan-dark active:scale-95 text-white rounded-lg font-bold shadow-md shadow-hicyan/20 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Yaratilmoqda...' : 'Murojaatni ro\'yxatga olish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
