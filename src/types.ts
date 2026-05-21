export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Confidence = 'Low' | 'Medium' | 'High';

export interface Question {
  id: string;
  question: string;
  answer: string;
  topic: string;
  difficulty: Difficulty;
  confidence: Confidence;
  createdAt: string;
  updatedAt: string;
}

export interface FilterState {
  searchQuery: string;
  topic: string;
  difficulty: 'All' | Difficulty;
  confidence: 'All' | Confidence;
  sortBy: 'newest' | 'oldest' | 'difficulty' | 'confidence';
}

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastMessage {
  id: string;
  text: string;
  type: ToastType;
}

export interface DashboardStatsMetrics {
  total: number;
  difficultyBreakdown: Record<Difficulty, number>;
  confidenceBreakdown: Record<Confidence, number>;
  weakTopicsCount: number;
  readinessScore: number;
  topicsDistribution: Record<string, number>;
}
