
import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

interface PaymentFlowProps {
  planName: string;
  price: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentFlow: React.FC<PaymentFlowProps> = ({ planName, price, onClose, onSuccess }) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    setStep('success');
  };

  if (step === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[#0D0B14]/95 backdrop-blur-xl" onClick={onClose} />
        <div className="relative w-full max-w-md bg-[#101122] rounded-3xl border border-white/10 p-8 shadow-[0_0_100px_rgba(138,63,252,0.3)] flex flex-col items-center text-center animate-scale-in">
          
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#8A3FFC] to-[#00F0FF] flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(138,63,252,0.6)]">
            <span className="material-symbols-outlined text-6xl text-white">check_circle</span>
          </div>

          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">Payment Successful!</h2>
          <p className="text-gray-400 mb-8">You've successfully subscribed to the <span className="text-[#00F0FF] font-bold">{planName}</span>.</p>

          <div className="w-full bg-white/5 rounded-xl p-5 border border-white/10 mb-8 shadow-inner">
            <div className="flex justify-between text-sm py-3 border-b border-white/5">
              <span className="text-gray-400">Plan</span>
              <span className="text-white font-medium">{planName}</span>
            </div>
            <div className="flex justify-between text-sm py-3 border-b border-white/5">
              <span className="text-gray-400">Total</span>
              <span className="text-white font-bold">{price}</span>
            </div>
            <div className="flex justify-between text-sm py-3">
              <span className="text-gray-400">Card</span>
              <span className="text-white font-medium">Visa •••• 4242</span>
            </div>
          </div>

          <Button onClick={onSuccess} className="w-full h-14 text-lg" variant="neon">
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0D0B14]/90 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#101122] rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onClose} className="p-2 -ml-2 text-gray-400 hover:text-white">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="text-xl font-bold text-white">Add Payment Method</h2>
          <div className="w-8"></div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Card Number</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="0000 0000 0000 0000" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#8A3FFC] focus:ring-1 focus:ring-[#8A3FFC] outline-none transition-all font-mono shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]"
              />
              <span className="material-symbols-outlined absolute right-4 top-3 text-gray-500">credit_card</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Cardholder Name</label>
            <input 
              type="text" 
              placeholder="Name on card" 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#8A3FFC] focus:ring-1 focus:ring-[#8A3FFC] outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Expiry</label>
              <input 
                type="text" 
                placeholder="MM/YY" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#8A3FFC] focus:ring-1 focus:ring-[#8A3FFC] outline-none transition-all text-center"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">CVC</label>
              <input 
                type="text" 
                placeholder="123" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#8A3FFC] focus:ring-1 focus:ring-[#8A3FFC] outline-none transition-all text-center"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-gray-500 text-[#8A3FFC] focus:ring-[#8A3FFC] bg-transparent" />
            <span className="text-sm text-gray-300">Billing address same as shipping</span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center justify-center gap-2 mb-4 text-xs text-gray-500">
            <span className="material-symbols-outlined text-sm">lock</span>
            Payments are secure and encrypted
          </div>
          <Button 
            onClick={handlePay} 
            isLoading={loading}
            className="w-full h-14 text-lg"
          >
            Pay {price}
          </Button>
        </div>
      </div>
    </div>
  );
};