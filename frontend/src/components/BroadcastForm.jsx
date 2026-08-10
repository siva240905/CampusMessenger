import React, { useState } from 'react';
import GlassCard from './GlassCard';
import API from '../utils/api';
import { Send, Link as LinkIcon, Paperclip, Image as ImageIcon, AlertTriangle, CheckCircle2, QrCode, Sparkles, X } from 'lucide-react';

const BroadcastForm = ({ onBroadcastSent, openQRModal }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [url, setUrl] = useState('');
  const [priority, setPriority] = useState('normal');
  const [isEmergency, setIsEmergency] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  
  const [fileDetails, setFileDetails] = useState(null);
  const [imageDetails, setImageDetails] = useState(null);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await API.post('/upload/file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFileDetails(res.data);
      setSelectedFile(file);
    } catch (err) {
      setErrorMsg('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await API.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImageDetails(res.data);
      setSelectedImage(file);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to upload photo/video');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setErrorMsg('Please enter both Title and Message content.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        title: title.trim(),
        message: message.trim(),
        url: url.trim() || null,
        file_path: fileDetails?.file_path || null,
        file_name: fileDetails?.file_name || null,
        file_size: fileDetails?.file_size || null,
        image_path: imageDetails?.image_path || null,
        priority: isEmergency ? 'emergency' : priority,
        is_emergency: isEmergency
      };

      const res = await API.post('/broadcast', payload);
      setSuccessMsg(`🚀 Broadcast sent! Delivered instantly to ${res.data.delivery_count || 0} online computers.`);
      
      // Clear form
      setTitle('');
      setMessage('');
      setUrl('');
      setPriority('normal');
      setIsEmergency(false);
      setSelectedFile(null);
      setSelectedImage(null);
      setFileDetails(null);
      setImageDetails(null);

      if (onBroadcastSent) onBroadcastSent();
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to send broadcast');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="border-indigo-500/30">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Instant LAN Broadcast Center
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h2>
            <p className="text-xs text-slate-400">Pushes announcement to all connected student computers in &lt;1 second</p>
          </div>
        </div>

        {/* Emergency Alert Switch */}
        <label className={`cursor-pointer flex items-center space-x-2 px-3 py-1.5 rounded-xl border transition-all ${
          isEmergency ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-lg shadow-rose-500/20' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
        }`}>
          <AlertTriangle className={`w-4 h-4 ${isEmergency ? 'animate-bounce text-rose-400' : ''}`} />
          <span className="text-xs font-semibold uppercase tracking-wider">Emergency Alert</span>
          <input
            type="checkbox"
            checked={isEmergency}
            onChange={(e) => setIsEmergency(e.target.checked)}
            className="sr-only"
          />
        </label>
      </div>

      {successMsg && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Announcement Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Google Placement Registration Link / Emergency Notice"
            className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
            required
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Message Description *</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Type notice details for student desktop clients..."
            className="w-full px-4 py-2.5 rounded-xl glass-input text-sm resize-none"
            required
          />
        </div>

        {/* URL Link + QR Code Button */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Placement Link / Registration URL</label>
          <div className="relative flex items-center">
            <LinkIcon className="w-4 h-4 absolute left-3 text-slate-400" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://placement.college.edu/register"
              className="w-full pl-9 pr-24 py-2.5 rounded-xl glass-input text-sm font-mono"
            />
            {url && (
              <button
                type="button"
                onClick={() => openQRModal(url)}
                className="absolute right-2 px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1"
              >
                <QrCode className="w-3.5 h-3.5" /> QR Code
              </button>
            )}
          </div>
        </div>

        {/* File & Image Upload Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Document File Attachment */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Attach Document (PDF, DOCX)</label>
            {fileDetails ? (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-indigo-500/30 text-xs text-indigo-300">
                <span className="truncate max-w-[200px]">{fileDetails.file_name}</span>
                <button type="button" onClick={() => { setFileDetails(null); setSelectedFile(null); }} className="text-slate-400 hover:text-rose-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center space-x-2 p-2.5 rounded-xl glass-input cursor-pointer hover:border-indigo-500 transition-all text-xs text-slate-400">
                <Paperclip className="w-4 h-4 text-indigo-400" />
                <span>{uploading ? 'Uploading...' : 'Choose File'}</span>
                <input type="file" accept=".pdf,.docx,.doc,.zip,.txt" onChange={handleFileUpload} className="hidden" />
              </label>
            )}
          </div>

          {/* Image / Video Media Attachment */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Attach Photo / Video / Banner</label>
            {imageDetails ? (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-indigo-500/30 text-xs text-indigo-300">
                <span className="truncate max-w-[200px] flex items-center gap-1.5">
                  {imageDetails.is_video ? '🎬' : '🖼️'} {imageDetails.file_name}
                </span>
                <button type="button" onClick={() => { setImageDetails(null); setSelectedImage(null); }} className="text-slate-400 hover:text-rose-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center space-x-2 p-2.5 rounded-xl glass-input cursor-pointer hover:border-indigo-500 transition-all text-xs text-slate-400">
                <ImageIcon className="w-4 h-4 text-indigo-400" />
                <span>{uploading ? 'Uploading...' : 'Choose Photo / Video'}</span>
                <input 
                  type="file" 
                  accept="image/*,video/*,.mp4,.webm,.ogg,.mov,.avi,.mkv" 
                  onChange={handleImageUpload} 
                  className="hidden" 
                />
              </label>
            )}
          </div>
        </div>

        {/* Priority Selector & Submit */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Priority:</span>
            {['normal', 'high', 'emergency'].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setPriority(p);
                  if (p === 'emergency') setIsEmergency(true);
                  else setIsEmergency(false);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                  (isEmergency && p === 'emergency') || (!isEmergency && priority === p)
                    ? p === 'emergency'
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/30'
                      : p === 'high'
                      ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/30'
                      : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold shadow-xl shadow-indigo-500/25 flex items-center justify-center space-x-2 disabled:opacity-50 transition-all"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>BroadCast Instantly</span>
              </>
            )}
          </button>
        </div>
      </form>
    </GlassCard>
  );
};

export default BroadcastForm;
