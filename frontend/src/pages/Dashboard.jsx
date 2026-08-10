import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import BroadcastForm from '../components/BroadcastForm';
import ConnectedClientsTable from '../components/ConnectedClientsTable';
import MessageHistoryTable from '../components/MessageHistoryTable';
import QRCodeModal from '../components/QRCodeModal';

import { useSocket } from '../context/SocketContext';
import API from '../utils/api';
import RemoteCommandModal from '../components/RemoteCommandModal';
import { Monitor, Send, FileText, Link as LinkIcon, Activity, Zap } from 'lucide-react';

const Dashboard = () => {
  const [darkMode, setDarkMode] = useState(true);
  const { onlineCount, liveClients } = useSocket();
  const [isRemoteModalOpen, setIsRemoteModalOpen] = useState(false);

  const [analytics, setAnalytics] = useState({
    total_clients: 0,
    online_clients: 0,
    total_broadcasts: 0,
    files_shared: 0,
    links_shared: 0,
    today_broadcasts: 0,
  });

  const [messages, setMessages] = useState([]);
  const [dbClients, setDbClients] = useState([]);
  const [qrUrl, setQrUrl] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, messagesRes, clientsRes] = await Promise.all([
        API.get('/analytics'),
        API.get('/messages?limit=10'),
        API.get('/clients')
      ]);
      setAnalytics(analyticsRes.data);
      setMessages(messagesRes.data);
      setDbClients(clientsRes.data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Merge live clients with DB clients
  const allClients = liveClients.length > 0 ? liveClients : dbClients;

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 ${darkMode ? 'dark' : ''}`}>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Faculty Broadcast Control Dashboard</h1>
              <p className="text-xs text-slate-400 mt-1">Real-time instant LAN communication center for campus placement drives & emergency notices</p>
            </div>
            <div>
              <button
                onClick={() => setIsRemoteModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center space-x-2 transition-all shadow-lg shadow-amber-500/20"
              >
                <Zap className="w-4 h-4" />
                <span>⚡ Remote Command Console</span>
              </button>
            </div>
          </div>

          {/* Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="Online Systems"
              value={onlineCount || analytics.online_clients}
              icon={Monitor}
              color="emerald"
              subtitle="Active LAN Sockets"
              delay={0.1}
            />
            <StatCard
              title="Messages Sent"
              value={analytics.total_broadcasts}
              icon={Send}
              color="indigo"
              subtitle="Total Broadcasts"
              delay={0.15}
            />
            <StatCard
              title="Files Shared"
              value={analytics.files_shared}
              icon={FileText}
              color="violet"
              subtitle="PDFs & Documents"
              delay={0.2}
            />
            <StatCard
              title="Links Shared"
              value={analytics.links_shared}
              icon={LinkIcon}
              color="amber"
              subtitle="Placement Registration URLs"
              delay={0.25}
            />
            <StatCard
              title="Today's Activity"
              value={analytics.today_broadcasts}
              icon={Activity}
              color="rose"
              subtitle="Broadcasts Today"
              delay={0.3}
            />
          </div>

          {/* Broadcast Form Section */}
          <BroadcastForm
            onBroadcastSent={fetchDashboardData}
            openQRModal={(url) => setQrUrl(url)}
          />

          {/* Live Connected Clients */}
          <ConnectedClientsTable
            clients={allClients}
            onRefresh={fetchDashboardData}
          />

          {/* Recent Messages Stream */}
          <MessageHistoryTable
            messages={messages}
            onDeleteMessage={fetchDashboardData}
            openQRModal={(url) => setQrUrl(url)}
          />
        </main>
      </div>

      {/* QR Code Preview Modal */}
      {qrUrl && <QRCodeModal url={qrUrl} onClose={() => setQrUrl(null)} />}

      {/* Remote Command Console Modal */}
      <RemoteCommandModal
        isOpen={isRemoteModalOpen}
        onClose={() => setIsRemoteModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;

