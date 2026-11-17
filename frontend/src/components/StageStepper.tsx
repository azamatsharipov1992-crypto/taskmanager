import React from 'react';
import { StageId } from '../types';
import { ShieldCheck, Cpu, ArrowRight, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

interface StageStepperProps {
  currentStage: StageId;
  status: string;
  lang: 'UZ' | 'RU';
}

export const StageStepper: React.FC<StageStepperProps> = ({ currentStage, status, lang }) => {
  const stages: { 
    id: StageId; 
    code: string; 
    uz: string; 
    ru: string; 
    subUz: string; 
    subRu: string;
    stageNum: number;
  }[] = [
    {
      id: 'STAGE_1_ACCEPTED',
      code: 'STAGE_01',
      stageNum: 1,
      uz: 'Qabul Qilindi',
      ru: 'Принято',
      subUz: 'Murojaat biriktirildi',
      subRu: 'Зарегистрировано'
    },
    {
      id: 'STAGE_2_RESOLVED',
      code: 'STAGE_02',
      stageNum: 2,
      uz: 'Yechim Berildi',
      ru: 'Решено',
      subUz: 'Dasturchi hal qildi',
      subRu: 'Разработчик сдал'
    },
    {
      id: 'STAGE_3_DISPATCHED',
      code: 'STAGE_03',
      stageNum: 3,
      uz: 'Mijozga Yetkazildi',
      ru: 'Передано Клиенту',
      subUz: 'Tasdiq kutilmoqda',
      subRu: 'Ожидает ответа'
    },
    {
      id: 'STAGE_4_CONFIRMED',
      code: 'STAGE_04',
      stageNum: 4,
      uz: 'Mijoz Tasdiqladi',
      ru: 'Подтверждено',
      subUz: 'Rasman yopildi',
      subRu: 'Успешно закрыто'
    }
  ];

  const getStageIndex = (stage: StageId) => {
    switch (stage) {
      case 'STAGE_1_ACCEPTED': return 1;
      case 'STAGE_2_RESOLVED': return 2;
      case 'STAGE_3_DISPATCHED': return 3;
      case 'STAGE_4_CONFIRMED': return 4;
      default: return 1;
    }
  };

  const currentIndex = getStageIndex(currentStage);

  return (
    <div className="w-full bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden transition-colors">
      {/* Top Telemetry Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 text-sm font-mono">
        <div className="flex items-center gap-2 text-hicyan dark:text-hicyan-neon font-bold tracking-tight">
          <Cpu className="w-5 h-5 text-hicyan" />
          <span>// 4-STAGE VERIFICATION PROTOCOL</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold">
            {lang === 'UZ' ? 'NAZORAT BOSQICHI:' : 'ЭТАП КОНТРОЛЯ:'}
          </span>
          <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-black text-slate-900 dark:text-white text-sm font-mono">
            0{currentIndex} / 04
          </span>
        </div>
      </div>

      {/* 4 Hi-tech Blocks with enlarged font sizes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stages.map((st) => {
          const isDone = st.stageNum < currentIndex || (st.stageNum === 4 && currentStage === 'STAGE_4_CONFIRMED');
          const isCurrent = st.stageNum === currentIndex && !(st.stageNum === 4 && currentStage === 'STAGE_4_CONFIRMED');

          return (
            <div
              key={st.id}
              className={`p-3.5 rounded-xl border transition-all relative ${
                isCurrent
                  ? st.stageNum === 2 || st.stageNum === 3
                    ? 'bg-hiamber-light/80 dark:bg-hiamber/15 border-hiamber shadow-sm ring-2 ring-hiamber/20'
                    : 'bg-hicyan-light/80 dark:bg-hicyan/15 border-hicyan shadow-sm ring-2 ring-hicyan/20'
                  : isDone
                  ? 'bg-himint-light/60 dark:bg-himint/15 border-himint/60 dark:border-himint/40'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
              }`}
            >
              {/* Top Row: Code & Number */}
              <div className="flex items-center justify-between mb-2 font-mono text-xs">
                <span className="font-bold text-slate-500 dark:text-slate-400">
                  {st.code}
                </span>

                <span className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs ${
                  isDone
                    ? 'bg-himint text-white'
                    : isCurrent
                    ? st.stageNum === 2 || st.stageNum === 3 ? 'bg-hiamber text-white animate-pulse' : 'bg-hicyan text-white animate-pulse'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}>
                  {isDone ? '✓' : st.stageNum}
                </span>
              </div>

              {/* Title */}
              <div className="font-black text-sm text-slate-900 dark:text-white truncate tracking-tight">
                {lang === 'UZ' ? st.uz : st.ru}
              </div>

              {/* Subtitle */}
              <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">
                {lang === 'UZ' ? st.subUz : st.subRu}
              </div>

              {/* Status Pip */}
              <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400 dark:text-slate-500">STATUS:</span>
                <span className={`font-black uppercase ${
                  isDone ? 'text-himint dark:text-himint-neon' : isCurrent ? 'text-hicyan dark:text-hicyan-neon' : 'text-slate-400 dark:text-slate-500'
                }`}>
                  {isDone ? 'COMPLETED' : isCurrent ? 'ACTIVE' : 'QUEUED'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hi-Tech Alert Banner for Stage 2 & Stage 3 */}
      {currentStage === 'STAGE_2_RESOLVED' && (
        <div className="mt-3.5 p-3 bg-hiamber-light dark:bg-hiamber/15 border-l-4 border-hiamber rounded-r-xl flex items-center gap-3 text-sm text-hiamber-dark dark:text-hiamber-neon font-semibold">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-hiamber" />
          <span>
            {lang === 'UZ' 
              ? 'DASTURCHI YECHIMI TAYYOR, LEKIN MUROJAAT OCHIQ. Yechimni zudlik bilan mijozga yetkazing!' 
              : 'РЕШЕНИЕ ГОТОВО, НО ОБРАЩЕНИЕ ОТКРЫТО. Немедленно передайте решение клиенту!'}
          </span>
        </div>
      )}

      {currentStage === 'STAGE_3_DISPATCHED' && (
        <div className="mt-3.5 p-3 bg-hiamber-light dark:bg-hiamber/15 border-l-4 border-hiamber rounded-r-xl flex items-center gap-3 text-sm text-hiamber-dark dark:text-hiamber-neon font-semibold">
          <Clock className="w-5 h-5 flex-shrink-0 text-hiamber" />
          <span>
            {lang === 'UZ' 
              ? 'YECHIM MIJOZGA YETKAZILDI. Mijoz muammo to\'liq hal bo\'lganini tasdiqlamaguncha yopish taqiqlanadi.' 
              : 'РЕШЕНИЕ ПЕРЕДАНО КЛИЕНТУ. Закрытие обращения заблокировано до официального подтверждения клиента.'}
          </span>
        </div>
      )}
    </div>
  );
};
