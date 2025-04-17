
import React from 'react';
import { Button } from "@/components/ui/button";

const HowItWorks = () => {
  return (
    <section className="w-full py-16 bg-white">
      <div className="container px-4 md:px-6 mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
          How It works
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="relative pl-10 numbered-step" data-step="1">
            <h3 className="text-lg font-medium mb-2">Tell Us Your Needs</h3>
            <p className="text-gray-600 text-sm">Submit your project</p>
            <div className="mt-4 bg-gray-100 rounded-lg overflow-hidden">
              <img src="/placeholder.svg" alt="Project submission form" className="w-full h-44 object-cover" />
            </div>
          </div>
          
          <div className="relative pl-10 numbered-step" data-step="2">
            <h3 className="text-lg font-medium mb-2">We Match You With Talent</h3>
            <p className="text-gray-600 text-sm">You choose the best candidate</p>
            <div className="mt-4 bg-gray-100 rounded-lg overflow-hidden">
              <img src="/placeholder.svg" alt="Matching with talents" className="w-full h-44 object-cover" />
            </div>
          </div>
          
          <div className="relative pl-10 numbered-step" data-step="3">
            <h3 className="text-lg font-medium mb-2">See Your Project Succeed</h3>
            <p className="text-gray-600 text-sm">We manage the work delivery</p>
            <div className="mt-4 bg-gray-100 rounded-lg overflow-hidden">
              <img src="/placeholder.svg" alt="Project success" className="w-full h-44 object-cover" />
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <Button className="bg-primary text-white hover:bg-primary/90">
            Propose Project
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
