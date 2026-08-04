import React from 'react';
import GlassCard from './GlassCard';

const StatCard = ({ title, value, icon: Icon, color = 'indigo', subtitle, delay = 0 }) => {
  const colorMap = {
    indigo: 'from-indigo-500/20 to-indigo-600/5 text-indigo-400 border-indigo-500/30',
    emerald: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/30',
    violet: 'from-violet-500/20 to-violet-600/5 text-violet-400 border-violet-500/30',
    amber: 'from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-500/30',
    rose: 'from-rose-500/20 to-rose-600/5 text-rose-400 border-rose-500/30',
  };

  return (
    <GlassCard delay={delay} className="flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">{title}</p>
          <h3 className="text-3xl font-extrabold text-white mt-2 font-mono tracking-tight">{value}</h3>
        </div>
        
        <div className={`p-3.5 rounded-2xl bg-gradient-to-br border ${colorMap[color] || colorMap.indigo} shadow-lg`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {subtitle && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400">{subtitle}</span>
          <span className="text-emerald-400 font-medium">Live</span>
        </div>
      )}
    </GlassCard>
  );
};

export default StatCard;
