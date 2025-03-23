
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Student, Trainer, Admin, TimeSlot, Booking, PaymentInfo } from '@/types';
import { students, trainers, admins, timeSlots, bookings } from '@/lib/mock-data';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

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
  const [gymStudents, setGymStudents] = useState<Student[]>(students);
  const [gymTrainers, setGymTrainers] = useState<Trainer[]>(trainers);
  const [gymAdmins] = useState<Admin[]>(admins);
  const [gymTimeSlots, setGymTimeSlots] = useState<TimeSlot[]>(timeSlots);
  const [gymBookings, setGymBookings] = useState<Booking[]>(bookings);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load data from localStorage on init
  useEffect(() => {
    const savedData = localStorage.getItem('gym_data');
    if (savedData) {
      try {
        const { students, trainers, timeSlots, bookings } = JSON.parse(savedData);
        if (students) setGymStudents(students);
        if (trainers) setGymTrainers(trainers);
        if (timeSlots) setGymTimeSlots(timeSlots);
        if (bookings) setGymBookings(bookings);
      } catch (error) {
        console.error('Error loading saved gym data:', error);
      }
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    const dataToSave = {
      students: gymStudents,
      trainers: gymTrainers,
      timeSlots: gymTimeSlots,
      bookings: gymBookings,
    };
    localStorage.setItem('gym_data', JSON.stringify(dataToSave));
  }, [gymStudents, gymTrainers, gymTimeSlots, gymBookings]);

  const bookTimeSlot = async (studentId: string, trainerId: string, timeSlotId: string, date: string) => {
    // Check if time slot exists and is available
    const timeSlot = gymTimeSlots.find(slot => slot.id === timeSlotId && !slot.isBooked);
    if (!timeSlot) {
      toast({
        title: "Booking failed",
        description: "This time slot is no longer available",
        variant: "destructive",
      });
      throw new Error('Time slot not available');
    }

    // Check if student exists
    const student = gymStudents.find(s => s.id === studentId);
    if (!student) {
      toast({
        title: "Booking failed",
        description: "Student not found",
        variant: "destructive",
      });
      throw new Error('Student not found');
    }

    // Check if trainer exists
    const trainer = gymTrainers.find(t => t.id === trainerId);
    if (!trainer) {
      toast({
        title: "Booking failed",
        description: "Trainer not found",
        variant: "destructive",
      });
      throw new Error('Trainer not found');
    }

    // Create booking
    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      studentId,
      trainerId,
      timeSlotId,
      date,
      status: 'pending',
      paymentStatus: 'pending',
    };

    // Update time slot status
    const updatedTimeSlots = gymTimeSlots.map(slot => 
      slot.id === timeSlotId ? { ...slot, isBooked: true } : slot
    );

    // Update student bookings
    const updatedStudents = gymStudents.map(s => 
      s.id === studentId ? { ...s, bookings: [...s.bookings, newBooking] } : s
    );

    // Update trainer bookings
    const updatedTrainers = gymTrainers.map(t => 
      t.id === trainerId ? { ...t, bookings: [...t.bookings, newBooking] } : t
    );

    // Update state
    setGymTimeSlots(updatedTimeSlots);
    setGymStudents(updatedStudents);
    setGymTrainers(updatedTrainers);
    setGymBookings([...gymBookings, newBooking]);

    toast({
      title: "Booking created",
      description: "Please proceed to payment to confirm your booking",
    });

    return;
  };

  const cancelBooking = async (bookingId: string) => {
    // Find booking
    const booking = gymBookings.find(b => b.id === bookingId);
    if (!booking) {
      toast({
        title: "Cancellation failed",
        description: "Booking not found",
        variant: "destructive",
      });
      throw new Error('Booking not found');
    }

    // Update booking status
    const updatedBookings = gymBookings.map(b => 
      b.id === bookingId ? { ...b, status: 'cancelled' } : b
    );

    // Free up time slot
    const updatedTimeSlots = gymTimeSlots.map(slot => 
      slot.id === booking.timeSlotId ? { ...slot, isBooked: false } : slot
    );

    // Update student bookings
    const updatedStudents = gymStudents.map(s => {
      if (s.id === booking.studentId) {
        const updatedStudentBookings = s.bookings.map(b => 
          b.id === bookingId ? { ...b, status: 'cancelled' } : b
        );
        return { ...s, bookings: updatedStudentBookings };
      }
      return s;
    });

    // Update trainer bookings
    const updatedTrainers = gymTrainers.map(t => {
      if (t.id === booking.trainerId) {
        const updatedTrainerBookings = t.bookings.map(b => 
          b.id === bookingId ? { ...b, status: 'cancelled' } : b
        );
        return { ...t, bookings: updatedTrainerBookings };
      }
      return t;
    });

    // Update state
    setGymBookings(updatedBookings);
    setGymTimeSlots(updatedTimeSlots);
    setGymStudents(updatedStudents);
    setGymTrainers(updatedTrainers);

    toast({
      title: "Booking cancelled",
      description: "Your booking has been cancelled successfully",
    });
  };

  const completeBooking = async (bookingId: string) => {
    // Update booking status
    const updatedBookings = gymBookings.map(b => 
      b.id === bookingId ? { ...b, status: 'completed' } : b
    );

    // Update student bookings
    const booking = gymBookings.find(b => b.id === bookingId);
    if (!booking) return;

    const updatedStudents = gymStudents.map(s => {
      if (s.id === booking.studentId) {
        const updatedStudentBookings = s.bookings.map(b => 
          b.id === bookingId ? { ...b, status: 'completed' } : b
        );
        return { ...s, bookings: updatedStudentBookings };
      }
      return s;
    });

    // Update trainer bookings
    const updatedTrainers = gymTrainers.map(t => {
      if (t.id === booking.trainerId) {
        const updatedTrainerBookings = t.bookings.map(b => 
          b.id === bookingId ? { ...b, status: 'completed' } : b
        );
        return { ...t, bookings: updatedTrainerBookings };
      }
      return t;
    });

    // Update state
    setGymBookings(updatedBookings);
    setGymStudents(updatedStudents);
    setGymTrainers(updatedTrainers);

    toast({
      title: "Session completed",
      description: "The training session has been marked as completed",
    });
  };

  const processPayment = async (bookingId: string, paymentInfo: PaymentInfo): Promise<boolean> => {
    // In a real app, we would process the payment through a payment gateway
    // For demo purposes, we'll simulate a payment with a 90% success rate
    const paymentSuccess = Math.random() < 0.9;

    // Find booking
    const booking = gymBookings.find(b => b.id === bookingId);
    if (!booking) {
      toast({
        title: "Payment failed",
        description: "Booking not found",
        variant: "destructive",
      });
      return false;
    }

    // Update booking status
    const updatedBookings = gymBookings.map(b => 
      b.id === bookingId ? { 
        ...b, 
        paymentStatus: paymentSuccess ? 'paid' : 'failed',
        status: paymentSuccess ? 'confirmed' : 'pending'
      } : b
    );

    // Update student bookings
    const updatedStudents = gymStudents.map(s => {
      if (s.id === booking.studentId) {
        const updatedStudentBookings = s.bookings.map(b => 
          b.id === bookingId ? { 
            ...b, 
            paymentStatus: paymentSuccess ? 'paid' : 'failed',
            status: paymentSuccess ? 'confirmed' : 'pending'
          } : b
        );
        return { ...s, bookings: updatedStudentBookings };
      }
      return s;
    });

    // Update trainer bookings
    const updatedTrainers = gymTrainers.map(t => {
      if (t.id === booking.trainerId) {
        const updatedTrainerBookings = t.bookings.map(b => 
          b.id === bookingId ? { 
            ...b, 
            paymentStatus: paymentSuccess ? 'paid' : 'failed',
            status: paymentSuccess ? 'confirmed' : 'pending'
          } : b
        );
        return { ...t, bookings: updatedTrainerBookings };
      }
      return t;
    });

    // Update state
    setGymBookings(updatedBookings);
    setGymStudents(updatedStudents);
    setGymTrainers(updatedTrainers);

    // Show success or error toast
    if (paymentSuccess) {
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

    return paymentSuccess;
  };

  const addTrainer = async (trainerData: Omit<Trainer, 'id' | 'bookings' | 'availability'>) => {
    // Check if trainer with this email already exists
    const existingTrainer = gymTrainers.find(t => t.email.toLowerCase() === trainerData.email.toLowerCase());
    if (existingTrainer) {
      toast({
        title: "Adding trainer failed",
        description: "A trainer with this email already exists",
        variant: "destructive",
      });
      throw new Error('Trainer with this email already exists');
    }

    // Create new trainer
    const newTrainer: Trainer = {
      ...trainerData,
      id: `trainer-${Date.now()}`,
      bookings: [],
      availability: []
    };

    // Update state
    setGymTrainers([...gymTrainers, newTrainer]);

    toast({
      title: "Trainer added",
      description: `${newTrainer.name} has been added successfully`,
    });
  };

  const removeTrainer = async (trainerId: string) => {
    // Check if trainer exists
    const trainer = gymTrainers.find(t => t.id === trainerId);
    if (!trainer) {
      toast({
        title: "Removing trainer failed",
        description: "Trainer not found",
        variant: "destructive",
      });
      throw new Error('Trainer not found');
    }

    // Check if trainer has active bookings
    const activeBookings = gymBookings.filter(
      b => b.trainerId === trainerId && 
          (b.status === 'confirmed' || b.status === 'pending')
    );

    if (activeBookings.length > 0) {
      toast({
        title: "Removing trainer failed",
        description: "This trainer has active bookings and cannot be removed",
        variant: "destructive",
      });
      throw new Error('Trainer has active bookings');
    }

    // Remove trainer
    setGymTrainers(gymTrainers.filter(t => t.id !== trainerId));
    
    // Remove trainer's time slots
    setGymTimeSlots(gymTimeSlots.filter(slot => slot.trainerId !== trainerId));

    toast({
      title: "Trainer removed",
      description: `${trainer.name} has been removed successfully`,
    });
  };

  const removeStudent = async (studentId: string) => {
    // Check if student exists
    const student = gymStudents.find(s => s.id === studentId);
    if (!student) {
      toast({
        title: "Removing student failed",
        description: "Student not found",
        variant: "destructive",
      });
      throw new Error('Student not found');
    }

    // Check if student has active bookings
    const activeBookings = gymBookings.filter(
      b => b.studentId === studentId && 
          (b.status === 'confirmed' || b.status === 'pending')
    );

    if (activeBookings.length > 0) {
      toast({
        title: "Removing student failed",
        description: "This student has active bookings and cannot be removed",
        variant: "destructive",
      });
      throw new Error('Student has active bookings');
    }

    // Remove student
    setGymStudents(gymStudents.filter(s => s.id !== studentId));

    toast({
      title: "Student removed",
      description: `${student.name} has been removed successfully`,
    });
  };

  const addTimeSlot = async (trainerId: string, day: string, startTime: string, endTime: string) => {
    // Check if trainer exists
    const trainer = gymTrainers.find(t => t.id === trainerId);
    if (!trainer) {
      toast({
        title: "Adding time slot failed",
        description: "Trainer not found",
        variant: "destructive",
      });
      throw new Error('Trainer not found');
    }

    // Check for time slot conflicts
    const conflictingSlot = gymTimeSlots.find(
      slot => slot.trainerId === trainerId && 
             slot.day === day && 
             ((startTime >= slot.startTime && startTime < slot.endTime) || 
              (endTime > slot.startTime && endTime <= slot.endTime) ||
              (startTime <= slot.startTime && endTime >= slot.endTime))
    );

    if (conflictingSlot) {
      toast({
        title: "Adding time slot failed",
        description: "This time slot conflicts with an existing one",
        variant: "destructive",
      });
      throw new Error('Time slot conflict');
    }

    // Create new time slot
    const newTimeSlot: TimeSlot = {
      id: `slot-${Date.now()}`,
      trainerId,
      day,
      startTime,
      endTime,
      isBooked: false
    };

    // Update state
    setGymTimeSlots([...gymTimeSlots, newTimeSlot]);
    
    // Update trainer availability
    const updatedTrainers = gymTrainers.map(t => 
      t.id === trainerId ? { ...t, availability: [...t.availability, newTimeSlot] } : t
    );
    setGymTrainers(updatedTrainers);

    toast({
      title: "Time slot added",
      description: `New time slot added for ${trainer.name}`,
    });
  };

  const removeTimeSlot = async (timeSlotId: string) => {
    // Check if time slot exists
    const timeSlot = gymTimeSlots.find(slot => slot.id === timeSlotId);
    if (!timeSlot) {
      toast({
        title: "Removing time slot failed",
        description: "Time slot not found",
        variant: "destructive",
      });
      throw new Error('Time slot not found');
    }

    // Check if time slot is booked
    if (timeSlot.isBooked) {
      // Find the booking for this time slot
      const booking = gymBookings.find(b => 
        b.timeSlotId === timeSlotId && 
        (b.status === 'confirmed' || b.status === 'pending')
      );
      
      if (booking) {
        toast({
          title: "Removing time slot failed",
          description: "This time slot is booked and cannot be removed",
          variant: "destructive",
        });
        throw new Error('Time slot is booked');
      }
    }

    // Remove time slot
    setGymTimeSlots(gymTimeSlots.filter(slot => slot.id !== timeSlotId));
    
    // Update trainer availability
    const updatedTrainers = gymTrainers.map(t => {
      if (t.id === timeSlot.trainerId) {
        return { 
          ...t, 
          availability: t.availability.filter(slot => slot.id !== timeSlotId) 
        };
      }
      return t;
    });
    setGymTrainers(updatedTrainers);

    toast({
      title: "Time slot removed",
      description: "The time slot has been removed successfully",
    });
  };

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
