
export interface Task {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  completed: boolean;
  date: string;
  startTime?: string; // Formato HH:mm
}

export interface MacroStep {
  title: string;
  tasks: Task[];
}

export interface LifePlanData {
  goal: string;
  category: string;
  macroSteps: MacroStep[];
  deadline: string;
  timeAvailablePerDay: number;
  level: 'iniciante' | 'intermediário' | 'avançado';
  progress: number;
  createdAt: string;
}

export interface GoalHistoryItem {
  id: string;
  goal: string;
  date: string;
  status: 'completed' | 'abandoned';
}

export interface User {
  id: string;
  email: string;
  provider: 'google' | 'apple' | 'email';
  notificationsEnabled?: boolean;
}

export enum AppStep {
  Login = 'LOGIN',
  Welcome = 'WELCOME',
  Setup = 'SETUP',
  Generating = 'GENERATING',
  Dashboard = 'DASHBOARD',
  Feedback = 'FEEDBACK',
  ResultSuccess = 'RESULT_SUCCESS',
  ResultFailure = 'RESULT_FAILURE',
  History = 'HISTORY'
}
