import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/useAuthStore';
import { login as loginApi } from '../../api/auth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { BookOpen } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Login = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const response = await loginApi(data);
      setAuth(response.user, response.accessToken);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center text-indigo-600 dark:text-indigo-400">
          <BookOpen size={48} strokeWidth={1.5} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Welcome back to CampusLink
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Or{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
            create a new student account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-white/20 dark:border-gray-700/50">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <Input
              id="email"
              label="Email address"
              type="email"
              autoComplete="email"
              {...register('email')}
              error={errors.email}
            />

            <Input
              id="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
              error={errors.password}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
