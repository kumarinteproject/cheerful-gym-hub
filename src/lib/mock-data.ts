
import { User, Student, Trainer, Admin, TimeSlot, Booking } from '@/types';

// Mock Users
export const students: Student[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    role: 'student',
    profileImage: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format',
    membershipType: 'Premium',
    bookings: []
  },
  {
    id: '2',
    name: 'Jamie Smith',
    email: 'jamie@example.com',
    role: 'student',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format',
    membershipType: 'Standard',
    bookings: []
  },
  {
    id: '3',
    name: 'Morgan Williams',
    email: 'morgan@example.com',
    role: 'student',
    profileImage: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=200&auto=format',
    membershipType: 'Premium',
    bookings: []
  },
  {
    id: '4',
    name: 'Taylor Lee',
    email: 'taylor@example.com',
    role: 'student',
    profileImage: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200&auto=format',
    membershipType: 'Standard',
    bookings: []
  },
  {
    id: '5',
    name: 'Jordan Chang',
    email: 'jordan@example.com',
    role: 'student',
    profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format',
    membershipType: 'Basic',
    bookings: []
  }
];

export const trainers: Trainer[] = [
  {
    id: '101',
    name: 'Casey Martinez',
    email: 'casey@example.com',
    role: 'trainer',
    profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format',
    expertise: ['Weightlifting', 'Nutrition', 'HIIT'],
    bio: 'Professional trainer with 8+ years of experience, specializing in strength training and nutritional guidance.',
    availability: [],
    bookings: []
  },
  {
    id: '102',
    name: 'Riley Thompson',
    email: 'riley@example.com',
    role: 'trainer',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format',
    expertise: ['Yoga', 'Pilates', 'Meditation'],
    bio: 'Certified yoga instructor and wellness coach dedicated to helping clients achieve mind-body balance.',
    availability: [],
    bookings: []
  },
  {
    id: '103',
    name: 'Avery Wilson',
    email: 'avery@example.com',
    role: 'trainer',
    profileImage: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=200&auto=format',
    expertise: ['Cardio', 'Boxing', 'Circuit Training'],
    bio: 'Former professional athlete turned personal trainer, focused on developing peak performance and endurance.',
    availability: [],
    bookings: []
  }
];

export const admins: Admin[] = [
  {
    id: '201',
    name: 'Admin Account',
    email: 'admin@example.com',
    role: 'admin',
    profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format',
  }
];

// Generate time slots for each trainer
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const timeRanges = [
  { start: '08:00', end: '09:00' },
  { start: '09:00', end: '10:00' },
  { start: '10:00', end: '11:00' },
  { start: '11:00', end: '12:00' },
  { start: '13:00', end: '14:00' },
  { start: '14:00', end: '15:00' },
  { start: '15:00', end: '16:00' },
  { start: '16:00', end: '17:00' }
];

export const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];

  trainers.forEach(trainer => {
    days.forEach(day => {
      timeRanges.forEach((time, index) => {
        // Skip some slots randomly to make the schedule look more realistic
        if (Math.random() > 0.3) {
          const slot: TimeSlot = {
            id: `${trainer.id}-${day}-${index}`,
            trainerId: trainer.id,
            day,
            startTime: time.start,
            endTime: time.end,
            isBooked: false
          };
          slots.push(slot);
          trainer.availability.push(slot);
        }
      });
    });
  });

  return slots;
};

export const timeSlots = generateTimeSlots();

// Generate some sample bookings
export const generateSampleBookings = (): Booking[] => {
  const bookings: Booking[] = [];
  const dates = [
    '2023-06-10',
    '2023-06-15',
    '2023-06-20',
    '2023-06-25',
    '2023-06-30'
  ];

  // Create some past bookings
  for (let i = 0; i < 5; i++) {
    const randomStudentIndex = Math.floor(Math.random() * students.length);
    const randomTrainerIndex = Math.floor(Math.random() * trainers.length);
    const randomTimeSlotIndex = Math.floor(Math.random() * trainers[randomTrainerIndex].availability.length);
    const randomDateIndex = Math.floor(Math.random() * dates.length);
    
    if (!trainers[randomTrainerIndex].availability[randomTimeSlotIndex]) continue;
    
    const timeSlot = trainers[randomTrainerIndex].availability[randomTimeSlotIndex];
    timeSlot.isBooked = true;
    
    const booking: Booking = {
      id: `booking-${i + 1}`,
      studentId: students[randomStudentIndex].id,
      trainerId: trainers[randomTrainerIndex].id,
      timeSlotId: timeSlot.id,
      date: dates[randomDateIndex],
      status: Math.random() > 0.5 ? 'completed' : 'confirmed',
      paymentStatus: 'paid'
    };
    
    bookings.push(booking);
    students[randomStudentIndex].bookings.push(booking);
    trainers[randomTrainerIndex].bookings.push(booking);
  }
  
  return bookings;
};

export const bookings = generateSampleBookings();

// Combine all users for authentication
export const allUsers: User[] = [
  ...students,
  ...trainers,
  ...admins
];
