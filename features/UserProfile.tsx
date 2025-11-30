import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { seedOccasionsToFirestore } from '../services/seedService';
import { Button } from '../components/ui/Button';

interface UserProfileProps {
  onBack: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onBack }) => {
  const { user, logout, sendPasswordReset } = useAuth();
  const [resetStatus, setResetStatus] = React.useState('');
  const [seedStatus, setSeedStatus] = React.useState('');
  const [isSeeding, setIsSeeding] = React.useState(false);

  const handlePasswordReset = async () => {
    if (user?.email) {
      try {
        await sendPasswordReset();
        setResetStatus('Password reset email sent successfully!');
      } catch (error) {
        setResetStatus('Failed to send password reset email.');
      }
    }
  };

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    setSeedStatus('Seeding... this may take a moment.');
    try {
      await seedOccasionsToFirestore();
      setSeedStatus('Database seeded successfully!');
    } catch (error) {
      setSeedStatus('Error seeding database. Check console for details.');
      console.error(error);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="relative flex h-full w-full flex-col group/design-root overflow-x-hidden animate-fade-in">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'radial-gradient(circle at top right, rgba(162, 89, 255, 0.3), transparent 40%), radial-gradient(circle at bottom left, rgba(0, 240, 255, 0.2), transparent 40%)'
          }}
        />
        <div className="flex items-center p-4 pb-2 justify-between">
            <button onClick={onBack} className="flex size-12 shrink-0 items-center justify-start text-white">
                <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12 text-white">User Profile</h2>
        </div>
        
        <div className="flex p-4">
            <div className="flex w-full flex-col gap-6 items-center bg-panel-dark/80 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-floating-purple">
                <div className="flex gap-4 flex-col items-center">
                    <div className="relative">
                        <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-32 w-32 border-4 border-vibrant-purple shadow-glow-purple" style={{backgroundImage: `url(${user?.photoURL || `https://api.dicebear.com/8.x/initials/svg?seed=${user?.email}`})`}}></div>
                        <div className="absolute -bottom-1 -right-1 flex items-center justify-center size-8 rounded-full bg-vibrant-purple border-2 border-panel-dark shadow-glow-purple">
                            <span className="material-symbols-outlined text-base text-white">edit</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-1">
                        <p className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] text-center">{user?.displayName || 'User'}</p>
                        <p className="text-gray-300 text-base font-normal leading-normal text-center">{user?.email}</p>
                        <div className="mt-2 inline-flex items-center justify-center rounded-full bg-vibrant-purple/20 px-3 py-1 text-sm font-medium text-blue-300 border border-vibrant-purple/50">
                          Pro Plan
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div className="flex flex-col gap-4 p-4">
            <div className="flex flex-col overflow-hidden rounded-xl bg-panel-dark/80 backdrop-blur-md border border-white/10 shadow-floating-cyan">
                <div onClick={handlePasswordReset} className="flex items-center gap-4 px-4 min-h-16 justify-between border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="text-cyan-300 flex items-center justify-center shrink-0 size-10"><span className="material-symbols-outlined">lock_reset</span></div>
                        <p className="text-white text-base font-medium leading-normal flex-1 truncate">Change Password</p>
                    </div>
                    <div className="shrink-0 text-gray-400"><span className="material-symbols-outlined">chevron_right</span></div>
                </div>
                <div className="flex items-center gap-4 px-4 min-h-16 justify-between cursor-pointer hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="text-cyan-300 flex items-center justify-center shrink-0 size-10"><span className="material-symbols-outlined">receipt_long</span></div>
                        <p className="text-white text-base font-medium leading-normal flex-1 truncate">Billing Information</p>
                    </div>
                    <div className="shrink-0 text-gray-400"><span className="material-symbols-outlined">chevron_right</span></div>
                </div>
            </div>
            {resetStatus && <p className="text-center text-xs text-electric-green bg-electric-green/10 p-2 rounded-lg">{resetStatus}</p>}
        </div>

        {/* Admin Tools */}
        <div className="flex flex-col gap-4 p-4">
          <div className="p-4 rounded-xl bg-panel-dark/80 backdrop-blur-md border border-white/10 shadow-lg">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Admin Tools</h3>
            <p className="text-xs text-gray-500 mb-4">This tool will populate your Firestore database with the required occasion data. Run this once for your project.</p>
            <Button onClick={handleSeedDatabase} isLoading={isSeeding} disabled={isSeeding}>
              {isSeeding ? 'Seeding...' : 'Seed Occasions Database'}
            </Button>
            {seedStatus && <p className="text-center text-xs text-electric-green bg-electric-green/10 p-2 rounded-lg mt-4">{seedStatus}</p>}
          </div>
        </div>
        
        <div className="flex flex-col gap-4 p-4 mt-auto">
            <div className="flex flex-col overflow-hidden rounded-xl bg-panel-dark/80 backdrop-blur-md border border-white/10 shadow-lg shadow-black/20">
                <div className="flex px-2 py-2">
                    <button onClick={logout} className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 flex-1 bg-transparent text-red-400 text-base font-medium leading-normal gap-2 hover:bg-red-500/10 transition-colors">
                        <span className="material-symbols-outlined">logout</span>
                        <span className="truncate">Logout</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};
