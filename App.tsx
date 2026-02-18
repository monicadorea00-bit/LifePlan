
import React, { useState, useEffect } from 'react';
import { AppStep, LifePlanData, GoalHistoryItem, User } from './types';
import { LoginScreen } from './screens/LoginScreen';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { SetupScreen } from './screens/SetupScreen';
import { GeneratingScreen } from './screens/GeneratingScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { FeedbackScreen } from './screens/FeedbackScreen';
import { ResultScreen } from './screens/ResultScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { generatePlan } from './services/geminiService';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.Login);
  const [user, setUser] = useState<User | null>(null);
  const [goal, setGoal] = useState('');
  const [plan, setPlan] = useState<LifePlanData | null>(null);
  const [history, setHistory] = useState<GoalHistoryItem[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Persistence and Dark Mode initialization
  useEffect(() => {
    const savedUser = localStorage.getItem('lifeplan_user');
    const savedPlan = localStorage.getItem('lifeplan_data');
    const savedHistory = localStorage.getItem('lifeplan_history');
    
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      if (savedPlan) {
        setPlan(JSON.parse(savedPlan));
        setStep(AppStep.Dashboard);
      } else {
        setStep(AppStep.Welcome);
      }
    } else {
      setStep(AppStep.Login);
    }
    
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }

    const savedTheme = localStorage.getItem('lifeplan_theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    if (plan) {
      localStorage.setItem('lifeplan_data', JSON.stringify(plan));
    } else {
      localStorage.removeItem('lifeplan_data');
    }
  }, [plan]);

  useEffect(() => {
    localStorage.setItem('lifeplan_history', JSON.stringify(history));
  }, [history]);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('lifeplan_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('lifeplan_theme', 'light');
    }
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('lifeplan_user', JSON.stringify(userData));
    const savedPlan = localStorage.getItem('lifeplan_data');
    if (savedPlan) {
      setPlan(JSON.parse(savedPlan));
      setStep(AppStep.Dashboard);
    } else {
      setStep(AppStep.Welcome);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('lifeplan_user');
    localStorage.removeItem('lifeplan_data');
    setUser(null);
    setPlan(null);
    setStep(AppStep.Login);
  };

  const addToHistory = (goalTitle: string, status: 'completed' | 'abandoned') => {
    const newItem: GoalHistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      goal: goalTitle,
      date: new Date().toLocaleDateString('pt-BR'),
      status: status
    };
    setHistory(prev => [newItem, ...prev]);
  };

  const handleStart = (userGoal: string) => {
    setGoal(userGoal);
    setStep(AppStep.Setup);
  };

  const handleCreatePlan = async (deadline: string, time: number, level: string) => {
    setStep(AppStep.Generating);
    try {
      const newPlan = await generatePlan(goal, deadline, time, level);
      setPlan(newPlan);
      setStep(AppStep.Dashboard);
    } catch (error) {
      console.error("Erro ao gerar plano:", error);
      alert("Houve um erro ao gerar seu plano. Tente novamente.");
      setStep(AppStep.Setup);
    }
  };

  const updatePlan = (updatedPlan: LifePlanData) => {
    setPlan(updatedPlan);
  };

  const resetApp = (isAbandon = true) => {
    if (plan && isAbandon) {
      addToHistory(plan.goal, 'abandoned');
    }
    setPlan(null);
    setStep(AppStep.Welcome);
  };

  const handleFinishGoal = () => {
    if (plan) {
      addToHistory(plan.goal, 'completed');
    }
    setStep(AppStep.Feedback);
  };

  const handleFeedbackResponse = (worked: boolean) => {
    setStep(worked ? AppStep.ResultSuccess : AppStep.ResultFailure);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-xl mx-auto px-6 py-12">
        <header className="mb-12 flex justify-between items-center">
          <button 
            onClick={() => {
              if (user) setStep(plan ? AppStep.Dashboard : AppStep.Welcome);
            }}
            className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 to-emerald-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            LifePlan
          </button>
          <div className="flex items-center gap-2">
            {user && (
              <button 
                onClick={() => setStep(AppStep.History)}
                className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:scale-110 active:scale-95 transition-all"
                aria-label="Ver histórico"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:scale-110 active:scale-95 transition-all"
              aria-label="Alternar tema"
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
            {user && (
              <button 
                onClick={() => confirm("Deseja sair?") && handleLogout()}
                className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:scale-110 active:scale-95 transition-all"
                aria-label="Sair"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            )}
          </div>
        </header>

        <main className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {step === AppStep.Login && <LoginScreen onLogin={handleLogin} />}
          {step === AppStep.Welcome && <WelcomeScreen onStart={handleStart} />}
          {step === AppStep.Setup && <SetupScreen onConfirm={handleCreatePlan} />}
          {step === AppStep.Generating && <GeneratingScreen />}
          {step === AppStep.Dashboard && plan && (
            <DashboardScreen plan={plan} onUpdate={updatePlan} onReset={() => resetApp(true)} onFinish={handleFinishGoal} />
          )}
          {step === AppStep.Feedback && <FeedbackScreen onResponse={handleFeedbackResponse} />}
          {(step === AppStep.ResultSuccess || step === AppStep.ResultFailure) && (
            <ResultScreen success={step === AppStep.ResultSuccess} onReset={() => resetApp(false)} />
          )}
          {step === AppStep.History && (
            <HistoryScreen history={history} onBack={() => setStep(plan ? AppStep.Dashboard : AppStep.Welcome)} />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
