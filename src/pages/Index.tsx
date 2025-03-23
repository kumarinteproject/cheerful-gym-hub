
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Dumbbell } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleGetStarted = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 fixed top-0 w-full z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-2"
          >
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Dumbbell size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-bold">FitNest</h1>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button onClick={handleGetStarted}>
              Get Started
            </Button>
          </motion.div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="flex items-center justify-center pt-24 pb-16 md:py-32 px-4 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="space-y-6"
            >
              <div>
                <div className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full mb-4">
                  Gym Management Demo
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                  Modern Gym Management Platform
                </h1>
                <p className="text-lg text-muted-foreground mb-6">
                  A complete solution for students, trainers, and administrators to manage gym activities efficiently.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={handleGetStarted} className="rounded-lg">
                  Start Using FitNest
                </Button>
                <Button size="lg" variant="outline" onClick={handleGetStarted} className="rounded-lg">
                  View Demo
                </Button>
              </div>
              
              <div className="pt-8 border-t border-border/40 mt-8">
                <div className="flex flex-wrap gap-8">
                  <div>
                    <div className="text-3xl font-bold">10+</div>
                    <div className="text-sm text-muted-foreground">Trainers</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">500+</div>
                    <div className="text-sm text-muted-foreground">Students</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">98%</div>
                    <div className="text-sm text-muted-foreground">Satisfaction</div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="relative"
            >
              <div className="absolute -top-8 -left-8 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-4 -right-4 w-60 h-60 bg-blue-200/30 rounded-full blur-3xl"></div>
              
              <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-border">
                <img
                  src="https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=800&auto=format"
                  alt="Gym Management"
                  className="w-full h-auto"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
                  <div className="text-sm font-medium">FitNest Dashboard</div>
                  <div className="text-xs opacity-80">For administrators, trainers, and students</div>
                </div>
              </div>
              
              <div className="absolute top-1/3 -right-8 bg-white p-4 rounded-lg shadow-lg border border-border">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Session Booked</div>
                    <div className="text-xs text-muted-foreground">Trainer: Casey Martinez</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                FitNest provides a complete solution for managing gym activities, with specialized features for different user roles.
              </p>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Student Dashboard",
                description: "Book sessions with trainers, manage payments, and track your progress.",
                icon: (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M23 21V19C22.9986 17.1771 21.765 15.5857 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M16 3.13C17.7699 3.58317 19.0078 5.17883 19.0078 7.005C19.0078 8.83117 17.7699 10.4268 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ),
                delay: 0.1
              },
              {
                title: "Trainer Management",
                description: "Manage your schedule, view assigned students, and track sessions.",
                icon: (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M9 16L11 18L15 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
                delay: 0.2
              },
              {
                title: "Admin Panel",
                description: "Comprehensive tools to manage the entire gym, users, sessions, and payments.",
                icon: (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M19.4 15C19.1277 15.8031 19.2292 16.6718 19.68 17.4L19.75 17.51C20.1294 18.0727 20.2493 18.7654 20.0855 19.4212C19.9217 20.077 19.4883 20.6351 18.89 20.94C18.3001 21.2352 17.6188 21.3228 16.9709 21.1855C16.3231 21.0482 15.7459 20.6942 15.35 20.19L15.28 20.09C14.74 19.3576 13.9359 18.9362 13.08 18.9C12.2241 18.9362 11.42 19.3576 10.88 20.09L10.81 20.19C10.4141 20.6942 9.83691 21.0482 9.18905 21.1855C8.54119 21.3228 7.85992 21.2352 7.27 20.94C6.67166 20.6351 6.23825 20.077 6.07447 19.4212C5.91069 18.7654 6.0306 18.0727 6.41 17.51L6.48 17.4C6.93082 16.6718 7.03231 15.8031 6.76 15C6.48769 14.1969 5.90168 13.5523 5.15 13.24L5.03 13.2C4.36809 13.0284 3.83615 12.5961 3.51322 12.0135C3.19029 11.4309 3.10482 10.7448 3.27827 10.0989C3.45172 9.45292 3.86783 8.8949 4.44136 8.54259C5.01489 8.19028 5.70229 8.07141 6.36 8.21L6.49 8.24C7.26396 8.42307 8.0746 8.24924 8.71 7.77C9.35121 7.28016 9.75653 6.53689 9.82 5.73L9.83 5.59C9.83729 4.92582 10.0922 4.28685 10.5409 3.80281C10.9897 3.31877 11.6006 3.02747 12.265 3C12.9294 3.02747 13.5403 3.31877 13.9891 3.80281C14.4378 4.28685 14.6927 4.92582 14.7 5.59L14.71 5.73C14.7735 6.53689 15.1788 7.28016 15.82 7.77C16.4554 8.24924 17.266 8.42307 18.04 8.24L18.17 8.21C18.8277 8.07141 19.5151 8.19028 20.0886 8.54259C20.6622 8.8949 21.0783 9.45292 21.2517 10.0989C21.4252 10.7448 21.3397 11.4309 21.0168 12.0135C20.6939 12.5961 20.1619 13.0284 19.5 13.2L19.38 13.24C18.6283 13.5523 18.0423 14.1969 17.77 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ),
                delay: 0.3
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: feature.delay }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-xl border border-border shadow-sm"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">Ready to try FitNest?</h2>
            <p className="text-white/80 max-w-2xl mx-auto mb-8">
              Experience the future of gym management with our all-in-one platform. Perfect for educational demonstration and real-world applications.
            </p>
            <Button 
              size="lg" 
              onClick={handleGetStarted} 
              variant="secondary"
              className="rounded-lg bg-white text-primary hover:bg-white/90"
            >
              Get Started Now
            </Button>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 px-4 bg-muted/20 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Dumbbell size={16} className="text-white" />
              </div>
              <span className="font-semibold">FitNest</span>
            </div>
            
            <div className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} FitNest. All rights reserved. Demo Project.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
