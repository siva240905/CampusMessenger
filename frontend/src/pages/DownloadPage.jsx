import React, { useState, useEffect } from 'react';
import { 
  Laptop, 
  Check, 
  Sparkles, 
  ArrowRight,
  Monitor,
  Zap
} from 'lucide-react';

export default function DownloadPage() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg text-white">
            <Monitor className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">CampusLink Student Client</h1>
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
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-10 space-y-8 flex flex-col justify-center">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-semibold text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Student Desktop Client</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">CampusLink Chrome Desktop App (PWA)</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Never miss a Google/Microsoft campus recruitment link, photo, video, or emergency notice. Receive floating popups and sound alerts directly on your desktop.
          </p>
        </div>

        {/* Featured PWA Card */}
        <div className="bg-slate-900/90 border-2 border-indigo-500/50 rounded-3xl p-8 shadow-2xl shadow-indigo-900/20 relative overflow-hidden max-w-2xl mx-auto w-full">
          <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
            <div className="p-4 bg-indigo-600/20 text-indigo-400 rounded-2xl border border-indigo-500/30 shrink-0">
              <Laptop className="w-12 h-12" />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-xl font-bold text-white">Standalone Desktop App</h3>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                  Zero Download Required
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Installs directly into Windows/Mac/Linux with 1-click. Creates a standalone app window with taskbar and desktop shortcuts.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3 mb-8 text-xs text-slate-300">
            <div className="flex items-center space-x-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>1-Click Browser Install (No .exe needed)</span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Desktop & Start Menu Shortcut</span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Real-Time Popup & Emergency Siren Alerts</span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Works on Windows, Mac, Linux & ChromeOS</span>
            </div>
          </div>

          <button
            onClick={handleInstallPWA}
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm py-4 rounded-2xl shadow-xl shadow-indigo-600/30 transition flex items-center justify-center space-x-2 transform active:scale-98"
          >
            <Laptop className="w-5 h-5" />
            <span>{isInstalled ? '✓ App Installed & Ready' : 'Install Chrome Desktop App Now'}</span>
          </button>
        </div>

        {/* Installation Instructions Step-by-Step */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4 max-w-2xl mx-auto w-full">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Zap className="w-4 h-4 text-indigo-400" />
            <span>How to Install in 3 Easy Steps:</span>
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="bg-indigo-600 text-white font-bold px-2.5 py-0.5 rounded-md text-[11px]">Step 1</span>
              <p className="text-slate-200 font-semibold">Click Install Button</p>
              <p className="text-slate-400">Click the <strong>Install Chrome Desktop App Now</strong> button above.</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="bg-indigo-600 text-white font-bold px-2.5 py-0.5 rounded-md text-[11px]">Step 2</span>
              <p className="text-slate-200 font-semibold">Confirm Installation</p>
              <p className="text-slate-400">When your browser asks, click <strong>"Install"</strong> in the prompt.</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="bg-indigo-600 text-white font-bold px-2.5 py-0.5 rounded-md text-[11px]">Step 3</span>
              <p className="text-slate-200 font-semibold">Launch App</p>
              <p className="text-slate-400">CampusLink will open as a standalone app window and add a shortcut to your desktop!</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
