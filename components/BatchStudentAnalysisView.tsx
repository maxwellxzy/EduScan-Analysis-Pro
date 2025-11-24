
import React, { useState, useRef } from 'react';
import { StudentResult, Question, StudentAnswer } from '../types';
import { BrainIcon, CheckCircleIcon, EditIcon, SaveIcon, XIcon, BookOpenIcon, CheckIcon } from './Icons';
import { addToKnowledgeGraphApi } from '../services/mockApi';

interface BatchStudentAnalysisViewProps {
  results: StudentResult[];
  questions: Question[];
  examTitle: string;
  onUpdateAnswer: (studentIndex: number, questionId: string, updates: Partial<StudentAnswer>) => void;
}

const ITEMS_PER_PAGE = 5;

const BatchAnswerCard: React.FC<{
    answer: StudentAnswer;
    originalQuestion?: Question;
    onUpdate: (updates: Partial<StudentAnswer>) => void;
}> = ({ answer: ans, originalQuestion, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        feedback: ans.feedback,
        missingPoints: ans.missingPoints.join(", "),
        missingMethods: ans.missingMethods.join(", "),
        reviewChapter: ans.reviewChapter || ""
    });
  
    const handleEditClick = () => {
      setEditForm({
        feedback: ans.feedback,
        missingPoints: ans.missingPoints.join(", "),
        missingMethods: ans.missingMethods.join(", "),
        reviewChapter: ans.reviewChapter || originalQuestion?.analysis?.chapter || ""
      });
      setIsEditing(true);
    };
  
    const handleCancelClick = () => {
        setIsEditing(false);
    };
  
    const handleSaveClick = () => {
        const splitRegex = /[,，、]/;
        onUpdate({
            feedback: editForm.feedback,
            missingPoints: editForm.missingPoints.split(splitRegex).map(s => s.trim()).filter(Boolean),
            missingMethods: editForm.missingMethods.split(splitRegex).map(s => s.trim()).filter(Boolean),
            reviewChapter: editForm.reviewChapter,
            isVerified: true
        });
        setIsEditing(false);
    };
  
    const handleInputChange = (field: keyof typeof editForm, value: string) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };
  
    return (
      <div className={`border border-red-100 bg-red-50/30 rounded-lg p-4 flex flex-col gap-3 relative group transition-all ${ans.isVerified ? 'ring-1 ring-green-400 ring-offset-1' : ''}`}>
         {/* Header */}
         <div className="flex justify-between items-start">
             <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">
                 第 {originalQuestion?.number} 题
             </span>
             <span className="text-xs font-bold text-slate-500">
                 得分: {ans.score}/{ans.maxScore}
             </span>
         </div>
  
         {/* Image */}
         <div className="rounded border border-slate-200 overflow-hidden bg-white">
             <img src={ans.imageUrl} className="w-full h-32 object-cover" alt="Student Answer" />
         </div>
  
         {/* Content or Edit Form */}
         {isEditing ? (
             <div className="space-y-3 bg-white p-3 rounded border border-red-100 shadow-sm">
                 <div>
                     <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">评语</label>
                     <textarea
                         value={editForm.feedback}
                         onChange={(e) => handleInputChange('feedback', e.target.value)}
                         rows={3}
                         className="w-full text-xs border-slate-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                     />
                 </div>
                 <div>
                      <label className="block text-[10px] font-bold text-red-600 uppercase mb-1">知识点漏洞</label>
                      <input
                          type="text"
                          value={editForm.missingPoints}
                          onChange={(e) => handleInputChange('missingPoints', e.target.value)}
                          className="w-full text-xs border-red-200 rounded focus:ring-red-500 focus:border-red-500 bg-red-50"
                      />
                  </div>
                  <div>
                      <label className="block text-[10px] font-bold text-orange-600 uppercase mb-1">方法漏洞</label>
                      <input
                          type="text"
                          value={editForm.missingMethods}
                          onChange={(e) => handleInputChange('missingMethods', e.target.value)}
                          className="w-full text-xs border-orange-200 rounded focus:ring-orange-500 focus:border-orange-500 bg-orange-50"
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
             </div>
         ) : (
             <div className="text-sm space-y-2">
                 <div className="text-slate-700 bg-white p-2 rounded border border-slate-100 shadow-sm">
                     <span className="font-bold text-slate-500 text-xs">AI 评语:</span>
                     <p className="mt-1">{ans.feedback}</p>
                 </div>
                 
                 {(ans.missingPoints.length > 0 || ans.missingMethods.length > 0 || ans.reviewChapter) && (
                     <div className="flex flex-col gap-1">
                         <div className="flex flex-wrap gap-1">
                             {ans.missingPoints.map(mp => (
                                 <span key={mp} className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded border border-red-200">{mp}</span>
                             ))}
                             {ans.missingMethods.map(mm => (
                                 <span key={mm} className="text-[10px] px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded border border-orange-200">{mm}</span>
                             ))}
                         </div>
                         {(ans.reviewChapter || originalQuestion?.analysis?.chapter) && !ans.isCorrect && (
                             <div className="flex items-center gap-1 text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 w-fit">
                                 <BookOpenIcon className="w-3 h-3" />
                                 <span>{ans.reviewChapter || originalQuestion?.analysis?.chapter}</span>
                             </div>
                         )}
                     </div>
                 )}
             </div>
         )}
  
         {/* Buttons - Absolute Bottom Right */}
         <div className="absolute bottom-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
             {isEditing ? (
                 <>
                     <button onClick={handleSaveClick} className="p-1.5 bg-green-500 text-white hover:bg-green-600 rounded shadow-sm" title="保存">
                         <SaveIcon className="w-3 h-3" />
                     </button>
                     <button onClick={handleCancelClick} className="p-1.5 bg-white text-slate-400 hover:bg-red-50 hover:text-red-600 rounded shadow-sm border border-slate-200" title="取消">
                         <XIcon className="w-3 h-3" />
                     </button>
                 </>
             ) : (
                 <button onClick={handleEditClick} className="p-1.5 bg-white text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded shadow-sm border border-slate-200" title="编辑">
                     <EditIcon className="w-3 h-3" />
                 </button>
             )}
         </div>
      </div>
    );
}

const BatchStudentCard: React.FC<{ 
  studentIndex: number; 
  student: StudentResult; 
  questions: Question[];
  examTitle: string; 
  onUpdateAnswer: (studentIndex: number, questionId: string, updates: Partial<StudentAnswer>) => void;
}> = ({ studentIndex, student, questions, examTitle, onUpdateAnswer }) => {
  const [graphStatus, setGraphStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  
  // Calculate stats
  const incorrectAnswers = student.answers.filter(a => !a.isCorrect);
  const totalScore = student.answers.reduce((acc, a) => acc + a.score, 0);
  const maxScore = student.answers.reduce((acc, a) => acc + a.maxScore, 0);
  
  // Collect data sets
  const missingPoints = new Set<string>();
  const missingMethods = new Set<string>();
  const reviewChapters = new Set<string>();
  
  const masteredPoints = new Set<string>();
  const masteredMethods = new Set<string>();

  student.answers.forEach(ans => {
      // Missing
      ans.missingPoints.forEach(p => missingPoints.add(p));
      ans.missingMethods.forEach(m => missingMethods.add(m));
      
      // Review Chapters: Explicit override OR calculate from question if incorrect
      if (!ans.isCorrect) {
          const chapter = ans.reviewChapter || questions.find(q => q.id === ans.questionId)?.analysis?.chapter;
          if (chapter) reviewChapters.add(chapter);
      } else if (ans.reviewChapter) {
          // If manually set even if correct
          reviewChapters.add(ans.reviewChapter);
      }

      // Mastered
      ans.masteredPoints.forEach(p => masteredPoints.add(p));
      ans.masteredMethods.forEach(m => masteredMethods.add(m));
  });

  const handleAddToGraph = async () => {
    setGraphStatus('loading');
    try {
        await addToKnowledgeGraphApi({
            studentName: student.studentName,
            examTitle,
            score: totalScore,
            totalScore: maxScore,
            knowledgePoints: { 
                missing: Array.from(missingPoints),
                mastered: Array.from(masteredPoints)
            },
            methods: { 
                missing: Array.from(missingMethods),
                mastered: Array.from(masteredMethods)
            }
        });
        setGraphStatus('success');
    } catch (error) {
        console.error(error);
        setGraphStatus('idle');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8">
      {/* Sticky Header */}
      <div className={`
          flex items-center justify-between p-4 border-b border-slate-100 bg-white/95 backdrop-blur-sm rounded-t-xl
          ${graphStatus !== 'success' ? 'sticky top-0 z-30 shadow-md transition-shadow' : ''}
      `}>
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg">
                {student.studentName[0]}
            </div>
            <div>
                <h3 className="font-bold text-slate-800 text-lg">{student.studentName}</h3>
                <div className="flex gap-3 text-xs text-slate-500">
                    <span>得分: <span className="font-semibold text-slate-700">{totalScore}/{maxScore}</span></span>
                    {incorrectAnswers.length > 0 ? (
                        <span className="text-red-600 font-medium">错题: {incorrectAnswers.length}道</span>
                    ) : (
                        <span className="text-green-600 font-medium">全对</span>
                    )}
                </div>
            </div>
        </div>

        <button
            onClick={handleAddToGraph}
            disabled={graphStatus !== 'idle'}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full font-bold text-sm transition-all
                ${graphStatus === 'success' 
                    ? 'bg-emerald-100 text-emerald-700 cursor-default' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                }
                ${graphStatus === 'loading' ? 'opacity-75 cursor-wait' : ''}
            `}
        >
             {graphStatus === 'loading' ? (
                <>
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                   <span>处理中...</span>
                </>
            ) : graphStatus === 'success' ? (
                <>
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>已加入图谱</span>
                </>
            ) : (
                <>
                    <BrainIcon className="w-4 h-4" />
                    <span>加入图谱</span>
                </>
            )}
        </button>
      </div>

      {/* Detailed Summary (2 Columns: Gaps & Mastered) */}
      <div className="grid grid-cols-1 md:grid-cols-2 border-b border-slate-100 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        
        {/* Left: Gaps & Recommendations */}
        <div className="p-4 bg-slate-50/50 space-y-3">
             {missingPoints.size > 0 && (
                <div className="flex gap-2 items-start">
                    <span className="font-bold text-red-600 text-xs uppercase mt-0.5 shrink-0 w-16">知识点缺失:</span>
                    <div className="flex flex-wrap gap-1">
                        {Array.from(missingPoints).map(p => (
                            <span key={p} className="px-2 py-0.5 bg-white border border-red-100 text-red-600 rounded text-xs">{p}</span>
                        ))}
                    </div>
                </div>
             )}
             {missingMethods.size > 0 && (
                <div className="flex gap-2 items-start">
                    <span className="font-bold text-orange-600 text-xs uppercase mt-0.5 shrink-0 w-16">方法缺失:</span>
                    <div className="flex flex-wrap gap-1">
                        {Array.from(missingMethods).map(m => (
                            <span key={m} className="px-2 py-0.5 bg-white border border-orange-100 text-orange-600 rounded text-xs">{m}</span>
                        ))}
                    </div>
                </div>
             )}
             {reviewChapters.size > 0 && (
                 <div className="flex gap-2 items-start">
                    <span className="font-bold text-slate-500 text-xs uppercase mt-0.5 shrink-0 w-16">推荐复习:</span>
                    <ul className="flex flex-col gap-1 w-full">
                        {Array.from(reviewChapters).map(c => (
                            <li key={c} className="flex items-center text-xs text-slate-700">
                                <BookOpenIcon className="w-3 h-3 mr-1 text-slate-400" />
                                {c}
                            </li>
                        ))}
                    </ul>
                 </div>
             )}
             {missingPoints.size === 0 && missingMethods.size === 0 && reviewChapters.size === 0 && (
                 <div className="text-xs text-slate-400 italic py-2">无明显漏洞，表现优异。</div>
             )}
        </div>

        {/* Right: Mastered */}
        <div className="p-4 bg-white space-y-3">
             {masteredPoints.size > 0 && (
                <div className="flex gap-2 items-start">
                    <span className="font-bold text-green-600 text-xs uppercase mt-0.5 shrink-0 w-16">已掌握知识:</span>
                    <div className="flex flex-wrap gap-1">
                        {Array.from(masteredPoints).map(p => (
                            <span key={p} className="px-2 py-0.5 bg-green-50 border border-green-100 text-green-700 rounded text-xs">{p}</span>
                        ))}
                    </div>
                </div>
             )}
             {masteredMethods.size > 0 && (
                <div className="flex gap-2 items-start">
                    <span className="font-bold text-teal-600 text-xs uppercase mt-0.5 shrink-0 w-16">已掌握方法:</span>
                    <div className="flex flex-wrap gap-1">
                        {Array.from(masteredMethods).map(m => (
                            <span key={m} className="px-2 py-0.5 bg-teal-50 border border-teal-100 text-teal-700 rounded text-xs">{m}</span>
                        ))}
                    </div>
                </div>
             )}
             {masteredPoints.size === 0 && masteredMethods.size === 0 && (
                 <div className="text-xs text-slate-400 italic py-2">暂无已掌握数据记录。</div>
             )}
        </div>
      </div>

      {/* Incorrect Questions Grid */}
      <div className="p-6">
        {incorrectAnswers.length === 0 ? (
            <div className="text-center py-6 text-slate-400">
                <CheckCircleIcon className="w-10 h-10 mx-auto mb-2 text-green-200" />
                <p className="text-sm">该学生本卷错题数为 0</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {incorrectAnswers.map(ans => {
                    const originalQ = questions.find(q => q.id === ans.questionId);
                    return (
                        <BatchAnswerCard 
                            key={ans.questionId}
                            answer={ans}
                            originalQuestion={originalQ}
                            onUpdate={(updates) => onUpdateAnswer(studentIndex, ans.questionId, updates)}
                        />
                    );
                })}
            </div>
        )}
      </div>
    </div>
  );
};

export const BatchStudentAnalysisView: React.FC<BatchStudentAnalysisViewProps> = ({ results, questions, examTitle, onUpdateAnswer }) => {
  const [page, setPage] = useState(1);
  const [batchAddStatus, setBatchAddStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [isConfirmingBatchAdd, setIsConfirmingBatchAdd] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);

  const currentStudents = results.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage: number) => {
      setPage(newPage);
      setTimeout(() => {
          containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
  };

  const handleBatchAddClick = () => {
    if (batchAddStatus === 'success') return;
    setIsConfirmingBatchAdd(true);
  };

  const handleCancelBatchAdd = () => {
    setIsConfirmingBatchAdd(false);
  };

  const handleConfirmBatchAdd = async () => {
    setIsConfirmingBatchAdd(false);
    setBatchAddStatus('loading');
    
    try {
      const promises = results.map(student => {
          const totalScore = student.answers.reduce((acc, a) => acc + a.score, 0);
          const maxScore = student.answers.reduce((acc, a) => acc + a.maxScore, 0);
          
          const missingPoints = new Set<string>();
          const missingMethods = new Set<string>();
          const masteredPoints = new Set<string>();
          const masteredMethods = new Set<string>();

          student.answers.forEach(ans => {
              ans.missingPoints.forEach(p => missingPoints.add(p));
              ans.missingMethods.forEach(m => missingMethods.add(m));
              ans.masteredPoints.forEach(p => masteredPoints.add(p));
              ans.masteredMethods.forEach(m => masteredMethods.add(m));
          });

          return addToKnowledgeGraphApi({
              studentName: student.studentName,
              examTitle,
              score: totalScore,
              totalScore: maxScore,
              knowledgePoints: { 
                  missing: Array.from(missingPoints),
                  mastered: Array.from(masteredPoints)
              },
              methods: { 
                  missing: Array.from(missingMethods),
                  mastered: Array.from(masteredMethods)
              }
          });
      });

      await Promise.all(promises);
      setBatchAddStatus('success');
    } catch (error) {
      console.error(error);
      setBatchAddStatus('idle');
    }
  };

  return (
    <div ref={containerRef} className="space-y-8 mt-12 pt-12 border-t border-slate-200 scroll-mt-24">
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">批量学生答卷分析</h2>
                <p className="text-slate-500 mt-1">共 {results.length} 位学生，自动筛选错题与薄弱点</p>
            </div>
            
            <div className="relative">
                {isConfirmingBatchAdd ? (
                    <div className="flex items-center space-x-3 bg-white p-1.5 rounded-full border border-slate-200 shadow-lg animate-in fade-in slide-in-from-right-4">
                        <span className="text-sm font-bold text-slate-600 pl-3">确认全部加入?</span>
                        <button 
                            onClick={handleConfirmBatchAdd}
                            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                            title="确定"
                        >
                            <CheckIcon className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={handleCancelBatchAdd}
                            className="bg-slate-100 text-slate-500 p-2 rounded-full hover:bg-slate-200 transition-colors"
                            title="取消"
                        >
                            <XIcon className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleBatchAddClick}
                        disabled={batchAddStatus !== 'idle'}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-full font-bold shadow-lg text-lg transition-all transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2
                            ${batchAddStatus === 'success' 
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white cursor-default focus:ring-emerald-500' 
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-indigo-200 focus:ring-indigo-500'
                            }
                            ${batchAddStatus === 'loading' ? 'opacity-75 cursor-wait' : ''}
                        `}
                    >
                        {batchAddStatus === 'loading' ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>批量处理中...</span>
                            </>
                        ) : batchAddStatus === 'success' ? (
                            <>
                                <CheckCircleIcon className="w-6 h-6" />
                                <span>全部已加入</span>
                            </>
                        ) : (
                            <>
                                <BrainIcon className="w-6 h-6" />
                                <span>全部加入知识图谱</span>
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>

        <div>
            {currentStudents.map((student, idx) => {
                const realIndex = (page - 1) * ITEMS_PER_PAGE + idx;
                return (
                    <BatchStudentCard 
                        key={`${student.studentName}-${realIndex}`} 
                        studentIndex={realIndex}
                        student={student} 
                        questions={questions}
                        examTitle={examTitle}
                        onUpdateAnswer={onUpdateAnswer}
                    />
                );
            })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 pt-8">
                <button 
                    onClick={() => handlePageChange(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                    上一页
                </button>
                <span className="text-slate-600 text-sm">
                    第 {page} / {totalPages} 页
                </span>
                <button 
                    onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                    下一页
                </button>
            </div>
        )}
    </div>
  );
};
