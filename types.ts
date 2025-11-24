
export interface AnalysisTags {
  knowledgePoints: string[];
  methods: string[];
  competencies: string[];
  chapter: string;
  difficulty: number; // 1-10
}

export interface Question {
  id: string;
  number: number;
  imageUrl: string;
  contentMd: string;
  analysis: AnalysisTags | null; // Null while analyzing
  isAnalyzing: boolean;
  isVerified?: boolean;
}

export interface StudentAnswer {
  questionId: string;
  studentAnswerMd: string;
  imageUrl: string; // Cutout of student answer
  isCorrect: boolean;
  score: number;
  maxScore: number;
  feedback: string;
  missingPoints: string[]; // Knowledge points missed
  masteredPoints: string[]; // Knowledge points mastered
  missingMethods: string[]; // Methods missed
  masteredMethods: string[]; // Methods mastered
  isAnalyzing: boolean;
}

export interface ExamData {
  id: string;
  title: string;
  questions: Question[];
  totalDifficulty: number;
  summary: string;
}

export interface StudentResult {
  studentName: string;
  answers: StudentAnswer[];
  overallMastery: string;
  overallGaps: string[];
}
