
import React from 'react';
import { Button } from '../components/Button';

interface ResultScreenProps {
  success: boolean;
  onReset: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({ success, onReset }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-in zoom-in duration-500">
      {success ? (
        <>
          <div className="relative">
            <div className="text-8xl mb-6">🏆</div>
            <div className="absolute -top-4 -right-4 text-4xl animate-bounce delay-100">🎉</div>
            <div className="absolute -bottom-2 -left-4 text-4xl animate-bounce delay-300">⭐</div>
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              VOCÊ CONSEGUIU!
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
              Estamos extremamente felizes por você. Seu esforço e consistência te trouxeram até aqui. O LifePlan foi apenas o seu guia, mas o mérito é todo seu!
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="text-8xl mb-6">🫂</div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200">
              Sinto muito que não deu certo...
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Poxa, ficamos tristes que o plano não foi ideal dessa vez. Mas não desanime! Cada tentativa é um aprendizado valioso. 
              <br/><br/>
              Talvez o ritmo tenha sido intenso ou o prazo muito curto? Vamos tentar uma abordagem diferente?
            </p>
          </div>
        </>
      )}

      <div className="pt-8 w-full">
        <Button onClick={onReset} className="w-full py-4 text-lg">
          {success ? "Começar novo objetivo" : "Tentar novamente com outra meta"}
        </Button>
      </div>
    </div>
  );
};
