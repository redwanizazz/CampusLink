import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCgpa } from '../../api/academic';
import { Skeleton } from '../../components/ui/Skeleton';
import { TrendingUp } from 'lucide-react';

const CGPA = () => {
  const { data: results = [], isLoading } = useQuery({ queryKey: ['cgpa'], queryFn: getCgpa });

  if (isLoading) return <Skeleton className="h-64 w-full rounded-xl" />;

  const latest = results[results.length - 1];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CGPA History</h1>

      {results.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p>No results published yet.</p>
        </div>
      ) : (
        <>
          {latest && (
            <div className="bg-indigo-600 rounded-2xl p-6 text-white flex items-center justify-between">
              <div>
                <p className="text-indigo-200 text-sm">Current CGPA</p>
                <p className="text-5xl font-bold mt-1">{Number(latest.cgpa).toFixed(2)}</p>
                <p className="text-indigo-200 text-sm mt-1">{latest.academic_year} · Semester {latest.semester}</p>
              </div>
              <TrendingUp className="w-16 h-16 text-indigo-300" />
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {['Year', 'Semester', 'GPA', 'CGPA', 'Credits', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {results.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{r.academic_year}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{r.semester}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{Number(r.gpa).toFixed(2)}</td>
                    <td className="px-4 py-3 font-bold text-indigo-600">{Number(r.cgpa).toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{r.total_credits}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.result_status === 'passed' ? 'bg-green-100 text-green-700' : r.result_status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {r.result_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default CGPA;
