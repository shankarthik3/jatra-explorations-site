import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Experiences from '@/components/Experiences';
import Marketplace from '@/components/Marketplace';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <About />
      <Experiences />
      <Marketplace />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
