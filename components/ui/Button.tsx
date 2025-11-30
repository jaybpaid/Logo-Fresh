
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'black' | 'neon';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  isLoading, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";
  
  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-lg",
    md: "px-5 py-3 text-sm rounded-xl",
    lg: "px-8 py-4 text-base rounded-2xl"
  };

  const variants = {
    primary: "bg-[#8A3FFC] text-white hover:bg-[#7a37e0] shadow-glow-primary hover:shadow-[0_0_30px_rgba(138,63,252,0.6)] border border-transparent",
    neon: "bg-[#39FF14] text-black hover:bg-[#32e010] shadow-[0_0_15px_rgba(57,255,20,0.5)] hover:shadow-[0_0_25px_rgba(57,255,20,0.7)] border border-transparent",
    secondary: "bg-[#1A1A2E] text-white hover:bg-[#252540] border border-white/10 hover:border-white/20",
    outline: "bg-transparent text-gray-300 border border-white/20 hover:bg-white/5 hover:text-white hover:border-white/40",
    ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-white/5",
    black: "bg-black text-white hover:bg-gray-900 border border-white/10"
  };

  return (
    <button 
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
};