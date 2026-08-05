import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Puzzle, 
  Monitor, 
  Laptop, 
  Check, 
  Sparkles, 
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  Zap,
  BellRing
} from 'lucide-react';

export default function DownloadPage() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [copiedStep, setCopiedStep] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPWA = async () => {
    if (!installPrompt) {
      alert("To install as Chrome App: Click Chrome 3 dots (⋮) -> Save and Share -> Install CampusLink");
      return;
    }
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setInstallPrompt(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg text-white">
            <Monitor className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">CampusLink Student Downloads</h1>
            <p className="text-xs text-slate-400">Get Instant Campus Notices & Emergency Alerts on Desktop</p>
          </div>
        </div>
        <a 
          href="/student"
          className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-slate-700 px-4 py-2 rounded-xl transition flex items-center space-x-1.5"
        >
          <span>Open Web App</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-10 space-y-10">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-semibold text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sub-Second Student Announcement Notifier</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Choose Your Student Client App</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Never miss a Google/Microsoft campus recruitment link or emergency notice. Receive floating popups and sound alerts directly on your computer.
          </p>
        </div>

        {/* 3 Download Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1: Chrome Extension */}
          <div className="bg-slate-900/90 border border-indigo-500/40 rounded-2xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-indigo-500 transition">
            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
              Popular
            </div>
            <div>
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl w-fit mb-4 border border-indigo-500/20">
                <Puzzle className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Chrome Extension</h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Add directly to your Chrome toolbar. Get rich desktop notifications even when the tab is closed.
              </p>
              <ul className="text-xs text-slate-300 space-y-2 mb-6">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Chrome Toolbar Integration</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Rich System Notifications</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Works on Chrome & Edge</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <a
                href="https://github.com/siva240905/CampusMessenger/archive/refs/heads/main.zip"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Chrome Extension</span>
              </a>
              <p className="text-[10px] text-slate-500 text-center">Open <code className="text-indigo-300">chrome://extensions</code> &rarr; Developer mode &rarr; Load unpacked</p>
            </div>
          </div>

          {/* Card 2: Chrome Web App (PWA) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl hover:border-slate-700 transition">
            <div>
              <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl w-fit mb-4 border border-sky-500/20">
                <Laptop className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Chrome Desktop App (PWA)</h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                1-Click installation directly from your browser into a standalone Windows app window.
              </p>
              <ul className="text-xs text-slate-300 space-y-2 mb-6">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>No Download / 1-Click Install</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Desktop & Taskbar Shortcut</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Built-in Sound Notifier</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleInstallPWA}
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs py-3 rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
            >
              <Laptop className="w-4 h-4" />
              <span>{isInstalled ? '✓ App Installed' : 'Install Chrome App'}</span>
            </button>
          </div>

          {/* Card 3: Python Native App */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl hover:border-slate-700 transition">
            <div>
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit mb-4 border border-emerald-500/20">
                <Monitor className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Python Windows App (.exe)</h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Native Windows background process with glassmorphism popups and sound sirens.
              </p>
              <ul className="text-xs text-slate-300 space-y-2 mb-6">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Auto Startup with Windows</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Runs Silently in Background</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Emergency Siren Audio Synth</span>
                </li>
              </ul>
            </div>

            <a
              href="https://github.com/siva240905/CampusMessenger/tree/main/desktop-client/python"
              target="_blank"
              rel="noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Python Client</span>
            </a>
          </div>
        </div>

        {/* Installation Instructions Step-by-Step */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <Puzzle className="w-5 h-5 text-indigo-400" />
            <span>How to Load Chrome Extension in 3 Steps:</span>
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="bg-indigo-600 text-white font-bold px-2.5 py-0.5 rounded-md text-[11px]">Step 1</span>
              <p className="text-slate-200 font-semibold">Download & Extract</p>
              <p className="text-slate-400">Download the repository ZIP and extract the <code className="text-indigo-300 font-mono">chrome-extension</code> folder to your computer.</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="bg-indigo-600 text-white font-bold px-2.5 py-0.5 rounded-md text-[11px]">Step 2</span>
              <p className="text-slate-200 font-semibold">Open Extensions Page</p>
              <p className="text-slate-400">In Google Chrome, navigate to <code className="text-indigo-300 font-mono">chrome://extensions</code> and toggle ON <strong>Developer Mode</strong> (top right).</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="bg-indigo-600 text-white font-bold px-2.5 py-0.5 rounded-md text-[11px]">Step 3</span>
              <p className="text-slate-200 font-semibold">Load Unpacked Extension</p>
              <p className="text-slate-400">Click <strong>Load unpacked</strong> and select the <code className="text-indigo-300 font-mono">chrome-extension</code> folder. CampusLink is ready!</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
