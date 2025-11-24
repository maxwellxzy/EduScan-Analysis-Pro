import React from 'react';
import { Question } from '../types';
import { BookOpenIcon } from './Icons';
import { Spinner } from './Spinner';

interface ExamAnalysisViewProps {
  questions: Question[];
}

export const ExamAnalysisView: React.FC<ExamAnalysisViewProps> = ({ questions }) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Exam Analysis Result</h2>
        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
          {questions.length} Questions Processed
        </span>
      </div>

      <div className="grid gap-6">
        {questions.map((q) => (
          <div key={q.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row transition-all hover:shadow-md">
            {/* Left: Question Content */}
            <div className="md:w-1/2 p-6 border-b md:border-b-0 md:border-r border-slate-100">
              <div className="flex justify-between items-start mb-4">
                 <span className="bg-slate-800 text-white px-3 py-1 rounded-md text-sm font-bold">Q{q.number}</span>
                 {q.isAnalyzing && <span className="text-xs text-indigo-500 font-medium animate-pulse">Analyzing content...</span>}
              </div>
              <div className="prose prose-slate max-w-none mb-4">
                <p className="text-slate-700">{q.contentMd}</p>
              </div>
              <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                <img src={q.imageUrl} alt={`Question ${q.number}`} className="w-full h-48 object-cover opacity-90" />
              </div>
            </div>

            {/* Right: Analysis Data */}
            <div className="md:w-1/2 p-6 bg-slate-50/50 flex flex-col justify-center">
              {q.isAnalyzing ? (
                <div className="h-full flex flex-col items-center justify-center space-y-3 text-slate-400">
                  <Spinner size="md" />
                  <p>Extracting analysis points...</p>
                </div>
              ) : q.analysis ? (
                <div className="space-y-6">
                  {/* Difficulty & Chapter Header */}
                  <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                    <div className="flex items-center space-x-2">
                         <BookOpenIcon className="w-5 h-5 text-slate-400" />
                         <div>
                            <p className="text-xs text-slate-500 uppercase font-semibold">Chapter</p>
                            <p className="text-sm font-medium text-slate-800">{q.analysis.chapter}</p>
                         </div>
                    </div>
                    <div className="text-right">
                         <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Difficulty</p>
                         <div className="flex items-center space-x-2">
                            <div className="flex space-x-0.5">
                                {Array.from({length: 5}).map((_, i) => (
                                    <div key={i} className={`w-2 h-2 rounded-full ${i < Math.ceil(q.analysis!.difficulty / 2) ? 'bg-indigo-500' : 'bg-slate-200'}`}></div>
                                ))}
                            </div>
                            <span className="text-sm font-bold text-slate-800">{q.analysis.difficulty}/10</span>
                         </div>
                    </div>
                  </div>

                  {/* 1. Knowledge Points */}
                  <div>
                    <h4 className="flex items-center text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Knowledge Points
                    </h4>
                    <div className="flex flex-wrap gap-2">
                       {q.analysis.knowledgePoints.map(kp => (
                         <span key={kp} className="px-2.5 py-1 bg-white text-blue-700 text-xs font-medium rounded-md border border-blue-200 shadow-sm">
                           {kp}
                         </span>
                       ))}
                    </div>
                  </div>

                  {/* 2. Methods */}
                  <div>
                    <h4 className="flex items-center text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                      Methods
                    </h4>
                    <div className="flex flex-wrap gap-2">
                       {q.analysis.methods.map(m => (
                         <span key={m} className="px-2.5 py-1 bg-white text-emerald-700 text-xs font-medium rounded-md border border-emerald-200 shadow-sm">
                           {m}
                         </span>
                       ))}
                    </div>
                  </div>

                  {/* 3. Core Competencies */}
                  <div>
                    <h4 className="flex items-center text-xs font-bold text-purple-700 uppercase tracking-wider mb-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                      Core Competencies
                    </h4>
                    <div className="flex flex-wrap gap-2">
                       {q.analysis.competencies.map(cp => (
                         <span key={cp} className="px-2.5 py-1 bg-white text-purple-700 text-xs font-medium rounded-md border border-purple-200 shadow-sm">
                           {cp}
                         </span>
                       ))}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="text-red-500">Analysis failed.</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};