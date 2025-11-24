import React, { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { ExamAnalysisView } from './components/ExamAnalysisView';
import { StudentAnalysisView } from './components/StudentAnalysisView';
import { BatchStudentAnalysisView } from './components/BatchStudentAnalysisView';
import { OverallSummary } from './components/OverallSummary';
import { Question, StudentAnswer, StudentResult } from './types';
import { 
  splitExamApi, 
  analyzeQuestionApi, 
  splitStudentExamApi, 
  analyzeStudentAnswerApi,
  batchProcessStudentExamsApi
} from './services/mockApi';

const App = () => {
  // State for Exam
  const [examFile, setExamFile] = useState<File | null>(null);
  const [isExamSplitting, setIsExamSplitting] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);

  // State for Student (Single Mode)
  const [studentFile, setStudentFile] = useState<File | null>(null);
  const [isStudentSplitting, setIsStudentSplitting] = useState(false);
  const [studentAnswers, setStudentAnswers] = useState<StudentAnswer[]>([]);

  // State for Student (Batch Mode)
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchResults, setBatchResults] = useState<StudentResult[]>([]);

  // 1. Handle Exam Upload & Split
  const handleExamUpload = async (file: File) => {
    setExamFile(file);
    setIsExamSplitting(true);
    setQuestions([]);
    setStudentFile(null);
    setStudentAnswers([]);
    setBatchResults([]);
    setIsBatchMode(false);

    try {
      // Step 1.1: Split exam into questions (Mock API)
      const rawQuestions = await splitExamApi(file);
      
      // Initialize questions in state
      const initialQuestions = rawQuestions.map(q => ({
        ...q,
        analysis: null,
        isAnalyzing: true
      })) as Question[];
      
      setQuestions(initialQuestions);
      setIsExamSplitting(false);

      // Step 1.2: Trigger Async Analysis for each question
      initialQuestions.forEach(async (q) => {
        try {
          const analysis = await analyzeQuestionApi(q.id, q.contentMd);
          setQuestions(prev => prev.map(item => 
            item.id === q.id 
              ? { ...item, analysis, isAnalyzing: false } 
              : item
          ));
        } catch (error) {
          console.error(`Failed to analyze question ${q.id}`, error);
          setQuestions(prev => prev.map(item => 
            item.id === q.id ? { ...item, isAnalyzing: false } : item
          ));
        }
      });

    } catch (error) {
      console.error("Failed to split exam", error);
      setIsExamSplitting(false);
    }
  };

  const handleUpdateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(prev => prev.map(q =>
      q.id === id ? { ...q, ...updates } : q
    ));
  };

  // 2. Handle Single Student Upload & Analysis
  const handleStudentUpload = async (file: File) => {
    if (questions.length === 0) return;
    
    setStudentFile(file);
    setIsStudentSplitting(true);
    setStudentAnswers([]);
    setIsBatchMode(false);
    setBatchResults([]);

    try {
      // Step 2.1: Split student answers
      const rawAnswers = await splitStudentExamApi(file, questions);
      
      const initialAnswers = rawAnswers.map(a => ({
        ...a,
        isCorrect: false,
        score: 0,
        maxScore: 10,
        feedback: "",
        missingPoints: [],
        masteredPoints: [],
        missingMethods: [],
        masteredMethods: [],
        isAnalyzing: true
      })) as StudentAnswer[];

      setStudentAnswers(initialAnswers);
      setIsStudentSplitting(false);

      // Step 2.2: Analyze each answer against the question
      initialAnswers.forEach(async (ans) => {
        try {
          const relatedQuestion = questions.find(q => q.id === ans.questionId);
          if (relatedQuestion) {
             const result = await analyzeStudentAnswerApi(relatedQuestion, ans.studentAnswerMd);
             setStudentAnswers(prev => prev.map(item => 
               item.questionId === ans.questionId 
                 ? { ...item, ...result, isAnalyzing: false } 
                 : item
             ));
          }
        } catch (error) {
          console.error("Failed to analyze answer", error);
        }
      });

    } catch (error) {
      console.error("Failed to process student exam", error);
      setIsStudentSplitting(false);
    }
  };

  // 3. Handle Batch Upload
  const handleBatchUpload = async (files: FileList) => {
    if (questions.length === 0) return;

    setIsStudentSplitting(true);
    setIsBatchMode(true);
    setStudentAnswers([]); // Clear single mode data
    setBatchResults([]);

    try {
        const results = await batchProcessStudentExamsApi(files, questions);
        setBatchResults(results);
    } catch (error) {
        console.error("Batch processing failed", error);
    } finally {
        setIsStudentSplitting(false);
    }
  };

  const handleUpdateStudentAnswer = (questionId: string, updates: Partial<StudentAnswer>) => {
    setStudentAnswers(prev => prev.map(a =>
      a.questionId === questionId ? { ...a, ...updates } : a
    ));
  };

  const handleUpdateBatchAnswer = (studentIndex: number, questionId: string, updates: Partial<StudentAnswer>) => {
    setBatchResults(prev => prev.map((student, idx) => {
      if (idx !== studentIndex) return student;
      
      const newAnswers = student.answers.map(a => 
        a.questionId === questionId ? { ...a, ...updates } : a
      );
      
      return {
        ...student,
        answers: newAnswers
      };
    }));
  };

  // Check if all exam analysis is done to enable student upload
  const isExamFullyAnalyzed = questions.length > 0 && !isExamSplitting;

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">E</div>
             <h1 className="text-xl font-bold text-slate-900 tracking-tight">EduScan 智能阅卷分析系统</h1>
          </div>
          <div className="text-sm text-slate-500">
            Intelligent Assessment System
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Step 1: Teacher Upload */}
        <section>
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">1</div>
            <h2 className="text-lg font-semibold text-slate-800">上传原始试卷</h2>
          </div>
          
          <div className="space-y-6">
            <div className="w-full">
               <FileUpload 
                 label="拖拽试卷 PDF/图片 到此处" 
                 subLabel="请确保包含标准答案" 
                 onFileSelect={handleExamUpload}
                 variant="compact"
               />
            </div>
            
            <div className="w-full">
               {isExamSplitting ? (
                 <div className="h-64 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 p-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
                    <p className="text-slate-600">AI正在分割试卷...</p>
                 </div>
               ) : questions.length > 0 ? (
                 <OverallSummary questions={questions} />
               ) : null}
            </div>
          </div>
        </section>

        {/* Step 2: Analysis Display */}
        {questions.length > 0 && (
          <section>
             <ExamAnalysisView questions={questions} onUpdateQuestion={handleUpdateQuestion} />
          </section>
        )}

        {/* Step 3: Student Upload (Single + Batch) */}
        <section className={`transition-opacity duration-500 ${isExamFullyAnalyzed ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          <div className="flex items-center space-x-4 mb-6 mt-12 border-t pt-8 border-slate-200">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold">2</div>
            <h2 className="text-lg font-semibold text-slate-800">上传学生答卷</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
             <div className="md:col-span-2 flex gap-4">
                {/* Single Upload */}
                <div className="flex-1">
                   <FileUpload 
                     label="单份上传" 
                     subLabel="拖拽单个学生答卷" 
                     onFileSelect={handleStudentUpload}
                     disabled={!isExamFullyAnalyzed}
                   />
                </div>
                {/* Batch Upload */}
                <div className="flex-1">
                   <FileUpload 
                     label="批量上传" 
                     subLabel="拖拽多个学生答卷 (批量)" 
                     onFileSelect={() => {}} // Not used when multiple is true
                     onMultipleFilesSelect={handleBatchUpload}
                     disabled={!isExamFullyAnalyzed}
                     multiple={true}
                   />
                </div>
             </div>

             <div className="md:col-span-2 flex items-center">
                {isStudentSplitting && (
                   <div className="flex items-center space-x-3 text-purple-600 bg-purple-50 px-4 py-2 rounded-lg ml-4">
                      <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full"></div>
                      <span>
                          {isBatchMode ? '正在批量处理学生答卷...' : '正在分析学生笔迹与逻辑...'}
                      </span>
                   </div>
                )}
             </div>
          </div>
        </section>

        {/* Step 4: Student Analysis Display (Conditional) */}
        {!isStudentSplitting && (
            <>
                {/* Case A: Single Student View */}
                {!isBatchMode && studentAnswers.length > 0 && (
                <section>
                    <StudentAnalysisView 
                        questions={questions} 
                        answers={studentAnswers} 
                        studentName="张三 (模拟数据)"
                        examTitle={examFile?.name.replace(/\.[^/.]+$/, "")}
                        onUpdateAnswer={handleUpdateStudentAnswer}
                    />
                </section>
                )}

                {/* Case B: Batch Student View */}
                {isBatchMode && batchResults.length > 0 && (
                <section>
                    <BatchStudentAnalysisView
                        results={batchResults}
                        questions={questions}
                        examTitle={examFile?.name.replace(/\.[^/.]+$/, "") || "批量作业"}
                        onUpdateAnswer={handleUpdateBatchAnswer}
                    />
                </section>
                )}
            </>
        )}

      </main>
    </div>
  );
};

export default App;