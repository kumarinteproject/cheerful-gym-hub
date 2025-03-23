
export type UserRole = 'student' | 'trainer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileImage?: string;
}

export interface Student extends User {
  role: 'student';
  membershipType?: string;
  bookings: Booking[];
}

export interface Trainer extends User {
  role: 'trainer';
  expertise: string[];
  bio: string;
  availability: TimeSlot[];
  bookings: Booking[];
}

export interface Admin extends User {
  role: 'admin';
}

export interface TimeSlot {
  id: string;
  trainerId: string;
  day: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export interface Booking {
  id: string;
  studentId: string;
  trainerId: string;
  timeSlotId: string;
  date: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'failed';
}

export interface PaymentInfo {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv: string;
}
