import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, MessageSquare, GraduationCap, Calendar, Bell, Sun, Moon } from 'lucide-react';

const features = [
  { icon: Users, title: 'Student Networking', desc: 'Discover and connect with classmates across departments and batches.' },
  { icon: MessageSquare, title: 'Real-time Chat', desc: 'Message connections directly with live delivery, file sharing, and typing indicators.' },
  { icon: GraduationCap, title: 'Academic Hub', desc: 'Track attendance, marks, CGPA trends, and your weekly class routine in one place.' },
  { icon: Calendar, title: 'Events', desc: 'Stay informed about campus events, RSVP, and manage the ones you organise.' },
  { icon: Bell, title: 'Noticeboard', desc: 'Never miss a department or institute-wide notice — priority-flagged and instant.' },
  { icon: BookOpen, title: 'Campus Feed', desc: 'Share posts, like and comment with your connections and department.' },
];

const Landing = () => {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return (
  <div className="min-h-screen bg-white dark:bg-gray-900">
    {/* Nav */}
    <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
      <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">CampusLink</span>
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleDark}
          className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle dark mode"
        >
          {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <Link to="/login" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600">Sign in</Link>
        <Link to="/register" className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors">Get started</Link>
      </div>
    </nav>

    {/* Hero */}
    <section className="max-w-7xl mx-auto px-6 py-24 text-center">
      <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
        Your campus,<br />
        <span className="text-indigo-600 dark:text-indigo-400">connected.</span>
      </h1>
      <p className="mt-6 text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
        CampusLink brings together student networking, academic tracking, and institutional updates into one unified platform.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
        <Link to="/register" className="px-8 py-4 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl font-semibold text-lg transition-colors shadow-lg shadow-indigo-200 dark:shadow-indigo-900">
          Create free account
        </Link>
        <Link to="/login" className="px-8 py-4 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 rounded-xl font-semibold text-lg transition-colors">
          Sign in
        </Link>
      </div>
    </section>

    {/* Features */}
    <section className="max-w-7xl mx-auto px-6 py-20 border-t border-gray-100 dark:border-gray-800">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-16">Everything your campus needs</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center mb-4">
              <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>

    <footer className="border-t border-gray-100 dark:border-gray-800 py-8 text-center text-sm text-gray-400">
      CampusLink — built for students, by students.
    </footer>
  </div>
  );
};

export default Landing;
