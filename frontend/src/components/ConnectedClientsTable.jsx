import React, { useState } from 'react';
import GlassCard from './GlassCard';
import { Monitor, Search, RefreshCw, Cpu, Activity } from 'lucide-react';

const ConnectedClientsTable = ({ clients, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      (client.computer_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (client.ip_address || '').includes(search) ||
      (client.os_info || '').toLowerCase().includes(search.toLowerCase());
      
    const matchesStatus =
      statusFilter === 'all' ? true : client.status === statusFilter;
      
    return matchesSearch && matchesStatus;
  });

  return (
    <GlassCard className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Connected Student Systems</h3>
            <p className="text-xs text-slate-400">Live monitoring of all authorized desktop client sessions</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Host / IP / OS..."
              className="pl-9 pr-4 py-1.5 text-xs rounded-xl glass-input w-48 sm:w-64"
            />
          </div>

          <button
            onClick={onRefresh}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-all"
            title="Refresh Client List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th className="p-3">Computer Name</th>
              <th className="p-3">IP Address</th>
              <th className="p-3">Operating System</th>
              <th className="p-3">Client Version</th>
              <th className="p-3">Status</th>
              <th className="p-3">Last Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-500 italic">
                  No active student clients matching criteria.
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => (
                <tr key={client.client_id || client.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-3 font-semibold text-white flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-indigo-400" />
                    <span>{client.computer_name || 'Student-PC'}</span>
                  </td>
                  <td className="p-3 font-mono text-indigo-300">{client.ip_address}</td>
                  <td className="p-3 text-slate-300">{client.os_info || 'Windows 11'}</td>
                  <td className="p-3 font-mono text-slate-400">{client.client_version || '1.0.0'}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      client.status === 'online'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${client.status === 'online' ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                      {client.status || 'online'}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400 font-mono text-[11px]">
                    {client.last_seen ? new Date(client.last_seen).toLocaleTimeString() : 'Just now'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
};

export default ConnectedClientsTable;
