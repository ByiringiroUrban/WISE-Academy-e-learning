
import React from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import UsedBySection from '@/components/UsedBySection';
import HowItWorks from '@/components/HowItWorks';
import OurWork from '@/components/OurWork';
import InternshipsComparison from '@/components/InternshipsComparison';
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';
import CallToAction from '@/components/CallToAction';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <UsedBySection />
        <HowItWorks />
        <OurWork />
        <InternshipsComparison />
        <Testimonials />
        <FAQ />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
