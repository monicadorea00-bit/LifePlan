
import React, { useMemo, useState } from 'react';
import { LifePlanData, Task } from '../types';
import { Button } from '../components/Button';
import { adjustPlan, generateTaskDetail, generateTaskVideo } from '../services/geminiService';

// Define AIStudio interface to satisfy identical modifier requirements
interface AIStudio {
  hasSelectedApiKey(): Promise<boolean>;
  openSelectKey(): Promise<void>;
}

declare global {
  interface Window {
    // Using readonly and ensuring identical modifiers with the environment's internal definition
    readonly aistudio: AIStudio;
  }
}

interface DashboardScreenProps {
  plan: LifePlanData;
  onUpdate: (plan: LifePlanData) => void;
  onReset: () => void;
  onFinish: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ plan, onUpdate, onReset, onFinish }) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskGuide, setTaskGuide] = useState<{ text?: string, video?: string } | null>(null);
  const [loadingGuide, setLoadingGuide] = useState(false);
  const [guideType, setGuideType] = useState<'text' | 'video' | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
  
  const todayTasks = useMemo(() => {
    const allTasks: Task[] = [];
    plan.macroSteps.forEach(step => {
      step.tasks.forEach(task => {
        if (task.date === today) {
          allTasks.push(task);
        }
      });
    });
    
    // Sort tasks by startTime
    allTasks.sort((a, b) => {
      const timeA = a.startTime ? a.startTime.split(':').map(Number).reduce((h, m) => h * 60 + m) : 9999;
      const timeB = b.startTime ? b.startTime.split(':').map(Number).reduce((h, m) => h * 60 + m) : 9999;
      return timeA - timeB;
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

  const progress = useMemo(() => {
    const total = plan.macroSteps.reduce((acc, step) => acc + step.tasks.length, 0);
    const completed = plan.macroSteps.reduce((acc, step) => acc + step.tasks.filter(t => t.completed).length, 0);
    return Math.round((completed / total) * 100);
  }, [plan]);

  const handleToggleTask = (taskId: string) => {
    const newSteps = plan.macroSteps.map(step => ({
      ...step,
      tasks: step.tasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    }));
    onUpdate({ ...plan, macroSteps: newSteps });
    setSelectedTask(null);
    setTaskGuide(null);
    setGuideType(null);
  };

  const handleShowGuide = async (type: 'text' | 'video') => {
    if (!selectedTask) return;
    
    if (type === 'video') {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        // Trigger key selection and proceed immediately to avoid race condition as per guidelines
        await window.aistudio.openSelectKey();
      }
    }

    setLoadingGuide(true);
    setGuideType(type);
    try {
      if (type === 'text') {
        const text = await generateTaskDetail(selectedTask, plan.goal);
        setTaskGuide({ text });
      } else {
        const videoUrl = await generateTaskVideo(selectedTask);
        setTaskGuide({ video: videoUrl });
      }
    } catch (e: any) {
      console.error(e);
      // Handle missing entity error by prompting user to select a key again
      if (e?.message?.includes("Requested entity was not found.")) {
        alert("Sua chave de API parece ser inválida ou não pertence a um projeto com faturamento ativado. Por favor, selecione novamente.");
        await window.aistudio.openSelectKey();
      } else {
        alert("Erro ao gerar guia. Tente novamente.");
      }
      setLoadingGuide(false);
      setGuideType(null);
    } finally {
      setLoadingGuide(false);
    }
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
    <div className="space-y-8 pb-12">
      {/* Goal Header */}
      <div className="p-6 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-200 dark:shadow-none">
        <div className="flex justify-between items-start mb-4">
          <span className="text-xs font-bold uppercase tracking-widest opacity-80">{plan.category}</span>
          <button 
            onClick={() => confirm("Abandonar meta atual?") && onReset()} 
            className="opacity-60 hover:opacity-100 transition-opacity"
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
            Ajustar Plano
          </button>
        </div>

        <div className="space-y-3">
          {todayTasks.map((task) => {
            const taskMinutes = task.startTime ? task.startTime.split(':').map(Number).reduce((h, m) => h * 60 + m) : 0;
            const isOverdue = !task.completed && taskMinutes > 0 && currentTimeMinutes > taskMinutes;
            const isSoon = !task.completed && taskMinutes > 0 && !isOverdue && (taskMinutes - currentTimeMinutes) <= 30;

            return (
              <div 
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                  task.completed 
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' 
                    : isOverdue
                    ? 'border-rose-300 bg-rose-50 dark:bg-rose-950/10'
                    : isSoon
                    ? 'border-amber-300 bg-amber-50 dark:bg-amber-950/10'
                    : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-600'}`}>
                  {task.completed && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className={`font-bold mb-1 ${task.completed ? 'text-emerald-700 dark:text-emerald-400 line-through' : 'text-slate-900 dark:text-white'}`}>
                      {task.title}
                    </h4>
                    {task.startTime && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        task.completed ? 'text-emerald-400' : isOverdue ? 'text-rose-500' : isSoon ? 'text-amber-500' : 'text-slate-400'
                      }`}>
                        {task.startTime}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${task.completed ? 'text-emerald-600/70 dark:text-emerald-400/50' : 'text-slate-500 dark:text-slate-400'}`}>
                    {task.description}
                  </p>
                  {isOverdue && !task.completed && (
                    <span className="text-[10px] text-rose-500 font-bold uppercase tracking-widest mt-2 block">Tarefa Atrasada ⚠️</span>
                  )}
                </div>
                {!task.completed && (
                  <div className={`shrink-0 ${isOverdue ? 'text-rose-500' : 'text-indigo-500'} animate-pulse`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
          
          {todayTasks.length === 0 && progress < 100 && (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <p className="text-slate-400">Nenhuma tarefa pendente para hoje.</p>
            </div>
          )}
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 space-y-6 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start sticky top-0 bg-white dark:bg-slate-900 z-10 py-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-xl">🤖</div>
                <div>
                  <h3 className="text-xl font-bold">{selectedTask.title}</h3>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">IA Assistant Guide</p>
                </div>
              </div>
              <button 
                onClick={() => { setSelectedTask(null); setTaskGuide(null); setGuideType(null); }}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border-l-4 border-indigo-500 italic text-slate-600 dark:text-slate-300">
              "Olá! Para esta tarefa agendada para às {selectedTask.startTime}, recomendo seguir este plano. Como você prefere receber as instruções?"
            </div>

            {!taskGuide && !loadingGuide && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleShowGuide('text')}
                    className="p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 flex flex-col items-center gap-3 transition-all bg-white dark:bg-slate-900 group"
                  >
                    <div className="text-4xl group-hover:scale-110 transition-transform">📄</div>
                    <span className="font-bold text-slate-700 dark:text-slate-200">Ver Plano</span>
                  </button>
                  <button 
                    onClick={() => handleShowGuide('video')}
                    className="p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 flex flex-col items-center gap-3 transition-all bg-white dark:bg-slate-900 group"
                  >
                    <div className="text-4xl group-hover:scale-110 transition-transform">🎬</div>
                    <span className="font-bold text-slate-700 dark:text-slate-200">Ver Vídeo</span>
                  </button>
                </div>
              </div>
            )}

            {loadingGuide && (
              <div className="py-12 flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-indigo-600 font-medium animate-pulse">
                  {guideType === 'video' ? 'A IA está gerando seu vídeo...' : 'Organizando as instruções...'}
                </p>
                {guideType === 'video' && (
                  <p className="text-xs text-slate-400 text-center max-w-xs">Isso pode levar até 1 minuto. Não feche esta tela.</p>
                )}
              </div>
            )}

            {taskGuide && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
                {taskGuide.text && (
                  <div className="prose dark:prose-invert max-w-none bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed shadow-inner">
                    <div className="flex items-center gap-2 mb-4 text-indigo-500 font-bold uppercase text-xs">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Seu Plano de Ação
                    </div>
                    {taskGuide.text}
                  </div>
                )}
                
                {taskGuide.video && (
                  <div className="rounded-2xl overflow-hidden aspect-video bg-black shadow-2xl relative group">
                    <video 
                      src={taskGuide.video} 
                      controls 
                      autoPlay 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-indigo-600 text-white text-[10px] px-2 py-1 rounded font-bold uppercase tracking-widest shadow-lg">
                      Gerado pela IA
                    </div>
                  </div>
                )}
                
                <div className="pt-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                  <Button 
                    onClick={() => handleToggleTask(selectedTask.id)} 
                    variant="secondary" 
                    className="w-full py-5 text-xl font-bold shadow-emerald-400/20"
                  >
                    Concluir Atividade ✅
                  </Button>
                  <p className="text-center text-[10px] text-slate-400 mt-3 uppercase tracking-widest">
                    Clique acima após finalizar a prática
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
