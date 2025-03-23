
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

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
    
    // Check for Supabase auth redirects
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // This will trigger the useEffect in AuthContext 
        // which will fetch the user data and redirect appropriately
        console.log('Signed in through Supabase redirect');
      }
    });
    
    return () => {
      // Clean up listener
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [isAuthenticated]);

  return <AuthLayout onAuthSuccess={handleAuthSuccess} />;
};

export default AuthPage;
