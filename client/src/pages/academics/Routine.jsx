import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRoutine } from '../../api/academic';
import { Skeleton } from '../../components/ui/Skeleton';
import { Clock } from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Routine = () => {
  const { data: routine = [], isLoading } = useQuery({ queryKey: ['routine'], queryFn: getRoutine });

  if (isLoading) return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
    </div>
  );

  const byDay = DAYS.reduce((acc, d) => {
    acc[d] = routine.filter(r => r.day_of_week === d);
    return acc;
  }, {});

  const activeDays = DAYS.filter(d => byDay[d].length > 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Class Routine</h1>

      {activeDays.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p>No routine scheduled yet.</p>
        </div>
      ) : (
        activeDays.map(day => (
          <div key={day} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b dark:border-gray-700">{day}</h3>
            <div className="space-y-3">
              {byDay[day].map(r => (
                <div key={r.id} className="flex items-center space-x-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg px-4 py-3">
                  <div className="text-indigo-600 dark:text-indigo-400 text-sm font-mono whitespace-nowrap">
                    {r.start_time} – {r.end_time}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{r.Course?.title}</p>
                    <p className="text-xs text-gray-500">{r.Course?.code} · Room {r.room}</p>
                  </div>
                  {r.Instructor && (
                    <p className="text-xs text-gray-400 hidden sm:block">{r.Instructor.full_name}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Routine;
