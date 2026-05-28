export const Input = ({ label, id, error, ref, ...props }) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={`appearance-none block w-full px-3 py-2 border ${
          error ? 'border-red-300 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500'
        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm bg-white dark:bg-gray-800 dark:text-white transition-colors duration-200`}
        {...props}
      />
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error.message}</p>}
    </div>
  );
};
