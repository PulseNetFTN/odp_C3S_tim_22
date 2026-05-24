import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/protected_route/ProtectedRoute';
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import FeedPage from './pages/feed/FeedPage';
import AboutPage from './pages/info/AboutPage';
import HelpPage from './pages/info/HelpPage';
import NotFoundPage from './pages/not_found/NotFoundPage';
import ProfilePage from './pages/profile/ProfilePage';
import CommentsPage from './pages/comments/CommentsPage';
import AdminDashboard from './pages/admin/AdminDashboardPage';

export default function App() {
    return (
        <Routes>
      
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/help" element={<HelpPage />} />     
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            
            <Route
                path="/post/:postId/comments"
                element={
                    //<ProtectedRoute requiredRole="user">
                        <CommentsPage />
                    //</ProtectedRoute>
                }
            />

            <Route
                path="/feed"
                element={
                    <ProtectedRoute requiredRole="user">
                        <div style={{ color: 'white' }}>Feed — coming soon</div>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin"
                element={
                    //<ProtectedRoute requiredRole="admin">
                        <AdminDashboard />
                    //</ProtectedRoute>
                }
            />


            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
    );
}