import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  TooltipProps
} from 'recharts';
import { ValuationData, GroundingSource, PropertyDetails } from '../types';
import { formatCurrency, formatNumber, calculateProfit, calculateMortgage } from '../utils/helpers';
import { ArrowUpRight, ArrowDownRight, Info, ExternalLink, Share2, Check, Printer, BarChart3, AlertTriangle, Briefcase, Calculator, Mail, ArrowUp, HelpCircle } from 'lucide-react';

interface Props {
  data: ValuationData;
  sources: GroundingSource[];
  input: PropertyDetails;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg">
        <p className="text-gray-600 font-medium mb-1">{label}</p>
        <p className="text-blue-600 font-bold">
          {formatCurrency(payload[0].value as number)}
        </p>
      </div>
    );
  }
  return null;
};

const SimpleTooltip = ({ message }: { message: string }) => (
  <div className="group relative inline-flex">
    <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help transition-colors" />
    <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 text-center leading-relaxed transform translate-y-2 group-hover:translate-y-0">
      {message}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
    </div>
  </div>
);

const ValuationResult: React.FC<Props> = ({ data, sources, input }) => {
  const [copied, setCopied] = useState(false);
  const profit = calculateProfit(data.estimatedValue, input.originalPrice);
  const isProfitable = profit >= 0;

  // Mortgage Calculations
  const loanAmount = input.originalPrice * 0.80; // 80% LTV
  const historicalRate = data.interestRates?.historicalRate || 2.5;
  const currentRate = data.interestRates?.currentRate || 4.9;
  
  const paymentThen = calculateMortgage(loanAmount, historicalRate);
  const paymentNow = calculateMortgage(loanAmount, currentRate);
  const paymentIncrease = paymentNow - paymentThen;
  const rateDiff = currentRate - historicalRate;
  
  // Double Trouble Condition: Value is DOWN and Payments are UP
  const isDoubleTrouble = !isProfitable && paymentIncrease > 0;

  const handleShare = () => {
    const params = new URLSearchParams();
    params.set('city', input.city);
    params.set('year', input.yearPurchased.toString());
    params.set('price', input.originalPrice.toString());
    params.set('size', input.squareFootage.toString());
    if (input.projectName) params.set('project', input.projectName);
    if (input.bedrooms) params.set('beds', input.bedrooms);

    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 print:hidden">
          <button 
            onClick={handleShare}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm focus:ring-2 focus:ring-blue-100 outline-none"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4 text-blue-600" />}
            {copied ? 'Link Copied' : 'Share Result'}
          </button>
          <button 
            onClick={() => window.print()} 
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm focus:ring-2 focus:ring-blue-100 outline-none"
          >
            <Printer className="w-4 h-4 text-gray-600" />
            Print Report
          </button>
      </div>

      {/* NEW: Financial Impact Analysis Section */}
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Valuation Gap Header */}
        <div className="text-center">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Valuation Gap</h4>
            <h2 className={`text-4xl md:text-5xl font-extrabold ${isProfitable ? 'text-green-600' : 'text-red-500'}`}>
                {isProfitable ? '+' : ''}{formatCurrency(profit)}
            </h2>
        </div>

        {/* Comparison Bars */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <div>
                <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" /> {input.yearPurchased} Price (Paid)
                    </span>
                    <span className="font-bold text-gray-900">{formatCurrency(input.originalPrice)}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-lg h-8 overflow-hidden">
                     <div className="h-full bg-slate-400" style={{ width: '100%' }}></div>
                </div>
            </div>

            <div>
                <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" /> {new Date().getFullYear()} Value (Now)
                    </span>
                    <span className="font-bold text-gray-900">{formatCurrency(data.estimatedValue)}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-lg h-8 relative overflow-hidden flex items-center">
                     <div 
                        className={`h-full ${isProfitable ? 'bg-green-500' : 'bg-red-500'} transition-all duration-1000`} 
                        style={{ width: `${Math.min((data.estimatedValue / input.originalPrice) * 100, 100)}%` }}
                     ></div>
                     {!isProfitable && (
                        <div className="absolute right-2 flex items-center text-red-600 font-bold text-xs bg-white/90 px-2 py-1 rounded shadow-sm">
                            <ArrowDownRight className="w-3 h-3 mr-1" /> Down
                        </div>
                     )}
                     {isProfitable && (
                        <div className="absolute right-2 flex items-center text-green-600 font-bold text-xs bg-white/90 px-2 py-1 rounded shadow-sm">
                            <ArrowUpRight className="w-3 h-3 mr-1" /> Up
                        </div>
                     )}
                </div>
            </div>
        </div>

        {/* Cash Flow Crunch Card */}
        <div className="bg-red-50 rounded-2xl border border-red-100 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-red-100 flex justify-between items-center bg-red-100/50">
                <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-red-600" />
                    <h3 className="font-bold text-red-900">Cash Flow Crunch</h3>
                </div>
                <span className="text-sm font-bold text-red-700 bg-red-100 px-3 py-1 rounded-full border border-red-200">Est. Payment Impact</span>
            </div>
            
            <div className="p-6 space-y-4 text-sm">
                
                {/* Interest Rates Visual Comparison */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <span className="block text-gray-500 text-xs mb-1">{input.yearPurchased} Interest Rate</span>
                        <div className="flex items-end gap-2">
                            <span className="text-xl font-bold text-gray-800">{historicalRate.toFixed(2)}%</span>
                        </div>
                    </div>
                    <div className="p-3 bg-red-50 rounded-xl border border-red-100 shadow-sm relative overflow-hidden">
                        <span className="block text-red-800 text-xs mb-1 font-medium">{new Date().getFullYear()} Interest Rate</span>
                        <div className="flex items-end gap-2">
                            <span className="text-xl font-bold text-red-700">{currentRate.toFixed(2)}%</span>
                            <span className="text-xs font-bold text-red-600 mb-1 flex items-center bg-white/50 px-1 rounded">
                                <ArrowUp className="w-3 h-3 mr-0.5" />
                                {rateDiff.toFixed(2)}%
                            </span>
                        </div>
                    </div>
                </div>

                <div className="my-3 border-t border-red-200 border-dashed"></div>
                
                <div className="space-y-2">
                    <div className="flex justify-between items-center px-2">
                        <span className="text-gray-600">Payment Then:</span>
                        <span className="font-bold text-gray-800">{formatCurrency(paymentThen)}/mo</span>
                    </div>
                    <div className="flex justify-between items-center px-2">
                        <span className="text-gray-600">Payment Now:</span>
                        <span className="font-bold text-gray-800">{formatCurrency(paymentNow)}/mo</span>
                    </div>
                </div>
                
                {/* Highlighted Payment Increase with Tooltip */}
                <div className="mt-4 pt-4 border-t border-red-200 text-center bg-white rounded-xl p-4 shadow-sm border border-red-100">
                     <div className="flex items-center justify-center gap-2 mb-2">
                        <p className="text-gray-600 font-semibold uppercase text-xs tracking-wider">Net Monthly Increase</p>
                        <SimpleTooltip message="This figure shows how much MORE you would pay monthly on a standard mortgage today compared to the purchase year, assuming an 80% loan-to-value ratio on the original price." />
                     </div>
                     <p className="text-4xl font-extrabold text-red-600 flex justify-center items-center gap-2">
                        +{formatCurrency(paymentIncrease)}
                        <span className="text-base font-medium text-red-400">/mo</span>
                     </p>
                </div>
            </div>
        </div>

        {/* Double Trouble Warning */}
        {isDoubleTrouble && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                <div className="bg-yellow-100 p-2 rounded-full">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                    <h4 className="text-yellow-900 font-bold text-sm">Double Trouble Alert</h4>
                    <p className="text-yellow-800 text-sm mt-1">
                        Your property value has decreased by <span className="font-bold">{formatCurrency(Math.abs(profit))}</span> while your estimated holding costs have increased by <span className="font-bold">{formatCurrency(paymentIncrease)}/mo</span>.
                    </p>
                </div>
            </div>
        )}

        {/* Rescue Plan Button */}
        <a 
            href="https://real-estate-calculators.com/forms/?page=view&id=9" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block w-full group"
        >
            <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-5 rounded-xl shadow-lg transform transition-all hover:-translate-y-1 flex items-center justify-center gap-3 border border-slate-700">
                <div className="bg-slate-700 p-2 rounded-lg group-hover:bg-slate-600 transition-colors">
                    <Mail className="w-6 h-6 text-blue-300" />
                </div>
                <div className="text-left">
                    <span className="block text-blue-200 text-xs font-medium uppercase tracking-wider">Concerned about cash flow?</span>
                    <span className="block text-lg">Get a Cash Flow Rescue Plan</span>
                </div>
            </button>
        </a>

      </div>

      <div className="border-t border-gray-200 my-8"></div>

      {/* Original Chart & Analysis Section (Existing) */}
      <h3 className="text-xl font-bold text-gray-900 mb-4">Market Analysis Details</h3>

      {/* Top Summary Cards (Existing) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Estimated Value */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSignIcon className="w-12 h-12 text-blue-600" />
          </div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Estimated Assignment Value</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(data.estimatedValue)}</h3>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-500">Based on {formatCurrency(data.currentPPSF)} / sqft</span>
          </div>
        </div>

        {/* Profit/Loss */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Potential Profit/Loss</p>
          <div className="flex items-center mt-2 space-x-2">
            <h3 className={`text-3xl font-bold ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
              {isProfitable ? '+' : ''}{formatCurrency(profit)}
            </h3>
            <div className={`flex items-center px-2 py-1 rounded-full text-xs font-bold ${isProfitable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {isProfitable ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
              {Math.abs(data.appreciationPercentage)}%
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Since purchase in {input.yearPurchased}
          </div>
        </div>

        {/* PPSF Comparison */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Price Per SqFt Analysis</p>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Original ({input.yearPurchased})</span>
              <span className="font-semibold text-gray-900">{formatCurrency(data.originalPPSF)}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div 
                className="bg-gray-400 h-1.5 rounded-full" 
                style={{ width: '100%' }}
              ></div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Current (Est.)</span>
              <span className="font-semibold text-blue-600">{formatCurrency(data.currentPPSF)}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full ${data.currentPPSF >= data.originalPPSF ? 'bg-blue-600' : 'bg-red-500'}`}
                style={{ width: `${Math.min((data.currentPPSF / data.originalPPSF) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h4 className="text-lg font-bold text-gray-900 mb-6">Value Trend Projection</h4>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.yearByYearTrend} margin={{ top: 10, right: 0, left: 30, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="year" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="avgPrice" 
                  stroke="#2563EB" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Analysis & Sources */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Comparable Stats */}
          {data.comparableStats && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h4 className="text-gray-900 font-bold mb-4 text-sm uppercase tracking-wide flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-500" /> Comparable Market Stats
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <span className="text-gray-600 text-sm">Avg. Assignment Price</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(data.comparableStats.avgAssignmentPrice)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-gray-600 text-sm">Inventory Level</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    data.comparableStats.inventoryLevel.toLowerCase().includes('high') ? 'bg-red-100 text-red-700' :
                    data.comparableStats.inventoryLevel.toLowerCase().includes('low') ? 'bg-green-100 text-green-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {data.comparableStats.inventoryLevel}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Market Insight */}
          <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
            <h4 className="text-indigo-900 font-bold mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" /> Market Insight
            </h4>
            <p className="text-indigo-800 text-sm leading-relaxed">
              {data.marketAnalysis}
            </p>
          </div>

          {/* Sources */}
          {sources.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h4 className="text-gray-900 font-bold mb-4 text-sm uppercase tracking-wide">Data Sources</h4>
              <ul className="space-y-3">
                {sources.map((source, idx) => (
                  <li key={idx} className="text-sm">
                    <a 
                      href={source.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-start gap-2 text-gray-600 hover:text-blue-600 transition-colors group"
                    >
                      <ExternalLink className="w-4 h-4 mt-0.5 flex-shrink-0 group-hover:text-blue-500" />
                      <span className="line-clamp-1">{source.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Simple Icon component for visual flare
const DollarSignIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Simple Calendar Icon helper for the inline usage if needed
const Calendar = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

export default ValuationResult;