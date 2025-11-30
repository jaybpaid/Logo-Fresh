
import React, { useState } from 'react';
import { PaymentFlow } from './PaymentFlow';

export const Subscription: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [showPayment, setShowPayment] = useState<string | null>(null);

  const plans = {
    monthly: {
      basic: { price: 10, features: ["Access to core creative tools", "5GB cloud storage", "Standard support"] },
      pro: { price: 29, features: ["All monthly occasion packs", "5 bonus style generations", "Advanced AI editing tools", "Priority support"] },
      enterprise: { price: 50, features: ["All Pro features", "Team collaboration tools", "Unlimited cloud storage", "Dedicated account manager"] }
    },
    annual: {
      basic: { price: 100, features: ["Access to core creative tools", "5GB cloud storage", "Standard support"] },
      pro: { price: 290, features: ["All monthly occasion packs", "5 bonus style generations", "Advanced AI editing tools", "Priority support"] },
      enterprise: { price: 500, features: ["All Pro features", "Team collaboration tools", "Unlimited cloud storage", "Dedicated account manager"] }
    }
  };
  
  const proPrice = billingCycle === 'annual' ? plans.annual.pro.price : plans.monthly.pro.price;
  const proPricePeriod = billingCycle === 'annual' ? '/year' : '/month';

  const basicPrice = billingCycle === 'annual' ? plans.annual.basic.price : plans.monthly.basic.price;
  const basicPricePeriod = billingCycle === 'annual' ? '/year' : '/month';
  
  const enterprisePrice = billingCycle === 'annual' ? plans.annual.enterprise.price : plans.monthly.enterprise.price;
  const enterprisePricePeriod = billingCycle === 'annual' ? '/year' : '/month';


  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-white animate-fade-in">
        <div className="flex items-center justify-center p-4 mb-8 text-center">
          <h2 className="text-xl font-bold leading-tight tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            Upgrade Your Plan
          </h2>
        </div>

        <div className="flex justify-center mb-10">
          <div className="flex p-1 rounded-full bg-[#1A1A2E] border border-white/10">
            <button 
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${billingCycle === 'monthly' ? 'bg-[#8A3FFC] text-white shadow-glow-primary' : 'text-gray-400 hover:text-white'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${billingCycle === 'annual' ? 'bg-[#8A3FFC] text-white shadow-glow-primary' : 'text-gray-400 hover:text-white'}`}
            >
              Annual (Save 20%)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
          {/* Basic Plan */}
          <div className="relative flex flex-col p-8 bg-[#1A1A2E]/50 rounded-3xl border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all mt-4 md:mt-8">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-24 bg-electric-blue/10 blur-3xl -z-10"></div>
            <h3 className="text-xl font-bold text-white mb-2">Basic</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-black text-white">${basicPrice}</span>
              <span className="text-gray-400">{basicPricePeriod}</span>
            </div>
            <button className="w-full py-3 rounded-xl bg-[#252540] text-white font-semibold border border-white/10 mb-8 cursor-default">
              Current Plan
            </button>
            <ul className="space-y-4 text-gray-300 text-sm">
              {plans[billingCycle].basic.features.map((feat, i) => (
                 <li key={i} className="flex items-center gap-3"><span className="material-symbols-outlined text-[#39FF14] text-sm">check_circle</span> {feat}</li>
              ))}
            </ul>
          </div>

          {/* Pro Plan */}
          <div className="relative flex flex-col p-8 bg-background-panel/80 rounded-3xl border-2 border-electric-blue shadow-[0_0_40px_rgba(0,240,255,0.2)] z-10">
            <div className="absolute top-0 right-6 bg-electric-blue text-black text-xs font-bold px-4 py-1 rounded-b-lg">
              RECOMMENDED
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-black text-electric-blue drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]">${proPrice}</span>
              <span className="text-gray-400">{proPricePeriod}</span>
            </div>
            <button 
              onClick={() => setShowPayment(`Pro Plan|$${proPrice.toFixed(2)}`)}
              className="w-full py-3 rounded-xl bg-electric-blue text-black font-bold shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] hover:bg-[#33F3FF] transition-all mb-8"
            >
              Upgrade to Pro
            </button>
            <ul className="space-y-4 text-gray-300 text-sm">
               {plans[billingCycle].pro.features.map((feat, i) => (
                 <li key={i} className="flex items-center gap-3"><span className="material-symbols-outlined text-electric-blue text-sm">check_circle</span> {feat}</li>
              ))}
            </ul>
          </div>

          {/* Enterprise Plan */}
          <div className="relative flex flex-col p-8 bg-[#1A1A2E]/50 rounded-3xl border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all mt-4 md:mt-8">
            <h3 className="text-xl font-bold text-white mb-2">Enterprise</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-black text-white">${enterprisePrice}</span>
              <span className="text-gray-400">{enterprisePricePeriod}</span>
            </div>
            <button 
              onClick={() => setShowPayment(`Enterprise Plan|$${enterprisePrice.toFixed(2)}`)}
              className="w-full py-3 rounded-xl bg-[#252540] text-white font-semibold border border-white/10 hover:bg-[#2F2F50] transition-colors mb-8"
            >
              Choose Enterprise
            </button>
            <ul className="space-y-4 text-gray-300 text-sm">
              {plans[billingCycle].enterprise.features.map((feat, i) => (
                 <li key={i} className="flex items-center gap-3"><span className="material-symbols-outlined text-[#39FF14] text-sm">check_circle</span> {feat}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {showPayment && (
        <PaymentFlow 
          planName={showPayment.split('|')[0]} 
          price={showPayment.split('|')[1]} 
          onClose={() => setShowPayment(null)} 
          onSuccess={() => setShowPayment(null)}
        />
      )}
    </>
  );
};
