import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Send, Monitor, BarChart3, Settings, HelpCircle, FileText } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/messages', label: 'Message History', icon: FileText },
    { path: '/clients', label: 'Connected Clients', icon: Monitor },
    { path: '/analytics', label: 'LAN Analytics', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-slate-800/80 min-h-[calc(100vh-73px)] p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-6">
        <div className="px-3 py-2">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Main Menu</p>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Network Info Footer */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Protocol</span>
          <span className="font-mono text-indigo-400">WebSocket / LAN</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Latency</span>
          <span className="font-mono text-emerald-400">&lt; 100ms</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Encryption</span>
          <span className="font-mono text-amber-400">AES-256 JWT</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
