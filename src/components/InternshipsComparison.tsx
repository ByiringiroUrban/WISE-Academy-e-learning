
import React from 'react';
import { Button } from "@/components/ui/button";
import { Check } from 'lucide-react';

const InternshipsComparison = () => {
  return (
    <section className="w-full py-16 bg-gray-100">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold text-primary mb-6">Modernize internships</h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm">High-quality work delivered to your projects</p>
              </div>
              
              <div className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm">Flexible: choose students, technology & project scope</p>
              </div>
              
              <div className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm">Expert-level mentoring ensures high-quality results</p>
              </div>
              
              <div className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm">Affordable & tax-efficient</p>
              </div>
            </div>
            
            <div className="mt-6">
              <Button className="bg-primary text-white hover:bg-primary/90">
                Propose Project
              </Button>
            </div>
          </div>
          
          <div className="flex-1 bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Traditional internships</h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <Check className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600">Significant mentor time required</p>
              </div>
              
              <div className="flex items-start">
                <Check className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600">Limited availability of talent</p>
              </div>
              
              <div className="flex items-start">
                <Check className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600">Administrative overhead costs for HR</p>
              </div>
              
              <div className="flex items-start">
                <Check className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600">Uncertain quality and results</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InternshipsComparison;
