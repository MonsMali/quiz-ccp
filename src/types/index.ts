export type QuestionType = 'truefalse' | 'mc';

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  // Index-aligned with Redis storage. For truefalse: index 0 = Falso, index 1 = Verdadeiro.
  options: string[];
  correctIndex: number;
  why: string;
}

// Body sent from the participant client to /api/submit
export interface SubmitBody {
  clientId: string;
  answers: { questionId: string; selectedIndex: number }[];
}

export interface SubmitResponse {
  success: boolean;
  alreadySubmitted?: boolean;
  score: number;
  total: number;
  perQuestion: { id: string; correct: boolean }[];
  error?: string;
}

// Aggregated per-question results for the admin dashboard
export interface QuestionResults {
  id: string;
  prompt: string;
  type: QuestionType;
  options: string[];
  // counts[i] = number of votes for option i (index-aligned with options)
  counts: number[];
  correctIndex: number;
}

export interface ResultsResponse {
  submissions: number;
  average: number;
  questions: QuestionResults[];
}
