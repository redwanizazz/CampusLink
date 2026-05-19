import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpen, ArrowLeft, CheckCircle } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { resetPassword } from '../../api/auth';
import toast from 'react-hot-toast';

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ password }) => {
    try {
      await resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Reset failed. The link may have expired.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center text-indigo-600 dark:text-indigo-400">
          <BookOpen size={48} strokeWidth={1.5} />
        </div>
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Set a new password
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Choose a strong password for your CampusLink account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-white/20 dark:border-gray-700/50">
          {success ? (
            <div className="text-center space-y-4">
              <CheckCircle className="w-14 h-14 text-green-500 mx-auto" />
              <p className="text-gray-800 dark:text-gray-200 font-semibold text-lg">Password updated!</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Redirecting you to sign in…
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                id="password"
                label="New password"
                type="password"
                autoComplete="new-password"
                {...register('password')}
                error={errors.password}
              />
              <Input
                id="confirmPassword"
                label="Confirm new password"
                type="password"
                autoComplete="new-password"
                {...register('confirmPassword')}
                error={errors.confirmPassword}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Reset password'}
              </Button>
              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
