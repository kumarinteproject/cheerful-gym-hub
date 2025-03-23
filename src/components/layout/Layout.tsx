
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { AnimatePresence, motion } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {isAuthenticated && <TopBar />}
      <div className="flex flex-1">
        {isAuthenticated && <Sidebar />}
        <main className={`flex-1 transition-all duration-300 ease-in-out ${isAuthenticated ? 'ml-64' : ''}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={user?.role ?? 'unauthenticated'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="p-6 md:p-8 min-h-screen"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
