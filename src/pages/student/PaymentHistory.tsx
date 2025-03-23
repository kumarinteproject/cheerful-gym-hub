
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGym } from '@/contexts/GymContext';
import { Layout } from '@/components/layout/Layout';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PageTransition } from '@/components/ui/PageTransition';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Download, CreditCard, Calendar, Clock } from 'lucide-react';

const PaymentHistory = () => {
  const { user } = useAuth();
  const { trainers, timeSlots, getStudentBookings } = useGym();
  
  if (!user) return null;
  
  // Get all bookings for the student
  const bookings = getStudentBookings(user.id);
  
  // Sort bookings by date (most recent first)
  const sortedBookings = [...bookings].sort((a, b) => {
    // Prioritize bookings with 'paid' status
    if (a.paymentStatus === 'paid' && b.paymentStatus !== 'paid') return -1;
    if (a.paymentStatus !== 'paid' && b.paymentStatus === 'paid') return 1;
    
    // Then sort by date
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <Layout>
      <PageTransition>
        <SectionHeading
          title="Payment History"
          description="View your payment history and download receipts"
        />

        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-xl border border-border p-6 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Total Spent</h3>
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  <CreditCard size={18} />
                </div>
              </div>
              <p className="text-2xl font-semibold">
                ${bookings.filter(b => b.paymentStatus === 'paid').length * 45}.00
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                For {bookings.filter(b => b.paymentStatus === 'paid').length} sessions
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white rounded-xl border border-border p-6 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Successful Payments</h3>
                <div className="p-2 rounded-full bg-green-100 text-green-600">
                  <Clock size={18} />
                </div>
              </div>
              <p className="text-2xl font-semibold">
                {bookings.filter(b => b.paymentStatus === 'paid').length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Out of {bookings.length} total bookings
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-white rounded-xl border border-border p-6 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Last Payment</h3>
                <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                  <Calendar size={18} />
                </div>
              </div>
              <p className="text-2xl font-semibold">
                {bookings.filter(b => b.paymentStatus === 'paid').length > 0 
                  ? bookings.filter(b => b.paymentStatus === 'paid')[0].date 
                  : 'N/A'
                }
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {bookings.filter(b => b.paymentStatus === 'paid').length > 0 
                  ? `$45.00 paid` 
                  : 'No payments yet'
                }
              </p>
            </motion.div>
          </div>

          {/* Payment History Table */}
          <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/20">
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Trainer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Receipt
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sortedBookings.length > 0 ? (
                    sortedBookings.map((booking, index) => {
                      const trainer = trainers.find(t => t.id === booking.trainerId);
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
                              <UserAvatar user={trainer || {}} size="sm" />
                              <div className="ml-3">
                                <div className="text-sm font-medium">
                                  {trainer?.name || 'Unknown'}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {trainer?.expertise.join(', ') || ''}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">{booking.date}</div>
                            <div className="text-xs text-muted-foreground">
                              {timeSlot ? `${timeSlot.startTime} - ${timeSlot.endTime}` : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium">$45.00</div>
                            <div className="text-xs text-muted-foreground">
                              Standard Rate
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={booking.paymentStatus} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {booking.paymentStatus === 'paid' ? (
                              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                                <Download size={16} className="mr-1" />
                                Receipt
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                Not available
                              </span>
                            )}
                          </td>
                        </motion.tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center">
                        <div className="flex flex-col items-center">
                          <CreditCard className="h-10 w-10 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">No payment history</h3>
                          <p className="text-muted-foreground max-w-md">
                            You haven't made any payments yet. Book a session to get started.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </PageTransition>
    </Layout>
  );
};

export default PaymentHistory;
