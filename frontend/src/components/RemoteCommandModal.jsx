import React, { useState } from 'react';
import GlassCard from './GlassCard';
import {
  Zap,
  Globe,
  FileText,
  Chrome,
  Lock,
  RotateCcw,
  Power,
  X,
  Send,
  CheckCircle2,
  AlertTriangle,
  Monitor
} from 'lucide-react';
import API from '../utils/api';

const RemoteCommandModal = ({ isOpen, onClose, selectedClient = null, onCommandSent }) => {
  const [activeTab, setActiveTab] = useState('url'); // 'url', 'power'
  const [url, setUrl] = useState('');
  const [commandType, setCommandType] = useState('open_url'); // 'open_url', 'open_pdf', 'open_chrome', 'lock', 'restart', 'shutdown'
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (!isOpen) return null;

  const handleSend = async (typeOverride = null) => {
    const cmd = typeOverride || commandType;
    if (['open_url', 'open_pdf', 'open_chrome'].includes(cmd) && !url.trim() && cmd !== 'open_chrome') {
      setFeedback({ type: 'error', message: 'Please enter a valid URL' });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const payload = {
        command_type: cmd,
        url: url.trim() || undefined,
        target_client_ids: selectedClient ? [selectedClient.client_id] : ['all'],
        reason: reason.trim() || undefined
      };

      const res = await API.post('/commands/remote', payload);


      setFeedback({
        type: 'success',
        message: `Command '${cmd.toUpperCase()}' dispatched to ${res.data.delivered_count} connected student PC(s)!`
      });

      if (onCommandSent) onCommandSent(res.data);
      
      setTimeout(() => {
        setFeedback(null);
        if (cmd === 'open_url' || cmd === 'open_pdf') {
          onClose();
        }
      }, 2000);
    } catch (err) {
      console.error(err);
      setFeedback({
        type: 'error',
        message: err.response?.data?.detail || 'Failed to dispatch remote command.'
      });
    } finally {
      setLoading(false);
    }
  };

  const setPresetUrl = (presetUrl) => {
    setUrl(presetUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Remote Command Console</h3>
              <p className="text-xs text-slate-400">
                {selectedClient
                  ? `Targeting single workstation: ${selectedClient.computer_name} (${selectedClient.ip_address})`
                  : 'Broadcasting instant action to all connected Lab PCs'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {feedback && (
            <div
              className={`p-3.5 rounded-xl text-xs font-medium flex items-center space-x-2 border ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Preset Actions Grid */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Quick Action Presets
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  setCommandType('open_url');
                  setActiveTab('url');
                }}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1.5 transition-all text-xs font-semibold ${
                  commandType === 'open_url'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                    : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <Globe className="w-5 h-5 text-indigo-400" />
                <span>Open Website</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCommandType('open_chrome');
                  setActiveTab('url');
                }}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1.5 transition-all text-xs font-semibold ${
                  commandType === 'open_chrome'
                    ? 'bg-amber-600/20 border-amber-500 text-amber-300'
                    : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <Chrome className="w-5 h-5 text-amber-400" />
                <span>Launch Chrome</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCommandType('lock');
                  handleSend('lock');
                }}
                className="p-3 rounded-xl border bg-slate-800/40 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800 flex flex-col items-center justify-center space-y-1.5 transition-all text-xs font-semibold"
              >
                <Lock className="w-5 h-5 text-blue-400" />
                <span>Lock Screens</span>
              </button>
            </div>
          </div>

          {/* URL Input Form */}
          {activeTab === 'url' && (
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Website / Drive Registration Link
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://tcs.com/careers/registration"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white"
                />
              </div>

              {/* Placement Link Quick Chips */}
              <div className="flex flex-wrap gap-2">
                <span className="text-[11px] text-slate-400 self-center">Quick links:</span>
                <button
                  type="button"
                  onClick={() => setPresetUrl('https://onlineservices.tcs.co.in/careers')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-indigo-300 border border-slate-700 transition-all"
                >
                  TCS Drive
                </button>
                <button
                  type="button"
                  onClick={() => setPresetUrl('https://careers.wipro.com')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-indigo-300 border border-slate-700 transition-all"
                >
                  Wipro Drive
                </button>
                <button
                  type="button"
                  onClick={() => setPresetUrl('https://forms.google.com')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-indigo-300 border border-slate-700 transition-all"
                >
                  Google Form
                </button>
              </div>
            </div>
          )}

          {/* Power Controls Section */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              System Control Options
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to RESTART connected lab PCs?')) {
                    handleSend('restart');
                  }
                }}
                className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 flex items-center justify-center space-x-2 text-xs font-bold transition-all"
              >
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span>Restart Connected PCs</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to SHUTDOWN connected lab PCs?')) {
                    handleSend('shutdown');
                  }
                }}
                className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 flex items-center justify-center space-x-2 text-xs font-bold transition-all"
              >
                <Power className="w-4 h-4 text-rose-400" />
                <span>Shutdown Connected PCs</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={loading}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? 'Dispatching...' : 'Execute Remote Command'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoteCommandModal;
