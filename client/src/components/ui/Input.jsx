import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const Input = ({ label, id, error, ref, type, ...props }) => {
  const [revealPassword, setRevealPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && revealPassword ? 'text' : type;

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          ref={ref}
          type={inputType}
          className={`appearance-none block w-full px-3 py-2 ${isPassword ? 'pr-10' : ''} border ${
            error ? 'border-red-300 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500'
          } rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm bg-white dark:bg-gray-800 dark:text-white transition-colors duration-200`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealPassword(v => !v)}
            tabIndex={-1}
            aria-label={revealPassword ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            {revealPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error.message}</p>}
    </div>
  );
};
