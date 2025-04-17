
import React from 'react';

const UsedBySection = () => {
  return (
    <section className="w-full py-8 bg-secondary">
      <div className="container px-4 md:px-6 mx-auto">
        <h2 className="text-center text-lg font-medium text-gray-700 mb-6">
          Used by over 400 students from various colleges and universities.
        </h2>
        <div className="flex justify-center items-center space-x-12">
          <div className="w-14 h-14 bg-indigo-800 flex items-center justify-center rounded-md">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <div className="w-14 h-14 bg-white rounded-full border border-gray-200 flex items-center justify-center">
            <div className="text-blue-600 font-bold text-xl">TK</div>
          </div>
          <div className="w-14 h-14 bg-white rounded-md border border-gray-200 flex items-center justify-center">
            <div className="font-bold text-xl">alx</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UsedBySection;
