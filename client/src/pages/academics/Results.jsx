import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCgpa } from '../../api/academic';
import { Skeleton } from '../../components/ui/Skeleton';
import { Award } from 'lucide-react';

const statusStyle = {
  passed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  incomplete: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};

const Results = () => {
  const { data: results = [], isLoading } = useQuery({ queryKey: ['cgpa'], queryFn: getCgpa });

  if (isLoading) return <Skeleton className="h-64 w-full rounded-xl" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Semester Results</h1>

      {results.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Award className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p>No results published yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((r) => (
            <div
              key={r.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{r.academic_year}</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mt-0.5">
                  Semester {r.semester}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {r.total_credits} credits completed
                </p>
              </div>

              <div className="flex items-center gap-6">
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
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${statusStyle[r.result_status] ?? statusStyle.incomplete}`}
                >
                  {r.result_status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Results;
