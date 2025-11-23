
import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import { Role } from './types';
import Navbar from './components/Navbar';
import LoadingOverlay from './components/LoadingOverlay';
import Landing from './pages/Landing';
import Login from './pages/Login';
import UserDashboard from './pages/user/UserDashboard';
import Quiz from './pages/user/Quiz';
import Result from './pages/user/Result';
import History from './pages/user/History';
import Profile from './pages/user/Profile';
import Leaderboard from './pages/user/Leaderboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import { QuestionList, QuestionForm } from './pages/admin/QuestionManager';
import Chat from './pages/Chat';
import AdminMessages from './pages/admin/AdminMessages';
import AdminChat from './pages/admin/AdminChat';

// Protected Route Component
const ProtectedRoute = ({ allowedRoles }: { allowedRoles: Role[] }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; // Or unauth page
  }

  return <Outlet />;
};

const LayoutWithNav = () => (
  <>
    <Navbar />
    <Outlet />
  </>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <UIProvider>
        <LoadingOverlay />
        <HashRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login/:role" element={<Login />} />
            
            {/* User Routes */}
            <Route element={<LayoutWithNav />}>
              {/* Shared Routes (User & Admin) */}
              <Route element={<ProtectedRoute allowedRoles={[Role.USER, Role.ADMIN]} />}>
                 <Route path="/profile" element={<Profile />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={[Role.USER]} />}>
                <Route path="/user" element={<UserDashboard />} />
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/result" element={<Result />} />
                <Route path="/history" element={<History />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/chat" element={<Chat />} />
              </Route>

              {/* Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={[Role.ADMIN]} />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/questions" element={<QuestionList />} />
                <Route path="/admin/questions/:id" element={<QuestionForm />} />
                <Route path="/admin/messages" element={<AdminMessages />} />
                <Route path="/admin/chat/:userId" element={<AdminChat />} />
              </Route>
            </Route>

          </Routes>
        </HashRouter>
      </UIProvider>
    </AuthProvider>
  );
};

export default App;
