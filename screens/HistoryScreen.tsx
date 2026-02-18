
import React from 'react';
import { GoalHistoryItem } from '../types';
import { Button } from '../components/Button';

interface HistoryScreenProps {
  history: GoalHistoryItem[];
  onBack: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ history, onBack }) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-3xl font-bold tracking-tight">Histórico de Metas</h2>
      </div>

      <div className="space-y-4">
        {history.length === 0 ? (
          <div className="text-center py-16 px-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <div className="text-5xl mb-4">📜</div>
            <p className="text-slate-500 dark:text-slate-400">Você ainda não completou ou resetou nenhuma meta.</p>
            <Button variant="ghost" className="mt-4 text-indigo-500" onClick={onBack}>
              Começar minha primeira meta
            </Button>
          </div>
        ) : (
          history.map((item) => (
            <div 
              key={item.id}
              className="p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
            >
              <div className="flex justify-between items-start gap-4 mb-2">
                <h3 className="font-bold text-lg leading-tight">{item.goal}</h3>
                <span className={`shrink-0 text-[10px] px-2 py-1 rounded-full uppercase font-bold tracking-wider ${
                  item.status === 'completed' 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' 
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  {item.status === 'completed' ? 'Concluída' : 'Abandonada'}
                </span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Finalizada em: {item.date}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="pt-8">
        <Button onClick={onBack} variant="outline" className="w-full">
          Voltar ao App
        </Button>
      </div>
    </div>
  );
};
