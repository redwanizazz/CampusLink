import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAnalytics } from '../../api/admin';
import { Skeleton } from '../../components/ui/Skeleton';
import { BarChart2, TrendingUp, Users, FileText } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const DEPT_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6'];

const shortDate = (dateStr) => format(parseISO(dateStr), 'MMM d');

const ChartCard = ({ title, icon: Icon, children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
    <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
      <Icon className="size-4 text-indigo-500" />
      {title}
    </h2>
    {children}
  </div>
);

const AxisTick = ({ x, y, payload }) => (
  <text x={x} y={y + 12} textAnchor="middle" fill="#9ca3af" fontSize={11}>
    {payload.value}
  </text>
);

const Analytics = () => {
  const { data, isLoading } = useQuery({ queryKey: ['admin-analytics'], queryFn: getAnalytics });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BarChart2 className="size-6 text-indigo-500" /> Analytics
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const userRegs = (data?.userRegistrations ?? []).map(d => ({ ...d, label: shortDate(d.date) }));
  const postAct = (data?.postActivity ?? []).map(d => ({ ...d, label: shortDate(d.date) }));
  const topEvents = data?.topEvents ?? [];
  const deptData = (data?.departmentBreakdown ?? []).filter(d => d.count > 0);

  const tickInterval = Math.floor(userRegs.length / 6);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <BarChart2 className="size-6 text-indigo-500" /> Analytics
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* User Registrations */}
        <ChartCard title="User Registrations — last 30 days" icon={Users}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={userRegs} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="label" tick={<AxisTick />} interval={tickInterval} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 8, color: '#f9fafb', fontSize: 12 }}
                labelStyle={{ color: '#a5b4fc' }}
              />
              <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fill="url(#regGrad)" name="New users" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Post Activity */}
        <ChartCard title="Post Activity — last 30 days" icon={FileText}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={postAct} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="postGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="label" tick={<AxisTick />} interval={tickInterval} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 8, color: '#f9fafb', fontSize: 12 }}
                labelStyle={{ color: '#86efac' }}
              />
              <Area type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={2} fill="url(#postGrad)" name="Posts" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top Events by RSVP */}
        <ChartCard title="Top Events by RSVP" icon={TrendingUp}>
          {topEvents.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">No event data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topEvents} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} width={110} />
                <Tooltip
                  contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 8, color: '#f9fafb', fontSize: 12 }}
                />
                <Bar dataKey="rsvps" fill="#f59e0b" radius={[0, 4, 4, 0]} name="RSVPs" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Department Breakdown */}
        <ChartCard title="Users by Department" icon={Users}>
          {deptData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">No department data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={deptData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  dataKey="count"
                  nameKey="name"
                  paddingAngle={3}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {deptData.map((_, i) => (
                    <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 8, color: '#f9fafb', fontSize: 12 }}
                  formatter={(value, name) => [value, name]}
                />
                <Legend formatter={(value) => <span style={{ color: '#9ca3af', fontSize: 12 }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

      </div>
    </div>
  );
};

export default Analytics;
