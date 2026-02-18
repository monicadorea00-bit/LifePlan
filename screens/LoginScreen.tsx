
import React, { useState } from 'react';
import { Button } from '../components/Button';
import { User } from '../types';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);

  const handleProviderLogin = (provider: 'google' | 'apple') => {
    // Simulated login
    onLogin({
      id: Math.random().toString(36).substr(2, 9),
      email: `${provider}@example.com`,
      provider
    });
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      onLogin({
        id: Math.random().toString(36).substr(2, 9),
        email: email.trim(),
        provider: 'email'
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-10">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold tracking-tight">Bem-vindo ao LifePlan</h2>
        <p className="text-slate-500 dark:text-slate-400">Escolha como deseja acessar sua conta</p>
      </div>

      <div className="w-full space-y-4">
        {!showEmailInput ? (
          <>
            <Button 
              onClick={() => handleProviderLogin('google')}
              variant="outline"
              className="w-full py-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex items-center justify-center gap-3 text-lg"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              Continuar com Google
            </Button>

            <Button 
              onClick={() => handleProviderLogin('apple')}
              variant="outline"
              className="w-full py-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex items-center justify-center gap-3 text-lg"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.96.95-2.01 1.72-3.15 1.72-1.14 0-1.5-.72-2.85-.72-1.35 0-1.76.72-2.85.72-1.09 0-2.19-.77-3.15-1.72-2.01-2-3.41-5.74-3.41-8.5 0-4.39 2.74-6.72 5.37-6.72 1.38 0 2.68.96 3.53.96.84 0 2.3-.96 3.73-.96 1.49 0 3.01.81 3.97 2.18-3.08 1.83-2.58 6.07.53 7.33-.78 1.94-1.79 3.74-2.72 4.71zM12.03 7.25c-.02-2.12 1.76-3.95 3.84-4.04.14 2.45-2.22 4.47-3.84 4.04z" />
              </svg>
              Continuar com Apple
            </Button>

            <Button 
              onClick={() => setShowEmailInput(true)}
              variant="ghost"
              className="w-full text-indigo-500 dark:text-indigo-400 font-semibold"
            >
              Usar meu e-mail
            </Button>
          </>
        ) : (
          <form onSubmit={handleEmailSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-wider text-slate-500">Endereço de E-mail</label>
              <input 
                type="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@exemplo.com"
                className="w-full p-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:border-indigo-500 outline-none transition-all"
                required
              />
            </div>
            <Button type="submit" className="w-full py-4 text-lg">
              Entrar
            </Button>
            <button 
              type="button"
              onClick={() => setShowEmailInput(false)}
              className="w-full text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              Voltar para outras opções
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
