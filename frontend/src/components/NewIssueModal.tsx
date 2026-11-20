import React, { useState, useRef, useEffect } from 'react';
import { Customer, Product, Region, User } from '../types';
import { Language } from '../translations';
import {
  X,
  Plus,
  Building,
  MapPin,
  Phone,
  Paperclip,
  Image as ImageIcon,
  Video,
  FileText,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  Send,
  UploadCloud,
  Check
} from 'lucide-react';

interface NewIssueModalProps {
  customers: Customer[];
  products: Product[];
  users: User[];
  lang: Language;
  onClose: () => void;
  onCreateIssue: (issueData: any) => Promise<void>;
  onQuickAddCustomer?: (customerData: any) => Promise<Customer | any>;
}

interface StagedAttachment {
  id: string;
  originalName: string;
  mimeType: string;
  base64: string;
  sizeFormatted: string;
  fileCategory: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'OTHER';
  previewUrl?: string;
}

export const NewIssueModal: React.FC<NewIssueModalProps> = ({
  customers,
  products,
  users,
  lang,
  onClose,
  onCreateIssue,
  onQuickAddCustomer
}) => {
  // Customer selection state
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(customers[0] || null);

  // Quick Customer Create inline toggle
  const [showQuickCustomerCreate, setShowQuickCustomerCreate] = useState(false);
  const [quickInn, setQuickInn] = useState('');
  const [quickName, setQuickName] = useState('');
  const [quickPhone, setQuickPhone] = useState('');
  const [quickPerson, setQuickPerson] = useState('');
  const [quickRegionId, setQuickRegionId] = useState('reg_tashkent_city');
  const [quickCreating, setQuickCreating] = useState(false);

  // Regions for quick create
  const [regions, setRegions] = useState<Region[]>([]);

  // Snapshots
  const [contactPhoneSnapshot, setContactPhoneSnapshot] = useState(selectedCustomer?.primaryPhone || '');
  const [contactPersonSnapshot, setContactPersonSnapshot] = useState(selectedCustomer?.contactPerson || '');

  // Issue details
  const [productId, setProductId] = useState(products[0]?.id || '');
  const [moduleId, setModuleId] = useState(products[0]?.modules[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');

  // Specialist
  const specialists = users.filter(
    u => u.role === 'MUTAXASSIS' || (u.role as string) === 'DEVELOPER' || u.role === 'SUPER_ADMIN'
  );
  const [assignedSpecialistId, setAssignedSpecialistId] = useState(specialists[0]?.id || '');

  // Due Date
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });

  // Attachments
  const [attachments, setAttachments] = useState<StagedAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [loading, setLoading] = useState(false);

  // Load regions
  useEffect(() => {
    fetch('http://localhost:4000/api/regions')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setRegions(data);
      })
      .catch(() => {});
  }, []);

  // Sync snapshot when customer changes
  useEffect(() => {
    if (selectedCustomer) {
      setContactPhoneSnapshot(selectedCustomer.primaryPhone || '');
      setContactPersonSnapshot(selectedCustomer.contactPerson || '');
      if (selectedCustomer.products && selectedCustomer.products.length > 0) {
        const firstCustProd = selectedCustomer.products[0].productId;
        setProductId(firstCustProd);
        const prodObj = products.find(p => p.id === firstCustProd);
        if (prodObj && prodObj.modules.length > 0) {
          setModuleId(prodObj.modules[0].id);
        }
      }
    }
  }, [selectedCustomer]);

  const handleProductChange = (prodId: string) => {
    setProductId(prodId);
    const prod = products.find(p => p.id === prodId);
    if (prod && prod.modules.length > 0) {
      setModuleId(prod.modules[0].id);
    }
  };

  const currentProduct = products.find(p => p.id === productId);

  // File Upload Helper
  const handleFilesChosen = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach(file => {
      // 50 MB check
      if (file.size > 50 * 1024 * 1024) {
        alert(`"${file.name}" hajmi 50 MB dan katta. Iltimos, kichikroq fayl tanlang.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        let category: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'OTHER' = 'OTHER';
        if (file.type.startsWith('image/')) category = 'IMAGE';
        else if (file.type.startsWith('video/')) category = 'VIDEO';
        else if (file.type.includes('pdf') || file.type.includes('word') || file.type.includes('sheet') || file.type.includes('excel') || file.type.includes('text')) category = 'DOCUMENT';

        const bytes = file.size;
        const sizeFormatted = bytes > 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;

        const newAtt: StagedAttachment = {
          id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          originalName: file.name,
          mimeType: file.type || 'application/octet-stream',
          base64,
          sizeFormatted,
          fileCategory: category,
          previewUrl: category === 'IMAGE' ? base64 : undefined
        };

        setAttachments(prev => [...prev, newAtt]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  // Quick Customer Create
  const handleQuickCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInn || !quickName || !quickPhone || !quickPerson) {
      alert('STIR, Korxona nomi, telefon va mas’ul shaxsni kiriting!');
      return;
    }

    setQuickCreating(true);
    try {
      const reg = regions.find(r => r.id === quickRegionId) || regions[0];
      const payload = {
        inn: quickInn.trim(),
        companyName: quickName.trim(),
        regionId: reg ? reg.id : 'reg_tashkent_city',
        primaryPhone: quickPhone.trim(),
        contactPerson: quickPerson.trim(),
        productIds: [productId]
      };

      let newCust: Customer | null = null;
      if (onQuickAddCustomer) {
        newCust = await onQuickAddCustomer(payload);
      } else {
        const res = await fetch('http://localhost:4000/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          newCust = await res.json();
        } else {
          const err = await res.json();
          alert(err.error || 'Mijoz yaratishda xatolik!');
          return;
        }
      }

      if (newCust) {
        setSelectedCustomer(newCust);
        setShowQuickCustomerCreate(false);
        setQuickInn('');
        setQuickName('');
        setQuickPhone('');
        setQuickPerson('');
      }
    } catch (err) {
      alert('Xatolik yuz berdi!');
    } finally {
      setQuickCreating(false);
    }
  };

  // Submit Issue
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !selectedCustomer || !productId) {
      alert('Mavzu, tavsif, mijoz va dastur mahsuloti tanlanishi shart!');
      return;
    }

    setLoading(true);
    try {
      await onCreateIssue({
        customerId: selectedCustomer.id,
        customerInn: selectedCustomer.inn,
        regionId: selectedCustomer.regionId,
        contactPhoneSnapshot: contactPhoneSnapshot || selectedCustomer.primaryPhone,
        contactPersonSnapshot: contactPersonSnapshot || selectedCustomer.contactPerson,
        productId,
        moduleId: moduleId || '',
        title: title.trim(),
        description: description.trim(),
        priority,
        assigned_specialist_id: assignedSpecialistId || undefined,
        dueDate: new Date(dueDate).toISOString(),
        attachments: attachments.map(a => ({
          originalName: a.originalName,
          mimeType: a.mimeType,
          base64: a.base64
        }))
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Murojaat yaratishda xatolik yuz berdi!');
    } finally {
      setLoading(false);
    }
  };

  // Filter customers for dropdown
  const filteredCustomers = customers.filter(c => {
    if (!customerSearch.trim()) return true;
    const q = customerSearch.toLowerCase().trim();
    return (
      (c.inn && c.inn.includes(q)) ||
      c.companyName.toLowerCase().includes(q) ||
      c.primaryPhone.includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Yangi Murojaatni Ro‘yxatga Olish
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                STIR orqali mijozni aniqlash, 4 bosqichli nazorat va media fayllar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* ==================================================== */}
          {/* SECTION 1: CUSTOMER SELECTION & IDENTIFICATION       */}
          {/* ==================================================== */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-600" />
                <span>1. Mijozni Aniqlash (STIR / Nomi / Telefon)</span>
              </label>

              <button
                type="button"
                onClick={() => setShowQuickCustomerCreate(!showQuickCustomerCreate)}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showQuickCustomerCreate ? 'Mavjud mijozni tanlash' : '+ Yangi mijoz yaratish'}</span>
              </button>
            </div>

            {/* If Quick Customer Create is toggled */}
            {showQuickCustomerCreate ? (
              <form onSubmit={handleQuickCustomerSubmit} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-blue-200 dark:border-blue-800 space-y-2.5">
                <div className="text-xs font-bold text-blue-700 dark:text-blue-300">
                  Tezkor mijoz yaratish (Shu formadan chiqmasdan)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    maxLength={9}
                    placeholder="STIR / INN (9 raqam)*"
                    value={quickInn}
                    onChange={e => setQuickInn(e.target.value.replace(/\D/g, '').slice(0, 9))}
                    className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold"
                  />
                  <input
                    type="text"
                    placeholder="Korxona nomi*"
                    value={quickName}
                    onChange={e => setQuickName(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Telefon (+998...)*"
                    value={quickPhone}
                    onChange={e => setQuickPhone(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Mas’ul shaxs (FIO)*"
                    value={quickPerson}
                    onChange={e => setQuickPerson(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                  <select
                    value={quickRegionId}
                    onChange={e => setQuickRegionId(e.target.value)}
                    className="sm:col-span-2 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold"
                  >
                    {regions.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name_uz}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowQuickCustomerCreate(false)}
                    className="px-3 py-1 text-xs text-slate-500 rounded-lg"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={quickCreating}
                    className="px-4 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-50"
                  >
                    {quickCreating ? 'Saqlanmoqda...' : 'Saqlash va tanlash'}
                  </button>
                </div>
              </form>
            ) : (
              /* Normal Customer Selection */
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="STIR, korxona nomi yoki telefon raqami orqali qidirish..."
                    value={customerSearch}
                    onFocus={() => setShowCustomerDropdown(true)}
                    onChange={e => {
                      setCustomerSearch(e.target.value);
                      setShowCustomerDropdown(true);
                    }}
                    className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
                  />

                  {showCustomerDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredCustomers.length === 0 ? (
                        <div className="p-3 text-center text-xs text-slate-400">
                          Mijoz topilmadi. Yuqoridagi «+ Yangi mijoz yaratish» tugmasini bosing.
                        </div>
                      ) : (
                        filteredCustomers.map(c => (
                          <div
                            key={c.id}
                            onClick={() => {
                              setSelectedCustomer(c);
                              setShowCustomerDropdown(false);
                              setCustomerSearch('');
                            }}
                            className="p-2.5 hover:bg-blue-50 dark:hover:bg-slate-800 cursor-pointer text-xs flex items-center justify-between"
                          >
                            <div>
                              <div className="font-bold text-slate-800 dark:text-slate-200">
                                {c.companyName}
                              </div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                                <span className="font-mono text-blue-600 dark:text-blue-400">STIR: {c.inn}</span>
                                <span>•</span>
                                <span>{c.regionName}</span>
                                <span>•</span>
                                <span>{c.primaryPhone}</span>
                              </div>
                            </div>
                            {selectedCustomer?.id === c.id && (
                              <Check className="w-4 h-4 text-blue-600 shrink-0" />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Customer Information Badge */}
                {selectedCustomer && (
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-750 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                          {selectedCustomer.companyName}
                        </span>
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold">
                          STIR: {selectedCustomer.inn}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rose-500" />
                          {selectedCustomer.regionName}
                        </span>
                        <span>•</span>
                        <span>{selectedCustomer.contactPerson}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedCustomer.telegramChatId ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <Send className="w-3 h-3 text-emerald-600" />
                          Telegram: Bog‘langan
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800">
                          Telegram: Ulanmagan
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ==================================================== */}
          {/* SECTION 2: CONTACT SNAPSHOT FOR THIS ISSUE           */}
          {/* ==================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Bog‘lanish telefoni (Murojaat paytidagi)
              </label>
              <input
                type="text"
                value={contactPhoneSnapshot}
                onChange={e => setContactPhoneSnapshot(e.target.value)}
                placeholder="+998901234567"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Murojaat qilgan shaxs (FIO)
              </label>
              <input
                type="text"
                value={contactPersonSnapshot}
                onChange={e => setContactPersonSnapshot(e.target.value)}
                placeholder="Mas’ul shaxs"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
              />
            </div>
          </div>

          {/* ==================================================== */}
          {/* SECTION 3: PRODUCT & MODULE                          */}
          {/* ==================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Dasturiy Mahsulot <span className="text-rose-500">*</span>
              </label>
              <select
                value={productId}
                onChange={e => handleProductChange(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Muammo yuz bergan modul
              </label>
              <select
                value={moduleId}
                onChange={e => setModuleId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
              >
                {currentProduct?.modules.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ==================================================== */}
          {/* SECTION 4: ISSUE DETAILS & PRIORITY                  */}
          {/* ==================================================== */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Murojaat Mavzusi / Muammo Qisqacha <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Masalan: Chek chop etishda 504 Gateway xatoligi"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Batafsil Tavsif va Xatolik Tafsilotlari <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="Muammo qachon va qaysi harakatlardan so‘ng yuz berdi? Xatolik matni..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100 leading-relaxed"
              />
            </div>
          </div>

          {/* ==================================================== */}
          {/* SECTION 5: MEDIA ATTACHMENTS (Images, Videos, Docs) */}
          {/* ==================================================== */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                <span>Media Fayllar & Dalillar (Rasm, Video, PDF, Hujjat)</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {attachments.length} ta fayl biriktirildi
              </span>
            </div>

            {/* Hidden file inputs */}
            <input
              type="file"
              ref={fileInputRef}
              multiple
              className="hidden"
              onChange={e => handleFilesChosen(e.target.files)}
            />
            <input
              type="file"
              ref={imageInputRef}
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => handleFilesChosen(e.target.files)}
            />
            <input
              type="file"
              ref={videoInputRef}
              accept="video/*"
              multiple
              className="hidden"
              onChange={e => handleFilesChosen(e.target.files)}
            />

            {/* Drag & Drop Action Box */}
            <div
              onDragOver={e => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={e => {
                e.preventDefault();
                setIsDragging(false);
                handleFilesChosen(e.dataTransfer.files);
              }}
              className={`p-3.5 rounded-2xl border-2 border-dashed transition-all flex flex-col sm:flex-row items-center justify-between gap-3 ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
              }`}
            >
              <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                <UploadCloud className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Fayllarni shu yerga tashlang yoki quyidagi tugmalar orqali tanlang:</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="px-2.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-blue-50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Rasm</span>
                </button>
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="px-2.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-blue-50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors"
                >
                  <Video className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-blue-50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-600" />
                  <span>Hujjat / ZIP</span>
                </button>
              </div>
            </div>

            {/* Staged Attachments Preview List */}
            {attachments.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {attachments.map(att => (
                  <div
                    key={att.id}
                    className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-750 flex items-center justify-between gap-2 text-xs shadow-sm"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      {att.previewUrl ? (
                        <img
                          src={att.previewUrl}
                          alt="preview"
                          className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                          {att.fileCategory === 'VIDEO' ? (
                            <Video className="w-4 h-4 text-indigo-500" />
                          ) : (
                            <FileText className="w-4 h-4 text-amber-500" />
                          )}
                        </div>
                      )}
                      <div className="truncate">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {att.originalName}
                        </div>
                        <div className="text-[10.5px] text-slate-400 font-mono">
                          {att.sizeFormatted}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeAttachment(att.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ==================================================== */}
          {/* SECTION 6: PRIORITY, SPECIALIST & DUE DATE           */}
          {/* ==================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Muhimligi
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
              >
                <option value="LOW">Past</option>
                <option value="MEDIUM">O‘rta</option>
                <option value="HIGH">Yuqori ⚡</option>
                <option value="CRITICAL">Kritik / Shoshilinch 🔴</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Mas’ul Mutaxassis
              </label>
              <select
                value={assignedSpecialistId}
                onChange={e => setAssignedSpecialistId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
              >
                <option value="">Keyinroq biriktirish...</option>
                {specialists.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Belgilangan muddat
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            🔒 Operator Lock: Murojaat faqat siz yoki Superadmin tomonidan yopilishi mumkin
          </div>

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Bekor qilish
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !title || !selectedCustomer}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
            >
              {loading ? (
                <span>Ro‘yxatga olinmoqda...</span>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Murojaatni ochish</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
