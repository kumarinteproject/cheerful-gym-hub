
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import { GymProvider } from "@/contexts/GymContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";

// Student Pages
import TrainersList from "./pages/student/TrainersList";
import BookSession from "./pages/student/BookSession";
import MySessions from "./pages/student/MySessions";
import PaymentHistory from "./pages/student/PaymentHistory";

// Trainer Pages
import Schedule from "./pages/trainer/Schedule";
import MyStudents from "./pages/trainer/MyStudents";

// Admin Pages
import Students from "./pages/admin/Students";
import Trainers from "./pages/admin/Trainers";
import Sessions from "./pages/admin/Sessions";
import Payments from "./pages/admin/Payments";
import Settings from "./pages/admin/Settings";

// Route Guards
import { useAuth } from "@/contexts/AuthContext";

const queryClient = new QueryClient();

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles = [] }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  if (allowedRoles.length > 0 && (!user || !allowedRoles.includes(user.role))) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <GymProvider>
          <BrowserRouter>
            <AnimatePresence mode="wait">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                
                {/* Common Protected Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                
                {/* Student Routes */}
                <Route path="/student/trainers" element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <TrainersList />
                  </ProtectedRoute>
                } />
                <Route path="/student/book" element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <BookSession />
                  </ProtectedRoute>
                } />
                <Route path="/student/sessions" element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <MySessions />
                  </ProtectedRoute>
                } />
                <Route path="/student/payments" element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <PaymentHistory />
                  </ProtectedRoute>
                } />
                
                {/* Trainer Routes */}
                <Route path="/trainer/schedule" element={
                  <ProtectedRoute allowedRoles={['trainer']}>
                    <Schedule />
                  </ProtectedRoute>
                } />
                <Route path="/trainer/students" element={
                  <ProtectedRoute allowedRoles={['trainer']}>
                    <MyStudents />
                  </ProtectedRoute>
                } />
                
                {/* Admin Routes */}
                <Route path="/admin/students" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Students />
                  </ProtectedRoute>
                } />
                <Route path="/admin/trainers" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Trainers />
                  </ProtectedRoute>
                } />
                <Route path="/admin/sessions" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Sessions />
                  </ProtectedRoute>
                } />
                <Route path="/admin/payments" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Payments />
                  </ProtectedRoute>
                } />
                <Route path="/admin/settings" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Settings />
                  </ProtectedRoute>
                } />
                
                {/* Redirect old admin dashboard to new path */}
                <Route path="/admin/dashboard" element={<Navigate to="/dashboard" replace />} />
                <Route path="/trainer/dashboard" element={<Navigate to="/dashboard" replace />} />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AnimatePresence>
          </BrowserRouter>
        </GymProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
