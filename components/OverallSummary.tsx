import React from 'react';
import { Question } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

interface OverallSummaryProps {
  questions: Question[];
}

export const OverallSummary: React.FC<OverallSummaryProps> = ({ questions }) => {
  // 1. Compute Exam Difficulty Stats
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

  // 2. Compute Stats for analysis category (Frequency in Exam)
  const computeCategoryStats = (categoryKey: 'knowledgePoints' | 'methods' | 'competencies') => {
    const allTags = questions.flatMap(q => q.analysis?.[categoryKey] || []);
    // Count occurrences
    const counts: Record<string, number> = {};
    allTags.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
    });

    return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5
  };

  const kpStats = computeCategoryStats('knowledgePoints');
  const methodStats = computeCategoryStats('methods');
  const compStats = computeCategoryStats('competencies');

  // Helper component for mini chart
  const StatChart = ({ data, color, title, barColor }: { data: any[], color: string, title: string, barColor: string }) => (
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
                    <Bar dataKey="count" name="题目数量" fill={barColor} radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
  );

  return (
    <div className="space-y-6 mb-8">
      {/* Top Row: Exam Metrics & Difficulty */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Exam Overview Card - 1 Column */}
        <div className="md:col-span-1 bg-indigo-600 rounded-xl p-6 text-white shadow-lg shadow-indigo-200 flex flex-col justify-between relative overflow-hidden">
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

        {/* Difficulty Distribution Chart - 2 Columns (Expanded) */}
        <div className="md:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-slate-400 font-medium text-xs uppercase tracking-wider mb-4">题目难度分布</h3>
          {questions.length > 0 && analyzedCount > 0 ? (
            <div className="h-32 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={difficultyData} barSize={32}>
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

      {/* Bottom Row: Detailed Metrics (Decoupled from student scores) */}
      {questions.length > 0 && (
         <div className="flex flex-wrap gap-6">
             <StatChart data={kpStats} color="bg-blue-500" barColor="#3b82f6" title="知识点分布" />
             <StatChart data={methodStats} color="bg-emerald-500" barColor="#10b981" title="解题方法分布" />
             <StatChart data={compStats} color="bg-purple-500" barColor="#a855f7" title="核心素养分布" />
         </div>
      )}
    </div>
  );
};