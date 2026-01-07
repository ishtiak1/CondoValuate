import React, { useState, useEffect } from 'react';
import { PropertyDetails, CITIES, YEARS } from '../types';
import { Building, MapPin, DollarSign, Calendar, Ruler, Bed } from 'lucide-react';

interface Props {
  onSubmit: (details: PropertyDetails) => void;
  isLoading: boolean;
  initialData?: PropertyDetails | null;
}

// Define a local form state that allows empty strings for numeric fields during input
type FormDetails = Omit<PropertyDetails, 'originalPrice' | 'squareFootage'> & {
  originalPrice: number | '';
  squareFootage: number | '';
};

const BEDROOM_OPTIONS = [
  "Studio",
  "1 Bed",
  "1 Bed + Den",
  "2 Bed",
  "2 Bed + Den",
  "3 Bed"
];

const ValuationForm: React.FC<Props> = ({ onSubmit, isLoading, initialData }) => {
  const [details, setDetails] = useState<FormDetails>({
    yearPurchased: 2021,
    originalPrice: '', // Start blank
    squareFootage: '', // Start blank
    city: 'Toronto',
    projectName: '',
    bedrooms: '1 Bed',
  });

  // Update form when initialData is provided (e.g. from URL share)
  useEffect(() => {
    if (initialData) {
      setDetails({
        yearPurchased: initialData.yearPurchased,
        originalPrice: initialData.originalPrice,
        squareFootage: initialData.squareFootage,
        city: initialData.city,
        projectName: initialData.projectName || '',
        bedrooms: initialData.bedrooms || '1 Bed',
      });
    }
  }, [initialData]);

  const handleChange = (field: keyof FormDetails, value: any) => {
    setDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure required number fields are actually numbers before submitting
    if (details.originalPrice === '' || details.squareFootage === '') {
      return; // The required attribute on inputs will handle the UI validation
    }

    onSubmit({
      ...details,
      originalPrice: Number(details.originalPrice),
      squareFootage: Number(details.squareFootage),
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
        <h2 className="text-2xl font-bold text-white mb-2">Property Details</h2>
        <p className="text-blue-100 text-sm">Enter the original purchase details of your pre-construction unit.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
        
        {/* Row 1: City & Year */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500" /> City / Region
            </label>
            <select
              required
              value={details.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-gray-50 text-gray-900"
            >
              {CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" /> Purchase Year
            </label>
            <select
              required
              value={details.yearPurchased}
              onChange={(e) => handleChange('yearPurchased', Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-gray-50 text-gray-900"
            >
              {YEARS.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Price & Size */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-500" /> Original Price (CAD)
            </label>
            <input
              type="number"
              required
              min="100000"
              step="1000"
              value={details.originalPrice}
              onChange={(e) => handleChange('originalPrice', e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-gray-50 text-gray-900 placeholder-gray-400"
              placeholder="e.g. 600000"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Ruler className="w-4 h-4 text-blue-500" /> Size (SqFt)
            </label>
            <input
              type="number"
              required
              min="200"
              max="5000"
              value={details.squareFootage}
              onChange={(e) => handleChange('squareFootage', e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-gray-50 text-gray-900 placeholder-gray-400"
              placeholder="e.g. 650"
            />
          </div>
        </div>

        {/* Row 3: Bedrooms & Project Name */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Bed className="w-4 h-4 text-blue-500" /> Bedrooms
            </label>
            <select
              value={details.bedrooms}
              onChange={(e) => handleChange('bedrooms', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-gray-50 text-gray-900"
            >
              {BEDROOM_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-500" /> Project Name (Optional)
            </label>
            <input
              type="text"
              value={details.projectName}
              onChange={(e) => handleChange('projectName', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-gray-50 text-gray-900 placeholder-gray-400"
              placeholder="e.g. The Well, Sugar Wharf"
            />
            <p className="text-xs text-gray-500">Providing the project name helps Gemini find specific assignment data.</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg shadow-lg transform transition-all hover:scale-[1.02] focus:ring-4 focus:ring-blue-300 ${
            isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing Market Data...
            </span>
          ) : (
            'Calculate Valuation'
          )}
        </button>
      </form>
    </div>
  );
};

export default ValuationForm;