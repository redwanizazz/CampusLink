import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAttendance } from '../../api/academic';
import { Skeleton } from '../../components/ui/Skeleton';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

const statusIcon = { present: <CheckCircle className="w-4 h-4 text-green-500" />, absent: <XCircle className="w-4 h-4 text-red-500" />, late: <Clock className="w-4 h-4 text-yellow-500" />, excused: <AlertCircle className="w-4 h-4 text-blue-500" /> };
const statusColor = { present: 'text-green-600 bg-green-50', absent: 'text-red-600 bg-red-50', late: 'text-yellow-600 bg-yellow-50', excused: 'text-blue-600 bg-blue-50' };

const Attendance = () => {
  const { data = [], isLoading } = useQuery({ queryKey: ['attendance'], queryFn: getAttendance });

  if (isLoading) return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance</h1>

      {data.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p>No enrollment records found.</p>
        </div>
      ) : (
        data.map(item => {
          const pct = item.summary.percentage;
          const barColor = pct === null ? 'bg-gray-300' : pct >= 75 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-red-500';
          return (
            <div key={item.enrollment_id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{item.course.title}</h3>
                  <p className="text-sm text-gray-500">{item.course.code} · {item.course.credit_hours} credits</p>
                </div>
                <div className="text-right">
                  <span className={`text-2xl font-bold ${pct === null ? 'text-gray-400' : pct >= 75 ? 'text-green-600' : pct >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {pct !== null ? `${pct}%` : 'N/A'}
                  </span>
                  <p className="text-xs text-gray-400">{item.summary.present + item.summary.late}/{item.summary.total} classes</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
                <div className={`h-2 rounded-full transition-all ${barColor}`} style={{ width: `${pct ?? 0}%` }} />
              </div>

              <div className="flex space-x-4 text-sm mb-4">
                {[['Present', item.summary.present, 'text-green-600'], ['Late', item.summary.late, 'text-yellow-600'], ['Absent', item.summary.absent, 'text-red-600']].map(([label, val, cls]) => (
                  <span key={label} className={`${cls} font-medium`}>{label}: {val}</span>
                ))}
              </div>

              {/* Records table */}
              {item.records.length > 0 && (
                <details className="mt-2">
                  <summary className="text-sm text-indigo-600 cursor-pointer hover:underline">View records ({item.records.length})</summary>
                  <div className="mt-3 overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-xs text-gray-500 border-b dark:border-gray-700">
                          <th className="text-left py-2">Date</th>
                          <th className="text-left py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.records.map(r => (
                          <tr key={r.id} className="border-b dark:border-gray-700 last:border-0">
                            <td className="py-2 text-gray-700 dark:text-gray-300">{new Date(r.class_date).toLocaleDateString()}</td>
                            <td className="py-2">
                              <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[r.status]}`}>
                                {statusIcon[r.status]}
                                <span className="capitalize">{r.status}</span>
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default Attendance;
