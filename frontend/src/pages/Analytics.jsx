import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import AnalyticsCharts from '../components/AnalyticsCharts';
import GlassCard from '../components/GlassCard';
import API from '../utils/api';
import { Activity, Clock, ShieldCheck } from 'lucide-react';

const Analytics = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    API.get('/analytics').then((res) => setAnalytics(res.data)).catch(console.error);
  }, []);

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 ${darkMode ? 'dark' : ''}`}>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">LAN Communication Analytics</h1>
            <p className="text-xs text-slate-400 mt-1">Network delivery throughput, message distribution, and system logs</p>
          </div>

          <AnalyticsCharts analytics={analytics} />

          {/* Activity Log Feed */}
          <GlassCard className="space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">System Event Audit Log</h3>
                <p className="text-xs text-slate-400">Recent server actions and broadcast execution traces</p>
              </div>
            </div>

            <div className="space-y-2">
              {analytics?.recent_activity?.length > 0 ? (
                analytics.recent_activity.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px] uppercase font-bold">
                        {log.event_type}
                      </span>
                      <span className="text-slate-200">{log.details}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-slate-500 font-mono text-[11px]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 italic text-xs">No recent log entries found.</div>
              )}
            </div>
          </GlassCard>
        </main>
      </div>
    </div>
  );
};

export default Analytics;
