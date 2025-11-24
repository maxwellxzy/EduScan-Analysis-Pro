import React from 'react';
import { Question, StudentAnswer } from '../types';
import { CheckCircleIcon, AlertCircleIcon, BookOpenIcon } from './Icons';
import { Spinner } from './Spinner';

interface StudentAnalysisViewProps {
  questions: Question[];
  answers: StudentAnswer[];
  studentName: string;
}

export const StudentAnalysisView: React.FC<StudentAnalysisViewProps> = ({ questions, answers, studentName }) => {
  
  // Compute Overall Student Summary
  const analysisComplete = answers.every(a => !a.isAnalyzing);
  
  const masteredKPs = new Set<string>();
  const masteredMethods = new Set<string>();
  const missingKPs = new Set<string>();
  const missingMethods = new Set<string>();
  const reviewChapters = new Set<string>();

  answers.forEach(ans => {
     if (!ans.isAnalyzing) {
        ans.masteredPoints.forEach(kp => masteredKPs.add(kp));
        ans.masteredMethods.forEach(m => masteredMethods.add(m));
        ans.missingPoints.forEach(kp => missingKPs.add(kp));
        ans.missingMethods.forEach(m => missingMethods.add(m));

        // If specific methods or points are missing, add the chapter
        if (ans.missingPoints.length > 0 || ans.missingMethods.length > 0 || !ans.isCorrect) {
            const q = questions.find(q => q.id === ans.questionId);
            if (q && q.analysis?.chapter) {
                reviewChapters.add(q.analysis.chapter);
            }
        }
     }
  });

  return (
    <div className="space-y-8 mt-12 pt-12 border-t border-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Student Performance: {studentName}</h2>
          <p className="text-slate-500 mt-1">Detailed analysis of strengths and weaknesses</p>
        </div>
      </div>

      {/* Student Summary Section */}
      {analysisComplete && (
         <div className="grid md:grid-cols-2 gap-6 bg-slate-50 rounded-xl p-6 border border-slate-200">
            {/* Mastered Column */}
            <div className="space-y-4">
                <h3 className="flex items-center text-green-700 font-bold uppercase tracking-wider text-sm">
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    Strength Profile (Mastered)
                </h3>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                    <p className="text-xs text-slate-400 font-bold uppercase mb-2">Knowledge Points</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {masteredKPs.size > 0 ? Array.from(masteredKPs).map(k => (
                            <span key={k} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded border border-green-100">{k}</span>
                        )) : <span className="text-slate-400 text-sm italic">None recorded</span>}
                    </div>

                    <p className="text-xs text-slate-400 font-bold uppercase mb-2">Methods</p>
                    <div className="flex flex-wrap gap-2">
                        {masteredMethods.size > 0 ? Array.from(masteredMethods).map(m => (
                            <span key={m} className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded border border-emerald-100">{m}</span>
                        )) : <span className="text-slate-400 text-sm italic">None recorded</span>}
                    </div>
                </div>
            </div>

            {/* Not Mastered Column */}
            <div className="space-y-4">
                <h3 className="flex items-center text-red-700 font-bold uppercase tracking-wider text-sm">
                    <AlertCircleIcon className="w-5 h-5 mr-2" />
                    Gap Analysis (Needs Improvement)
                </h3>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                    <p className="text-xs text-slate-400 font-bold uppercase mb-2">Missing Knowledge Points</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {missingKPs.size > 0 ? Array.from(missingKPs).map(k => (
                            <span key={k} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded border border-red-100">{k}</span>
                        )) : <span className="text-slate-400 text-sm italic">None detected</span>}
                    </div>

                    <p className="text-xs text-slate-400 font-bold uppercase mb-2">Missing Methods</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {missingMethods.size > 0 ? Array.from(missingMethods).map(m => (
                            <span key={m} className="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded border border-orange-100">{m}</span>
                        )) : <span className="text-slate-400 text-sm italic">None detected</span>}
                    </div>

                    <p className="text-xs text-slate-400 font-bold uppercase mb-2">Recommended Textbook Chapters</p>
                    <ul className="list-disc list-inside space-y-1">
                        {reviewChapters.size > 0 ? Array.from(reviewChapters).map(c => (
                            <li key={c} className="text-xs text-slate-700">{c}</li>
                        )) : <li className="text-slate-400 text-xs italic list-none">No specific reviews needed</li>}
                    </ul>
                </div>
            </div>
         </div>
      )}

      {/* Individual Question List */}
      <div className="grid gap-6">
        {answers.map((ans, idx) => {
          const originalQuestion = questions.find(q => q.id === ans.questionId);
          if (!originalQuestion) return null;

          return (
            <div key={ans.questionId} className={`rounded-xl shadow-sm border overflow-hidden flex flex-col md:flex-row transition-all
              ${ans.isAnalyzing ? 'bg-white border-slate-200' : ans.isCorrect ? 'bg-green-50/50 border-green-200' : 'bg-red-50/50 border-red-200'}
            `}>
              {/* Question Context (Mini) */}
              <div className="md:w-1/3 p-6 border-b md:border-b-0 md:border-r border-slate-200/60 opacity-75">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Original Question {originalQuestion.number}</div>
                <p className="text-sm text-slate-700 line-clamp-4">{originalQuestion.contentMd}</p>
                <div className="mt-4 flex flex-wrap gap-1">
                   {originalQuestion.analysis?.knowledgePoints.map(kp => (
                     <span key={kp} className="text-[10px] px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded">
                       {kp}
                     </span>
                   ))}
                </div>
              </div>

              {/* Student Answer */}
              <div className="md:w-1/3 p-6 border-b md:border-b-0 md:border-r border-slate-200/60 bg-white">
                 <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Student Answer</div>
                 <div className="mb-4 rounded border border-slate-100 overflow-hidden">
                    <img src={ans.imageUrl} className="w-full h-24 object-cover" alt="Student answer crop" />
                 </div>
                 <p className="text-sm font-mono text-slate-600">{ans.studentAnswerMd}</p>
              </div>

              {/* Assessment */}
              <div className="md:w-1/3 p-6">
                {ans.isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <Spinner size="md" />
                    <p className="mt-2 text-sm">Grading...</p>
                  </div>
                ) : (
                  <div className="h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-4">
                        {ans.isCorrect ? (
                          <CheckCircleIcon className="w-6 h-6 text-green-600" />
                        ) : (
                          <AlertCircleIcon className="w-6 h-6 text-red-600" />
                        )}
                        <span className={`text-lg font-bold ${ans.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                          {ans.isCorrect ? 'Mastered' : 'Needs Improvement'}
                        </span>
                        <span className="ml-auto text-sm font-bold bg-white px-2 py-1 rounded border border-slate-200">
                          Score: {ans.score}/{ans.maxScore}
                        </span>
                      </div>
                      
                      <div className="text-sm text-slate-700 mb-4 bg-white/50 p-3 rounded-lg">
                        <strong>Feedback:</strong> {ans.feedback}
                      </div>

                      {/* Gaps Display for incorrect answers */}
                      {!ans.isCorrect && (
                          <div className="space-y-3">
                              {ans.missingPoints.length > 0 && (
                                <div>
                                  <p className="text-[10px] font-bold text-red-600 uppercase mb-1">Knowledge Gaps</p>
                                  <div className="flex flex-wrap gap-1">
                                    {ans.missingPoints.map(mp => (
                                      <span key={mp} className="text-[10px] px-2 py-1 bg-red-100 text-red-700 rounded-md border border-red-200">
                                        {mp}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {ans.missingMethods.length > 0 && (
                                <div>
                                  <p className="text-[10px] font-bold text-orange-600 uppercase mb-1">Method Gaps</p>
                                  <div className="flex flex-wrap gap-1">
                                    {ans.missingMethods.map(mm => (
                                      <span key={mm} className="text-[10px] px-2 py-1 bg-orange-100 text-orange-700 rounded-md border border-orange-200">
                                        {mm}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {originalQuestion.analysis?.chapter && (
                                  <div>
                                     <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Review Chapter</p>
                                     <div className="flex items-center gap-1 text-xs text-slate-700 bg-slate-100 px-2 py-1 rounded">
                                        <BookOpenIcon className="w-3 h-3 text-slate-500" />
                                        {originalQuestion.analysis.chapter}
                                     </div>
                                  </div>
                              )}
                          </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};