
import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PageTransition } from '@/components/ui/PageTransition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Save, Bell, Lock, Building, CreditCard, Loader2 } from 'lucide-react';

const Settings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [generalSettings, setGeneralSettings] = useState({
    gymName: 'FitNest Gym',
    email: 'admin@fitnest.com',
    phone: '+1 (555) 123-4567',
    address: '123 Fitness Street, Exercise City, SP 12345',
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    bookingConfirmations: true,
    bookingReminders: true,
    paymentNotifications: true,
  });
  
  const [paymentSettings, setPaymentSettings] = useState({
    standardSessionRate: 45,
    premiumSessionRate: 65,
    groupSessionRate: 25,
    discountPercentage: 10,
  });

  const handleGeneralSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGeneralSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationSettingsChange = (setting: string, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [setting]: value }));
  };

  const handlePaymentSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentSettings(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSaveSettings = async () => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error saving settings",
        description: "An error occurred while saving your settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <PageTransition>
        <SectionHeading
          title="Admin Settings"
          description="Configure your gym management system"
        />

        <div className="bg-white rounded-xl border border-border shadow-sm">
          <Tabs defaultValue="general" className="w-full">
            <div className="px-6 pt-6">
              <TabsList className="w-full max-w-md grid grid-cols-3">
                <TabsTrigger value="general" className="flex-1">
                  <Building className="mr-2 h-4 w-4" />
                  General
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex-1">
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="payments" className="flex-1">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Payments
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="general" className="p-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label htmlFor="gymName" className="text-sm font-medium">Gym Name</label>
                  <Input
                    id="gymName"
                    name="gymName"
                    value={generalSettings.gymName}
                    onChange={handleGeneralSettingsChange}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Contact Email</label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={generalSettings.email}
                    onChange={handleGeneralSettingsChange}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">Contact Phone</label>
                  <Input
                    id="phone"
                    name="phone"
                    value={generalSettings.phone}
                    onChange={handleGeneralSettingsChange}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="address" className="text-sm font-medium">Gym Address</label>
                  <Input
                    id="address"
                    name="address"
                    value={generalSettings.address}
                    onChange={handleGeneralSettingsChange}
                    disabled={isLoading}
                  />
                </div>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="notifications" className="p-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Email Notifications</h3>
                    <p className="text-xs text-muted-foreground">
                      Send email notifications to users
                    </p>
                  </div>
                  <Switch 
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => 
                      handleNotificationSettingsChange('emailNotifications', checked)
                    }
                    disabled={isLoading}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Booking Confirmations</h3>
                    <p className="text-xs text-muted-foreground">
                      Send confirmation emails for new bookings
                    </p>
                  </div>
                  <Switch 
                    checked={notificationSettings.bookingConfirmations}
                    onCheckedChange={(checked) => 
                      handleNotificationSettingsChange('bookingConfirmations', checked)
                    }
                    disabled={isLoading}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Booking Reminders</h3>
                    <p className="text-xs text-muted-foreground">
                      Send reminder emails before scheduled sessions
                    </p>
                  </div>
                  <Switch 
                    checked={notificationSettings.bookingReminders}
                    onCheckedChange={(checked) => 
                      handleNotificationSettingsChange('bookingReminders', checked)
                    }
                    disabled={isLoading}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Payment Notifications</h3>
                    <p className="text-xs text-muted-foreground">
                      Send emails for payment confirmations and receipts
                    </p>
                  </div>
                  <Switch 
                    checked={notificationSettings.paymentNotifications}
                    onCheckedChange={(checked) => 
                      handleNotificationSettingsChange('paymentNotifications', checked)
                    }
                    disabled={isLoading}
                  />
                </div>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="payments" className="p-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label htmlFor="standardSessionRate" className="text-sm font-medium">Standard Session Rate ($)</label>
                  <Input
                    id="standardSessionRate"
                    name="standardSessionRate"
                    type="number"
                    min="0"
                    value={paymentSettings.standardSessionRate}
                    onChange={handlePaymentSettingsChange}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="premiumSessionRate" className="text-sm font-medium">Premium Session Rate ($)</label>
                  <Input
                    id="premiumSessionRate"
                    name="premiumSessionRate"
                    type="number"
                    min="0"
                    value={paymentSettings.premiumSessionRate}
                    onChange={handlePaymentSettingsChange}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="groupSessionRate" className="text-sm font-medium">Group Session Rate ($)</label>
                  <Input
                    id="groupSessionRate"
                    name="groupSessionRate"
                    type="number"
                    min="0"
                    value={paymentSettings.groupSessionRate}
                    onChange={handlePaymentSettingsChange}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="discountPercentage" className="text-sm font-medium">Discount Percentage (%)</label>
                  <Input
                    id="discountPercentage"
                    name="discountPercentage"
                    type="number"
                    min="0"
                    max="100"
                    value={paymentSettings.discountPercentage}
                    onChange={handlePaymentSettingsChange}
                    disabled={isLoading}
                  />
                </div>
              </motion.div>
            </TabsContent>
            
            <div className="px-6 py-4 border-t border-border flex justify-end">
              <Button 
                onClick={handleSaveSettings}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </Tabs>
        </div>
      </PageTransition>
    </Layout>
  );
};

export default Settings;
