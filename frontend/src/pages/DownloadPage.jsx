import React, { useState, useEffect } from 'react';
import { 
  Laptop, 
  Puzzle,
  Check, 
  Sparkles, 
  ArrowRight,
  Monitor,
  Zap,
  Download,
  Copy
} from 'lucide-react';

export default function DownloadPage() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

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
      alert("To install as Chrome App: Click Chrome 3 dots (⋮) -> Save and Share -> Install CampusLink (or click the ⊕ icon in your address bar)");
      return;
    }
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setInstallPrompt(null);
    }
  };

  const copyExtensionsUrl = () => {
    navigator.clipboard.writeText('chrome://extensions');
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
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
            <h1 className="text-lg font-bold text-white tracking-wide">CampusLink Student Clients</h1>
            <p className="text-xs text-slate-400">Get Instant Campus Notices & Emergency Alerts on Desktop</p>
          </div>
        </div>
        <a 
          href="/student"
          className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-slate-700 px-4 py-2 rounded-xl transition flex items-center space-x-1.5"
        >
          <span>Open Student Portal</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-10 space-y-10">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-semibold text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Student Desktop Clients</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Choose Your Student Client App</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Never miss a Google/Microsoft campus recruitment link, photo, video, or emergency notice. Receive floating popups and sound alerts directly on your desktop.
          </p>
        </div>

        {/* 2 Download Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Card 1: Chrome Extension */}
          <div className="bg-slate-900/90 border-2 border-indigo-500/50 rounded-3xl p-7 flex flex-col justify-between shadow-2xl shadow-indigo-900/20 relative overflow-hidden group hover:border-indigo-400 transition">
            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-3.5 py-1 rounded-bl-xl uppercase tracking-wider">
              Toolbar App
            </div>
            <div>
              <div className="p-3.5 bg-indigo-500/10 text-indigo-400 rounded-2xl w-fit mb-4 border border-indigo-500/20">
                <Puzzle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Chrome Extension</h3>
              <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                Add directly to your Chrome browser toolbar. Pre-configured to auto-connect to live campus broadcasts.
              </p>
              <ul className="text-xs text-slate-300 space-y-2.5 mb-6">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Toolbar Notifier & Glass UI</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Inline Photos, Videos & Doc Downloads</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Pre-configured Live Cloud Connection</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Works on Chrome, Edge & Brave</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <a
                href="/chrome-extension.zip"
                download="chrome-extension.zip"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3.5 rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Extension (.zip)</span>
              </a>

              <button
                onClick={copyExtensionsUrl}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[11px] py-2 rounded-lg transition flex items-center justify-center space-x-1.5 border border-slate-700"
              >
                <Copy className="w-3.5 h-3.5 text-indigo-400" />
                <span>{copiedUrl ? '✓ Copied chrome://extensions' : 'Copy chrome://extensions URL'}</span>
              </button>
            </div>
          </div>

          {/* Card 2: Chrome Web App (PWA) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-7 flex flex-col justify-between shadow-2xl hover:border-slate-700 transition">
            <div>
              <div className="p-3.5 bg-sky-500/10 text-sky-400 rounded-2xl w-fit mb-4 border border-sky-500/20">
                <Laptop className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Chrome Desktop App (PWA)</h3>
              <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                1-Click installation directly from your browser into a standalone Windows app window.
              </p>
              <ul className="text-xs text-slate-300 space-y-2.5 mb-6">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>No Download / 1-Click Browser Install</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Desktop & Start Menu Shortcut</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Built-in Emergency Siren Notifier</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Works on Windows, Mac, Linux & ChromeOS</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleInstallPWA}
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs py-3.5 rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
            >
              <Laptop className="w-4 h-4" />
              <span>{isInstalled ? '✓ App Installed' : 'Install Chrome Desktop App'}</span>
            </button>
          </div>
        </div>

        {/* Super Easy Extension Setup Guide */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Zap className="w-4 h-4 text-indigo-400" />
              <span>How to Setup Chrome Extension in 3 Easy Steps:</span>
            </h3>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              ⚡ Pre-Configured (0 Setup Needed)
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="bg-indigo-600 text-white font-bold px-2.5 py-0.5 rounded-md text-[11px]">Step 1</span>
              <p className="text-slate-200 font-semibold">1-Click Download & Extract</p>
              <p className="text-slate-400">Click <strong>Download Extension (.zip)</strong> above and extract the folder on your PC.</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="bg-indigo-600 text-white font-bold px-2.5 py-0.5 rounded-md text-[11px]">Step 2</span>
              <p className="text-slate-200 font-semibold">Open Chrome Extensions</p>
              <p className="text-slate-400">Open <code className="text-indigo-300 font-mono">chrome://extensions</code> in browser & toggle ON <strong>Developer Mode</strong> (top right).</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="bg-indigo-600 text-white font-bold px-2.5 py-0.5 rounded-md text-[11px]">Step 3</span>
              <p className="text-slate-200 font-semibold">Load Unpacked</p>
              <p className="text-slate-400">Click <strong>Load unpacked</strong> & select the extracted folder. It connects to live notices automatically!</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
