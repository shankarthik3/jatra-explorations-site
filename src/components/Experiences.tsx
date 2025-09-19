import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BookingModal from './BookingModal';
import handicraftsImage from '@/assets/handicrafts.jpg';
import homestaysImage from '@/assets/homestays.jpg';
import villageLifeImage from '@/assets/village-life.jpg';
import foodImage from '@/assets/food.jpg';

const Experiences = () => {
  const [bookingModal, setBookingModal] = useState<{
    isOpen: boolean;
    experience?: typeof experiences[0];
  }>({ isOpen: false });
  const experiences = [
    {
      title: 'Traditional Handicrafts',
      description: 'Learn from master artisans and create your own piece of Jharkhand heritage',
      image: handicraftsImage,
      features: ['Pottery Workshops', 'Textile Weaving', 'Wood Carving', 'Metal Crafts']
    },
    {
      title: 'Village Homestays',
      description: 'Stay with local families and experience authentic tribal hospitality',
      image: homestaysImage,
      features: ['Family Stays', 'Local Meals', 'Cultural Exchange', 'Guided Tours']
    },
    {
      title: 'Village Life',
      description: 'Participate in daily village activities and traditions',
      image: villageLifeImage,
      features: ['Farming Activities', 'Festival Celebrations', 'Storytelling', 'Nature Walks']
    },
    {
      title: 'Authentic Cuisine',
      description: 'Taste traditional recipes passed down through generations',
      image: foodImage,
      features: ['Cooking Classes', 'Local Ingredients', 'Traditional Methods', 'Recipe Exchange']
    }
  ];

  return (
    <section id="experiences" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Authentic 
            <span className="text-primary"> Experiences</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Immerse yourself in the rich cultural tapestry of Jharkhand through 
            carefully curated experiences that connect you with local traditions
          </p>
        </div>

        {/* Experience Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {experiences.map((experience, index) => (
            <Card 
              key={experience.title} 
              className="group overflow-hidden border-0 shadow-card hover-lift bg-card animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={experience.image}
                  alt={experience.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {experience.title}
                </h3>
                
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {experience.description}
                </p>
                
                 <ul className="space-y-2 mb-4">
                   {experience.features.map((feature, idx) => (
                     <li key={idx} className="flex items-center text-sm text-muted-foreground">
                       <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3"></div>
                       {feature}
                     </li>
                   ))}
                 </ul>
                 <Button 
                   onClick={() => setBookingModal({ 
                     isOpen: true, 
                     experience 
                   })}
                   className="w-full"
                 >
                   Book Experience
                 </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <BookingModal
        isOpen={bookingModal.isOpen}
        onClose={() => setBookingModal({ isOpen: false })}
        experienceId={bookingModal.experience?.title}
        title={bookingModal.experience?.title || ''}
        price={2500}
        type="experience"
      />
    </section>
  );
};

export default Experiences;