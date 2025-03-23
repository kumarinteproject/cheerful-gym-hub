
import { supabase } from '@/lib/supabase';
import { Student, Trainer, Admin } from '@/types';

// Fetch all students from Supabase
export const fetchStudents = async (): Promise<Student[]> => {
  const { data, error } = await supabase
    .from('users')
    .select(`
      id,
      name,
      email,
      role,
      profile_image,
      membership_type,
      bookings:bookings(*)
    `)
    .eq('role', 'student');
    
  if (error) {
    console.error('Error fetching students:', error);
    throw new Error('Failed to fetch students');
  }
  
  // Transform database format to our app's format
  return data.map(student => ({
    id: student.id,
    name: student.name,
    email: student.email,
    role: 'student' as const,
    profileImage: student.profile_image || undefined,
    membershipType: student.membership_type || undefined,
    bookings: student.bookings || [],
  }));
};

// Fetch all trainers from Supabase
export const fetchTrainers = async (): Promise<Trainer[]> => {
  // First get trainer user data
  const { data: trainersData, error: trainersError } = await supabase
    .from('users')
    .select(`
      id,
      name,
      email,
      role,
      profile_image,
      expertise,
      bio
    `)
    .eq('role', 'trainer');
    
  if (trainersError) {
    console.error('Error fetching trainers:', trainersError);
    throw new Error('Failed to fetch trainers');
  }
  
  // Get bookings for all trainers
  const { data: bookingsData, error: bookingsError } = await supabase
    .from('bookings')
    .select('*')
    .in('trainer_id', trainersData.map(t => t.id));
    
  if (bookingsError) {
    console.error('Error fetching trainer bookings:', bookingsError);
    throw new Error('Failed to fetch trainer bookings');
  }
  
  // Get time slots for all trainers
  const { data: timeSlotsData, error: timeSlotsError } = await supabase
    .from('time_slots')
    .select('*')
    .in('trainer_id', trainersData.map(t => t.id));
    
  if (timeSlotsError) {
    console.error('Error fetching trainer time slots:', timeSlotsError);
    throw new Error('Failed to fetch trainer time slots');
  }
  
  // Transform database format to our app's format
  return trainersData.map(trainer => {
    const trainerBookings = bookingsData.filter(b => b.trainer_id === trainer.id);
    const trainerTimeSlots = timeSlotsData.filter(ts => ts.trainer_id === trainer.id);
    
    return {
      id: trainer.id,
      name: trainer.name,
      email: trainer.email,
      role: 'trainer' as const,
      profileImage: trainer.profile_image || undefined,
      expertise: trainer.expertise || [],
      bio: trainer.bio || '',
      bookings: trainerBookings.map(b => ({
        id: b.id,
        studentId: b.student_id,
        trainerId: b.trainer_id,
        timeSlotId: b.time_slot_id,
        date: b.date,
        status: b.status,
        paymentStatus: b.payment_status,
      })),
      availability: trainerTimeSlots.map(ts => ({
        id: ts.id,
        trainerId: ts.trainer_id,
        day: ts.day,
        startTime: ts.start_time,
        endTime: ts.end_time,
        isBooked: ts.is_booked,
      })),
    };
  });
};

// Fetch all admins from Supabase
export const fetchAdmins = async (): Promise<Admin[]> => {
  const { data, error } = await supabase
    .from('users')
    .select(`
      id,
      name,
      email,
      role,
      profile_image
    `)
    .eq('role', 'admin');
    
  if (error) {
    console.error('Error fetching admins:', error);
    throw new Error('Failed to fetch admins');
  }
  
  // Transform database format to our app's format
  return data.map(admin => ({
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: 'admin' as const,
    profileImage: admin.profile_image || undefined,
  }));
};

// Add a new trainer to Supabase
export const addTrainer = async (trainerData: Omit<Trainer, 'id' | 'bookings' | 'availability'>) => {
  // Check if trainer with this email already exists
  const { data: existingUser, error: checkError } = await supabase
    .from('users')
    .select('email')
    .eq('email', trainerData.email)
    .single();
    
  if (existingUser) {
    throw new Error('A trainer with this email already exists');
  }
  
  // Create a new user in Supabase Auth (in a real app, you'd want to send an invite email)
  // This is a simplified version - in production you'd use Supabase Auth's invite function
  const randomPassword = Math.random().toString(36).slice(-8);
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: trainerData.email,
    password: randomPassword,
  });
  
  if (authError) {
    console.error('Error creating trainer auth:', authError);
    throw new Error('Failed to create trainer authentication');
  }
  
  if (!authData.user) {
    throw new Error('Failed to create trainer account');
  }
  
  // Create trainer profile in the users table
  const { error: insertError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      name: trainerData.name,
      email: trainerData.email,
      role: 'trainer',
      profile_image: trainerData.profileImage,
      expertise: trainerData.expertise,
      bio: trainerData.bio,
      created_at: new Date().toISOString(),
    });
    
  if (insertError) {
    console.error('Error creating trainer profile:', insertError);
    throw new Error('Failed to create trainer profile');
  }
};

// Remove a trainer from Supabase
export const removeTrainer = async (trainerId: string) => {
  // Check if trainer has active bookings
  const { data: activeBookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('id')
    .eq('trainer_id', trainerId)
    .in('status', ['confirmed', 'pending']);
    
  if (bookingsError) {
    console.error('Error checking trainer bookings:', bookingsError);
    throw new Error('Failed to check trainer bookings');
  }
  
  if (activeBookings.length > 0) {
    throw new Error('This trainer has active bookings and cannot be removed');
  }
  
  // Delete trainer's time slots
  const { error: timeSlotError } = await supabase
    .from('time_slots')
    .delete()
    .eq('trainer_id', trainerId);
    
  if (timeSlotError) {
    console.error('Error deleting trainer time slots:', timeSlotError);
    throw new Error('Failed to delete trainer time slots');
  }
  
  // Delete trainer from users table
  const { error: deleteError } = await supabase
    .from('users')
    .delete()
    .eq('id', trainerId);
    
  if (deleteError) {
    console.error('Error deleting trainer:', deleteError);
    throw new Error('Failed to delete trainer');
  }
  
  // In a real app, you might also handle deleting the user from Supabase Auth
};

// Remove a student from Supabase
export const removeStudent = async (studentId: string) => {
  // Check if student has active bookings
  const { data: activeBookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('id')
    .eq('student_id', studentId)
    .in('status', ['confirmed', 'pending']);
    
  if (bookingsError) {
    console.error('Error checking student bookings:', bookingsError);
    throw new Error('Failed to check student bookings');
  }
  
  if (activeBookings.length > 0) {
    throw new Error('This student has active bookings and cannot be removed');
  }
  
  // Delete student from users table
  const { error: deleteError } = await supabase
    .from('users')
    .delete()
    .eq('id', studentId);
    
  if (deleteError) {
    console.error('Error deleting student:', deleteError);
    throw new Error('Failed to delete student');
  }
  
  // In a real app, you might also handle deleting the user from Supabase Auth
};
