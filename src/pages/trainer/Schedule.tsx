
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGym } from '@/contexts/GymContext';
import { Layout } from '@/components/layout/Layout';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PageTransition } from '@/components/ui/PageTransition';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Calendar, Clock, Plus, User, CheckCheck, X } from 'lucide-react';

const Schedule = () => {
  const { user } = useAuth();
  const { 
    trainers, 
    students, 
    bookings, 
    timeSlots, 
    getTrainerBookings, 
    addTimeSlot, 
    removeTimeSlot,
    completeBooking
  } = useGym();
  const { toast } = useToast();
  
  const [isAddingTimeSlot, setIsAddingTimeSlot] = useState(false);
  const [timeSlotData, setTimeSlotData] = useState({
    day: 'Monday',
    startTime: '08:00',
    endTime: '09:00',
  });
  const [isCompletingSession, setIsCompletingSession] = useState<string | null>(null);
  const [isRemovingSlot, setIsRemovingSlot] = useState<string | null>(null);
  
  if (!user) return null;
  
  const trainer = trainers.find(t => t.id === user.id);
  if (!trainer) return null;
  
  const trainerBookings = getTrainerBookings(trainer.id);
  
  const upcomingBookings = trainerBookings.filter(
    b => b.status === 'confirmed' || b.status === 'pending'
  );
  
  const pastBookings = trainerBookings.filter(
    b => b.status === 'completed' || b.status === 'cancelled'
  );
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeOptions = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const handleAddTimeSlot = async () => {
    try {
      setIsAddingTimeSlot(true);
      
      // Validate time slot
      if (timeSlotData.startTime >= timeSlotData.endTime) {
        toast({
          title: "Invalid time slot",
          description: "End time must be after start time",
          variant: "destructive",
        });
        return;
      }
      
      await addTimeSlot(
        trainer.id,
        timeSlotData.day,
        timeSlotData.startTime,
        timeSlotData.endTime
      );
      
      toast({
        title: "Time slot added",
        description: "New time slot has been added to your schedule",
      });
      
      // Reset form
      setTimeSlotData({
        day: 'Monday',
        startTime: '08:00',
        endTime: '09:00',
      });
    } catch (error) {
      console.error('Error adding time slot:', error);
      // Error is handled in the context with toast
    } finally {
      setIsAddingTimeSlot(false);
    }
  };

  const handleRemoveTimeSlot = async (timeSlotId: string) => {
    try {
      setIsRemovingSlot(timeSlotId);
      await removeTimeSlot(timeSlotId);
      
      toast({
        title: "Time slot removed",
        description: "The time slot has been removed from your schedule",
      });
    } catch (error) {
      console.error('Error removing time slot:', error);
      // Error is handled in the context with toast
    } finally {
      setIsRemovingSlot(null);
    }
  };

  const handleCompleteSession = async (bookingId: string) => {
    try {
      setIsCompletingSession(bookingId);
      await completeBooking(bookingId);
      
      toast({
        title: "Session completed",
        description: "The training session has been marked as completed",
      });
    } catch (error) {
      console.error('Error completing session:', error);
    } finally {
      setIsCompletingSession(null);
    }
  };

  const getBookingForTimeSlot = (timeSlotId: string) => {
    return bookings.find(b => b.timeSlotId === timeSlotId);
  };

  return (
    <Layout>
      <PageTransition>
        <SectionHeading
          title="My Schedule"
          description="Manage your availability and sessions"
          action={
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus size={16} className="mr-2" />
                  Add Time Slot
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Time Slot</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Day</label>
                    <Select 
                      value={timeSlotData.day} 
                      onValueChange={(value) => setTimeSlotData(prev => ({ ...prev, day: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {days.map(day => (
                          <SelectItem key={day} value={day}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Start Time</label>
                      <Select 
                        value={timeSlotData.startTime} 
                        onValueChange={(value) => setTimeSlotData(prev => ({ ...prev, startTime: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select start time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.map(time => (
                            <SelectItem key={`start-${time}`} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">End Time</label>
                      <Select 
                        value={timeSlotData.endTime} 
                        onValueChange={(value) => setTimeSlotData(prev => ({ ...prev, endTime: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select end time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.filter(time => time > timeSlotData.startTime).map(time => (
                            <SelectItem key={`end-${time}`} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleAddTimeSlot}
                    disabled={isAddingTimeSlot}
                    className="w-full mt-2"
                  >
                    {isAddingTimeSlot ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding...
                      </span>
                    ) : (
                      'Add Time Slot'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          }
        />

        <div className="space-y-8">
          {/* Weekly Schedule */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Weekly Availability</h3>
            
            <Tabs defaultValue="Monday">
              <TabsList className="w-full max-w-md mb-4">
                {days.map(day => (
                  <TabsTrigger 
                    key={day} 
                    value={day}
                    className="flex-1"
                  >
                    {day.substring(0, 3)}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {days.map(day => (
                <TabsContent key={day} value={day}>
                  <div className="bg-white rounded-xl border border-border shadow-sm p-6">
                    <h4 className="text-sm font-medium text-muted-foreground mb-4">{day}</h4>
                    
                    <div className="space-y-4">
                      {timeSlots
                        .filter(slot => slot.trainerId === trainer.id && slot.day === day)
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map(slot => {
                          const booking = getBookingForTimeSlot(slot.id);
                          const student = booking ? students.find(s => s.id === booking.studentId) : null;
                          
                          return (
                            <motion.div 
                              key={slot.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                              className={`p-4 border rounded-lg ${
                                slot.isBooked 
                                  ? 'border-primary/20 bg-primary/5' 
                                  : 'border-border'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                  <Clock size={16} className="text-muted-foreground mr-2" />
                                  <span className="font-medium">
                                    {slot.startTime} - {slot.endTime}
                                  </span>
                                </div>
                                
                                {slot.isBooked ? (
                                  <span 
                                    className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"
                                  >
                                    Booked
                                  </span>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-500 hover:bg-red-50 hover:text-red-600 border-red-200"
                                    onClick={() => handleRemoveTimeSlot(slot.id)}
                                    disabled={isRemovingSlot === slot.id}
                                  >
                                    {isRemovingSlot === slot.id ? (
                                      <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Removing
                                      </span>
                                    ) : (
                                      <span className="flex items-center">
                                        <X size={14} className="mr-1" />
                                        Remove
                                      </span>
                                    )}
                                  </Button>
                                )}
                              </div>
                              
                              {slot.isBooked && student && booking && (
                                <div className="mt-3 pt-3 border-t border-border/60">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center">
                                      <UserAvatar user={student} size="sm" />
                                      <div className="ml-2">
                                        <p className="text-sm font-medium">{student.name}</p>
                                        <p className="text-xs text-muted-foreground">{booking.date}</p>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                      <StatusBadge status={booking.status} />
                                      
                                      {booking.status === 'confirmed' && (
                                        <Button
                                          variant="secondary"
                                          size="sm"
                                          onClick={() => handleCompleteSession(booking.id)}
                                          disabled={isCompletingSession === booking.id}
                                        >
                                          {isCompletingSession === booking.id ? (
                                            <span className="flex items-center">
                                              <svg className="animate-spin -ml-1 mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                              </svg>
                                              Completing
                                            </span>
                                          ) : (
                                            <span className="flex items-center">
                                              <CheckCheck size={14} className="mr-1" />
                                              Complete
                                            </span>
                                          )}
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                        
                      {timeSlots.filter(slot => slot.trainerId === trainer.id && slot.day === day).length === 0 && (
                        <div className="text-center py-8 border border-dashed border-border rounded-lg">
                          <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-muted-foreground">No time slots for {day}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Add availability using the "Add Time Slot" button
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Upcoming Sessions */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Upcoming Sessions</h3>
            
            {upcomingBookings.length > 0 ? (
              <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/20">
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Payment
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {upcomingBookings.map((booking, index) => {
                        const student = students.find(s => s.id === booking.studentId);
                        const timeSlot = timeSlots.find(ts => ts.id === booking.timeSlotId);
                        
                        return (
                          <motion.tr 
                            key={booking.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="hover:bg-muted/10 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <UserAvatar user={student || {}} size="sm" />
                                <div className="ml-3">
                                  <div className="text-sm font-medium">
                                    {student?.name || 'Unknown'}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {student?.membershipType || 'Standard'} Member
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm">{booking.date}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm">
                                {timeSlot ? `${timeSlot.startTime} - ${timeSlot.endTime}` : 'N/A'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {timeSlot?.day || ''}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge status={booking.status} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge status={booking.paymentStatus} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {booking.status === 'confirmed' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleCompleteSession(booking.id)}
                                  disabled={isCompletingSession === booking.id}
                                >
                                  {isCompletingSession === booking.id ? (
                                    <span className="flex items-center">
                                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      Completing
                                    </span>
                                  ) : (
                                    <span className="flex items-center">
                                      <CheckCheck size={16} className="mr-2" />
                                      Complete
                                    </span>
                                  )}
                                </Button>
                              )}
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/20 rounded-xl border border-border">
                <div className="flex flex-col items-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No upcoming sessions</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    You don't have any upcoming training sessions scheduled.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </PageTransition>
    </Layout>
  );
};

export default Schedule;
