
import React from 'react';
import { Button } from "@/components/ui/button";

const projectCard = (category: string, title: string, description: string, index: number) => (
  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
    <div className="p-2 bg-gray-100">
      <span className="inline-block px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded">
        {category}
      </span>
    </div>
    <div className="h-40 bg-gray-200">
      <img 
        src="/placeholder.svg" 
        alt={title} 
        className="w-full h-full object-cover"
      />
    </div>
    <div className="p-4">
      <h3 className="text-sm font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-xs text-gray-600 mb-4">{description}</p>
      <div className="text-center">
        <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-white w-full">
          View Case Study
        </Button>
      </div>
    </div>
  </div>
);

const OurWork = () => {
  return (
    <section className="w-full py-16">
      <div className="container px-4 md:px-6 mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
          Our Work
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {projectCard(
            "Website Development",
            "E-commerce platform for handcrafted jewelry with integrated payment processing",
            "We developed a modern e-commerce site for a jewelry artist that increased sales by 45% within the first 3 months.",
            1
          )}
          
          {projectCard(
            "Mobile App Development",
            "Fitness tracking mobile application with social features and personalized plans",
            "Our student team created a fitness app that quickly gained 10,000+ downloads with minimal marketing budget.",
            2
          )}
          
          {projectCard(
            "Digital Marketing",
            "Comprehensive digital marketing strategy for local restaurant chain expansion",
            "The campaign resulted in 67% increase in foot traffic and 38% growth in online orders for the client.",
            3
          )}
        </div>
        
        <div className="flex justify-center space-x-2">
          <button className="w-2 h-2 rounded-full bg-gray-300"></button>
          <button className="w-2 h-2 rounded-full bg-primary"></button>
          <button className="w-2 h-2 rounded-full bg-gray-300"></button>
        </div>
      </div>
    </section>
  );
};

export default OurWork;
