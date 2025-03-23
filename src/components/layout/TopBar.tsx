
import React from 'react';
import { Bell, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

export const TopBar: React.FC = () => {
  const { user } = useAuth();

  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-16 fixed top-0 left-64 right-0 bg-white z-20 border-b border-border flex items-center justify-between px-6"
    >
      <div className="relative w-80">
        <Search size={16} className="absolute top-2.5 left-3 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search..."
          className="pl-10 pr-4 py-2 bg-secondary/50 rounded-lg w-full text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
        />
      </div>
      
      <div className="flex items-center space-x-4">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2 rounded-full hover:bg-secondary/50 transition-colors"
        >
          <Bell size={18} className="text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
        </motion.button>
        
        <div className="text-right mr-2">
          <p className="text-sm font-medium">Welcome back,</p>
          <p className="text-xs text-muted-foreground">{user?.name}</p>
        </div>
        
        <div className="w-9 h-9 rounded-full overflow-hidden shadow-sm border border-border">
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-medium">
              {user?.name?.charAt(0)}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
