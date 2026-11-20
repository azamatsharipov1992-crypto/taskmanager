import React, { useState, useEffect } from 'react';
import { Customer, Product, Region, User } from '../types';
import { translations, Language } from '../translations';
import {
  Users,
  Phone,
  Send,
  MapPin,
  Plus,
  Cpu,
  PackageCheck,
  Search,
  Building,
  CheckCircle2,
  XCircle,
  Link as LinkIcon,
  Copy,
  ExternalLink,
  Edit2,
  Trash2,
  AlertCircle,
  RefreshCw,
  Eye,
  Filter
} from 'lucide-react';

interface CustomersViewProps {
  customers: Customer[];
  products: Product[];
  lang: Language;
  onAddCustomer: (customerData: any) => Promise<any> | void;
  onUpdateCustomer?: (id: string, updates: any) => Promise<any> | void;
  onDeleteCustomer?: (id: string) => Promise<any> | void;
  currentUserRole?: string;
  operators?: User[];
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  products,
  lang,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  currentUserRole = 'SUPER_ADMIN',
  operators = []
}) => {
  const t = translations[lang];

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('ALL');
  const [productFilter, setProductFilter] = useState('ALL');
  const [telegramFilter, setTelegramFilter] = useState('ALL');
  const [activeFilter, setActiveFilter] = useState('ALL');

  // Regions from API
  const [regions, setRegions] = useState<Region[]>([]);
  const [loadingRegions, setLoadingRegions] = useState(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Telegram Link Modal
  const [telegramLinkModal, setTelegramLinkModal] = useState<{
    show: boolean;
    customer: Customer | null;
    linkUrl: string;
    copied: boolean;
  }>({
    show: false,
    customer: null,
    linkUrl: '',
    copied: false
  });

  // Form State for Add / Edit
  const [formInn, setFormInn] = useState('');
  const [formCompanyName, setFormCompanyName] = useState('');
  const [formShortName, setFormShortName] = useState('');
  const [formCompanyStatus, setFormCompanyStatus] = useState<'FAOL' | 'TUGATILGAN' | 'TOXTATILGAN'>('FAOL');
  const [formLegalAddress, setFormLegalAddress] = useState('');
  const [formRegionId, setFormRegionId] = useState('');
  const [formDistrictName, setFormDistrictName] = useState('');
  const [formActivityAddress, setFormActivityAddress] = useState('');
  const [formPrimaryPhone, setFormPrimaryPhone] = useState('');
  const [formSecondaryPhone, setFormSecondaryPhone] = useState('');
  const [formContactPerson, setFormContactPerson] = useState('');
  const [formPosition, setFormPosition] = useState('');
  const [formPreferredLanguage, setFormPreferredLanguage] = useState<'UZ' | 'RU'>('UZ');
  const [formOperatorId, setFormOperatorId] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formSelectedProducts, setFormSelectedProducts] = useState<string[]>([]);
  const [formDataSource, setFormDataSource] = useState<'IHAMKOR' | 'MANUAL' | 'HYBRID'>('MANUAL');

  // iHamkor Lookup state
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupFeedback, setLookupFeedback] = useState<{
    type: 'success' | 'warning' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  // Fetch regions on mount
  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      setLoadingRegions(true);
      const res = await fetch('http://localhost:4000/api/regions');
      if (res.ok) {
        const data = await res.json();
        setRegions(data);
        if (data.length > 0 && !formRegionId) {
          setFormRegionId(data[0].id);
        }
      }
    } catch (err) {
      console.warn('Failed to load regions:', err);
    } finally {
      setLoadingRegions(false);
    }
  };

  // Perform iHamkor lookup
  const handleIHamkorLookup = async (innToSearch: string) => {
    const clean = innToSearch.trim().replace(/\D/g, '');
    if (clean.length !== 9) {
      setLookupFeedback({
        type: 'warning',
        message: 'STIR/INN aynan 9 ta raqamdan iborat bo‘lishi kerak!'
      });
      return;
    }

    setIsLookingUp(true);
    setLookupFeedback({ type: null, message: '' });

    try {
      const res = await fetch('http://localhost:4000/api/integrations/ihamkor/company-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inn: clean })
      });
      const result = await res.json();

      if (result.exists && result.customer) {
        setLookupFeedback({
          type: 'warning',
          message: `Ushbu STIR bo‘yicha mijoz bazada mavjud: "${result.customer.companyName}"!`
        });
        return;
      }

      if (result.success && result.data) {
        const d = result.data;
        setFormCompanyName(d.companyName || '');
        setFormShortName(d.shortName || '');
        setFormCompanyStatus(d.companyStatus || 'FAOL');
        setFormLegalAddress(d.legalAddress || '');
        if (d.regionId) setFormRegionId(d.regionId);
        if (d.districtName) setFormDistrictName(d.districtName);
        if (d.phone && !formPrimaryPhone) setFormPrimaryPhone(d.phone);
        if (d.directorName && !formContactPerson) setFormContactPerson(d.directorName);
        setFormDataSource(d.dataSource === 'IHAMKOR_API' ? 'IHAMKOR' : 'HYBRID');

        setLookupFeedback({
          type: 'success',
          message: `iHamkor: "${d.companyName}" korxonasi muvaffaqiyatli aniqlandi!`
        });
      } else {
        setLookupFeedback({
          type: 'error',
          message: result.error || 'Korxona ma’lumotlari topilmadi. Qo‘lda kiritishingiz mumkin.'
        });
      }
    } catch (err) {
      setLookupFeedback({
        type: 'error',
        message: 'iHamkor xizmati bilan aloqa o‘rnatilmadi. Ma’lumotlarni qo‘lda to‘ldiring.'
      });
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleInnChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 9);
    setFormInn(clean);
    if (clean.length === 9) {
      handleIHamkorLookup(clean);
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormInn('');
    setFormCompanyName('');
    setFormShortName('');
    setFormCompanyStatus('FAOL');
    setFormLegalAddress('');
    setFormRegionId(regions[0]?.id || 'reg_tashkent_city');
    setFormDistrictName('');
    setFormActivityAddress('');
    setFormPrimaryPhone('');
    setFormSecondaryPhone('');
    setFormContactPerson('');
    setFormPosition('');
    setFormPreferredLanguage('UZ');
    setFormOperatorId(operators[0]?.id || '');
    setFormNotes('');
    setFormSelectedProducts(['prod_poscode']);
    setFormDataSource('MANUAL');
    setLookupFeedback({ type: null, message: '' });
    setShowAddModal(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setIsEditing(true);
    setSelectedCustomer(customer);
    setFormInn(customer.inn || '');
    setFormCompanyName(customer.companyName || '');
    setFormShortName(customer.shortName || '');
    setFormCompanyStatus(customer.companyStatus || 'FAOL');
    setFormLegalAddress(customer.legalAddress || '');
    setFormRegionId(customer.regionId || regions[0]?.id || 'reg_tashkent_city');
    setFormDistrictName(customer.districtName || '');
    setFormActivityAddress(customer.activityAddress || '');
    setFormPrimaryPhone(customer.primaryPhone || '');
    setFormSecondaryPhone(customer.secondaryPhone || '');
    setFormContactPerson(customer.contactPerson || '');
    setFormPosition(customer.position || '');
    setFormPreferredLanguage(customer.preferredLanguage || 'UZ');
    setFormOperatorId(customer.responsibleOperatorId || '');
    setFormNotes(customer.notes || '');
    setFormSelectedProducts(
      (customer.products || []).map(p => p.productId) || customer.productIds || []
    );
    setFormDataSource(customer.dataSource || 'MANUAL');
    setLookupFeedback({ type: null, message: '' });
    setShowAddModal(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formInn || !formCompanyName || !formPrimaryPhone || !formContactPerson || !formRegionId) {
      alert('Iltimos, barcha majburiy maydonlarni to‘ldiring (STIR, Nomi, Viloyat, Telefon, Mas’ul)!');
      return;
    }

    const customerPayload = {
      inn: formInn,
      companyName: formCompanyName,
      shortName: formShortName,
      companyStatus: formCompanyStatus,
      legalAddress: formLegalAddress,
      regionId: formRegionId,
      districtName: formDistrictName,
      activityAddress: formActivityAddress,
      primaryPhone: formPrimaryPhone,
      secondaryPhone: formSecondaryPhone,
      contactPerson: formContactPerson,
      position: formPosition,
      preferredLanguage: formPreferredLanguage,
      responsibleOperatorId: formOperatorId,
      notes: formNotes,
      productIds: formSelectedProducts,
      dataSource: formDataSource
    };

    if (isEditing && selectedCustomer && onUpdateCustomer) {
      await onUpdateCustomer(selectedCustomer.id, customerPayload);
    } else {
      await onAddCustomer(customerPayload);
    }

    setShowAddModal(false);
  };

  // Generate Telegram linking link
  const handleGenerateTelegramLink = async (customer: Customer) => {
    try {
      const res = await fetch(`http://localhost:4000/api/customers/${customer.id}/telegram-link`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success && data.linkUrl) {
        setTelegramLinkModal({
          show: true,
          customer,
          linkUrl: data.linkUrl,
          copied: false
        });
      } else {
        alert(data.error || 'Havola yaratishda xatolik!');
      }
    } catch (err) {
      alert('Server bilan aloqa xatosi!');
    }
  };

  // Send Test Notification
  const handleSendTestNotification = async (customerId: string) => {
    try {
      const res = await fetch(`http://localhost:4000/api/customers/${customerId}/notifications/test`, {
        method: 'POST'
      });
      const data = await res.json();
      alert(data.message || 'Xabar holati tekshirildi');
    } catch (err) {
      alert('Xatolik yuz berdi!');
    }
  };

  // Filtered customers
  const filteredCustomers = customers.filter(c => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const matchInn = c.inn && c.inn.includes(q);
      const matchName = c.companyName.toLowerCase().includes(q);
      const matchPhone = c.primaryPhone.includes(q) || (c.secondaryPhone && c.secondaryPhone.includes(q));
      const matchPerson = c.contactPerson.toLowerCase().includes(q);
      if (!matchInn && !matchName && !matchPhone && !matchPerson) return false;
    }
    if (regionFilter !== 'ALL' && c.regionId !== regionFilter) return false;
    if (productFilter !== 'ALL') {
      const hasProd = (c.products || []).some(p => p.productId === productFilter) || (c.productIds || []).includes(productFilter);
      if (!hasProd) return false;
    }
    if (telegramFilter !== 'ALL') {
      const isLinked = telegramFilter === 'LINKED';
      if ((!!c.telegramChatId) !== isLinked) return false;
    }
    if (activeFilter !== 'ALL') {
      const isActive = activeFilter === 'ACTIVE';
      if (c.isActive !== isActive) return false;
    }
    return true;
  });

  const selectedRegionObj = regions.find(r => r.id === formRegionId);
  const currentDistricts = selectedRegionObj?.districts || [];

  return (
    <div className="space-y-6 font-sans">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                CUSTOMER ACCOUNTS DIRECTORY
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                  {customers.length} ta mijoz
                </span>
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                STIR / INN orqali korxonalarni hisobga olish, iHamkor ma’lumotnomasi va Telegram xabarnomalar
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi mijoz (STIR)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="STIR/INN, korxona nomi, telefon yoki FIO bo‘yicha qidirish..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100 placeholder-slate-400"
            />
          </div>

          {/* Region Filter */}
          <div>
            <select
              value={regionFilter}
              onChange={e => setRegionFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
            >
              <option value="ALL">Barcha viloyatlar (14)</option>
              {regions.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name_uz}
                </option>
              ))}
            </select>
          </div>

          {/* Product Filter */}
          <div>
            <select
              value={productFilter}
              onChange={e => setProductFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
            >
              <option value="ALL">Barcha dasturlar</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Telegram Status Filter */}
          <div>
            <select
              value={telegramFilter}
              onChange={e => setTelegramFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
            >
              <option value="ALL">Telegram: Barchasi</option>
              <option value="LINKED">Bog‘langan 🟢</option>
              <option value="UNLINKED">Bog‘lanmagan ⚪</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-4">INN / STIR</th>
                <th className="py-3.5 px-4">Korxona nomi</th>
                <th className="py-3.5 px-4">Hudud (Viloyat)</th>
                <th className="py-3.5 px-4">Aloqa (Telefon / FIO)</th>
                <th className="py-3.5 px-4">Dasturlar</th>
                <th className="py-3.5 px-4">Telegram</th>
                <th className="py-3.5 px-4 text-center">Murojaatlar</th>
                <th className="py-3.5 px-4">Holati</th>
                <th className="py-3.5 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Building className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="font-medium">Mijozlar topilmadi</p>
                    <p className="text-xs text-slate-400 mt-1">
                      «Yangi mijoz (STIR)» tugmasi orqali korxona qo‘shishingiz mumkin
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(customer => {
                  const isLinked = !!customer.telegramChatId;
                  return (
                    <tr
                      key={customer.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {customer.inn || '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {customer.companyName}
                        </div>
                        <div className="text-xs text-slate-400 line-clamp-1">
                          {customer.legalAddress || customer.activityAddress || 'Manzil kiritilmagan'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>{customer.regionName || 'Toshkent shahri'}</span>
                        </div>
                        {customer.districtName && (
                          <div className="text-[11px] text-slate-400 ml-5">
                            {customer.districtName}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {customer.primaryPhone}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {customer.contactPerson}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {customer.products && customer.products.length > 0 ? (
                            customer.products.map(p => (
                              <span
                                key={p.productId}
                                className="inline-block px-2 py-0.5 text-[10.5px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-md border border-emerald-200/60 dark:border-emerald-800/60"
                              >
                                {p.productName}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {isLinked ? (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Bog‘langan
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleGenerateTelegramLink(customer)}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/40 transition-colors"
                          >
                            <LinkIcon className="w-3 h-3" />
                            Bog‘lash
                          </button>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-full">
                          {customer.issuesCount || 0}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10.5px] font-semibold rounded-full ${
                            customer.isActive
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                              : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                          }`}
                        >
                          {customer.isActive ? 'Faol' : 'Faol emas'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isLinked && (
                            <button
                              onClick={() => handleSendTestNotification(customer.id)}
                              title="Test xabar yuborish"
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEdit(customer)}
                            title="Tahrirlash"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {onDeleteCustomer && currentUserRole === 'SUPER_ADMIN' && (
                            <button
                              onClick={() => {
                                if (confirm(`"${customer.companyName}" mijozini o‘chirmoqchimisiz?`)) {
                                  onDeleteCustomer(customer.id);
                                }
                              }}
                              title="O‘chirish"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================================================== */}
      {/* ADD / EDIT CUSTOMER MODAL WITH iHAMKOR LOOKUP       */}
      {/* ==================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-600" />
                  {isEditing ? 'Mijoz Ma’lumotlarini Tahrirlash' : 'Yangi Mijoz Qo‘shish (STIR / INN)'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  STIR kiritilganda iHamkor orqali ma’lumotlar avtomatik to‘ldiriladi
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
              >
                ✕
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveCustomer} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* STIR & iHamkor Search Section */}
              <div className="p-4 bg-blue-50/60 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/60 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300">
                    STIR / INN (9 xonali) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-blue-600 dark:text-blue-400">
                    iHamkor.uz API integratsiyasi
                  </span>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      maxLength={9}
                      placeholder="Masalan: 302845112"
                      value={formInn}
                      onChange={e => handleInnChange(e.target.value)}
                      className="w-full px-4 py-2.5 font-mono text-base font-bold bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
                    />
                    {isLookingUp && (
                      <RefreshCw className="w-4 h-4 text-blue-600 animate-spin absolute right-3.5 top-3.5" />
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleIHamkorLookup(formInn)}
                    disabled={formInn.length !== 9 || isLookingUp}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>iHamkor qidirish</span>
                  </button>
                </div>

                {lookupFeedback.message && (
                  <div
                    className={`text-xs p-2.5 rounded-xl flex items-center gap-2 ${
                      lookupFeedback.type === 'success'
                        ? 'bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : lookupFeedback.type === 'warning'
                        ? 'bg-amber-100/80 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-rose-100/80 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {lookupFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{lookupFeedback.message}</span>
                  </div>
                )}
              </div>

              {/* Korxona Asosiy Ma'lumotlari */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Korxona Rasmiy Nomi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder='"UNIVERSAL SAVDO" MCHJ'
                    value={formCompanyName}
                    onChange={e => setFormCompanyName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Qisqartirilgan Nomi (Brend)
                  </label>
                  <input
                    type="text"
                    placeholder="Masalan: UNIVERSAL"
                    value={formShortName}
                    onChange={e => setFormShortName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Korxona Holati
                  </label>
                  <select
                    value={formCompanyStatus}
                    onChange={e => setFormCompanyStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
                  >
                    <option value="FAOL">Faol (Ishlamoqda)</option>
                    <option value="TOXTATILGAN">Vaqtincha to‘xtatilgan</option>
                    <option value="TUGATILGAN">Tugallangan / Faol emas</option>
                  </select>
                </div>
              </div>

              {/* Hududiy Birliklar (14 ta Viloyat & Tumanlar) */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>Mijozning Amalda Faoliyat Yuritadigan Hududi (14 ta Viloyat)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Viloyat / Hudud <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formRegionId}
                      onChange={e => {
                        setFormRegionId(e.target.value);
                        setFormDistrictName('');
                      }}
                      className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100 font-semibold"
                    >
                      {regions.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.name_uz}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Tuman / Shahar
                    </label>
                    {currentDistricts.length > 0 ? (
                      <select
                        value={formDistrictName}
                        onChange={e => setFormDistrictName(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
                      >
                        <option value="">Tanlang...</option>
                        {currentDistricts.map(d => (
                          <option key={d.id} value={d.name_uz}>
                            {d.name_uz}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="Tuman / shahar"
                        value={formDistrictName}
                        onChange={e => setFormDistrictName(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
                      />
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Yuridik manzil (iHamkor yoki ro‘yxatdan o‘tgan)
                    </label>
                    <input
                      type="text"
                      placeholder="Yuridik manzil..."
                      value={formLegalAddress}
                      onChange={e => setFormLegalAddress(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Amaldagi faoliyat manzili (filial/do‘kon manzili)
                    </label>
                    <input
                      type="text"
                      placeholder="Faoliyat manzili..."
                      value={formActivityAddress}
                      onChange={e => setFormActivityAddress(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Aloqa ma'lumotlari */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Asosiy Telefon <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+998901234567"
                    value={formPrimaryPhone}
                    onChange={e => setFormPrimaryPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Qo‘shimcha Telefon
                  </label>
                  <input
                    type="text"
                    placeholder="+998991234567"
                    value={formSecondaryPhone}
                    onChange={e => setFormSecondaryPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Aloqa uchun Mas’ul Shaxs (FIO) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Rustam Karimov"
                    value={formContactPerson}
                    onChange={e => setFormContactPerson(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Lavozimi
                  </label>
                  <input
                    type="text"
                    placeholder="Bosh buxgalter / Direktor / Administrator"
                    value={formPosition}
                    onChange={e => setFormPosition(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Muloqot va Xabarnomalar Tili
                  </label>
                  <select
                    value={formPreferredLanguage}
                    onChange={e => setFormPreferredLanguage(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
                  >
                    <option value="UZ">O‘zbekcha (UZ)</option>
                    <option value="RU">Русский (RU)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mas’ul Operator
                  </label>
                  <select
                    value={formOperatorId}
                    onChange={e => setFormOperatorId(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
                  >
                    <option value="">Tanlang...</option>
                    {operators.map(op => (
                      <option key={op.id} value={op.id}>
                        {op.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dasturiy Mahsulotlar (Multiple Products) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Foydalanadigan Dasturiy Mahsulotlar (Bir nechta tanlash mumkin)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {products.map(p => {
                    const isSelected = formSelectedProducts.includes(p.id);
                    return (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => {
                          setFormSelectedProducts(prev =>
                            prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id]
                          );
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-100 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs">{p.name}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{p.code}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Izoh */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Qo‘shimcha Izoh yoki Qaydlar
                </label>
                <textarea
                  rows={2}
                  placeholder="Mijoz haqida maxsus eslatmalar..."
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                >
                  {isEditing ? 'O‘zgarishlarni saqlash' : 'Mijozni saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TELEGRAM LINK MODAL WITH 1-CLICK COPY               */}
      {/* ==================================================== */}
      {telegramLinkModal.show && telegramLinkModal.customer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-xl">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                    Telegram Hisobini Bog‘lash
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {telegramLinkModal.customer.companyName} (STIR: {telegramLinkModal.customer.inn})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTelegramLinkModal(prev => ({ ...prev, show: false }))}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Ushbu bir martalik xavfsiz havolani mijozga (SMS, WhatsApp yoki Telegram orqali) yuboring.
                Mijoz havolani bosib botda <b>/start</b> tugmasini bosgach, uning Telegram hisobi avtomatik bog‘lanadi:
              </p>

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  readOnly
                  value={telegramLinkModal.linkUrl}
                  className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-blue-600 dark:text-blue-400 select-all"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(telegramLinkModal.linkUrl);
                    setTelegramLinkModal(prev => ({ ...prev, copied: true }));
                    setTimeout(() => setTelegramLinkModal(prev => ({ ...prev, copied: false })), 2500);
                  }}
                  className="px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 flex items-center gap-1.5 shrink-0"
                >
                  {telegramLinkModal.copied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Nusxalandi!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Nusxa olish</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] text-slate-400">Amal qilish muddati: 48 soat</span>
              <button
                onClick={() => setTelegramLinkModal(prev => ({ ...prev, show: false }))}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
