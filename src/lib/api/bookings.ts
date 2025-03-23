
import { supabase } from '@/lib/supabase';
import { Booking } from '@/types';

// Fetch all bookings from Supabase
export const fetchBookings = async (): Promise<Booking[]> => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*');
    
  if (error) {
    console.error('Error fetching bookings:', error);
    throw new Error('Failed to fetch bookings');
  }
  
  // Transform database format to our app's format
  return data.map(booking => ({
    id: booking.id,
    studentId: booking.student_id,
    trainerId: booking.trainer_id,
    timeSlotId: booking.time_slot_id,
    date: booking.date,
    status: booking.status,
    paymentStatus: booking.payment_status,
  }));
};

// Book a time slot in Supabase
export const bookTimeSlot = async (studentId: string, trainerId: string, timeSlotId: string, date: string) => {
  // Verify the time slot is available
  const { data: timeSlot, error: timeSlotError } = await supabase
    .from('time_slots')
    .select('*')
    .eq('id', timeSlotId)
    .eq('is_booked', false)
    .single();
    
  if (timeSlotError || !timeSlot) {
    throw new Error('This time slot is not available');
  }
  
  // Verify the student exists
  const { error: studentError } = await supabase
    .from('users')
    .select('id')
    .eq('id', studentId)
    .eq('role', 'student')
    .single();
    
  if (studentError) {
    throw new Error('Student not found');
  }
  
  // Verify the trainer exists
  const { error: trainerError } = await supabase
    .from('users')
    .select('id')
    .eq('id', trainerId)
    .eq('role', 'trainer')
    .single();
    
  if (trainerError) {
    throw new Error('Trainer not found');
  }
  
  // Start a transaction to ensure data consistency
  const { data, error } = await supabase.rpc('book_time_slot', {
    p_student_id: studentId,
    p_trainer_id: trainerId,
    p_time_slot_id: timeSlotId,
    p_date: date
  });
  
  if (error) {
    console.error('Error booking time slot:', error);
    throw new Error('Failed to book time slot: ' + error.message);
  }
  
  return data;
};

// Cancel a booking in Supabase
export const cancelBooking = async (bookingId: string) => {
  // Verify the booking exists
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single();
    
  if (bookingError || !booking) {
    throw new Error('Booking not found');
  }
  
  // Start a transaction to ensure data consistency
  const { error } = await supabase.rpc('cancel_booking', {
    p_booking_id: bookingId
  });
  
  if (error) {
    console.error('Error cancelling booking:', error);
    throw new Error('Failed to cancel booking: ' + error.message);
  }
};

// Mark a booking as completed in Supabase
export const completeBooking = async (bookingId: string) => {
  // Update the booking status
  const { error } = await supabase
    .from('bookings')
    .update({
      status: 'completed',
    })
    .eq('id', bookingId);
    
  if (error) {
    console.error('Error completing booking:', error);
    throw new Error('Failed to mark booking as completed');
  }
};
