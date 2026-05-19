import React from 'react';

export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
);

export const CardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5 space-y-3">
    <Skeleton className="w-20 h-20 rounded-full mx-auto" />
    <Skeleton className="h-4 w-3/4 mx-auto" />
    <Skeleton className="h-3 w-1/2 mx-auto" />
    <Skeleton className="h-8 w-full mt-2" />
  </div>
);

export const PostSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
    <div className="flex items-center space-x-3">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <Skeleton className="h-4 w-4/6" />
  </div>
);

export const TableRowSkeleton = ({ cols = 4 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
);
