
import React, { useState } from 'react';
import { useGym } from '@/contexts/GymContext';
import { Layout } from '@/components/layout/Layout';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PageTransition } from '@/components/ui/PageTransition';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Search, UserPlus, User, Calendar, Clock, Trash2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Students = () => {
  const { students, bookings, removeStudent } = useGym();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);
  
  // Filter students based on search query
  const filteredStudents = searchQuery
    ? students.filter(student => 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : students;

  const getStudentStats = (studentId: string) => {
    const studentBookings = bookings.filter(b => b.studentId === studentId);
    
    const completedSessions = studentBookings.filter(b => b.status === 'completed').length;
    const upcomingSessions = studentBookings.filter(
      b => b.status === 'confirmed' || b.status === 'pending'
    ).length;
    const cancelledSessions = studentBookings.filter(b => b.status === 'cancelled').length;
    const totalSessions = studentBookings.length;
    
    return {
      completedSessions,
      upcomingSessions,
      cancelledSessions,
      totalSessions,
    };
  };

  const handleDeleteStudent = async (studentId: string) => {
    try {
      setDeletingStudentId(studentId);
      await removeStudent(studentId);
      
      toast({
        title: "Student removed",
        description: "The student has been removed successfully",
      });
    } catch (error) {
      console.error('Error removing student:', error);
      // Error is handled in the context with toast
    } finally {
      setDeletingStudentId(null);
    }
  };

  return (
    <Layout>
      <PageTransition>
        <SectionHeading
          title="Students Management"
          description="View and manage student accounts"
          action={
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus size={16} className="mr-2" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Student</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-muted-foreground text-sm mb-4">
                    New students can register themselves via the registration form. 
                    As an admin, you can view and manage existing student accounts.
                  </p>
                  <Button className="w-full" onClick={() => window.location.href = '/auth'}>
                    Go to Registration
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          }
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

        {filteredStudents.length > 0 ? (
          <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/20">
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Membership
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Total Sessions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Upcoming
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Completed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredStudents.map((student, index) => {
                    const stats = getStudentStats(student.id);
                    
                    return (
                      <motion.tr 
                        key={student.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="hover:bg-muted/10 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <UserAvatar user={student} size="sm" />
                            <div className="ml-3">
                              <div className="text-sm font-medium">{student.name}</div>
                              <div className="text-xs text-muted-foreground">{student.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            {student.membershipType || 'Standard'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium">
                            {stats.totalSessions}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            {stats.upcomingSessions}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            {stats.completedSessions}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                              <User size={16} className="mr-1" />
                              View
                            </Button>
                            
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteStudent(student.id)}
                              disabled={deletingStudentId === student.id || stats.upcomingSessions > 0}
                            >
                              {deletingStudentId === student.id ? (
                                <>
                                  <Loader2 size={16} className="mr-1 animate-spin" />
                                  Removing...
                                </>
                              ) : (
                                <>
                                  <Trash2 size={16} className="mr-1" />
                                  Remove
                                </>
                              )}
                            </Button>
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
              <User className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No students found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {searchQuery 
                  ? "No students match your search criteria." 
                  : "There are no registered students yet."}
              </p>
            </div>
          </div>
        )}
      </PageTransition>
    </Layout>
  );
};

export default Students;
