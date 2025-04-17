
import React from 'react';
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="w-full py-12 md:py-16">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-sm text-gray-500 mb-3">We're here to help you scale</p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-gray-900 mb-4">
              Achieve success by leveraging students' expertise to elevate your projects.
            </h1>
            <p className="text-md text-gray-600 mb-6 max-w-md">
              Students get real-world experience, and businesses receive fresh ideas and affordable talent. It's a win-win for everyone involved.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button className="bg-primary text-white hover:bg-primary/90">
                Propose Project
              </Button>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                See Students
              </Button>
            </div>
          </div>
          <div className="relative">
            <img 
              src="/lovable-uploads/93c91405-1656-429d-bd6e-cfb7df66b8ef.png" 
              alt="Student working on laptop" 
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
