
import React, { useMemo, useState, useEffect } from 'react';
import { AppMode, Occasion } from '../types';
import { APP_LOGO, MONTHLY_BANNERS } from '../constants';
import { fetchOccasions } from '../services/firestoreService';

interface DashboardProps {
  setMode: (mode: AppMode) => void;
}

interface MonthlyPack {
    monthName: string;
    monthIndex: number;
    year: number;
    occasions: Occasion[];
}

export const Dashboard: React.FC<DashboardProps> = ({ setMode }) => {
  const userLogo = localStorage.getItem('gemini_user_logo');
  const [allOccasions, setAllOccasions] = useState<Occasion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOccasions = async () => {
      try {
        const occasions = await fetchOccasions();
        setAllOccasions(occasions);
      } catch (error) {
        console.error('Failed to fetch occasions for dashboard', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadOccasions();
  }, []);

  const monthlyPacks = useMemo((): MonthlyPack[] => {
    if (allOccasions.length === 0) return [];

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const packs: MonthlyPack[] = [];
    
    for (let i = 1; i <= 3; i++) {
        const targetMonth = (currentMonth + i) % 12;
        const targetYear = currentMonth + i >= 12 ? currentYear + 1 : currentYear;
        
        const occasionsInMonth = allOccasions.filter(o => o.months.includes(targetMonth));
        
        if (occasionsInMonth.length > 0) {
            const monthName = new Date(targetYear, targetMonth, 1).toLocaleString('default', { month: 'long' });
            packs.push({
                monthName,
                monthIndex: targetMonth,
                year: targetYear,
                occasions: occasionsInMonth
            });
        }
    }
    return packs;
  }, [allOccasions]);


  const getOccasionStyle = (occasion: Occasion): React.CSSProperties => {
    if (!userLogo) return {};
    
    // Simple filter for demonstration. Can be expanded.
    const filters: Record<string, string> = {
      'winter': 'contrast(1.2) brightness(1.1) sepia(0.1)',
      'spring': 'hue-rotate(-20deg) saturate(1.5)',
      'summer': 'saturate(1.8) contrast(1.1)',
      'autumn': 'sepia(0.5) hue-rotate(10deg) saturate(2)',
    };
    const categoryFilter = filters[occasion.category.toLowerCase()] || 'saturate(1.2)';

    return { filter: categoryFilter };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-white">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4 drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]">
          Welcome to Logo Fresh
        </h1>
        <p className="text-gray-400 text-lg">Unleash Your Creative Universe.</p>
      </div>

      <div className="flex justify-center mb-24">
        <div className="group relative overflow-hidden rounded-3xl bg-[#1A1A2E]/60 border border-electric-blue/30 p-12 transition-all max-w-xl w-full flex flex-col items-center text-center shadow-[0_0_60px_rgba(0,240,255,0.1)]">
          <div className="relative mb-8">
              <div className="absolute inset-0 bg-electric-blue blur-[60px] opacity-20 animate-pulse"></div>
              <img src={APP_LOGO} alt="Logo Fresh" className="w-40 h-40 rounded-3xl shadow-[0_0_40px_rgba(0,240,255,0.4)] backdrop-blur-md"/>
          </div>

          <h3 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">Logo Fresh</h3>
          <p className="text-gray-300 text-base leading-relaxed max-w-sm mx-auto mb-8">
            Instantly refresh your brand logos with AI.
          </p>

          <button 
            onClick={() => setMode(AppMode.LOGO_FRESH)}
            className="flex items-center gap-3 px-8 py-4 bg-electric-blue text-black text-base font-bold rounded-full shadow-[0_0_25px_rgba(0,240,255,0.5)] hover:shadow-[0_0_50px_rgba(0,240,255,0.8)] hover:scale-105 transition-all duration-300"
          >
            <span>Get Started</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>

      <div className="mb-20">
        <div className="flex items-center justify-between mb-8 px-2 border-b border-white/10 pb-4">
            <h2 className="text-2xl font-bold text-white">Upcoming Occasion Packs</h2>
            <button onClick={() => setMode(AppMode.SUBSCRIPTION)} className="text-electric-blue text-sm font-bold hover:underline">Enable Auto-Send</button>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center p-16">
            <div className="w-12 h-12 animate-spin rounded-full border-4 border-dashed border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {monthlyPacks.map((pack) => (
                  <div 
                    key={pack.monthName} 
                    onClick={() => setMode(AppMode.LOGO_FRESH)}
                    className="group relative aspect-video rounded-2xl overflow-hidden border border-white/10 hover:border-electric-blue/50 transition-all hover:shadow-[0_0_40px_rgba(0,240,255,0.15)] cursor-pointer bg-background-dark"
                  >
                      <div 
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-40 group-hover:opacity-20"
                          style={{ backgroundImage: `url(${MONTHLY_BANNERS[pack.monthIndex]})` }}
                      />
                      
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-center">
                          <h3 className="font-bold text-white text-2xl drop-shadow-md mb-4">{pack.monthName} Pack</h3>
                          
                          <div className="w-24 h-24 relative mb-4">
                              {userLogo ? (
                                  <img 
                                    src={userLogo} 
                                    alt="Your Logo" 
                                    className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-all duration-500"
                                    style={getOccasionStyle(pack.occasions[0])} // Apply filter based on first occasion
                                  />
                              ) : (
                                  <div className="w-full h-full border-2 border-dashed border-white/20 rounded-2xl flex items-center justify-center bg-white/5 backdrop-blur-sm group-hover:border-electric-blue/50 transition-colors">
                                      <span className="text-xs font-bold text-gray-500 uppercase text-center group-hover:text-electric-blue">Your Logo</span>
                                  </div>
                              )}
                          </div>
                          
                          <div className="flex flex-wrap gap-1.5 justify-center mt-auto">
                             {pack.occasions.slice(0, 2).map(o => (
                                 <span key={o.value} className="text-[10px] font-medium bg-white/10 px-2 py-0.5 rounded text-white border border-white/20 backdrop-blur-sm">
                                    {o.label}
                                 </span>
                             ))}
                             {pack.occasions.length > 2 && <span className="text-[10px] text-gray-400 bg-black/20 px-2 py-0.5 rounded border border-white/10">+ {pack.occasions.length - 2} more</span>}
                          </div>
                      </div>
                  </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};
