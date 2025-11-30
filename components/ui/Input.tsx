
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wide mb-1.5 ml-1">{label}</label>}
      <input
        className={`w-full px-4 py-3 bg-[#1A1A2E]/60 border rounded-xl shadow-sm text-white placeholder-gray-500 transition-all focus:outline-none focus:ring-2 focus:ring-[#8A3FFC] focus:border-[#8A3FFC] ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-white/10 hover:border-white/20'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-red-400 ml-1">{error}</p>}
    </div>
  );
};