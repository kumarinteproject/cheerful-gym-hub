
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { useAuth } from '@/contexts/AuthContext';

const AuthPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleAuthSuccess = () => {
    // Redirect based on user role
    if (user?.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (user?.role === 'trainer') {
      navigate('/trainer/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  useEffect(() => {
    // If already authenticated, redirect
    if (isAuthenticated) {
      handleAuthSuccess();
    }
  }, [isAuthenticated]);

  return <AuthLayout onAuthSuccess={handleAuthSuccess} />;
};

export default AuthPage;
