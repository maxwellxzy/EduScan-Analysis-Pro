
import React, { useState } from 'react';
import { Question, StudentAnswer } from '../types';
import { CheckCircleIcon, AlertCircleIcon, BookOpenIcon, CheckIcon, EditIcon, SaveIcon, XIcon, BrainIcon } from './Icons';
import { Spinner } from './Spinner';
import { MarkdownRenderer } from './MarkdownRenderer';
import { addToKnowledgeGraphApi } from '../services/mockApi';

interface StudentAnalysisViewProps {
  questions: Question[];
  answers: StudentAnswer[];
  studentName: string;
  examTitle?: string;
  onUpdateAnswer: (questionId: string, updates: Partial<StudentAnswer>) => void;
}

interface EditFormState {
  feedback: string;
  missingPoints: string;
  missingMethods: string;
  reviewChapter: string;
}

const StudentAnswerCard: React.FC<{
  answer: StudentAnswer;
  originalQuestion: Question;
  onUpdate: (id: string, updates: Partial<StudentAnswer>) => void;
}> = ({ answer: ans, originalQuestion, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);

  const handleEditClick = () => {
    setEditForm({
      feedback: ans.feedback,
      missingPoints: ans.missingPoints.join(", "),
      missingMethods: ans.missingMethods.join(", "),
      reviewChapter: ans.reviewChapter || originalQuestion.analysis?.chapter || ""
    });
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditForm(null);
  };

  const handleSaveClick = () => {
    if (editForm) {
      const splitRegex = /[,，、]/;
      onUpdate(ans.questionId, {
        feedback: editForm.feedback,
        missingPoints: editForm.missingPoints.split(splitRegex).map(s => s.trim()).filter(Boolean),
        missingMethods: editForm.missingMethods.split(splitRegex).map(s => s.trim()).filter(Boolean),
        reviewChapter: editForm.reviewChapter,
        isVerified: true
      });
      setIsEditing(false);
      setEditForm(null);
    }
  };

  const handleVerifyClick = () => {
    onUpdate(ans.questionId, { isVerified: true });
  };

  const handleInputChange = (field: keyof EditFormState, value: string) => {
    if (editForm) {
      setEditForm({ ...editForm, [field]: value });
    }
  };

  // Determine the display chapter: explicit override > question analysis > default
  const displayChapter = ans.reviewChapter || originalQuestion.analysis?.chapter;

  return (
    <div className={`rounded-xl shadow-sm border overflow-hidden flex flex-col md:flex-row transition-all relative
      ${ans.isAnalyzing ? 'bg-white border-slate-200' : ans.isCorrect ? 'bg-green-50/50 border-green-200' : 'bg-red-50/50 border-red-200'}
      ${ans.isVerified ? 'ring-1 ring-offset-1 ring-green-100' : ''}
    `}>
      {/* Question Context (Mini) */}
      <div className="md:w-1/3 p-6 border-b md:border-b-0 md:border-r border-slate-200/60 opacity-75">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            原题 {originalQuestion.number}
            {ans.isVerified && <span className="ml-2 text-green-600 text-[10px] border border-green-200 px-1 rounded">已确认</span>}
        </div>
        <div className="max-h-32 overflow-y-auto mb-2 text-slate-700 text-sm">
          <MarkdownRenderer content={originalQuestion.contentMd} />
        </div>
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
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">学生作答</div>
        <div className="mb-4 rounded border border-slate-100 overflow-hidden">
          <img src={ans.imageUrl} className="w-full h-24 object-cover" alt="Student answer crop" />
        </div>
        <div className="text-sm font-mono text-slate-600">
          <MarkdownRenderer content={ans.studentAnswerMd} />
        </div>
      </div>

      {/* Assessment (Editable) */}
      <div className="md:w-1/3 p-6 relative group">
        {ans.isAnalyzing ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Spinner size="md" />
            <p className="mt-2 text-sm">评分中...</p>
          </div>
        ) : (
          <div className="h-full flex flex-col justify-between">
            <div>
              {/* Header: Status & Score */}
              <div className="flex items-center space-x-2 mb-4">
                {ans.isCorrect ? (
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircleIcon className="w-6 h-6 text-red-600" />
                )}
                <span className={`text-lg font-bold ${ans.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {ans.isCorrect ? '已掌握' : '需改进'}
                </span>
                <span className="ml-auto text-sm font-bold bg-white px-2 py-1 rounded border border-slate-200">
                  得分: {ans.score}/{ans.maxScore}
                </span>
              </div>

              {/* Edit Mode Content */}
              {isEditing && editForm ? (
                <div className="space-y-3">
                   <div>
                       <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">评语</label>
                       <textarea
                           value={editForm.feedback}
                           onChange={(e) => handleInputChange('feedback', e.target.value)}
                           rows={3}
                           className="w-full text-xs border-slate-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                       />
                   </div>
                   {!ans.isCorrect && (
                       <>
                        <div>
                            <label className="block text-[10px] font-bold text-red-600 uppercase mb-1">知识点漏洞</label>
                            <input
                                type="text"
                                value={editForm.missingPoints}
                                onChange={(e) => handleInputChange('missingPoints', e.target.value)}
                                className="w-full text-xs border-red-200 rounded focus:ring-red-500 focus:border-red-500 bg-red-50"
                                placeholder="逗号分隔..."
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-orange-600 uppercase mb-1">方法漏洞</label>
                            <input
                                type="text"
                                value={editForm.missingMethods}
                                onChange={(e) => handleInputChange('missingMethods', e.target.value)}
                                className="w-full text-xs border-orange-200 rounded focus:ring-orange-500 focus:border-orange-500 bg-orange-50"
                                placeholder="逗号分隔..."
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">复习章节</label>
                            <input
                                type="text"
                                value={editForm.reviewChapter}
                                onChange={(e) => handleInputChange('reviewChapter', e.target.value)}
                                className="w-full text-xs border-slate-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                       </>
                   )}
                </div>
              ) : (
                /* View Mode Content */
                <>
                  <div className="text-sm text-slate-700 mb-4 bg-white/50 p-3 rounded-lg border border-slate-100">
                    <strong>评语:</strong> {ans.feedback}
                  </div>

                  {!ans.isCorrect && (
                    <div className="space-y-3">
                      {ans.missingPoints.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-red-600 uppercase mb-1">知识点漏洞</p>
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
                          <p className="text-[10px] font-bold text-orange-600 uppercase mb-1">方法漏洞</p>
                          <div className="flex flex-wrap gap-1">
                            {ans.missingMethods.map(mm => (
                              <span key={mm} className="text-[10px] px-2 py-1 bg-orange-100 text-orange-700 rounded-md border border-orange-200">
                                {mm}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {displayChapter && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">复习章节</p>
                          <div className="flex items-center gap-1 text-xs text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                            <BookOpenIcon className="w-3 h-3 text-slate-500" />
                            {displayChapter}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="absolute bottom-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveClick}
                    className="p-2 bg-green-500 text-white hover:bg-green-600 rounded-full shadow-sm transition-colors"
                    title="保存修改"
                  >
                    <SaveIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCancelClick}
                    className="p-2 bg-white text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-full shadow-sm border border-slate-200 transition-colors"
                    title="取消"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleVerifyClick}
                    className={`p-2 rounded-full transition-colors ${ans.isVerified ? 'bg-green-100 text-green-700 cursor-default' : 'bg-white text-slate-400 hover:bg-green-50 hover:text-green-600 shadow-sm border border-slate-200'}`}
                    title="确认分析无误"
                    disabled={ans.isVerified}
                  >
                    <CheckIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleEditClick}
                    className="p-2 bg-white text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-full shadow-sm border border-slate-200 transition-colors"
                    title="编辑评语与漏洞"
                  >
                    <EditIcon className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const StudentAnalysisView: React.FC<StudentAnalysisViewProps> = ({ questions, answers, studentName, examTitle = "未知试卷", onUpdateAnswer }) => {
  const [graphStatus, setGraphStatus] = useState<'idle' | 'loading' | 'success'>('idle');

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
            // Use override review chapter if present, otherwise question chapter
            const chapter = ans.reviewChapter || q?.analysis?.chapter;
            if (chapter) {
                reviewChapters.add(chapter);
            }
        }
     }
  });

  const handleAddToGraph = async () => {
      setGraphStatus('loading');
      try {
          const studentScore = answers.reduce((acc, a) => acc + a.score, 0);
          const maxScore = answers.reduce((acc, a) => acc + a.maxScore, 0);

          await addToKnowledgeGraphApi({
              studentName,
              examTitle,
              score: studentScore,
              totalScore: maxScore,
              knowledgePoints: {
                  mastered: Array.from(masteredKPs),
                  missing: Array.from(missingKPs)
              },
              methods: {
                  mastered: Array.from(masteredMethods),
                  missing: Array.from(missingMethods)
              }
          });
          setGraphStatus('success');
      } catch (error) {
          console.error(error);
          setGraphStatus('idle'); 
      }
  };

  return (
    <div className="space-y-8 mt-12 pt-12 border-t border-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">学生答题情况: {studentName}</h2>
          <p className="text-slate-500 mt-1">优势与不足的详细分析</p>
        </div>
      </div>

      {/* Student Summary Section */}
      {analysisComplete && (
         <div className="grid md:grid-cols-2 gap-6 bg-slate-50 rounded-xl p-6 border border-slate-200">
            {/* Mastered Column */}
            <div className="space-y-4">
                <h3 className="flex items-center text-green-700 font-bold uppercase tracking-wider text-sm">
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    优势档案（已掌握）
                </h3>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                    <p className="text-xs text-slate-400 font-bold uppercase mb-2">知识点</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {masteredKPs.size > 0 ? Array.from(masteredKPs).map(k => (
                            <span key={k} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded border border-green-100">{k}</span>
                        )) : <span className="text-slate-400 text-sm italic">无记录</span>}
                    </div>

                    <p className="text-xs text-slate-400 font-bold uppercase mb-2">方法</p>
                    <div className="flex flex-wrap gap-2">
                        {masteredMethods.size > 0 ? Array.from(masteredMethods).map(m => (
                            <span key={m} className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded border border-emerald-100">{m}</span>
                        )) : <span className="text-slate-400 text-sm italic">无记录</span>}
                    </div>
                </div>
            </div>

            {/* Not Mastered Column */}
            <div className="space-y-4">
                <h3 className="flex items-center text-red-700 font-bold uppercase tracking-wider text-sm">
                    <AlertCircleIcon className="w-5 h-5 mr-2" />
                    差距分析（需改进）
                </h3>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                    <p className="text-xs text-slate-400 font-bold uppercase mb-2">缺失知识点</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {missingKPs.size > 0 ? Array.from(missingKPs).map(k => (
                            <span key={k} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded border border-red-100">{k}</span>
                        )) : <span className="text-slate-400 text-sm italic">未发现</span>}
                    </div>

                    <p className="text-xs text-slate-400 font-bold uppercase mb-2">缺失方法</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {missingMethods.size > 0 ? Array.from(missingMethods).map(m => (
                            <span key={m} className="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded border border-orange-100">{m}</span>
                        )) : <span className="text-slate-400 text-sm italic">未发现</span>}
                    </div>

                    <p className="text-xs text-slate-400 font-bold uppercase mb-2">推荐复习章节</p>
                    <ul className="list-disc list-inside space-y-1">
                        {reviewChapters.size > 0 ? Array.from(reviewChapters).map(c => (
                            <li key={c} className="text-xs text-slate-700">{c}</li>
                        )) : <li className="text-slate-400 text-xs italic list-none">无需特别复习</li>}
                    </ul>
                </div>
            </div>
         </div>
      )}

      {/* Individual Question List */}
      <div className="grid gap-6">
        {answers.map((ans) => {
          const originalQuestion = questions.find(q => q.id === ans.questionId);
          if (!originalQuestion) return null;

          return (
            <StudentAnswerCard 
              key={ans.questionId} 
              answer={ans} 
              originalQuestion={originalQuestion} 
              onUpdate={onUpdateAnswer}
            />
          );
        })}
      </div>

      {/* Add to Knowledge Graph Button */}
      {analysisComplete && (
        <div className="flex justify-end mt-8 pb-8">
            <button
                onClick={handleAddToGraph}
                disabled={graphStatus !== 'idle'}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full font-bold shadow-lg transition-all transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${graphStatus === 'success' 
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white cursor-default focus:ring-emerald-500' 
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-indigo-200 focus:ring-indigo-500'
                    }
                    ${graphStatus === 'loading' ? 'opacity-75 cursor-wait' : ''}
                `}
            >
                {graphStatus === 'loading' ? (
                    <>
                        <Spinner size="sm" />
                        <span>处理中...</span>
                    </>
                ) : graphStatus === 'success' ? (
                    <>
                        <CheckCircleIcon className="w-5 h-5" />
                        <span>已加入知识图谱</span>
                    </>
                ) : (
                    <>
                        <BrainIcon className="w-5 h-5" />
                        <span>加入学生知识图谱</span>
                    </>
                )}
            </button>
        </div>
      )}
    </div>
  );
};
