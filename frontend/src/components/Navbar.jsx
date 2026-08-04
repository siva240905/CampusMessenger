import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Radio, LogOut, ShieldCheck, Sun, Moon, Bell, Monitor } from 'lucide-react';

const Navbar = ({ darkMode, setDarkMode }) => {
  const { user, logout } = useAuth();
  const { isConnected, onlineCount } = useSocket();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-6 py-4 flex items-center justify-between shadow-2xl">
      {/* Brand & System Status */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3 bg-gradient-to-r from-indigo-600 to-violet-600 px-3.5 py-2 rounded-xl shadow-lg shadow-indigo-500/20">
          <Radio className="w-6 h-6 text-white animate-pulse" />
          <span className="font-extrabold text-lg tracking-wider text-white">CampusLink</span>
        </div>
        
        <div className="hidden sm:flex items-center space-x-2 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800 text-xs">
          <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'}`} />
          <span className="font-medium text-slate-300">
            {isConnected ? 'LAN Gateway Active' : 'Disconnected'}
          </span>
          <span className="text-slate-600">|</span>
          <div className="flex items-center space-x-1 text-indigo-400 font-semibold">
            <Monitor className="w-3.5 h-3.5" />
            <span>{onlineCount} Clients Online</span>
          </div>
        </div>
      </div>

      {/* Controls & Profile */}
      <div className="flex items-center space-x-4">
        {/* Student Chrome Web App Link */}
        <a
          href="/student"
          target="_blank"
          rel="noreferrer"
          className="hidden md:flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition"
          title="Open Student Chrome Web App Client"
        >
          <Monitor className="w-4 h-4 text-indigo-400" />
          <span>Student App</span>
        </a>

        {/* Dark/Light Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all shadow-inner"
          title="Toggle Dark/Light Mode"
        >
          {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-400" />}
        </button>


        {/* User Info */}
        <div className="flex items-center space-x-3 bg-slate-900/90 pl-3.5 pr-2 py-1.5 rounded-xl border border-slate-800 shadow-md">
          <div className="flex flex-col text-right">
            <span className="text-sm font-semibold text-slate-100">{user?.full_name || 'Faculty Member'}</span>
            <span className="text-[10px] text-indigo-400 font-mono uppercase tracking-widest flex items-center justify-end gap-1">
              <ShieldCheck className="w-3 h-3" /> {user?.role || 'FACULTY'}
            </span>
          </div>
          
          <button
            onClick={logout}
            className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 transition-all"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
