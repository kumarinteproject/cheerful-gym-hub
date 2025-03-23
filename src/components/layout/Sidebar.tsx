
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  Home, 
  User, 
  Calendar, 
  CreditCard, 
  Clock, 
  Settings, 
  Users, 
  LogOut,
  Dumbbell 
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout, isAdmin, isTrainer, isStudent } = useAuth();
  const location = useLocation();

  // Define navigation items based on user role
  const getNavItems = () => {
    const commonItems = [
      { name: 'Dashboard', path: '/dashboard', icon: <Home size={18} /> },
      { name: 'Profile', path: '/profile', icon: <User size={18} /> },
    ];

    if (isAdmin) {
      return [
        ...commonItems,
        { name: 'Students', path: '/admin/students', icon: <Users size={18} /> },
        { name: 'Trainers', path: '/admin/trainers', icon: <Dumbbell size={18} /> },
        { name: 'Sessions', path: '/admin/sessions', icon: <Calendar size={18} /> },
        { name: 'Payments', path: '/admin/payments', icon: <CreditCard size={18} /> },
        { name: 'Settings', path: '/admin/settings', icon: <Settings size={18} /> },
      ];
    }

    if (isTrainer) {
      return [
        ...commonItems,
        { name: 'My Schedule', path: '/trainer/schedule', icon: <Clock size={18} /> },
        { name: 'My Students', path: '/trainer/students', icon: <Users size={18} /> },
      ];
    }

    if (isStudent) {
      return [
        ...commonItems,
        { name: 'Trainers', path: '/student/trainers', icon: <Dumbbell size={18} /> },
        { name: 'Book Session', path: '/student/book', icon: <Calendar size={18} /> },
        { name: 'My Sessions', path: '/student/sessions', icon: <Clock size={18} /> },
        { name: 'Payment History', path: '/student/payments', icon: <CreditCard size={18} /> },
      ];
    }

    return commonItems;
  };

  const navItems = getNavItems();

  return (
    <div className="fixed top-0 left-0 w-64 h-full bg-white z-10 shadow-sm overflow-y-auto">
      <div className="p-6">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative w-10 h-10 bg-primary rounded-lg flex items-center justify-center"
          >
            <Dumbbell size={20} className="text-white" />
          </motion.div>
          <div>
            <motion.h1 
              initial={{ x: -20, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }} 
              transition={{ delay: 0.1, duration: 0.5 }}
              className="font-semibold text-xl"
            >
              FitNest
            </motion.h1>
          </div>
        </Link>
      </div>

      <div className="mt-4">
        <nav className="px-4 space-y-1">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            
            return (
              <motion.div 
                key={item.name} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05, duration: 0.3 }}
              >
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 relative ${
                    isActive 
                      ? 'text-primary font-medium bg-primary/5' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-item"
                      className="absolute left-0 top-0 h-full w-1 bg-primary rounded-r-md"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                  <span className="flex items-center justify-center w-8">
                    {item.icon}
                  </span>
                  <span className="ml-3">{item.name}</span>
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="px-4 py-2 mb-2 flex items-center">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User size={18} className="text-muted-foreground" />
              )}
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center px-4 py-3 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <span className="flex items-center justify-center w-8">
            <LogOut size={18} />
          </span>
          <span className="ml-3">Logout</span>
        </button>
      </div>
    </div>
  );
};
