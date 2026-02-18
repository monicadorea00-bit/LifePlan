
import React, { useMemo } from 'react';
import { LifePlanData, Task } from '../types';
import { Button } from '../components/Button';
import { adjustPlan } from '../services/geminiService';

interface DashboardScreenProps {
  plan: LifePlanData;
  onUpdate: (plan: LifePlanData) => void;
  onReset: () => void;
  onFinish: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ plan, onUpdate, onReset, onFinish }) => {
  const today = new Date().toISOString().split('T')[0];
  
  const todayTasks = useMemo(() => {
    const allTasks: Task[] = [];
    plan.macroSteps.forEach(step => {
      step.tasks.forEach(task => {
        if (task.date === today) {
          allTasks.push(task);
        }
      });
    });
    if (allTasks.length === 0) {
      plan.macroSteps.forEach(step => {
        step.tasks.forEach(task => {
          if (!task.completed && allTasks.length < 3) allTasks.push(task);
        });
      });
    }
    return allTasks;
  }, [plan, today]);

  const totalTasks = useMemo(() => {
    return plan.macroSteps.reduce((acc, step) => acc + step.tasks.length, 0);
  }, [plan]);

  const completedTasksCount = useMemo(() => {
    return plan.macroSteps.reduce((acc, step) => acc + step.tasks.filter(t => t.completed).length, 0);
  }, [plan]);

  const progress = Math.round((completedTasksCount / totalTasks) * 100);

  const toggleTask = (taskId: string) => {
    const newSteps = plan.macroSteps.map(step => ({
      ...step,
      tasks: step.tasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    }));
    onUpdate({ ...plan, macroSteps: newSteps });
  };

  const handleAdjust = async () => {
    const missed = todayTasks.filter(t => !t.completed);
    if (missed.length === 0) return alert("Parabéns! Você está em dia.");
    
    if (confirm("Quer que a IA reorganize seu plano para evitar sobrecarga?")) {
      try {
        const adjusted = await adjustPlan(plan, missed);
        onUpdate(adjusted);
      } catch (e) {
        alert("Erro ao ajustar plano.");
      }
    }
  };

  const estimatedTotalTime = todayTasks.reduce((acc, t) => acc + t.durationMinutes, 0);

  return (
    <div className="space-y-8">
      {/* Goal Header */}
      <div className="p-6 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-200 dark:shadow-none">
        <div className="flex justify-between items-start mb-4">
          <span className="text-xs font-bold uppercase tracking-widest opacity-80">{plan.category}</span>
          <button 
            onClick={() => confirm("Abandonar meta atual? Ela será salva no seu histórico como abandonada.") && onReset()} 
            className="opacity-60 hover:opacity-100 transition-opacity"
            title="Resetar Meta"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <h2 className="text-2xl font-bold mb-6">{plan.goal}</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm mb-1">
            <span>Progresso Geral</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-white h-full transition-all duration-1000" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {progress === 100 && (
        <Button onClick={onFinish} variant="secondary" className="w-full py-4 text-lg">
          Finalizar Meta 🎉
        </Button>
      )}

      {/* Today's Tasks */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-xl font-bold">Hoje você deve fazer:</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total estimado: {estimatedTotalTime} min</p>
          </div>
          <button 
            onClick={handleAdjust}
            className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold hover:underline"
          >
            Atrasado? Ajustar
          </button>
        </div>

        <div className="space-y-3">
          {todayTasks.map((task) => (
            <div 
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${task.completed ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'}`}
            >
              <div className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-600'}`}>
                {task.completed && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h4 className={`font-bold mb-1 ${task.completed ? 'text-emerald-700 dark:text-emerald-400 line-through' : 'text-slate-900 dark:text-white'}`}>
                  {task.title}
                </h4>
                <p className={`text-sm ${task.completed ? 'text-emerald-600/70 dark:text-emerald-400/50' : 'text-slate-500 dark:text-slate-400'}`}>
                  {task.description}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[10px] px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-bold tracking-wider">
                    {task.durationMinutes} min
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {todayTasks.length === 0 && progress < 100 && (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <p className="text-slate-400">Nenhuma tarefa pendente para hoje.</p>
            </div>
          )}
        </div>
      </div>

      {progress < 100 && (
        <div className="pt-8 flex flex-col items-center gap-4 opacity-40 hover:opacity-100 transition-opacity">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest text-center">
            “Hoje, isso é tudo que você precisa fazer.”
          </p>
          <div className="w-1 h-8 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
        </div>
      )}
    </div>
  );
};
