import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

// Public pages
import Landing from '../pages/Landing';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

// Layout
import MainLayout from '../components/layout/MainLayout';

// App pages
import Dashboard from '../pages/Dashboard';
import ProfileView from '../pages/profile/ProfileView';
import ProfileEdit from '../pages/profile/ProfileEdit';
import Settings from '../pages/profile/Settings';

// Network
import Discover from '../pages/network/Discover';
import Connections from '../pages/network/Connections';
import Requests from '../pages/network/Requests';

// Messages
import Messages from '../pages/messages/Messages';

// Academics
import Academics from '../pages/academics/Academics';
import Attendance from '../pages/academics/Attendance';
import Marks from '../pages/academics/Marks';
import CGPA from '../pages/academics/CGPA';
import Routine from '../pages/academics/Routine';

// Events
import Events from '../pages/events/Events';
import EventDetail from '../pages/events/EventDetail';
import CreateEvent from '../pages/events/CreateEvent';
import MyEvents from '../pages/events/MyEvents';

// Noticeboard
import Noticeboard from '../pages/noticeboard/Noticeboard';
import NoticeDetail from '../pages/noticeboard/NoticeDetail';
import CreateNotice from '../pages/noticeboard/CreateNotice';

// Posts
import PostDetail from '../pages/posts/PostDetail';

// Notifications + Search
import Notifications from '../pages/notifications/Notifications';
import Search from '../pages/search/Search';

// Admin
import Admin from '../pages/admin/Admin';
import UserManagement from '../pages/admin/UserManagement';

// Errors
import NotFound from '../pages/errors/NotFound';
import Forbidden from '../pages/errors/Forbidden';

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
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
