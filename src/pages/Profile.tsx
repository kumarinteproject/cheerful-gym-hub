
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PageTransition } from '@/components/ui/PageTransition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, User, Mail, Briefcase, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.role === 'trainer' ? (user as any).bio || '' : '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully",
    });
    
    setIsLoading(false);
  };

  return (
    <Layout>
      <PageTransition>
        <SectionHeading
          title="My Profile"
          description="View and update your personal information"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-xl border border-border p-6 shadow-sm lg:col-span-1 h-fit"
          >
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <UserAvatar user={user || {}} size="lg" />
                <button className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1 shadow-md hover:bg-primary/90 transition-colors">
                  <User size={14} />
                </button>
              </div>
              
              <h3 className="text-xl font-semibold mb-1">{user?.name}</h3>
              <p className="text-sm text-muted-foreground capitalize mb-3">{user?.role}</p>
              
              {user?.role === 'trainer' && (
                <div className="w-full mt-2">
                  <h4 className="text-sm font-medium mb-2">Expertise</h4>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {(user as any).expertise?.map((skill: string, index: number) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 space-y-4">
              <div className="flex items-center text-sm">
                <Mail size={16} className="text-muted-foreground mr-3" />
                <span>{user?.email}</span>
              </div>
              
              {user?.role === 'student' && (
                <div className="flex items-center text-sm">
                  <Briefcase size={16} className="text-muted-foreground mr-3" />
                  <span>Membership: {(user as any).membershipType || 'Standard'}</span>
                </div>
              )}
              
              {user?.role === 'trainer' && (
                <div className="flex items-center text-sm">
                  <Clock size={16} className="text-muted-foreground mr-3" />
                  <span>Available Sessions: {(user as any).availability?.filter((a: any) => !a.isBooked).length || 0}</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Edit Profile Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white rounded-xl border border-border p-6 shadow-sm lg:col-span-2"
          >
            <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                  disabled={isLoading}
                />
              </div>
              
              {user?.role === 'trainer' && (
                <div className="space-y-2">
                  <label htmlFor="bio" className="text-sm font-medium">Professional Bio</label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell students about your experience and training style"
                    disabled={isLoading}
                    rows={5}
                  />
                </div>
              )}
              
              <div className="pt-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </PageTransition>
    </Layout>
  );
};

export default Profile;
