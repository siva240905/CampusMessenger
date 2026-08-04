import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ConnectedClientsTable from '../components/ConnectedClientsTable';
import { useSocket } from '../context/SocketContext';
import API from '../utils/api';

const Clients = () => {
  const [darkMode, setDarkMode] = useState(true);
  const { liveClients } = useSocket();
  const [dbClients, setDbClients] = useState([]);

  const fetchClients = async () => {
    try {
      const res = await API.get('/clients');
      setDbClients(res.data);
    } catch (err) {
      console.error("Failed to load clients:", err);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const allClients = liveClients.length > 0 ? liveClients : dbClients;

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 ${darkMode ? 'dark' : ''}`}>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Connected Student Computers</h1>
            <p className="text-xs text-slate-400 mt-1">Live status, IP addresses, OS versions, and last-seen timestamps of authorized desktop clients</p>
          </div>

          <ConnectedClientsTable
            clients={allClients}
            onRefresh={fetchClients}
          />
        </main>
      </div>
    </div>
  );
};

export default Clients;
