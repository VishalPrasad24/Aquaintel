
import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  children?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, children }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</p>
      <div className="mt-1 flex items-baseline space-x-2">
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        {children}
      </div>
    </div>
  );
};

export default StatCard;
