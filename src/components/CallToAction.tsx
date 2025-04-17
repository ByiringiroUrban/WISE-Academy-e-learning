
import React from 'react';
import { Button } from "@/components/ui/button";

const CallToAction = () => {
  return (
    <section className="w-full py-12 bg-primary text-white">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-2">
              Elevate your business with the expertise of student talent.
            </h2>
          </div>
          <Button className="mt-4 md:mt-0 bg-white text-primary hover:bg-gray-100">
            Submit your project
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
