
import React, { useState } from 'react';
import { Button } from '../components/Button';

interface WelcomeScreenProps {
  onStart: (goal: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const [goal, setGoal] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (goal.trim()) {
      onStart(goal);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
          Qual objetivo você quer conquistar?
        </h2>
        <p className="text-lg text-slate-500 dark:text-slate-400">
          Vamos transformar seu sonho em um plano diário executável.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <textarea
            autoFocus
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Ex: Aprender Python do zero em 3 meses"
            className="w-full min-h-[160px] p-6 text-xl rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-0 transition-all outline-none resize-none shadow-sm"
          />
        </div>
        <Button 
          type="submit" 
          disabled={!goal.trim()} 
          className="w-full py-4 text-lg"
        >
          Continuar
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Button>
      </form>
    </div>
  );
};
