
import React, { useState } from 'react';
import { useGym } from '@/contexts/GymContext';
import { Layout } from '@/components/layout/Layout';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PageTransition } from '@/components/ui/PageTransition';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Search, UserPlus, User, Calendar, Clock, Trash2, Loader2, Dumbbell } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  expertise: z.string().min(2, 'Please enter areas of expertise'),
  bio: z.string().min(10, 'Bio must be at least 10 characters'),
});

type FormValues = z.infer<typeof formSchema>;

const Trainers = () => {
  const { trainers, bookings, addTrainer, removeTrainer } = useGym();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingTrainer, setIsAddingTrainer] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deletingTrainerId, setDeletingTrainerId] = useState<string | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      expertise: '',
      bio: '',
    },
  });
  
  // Filter trainers based on search query
  const filteredTrainers = searchQuery
    ? trainers.filter(trainer => 
        trainer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trainer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trainer.expertise.some(exp => exp.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : trainers;

  const getTrainerStats = (trainerId: string) => {
    const trainerBookings = bookings.filter(b => b.trainerId === trainerId);
    
    const completedSessions = trainerBookings.filter(b => b.status === 'completed').length;
    const upcomingSessions = trainerBookings.filter(
      b => b.status === 'confirmed' || b.status === 'pending'
    ).length;
    const availableSlots = trainers.find(t => t.id === trainerId)?.availability.filter(a => !a.isBooked).length || 0;
    
    return {
      completedSessions,
      upcomingSessions,
      availableSlots,
      totalSessions: trainerBookings.length,
    };
  };

  const handleAddTrainer = async (data: FormValues) => {
    try {
      setIsAddingTrainer(true);
      
      // Parse expertise string into array
      const expertiseArray = data.expertise.split(',').map(item => item.trim()).filter(Boolean);
      
      await addTrainer({
        name: data.name,
        email: data.email,
        role: 'trainer',
        expertise: expertiseArray,
        bio: data.bio,
      });
      
      toast({
        title: "Trainer added",
        description: "New trainer has been added successfully",
      });
      
      // Reset form
      form.reset();
      setShowAddDialog(false);
    } catch (error) {
      console.error('Error adding trainer:', error);
      // Error is handled in the context with toast
    } finally {
      setIsAddingTrainer(false);
    }
  };

  const handleDeleteTrainer = async (trainerId: string) => {
    try {
      setDeletingTrainerId(trainerId);
      await removeTrainer(trainerId);
      
      toast({
        title: "Trainer removed",
        description: "The trainer has been removed successfully",
      });
    } catch (error) {
      console.error('Error removing trainer:', error);
      // Error is handled in the context with toast
    } finally {
      setDeletingTrainerId(null);
    }
  };

  return (
    <Layout>
      <PageTransition>
        <SectionHeading
          title="Trainers Management"
          description="View and manage trainer accounts"
          action={
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus size={16} className="mr-2" />
                  Add Trainer
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Trainer</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleAddTrainer)} className="space-y-4 py-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="John Doe" 
                              {...field} 
                              disabled={isAddingTrainer}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="trainer@example.com" 
                              {...field} 
                              disabled={isAddingTrainer}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="expertise"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Areas of Expertise</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Weightlifting, HIIT, Yoga (comma separated)" 
                              {...field} 
                              disabled={isAddingTrainer}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Professional Bio</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Brief professional bio and experience" 
                              {...field} 
                              rows={3}
                              disabled={isAddingTrainer}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="pt-2">
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isAddingTrainer}
                      >
                        {isAddingTrainer ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Adding Trainer...
                          </>
                        ) : (
                          'Add Trainer'
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          }
        />

        <div className="mb-6 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search trainers by name, email or expertise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredTrainers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrainers.map((trainer, index) => {
              const stats = getTrainerStats(trainer.id);
              
              return (
                <motion.div
                  key={trainer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="bg-white rounded-xl border border-border overflow-hidden shadow-sm"
                >
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <UserAvatar user={trainer} />
                      <div className="ml-3">
                        <h3 className="font-semibold">{trainer.name}</h3>
                        <p className="text-xs text-muted-foreground">{trainer.email}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Expertise</h4>
                      <div className="flex flex-wrap gap-2">
                        {trainer.expertise.map((skill, idx) => (
                          <span 
                            key={idx}
                            className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {trainer.bio}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total Sessions</span>
                        <span className="font-medium">{stats.totalSessions}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Completed</span>
                        <span className="font-medium">{stats.completedSessions}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Upcoming</span>
                        <span className="font-medium">{stats.upcomingSessions}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Available Slots</span>
                        <span className="font-medium">{stats.availableSlots}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-border p-4 flex justify-between">
                    <Button variant="outline" size="sm">
                      <Calendar size={16} className="mr-2" />
                      View Schedule
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteTrainer(trainer.id)}
                      disabled={deletingTrainerId === trainer.id || stats.upcomingSessions > 0}
                    >
                      {deletingTrainerId === trainer.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/20 rounded-xl border border-border">
            <div className="flex flex-col items-center">
              <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No trainers found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {searchQuery 
                  ? "No trainers match your search criteria." 
                  : "There are no registered trainers yet."}
              </p>
              <Button 
                onClick={() => setShowAddDialog(true)} 
                className="mt-6"
              >
                <UserPlus size={16} className="mr-2" />
                Add Your First Trainer
              </Button>
            </div>
          </div>
        )}
      </PageTransition>
    </Layout>
  );
};

export default Trainers;
