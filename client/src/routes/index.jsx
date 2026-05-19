import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import MainLayout from '../components/layout/MainLayout';
import ProfileView from '../pages/profile/ProfileView';
import ProfileEdit from '../pages/profile/ProfileEdit';
import Settings from '../pages/profile/Settings';
import Discover from '../pages/network/Discover';
import Connections from '../pages/network/Connections';
import Requests from '../pages/network/Requests';
import Messages from '../pages/messages/Messages';
import { useAuthStore } from '../store/useAuthStore';

const ProtectedRoute = ({ children }) => {
  const token = useAuthStore((state) => state.token);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const DashboardPlaceholder = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold">Dashboard</h1>
    <p>Welcome to CampusLink!</p>
  </div>
);

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes wrapped in MainLayout */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPlaceholder />} />
          <Route path="/profile/edit" element={<ProfileEdit />} />
          <Route path="/profile/settings" element={<Settings />} />
          <Route path="/profile/:id" element={<ProfileView />} />
          
          <Route path="/network" element={<Discover />} />
          <Route path="/network/connections" element={<Connections />} />
          <Route path="/network/requests" element={<Requests />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/academics" element={<div className="p-8">Academics coming soon...</div>} />
          <Route path="/events" element={<div className="p-8">Events coming soon...</div>} />
          <Route path="/noticeboard" element={<div className="p-8">Noticeboard coming soon...</div>} />
        </Route>
        
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
