import React, { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/useAuthStore';
import { register as registerApi } from '../../api/auth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { BookOpen, GraduationCap, ArrowRight, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';

const step1Schema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const step2Schema = z.object({
  student_id: z.string().min(3, 'Student ID is required'),
  department_id: z.string().min(1, 'Department is required'),
  batch: z.string().min(1, 'Batch is required'),
});

const Register = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({});

  const { register: register1, handleSubmit: handleSubmit1, formState: { errors: errors1 } } = useForm({
    resolver: zodResolver(step1Schema),
  });

  const { register: register2, handleSubmit: handleSubmit2, formState: { errors: errors2 } } = useForm({
    resolver: zodResolver(step2Schema),
  });

  const onStep1Submit = (data) => {
    setFormData({ ...formData, ...data });
    setStep(2);
  };

  const onStep2Submit = async (data) => {
    const finalData = { ...formData, ...data, department_id: parseInt(data.department_id) };
    try {
      setIsLoading(true);
      const response = await registerApi(finalData);
      setAuth(response.user, response.accessToken);
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center text-indigo-600 dark:text-indigo-400">
          <GraduationCap size={48} strokeWidth={1.5} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Join CampusLink
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 transition-colors">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-white/20 dark:border-gray-700/50">
          
          {/* Progress Indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-2">
              <div className={`h-2 w-12 rounded-full ${step >= 1 ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
              <div className={`h-2 w-12 rounded-full ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
            </div>
          </div>

          {step === 1 && (
            <form className="space-y-6 animate-fadeIn" onSubmit={handleSubmit1(onStep1Submit)}>
              <Input
                id="full_name"
                label="Full Name"
                {...register1('full_name')}
                error={errors1.full_name}
              />
              <Input
                id="email"
                label="Academic Email"
                type="email"
                {...register1('email')}
                error={errors1.email}
              />
              <Input
                id="password"
                label="Password"
                type="password"
                {...register1('password')}
                error={errors1.password}
              />
              <Button type="submit" className="group">
                Next Step <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>
          )}

          {step === 2 && (
            <form className="space-y-6 animate-fadeIn" onSubmit={handleSubmit2(onStep2Submit)}>
              <Input
                id="student_id"
                label="Student ID"
                {...register2('student_id')}
                error={errors2.student_id}
              />
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Department
                </label>
                <select
                  {...register2('department_id')}
                  className={`block w-full px-3 py-2 border ${
                    errors2.department_id ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500'
                  } rounded-md shadow-sm bg-white dark:bg-gray-800 dark:text-white`}
                >
                  <option value="">Select Department</option>
                  <option value="1">Computer Science and Engineering</option>
                  <option value="2">Electrical and Electronic Engineering</option>
                  <option value="3">Business Administration</option>
                </select>
                {errors2.department_id && <p className="mt-2 text-sm text-red-600">{errors2.department_id.message}</p>}
              </div>
              <Input
                id="batch"
                label="Batch Year (e.g. 2023)"
                {...register2('batch')}
                error={errors2.batch}
              />
              <div className="flex space-x-3">
                <Button type="button" variant="secondary" onClick={() => setStep(1)} className="w-1/3">
                  <ArrowLeft className="mr-2 w-4 h-4" /> Back
                </Button>
                <Button type="submit" disabled={isLoading} className="w-2/3">
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
