import React, { useState, useRef } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/useAuthStore';
import { register as registerApi } from '../../api/auth';
import { uploadAvatar } from '../../api/user';
import { getDepartments } from '../../api/department';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { GraduationCap, ArrowRight, ArrowLeft, Camera, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import Avatar from '../../components/ui/Avatar';

const step1Schema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const step2Schema = z.object({
  student_id: z.string().min(3, 'Student ID is required'),
  department_id: z.string().min(1, 'Department is required'),
  batch: z.string().min(4, 'Batch year is required'),
});

const Register = () => {
  const navigate = useNavigate();
  const { setAuth, token } = useAuthStore();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const formData = useRef({});
  const [registeredUser, setRegisteredUser] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments
  });

  const { register: reg1, handleSubmit: hs1, formState: { errors: e1 } } = useForm({ resolver: zodResolver(step1Schema) });
  const { register: reg2, handleSubmit: hs2, formState: { errors: e2 } } = useForm({ resolver: zodResolver(step2Schema) });

  const onStep1Submit = (data) => {
    formData.current = { ...formData.current, ...data };
    setStep(2);
  };

  const onStep2Submit = async (data) => {
    const finalData = { ...formData.current, ...data, department_id: parseInt(data.department_id) };
    try {
      setIsLoading(true);
      const response = await registerApi(finalData);
      setRegisteredUser(response.user);
      setAuth(response.user, response.accessToken);
      setStep(3);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const onStep3Submit = async () => {
    if (avatarFile) {
      try {
        setIsLoading(true);
        const form = new FormData();
        form.append('avatar', avatarFile);
        await uploadAvatar(form);
      } catch {
        toast.error('Avatar upload failed, you can update it later');
      } finally {
        setIsLoading(false);
      }
    }
    toast.success('Account created successfully!');
    navigate('/dashboard');
  };

  const stepLabels = ['Account', 'Academic Info', 'Profile Photo'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center text-indigo-600 dark:text-indigo-400">
          <GraduationCap size={48} strokeWidth={1.5} />
        </div>
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Join CampusLink</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">Sign in</Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-white/20 dark:border-gray-700/50">

          {/* Step progress */}
          <div className="flex items-center justify-between mb-8">
            {stepLabels.map((label, i) => {
              const num = i + 1;
              const done = step > num;
              const active = step === num;
              return (
                <React.Fragment key={num}>
                  <div className="flex flex-col items-center">
                    <div className={`size-8 rounded-full flex items-center justify-center text-sm font-medium ${done ? 'bg-indigo-600 text-white' : active ? 'bg-indigo-100 text-indigo-600 border-2 border-indigo-600' : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'}`}>
                      {done ? <CheckCircle className="size-5" /> : num}
                    </div>
                    <span className={`mt-1 text-xs ${active ? 'text-indigo-600 font-medium' : 'text-gray-400'}`}>{label}</span>
                  </div>
                  {i < stepLabels.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${step > num ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <form className="space-y-6" onSubmit={hs1(onStep1Submit)}>
              <Input id="full_name" label="Full Name" {...reg1('full_name')} error={e1.full_name} />
              <Input id="email" label="Academic Email" type="email" {...reg1('email')} error={e1.email} />
              <Input id="password" label="Password" type="password" {...reg1('password')} error={e1.password} />
              <Button type="submit" className="group">
                Next Step <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form className="space-y-6" onSubmit={hs2(onStep2Submit)}>
              <Input id="student_id" label="Student ID" {...reg2('student_id')} error={e2.student_id} />
              <div>
                <label htmlFor="department_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                <select id="department_id"
                  {...reg2('department_id')}
                  className={`block w-full px-3 py-2 border ${e2.department_id ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm bg-white dark:bg-gray-800 dark:text-white focus:ring-indigo-500 focus:border-indigo-500`}
                >
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                {e2.department_id && <p className="mt-1 text-sm text-red-600">{e2.department_id.message}</p>}
              </div>
              <Input id="batch" label="Batch Year (e.g. 2023)" {...reg2('batch')} error={e2.batch} />
              <div className="flex gap-3">
                <Button type="button" variant="secondary" onClick={() => setStep(1)} className="w-1/3">
                  <ArrowLeft className="mr-1 w-4 h-4" /> Back
                </Button>
                <Button type="submit" disabled={isLoading} className="w-2/3">
                  {isLoading ? 'Creating...' : 'Next Step'}
                  {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
                </Button>
              </div>
            </form>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">Upload a profile photo (optional)</p>
              <div className="flex flex-col items-center gap-4">
                <label className="relative cursor-pointer group">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="size-32 rounded-full object-cover border-4 border-indigo-200 group-hover:opacity-80 transition-opacity" />
                  ) : (
                    <div className="size-32 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-4 border-dashed border-gray-300 dark:border-gray-600 group-hover:border-indigo-400 transition-colors">
                      <Camera className="size-10 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
                <p className="text-xs text-gray-500">Click to choose a photo · Max 5 MB</p>
              </div>
              <Button onClick={onStep3Submit} disabled={isLoading}>
                {isLoading ? 'Finishing up...' : avatarFile ? 'Upload & Finish' : 'Skip & Go to Dashboard'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
