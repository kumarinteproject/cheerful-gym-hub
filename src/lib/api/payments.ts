
import { supabase } from '@/lib/supabase';
import { PaymentInfo } from '@/types';

// Process a payment in Supabase
export const processPayment = async (bookingId: string, paymentInfo: PaymentInfo): Promise<boolean> => {
  // Verify the booking exists
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single();
    
  if (bookingError || !booking) {
    throw new Error('Booking not found');
  }
  
  // In a real app, we would process the payment through a payment gateway
  // For demo purposes, we'll simulate a payment with a 90% success rate
  const paymentSuccess = Math.random() < 0.9;
  
  // Update the booking payment status and booking status
  const { error } = await supabase
    .from('bookings')
    .update({
      payment_status: paymentSuccess ? 'paid' : 'failed',
      status: paymentSuccess ? 'confirmed' : 'pending',
    })
    .eq('id', bookingId);
    
  if (error) {
    console.error('Error updating payment status:', error);
    throw new Error('Failed to process payment');
  }
  
  return paymentSuccess;
};
