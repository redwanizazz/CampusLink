import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

// Eagerly loaded — critical path (auth + layout + errors)
import Landing from '../pages/Landing';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import MainLayout from '../components/layout/MainLayout';
import NotFound from '../pages/errors/NotFound';
import Forbidden from '../pages/errors/Forbidden';

// Lazy loaded — app pages (split into separate chunks)
const Dashboard = lazy(() => import('../pages/Dashboard'));
const ProfileView = lazy(() => import('../pages/profile/ProfileView'));
const ProfileEdit = lazy(() => import('../pages/profile/ProfileEdit'));
const Settings = lazy(() => import('../pages/profile/Settings'));

const Discover = lazy(() => import('../pages/network/Discover'));
const Connections = lazy(() => import('../pages/network/Connections'));
const Requests = lazy(() => import('../pages/network/Requests'));

const Messages = lazy(() => import('../pages/messages/Messages'));

const Academics = lazy(() => import('../pages/academics/Academics'));
const Attendance = lazy(() => import('../pages/academics/Attendance'));
const Marks = lazy(() => import('../pages/academics/Marks'));
const Results = lazy(() => import('../pages/academics/Results'));
const CGPA = lazy(() => import('../pages/academics/CGPA'));
const Routine = lazy(() => import('../pages/academics/Routine'));

const Events = lazy(() => import('../pages/events/Events'));
const EventDetail = lazy(() => import('../pages/events/EventDetail'));
const CreateEvent = lazy(() => import('../pages/events/CreateEvent'));
const MyEvents = lazy(() => import('../pages/events/MyEvents'));

const Noticeboard = lazy(() => import('../pages/noticeboard/Noticeboard'));
const NoticeDetail = lazy(() => import('../pages/noticeboard/NoticeDetail'));
const CreateNotice = lazy(() => import('../pages/noticeboard/CreateNotice'));

const PostDetail = lazy(() => import('../pages/posts/PostDetail'));

const Notifications = lazy(() => import('../pages/notifications/Notifications'));
const Search = lazy(() => import('../pages/search/Search'));

const Admin = lazy(() => import('../pages/admin/Admin'));
const UserManagement = lazy(() => import('../pages/admin/UserManagement'));
const Analytics = lazy(() => import('../pages/admin/Analytics'));
const ContentModeration = lazy(() => import('../pages/admin/ContentModeration'));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[40vh]">
    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

const ProtectedRoute = ({ children }) => {
  const token = useAuthStore(s => s.token);
  return token ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const user = useAuthStore(s => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/403" replace />;
  return children;
};

const AppRoutes = () => (
  <BrowserRouter>
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/403" element={<Forbidden />} />

        {/* Protected — wrapped in MainLayout */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Profile */}
          <Route path="/profile/edit" element={<ProfileEdit />} />
          <Route path="/profile/settings" element={<Settings />} />
          <Route path="/profile/:id" element={<ProfileView />} />

          {/* Network */}
          <Route path="/network" element={<Discover />} />
          <Route path="/network/connections" element={<Connections />} />
          <Route path="/network/requests" element={<Requests />} />

          {/* Messages */}
          <Route path="/messages" element={<Messages />} />

          {/* Academics */}
          <Route path="/academics" element={<Academics />}>
            <Route path="attendance" element={<Attendance />} />
            <Route path="marks" element={<Marks />} />
            <Route path="results" element={<Results />} />
            <Route path="cgpa" element={<CGPA />} />
            <Route path="routine" element={<Routine />} />
          </Route>

          {/* Events */}
          <Route path="/events" element={<Events />} />
          <Route path="/events/my-events" element={<MyEvents />} />
          <Route path="/events/create" element={<CreateEvent />} />
          <Route path="/events/:id" element={<EventDetail />} />

          {/* Noticeboard */}
          <Route path="/noticeboard" element={<Noticeboard />} />
          <Route path="/noticeboard/create" element={<CreateNotice />} />
          <Route path="/noticeboard/:id" element={<NoticeDetail />} />

          {/* Posts */}
          <Route path="/posts/:id" element={<PostDetail />} />

          {/* Notifications + Search */}
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/search" element={<Search />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
          <Route path="/admin/analytics" element={<AdminRoute><Analytics /></AdminRoute>} />
          <Route path="/admin/content" element={<AdminRoute><ContentModeration /></AdminRoute>} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default AppRoutes;
