
import React from 'react';
import { IconSpark } from '../components/Icons';

interface NotificationsProps {
  onClose: () => void;
}

export const Notifications: React.FC<NotificationsProps> = ({ onClose }) => {
  const notifications = [
    {
      id: 1,
      title: "New Comment on 'Project Alpha'",
      desc: "Lena said: 'This looks great! Just one minor tweak needed on the logo.'",
      time: "5m ago",
      type: "chat",
      color: "text-electric-pink",
      bg: "bg-electric-pink/20",
      glow: "shadow-[0_0_15px_rgba(255,0,127,0.4)]"
    },
    {
      id: 2,
      title: "File Shared with You",
      desc: "David shared 'Final Presentation Deck.pptx' with the team.",
      time: "2h ago",
      type: "share",
      color: "text-electric-blue",
      bg: "bg-electric-blue/20",
      glow: "shadow-[0_0_15px_rgba(0,240,255,0.4)]"
    },
    {
      id: 3,
      title: "Deadline Approaching",
      desc: "'Q3 Report Submission' is due tomorrow.",
      time: "1d ago",
      type: "warning",
      color: "text-red-400",
      bg: "bg-red-500/20",
      glow: "shadow-[0_0_15px_rgba(248,113,113,0.4)]"
    }
  ];

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[#0D0B14]/95 backdrop-blur-xl border-l border-white/10 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] z-50 transform transition-transform duration-300">
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <h2 className="text-xl font-bold text-white tracking-tight">Notifications</h2>
        <div className="flex gap-4">
          <button className="text-xs font-bold text-[#8A3FFC] hover:text-[#00F0FF] transition-colors">Mark all read</button>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-80px)]">
        <div className="px-2">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Today</h3>
        </div>

        {notifications.map((n) => (
          <div key={n.id} className="group relative w-full rounded-2xl border border-white/10 bg-[#1A1A2E]/50 p-4 hover:bg-[#1A1A2E] transition-all hover:border-white/20">
            {/* Glow Effect */}
            <div className={`absolute top-4 right-4 h-2 w-2 rounded-full ${n.type === 'chat' ? 'bg-electric-pink shadow-[0_0_10px_#FF007F]' : 'bg-transparent'}`}></div>
            
            <div className="flex items-start gap-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${n.bg} ${n.color} ${n.glow}`}>
                <span className="material-symbols-outlined text-lg">
                  {n.type === 'chat' ? 'chat_bubble' : n.type === 'share' ? 'share' : 'warning'}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-white text-sm">{n.title}</p>
                <p className="mt-1 text-xs text-gray-400 leading-relaxed">{n.desc}</p>
                <p className="mt-2 text-[10px] font-medium text-[#00F0FF]">{n.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};