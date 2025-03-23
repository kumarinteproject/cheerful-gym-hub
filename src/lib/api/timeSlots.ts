
import { supabase } from '@/lib/supabase';
import { TimeSlot } from '@/types';

// Fetch all time slots from Supabase
export const fetchTimeSlots = async (): Promise<TimeSlot[]> => {
  const { data, error } = await supabase
    .from('time_slots')
    .select('*');
    
  if (error) {
    console.error('Error fetching time slots:', error);
    throw new Error('Failed to fetch time slots');
  }
  
  // Transform database format to our app's format
  return data.map(slot => ({
    id: slot.id,
    trainerId: slot.trainer_id,
    day: slot.day,
    startTime: slot.start_time,
    endTime: slot.end_time,
    isBooked: slot.is_booked,
  }));
};

// Add a new time slot to Supabase
export const addTimeSlot = async (trainerId: string, day: string, startTime: string, endTime: string) => {
  // Check if trainer exists
  const { data: trainer, error: trainerError } = await supabase
    .from('users')
    .select('id')
    .eq('id', trainerId)
    .eq('role', 'trainer')
    .single();
    
  if (trainerError || !trainer) {
    throw new Error('Trainer not found');
  }
  
  // Check for time slot conflicts
  const { data: conflictingSlots, error: conflictError } = await supabase
    .from('time_slots')
    .select('*')
    .eq('trainer_id', trainerId)
    .eq('day', day)
    .or(`(start_time,end_time).overlaps.(${startTime},${endTime})`);
    
  if (conflictError) {
    console.error('Error checking time slot conflicts:', conflictError);
    throw new Error('Failed to check time slot conflicts');
  }
  
  if (conflictingSlots.length > 0) {
    throw new Error('This time slot conflicts with an existing one');
  }
  
  // Create the new time slot
  const { data, error } = await supabase
    .from('time_slots')
    .insert({
      trainer_id: trainerId,
      day,
      start_time: startTime,
      end_time: endTime,
      is_booked: false,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error creating time slot:', error);
    throw new Error('Failed to create time slot');
  }
  
  return data;
};

// Remove a time slot from Supabase
export const removeTimeSlot = async (timeSlotId: string) => {
  // Check if time slot exists and is not booked
  const { data: timeSlot, error: fetchError } = await supabase
    .from('time_slots')
    .select('*')
    .eq('id', timeSlotId)
    .single();
    
  if (fetchError) {
    throw new Error('Time slot not found');
  }
  
  if (timeSlot.is_booked) {
    // Check if there's an active booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('time_slot_id', timeSlotId)
      .in('status', ['confirmed', 'pending'])
      .single();
      
    if (!bookingError && booking) {
      throw new Error('This time slot is booked and cannot be removed');
    }
  }
  
  // Delete the time slot
  const { error: deleteError } = await supabase
    .from('time_slots')
    .delete()
    .eq('id', timeSlotId);
    
  if (deleteError) {
    console.error('Error deleting time slot:', deleteError);
    throw new Error('Failed to delete time slot');
  }
};
