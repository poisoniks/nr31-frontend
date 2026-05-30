import React from 'react';

export const PageLoader: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col p-8 space-y-6 animate-pulse w-full max-w-6xl mx-auto">
      <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-4/6"></div>
      </div>
      <div className="pt-8 space-y-4">
        <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
      </div>
    </div>
  );
};

export default PageLoader;
