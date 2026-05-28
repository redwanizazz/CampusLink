import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEvent, rsvpEvent } from '../../api/event';
import { useAuthStore } from '../../store/useAuthStore';
import Avatar from '../../components/ui/Avatar';
import { Skeleton } from '../../components/ui/Skeleton';
import { Calendar, MapPin, Phone, Users, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const RSVP_OPTIONS = [
  { status: 'going', label: 'Going', cls: 'bg-green-600 hover:bg-green-700' },
  { status: 'interested', label: 'Interested', cls: 'bg-yellow-500 hover:bg-yellow-600' },
  { status: 'not_going', label: 'Not Going', cls: 'bg-gray-500 hover:bg-gray-600' },
];

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: event, isLoading } = useQuery({ queryKey: ['event', id], queryFn: () => getEvent(id) });

  const rsvpMutation = useMutation({
    mutationFn: (status) => rsvpEvent(id, status),
    onSuccess: () => {
      toast.success('RSVP saved!');
      queryClient.invalidateQueries({ queryKey: ['event', id] });
    },
    onError: () => toast.error('Failed to RSVP')
  });

  if (isLoading) return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );

  if (!event) return <div className="text-center py-16 text-gray-500">Event not found.</div>;

  const myRsvp = event.EventRSVPs?.find(r => r.user_id === user?.id);
  const going = event.EventRSVPs?.filter(r => r.status === 'going').length || 0;
  const interested = event.EventRSVPs?.filter(r => r.status === 'interested').length || 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button type="button" onClick={() => navigate(-1)} className="flex items-center text-sm text-gray-500 hover:text-indigo-600 transition-colors">
        <ArrowLeft className="size-4 mr-1" /> Back
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="h-4 bg-gradient-to-r from-indigo-500 to-purple-500" />
        <div className="p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{event.title}</h1>
            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 text-sm rounded-full capitalize flex-shrink-0">{event.location_type}</span>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-indigo-500" />
              <span>{format(new Date(event.start_time), 'PPp')} – {format(new Date(event.end_time), 'p')}</span>
            </div>
            {event.venue && (
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-indigo-500" />
                <span>{event.venue}</span>
              </div>
            )}
            {event.contact_info && (
              <div className="flex items-center gap-2">
                <Phone className="size-4 text-indigo-500" />
                <span>{event.contact_info}</span>
              </div>
            )}
          </div>

          {event.description && (
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{event.description}</p>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Avatar user={event.Organizer} size="sm" />
            <span>Organised by <strong className="text-gray-800 dark:text-gray-200">{event.Organizer?.full_name}</strong></span>
          </div>

          {/* RSVP stats */}
          <div className="flex items-center gap-4 py-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
              <Users className="size-4" />
              <span>{going} going · {interested} interested</span>
            </div>
          </div>

          {/* RSVP buttons */}
          <div className="flex flex-wrap gap-3">
            {RSVP_OPTIONS.map(({ status, label, cls }) => (
              <button
                type="button"
                key={status}
                onClick={() => rsvpMutation.mutate(status)}
                disabled={rsvpMutation.isPending}
                className={`px-5 py-2 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60 ${cls} ${myRsvp?.status === status ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
