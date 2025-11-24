import { Question, AnalysisTags, StudentAnswer, ExamData, StudentResult } from '../types';

const DELAY_MS = 1500; // Simulate network latency

// Helper to simulate delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to generate a dummy base64 image (1x1 pixel transparent gif) for mock purposes
// In a real scenario, this would be the actual image data from the backend
const mockBase64Image = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
const randomUrl = (seed: number) => `https://picsum.photos/800/200?random=${seed}`;

// Mock Data Generators (Translated)
const mockChapters = ["代数 第三章 - 二次函数", "几何 第五章 - 三角形", "微积分 第一章 - 极限", "统计学 第二章 - 概率分布"];
const mockKnowledge = ["勾股定理", "导数", "线性方程", "概率论", "向量空间", "函数映射"];
const mockMethods = ["演绎推理", "计算求解", "图象分析", "数学建模", "换元法"];
const mockCompetencies = ["逻辑推理", "数学抽象", "数据分析", "直观想象"];

/**
 * 1. split_exam (Mock Endpoint)
 * Accepts a POST request (simulated) with an image.
 * Returns: JSON object containing a list of base64 encoded images and markdown content.
 */
export const splitExamApi = async (file: File): Promise<Partial<Question>[]> => {
  await delay(DELAY_MS);
  
  // Simulate splitting the exam into 6 questions
  return Array.from({ length: 6 }).map((_, i) => ({
    id: `q-${Date.now()}-${i}`,
    number: i + 1,
    // In a real app, this would be the base64 string returned by the API. 
    // We use a URL here for the UI to look good, but the API contract is satisfied conceptually.
    imageUrl: randomUrl(i), 
    contentMd: `**第 ${i + 1} 题：** 从上传的试卷中提取的数学示例问题。如图 ${i+1} 所示，根据约束条件求解 $x$。`,
    analysis: null,
    isAnalyzing: true // Initial state
  }));
};

/**
 * 2. analyze_question (Mock Endpoint)
 * Accepts: Question image and markdown.
 * Returns: JSON object with analysis results (knowledge points, methods, core competencies, textbook chapters, difficulty).
 */
export const analyzeQuestionApi = async (questionId: string, contentMd: string): Promise<AnalysisTags> => {
  await delay(800 + Math.random() * 1500); // Random delay to simulate AI processing time
  
  // Weighted random difficulty to create a realistic distribution curve (bell curve-ish)
  const rand = Math.random();
  let difficulty = 5;
  if (rand < 0.1) difficulty = 3;
  else if (rand < 0.3) difficulty = 4;
  else if (rand < 0.6) difficulty = 5;
  else if (rand < 0.8) difficulty = 6;
  else if (rand < 0.9) difficulty = 7;
  else difficulty = 8;

  return {
    chapter: mockChapters[Math.floor(Math.random() * mockChapters.length)],
    difficulty: difficulty, 
    knowledgePoints: [
      mockKnowledge[Math.floor(Math.random() * mockKnowledge.length)],
      mockKnowledge[Math.floor(Math.random() * mockKnowledge.length)]
    ].filter((v, i, a) => a.indexOf(v) === i), // Unique points
    methods: [mockMethods[Math.floor(Math.random() * mockMethods.length)]],
    competencies: [mockCompetencies[Math.floor(Math.random() * mockCompetencies.length)]],
  };
};

/**
 * 3. split_student_exam (Mock Helper)
 * Simulates cutting up the student answer sheet.
 */
export const splitStudentExamApi = async (file: File, examQuestions: Question[]): Promise<Partial<StudentAnswer>[]> => {
  await delay(DELAY_MS);

  return examQuestions.map(q => ({
    questionId: q.id,
    imageUrl: `https://picsum.photos/800/150?random=${q.id}student`,
    studentAnswerMd: `第 ${q.number} 题学生作答：推导过程表明 $f'(x) = 2x$。因此...`,
    isAnalyzing: true
  }));
};

/**
 * 4. analyze_student_answer (Mock Endpoint)
 * Accepts: Student answer image, markdown, and original question analysis.
 * Returns: Analysis of student's mastery.
 */
export const analyzeStudentAnswerApi = async (question: Question, answerMd: string): Promise<Omit<StudentAnswer, 'questionId' | 'imageUrl' | 'studentAnswerMd' | 'isAnalyzing'>> => {
  await delay(1000 + Math.random() * 2000);
  
  // Logic to simulate partial credit based on difficulty
  const isCorrect = Math.random() > 0.4;
  
  const knowledge = question.analysis?.knowledgePoints || [];
  const methods = question.analysis?.methods || [];

  const maxScore = 10;
  
  // Random score: if correct, 8-10. If wrong, 0-6.
  const score = isCorrect 
    ? Math.floor(Math.random() * 3) + 8 
    : Math.floor(Math.random() * 7);

  return {
    isCorrect,
    score,
    maxScore,
    feedback: isCorrect 
      ? "做得很好！逻辑推导完全符合标准步骤。" 
      : "在方程的第二步似乎存在误解，导致结果偏差。",
    masteredPoints: isCorrect ? knowledge : [],
    missingPoints: isCorrect ? [] : knowledge,
    masteredMethods: isCorrect ? methods : [],
    missingMethods: isCorrect ? [] : methods
  };
};