
import React, { useState } from 'react';
import { useGym } from '@/contexts/GymContext';
import { Layout } from '@/components/layout/Layout';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PageTransition } from '@/components/ui/PageTransition';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DashboardCard } from '@/components/ui/DashboardCard';
import { motion } from 'framer-motion';
import { Search, CreditCard, Download, Calendar, Clock, DollarSign } from 'lucide-react';

const Payments = () => {
  const { students, trainers, bookings, timeSlots } = useGym();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get all payments (bookings with payment status)
  const payments = bookings.filter(booking => booking.paymentStatus);
  
  // Filter payments based on search query
  const filteredPayments = payments.filter(payment => {
    if (!searchQuery) return true;
    
    const student = students.find(s => s.id === payment.studentId);
    const trainer = trainers.find(t => t.id === payment.trainerId);
    
    return (
      student?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trainer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.date.includes(searchQuery)
    );
  }).sort((a, b) => {
    // Sort by date (recent first)
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  // Calculate payment statistics
  const totalPayments = payments.filter(p => p.paymentStatus === 'paid').length;
  const totalRevenue = totalPayments * 45; // Assuming $45 per session
  const pendingPayments = payments.filter(p => p.paymentStatus === 'pending').length;
  const failedPayments = payments.filter(p => p.paymentStatus === 'failed').length;

  return (
    <Layout>
      <PageTransition>
        <SectionHeading
          title="Payments Overview"
          description="View and manage all payment transactions"
        />

        {/* Payment Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            title="Total Revenue"
            value={`$${totalRevenue.toFixed(2)}`}
            icon={<DollarSign size={20} />}
            description={`From ${totalPayments} successful payments`}
            delay={0}
          />
          <DashboardCard
            title="Successful Payments"
            value={totalPayments.toString()}
            icon={<CreditCard size={20} />}
            description="Completed transactions"
            delay={1}
          />
          <DashboardCard
            title="Pending Payments"
            value={pendingPayments.toString()}
            icon={<Clock size={20} />}
            description="Awaiting payment"
            delay={2}
          />
          <DashboardCard
            title="Failed Payments"
            value={failedPayments.toString()}
            icon={<CreditCard size={20} />}
            description="Unsuccessful transactions"
            delay={3}
          />
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search by student, trainer, or date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredPayments.length > 0 ? (
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
                      Session Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredPayments.map((payment, index) => {
                    const student = students.find(s => s.id === payment.studentId);
                    const trainer = trainers.find(t => t.id === payment.trainerId);
                    const timeSlot = timeSlots.find(ts => ts.id === payment.timeSlotId);
                    
                    return (
                      <motion.tr 
                        key={payment.id}
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
                          <div className="text-sm">{payment.date}</div>
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
                          <StatusBadge status={payment.paymentStatus} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {payment.paymentStatus === 'paid' ? (
                            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                              <Download size={16} className="mr-2" />
                              Receipt
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              No action available
                            </span>
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
              <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No payments found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {searchQuery
                  ? "No payments match your search criteria."
                  : "There are no payment transactions yet."}
              </p>
            </div>
          </div>
        )}
      </PageTransition>
    </Layout>
  );
};

export default Payments;
