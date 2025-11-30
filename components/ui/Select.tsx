
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, options, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wide mb-1.5 ml-1">{label}</label>}
      <div className="relative">
        <select
          className={`appearance-none w-full px-4 py-3 bg-[#1A1A2E]/60 border border-white/10 rounded-xl shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-[#8A3FFC] focus:border-[#8A3FFC] cursor-pointer hover:border-white/20 transition-all font-medium ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#1A1A2E] text-white">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};