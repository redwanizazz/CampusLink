import React from 'react';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

const COLORS = [
  'bg-indigo-500', 'bg-purple-500', 'bg-blue-500', 'bg-green-500',
  'bg-yellow-500', 'bg-red-500', 'bg-pink-500', 'bg-teal-500'
];

function colorForName(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';
}

const Avatar = ({ user, src, name, size = 'md', className = '' }) => {
  const resolvedName = name || user?.full_name || '';
  const rawSrc = src || user?.avatar_url;
  const fullSrc = rawSrc ? (rawSrc.startsWith('http') ? rawSrc : `${API_BASE}${rawSrc}`) : null;

  const sizeMap = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-16 h-16 text-lg', xl: 'w-24 h-24 text-2xl', '2xl': 'w-32 h-32 text-3xl' };
  const sizeClass = sizeMap[size] || sizeMap.md;

  if (fullSrc) {
    return (
      <img
        src={fullSrc}
        alt={resolvedName}
        className={`${sizeClass} rounded-full object-cover flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div className={`${sizeClass} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0 ${colorForName(resolvedName)} ${className}`}>
      {initials(resolvedName)}
    </div>
  );
};

export default Avatar;
