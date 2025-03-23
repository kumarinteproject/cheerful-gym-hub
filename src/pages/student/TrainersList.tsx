
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGym } from '@/contexts/GymContext';
import { Layout } from '@/components/layout/Layout';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PageTransition } from '@/components/ui/PageTransition';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Search, Calendar, ArrowRight } from 'lucide-react';

const TrainersList = () => {
  const { trainers } = useGym();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter trainers based on search query
  const filteredTrainers = trainers.filter(trainer => 
    trainer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trainer.expertise.some(exp => exp.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleBookWithTrainer = (trainerId: string) => {
    navigate(`/student/book?trainer=${trainerId}`);
  };

  return (
    <Layout>
      <PageTransition>
        <SectionHeading
          title="Find a Trainer"
          description="Browse our expert trainers and book a session"
        />

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search trainers by name or expertise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Trainers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrainers.length > 0 ? (
            filteredTrainers.map((trainer, index) => (
              <motion.div
                key={trainer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <UserAvatar user={trainer} size="md" />
                    <div className="ml-3">
                      <h3 className="font-semibold">{trainer.name}</h3>
                      <p className="text-xs text-muted-foreground">Trainer</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {trainer.bio}
                  </p>
                  
                  <div className="mb-4">
                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Expertise</h4>
                    <div className="flex flex-wrap gap-2">
                      {trainer.expertise.map((skill, idx) => (
                        <span 
                          key={idx}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      {trainer.availability.filter(a => !a.isBooked).length} available slots
                    </span>
                    <span>
                      {trainer.bookings.filter(b => b.status === 'completed').length} completed sessions
                    </span>
                  </div>
                  
                  <Button 
                    onClick={() => handleBookWithTrainer(trainer.id)}
                    className="w-full"
                  >
                    Book Session <ArrowRight size={16} className="ml-2" />
                  </Button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No trainers found matching your search.</p>
            </div>
          )}
        </div>
      </PageTransition>
    </Layout>
  );
};

export default TrainersList;
