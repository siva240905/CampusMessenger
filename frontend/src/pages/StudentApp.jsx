import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  ExternalLink, 
  Copy, 
  Check, 
  Bell, 
  Wifi, 
  WifiOff, 
  Monitor, 
  Sparkles, 
  AlertTriangle, 
  Radio, 
  Clock, 
  CheckCircle,
  Laptop
} from 'lucide-react';

// Web Audio API Synthesizer Chime
const playChime = (isEmergency = false) => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (isEmergency) {
      // Emergency Siren
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } else {
      // Standard Notice Chime (Two-tone)
      const now = audioCtx.currentTime;
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc2.frequency.setValueAtTime(659.25, now + 0.15); // E5

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);

      osc1.start(now);
      osc1.stop(now + 0.15);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.5);
    }
  } catch (e) {
    console.error("Audio playback error:", e);
  }
};

const resolveUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) return path;
  let base = import.meta.env.VITE_API_BASE_URL || '';
  
  if (!base && typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.includes('onrender.com') || host.includes('vercel.app') || host.includes('netlify.app')) {
      const backendHost = host.replace('-frontend.', '-backend.').replace('frontend', 'backend');
      base = `${window.location.protocol}//${backendHost}`;
    } else {
      base = `${window.location.protocol}//${host}:8000`;
    }
  }

  if (base.endsWith('/')) base = base.slice(0, -1);
  if (base.endsWith('/api/v1')) base = base.slice(0, -7);

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
};

const triggerDownload = (url, defaultName = 'download') => {
  if (!url) return;
  const a = document.createElement('a');
  a.href = url;
  a.download = defaultName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

export default function StudentApp() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('campuslink_student_messages');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeToast, setActiveToast] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [notifPermission, setNotifPermission] = useState(Notification?.permission || 'default');
  const [copiedId, setCopiedId] = useState(null);
  const wsRef = useRef(null);

  // Listen for PWA Install Prompt
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Save messages to LocalStorage
  useEffect(() => {
    localStorage.setItem('campuslink_student_messages', JSON.stringify(messages));
  }, [messages]);

  // Request Notification Permissions
  const requestNotifPermission = async () => {
    if ('Notification' in window) {
      const res = await Notification.requestPermission();
      setNotifPermission(res);
    }
  };

  // Trigger PWA Desktop Installation
  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setInstallPrompt(null);
    }
  };

  // Establish WebSocket Connection
  useEffect(() => {
    let wsBaseUrl;
    const apiBase = import.meta.env.VITE_API_BASE_URL;
    if (apiBase) {
      try {
        const urlObj = new URL(apiBase.startsWith('http') ? apiBase : `https://${apiBase}`);
        const protocol = urlObj.protocol === 'https:' ? 'wss:' : 'ws:';
        wsBaseUrl = `${protocol}//${urlObj.host}/ws`;
      } catch (e) {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        wsBaseUrl = `${protocol}//${window.location.hostname}:8000/ws`;
      }
    } else {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const hostname = window.location.hostname || '127.0.0.1';
      const port = (window.location.port === '3000' || window.location.port === '5173') ? ':8000' : (window.location.port ? `:${window.location.port}` : '');
      wsBaseUrl = `${protocol}//${hostname}${port}/ws`;
    }

    const clientId = `chrome_pwa_${Math.random().toString(36).substring(7)}`;
    const fullWsUrl = `${wsBaseUrl}?client_id=${clientId}&computer_name=ChromeDesktop&ip_address=127.0.0.1&os_info=${encodeURIComponent(navigator.userAgent)}&client_version=1.0.0`;

    function connect() {
      const socket = new WebSocket(fullWsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
      };

      socket.onmessage = (event) => {
        try {
          const packet = JSON.parse(event.data);
          if (packet.type === 'broadcast') {
            const newMsg = {
              id: packet.broadcast_id || Date.now(),
              title: packet.title,
              message: packet.message,
              url: packet.url,
              file: packet.file,
              file_name: packet.file_name,
              image: packet.image,
              is_emergency: packet.is_emergency,
              priority: packet.priority || 'normal',
              timestamp: new Date().toLocaleTimeString()
            };

            setMessages((prev) => [newMsg, ...prev]);
            setActiveToast(newMsg);

            // Play sound chime
            playChime(packet.is_emergency);

            // Show native OS notification if allowed
            if (Notification?.permission === 'granted') {
              new Notification(packet.title || 'Campus Announcement', {
                body: packet.message,
                icon: '/favicon.ico',
                tag: 'campuslink-broadcast',
                requireInteraction: true
              });
            }

            // Send Acknowledgment
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify({
                type: 'ack',
                broadcast_id: packet.broadcast_id,
                client_id: clientId
              }));
            }
          }
        } catch (err) {
          console.error("WebSocket message parsing error:", err);
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
        setTimeout(connect, 3000);
      };

      socket.onerror = () => {
        socket.close();
      };
    }

    connect();

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const copyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20 text-white">
            <Monitor className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-white tracking-wide">CampusLink</h1>
              <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs px-2 py-0.5 rounded-full font-medium">
                Chrome Desktop App
              </span>
            </div>
            <p className="text-xs text-slate-400">Student LAN Communication Client</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Connection Status Badge */}
          <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
            isConnected 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
              : 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
          }`}>
            {isConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isConnected ? 'Online (LAN Connected)' : 'Connecting to Server...'}</span>
          </div>

          {/* Desktop Notification Request */}
          {notifPermission !== 'granted' && (
            <button
              onClick={requestNotifPermission}
              className="flex items-center space-x-1.5 text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-lg transition"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Enable Desktop Alerts</span>
            </button>
          )}

          {/* 🧩 Chrome Extension & Download Page Button */}
          <a
            href="/download"
            className="flex items-center space-x-1.5 text-xs bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-lg transition font-medium"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Get Extension / Apps</span>
          </a>

          {/* 📥 Install Chrome Desktop App Button */}
          {installPrompt && !isInstalled && (
            <button
              onClick={handleInstallClick}
              className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-lg shadow-indigo-500/25 transition transform active:scale-95"
            >
              <Laptop className="w-4 h-4" />
              <span>Install Chrome App</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6">
        {/* Chrome App Installation Banner */}
        {installPrompt && !isInstalled && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border border-indigo-500/30 shadow-xl flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Install CampusLink on Desktop</h2>
                <p className="text-xs text-slate-300">Run as a standalone Chrome Desktop App with instant LAN popups and sound alerts.</p>
              </div>
            </div>
            <button
              onClick={handleInstallClick}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition"
            >
              📥 Install Chrome Desktop App
            </button>
          </div>
        )}

        {/* Broadcast Feed Title */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Radio className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Live LAN Announcements</h2>
          </div>
          <span className="text-xs text-slate-400">{messages.length} Announcements Received</span>
        </div>

        {/* Messages List */}
        {messages.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800">
            <Radio className="w-12 h-12 text-slate-600 mx-auto mb-3 animate-pulse" />
            <h3 className="text-base font-semibold text-slate-300">Waiting for Faculty Broadcasts</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Announcements, placement links, document PDFs, and emergency alerts will pop up here in sub-seconds.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`p-5 rounded-2xl border transition-all ${
                  msg.is_emergency 
                    ? 'bg-rose-950/30 border-rose-500/50 shadow-lg shadow-rose-950/50' 
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    msg.is_emergency 
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}>
                    {msg.is_emergency ? '🚨 EMERGENCY ALERT' : `[ ${msg.priority.toUpperCase()} PRIORITY ]`}
                  </span>
                  <div className="flex items-center space-x-1 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{msg.timestamp}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mb-1.5">{msg.title}</h3>
                <p className="text-sm text-slate-300 mb-4 whitespace-pre-line leading-relaxed select-text">{msg.message}</p>

                {/* Media Preview (Photo or Video) */}
                {msg.image && (() => {
                  const mediaUrl = resolveUrl(msg.image);
                  const isVideo = msg.image.startsWith('data:video') || /\.(mp4|webm|ogg|mov|avi|mkv|m4v)($|\?)/i.test(msg.image);

                  return (
                    <div className="mb-4 rounded-xl overflow-hidden border border-slate-800 bg-slate-950/80">
                      {isVideo ? (
                        <video controls src={mediaUrl} className="w-full max-h-72 object-contain bg-black" />
                      ) : (
                        <img src={mediaUrl} alt={msg.title} className="w-full max-h-80 object-contain bg-slate-950" />
                      )}
                    </div>
                  );
                })()}

                {/* Display Selectable URL Box */}
                {msg.url && (
                  <div className="mb-4 bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-400 uppercase">URL:</span>
                    <input 
                      type="text" 
                      readOnly 
                      value={msg.url}
                      onClick={(e) => e.target.select()}
                      className="bg-transparent text-indigo-400 font-mono text-xs flex-1 outline-none select-all"
                    />
                  </div>
                )}

                {/* Action Buttons Row */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
                  {msg.url && (
                    <>
                      <a
                        href={msg.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Link</span>
                      </a>
                      <button
                        onClick={() => copyText(msg.url, `url_${msg.id}`)}
                        className="inline-flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition"
                      >
                        {copiedId === `url_${msg.id}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === `url_${msg.id}` ? '✓ Copied Link' : '📋 Copy Link'}</span>
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => copyText(`${msg.title}\n${msg.message}${msg.url ? '\n' + msg.url : ''}`, `msg_${msg.id}`)}
                    className="inline-flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs px-3.5 py-2 rounded-xl transition"
                  >
                    {copiedId === `msg_${msg.id}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === `msg_${msg.id}` ? '✓ Copied Text' : '📝 Copy Text'}</span>
                  </button>

                  {msg.image && (() => {
                    const mediaUrl = resolveUrl(msg.image);
                    const isVideo = msg.image.startsWith('data:video') || /\.(mp4|webm|ogg|mov|avi|mkv|m4v)($|\?)/i.test(msg.image);
                    const ext = isVideo ? '.mp4' : '.png';
                    const fileName = `campus_media_${msg.id}${ext}`;
                    return (
                      <>
                        <a
                          href={mediaUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition"
                        >
                          <span>{isVideo ? '🎬 View Video' : '🖼️ View Photo'}</span>
                        </a>
                        <button
                          onClick={() => triggerDownload(mediaUrl, fileName)}
                          className="inline-flex items-center space-x-1.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition shadow-md shadow-teal-900/30"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{isVideo ? '📥 Download Video' : '📥 Download Photo'}</span>
                        </button>
                      </>
                    );
                  })()}

                  {msg.file && (
                    <a
                      href={resolveUrl(msg.file)}
                      download={msg.file_name || 'download'}
                      className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download File</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Glassmorphic Desktop Toast Window */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 max-w-md w-full z-50 animate-bounce-in">
          <div className={`p-5 rounded-2xl border-2 shadow-2xl backdrop-blur-xl ${
            activeToast.is_emergency
              ? 'bg-rose-950/95 border-rose-500 text-white shadow-rose-900/50'
              : 'bg-slate-900/95 border-indigo-500 text-white shadow-indigo-900/50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {activeToast.is_emergency ? (
                  <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
                ) : (
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                )}
                <span className="text-xs font-bold uppercase tracking-wider">
                  {activeToast.is_emergency ? '🚨 EMERGENCY ANNOUNCEMENT' : '📢 NEW BROADCAST'}
                </span>
              </div>
              <button
                onClick={() => setActiveToast(null)}
                className="text-slate-400 hover:text-white text-xs font-bold bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded-lg"
              >
                ✕ Close
              </button>
            </div>

            <h4 className="text-base font-bold text-white mb-1">{activeToast.title}</h4>
            <p className="text-xs text-slate-200 mb-3 leading-relaxed select-text">{activeToast.message}</p>

            {activeToast.image && (() => {
              const mediaUrl = resolveUrl(activeToast.image);
              const isVideo = activeToast.image.startsWith('data:video') || /\.(mp4|webm|ogg|mov|avi|mkv|m4v)($|\?)/i.test(activeToast.image);

              return (
                <div className="mb-3 rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
                  {isVideo ? (
                    <video controls autoPlay loop muted src={mediaUrl} className="w-full max-h-48 object-contain bg-black" />
                  ) : (
                    <img src={mediaUrl} alt={activeToast.title} className="w-full max-h-48 object-contain" />
                  )}
                </div>
              );
            })()}

            {activeToast.url && (
              <div className="mb-3 bg-slate-950/90 border border-slate-700 p-2 rounded-lg flex items-center space-x-2">
                <span className="text-[10px] font-bold text-slate-400">URL:</span>
                <input 
                  type="text" 
                  readOnly 
                  value={activeToast.url}
                  onClick={(e) => e.target.select()}
                  className="bg-transparent text-indigo-300 font-mono text-xs flex-1 outline-none select-all"
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              {activeToast.url && (
                <>
                  <a
                    href={activeToast.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 text-center bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 rounded-xl"
                  >
                    🔗 Open Link
                  </a>
                  <button
                    onClick={() => copyText(activeToast.url, `toast_url`)}
                    className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-3 py-2 rounded-xl"
                  >
                    {copiedId === 'toast_url' ? '✓ Copied' : '📋 Copy Link'}
                  </button>
                </>
              )}
              {activeToast.image && (() => {
                const mediaUrl = resolveUrl(activeToast.image);
                const isVideo = activeToast.image.startsWith('data:video') || /\.(mp4|webm|ogg|mov|avi|mkv|m4v)($|\?)/i.test(activeToast.image);
                const ext = isVideo ? '.mp4' : '.png';
                return (
                  <button
                    onClick={() => triggerDownload(mediaUrl, `campus_media_${activeToast.id}${ext}`)}
                    className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isVideo ? '📥 Download Video' : '📥 Download Photo'}</span>
                  </button>
                );
              })()}

              {activeToast.file && (
                <a
                  href={resolveUrl(activeToast.file)}
                  download={activeToast.file_name || 'document'}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>📥 Download Doc</span>
                </a>
              )}

              <button
                onClick={() => copyText(`${activeToast.title}\n${activeToast.message}`, `toast_msg`)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs px-3 py-2 rounded-xl"
              >
                {copiedId === `toast_msg` ? '✓ Copied' : '📝 Copy Text'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
