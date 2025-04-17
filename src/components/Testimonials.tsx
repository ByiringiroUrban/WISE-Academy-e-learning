
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Testimonials = () => {
  return (
    <section className="w-full py-16">
      <div className="container px-4 md:px-6 mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
          What Other employers Are Saying?
        </h2>
        
        <div className="flex items-start gap-8">
          <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
            <img 
              src="/placeholder.svg" 
              alt="Henri Nyakarundi" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-lg">Henri Nyakarundi</h3>
            <p className="text-sm text-gray-600 mb-4">Founder of ARED GROUP, INC</p>
            
            <p className="text-gray-700 mb-6">
              "I was looking for talented students with technical skills to help me develop my mobile app. The platform connected me with exceptional students who delivered high-quality work. The process was smooth, and the results exceeded my expectations. I highly recommend this service to any business looking for affordable talent."
            </p>
            
            <div className="flex space-x-2">
              <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
