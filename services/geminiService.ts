
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { LifePlanData, Task } from "../types";

export const generatePlan = async (
  goal: string,
  deadline: string,
  timeAvailable: number,
  level: string
): Promise<LifePlanData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Atue como um especialista em produtividade e planejamento. Transforme esta meta em um plano de ação detalhado: "${goal}". 

Configurações:
- Prazo: ${deadline}
- Tempo disponível por dia: ${timeAvailable} minutos
- Nível de experiência: ${level}

REGRAS CRÍTICAS PARA AS MICRO-TAREFAS:
1. ATOMICIDADE: Cada tarefa deve ser uma ação única e indivisível.
2. CLAREZA: Use verbos de ação claros no início.
3. GRANULARIDADE: Máximo 30 minutos por tarefa.
4. RESPEITO AO TEMPO: Soma total <= ${timeAvailable} minutos/dia.
5. HORÁRIOS: Sugira um "startTime" (HH:mm) para cada tarefa, distribuindo-as logicamente ao longo do dia útil (começando por volta das 09:00).

Estruture em macro-etapas (fases) e gere micro-tarefas para os primeiros 7 dias.`,
    config: {
      thinkingConfig: { thinkingBudget: 32768 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          macroSteps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                tasks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      durationMinutes: { type: Type.NUMBER },
                      date: { type: Type.STRING, description: "YYYY-MM-DD" },
                      startTime: { type: Type.STRING, description: "HH:mm" }
                    },
                    required: ["title", "description", "durationMinutes", "date", "startTime"]
                  }
                }
              },
              required: ["title", "tasks"]
            }
          }
        },
        required: ["category", "macroSteps"]
      }
    }
  });

  const rawData = JSON.parse(response.text || "{}");
  
  return {
    goal,
    category: rawData.category,
    macroSteps: rawData.macroSteps.map((step: any) => ({
      ...step,
      tasks: step.tasks.map((t: any) => ({ 
        ...t, 
        id: Math.random().toString(36).substr(2, 9), 
        completed: false 
      }))
    })),
    deadline,
    timeAvailablePerDay: timeAvailable,
    level: level as any,
    progress: 0,
    createdAt: new Date().toISOString()
  };
};

export const generateTaskDetail = async (task: Task, goal: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Explique detalhadamente como realizar esta tarefa: "${task.title}" (${task.description}). Esta tarefa faz parte da meta maior: "${goal}". Forneça um guia passo a passo conciso e prático.`
  });
  return response.text || "Não foi possível gerar detalhes.";
};

export const generateTaskVideo = async (task: Task): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: `Um tutorial visual curto e motivacional sobre: ${task.title}. Mostre o ambiente de trabalho ideal e as primeiras ações sendo executadas de forma profissional e clara. Estilo cinematográfico limpo.`,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });
  
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({operation: operation});
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  return `${downloadLink}&key=${process.env.API_KEY}`;
};

export const adjustPlan = async (
  currentPlan: LifePlanData,
  missedTasks: Task[]
): Promise<LifePlanData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `O usuário não completou estas tarefas: ${JSON.stringify(missedTasks)}. 
    Reorganize o plano original para diluir o atraso sem causar sobrecarga cognitiva. 
    Mantenha o limite diário de ${currentPlan.timeAvailablePerDay} minutos.
    Priorize o essencial e ajuste os horários de início. Plano original: ${JSON.stringify(currentPlan)}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          macroSteps: {
             type: Type.ARRAY,
             items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  tasks: { 
                    type: Type.ARRAY, 
                    items: { 
                      type: Type.OBJECT, 
                      properties: { 
                        title: { type: Type.STRING }, 
                        description: { type: Type.STRING }, 
                        durationMinutes: { type: Type.NUMBER }, 
                        date: { type: Type.STRING },
                        startTime: { type: Type.STRING }
                      } 
                    } 
                  }
                }
             }
          }
        }
      }
    }
  });

  const updatedData = JSON.parse(response.text || "{}");
  return {
    ...currentPlan,
    macroSteps: updatedData.macroSteps.map((step: any) => ({
      ...step,
      tasks: step.tasks.map((t: any) => ({ ...t, id: Math.random().toString(36).substr(2, 9), completed: false }))
    }))
  };
};

export const getGroundingInfo = async (query: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Encontre recursos e informações atualizadas sobre: ${query}`,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });
  return {
    text: response.text,
    links: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => chunk.web) || []
  };
};
