import React from 'react';
import { AppMode } from './types';
import { IconSpark, IconLayers, IconCreditCard, IconDashboard } from './components/Icons';
import { LogoFresh } from './features/LogoFresh';
import { Dashboard } from './features/Dashboard';
import { Subscription } from './features/Subscription';
import { UserProfile } from './features/UserProfile';
import { Notifications } from './features/Notifications';
import { Auth } from './features/Auth';
import { APP_LOGO } from './constants';
import { useAuth } from './contexts/AuthContext';

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const [mode, setMode] = React.useState<AppMode>(AppMode.DASHBOARD);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [appLogo, setAppLogo] = React.useState(APP_LOGO);

  React.useEffect(() => {
    const handleLogoUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      setAppLogo(customEvent.detail);
    };
    window.addEventListener('logo-updated', handleLogoUpdate);
    const savedLogo = localStorage.getItem('gemini_user_logo');
    if (savedLogo) {
      setAppLogo(savedLogo);
    }
    return () => {
      window.removeEventListener('logo-updated', handleLogoUpdate);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background-dark">
        <div className="w-16 h-16 animate-spin rounded-full border-4 border-dashed border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }
  
  const renderContent = () => {
    switch (mode) {
      case AppMode.DASHBOARD:
        return <Dashboard setMode={setMode} />;
      case AppMode.LOGO_FRESH:
        return <LogoFresh />;
      case AppMode.SUBSCRIPTION:
        return <Subscription />;
      case AppMode.PROFILE:
        return <UserProfile onBack={() => setMode(AppMode.DASHBOARD)} />;
      default:
        return <Dashboard setMode={setMode} />;
    }
  };

  const handleSetMode = (newMode: AppMode) => {
    setMode(newMode);
    setIsMobileMenuOpen(false); // Close menu on navigation
  };

  const NavItem = ({ m, icon: Icon, label }: { m: AppMode; icon: React.ElementType; label: string }) => (
    <button
      onClick={() => handleSetMode(m)}
      className={`group flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all duration-300 ${
        mode === m 
          ? 'bg-primary/20 border border-primary/50 text-white shadow-[0_0_15px_rgba(138,63,252,0.3)]' 
          : 'text-gray-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon className={`w-5 h-5 ${mode === m ? 'text-electric-blue' : 'text-gray-500 group-hover:text-white'}`} />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6">
         <div 
           className="flex items-center gap-3 mb-10 px-2 cursor-pointer"
           onClick={() => handleSetMode(AppMode.DASHBOARD)}
         >
            <img src={appLogo} alt="Logo Fresh" className="w-10 h-10 rounded-xl border border-white/10 shadow-lg object-cover" />
            <div>
              <span className="block text-xl font-bold tracking-tight text-white leading-none drop-shadow-md">Logo Fresh!</span>
            </div>
         </div>
         
         <div className="space-y-1">
           <div className="px-4 mb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Workspace</div>
           <NavItem m={AppMode.DASHBOARD} icon={IconDashboard} label="Dashboard" />
           <NavItem m={AppMode.LOGO_FRESH} icon={IconSpark} label="Logo Fresh" />
         </div>

         <div className="space-y-1 mt-8">
           <div className="px-4 mb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Settings</div>
           <NavItem m={AppMode.SUBSCRIPTION} icon={IconCreditCard} label="Subscription" />
         </div>
      </div>
      
      <div className="mt-auto p-6 border-t border-white/5 bg-[#0A0A10]">
         <div className="flex items-center gap-3 px-1">
            <button 
              onClick={() => handleSetMode(AppMode.PROFILE)}
              className="w-10 h-10 rounded-full border-2 border-primary shadow-glow-primary overflow-hidden hover:scale-105 transition-transform"
            >
              <img 
                className="w-full h-full object-cover"
                src={user.photoURL || `https://api.dicebear.com/8.x/initials/svg?seed=${user.email}`}
                alt="User Profile"
              />
            </button>
            <div className="flex-1 cursor-pointer" onClick={() => handleSetMode(AppMode.PROFILE)}>
              <p className="text-sm font-bold text-white hover:text-electric-blue transition-colors">{user.displayName || user.email}</p>
              <p className="text-xs text-electric-blue font-medium">Pro Plan Active</p>
            </div>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="text-gray-400 hover:text-white relative"
            >
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-electric-pink rounded-full shadow-[0_0_8px_theme(colors.electric.pink)]"></span>
            </button>
         </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background-dark overflow-hidden font-sans text-white relative">
      {/* Notifications Overlay */}
      {showNotifications && <Notifications onClose={() => setShowNotifications(false)} />}

      {/* Mobile Sidebar Drawer */}
      <div 
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${isMobileMenuOpen ? 'bg-black/60 backdrop-blur-sm' : 'pointer-events-none bg-transparent'}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />
      <div className={`fixed inset-y-0 left-0 w-72 bg-[#050508] border-r border-white/5 z-50 transform transition-transform duration-300 md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </div>

      {/* Desktop Sidebar */}
      <aside className="w-72 bg-[#050508] border-r border-white/5 hidden md:flex flex-col z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background-dark/80 backdrop-blur-md border-b border-white/10 z-30 flex items-center px-4 justify-between">
         <button onClick={() => setIsMobileMenuOpen(true)}>
            <span className="material-symbols-outlined text-white">menu</span>
         </button>
         <div className="flex items-center gap-2" onClick={() => handleSetMode(AppMode.DASHBOARD)}>
            <img src={appLogo} alt="Logo Fresh" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-bold text-white">Logo Fresh!</span>
         </div>
         <button onClick={() => setShowNotifications(!showNotifications)} className="relative">
            <span className="material-symbols-outlined text-white">notifications</span>
            <span className="absolute top-0 right-0 w-2 h-2 bg-electric-pink rounded-full shadow-[0_0_8px_theme(colors.electric.pink)]"></span>
         </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative z-0 pb-16 md:pb-0 pt-16 md:pt-0 scroll-smooth bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background-dark to-background-dark">
        {renderContent()}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0A0A10]/90 backdrop-blur-lg border-t border-white/10 z-30 flex justify-around items-center">
        <button onClick={() => handleSetMode(AppMode.DASHBOARD)} className={`flex flex-col items-center gap-1 transition-colors ${mode === AppMode.DASHBOARD ? 'text-electric-blue' : 'text-gray-400'}`}>
          <IconDashboard className="w-6 h-6" />
          <span className="text-[10px] font-bold">Dashboard</span>
        </button>
        <button onClick={() => handleSetMode(AppMode.LOGO_FRESH)} className={`flex flex-col items-center gap-1 transition-colors ${mode === AppMode.LOGO_FRESH ? 'text-electric-blue' : 'text-gray-400'}`}>
          <IconSpark className="w-6 h-6" />
          <span className="text-[10px] font-bold">Logo Fresh</span>
        </button>
        <button onClick={() => handleSetMode(AppMode.PROFILE)} className={`flex flex-col items-center gap-1 transition-colors ${mode === AppMode.PROFILE ? 'text-electric-blue' : 'text-gray-400'}`}>
           <img src={user.photoURL || `https://api.dicebear.com/8.x/initials/svg?seed=${user.email}`} className="w-6 h-6 rounded-full border-2 border-primary/50" />
          <span className="text-[10px] font-bold">Profile</span>
        </button>
      </div>
    </div>
  );
};

export default App;