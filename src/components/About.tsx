import React from 'react';
import aboutImage from '@/assets/about-image.jpg';

const About = () => {
  return (
    <section id="about" className="py-20 lg:py-32 gradient-subtle">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text Content */}
          <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              Experience the 
              <span className="text-primary"> Real Jharkhand</span>
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Jatra connects you with the authentic heart of Jharkhand, where every village 
              tells a story, every tradition carries centuries of wisdom, and every encounter 
              becomes a cherished memory. 
            </p>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              From the skilled hands of tribal artisans creating timeless handicrafts to 
              the warm hospitality of village homestays, we offer you a journey that goes 
              beyond tourism - it's a cultural immersion that enriches both travelers and communities.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
              <div className="text-center p-6 bg-card rounded-lg shadow-card hover-lift">
                <div className="text-3xl font-bold text-primary mb-2">500+</div>
                <div className="text-muted-foreground">Village Partners</div>
              </div>
              <div className="text-center p-6 bg-card rounded-lg shadow-card hover-lift">
                <div className="text-3xl font-bold text-primary mb-2">100%</div>
                <div className="text-muted-foreground">Local Ownership</div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative animate-fade-in">
            <div className="relative overflow-hidden rounded-2xl shadow-hover">
              <img
                src={aboutImage}
                alt="Traditional village life in Jharkhand"
                className="w-full h-[500px] object-cover hover-scale"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            
            {/* Floating Card */}
            <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-xl shadow-hover border border-border">
              <p className="text-sm text-muted-foreground mb-2">Since 2020</p>
              <p className="font-semibold text-foreground">Preserving Culture,</p>
              <p className="font-semibold text-primary">Empowering Communities</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;