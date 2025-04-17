
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem = ({ question, answer }: FAQItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full justify-between items-center text-left"
      >
        <h3 className="text-lg font-medium text-gray-900">{question}</h3>
        <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      <div className={`accordion-content ${isOpen ? 'open' : ''} pt-2`}>
        <p className="text-gray-600">{answer}</p>
      </div>
    </div>
  );
};

const FAQ = () => {
  return (
    <section className="w-full py-16">
      <div className="container px-4 md:px-6 mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
          Frequent Asked Questions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <FAQItem 
              question="What is Posinnove?" 
              answer="Posinnove is a platform that connects businesses with talented university students who can work on your projects under expert supervision. We help businesses access fresh skills while providing students with real-world experience."
            />
            
            <FAQItem 
              question="What type of projects?" 
              answer="We support a wide range of projects including web development, mobile app creation, digital marketing campaigns, graphic design, data analysis, and business research. If you have a specific need, contact us to discuss how we can help."
            />
            
            <FAQItem 
              question="How much does it cost?" 
              answer="Our pricing is project-based and depends on the scope, timeline, and complexity. We offer cost-effective solutions compared to traditional agencies or freelancers. Contact us for a customized quote."
            />
            
            <FAQItem 
              question="What is the process?" 
              answer="Submit your project details, we match you with qualified students, you select your preferred candidates, and we manage the entire project delivery process while providing regular updates and ensuring quality control."
            />
            
            <FAQItem 
              question="How long does it take?" 
              answer="Project timelines vary based on complexity and scope. Small projects can be completed in 2-3 weeks, while larger initiatives may take several months. We'll provide a detailed timeline during our initial consultation."
            />
          </div>
          
          <div className="hidden md:block">
            <img 
              src="/placeholder.svg" 
              alt="Students working" 
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
