
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Student, Trainer, Admin, TimeSlot, Booking, PaymentInfo } from '@/types';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { fetchStudents, fetchTrainers, fetchAdmins } from '@/lib/api/users';
import { fetchTimeSlots } from '@/lib/api/timeSlots';
import { fetchBookings } from '@/lib/api/bookings';
import { 
  bookTimeSlot as apiBookTimeSlot,
  cancelBooking as apiCancelBooking,
  completeBooking as apiCompleteBooking
} from '@/lib/api/bookings';
import { processPayment as apiProcessPayment } from '@/lib/api/payments';
import { 
  addTrainer as apiAddTrainer,
  removeTrainer as apiRemoveTrainer,
  removeStudent as apiRemoveStudent
} from '@/lib/api/users';
import { 
  addTimeSlot as apiAddTimeSlot,
  removeTimeSlot as apiRemoveTimeSlot
} from '@/lib/api/timeSlots';

interface GymContextType {
  students: Student[];
  trainers: Trainer[];
  admins: Admin[];
  timeSlots: TimeSlot[];
  bookings: Booking[];
  bookTimeSlot: (studentId: string, trainerId: string, timeSlotId: string, date: string) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
  completeBooking: (bookingId: string) => Promise<void>;
  processPayment: (bookingId: string, paymentInfo: PaymentInfo) => Promise<boolean>;
  addTrainer: (trainer: Omit<Trainer, 'id' | 'bookings' | 'availability'>) => Promise<void>;
  removeTrainer: (trainerId: string) => Promise<void>;
  removeStudent: (studentId: string) => Promise<void>;
  addTimeSlot: (trainerId: string, day: string, startTime: string, endTime: string) => Promise<void>;
  removeTimeSlot: (timeSlotId: string) => Promise<void>;
  getStudentBookings: (studentId: string) => Booking[];
  getTrainerBookings: (trainerId: string) => Booking[];
  getAvailableTimeSlots: (trainerId?: string) => TimeSlot[];
  getBookingByTimeSlot: (timeSlotId: string) => Booking | undefined;
}

const GymContext = createContext<GymContextType>({
  students: [],
  trainers: [],
  admins: [],
  timeSlots: [],
  bookings: [],
  bookTimeSlot: async () => {},
  cancelBooking: async () => {},
  completeBooking: async () => {},
  processPayment: async () => false,
  addTrainer: async () => {},
  removeTrainer: async () => {},
  removeStudent: async () => {},
  addTimeSlot: async () => {},
  removeTimeSlot: async () => {},
  getStudentBookings: () => [],
  getTrainerBookings: () => [],
  getAvailableTimeSlots: () => [],
  getBookingByTimeSlot: () => undefined,
});

export const GymProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gymStudents, setGymStudents] = useState<Student[]>([]);
  const [gymTrainers, setGymTrainers] = useState<Trainer[]>([]);
  const [gymAdmins, setGymAdmins] = useState<Admin[]>([]);
  const [gymTimeSlots, setGymTimeSlots] = useState<TimeSlot[]>([]);
  const [gymBookings, setGymBookings] = useState<Booking[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch data from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch all needed data
        const [students, trainers, admins, timeSlots, bookings] = await Promise.all([
          fetchStudents(),
          fetchTrainers(),
          fetchAdmins(),
          fetchTimeSlots(),
          fetchBookings()
        ]);
        
        setGymStudents(students);
        setGymTrainers(trainers);
        setGymAdmins(admins);
        setGymTimeSlots(timeSlots);
        setGymBookings(bookings);
      } catch (error) {
        console.error('Error loading gym data:', error);
        toast({
          title: "Error loading data",
          description: "Failed to load gym data. Please refresh the page.",
          variant: "destructive",
        });
      }
    };
    
    loadData();
    
    // Subscribe to real-time updates from Supabase
    const bookingsSubscription = supabase
      .channel('bookings-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, payload => {
        // Refresh bookings when changes occur
        fetchBookings().then(setGymBookings);
      })
      .subscribe();
      
    const timeSlotsSubscription = supabase
      .channel('time-slots-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'time_slots' }, payload => {
        // Refresh time slots when changes occur
        fetchTimeSlots().then(setGymTimeSlots);
      })
      .subscribe();
      
    const usersSubscription = supabase
      .channel('users-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, payload => {
        // Refresh users when changes occur
        Promise.all([
          fetchStudents(),
          fetchTrainers(),
          fetchAdmins()
        ]).then(([students, trainers, admins]) => {
          setGymStudents(students);
          setGymTrainers(trainers);
          setGymAdmins(admins);
        });
      })
      .subscribe();
    
    // Cleanup subscriptions
    return () => {
      bookingsSubscription.unsubscribe();
      timeSlotsSubscription.unsubscribe();
      usersSubscription.unsubscribe();
    };
  }, [toast]);

  // Functions using the API modules
  const bookTimeSlot = async (studentId: string, trainerId: string, timeSlotId: string, date: string) => {
    try {
      await apiBookTimeSlot(studentId, trainerId, timeSlotId, date);
      
      // Refresh data
      const [updatedTimeSlots, updatedBookings] = await Promise.all([
        fetchTimeSlots(),
        fetchBookings()
      ]);
      
      setGymTimeSlots(updatedTimeSlots);
      setGymBookings(updatedBookings);
      
      toast({
        title: "Booking created",
        description: "Please proceed to payment to confirm your booking",
      });
    } catch (error: any) {
      toast({
        title: "Booking failed",
        description: error.message || "An error occurred while booking",
        variant: "destructive",
      });
      throw error;
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      await apiCancelBooking(bookingId);
      
      // Refresh data
      const [updatedTimeSlots, updatedBookings] = await Promise.all([
        fetchTimeSlots(),
        fetchBookings()
      ]);
      
      setGymTimeSlots(updatedTimeSlots);
      setGymBookings(updatedBookings);
      
      toast({
        title: "Booking cancelled",
        description: "Your booking has been cancelled successfully",
      });
    } catch (error: any) {
      toast({
        title: "Cancellation failed",
        description: error.message || "An error occurred while cancelling",
        variant: "destructive",
      });
      throw error;
    }
  };

  const completeBooking = async (bookingId: string) => {
    try {
      await apiCompleteBooking(bookingId);
      
      // Refresh bookings
      const updatedBookings = await fetchBookings();
      setGymBookings(updatedBookings);
      
      toast({
        title: "Session completed",
        description: "The training session has been marked as completed",
      });
    } catch (error: any) {
      toast({
        title: "Completion failed",
        description: error.message || "An error occurred while marking session as complete",
        variant: "destructive",
      });
      throw error;
    }
  };

  const processPayment = async (bookingId: string, paymentInfo: PaymentInfo): Promise<boolean> => {
    try {
      const success = await apiProcessPayment(bookingId, paymentInfo);
      
      // Refresh bookings
      const updatedBookings = await fetchBookings();
      setGymBookings(updatedBookings);
      
      if (success) {
        toast({
          title: "Payment successful",
          description: "Your booking has been confirmed",
        });
      } else {
        toast({
          title: "Payment failed",
          description: "Please try again with a different payment method",
          variant: "destructive",
        });
      }
      
      return success;
    } catch (error: any) {
      toast({
        title: "Payment failed",
        description: error.message || "An error occurred during payment",
        variant: "destructive",
      });
      return false;
    }
  };

  const addTrainer = async (trainerData: Omit<Trainer, 'id' | 'bookings' | 'availability'>) => {
    try {
      await apiAddTrainer(trainerData);
      
      // Refresh trainers
      const updatedTrainers = await fetchTrainers();
      setGymTrainers(updatedTrainers);
      
      toast({
        title: "Trainer added",
        description: `${trainerData.name} has been added successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Adding trainer failed",
        description: error.message || "An error occurred while adding the trainer",
        variant: "destructive",
      });
      throw error;
    }
  };

  const removeTrainer = async (trainerId: string) => {
    try {
      await apiRemoveTrainer(trainerId);
      
      // Refresh trainers and time slots
      const [updatedTrainers, updatedTimeSlots] = await Promise.all([
        fetchTrainers(),
        fetchTimeSlots()
      ]);
      
      setGymTrainers(updatedTrainers);
      setGymTimeSlots(updatedTimeSlots);
      
      toast({
        title: "Trainer removed",
        description: "Trainer has been removed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Removing trainer failed",
        description: error.message || "An error occurred while removing the trainer",
        variant: "destructive",
      });
      throw error;
    }
  };

  const removeStudent = async (studentId: string) => {
    try {
      await apiRemoveStudent(studentId);
      
      // Refresh students
      const updatedStudents = await fetchStudents();
      setGymStudents(updatedStudents);
      
      toast({
        title: "Student removed",
        description: "Student has been removed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Removing student failed",
        description: error.message || "An error occurred while removing the student",
        variant: "destructive",
      });
      throw error;
    }
  };

  const addTimeSlot = async (trainerId: string, day: string, startTime: string, endTime: string) => {
    try {
      await apiAddTimeSlot(trainerId, day, startTime, endTime);
      
      // Refresh time slots
      const updatedTimeSlots = await fetchTimeSlots();
      setGymTimeSlots(updatedTimeSlots);
      
      toast({
        title: "Time slot added",
        description: "New time slot added successfully",
      });
    } catch (error: any) {
      toast({
        title: "Adding time slot failed",
        description: error.message || "An error occurred while adding the time slot",
        variant: "destructive",
      });
      throw error;
    }
  };

  const removeTimeSlot = async (timeSlotId: string) => {
    try {
      await apiRemoveTimeSlot(timeSlotId);
      
      // Refresh time slots
      const updatedTimeSlots = await fetchTimeSlots();
      setGymTimeSlots(updatedTimeSlots);
      
      toast({
        title: "Time slot removed",
        description: "The time slot has been removed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Removing time slot failed",
        description: error.message || "An error occurred while removing the time slot",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Helper functions
  const getStudentBookings = (studentId: string): Booking[] => {
    return gymBookings.filter(b => b.studentId === studentId);
  };

  const getTrainerBookings = (trainerId: string): Booking[] => {
    return gymBookings.filter(b => b.trainerId === trainerId);
  };

  const getAvailableTimeSlots = (trainerId?: string): TimeSlot[] => {
    if (trainerId) {
      return gymTimeSlots.filter(slot => slot.trainerId === trainerId && !slot.isBooked);
    }
    return gymTimeSlots.filter(slot => !slot.isBooked);
  };

  const getBookingByTimeSlot = (timeSlotId: string): Booking | undefined => {
    return gymBookings.find(b => b.timeSlotId === timeSlotId);
  };

  return (
    <GymContext.Provider
      value={{
        students: gymStudents,
        trainers: gymTrainers,
        admins: gymAdmins,
        timeSlots: gymTimeSlots,
        bookings: gymBookings,
        bookTimeSlot,
        cancelBooking,
        completeBooking,
        processPayment,
        addTrainer,
        removeTrainer,
        removeStudent,
        addTimeSlot,
        removeTimeSlot,
        getStudentBookings,
        getTrainerBookings,
        getAvailableTimeSlots,
        getBookingByTimeSlot,
      }}
    >
      {children}
    </GymContext.Provider>
  );
};

export const useGym = () => useContext(GymContext);
