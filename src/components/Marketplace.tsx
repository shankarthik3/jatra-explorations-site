import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import BookingModal from './BookingModal';
import handicraftsImage from '@/assets/handicrafts.jpg';
import ecoStaysImage from '@/assets/eco-stays.jpg';
import localToursImage from '@/assets/local-tours.jpg';

const Marketplace = () => {
  const [bookingModal, setBookingModal] = useState<{
    isOpen: boolean;
    category?: typeof categories[0];
  }>({ isOpen: false });
  const categories = [
    {
      title: 'Traditional Handicrafts',
      description: 'Authentic crafts made by local artisans',
      image: handicraftsImage,
      items: '200+ Products'
    },
    {
      title: 'Eco Stays',
      description: 'Sustainable accommodations in nature',
      image: ecoStaysImage,
      items: '50+ Properties'
    },
    {
      title: 'Local Tours',
      description: 'Guided experiences with community leaders',
      image: localToursImage,
      items: '30+ Experiences'
    }
  ];

  return (
    <section id="marketplace" className="py-20 lg:py-32 gradient-subtle">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Our 
            <span className="text-primary"> Marketplace</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Discover and support local communities through our curated marketplace 
            of authentic products and experiences
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {categories.map((category, index) => (
            <div
              key={category.title}
              className="relative group overflow-hidden rounded-2xl shadow-card hover-lift animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="text-sm text-white/80 mb-2">{category.items}</div>
                <h3 className="text-2xl font-bold mb-2">{category.title}</h3>
                <p className="text-white/90 text-sm leading-relaxed">{category.description}</p>
              </div>
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Button
                  variant="secondary"
                  className="bg-white/90 text-primary hover:bg-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                >
                  Explore Now
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-card rounded-2xl p-8 lg:p-12 shadow-card animate-fade-in">
          <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
            Ready to Start Your Journey?
          </h3>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of travelers who have discovered the authentic beauty 
            of Jharkhand through our community-driven platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8">
              Book Experience
            </Button>
            <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8">
              Browse Marketplace
            </Button>
          </div>
        </div>
      </div>
      
      <BookingModal
        isOpen={bookingModal.isOpen}
        onClose={() => setBookingModal({ isOpen: false })}
        marketplaceItemId={bookingModal.category?.title}
        title={bookingModal.category?.title || ''}
        price={bookingModal.category?.title.includes('Homestays') ? 1500 : 500}
        type="marketplace"
      />
    </section>
  );
};

export default Marketplace;