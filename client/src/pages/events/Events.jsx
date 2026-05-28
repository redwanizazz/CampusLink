import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getEvents } from '../../api/event';
import { Link } from 'react-router-dom';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { Calendar, MapPin, Plus } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { format } from 'date-fns';

const LOCATION_TYPES = ['hall', 'department', 'auditorium', 'field', 'online', 'other'];

const Events = () => {
  const { user } = useAuthStore();
  const [locFilter, setLocFilter] = useState('');
  const [upcoming, setUpcoming] = useState(false);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events', { location_type: locFilter, upcoming }],
    queryFn: () => getEvents({ location_type: locFilter || undefined, upcoming: upcoming ? 'true' : undefined })
  });

  const canCreate = user?.role === 'faculty' || user?.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Events</h1>
        <div className="flex items-center gap-3">
          <Link to="/events/my-events" className="text-sm text-indigo-600 hover:underline">My Events</Link>
          {canCreate && (
            <Link to="/events/create" className="flex items-center gap-1 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
              <Plus className="size-4" /> <span>Create Event</span>
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setUpcoming(!upcoming)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${upcoming ? 'bg-indigo-600 text-white border-indigo-600' : 'text-gray-600 border-gray-300 dark:text-gray-300 dark:border-gray-600 hover:border-indigo-400'}`}>
          Upcoming only
        </button>
        {LOCATION_TYPES.map(lt => (
          <button type="button" key={lt} onClick={() => setLocFilter(locFilter === lt ? '' : lt)} className={`px-3 py-1.5 rounded-full text-xs font-medium border capitalize transition-colors ${locFilter === lt ? 'bg-indigo-600 text-white border-indigo-600' : 'text-gray-600 border-gray-300 dark:text-gray-300 dark:border-gray-600 hover:border-indigo-400'}`}>
            {lt}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p>No events found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(ev => (
            <Link key={ev.id} to={`/events/${ev.id}`} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow group">
              <div className="h-3 bg-gradient-to-r from-indigo-500 to-purple-500" />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs rounded-full capitalize">{ev.location_type}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${new Date(ev.start_time) > new Date() ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                    {new Date(ev.start_time) > new Date() ? 'Upcoming' : 'Past'}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors mb-2 line-clamp-2">{ev.title}</h3>
                <div className="space-y-1 text-xs text-gray-500">
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{format(new Date(ev.start_time), 'PPp')}</span>
                  </div>
                  {ev.venue && (
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{ev.venue}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">by {ev.Organizer?.full_name}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;
