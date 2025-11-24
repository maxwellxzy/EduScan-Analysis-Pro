import { Question, AnalysisTags, StudentAnswer, ExamData, StudentResult } from '../types';

const DELAY_MS = 1500; // Simulate network latency

// Helper to simulate delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to generate a dummy base64 image (1x1 pixel transparent gif) for mock purposes
// In a real scenario, this would be the actual image data from the backend
const mockBase64Image = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
const randomUrl = (seed: number) => `https://picsum.photos/800/200?random=${seed}`;

// Mock Data Generators
const mockChapters = ["Algebra Ch.3 - Quadratic Functions", "Geometry Ch.5 - Triangles", "Calculus Ch.1 - Limits", "Statistics Ch.2 - Probability Distributions"];
const mockKnowledge = ["Pythagorean Theorem", "Derivatives", "Linear Equations", "Probability", "Vector Spaces", "Function Mapping"];
const mockMethods = ["Deductive Reasoning", "Calculation", "Graph Analysis", "Modeling", "Substitution"];
const mockCompetencies = ["Logical Thinking", "Mathematical Abstraction", "Data Analysis", "Critical Solving"];

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
    contentMd: `**Question ${i + 1}:** A sample mathematical problem extracted from the uploaded exam paper. Solve for $x$ given the constraints in figure ${i+1}.`,
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
    studentAnswerMd: `Student answer for Q${q.number}: The derivation implies that $f'(x) = 2x$. Therefore...`,
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
      ? "Great job! The logic follows the standard derivation perfectly." 
      : "There seems to be a misunderstanding in the second step of the equation.",
    masteredPoints: isCorrect ? knowledge : [],
    missingPoints: isCorrect ? [] : knowledge,
    masteredMethods: isCorrect ? methods : [],
    missingMethods: isCorrect ? [] : methods
  };
};