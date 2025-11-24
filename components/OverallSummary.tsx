import React from 'react';
import { Question, StudentAnswer } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

interface OverallSummaryProps {
  questions: Question[];
  studentAnswers?: StudentAnswer[];
}

export const OverallSummary: React.FC<OverallSummaryProps> = ({ questions, studentAnswers }) => {
  // 1. Compute Exam Difficulty Stats
  // Transform data for chart: X=Question No, Y=Difficulty
  const difficultyData = questions
    .filter(q => q.analysis)
    .map(q => ({
        name: `Q${q.number}`,
        difficulty: q.analysis!.difficulty,
        chapter: q.analysis!.chapter
    }));

  let totalDifficultySum = 0;
  let analyzedCount = 0;

  questions.forEach(q => {
    if (q.analysis) {
      totalDifficultySum += q.analysis.difficulty;
      analyzedCount++;
    }
  });

  const avgDifficulty = analyzedCount > 0 ? (totalDifficultySum / analyzedCount) : 0;

  // 2. Compute Student Stats
  const studentScore = studentAnswers ? studentAnswers.reduce((acc, a) => acc + a.score, 0) : 0;
  const maxScore = studentAnswers ? studentAnswers.reduce((acc, a) => acc + a.maxScore, 0) : 0;
  const percentage = maxScore > 0 ? Math.round((studentScore / maxScore) * 100) : 0;

  // 3. Helper to compute stats for a specific analysis category
  const computeCategoryStats = (categoryKey: 'knowledgePoints' | 'methods' | 'competencies') => {
    const allTags = Array.from(new Set(questions.flatMap(q => q.analysis?.[categoryKey] || [])));
    
    return allTags.map(tag => {
      const relatedQuestions = questions.filter(q => q.analysis?.[categoryKey].includes(tag));
      const totalQ = relatedQuestions.length;
      let masteredCount = 0;
      
      if (studentAnswers) {
          masteredCount = relatedQuestions.reduce((acc, q) => {
              const ans = studentAnswers.find(a => a.questionId === q.id);
              // We assume mastery if the student got the question correct
              return acc + (ans?.isCorrect ? 1 : 0);
          }, 0);
      }
  
      return {
          name: tag,
          total: totalQ,
          mastered: masteredCount,
          missing: totalQ - masteredCount
      };
    }).sort((a,b) => b.total - a.total).slice(0, 5); // Sort by prevalence and take top 5
  };

  const kpStats = computeCategoryStats('knowledgePoints');
  const methodStats = computeCategoryStats('methods');
  const compStats = computeCategoryStats('competencies');

  // Helper component for mini chart
  const StatChart = ({ data, color, title }: { data: any[], color: string, title: string }) => (
    <div className="flex-1 min-w-[300px] bg-white rounded-xl p-5 shadow-sm border border-slate-200">
        <h3 className="text-slate-400 font-medium text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${color}`}></span>
            {title}
        </h3>
        <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ left: 5, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={110} tick={{fontSize: 11, fill: '#64748b'}} interval={0} />
                    <Tooltip 
                        cursor={{fill: '#f8fafc'}}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                    />
                    <Bar dataKey="total" name="题目总数" fill="#f1f5f9" stackId="a" radius={[0, 4, 4, 0]} barSize={16} />
                    {studentAnswers && <Bar dataKey="mastered" name="已掌握" fill={color === 'bg-blue-500' ? '#3b82f6' : color === 'bg-emerald-500' ? '#10b981' : '#a855f7'} stackId="a" radius={[0, 0, 0, 0]} barSize={16} />}
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
  );

  return (
    <div className="space-y-6 mb-8">
      {/* Top Row: Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Exam Overview Card */}
        <div className="bg-indigo-600 rounded-xl p-6 text-white shadow-lg shadow-indigo-200 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full mix-blend-multiply filter blur-2xl opacity-50 transform translate-x-10 -translate-y-10"></div>
          
          <div>
            <h3 className="text-indigo-100 font-medium text-xs uppercase tracking-wider mb-1">试卷总难度</h3>
            <div className="flex items-end space-x-2">
              <span className="text-5xl font-bold">{avgDifficulty.toFixed(1)}</span>
              <span className="text-indigo-200 mb-1">/ 10</span>
            </div>
            <div className="mt-2 w-full bg-indigo-800/30 rounded-full h-1.5">
               <div className="bg-white h-1.5 rounded-full transition-all duration-1000" style={{ width: `${avgDifficulty * 10}%` }}></div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-between text-sm border-t border-indigo-500/50 pt-4">
             <div>
                <span className="block font-bold text-xl">{questions.length}</span>
                <span className="text-indigo-200 text-xs">题目数量</span>
             </div>
             <div className="text-right">
                <span className="block font-bold text-xl">{kpStats.length}</span>
                <span className="text-indigo-200 text-xs">核心考点</span>
             </div>
          </div>
        </div>

        {/* Student Score Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
            <h3 className="text-slate-400 font-medium text-xs uppercase tracking-wider mb-2">学生得分</h3>
            {studentAnswers && studentAnswers.length > 0 ? (
                <div className="flex items-center space-x-6">
                    <div className="relative w-24 h-24 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="48" cy="48" r="42" className="text-slate-100" strokeWidth="8" stroke="currentColor" fill="none" />
                            <circle cx="48" cy="48" r="42" className={percentage >= 80 ? "text-emerald-500" : percentage >= 60 ? "text-amber-500" : "text-rose-500"} strokeWidth="8" stroke="currentColor" fill="none" strokeDasharray={`${percentage * 2.64} 264`} strokeLinecap="round" />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-2xl font-bold text-slate-800">{percentage}%</span>
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-slate-500">总分</div>
                        <div className="text-3xl font-bold text-slate-800">{studentScore} <span className="text-lg text-slate-300">/ {maxScore}</span></div>
                        <div className={`text-xs font-semibold px-2 py-0.5 rounded mt-1 inline-block ${percentage >= 60 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            {percentage >= 60 ? '及格' : '需复习'}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                    <div className="w-12 h-12 rounded-full bg-slate-50 mb-2 border border-slate-100"></div>
                    <span className="text-sm italic">等待上传答题卡...</span>
                </div>
            )}
        </div>

        {/* Difficulty Distribution Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-slate-400 font-medium text-xs uppercase tracking-wider mb-4">题目难度分布</h3>
          {questions.length > 0 && analyzedCount > 0 ? (
            <div className="h-32 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={difficultyData} barSize={24}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis 
                        dataKey="name" 
                        tick={{fontSize: 10, fill: '#64748b'}} 
                        interval={0} 
                        axisLine={false}
                        tickLine={false}
                     />
                     <YAxis 
                        hide={false} 
                        domain={[0, 10]} 
                        width={20}
                        tick={{fontSize: 9, fill: '#cbd5e1'}}
                        axisLine={false}
                        tickLine={false}
                     />
                     <Tooltip 
                        cursor={{fill: '#f8fafc'}}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                        labelStyle={{ color: '#64748b', fontWeight: 'bold' }}
                     />
                     <Bar dataKey="difficulty" name="难度" radius={[4, 4, 0, 0]}>
                        {difficultyData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.difficulty <= 4 ? '#10b981' : entry.difficulty <= 7 ? '#f59e0b' : '#ef4444'} />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
          ) : (
             <div className="h-32 flex items-center justify-center text-slate-300 text-sm italic">
                正在分析难度...
             </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Detailed Metrics */}
      {questions.length > 0 && (
         <div className="flex flex-wrap gap-6">
             <StatChart data={kpStats} color="bg-blue-500" title="知识点覆盖" />
             <StatChart data={methodStats} color="bg-emerald-500" title="解题方法" />
             <StatChart data={compStats} color="bg-purple-500" title="核心素养" />
         </div>
      )}
    </div>
  );
};