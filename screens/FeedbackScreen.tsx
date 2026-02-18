
import React from 'react';
import { Button } from '../components/Button';

interface FeedbackScreenProps {
  onResponse: (worked: boolean) => void;
}

export const FeedbackScreen: React.FC<FeedbackScreenProps> = ({ onResponse }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-12">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Você concluiu sua jornada!</h2>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Chegamos ao fim do plano. Sendo sincero(a), o método funcionou para você?
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        <Button 
          onClick={() => onResponse(true)} 
          className="py-6 text-xl bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200"
        >
          Sim, funcionou! 🚀
        </Button>
        <Button 
          onClick={() => onResponse(false)} 
          variant="outline"
          className="py-6 text-xl border-slate-200 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          Não funcionou... 😔
        </Button>
      </div>
    </div>
  );
};
