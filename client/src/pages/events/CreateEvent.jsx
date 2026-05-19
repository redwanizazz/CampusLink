import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { createEvent } from '../../api/event';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

const schema = z.object({
  title: z.string().min(3, 'Title required'),
  description: z.string().optional(),
  location_type: z.enum(['hall', 'department', 'auditorium', 'field', 'online', 'other']),
  venue: z.string().optional(),
  start_time: z.string().min(1, 'Start time required'),
  end_time: z.string().min(1, 'End time required'),
  contact_info: z.string().optional(),
  is_public: z.boolean().default(true),
});

const CreateEvent = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { location_type: 'auditorium', is_public: true } });

  const mutation = useMutation({
    mutationFn: createEvent,
    onSuccess: (ev) => {
      toast.success('Event created!');
      navigate(`/events/${ev.id}`);
    },
    onError: () => toast.error('Failed to create event')
  });

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Event</h1>

        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-5">
          <Input id="title" label="Event Title" {...register('title')} error={errors.title} />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea rows={4} {...register('description')} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none" placeholder="Event details..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location Type</label>
              <select {...register('location_type')} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 dark:text-white focus:ring-indigo-500 text-sm">
                {['hall', 'department', 'auditorium', 'field', 'online', 'other'].map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </div>
            <Input id="venue" label="Venue" {...register('venue')} error={errors.venue} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Time</label>
              <input type="datetime-local" {...register('start_time')} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 dark:text-white focus:ring-indigo-500 text-sm" />
              {errors.start_time && <p className="mt-1 text-sm text-red-600">{errors.start_time.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Time</label>
              <input type="datetime-local" {...register('end_time')} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 dark:text-white focus:ring-indigo-500 text-sm" />
              {errors.end_time && <p className="mt-1 text-sm text-red-600">{errors.end_time.message}</p>}
            </div>
          </div>

          <Input id="contact_info" label="Contact Info (optional)" {...register('contact_info')} />

          <div className="flex items-center space-x-2">
            <input type="checkbox" id="is_public" {...register('is_public')} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
            <label htmlFor="is_public" className="text-sm text-gray-700 dark:text-gray-300">Public event (visible to all)</label>
          </div>

          <Button type="submit" disabled={mutation.isPending} className="w-auto px-8">
            {mutation.isPending ? 'Creating...' : 'Create Event'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
