import React from 'react';
import GlassCard from './GlassCard';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, PieChart as PieIcon } from 'lucide-react';

const AnalyticsCharts = ({ analytics }) => {
  const hourlyData = [
    { time: '09:00', broadcasts: 2 },
    { time: '10:00', broadcasts: 5 },
    { time: '11:00', broadcasts: 12 },
    { time: '12:00', broadcasts: 8 },
    { time: '13:00', broadcasts: 3 },
    { time: '14:00', broadcasts: 15 },
    { time: '15:00', broadcasts: 9 },
    { time: '16:00', broadcasts: 18 },
    { time: '17:00', broadcasts: 7 },
  ];

  const priorityData = [
    { name: 'Normal', value: 65, color: '#6366f1' },
    { name: 'High Priority', value: 25, color: '#f59e0b' },
    { name: 'Emergency Alerts', value: 10, color: '#f43f5e' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Activity Timeline Chart */}
      <GlassCard className="lg:col-span-2 space-y-4">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Broadcast Activity Trend</h3>
            <p className="text-xs text-slate-400">Hourly instant notification distribution over local LAN</p>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData}>
              <defs>
                <linearGradient id="colorBroadcasts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="broadcasts" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorBroadcasts)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Priority Distribution Pie Chart */}
      <GlassCard className="space-y-4">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
            <PieIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Priority Breakdown</h3>
            <p className="text-xs text-slate-400">Message types distribution</p>
          </div>
        </div>

        <div className="h-48 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={5}
                dataKey="value"
              >
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-800">
          {priorityData.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300">{item.name}</span>
              </div>
              <span className="font-bold text-white">{item.value}%</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

export default AnalyticsCharts;
