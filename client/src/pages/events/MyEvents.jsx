import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMyEvents } from '../../api/event';
import { Link } from 'react-router-dom';
import { Skeleton } from '../../components/ui/Skeleton';
import { Calendar, Plus } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { format } from 'date-fns';

const MyEvents = () => {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({ queryKey: ['my-events'], queryFn: getMyEvents });
  const canCreate = user?.role === 'faculty' || user?.role === 'admin';

  if (isLoading) return <Skeleton className="h-64 w-full rounded-xl" />;

  const { organized = [], attending = [] } = data || {};

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Events</h1>
        {canCreate && (
          <Link to="/events/create" className="flex items-center space-x-1 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            <Plus className="w-4 h-4" /> <span>Create</span>
          </Link>
        )}
      </div>

      {canCreate && (
        <section>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Events I Organised ({organized.length})</h2>
          {organized.length === 0 ? <p className="text-sm text-gray-400">None yet.</p> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {organized.map(ev => (
                <Link key={ev.id} to={`/events/${ev.id}`} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">{ev.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 flex items-center"><Calendar className="w-3 h-3 mr-1" />{format(new Date(ev.start_time), 'PP')}</p>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Events I'm Attending ({attending.length})</h2>
        {attending.length === 0 ? <p className="text-sm text-gray-400">No RSVPs yet. <Link to="/events" className="text-indigo-600 hover:underline">Browse events</Link></p> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {attending.map(rsvp => (
              <Link key={rsvp.id} to={`/events/${rsvp.Event?.id}`} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">{rsvp.Event?.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ml-2 flex-shrink-0 ${rsvp.status === 'going' ? 'bg-green-100 text-green-700' : rsvp.status === 'interested' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>{rsvp.status}</span>
                </div>
                {rsvp.Event?.start_time && <p className="text-xs text-gray-500 flex items-center"><Calendar className="w-3 h-3 mr-1" />{format(new Date(rsvp.Event.start_time), 'PP')}</p>}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default MyEvents;
