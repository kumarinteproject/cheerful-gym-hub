
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useGym } from '@/contexts/GymContext';
import { Layout } from '@/components/layout/Layout';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PageTransition } from '@/components/ui/PageTransition';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { CheckCheck, Calendar, Clock, X, Loader2 } from 'lucide-react';

interface PaymentModalProps {
  bookingId: string;
  onClose: () => void;
  onPaymentComplete: (success: boolean) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ bookingId, onClose, onPaymentComplete }) => {
  const { processPayment } = useGym();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      const formattedValue = value
        .replace(/\s/g, '')
        .replace(/(\d{4})/g, '$1 ')
        .trim()
        .slice(0, 19);
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
      return;
    }
    
    // Format expiry date with /
    if (name === 'expiryDate') {
      const sanitizedValue = value.replace(/[^0-9]/g, '');
      let formattedValue = sanitizedValue;
      if (sanitizedValue.length > 2) {
        formattedValue = `${sanitizedValue.slice(0, 2)}/${sanitizedValue.slice(2, 4)}`;
      }
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      const result = await processPayment(bookingId, formData);
      setTimeout(() => {
        onPaymentComplete(result);
        setIsProcessing(false);
      }, 1500);
    } catch (error) {
      console.error('Payment error:', error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-lg w-full max-w-md relative"
      >
        <button 
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={18} />
        </button>
        
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">Payment Details</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Complete the payment to confirm your booking
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="cardNumber" className="text-sm font-medium">Card Number</label>
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleInputChange}
                placeholder="1234 5678 9012 3456"
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                required
                maxLength={19}
                disabled={isProcessing}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="cardholderName" className="text-sm font-medium">Cardholder Name</label>
              <input
                type="text"
                id="cardholderName"
                name="cardholderName"
                value={formData.cardholderName}
                onChange={handleInputChange}
                placeholder="John Doe"
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                required
                disabled={isProcessing}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="expiryDate" className="text-sm font-medium">Expiry Date</label>
                <input
                  type="text"
                  id="expiryDate"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  placeholder="MM/YY"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                  maxLength={5}
                  disabled={isProcessing}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="cvv" className="text-sm font-medium">CVV</label>
                <input
                  type="text"
                  id="cvv"
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleInputChange}
                  placeholder="123"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                  maxLength={4}
                  disabled={isProcessing}
                />
              </div>
            </div>
            
            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Complete Payment'
                )}
              </Button>
              
              <p className="text-xs text-center text-muted-foreground mt-4">
                This is a demo payment form. No actual payment will be processed.
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const BookSession = () => {
  const { user } = useAuth();
  const { trainers, timeSlots, bookTimeSlot } = useGym();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedTrainer, setSelectedTrainer] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Get the trainerId from URL query params if available
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const trainerId = params.get('trainer');
    if (trainerId) {
      setSelectedTrainer(trainerId);
    }
  }, [location]);

  // Map weekday number to day name
  useEffect(() => {
    const date = new Date(selectedDate);
    const weekday = date.getDay();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    setSelectedDay(days[weekday]);
  }, [selectedDate]);

  // Get available time slots for the selected trainer and day
  const availableTimeSlots = timeSlots.filter(
    slot => 
      slot.trainerId === selectedTrainer && 
      slot.day === selectedDay && 
      !slot.isBooked
  );

  const handleBookSession = async () => {
    if (!user || !selectedTrainer || !selectedTimeSlot || !selectedDate) {
      toast({
        title: "Booking failed",
        description: "Please select a trainer, date, and time slot",
        variant: "destructive",
      });
      return;
    }
    
    setIsBooking(true);
    
    try {
      await bookTimeSlot(user.id, selectedTrainer, selectedTimeSlot, selectedDate);
      
      // Get the last booking (which should be the one just created)
      const newBookingId = `booking-${Date.now()}`;
      setBookingId(newBookingId);
      setShowPaymentModal(true);
    } catch (error) {
      console.error('Booking error:', error);
      // Error is handled in the context with toast
    } finally {
      setIsBooking(false);
    }
  };

  const handlePaymentComplete = (success: boolean) => {
    setShowPaymentModal(false);
    if (success) {
      toast({
        title: "Booking confirmed",
        description: "Your session has been booked successfully",
      });
      navigate('/student/sessions');
    }
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <Layout>
      <PageTransition>
        <SectionHeading
          title="Book a Training Session"
          description="Select a trainer, date and time for your session"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-xl border border-border p-6 shadow-sm lg:col-span-2"
          >
            <h3 className="text-lg font-semibold mb-4">Session Details</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Trainer</label>
                <Select 
                  value={selectedTrainer} 
                  onValueChange={setSelectedTrainer}
                  disabled={isBooking}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a trainer" />
                  </SelectTrigger>
                  <SelectContent>
                    {trainers.map(trainer => (
                      <SelectItem key={trainer.id} value={trainer.id}>
                        {trainer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  disabled={!selectedTrainer || isBooking}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Available Time Slots</label>
                
                {selectedTrainer ? (
                  availableTimeSlots.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {availableTimeSlots.map(slot => (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedTimeSlot(slot.id)}
                          className={`p-3 border rounded-lg text-sm text-center transition-colors ${
                            selectedTimeSlot === slot.id
                              ? 'bg-primary text-white border-primary'
                              : 'border-border hover:border-primary/50'
                          }`}
                          disabled={isBooking}
                        >
                          {slot.startTime} - {slot.endTime}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 border border-border rounded-lg text-center text-muted-foreground text-sm">
                      No available time slots for the selected trainer and day.
                    </div>
                  )
                ) : (
                  <div className="p-4 border border-border rounded-lg text-center text-muted-foreground text-sm">
                    Please select a trainer first.
                  </div>
                )}
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={handleBookSession} 
                  disabled={!selectedTrainer || !selectedTimeSlot || isBooking}
                  className="w-full"
                >
                  {isBooking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Calendar className="mr-2 h-4 w-4" />
                      Book Session
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Weekly Schedule */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white rounded-xl border border-border p-6 shadow-sm lg:col-span-1"
          >
            <h3 className="text-lg font-semibold mb-4">Weekly Schedule</h3>
            
            {selectedTrainer ? (
              <Tabs defaultValue="Monday">
                <TabsList className="w-full">
                  {daysOfWeek.map(day => (
                    <TabsTrigger 
                      key={day} 
                      value={day}
                      className="flex-1"
                    >
                      {day.substring(0, 3)}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {daysOfWeek.map(day => (
                  <TabsContent key={day} value={day} className="mt-4 space-y-2">
                    {timeSlots
                      .filter(slot => slot.trainerId === selectedTrainer && slot.day === day)
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map(slot => (
                        <div 
                          key={slot.id}
                          className={`p-2 border rounded-lg flex items-center justify-between ${
                            slot.isBooked 
                              ? 'bg-muted/20 text-muted-foreground border-muted' 
                              : 'border-border'
                          }`}
                        >
                          <div className="flex items-center">
                            <Clock size={14} className="mr-2" />
                            <span>{slot.startTime} - {slot.endTime}</span>
                          </div>
                          <span 
                            className={`text-xs px-2 py-1 rounded-full ${
                              slot.isBooked 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {slot.isBooked ? 'Booked' : 'Available'}
                          </span>
                        </div>
                      ))}
                      
                    {timeSlots.filter(slot => slot.trainerId === selectedTrainer && slot.day === day).length === 0 && (
                      <div className="p-4 text-center text-muted-foreground text-sm border border-border rounded-lg">
                        No slots available for this day
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                Select a trainer to view their weekly schedule
              </div>
            )}
            
            {selectedTrainer && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center">
                  <UserAvatar 
                    user={trainers.find(t => t.id === selectedTrainer) || {}} 
                    size="sm" 
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium">
                      {trainers.find(t => t.id === selectedTrainer)?.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {trainers.find(t => t.id === selectedTrainer)?.expertise.join(', ')}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
        
        {showPaymentModal && bookingId && (
          <PaymentModal
            bookingId={bookingId}
            onClose={() => setShowPaymentModal(false)}
            onPaymentComplete={handlePaymentComplete}
          />
        )}
      </PageTransition>
    </Layout>
  );
};

export default BookSession;
