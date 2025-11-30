import React from 'react';
import { IconSpark } from '../Icons';

export const Loader = ({ text = "Thinking..." }: { text?: string }) => (
  <div className="flex flex-col items-center justify-center py-12 space-y-4">
    <div className="relative">
      <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-75"></div>
      <div className="relative bg-white/10 p-3 rounded-full shadow-lg border border-primary/30">
        <IconSpark className="w-8 h-8 text-primary animate-pulse" />
      </div>
    </div>
    <p className="text-gray-400 font-medium animate-pulse">{text}</p>
  </div>
);