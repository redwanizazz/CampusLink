import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createNotice } from '../../api/notice';
import { getDepartments } from '../../api/department';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

const CreateNotice = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { priority: 'normal' } });
  const { data: departments = [] } = useQuery({ queryKey: ['departments'], queryFn: getDepartments });

  const mutation = useMutation({
    mutationFn: createNotice,
    onSuccess: () => {
      toast.success('Notice posted!');
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      navigate('/noticeboard');
    },
    onError: () => toast.error('Failed to post notice')
  });

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-5">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Post a Notice</h1>

        <form onSubmit={handleSubmit(d => mutation.mutate({ ...d, department_id: d.department_id || null }))} className="space-y-5">
          <Input id="title" label="Title" {...register('title', { required: 'Title is required' })} error={errors.title} />

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
            <textarea id="content" rows={6} {...register('content', { required: 'Content is required' })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 dark:text-white focus:ring-indigo-500 text-sm resize-none" placeholder="Notice content…" />
            {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
              <select id="priority" {...register('priority')} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 dark:text-white text-sm">
                <option value="normal">Normal</option>
                <option value="important">Important</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label htmlFor="department_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department (optional)</label>
              <select id="department_id" {...register('department_id')} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 dark:text-white text-sm">
                <option value="">Institute-wide</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>

          <Button type="submit" disabled={mutation.isPending} className="w-auto px-8">
            {mutation.isPending ? 'Posting...' : 'Post Notice'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateNotice;
