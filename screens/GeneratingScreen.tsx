
import React, { useState, useEffect } from 'react';

const MESSAGES = [
  "Analisando sua meta...",
  "Consultando as melhores práticas...",
  "Dividindo em macro etapas...",
  "Criando micro tarefas diárias...",
  "Ajustando para seu tempo disponível...",
  "Quase lá, finalizando seu guia..."
];

export const GeneratingScreen: React.FC = () => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-4 border-slate-100 dark:border-slate-800 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-2xl font-bold transition-all duration-500">
          {MESSAGES[msgIndex]}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 animate-pulse">
          Nossa inteligência está pensando por você.
        </p>
      </div>
    </div>
  );
};
