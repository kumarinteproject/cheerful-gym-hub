
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useGym } from '@/contexts/GymContext';
import { Layout } from '@/components/layout/Layout';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { DashboardCard } from '@/components/ui/DashboardCard';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { PageTransition } from '@/components/ui/PageTransition';
import { 
  Calendar, 
  User, 
  Clock, 
  CreditCard, 
  Users, 
  ArrowRight 
} from 'lucide-react';

const Dashboard = () => {
  const { user, isAdmin, isTrainer, isStudent } = useAuth();
  const { 
    students, 
    trainers, 
    bookings,
    getStudentBookings, 
    getTrainerBookings 
  } = useGym();
  const navigate = useNavigate();

  // Get relevant data based on user role
  const userBookings = isStudent && user 
    ? getStudentBookings(user.id) 
    : isTrainer && user 
      ? getTrainerBookings(user.id) 
      : [];

  const recentBookings = isAdmin 
    ? bookings.slice(0, 5) 
    : userBookings.slice(0, 5);

  return (
    <Layout>
      <PageTransition>
        <SectionHeading 
          title={`Welcome, ${user?.name}`}
          description="Here's an overview of your account"
        />

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isAdmin && (
            <>
              <DashboardCard
                title="Total Students"
                value={students.length}
                icon={<Users size={20} />}
                description="Registered students"
                delay={0}
              />
              <DashboardCard
                title="Total Trainers"
                value={trainers.length}
                icon={<User size={20} />}
                description="Active trainers"
                delay={1}
              />
              <DashboardCard
                title="Total Sessions"
                value={bookings.length}
                icon={<Calendar size={20} />}
                description="Booked sessions"
                delay={2}
              />
              <DashboardCard
                title="Completed Sessions"
                value={bookings.filter(b => b.status === 'completed').length}
                icon={<Clock size={20} />}
                description="Successfully completed"
                delay={3}
              />
            </>
          )}

          {isTrainer && (
            <>
              <DashboardCard
                title="My Students"
                value={userBookings.filter(b => 
                  b.status !== 'cancelled'
                ).map(b => b.studentId).filter((v, i, a) => a.indexOf(v) === i).length}
                icon={<Users size={20} />}
                description="Active students"
                delay={0}
              />
              <DashboardCard
                title="Upcoming Sessions"
                value={userBookings.filter(b => 
                  b.status === 'confirmed' || b.status === 'pending'
                ).length}
                icon={<Calendar size={20} />}
                description="Scheduled sessions"
                delay={1}
              />
              <DashboardCard
                title="Completed Sessions"
                value={userBookings.filter(b => b.status === 'completed').length}
                icon={<Clock size={20} />}
                description="Successfully completed"
                delay={2}
              />
              <DashboardCard
                title="Available Time Slots"
                value={user ? trainers.find(t => t.id === user.id)?.availability.filter(a => !a.isBooked).length || 0 : 0}
                icon={<Clock size={20} />}
                description="Open for booking"
                delay={3}
              />
            </>
          )}

          {isStudent && (
            <>
              <DashboardCard
                title="Upcoming Sessions"
                value={userBookings.filter(b => 
                  b.status === 'confirmed' || b.status === 'pending'
                ).length}
                icon={<Calendar size={20} />}
                description="Scheduled sessions"
                delay={0}
              />
              <DashboardCard
                title="Completed Sessions"
                value={userBookings.filter(b => b.status === 'completed').length}
                icon={<Clock size={20} />}
                description="Total completed"
                delay={1}
              />
              <DashboardCard
                title="Total Trainers"
                value={trainers.length}
                icon={<User size={20} />}
                description="Available for booking"
                delay={2}
              />
              <DashboardCard
                title="Payment Status"
                value={userBookings.filter(b => b.paymentStatus === 'paid').length}
                icon={<CreditCard size={20} />}
                description="Successful payments"
                delay={3}
              />
            </>
          )}
        </div>

        {/* Recent Bookings Section */}
        <div className="mb-8">
          <SectionHeading 
            title="Recent Bookings"
            description="Your latest session bookings"
            action={
              <Button variant="outline" size="sm" onClick={() => {
                if (isAdmin) navigate('/admin/sessions');
                else if (isTrainer) navigate('/trainer/schedule');
                else navigate('/student/sessions');
              }}>
                View All <ArrowRight size={16} className="ml-2" />
              </Button>
            }
          />

          <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/20">
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {isAdmin ? 'Student' : isTrainer ? 'Student' : 'Trainer'}
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentBookings.length > 0 ? (
                    recentBookings.map((booking, index) => {
                      // Find the associated student and trainer
                      const student = students.find(s => s.id === booking.studentId);
                      const trainer = trainers.find(t => t.id === booking.trainerId);
                      
                      // Find the time slot
                      const timeSlot = trainer?.availability.find(a => a.id === booking.timeSlotId);
                      
                      return (
                        <tr key={booking.id} className="hover:bg-muted/10 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <UserAvatar 
                                user={isAdmin || isTrainer ? student : trainer} 
                                size="sm" 
                              />
                              <div className="ml-3">
                                <div className="text-sm font-medium">
                                  {isAdmin || isTrainer 
                                    ? student?.name 
                                    : trainer?.name}
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
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={booking.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={booking.paymentStatus} />
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-muted-foreground">
                        No bookings found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <SectionHeading 
            title="Quick Actions"
            description="Frequently used actions"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {isAdmin && (
              <>
                <Button 
                  variant="outline" 
                  className="h-auto py-4 justify-start" 
                  onClick={() => navigate('/admin/students')}
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-primary/10 text-primary mr-3">
                      <Users size={18} />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Manage Students</div>
                      <div className="text-xs text-muted-foreground">View and manage student profiles</div>
                    </div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-4 justify-start" 
                  onClick={() => navigate('/admin/trainers')}
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-primary/10 text-primary mr-3">
                      <User size={18} />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Manage Trainers</div>
                      <div className="text-xs text-muted-foreground">View and manage trainer profiles</div>
                    </div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-4 justify-start" 
                  onClick={() => navigate('/admin/sessions')}
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-primary/10 text-primary mr-3">
                      <Calendar size={18} />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">View Sessions</div>
                      <div className="text-xs text-muted-foreground">Manage all training sessions</div>
                    </div>
                  </div>
                </Button>
              </>
            )}

            {isTrainer && (
              <>
                <Button 
                  variant="outline" 
                  className="h-auto py-4 justify-start" 
                  onClick={() => navigate('/trainer/schedule')}
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-primary/10 text-primary mr-3">
                      <Calendar size={18} />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">My Schedule</div>
                      <div className="text-xs text-muted-foreground">View and manage your schedule</div>
                    </div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-4 justify-start" 
                  onClick={() => navigate('/trainer/students')}
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-primary/10 text-primary mr-3">
                      <Users size={18} />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">My Students</div>
                      <div className="text-xs text-muted-foreground">View your student profiles</div>
                    </div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-4 justify-start" 
                  onClick={() => navigate('/profile')}
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-primary/10 text-primary mr-3">
                      <User size={18} />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">My Profile</div>
                      <div className="text-xs text-muted-foreground">Update your profile information</div>
                    </div>
                  </div>
                </Button>
              </>
            )}

            {isStudent && (
              <>
                <Button 
                  variant="outline" 
                  className="h-auto py-4 justify-start" 
                  onClick={() => navigate('/student/book')}
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-primary/10 text-primary mr-3">
                      <Calendar size={18} />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Book a Session</div>
                      <div className="text-xs text-muted-foreground">Find and book training sessions</div>
                    </div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-4 justify-start" 
                  onClick={() => navigate('/student/sessions')}
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-primary/10 text-primary mr-3">
                      <Clock size={18} />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">My Sessions</div>
                      <div className="text-xs text-muted-foreground">View your booked sessions</div>
                    </div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-4 justify-start" 
                  onClick={() => navigate('/student/trainers')}
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-primary/10 text-primary mr-3">
                      <User size={18} />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Browse Trainers</div>
                      <div className="text-xs text-muted-foreground">Find the right trainer for you</div>
                    </div>
                  </div>
                </Button>
              </>
            )}
          </div>
        </div>
      </PageTransition>
    </Layout>
  );
};

export default Dashboard;
