
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, Student, Trainer, Admin } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isTrainer: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  register: async () => {},
  isAuthenticated: false,
  isAdmin: false,
  isTrainer: false,
  isStudent: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Check for existing session
  useEffect(() => {
    const checkSession = async () => {
      setLoading(true);
      
      try {
        // Get session from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Fetch user details from our users table
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (error) {
            console.error('Error fetching user data:', error);
            throw error;
          }
          
          if (userData) {
            // Map database user to our app's User type
            const appUser: User = {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              role: userData.role,
              profileImage: userData.profile_image || undefined,
            };
            
            setUser(appUser);
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Fetch user details from our users table
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (error) {
            console.error('Error fetching user data:', error);
            return;
          }
          
          if (userData) {
            // Map database user to our app's User type
            const appUser: User = {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              role: userData.role,
              profileImage: userData.profile_image || undefined,
            };
            
            setUser(appUser);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );
    
    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      if (!data.user) {
        toast({
          title: "Login failed",
          description: "User not found",
          variant: "destructive",
        });
        throw new Error('User not found');
      }
      
      // Fetch user details
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (userError) {
        toast({
          title: "Login failed",
          description: "Error fetching user data",
          variant: "destructive",
        });
        throw userError;
      }
      
      // Map database user to our app's User type
      const appUser: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        profileImage: userData.profile_image || undefined,
      };
      
      setUser(appUser);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${appUser.name}!`,
      });
    } catch (error) {
      console.error('Login error:', error);
      // Error toast is shown above
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      toast({
        title: "Logged out",
        description: "You've been successfully logged out",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "An error occurred during logout",
        variant: "destructive",
      });
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    
    try {
      // Create user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      if (!data.user) {
        toast({
          title: "Registration failed",
          description: "Error creating user",
          variant: "destructive",
        });
        throw new Error('Error creating user');
      }
      
      // Create user profile in our users table
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          name,
          email,
          role: 'student', // Default role for new registrations
          created_at: new Date().toISOString(),
        });
      
      if (profileError) {
        toast({
          title: "Registration failed",
          description: "Error creating user profile",
          variant: "destructive",
        });
        throw profileError;
      }
      
      // Create a new student
      const newUser: Student = {
        id: data.user.id,
        name,
        email,
        role: 'student',
        bookings: [],
      };
      
      setUser(newUser);
      
      toast({
        title: "Registration successful",
        description: "Your account has been created",
      });
    } catch (error) {
      console.error('Registration error:', error);
      // Error toast is shown above
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isTrainer: user?.role === 'trainer',
        isStudent: user?.role === 'student',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
