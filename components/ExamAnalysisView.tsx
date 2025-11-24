
import React, { useState } from 'react';
import { Question, AnalysisTags } from '../types';
import { BookOpenIcon, CheckIcon, EditIcon, SaveIcon, XIcon } from './Icons';
import { Spinner } from './Spinner';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ExamAnalysisViewProps {
  questions: Question[];
  onUpdateQuestion: (id: string, updates: Partial<Question>) => void;
}

// Internal state for the edit form which holds string representations of arrays
// allowing users to type commas freely without immediate parsing
interface EditFormState {
  chapter: string;
  difficulty: number;
  knowledgePoints: string;
  methods: string;
  competencies: string;
}

const QuestionCard: React.FC<{ question: Question, onUpdate: (id: string, updates: Partial<Question>) => void }> = ({ question: q, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);

  const handleEditClick = () => {
    if (q.analysis) {
      // Convert arrays to comma-separated strings for editing
      setEditForm({
          chapter: q.analysis.chapter,
          difficulty: q.analysis.difficulty,
          knowledgePoints: q.analysis.knowledgePoints.join(", "),
          methods: q.analysis.methods.join(", "),
          competencies: q.analysis.competencies.join(", ")
      });
      setIsEditing(true);
    }
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditForm(null);
  };

  const handleSaveClick = () => {
    if (editForm) {
      // Ensure difficulty is within bounds
      const difficulty = Math.max(1, Math.min(10, editForm.difficulty));
      
      // Parse strings back to arrays
      // Supports English comma (,), Chinese comma (，), and Ideographic comma (、)
      const splitRegex = /[,，、]/;
      
      const newAnalysis: AnalysisTags = {
          chapter: editForm.chapter,
          difficulty: difficulty,
          knowledgePoints: editForm.knowledgePoints.split(splitRegex).map(s => s.trim()).filter(Boolean),
          methods: editForm.methods.split(splitRegex).map(s => s.trim()).filter(Boolean),
          competencies: editForm.competencies.split(splitRegex).map(s => s.trim()).filter(Boolean)
      };

      onUpdate(q.id, { 
        analysis: newAnalysis,
        isVerified: true 
      });
      setIsEditing(false);
      setEditForm(null);
    }
  };

  const handleVerifyClick = () => {
    onUpdate(q.id, { isVerified: true });
  };

  const handleInputChange = (field: keyof EditFormState, value: any) => {
     if (editForm) {
         setEditForm({ ...editForm, [field]: value });
     }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col md:flex-row transition-all hover:shadow-md ${q.isVerified ? 'border-green-200 ring-1 ring-green-100' : 'border-slate-200'}`}>
      {/* Left: Question Content */}
      <div className="md:w-1/2 p-6 border-b md:border-b-0 md:border-r border-slate-100">
        <div className="flex justify-between items-start mb-4">
            <span className={`px-3 py-1 rounded-md text-sm font-bold ${q.isVerified ? 'bg-green-600 text-white' : 'bg-slate-800 text-white'}`}>
                第 {q.number} 题 {q.isVerified && '✓'}
            </span>
            {q.isAnalyzing && <span className="text-xs text-indigo-500 font-medium animate-pulse">正在分析内容...</span>}
        </div>
        <div className="mb-4">
            <MarkdownRenderer content={q.contentMd} />
        </div>
        <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
            <img src={q.imageUrl} alt={`Question ${q.number}`} className="w-full h-auto opacity-90" />
        </div>
      </div>

      {/* Right: Analysis Data */}
      <div className="md:w-1/2 p-6 bg-slate-50/50 flex flex-col justify-center relative group">
        {q.isAnalyzing ? (
            <div className="h-full flex flex-col items-center justify-center space-y-3 text-slate-400">
                <Spinner size="md" />
                <p>正在提取分析点...</p>
            </div>
        ) : q.analysis ? (
            <div className="space-y-6">
                {/* Toolbar - Moved to Bottom Right */}
                <div className="absolute bottom-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {!isEditing ? (
                        <>
                            <button 
                                onClick={handleVerifyClick}
                                className={`p-2 rounded-full transition-colors ${q.isVerified ? 'bg-green-100 text-green-700 cursor-default' : 'bg-white text-slate-400 hover:bg-green-50 hover:text-green-600 shadow-sm border border-slate-200'}`}
                                title="确认分析无误"
                                disabled={q.isVerified}
                            >
                                <CheckIcon className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={handleEditClick}
                                className="p-2 bg-white text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-full shadow-sm border border-slate-200 transition-colors"
                                title="编辑分析内容"
                            >
                                <EditIcon className="w-4 h-4" />
                            </button>
                        </>
                    ) : (
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
                    )}
                </div>

                {isEditing && editForm ? (
                    /* EDIT MODE */
                    <div className="space-y-4 pt-2">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">教材章节</label>
                            <input 
                                type="text" 
                                value={editForm.chapter} 
                                onChange={(e) => handleInputChange('chapter', e.target.value)}
                                className="w-full text-sm border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">难度 (1-10)</label>
                            <input 
                                type="number" 
                                min="1" max="10"
                                value={editForm.difficulty} 
                                onChange={(e) => handleInputChange('difficulty', parseInt(e.target.value))}
                                className="w-20 text-sm border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-blue-700 uppercase mb-1">知识点</label>
                            <textarea 
                                value={editForm.knowledgePoints}
                                onChange={(e) => handleInputChange('knowledgePoints', e.target.value)}
                                rows={2}
                                placeholder="支持使用逗号(,)、中文逗号(，)或顿号(、)分隔"
                                className="w-full text-sm border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-emerald-700 uppercase mb-1">解题方法</label>
                            <textarea 
                                value={editForm.methods}
                                onChange={(e) => handleInputChange('methods', e.target.value)}
                                rows={2}
                                placeholder="支持使用逗号(,)、中文逗号(，)或顿号(、)分隔"
                                className="w-full text-sm border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                            />
                        </div>
                         <div>
                            <label className="block text-xs font-bold text-purple-700 uppercase mb-1">核心素养</label>
                            <textarea 
                                value={editForm.competencies}
                                onChange={(e) => handleInputChange('competencies', e.target.value)}
                                rows={2}
                                placeholder="支持使用逗号(,)、中文逗号(，)或顿号(、)分隔"
                                className="w-full text-sm border-slate-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                            />
                        </div>
                    </div>
                ) : (
                    /* VIEW MODE */
                    <>
                    {/* Difficulty & Chapter Header */}
                    <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                        <div className="flex items-center space-x-2">
                            <BookOpenIcon className="w-5 h-5 text-slate-400" />
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-semibold">教材章节</p>
                                <p className="text-sm font-medium text-slate-800">{q.analysis.chapter}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">难度系数</p>
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
                            知识点
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
                            解题方法
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
                            核心素养
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {q.analysis.competencies.map(cp => (
                                <span key={cp} className="px-2.5 py-1 bg-white text-purple-700 text-xs font-medium rounded-md border border-purple-200 shadow-sm">
                                    {cp}
                                </span>
                            ))}
                        </div>
                    </div>
                    </>
                )}

            </div>
        ) : (
            <div className="text-red-500">分析失败</div>
        )}
      </div>
    </div>
  );
};

export const ExamAnalysisView: React.FC<ExamAnalysisViewProps> = ({ questions, onUpdateQuestion }) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">试卷分析结果</h2>
        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
          {questions.length} 道题目已处理
        </span>
      </div>

      <div className="grid gap-6">
        {questions.map((q) => (
          <QuestionCard key={q.id} question={q} onUpdate={onUpdateQuestion} />
        ))}
      </div>
    </div>
  );
};
