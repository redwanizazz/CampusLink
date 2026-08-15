import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCgpa } from '../../api/academic';
import { Skeleton } from '../../components/ui/Skeleton';
import { Award, TrendingUp, BookOpen, Star } from 'lucide-react';

const statusStyle = {
  passed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  incomplete: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};

const GPA_MAX = 4.0;

const Results = () => {
  const { data: results = [], isLoading } = useQuery({ queryKey: ['cgpa'], queryFn: getCgpa });

  if (isLoading) return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48 rounded-lg" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
      </div>
    </div>
  );

  if (results.length === 0) return (
    <div className="text-center py-20 text-gray-500">
      <Award className="w-14 h-14 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
      <p className="text-lg font-medium text-gray-700 dark:text-gray-300">No results published yet.</p>
      <p className="text-sm mt-1 text-gray-400">Your semester results will appear here once published by the admin.</p>
    </div>
  );

  const latest = results[results.length - 1];
  const bestGpa = Math.max(...results.map(r => Number(r.gpa)));
  const totalCredits = results.reduce((sum, r) => sum + (r.total_credits || 0), 0);

  const stats = [
    { label: 'Current CGPA', value: Number(latest.cgpa).toFixed(2), icon: TrendingUp, color: 'text-indigo-600 dark:text-indigo-400' },
    { label: 'Best GPA', value: Number(bestGpa).toFixed(2), icon: Star, color: 'text-amber-500 dark:text-amber-400' },
    { label: 'Total Credits', value: totalCredits, icon: BookOpen, color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Semesters', value: results.length, icon: Award, color: 'text-purple-600 dark:text-purple-400' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Semester Results</h1>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex flex-col items-center text-center">
            <Icon className={`w-6 h-6 mb-2 ${color}`} />
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* CGPA Progression Bar Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">CGPA Progression</p>
        <div className="flex items-end gap-3 h-24">
          {results.map((r, i) => {
            const pct = Math.round((Number(r.cgpa) / GPA_MAX) * 100);
            return (
              <div key={r.id} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
                  {Number(r.cgpa).toFixed(2)}
                </span>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-t-md overflow-hidden" style={{ height: '72px' }}>
                  <div
                    className="w-full bg-indigo-500 dark:bg-indigo-600 rounded-t-md transition-all duration-500"
                    style={{ height: `${pct}%`, marginTop: `${100 - pct}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-400 truncate w-full text-center">S{r.semester}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Semester Cards */}
      <div className="space-y-4">
        {results.map((r) => {
          const gpaPct = Math.round((Number(r.gpa) / GPA_MAX) * 100);
          return (
            <div
              key={r.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      Semester {r.semester}
                    </p>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusStyle[r.result_status] ?? statusStyle.incomplete}`}>
                      {r.result_status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {r.academic_year} &middot; {r.total_credits} credits
                  </p>

                  {/* GPA bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">GPA</span>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{Number(r.gpa).toFixed(2)} / {GPA_MAX.toFixed(1)}</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${r.result_status === 'failed' ? 'bg-red-500' : 'bg-indigo-500'}`}
                        style={{ width: `${gpaPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8 sm:flex-shrink-0">
                  <div className="text-center">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">GPA</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {Number(r.gpa).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">CGPA</p>
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {Number(r.cgpa).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Results;
