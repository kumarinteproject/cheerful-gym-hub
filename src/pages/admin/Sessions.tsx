
import React, { useState } from 'react';
import { useGym } from '@/contexts/GymContext';
import { Layout } from '@/components/layout/Layout';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PageTransition } from '@/components/ui/PageTransition';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Search, Calendar, Clock, CheckCheck, X, Loader2 } from 'lucide-react';

const Sessions = () => {
  const { students, trainers, bookings, timeSlots, completeBooking, cancelBooking } = useGym();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [actioningBookingId, setActioningBookingId] = useState<string | null>(null);
  
  // Filter bookings based on search query and status filter
  const filteredBookings = bookings.filter(booking => {
    // Status filter
    if (filterStatus !== 'all' && booking.status !== filterStatus) {
      return false;
    }
    
    // Search query
    if (searchQuery) {
      const student = students.find(s => s.id === booking.studentId);
      const trainer = trainers.find(t => t.id === booking.trainerId);
      
      return (
        student?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trainer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.date.includes(searchQuery)
      );
    }
    
    return true;
  }).sort((a, b) => {
    // Sort by date (recent first) and then by status (pending/confirmed first)
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    
    if (dateA.getTime() !== dateB.getTime()) {
      return dateB.getTime() - dateA.getTime();
    }
    
    // Pending and confirmed sessions come first
    const statusOrderA = a.status === 'pending' || a.status === 'confirmed' ? 0 : 1;
    const statusOrderB = b.status === 'pending' || b.status === 'confirmed' ? 0 : 1;
    
    return statusOrderA - statusOrderB;
  });

  const handleCompleteSession = async (bookingId: string) => {
    try {
      setActioningBookingId(bookingId);
      await completeBooking(bookingId);
      
      toast({
        title: "Session completed",
        description: "The training session has been marked as completed",
      });
    } catch (error) {
      console.error('Error completing session:', error);
    } finally {
      setActioningBookingId(null);
    }
  };

  const handleCancelSession = async (bookingId: string) => {
    try {
      setActioningBookingId(bookingId);
      await cancelBooking(bookingId);
      
      toast({
        title: "Session cancelled",
        description: "The training session has been cancelled",
      });
    } catch (error) {
      console.error('Error cancelling session:', error);
    } finally {
      setActioningBookingId(null);
    }
  };

  return (
    <Layout>
      <PageTransition>
        <SectionHeading
          title="Sessions Management"
          description="View and manage all training sessions"
        />

        <div className="mb-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search by student, trainer, or date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="w-full sm:w-40">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sessions</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredBookings.length > 0 ? (
          <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/20">
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Trainer
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
                  {filteredBookings.map((booking, index) => {
                    const student = students.find(s => s.id === booking.studentId);
                    const trainer = trainers.find(t => t.id === booking.trainerId);
                    const timeSlot = timeSlots.find(ts => ts.id === booking.timeSlotId);
                    
                    return (
                      <motion.tr 
                        key={booking.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.03 }}
                        className="hover:bg-muted/10 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <UserAvatar user={student || {}} size="sm" />
                            <div className="ml-3">
                              <div className="text-sm font-medium">{student?.name || 'Unknown'}</div>
                              <div className="text-xs text-muted-foreground">{student?.email || ''}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <UserAvatar user={trainer || {}} size="sm" />
                            <div className="ml-3">
                              <div className="text-sm font-medium">{trainer?.name || 'Unknown'}</div>
                              <div className="text-xs text-muted-foreground">
                                {trainer?.expertise[0] || ''}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">{booking.date}</div>
                          <div className="text-xs text-muted-foreground">
                            {timeSlot?.day || ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            {timeSlot ? `${timeSlot.startTime} - ${timeSlot.endTime}` : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={booking.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={booking.paymentStatus} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            {(booking.status === 'confirmed' || booking.status === 'pending') && (
                              <>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleCompleteSession(booking.id)}
                                  disabled={
                                    actioningBookingId === booking.id || 
                                    booking.paymentStatus !== 'paid'
                                  }
                                >
                                  {actioningBookingId === booking.id ? (
                                    <Loader2 size={16} className="animate-spin" />
                                  ) : (
                                    <CheckCheck size={16} />
                                  )}
                                </Button>
                                
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-500 hover:bg-red-50 hover:text-red-600 border-red-200"
                                  onClick={() => handleCancelSession(booking.id)}
                                  disabled={actioningBookingId === booking.id}
                                >
                                  {actioningBookingId === booking.id ? (
                                    <Loader2 size={16} className="animate-spin" />
                                  ) : (
                                    <X size={16} />
                                  )}
                                </Button>
                              </>
                            )}
                          </div>
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
              <h3 className="text-lg font-medium mb-2">No sessions found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {searchQuery || filterStatus !== 'all'
                  ? "No sessions match your search criteria."
                  : "There are no training sessions yet."}
              </p>
            </div>
          </div>
        )}
      </PageTransition>
    </Layout>
  );
};

export default Sessions;
