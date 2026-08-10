import React, { useState } from 'react';
import GlassCard from './GlassCard';
import { FileText, Search, Trash2, ExternalLink, Download, Image as ImageIcon, AlertTriangle, QrCode } from 'lucide-react';
import API from '../utils/api';

const MessageHistoryTable = ({ messages, onDeleteMessage, openQRModal }) => {
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const filtered = messages.filter((m) =>
    (m.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.message || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (broadcastId) => {
    if (!window.confirm('Are you sure you want to delete this broadcast message?')) return;
    setDeletingId(broadcastId);
    try {
      await API.delete(`/messages/${broadcastId}`);
      if (onDeleteMessage) onDeleteMessage(broadcastId);
    } catch (err) {
      alert('Failed to delete message');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <GlassCard className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Broadcast Message History</h3>
            <p className="text-xs text-slate-400">All past announcements, shared links, and uploaded files</p>
          </div>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search history..."
            className="pl-9 pr-4 py-1.5 text-xs rounded-xl glass-input w-full sm:w-64"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-slate-500 italic text-xs">
            No broadcast history found.
          </div>
        ) : (
          filtered.map((msg) => (
            <div
              key={msg.broadcast_id || msg.id}
              className={`p-4 rounded-xl border transition-all ${
                msg.is_emergency
                  ? 'bg-rose-950/30 border-rose-500/40'
                  : msg.priority === 'high'
                  ? 'bg-amber-950/20 border-amber-500/30'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {msg.is_emergency && <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />}
                    <h4 className="font-bold text-white text-sm">{msg.title}</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                      msg.priority === 'emergency' ? 'bg-rose-500/20 text-rose-300' :
                      msg.priority === 'high' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {msg.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{msg.message}</p>
                </div>

                <button
                  onClick={() => handleDelete(msg.broadcast_id)}
                  disabled={deletingId === msg.broadcast_id}
                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                  title="Delete message"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Attachments & Action Row */}
              <div className="mt-3 pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-3">
                  {msg.url && (
                    <div className="flex items-center space-x-1 text-indigo-400">
                      <a href={msg.url} target="_blank" rel="noreferrer" className="hover:underline font-mono flex items-center gap-1">
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Link</span>
                      </a>
                      <button onClick={() => openQRModal(msg.url)} className="text-slate-400 hover:text-indigo-300 ml-1">
                        <QrCode className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {msg.file_path && (
                    <a href={msg.file_path.startsWith('http') ? msg.file_path : (import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL.replace(/\/api\/v1$/, '')}${msg.file_path}` : msg.file_path)} download className="flex items-center space-x-1 text-emerald-400 hover:underline font-mono">
                      <Download className="w-3.5 h-3.5" />
                      <span>{msg.file_name || 'Download File'}</span>
                    </a>
                  )}

                  {msg.image_path && (() => {
                    const isVid = /\.(mp4|webm|ogg|mov|avi|mkv|m4v)($|\?)/i.test(msg.image_path);
                    const fullMediaUrl = msg.image_path.startsWith('http') ? msg.image_path : (import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL.replace(/\/api\/v1$/, '')}${msg.image_path}` : msg.image_path);
                    return (
                      <a href={fullMediaUrl} target="_blank" rel="noreferrer" className="flex items-center space-x-1 text-purple-400 hover:underline font-mono">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>{isVid ? 'View Video' : 'View Photo'}</span>
                      </a>
                    );
                  })()}
                </div>

                <div className="text-[11px] text-slate-500 font-mono flex items-center space-x-3">
                  <span>Delivered: {msg.delivery_count || 0} Clients</span>
                  <span>•</span>
                  <span>{new Date(msg.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
};

export default MessageHistoryTable;
