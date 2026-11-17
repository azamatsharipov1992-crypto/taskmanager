import React from 'react';
import { Product } from '../types';
import { Language } from '../translations';
import { Package, Layers, CheckCircle2, Cpu } from 'lucide-react';

interface ProductsViewProps {
  products: Product[];
  lang: Language;
}

export const ProductsView: React.FC<ProductsViewProps> = ({ products, lang }) => {
  return (
    <div className="space-y-5 font-sans">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm font-mono transition-colors">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-hicyan" />
          <span>// SOFTWARE PRODUCTS & MODULE ARCHITECTURE</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
          Qo'llab-quvvatlanadigan dasturlar va ularning ichki funksional modullari
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {products.map((prod) => (
          <div
            key={prod.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4 group hover:border-hicyan transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-2 font-mono">
                <span className="text-xs font-bold bg-hicyan-light dark:bg-hicyan/20 text-hicyan-dark dark:text-hicyan-neon border border-hicyan/30 px-2.5 py-0.5 rounded">
                  [{prod.code}]
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                  {prod.modules.length} TA MODUL
                </span>
              </div>

              <h3 className="text-lg font-black text-slate-900 dark:text-white font-mono tracking-tight group-hover:text-hicyan transition-colors">{prod.name}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {prod.description}
              </p>

              {/* Modules List */}
              <div className="mt-5 space-y-2.5 font-mono">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-hicyan" />
                  <span>// TARKIBIY MODULLAR:</span>
                </div>

                <div className="space-y-2">
                  {prod.modules.map((m) => (
                    <div
                      key={m.id}
                      className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-xs group-hover:border-slate-300 dark:group-hover:border-slate-600 transition-colors"
                    >
                      <span className="text-slate-800 dark:text-slate-200 font-medium font-sans">
                        {m.name}
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-himint dark:text-himint-neon" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 font-mono">
              // Murojaat ro'yxatga olinganda modul majburiy
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
