
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGym } from '@/contexts/GymContext';
import { Layout } from '@/components/layout/Layout';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PageTransition } from '@/components/ui/PageTransition';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { X, Clock, Calendar, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const MySessions = () => {
  const { user } = useAuth();
  const { trainers, timeSlots, getStudentBookings, cancelBooking } = useGym();
  const { toast } = useToast();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    console.log("MySessions component mounted");
    setIsLoaded(true);
    // Log auth state for debugging
    console.log("Current user:", user);
  }, [user]);
  
  if (!user) {
    console.log("No user found in MySessions");
    return <div>Loading user data...</div>;
  }
  
  console.log("Rendering MySessions for user:", user.id);
  
  const bookings = getStudentBookings(user.id);
  console.log("User bookings:", bookings);
  
  const upcomingBookings = bookings.filter(
    b => b.status === 'confirmed' || b.status === 'pending'
  );
  
  const pastBookings = bookings.filter(
    b => b.status === 'completed' || b.status === 'cancelled'
  );

  const handleCancelBooking = async (bookingId: string) => {
    try {
      setCancellingId(bookingId);
      await cancelBooking(bookingId);
      toast({
        title: "Booking cancelled",
        description: "Your booking has been cancelled successfully",
      });
    } catch (error) {
      console.error('Error cancelling booking:', error);
      // Error is handled in the context with toast
    } finally {
      setCancellingId(null);
    }
  };

  const renderSessionCard = (bookingId: string, trainerId: string, timeSlotId: string, date: string, status: string, paymentStatus: string) => {
    const trainer = trainers.find(t => t.id === trainerId);
    const timeSlot = timeSlots.find(ts => ts.id === timeSlotId);
    
    if (!trainer || !timeSlot) {
      console.log("Missing trainer or timeslot data:", { trainerId, timeSlotId });
      return null;
    }
    
    const isCancellable = status === 'confirmed' || status === 'pending';
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl border border-border shadow-sm overflow-hidden"
      >
        <div className="p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
              <UserAvatar user={trainer} />
              <div className="ml-3">
                <h3 className="font-medium">{trainer.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {trainer.expertise.join(', ')}
                </p>
              </div>
            </div>
            <StatusBadge status={status as any} />
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm">
              <Calendar size={16} className="mr-2 text-muted-foreground" />
              <span>{date}</span>
            </div>
            <div className="flex items-center text-sm">
              <Clock size={16} className="mr-2 text-muted-foreground" />
              <span>{timeSlot.startTime} - {timeSlot.endTime}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <StatusBadge status={paymentStatus as any} />
            
            {isCancellable && (
              <Button 
                variant="outline" 
                size="sm"
                className="text-red-500 hover:bg-red-50 hover:text-red-600 border-red-200"
                onClick={() => handleCancelBooking(bookingId)}
                disabled={cancellingId === bookingId}
              >
                {cancellingId === bookingId ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cancelling
                  </span>
                ) : (
                  <span className="flex items-center">
                    <X size={16} className="mr-1" />
                    Cancel
                  </span>
                )}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <Layout>
      <PageTransition>
        <div className="w-full">
          <SectionHeading
            title="My Sessions"
            description="View and manage your booked training sessions"
          />

          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="w-full max-w-md mx-auto mb-6">
              <TabsTrigger value="upcoming" className="flex-1">
                Upcoming Sessions
              </TabsTrigger>
              <TabsTrigger value="past" className="flex-1">
                Past Sessions
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming">
              {upcomingBookings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingBookings.map(booking => (
                    <div key={booking.id}>
                      {renderSessionCard(
                        booking.id,
                        booking.trainerId,
                        booking.timeSlotId,
                        booking.date,
                        booking.status,
                        booking.paymentStatus
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-muted/20 rounded-xl border border-border">
                  <div className="flex flex-col items-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No upcoming sessions</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      You don't have any upcoming training sessions. Book a session with one of our expert trainers.
                    </p>
                    <Button onClick={() => window.location.href = '/student/book'}>
                      Book a Session
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="past">
              {pastBookings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastBookings.map(booking => (
                    <div key={booking.id}>
                      {renderSessionCard(
                        booking.id,
                        booking.trainerId,
                        booking.timeSlotId,
                        booking.date,
                        booking.status,
                        booking.paymentStatus
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-muted/20 rounded-xl border border-border">
                  <div className="flex flex-col items-center">
                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No past sessions</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      You don't have any past training sessions yet.
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </Layout>
  );
};

export default MySessions;
