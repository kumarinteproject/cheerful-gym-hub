
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGym } from '@/contexts/GymContext';
import { Layout } from '@/components/layout/Layout';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PageTransition } from '@/components/ui/PageTransition';
import { Input } from '@/components/ui/input';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Search, Users, Calendar, Clock } from 'lucide-react';

const MyStudents = () => {
  const { user } = useAuth();
  const { students, getTrainerBookings } = useGym();
  const [searchQuery, setSearchQuery] = useState('');
  
  if (!user) return null;
  
  // Get all bookings for this trainer
  const trainerBookings = getTrainerBookings(user.id);
  
  // Get unique student IDs with active bookings
  const activeStudentIds = [...new Set(
    trainerBookings
      .filter(b => b.status === 'confirmed' || b.status === 'pending')
      .map(b => b.studentId)
  )];
  
  // Get unique student IDs with past bookings
  const pastStudentIds = [...new Set(
    trainerBookings
      .filter(b => b.status === 'completed' || b.status === 'cancelled')
      .map(b => b.studentId)
  )];
  
  // Get unique student IDs from all bookings
  const allStudentIds = [...new Set(trainerBookings.map(b => b.studentId))];
  
  // Get student objects
  const activeStudents = students.filter(s => activeStudentIds.includes(s.id));
  const pastStudents = students.filter(s => 
    pastStudentIds.includes(s.id) && !activeStudentIds.includes(s.id)
  );
  const allStudents = students.filter(s => allStudentIds.includes(s.id));
  
  // Filter students based on search query
  const filterStudents = (studentsList: typeof students) => {
    if (!searchQuery) return studentsList;
    
    return studentsList.filter(student => 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };
  
  const filteredActiveStudents = filterStudents(activeStudents);
  const filteredPastStudents = filterStudents(pastStudents);
  const filteredAllStudents = filterStudents(allStudents);
  
  // Get stats for a student
  const getStudentStats = (studentId: string) => {
    const studentBookings = trainerBookings.filter(b => b.studentId === studentId);
    
    const completedSessions = studentBookings.filter(b => b.status === 'completed').length;
    const upcomingSessions = studentBookings.filter(
      b => b.status === 'confirmed' || b.status === 'pending'
    ).length;
    
    // Find the latest booking
    let latestBooking = null;
    if (studentBookings.length > 0) {
      latestBooking = studentBookings.reduce((latest, current) => {
        if (!latest) return current;
        return new Date(current.date) > new Date(latest.date) ? current : latest;
      }, null);
    }
    
    return {
      completedSessions,
      upcomingSessions,
      latestBooking,
      totalSessions: studentBookings.length,
    };
  };

  const renderStudentCard = (student: typeof students[0], index: number) => {
    const stats = getStudentStats(student.id);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className="bg-white rounded-xl border border-border overflow-hidden shadow-sm"
      >
        <div className="p-6">
          <div className="flex items-center mb-4">
            <UserAvatar user={student} />
            <div className="ml-3">
              <h3 className="font-semibold">{student.name}</h3>
              <p className="text-xs text-muted-foreground">{student.email}</p>
            </div>
          </div>
          
          <div className="space-y-3 mb-4">
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
          </div>
          
          {stats.latestBooking && (
            <div className="pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground mb-1">Latest Session</p>
              <div className="flex justify-between items-center">
                <div className="flex items-center text-sm">
                  <Calendar size={14} className="mr-1 text-muted-foreground" />
                  <span>{stats.latestBooking.date}</span>
                </div>
                <StatusBadge status={stats.latestBooking.status} />
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-muted/10 p-4 border-t border-border">
          <Button variant="secondary" className="w-full" size="sm">
            View Details
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <Layout>
      <PageTransition>
        <SectionHeading
          title="My Students"
          description="View and manage your student profiles"
        />

        <div className="mb-6 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search students by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="w-full max-w-md mb-6">
            <TabsTrigger value="active" className="flex-1">
              Active Students
            </TabsTrigger>
            <TabsTrigger value="past" className="flex-1">
              Past Students
            </TabsTrigger>
            <TabsTrigger value="all" className="flex-1">
              All Students
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            {filteredActiveStudents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredActiveStudents.map((student, index) => renderStudentCard(student, index))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/20 rounded-xl border border-border">
                <div className="flex flex-col items-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No active students</h3>
                  {searchQuery ? (
                    <p className="text-muted-foreground max-w-md mx-auto">
                      No active students found matching your search.
                    </p>
                  ) : (
                    <p className="text-muted-foreground max-w-md mx-auto">
                      You don't have any active students at the moment.
                    </p>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="past">
            {filteredPastStudents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPastStudents.map((student, index) => renderStudentCard(student, index))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/20 rounded-xl border border-border">
                <div className="flex flex-col items-center">
                  <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No past students</h3>
                  {searchQuery ? (
                    <p className="text-muted-foreground max-w-md mx-auto">
                      No past students found matching your search.
                    </p>
                  ) : (
                    <p className="text-muted-foreground max-w-md mx-auto">
                      You don't have any past students who aren't currently active.
                    </p>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="all">
            {filteredAllStudents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAllStudents.map((student, index) => renderStudentCard(student, index))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/20 rounded-xl border border-border">
                <div className="flex flex-col items-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No students found</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    No students found matching your search criteria.
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </PageTransition>
    </Layout>
  );
};

export default MyStudents;
