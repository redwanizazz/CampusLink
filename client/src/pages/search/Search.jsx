import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { globalSearch } from '../../api/search';
import { Link, useSearchParams } from 'react-router-dom';
import Avatar from '../../components/ui/Avatar';
import { Skeleton } from '../../components/ui/Skeleton';
import { Search as SearchIcon, Users, FileText, Calendar, Bell } from 'lucide-react';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [inputVal, setInputVal] = useState(q);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['search', q],
    queryFn: () => globalSearch(q),
    enabled: q.length >= 2,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputVal.trim().length >= 2) setSearchParams({ q: inputVal.trim() });
  };

  const loading = isLoading || isFetching;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
        <input
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          placeholder="Search users, events, posts, notices…"
          aria-label="Search"
          className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm shadow-sm"
        />
        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">Search</button>
      </form>

      {q.length < 2 && (
        <div className="text-center py-12 text-gray-400">
          <SearchIcon className="w-12 h-12 mx-auto mb-3 text-gray-200 dark:text-gray-700" />
          <p>Enter at least 2 characters to search</p>
        </div>
      )}

      {loading && q.length >= 2 && (
        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      )}

      {data && !loading && (
        <div className="space-y-6">
          {/* Users */}
          {data.users?.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center">
                <Users className="w-4 h-4 mr-1.5" /> People ({data.users.length})
              </h2>
              <div className="space-y-2">
                {data.users.map(u => (
                  <Link key={u.id} to={`/profile/${u.id}`} className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow">
                    <Avatar user={u} size="md" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{u.full_name}</p>
                      <p className="text-xs text-gray-500 capitalize">{u.role} · {u.Department?.name} {u.batch && `· Batch ${u.batch}`}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Events */}
          {data.events?.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center">
                <Calendar className="w-4 h-4 mr-1.5" /> Events ({data.events.length})
              </h2>
              <div className="space-y-2">
                {data.events.map(ev => (
                  <Link key={ev.id} to={`/events/${ev.id}`} className="block bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{ev.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 capitalize">{ev.location_type} · {new Date(ev.start_time).toLocaleDateString()}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Notices */}
          {data.notices?.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center">
                <Bell className="w-4 h-4 mr-1.5" /> Notices ({data.notices.length})
              </h2>
              <div className="space-y-2">
                {data.notices.map(n => (
                  <Link key={n.id} to={`/noticeboard/${n.id}`} className="block bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{n.content}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {data.users?.length === 0 && data.events?.length === 0 && data.notices?.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p>No results found for "<strong>{q}</strong>"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
