import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMarks } from '../../api/academic';
import { Skeleton } from '../../components/ui/Skeleton';
import { BookOpen } from 'lucide-react';

const examOrder = ['CT1', 'CT2', 'CT3', 'assignment', 'midterm', 'final'];

const Marks = () => {
  const { data = [], isLoading } = useQuery({ queryKey: ['marks'], queryFn: getMarks });

  if (isLoading) return (
    <div className="space-y-4">
      {[1, 2].map(i => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Marks</h1>

      {data.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p>No marks recorded yet.</p>
        </div>
      ) : (
        data.map(item => {
          const sorted = [...item.marks].sort((a, b) => examOrder.indexOf(a.exam_type) - examOrder.indexOf(b.exam_type));
          return (
            <div key={item.enrollment_id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.course.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{item.course.code}</p>

              {item.marks.length === 0 ? (
                <p className="text-sm text-gray-400">No marks recorded for this course yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-500 border-b dark:border-gray-700">
                        <th className="text-left py-2 font-medium">Exam</th>
                        <th className="text-right py-2 font-medium">Obtained</th>
                        <th className="text-right py-2 font-medium">Total</th>
                        <th className="text-right py-2 font-medium">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map(m => {
                        const pct = Math.round((m.marks_obtained / m.total_marks) * 100);
                        return (
                          <tr key={m.id} className="border-b dark:border-gray-700 last:border-0">
                            <td className="py-2 text-gray-700 dark:text-gray-300 capitalize">{m.exam_type}</td>
                            <td className="py-2 text-right font-medium text-gray-900 dark:text-white">{m.marks_obtained}</td>
                            <td className="py-2 text-right text-gray-500">{m.total_marks}</td>
                            <td className={`py-2 text-right font-medium ${pct >= 60 ? 'text-green-600' : 'text-red-600'}`}>{pct}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default Marks;
