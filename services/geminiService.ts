
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { LifePlanData, Task } from "../types";

const API_KEY = process.env.API_KEY || "";

export const generatePlan = async (
  goal: string,
  deadline: string,
  timeAvailable: number,
  level: string
): Promise<LifePlanData> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Atue como um especialista em produtividade e planejamento. Transforme esta meta em um plano de ação detalhado: "${goal}". 

Configurações:
- Prazo: ${deadline}
- Tempo disponível por dia: ${timeAvailable} minutos
- Nível de experiência: ${level}

REGRAS CRÍTICAS PARA AS MICRO-TAREFAS:
1. ATOMICIDADE: Cada tarefa deve ser uma ação única e indivisível (ex: "Configurar o ambiente" -> mude para "Instalar Python" e "Abrir o VS Code").
2. CLAREZA: Use verbos de ação claros no início (ex: Escrever, Ler, Pesquisar, Praticar).
3. GRANULARIDADE: Se uma ação levar mais de 30 minutos, divida-a. 
4. RESPEITO AO TEMPO: A soma do tempo de todas as micro-tarefas de um dia deve ser EXATAMENTE ou MENOR que ${timeAvailable} minutos.
5. ADAPTAÇÃO: O conteúdo deve ser condizente com o nível "${level}".

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
                      date: { type: Type.STRING, description: "YYYY-MM-DD" }
                    },
                    required: ["title", "description", "durationMinutes", "date"]
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

export const adjustPlan = async (
  currentPlan: LifePlanData,
  missedTasks: Task[]
): Promise<LifePlanData> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `O usuário não completou estas tarefas: ${JSON.stringify(missedTasks)}. 
    Reorganize o plano original para diluir o atraso sem causar sobrecarga cognitiva. 
    Mantenha o limite diário de ${currentPlan.timeAvailablePerDay} minutos.
    Priorize o essencial. Plano original: ${JSON.stringify(currentPlan)}.`,
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
                        date: { type: Type.STRING } 
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
  const ai = new GoogleGenAI({ apiKey: API_KEY });
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
