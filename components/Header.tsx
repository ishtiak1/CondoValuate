import React from 'react';
import { TrendingUp } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">CondoValuate <span className="text-blue-600">GTA</span></h1>
            <p className="text-xs text-gray-500 font-medium">Assignment Sale Calculator</p>
          </div>
        </div>
        <div className="hidden md:flex items-center space-x-6">
          <span className="text-sm font-medium text-gray-600">Algorithmic Estimate</span>
        </div>
      </div>
    </header>
  );
};

export default Header;