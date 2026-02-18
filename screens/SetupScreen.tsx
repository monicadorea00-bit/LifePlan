
import React, { useState } from 'react';
import { Button } from '../components/Button';

interface SetupScreenProps {
  onConfirm: (deadline: string, time: number, level: string) => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ onConfirm }) => {
  const [deadline, setDeadline] = useState('3 meses');
  const [time, setTime] = useState(60);
  const [level, setLevel] = useState('iniciante');

  return (
    <div className="space-y-10">
      <h2 className="text-3xl font-bold tracking-tight">Personalize seu plano</h2>
      
      <div className="space-y-8">
        <div className="space-y-3">
          <label className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Prazo desejado
          </label>
          <div className="grid grid-cols-2 gap-3">
            {['1 mês', '3 meses', '6 meses', '1 ano'].map((d) => (
              <button
                key={d}
                onClick={() => setDeadline(d)}
                className={`p-4 rounded-xl border-2 transition-all font-medium ${deadline === d ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300' : 'border-slate-100 dark:border-slate-800 text-slate-600'}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Tempo disponível por dia
          </label>
          <div className="flex items-center gap-4">
            <input 
              type="range" 
              min="15" 
              max="240" 
              step="15"
              value={time}
              onChange={(e) => setTime(parseInt(e.target.value))}
              className="flex-1 accent-indigo-600 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
            <span className="min-w-[100px] text-right font-bold text-xl text-indigo-600">
              {time < 60 ? `${time}m` : `${Math.floor(time/60)}h ${time%60 > 0 ? `${time%60}m` : ''}`}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Seu nível atual
          </label>
          <div className="flex gap-3">
            {['iniciante', 'intermediário', 'avançado'].map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={`flex-1 p-3 rounded-xl border-2 capitalize transition-all ${level === l ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300' : 'border-slate-100 dark:border-slate-800 text-slate-600'}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button onClick={() => onConfirm(deadline, time, level)} className="w-full py-4 text-lg">
        Criar Plano
      </Button>
    </div>
  );
};
