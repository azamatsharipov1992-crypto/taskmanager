import React, { useState } from 'react';
import { Customer, Product } from '../types';
import { translations, Language } from '../translations';
import { Users, Phone, Send, MapPin, Plus, Cpu, PackageCheck } from 'lucide-react';

interface CustomersViewProps {
  customers: Customer[];
  products: Product[];
  lang: Language;
  onAddCustomer: (customerData: any) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  products,
  lang,
  onAddCustomer
}) => {
  const t = translations[lang];
  const [showAddModal, setShowAddModal] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !contactPerson || !phone) return;

    onAddCustomer({
      companyName,
      contactPerson,
      phone,
      telegramUsername,
      address,
      notes,
      productIds: selectedProducts
    });

    setShowAddModal(false);
    setCompanyName('');
    setContactPerson('');
    setPhone('');
    setTelegramUsername('');
    setAddress('');
    setNotes('');
    setSelectedProducts([]);
  };

  const toggleProduct = (prodId: string) => {
    setSelectedProducts(prev => 
      prev.includes(prodId) ? prev.filter(p => p !== prodId) : [...prev, prodId]
    );
  };

  return (
    <div className="space-y-5 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm font-mono transition-colors">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-hicyan" />
            <span>// CUSTOMER ACCOUNTS DIRECTORY</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
            Dasturiy ta'minot o'rnatilgan korxonalar va aloqa rekvizitlari
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-hicyan hover:bg-hicyan-dark text-white text-xs font-mono font-bold rounded-xl shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ YANGI MIJOZ</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.map((cust) => {
          const custProducts = products.filter(p => cust.productIds?.includes(p.id));

          return (
            <div
              key={cust.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-hicyan dark:hover:border-hicyan p-5 rounded-2xl shadow-sm transition-all flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 font-mono">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-hicyan transition-colors">{cust.companyName}</h3>
                  <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded font-bold">
                    [{cust.id.replace('cust_', '').toUpperCase()}]
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">
                  Mas'ul: <strong className="text-slate-800 dark:text-slate-200">{cust.contactPerson}</strong>
                </div>

                {/* Contact details */}
                <div className="mt-3.5 space-y-2 text-xs text-slate-600 dark:text-slate-300 font-mono">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{cust.phone}</span>
                  </div>
                  {cust.telegramUsername && (
                    <div className="flex items-center gap-2 text-hicyan">
                      <Send className="w-4 h-4" />
                      <span>@{cust.telegramUsername}</span>
                    </div>
                  )}
                  {cust.address && (
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-sans text-xs">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="truncate">{cust.address}</span>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {cust.notes && (
                  <div className="mt-3.5 p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs text-slate-600 dark:text-slate-300">
                    {cust.notes}
                  </div>
                )}
              </div>

              {/* Installed Products */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 font-mono">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  // INSTALLED PRODUCTS:
                </div>
                <div className="flex flex-wrap gap-2">
                  {custProducts.length === 0 ? (
                    <span className="text-xs text-slate-400">Yo'q</span>
                  ) : (
                    custProducts.map(p => (
                      <span
                        key={p.id}
                        className="text-xs font-bold px-2.5 py-1 rounded bg-hicyan-light dark:bg-hicyan/20 text-hicyan-dark dark:text-hicyan-neon border border-hicyan/30"
                      >
                        {p.name}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-mono">
              // YANGI MIJOZNI RO'YXATGA OLISH
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Tashkilot / Kompaniya nomi *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Masalan: Korzinka / Mega Market"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-hicyan text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Mas'ul shaxs *</label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Masalan: Dilshod Shukurov"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-hicyan text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Telefon *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998 90 123-45-67"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-hicyan text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Telegram username</label>
                  <input
                    type="text"
                    value={telegramUsername}
                    onChange={(e) => setTelegramUsername(e.target.value)}
                    placeholder="masalan: dilshod_it"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-hicyan text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Manzil</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Toshkent sh., Chilonzor"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-hicyan text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Biriktirilgan mahsulotlar</label>
                <div className="flex gap-2">
                  {products.map(p => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => toggleProduct(p.id)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
                        selectedProducts.includes(p.id)
                          ? 'bg-hicyan text-white border-hicyan'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Izoh</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Kassa soni, integratsiyalar yoki o'ziga xos talablar..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-hicyan text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 font-mono">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-semibold"
                >
                  BEKOR QILISH
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-hicyan text-white font-bold rounded-lg hover:bg-hicyan-dark transition-colors shadow-sm"
                >
                  SAQLASH
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
