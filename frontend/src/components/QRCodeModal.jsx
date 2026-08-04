import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, ExternalLink, Download } from 'lucide-react';

const QRCodeModal = ({ url, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!url) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-indigo-500/30 relative text-center space-y-5 animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div>
          <h3 className="font-bold text-white text-lg">Registration Link QR Code</h3>
          <p className="text-xs text-slate-400 mt-1">Scan with mobile to open link instantly on campus Wi-Fi</p>
        </div>

        <div className="p-4 bg-white rounded-2xl inline-block shadow-xl border border-slate-200">
          <QRCodeSVG value={url} size={200} level="H" includeMargin={true} />
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-indigo-300 break-all">
          {url}
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={copyToClipboard}
            className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
          </button>

          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
            title="Open in browser"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
