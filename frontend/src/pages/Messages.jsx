import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import MessageHistoryTable from '../components/MessageHistoryTable';
import QRCodeModal from '../components/QRCodeModal';
import API from '../utils/api';

const Messages = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [messages, setMessages] = useState([]);
  const [qrUrl, setQrUrl] = useState(null);

  const fetchMessages = async () => {
    try {
      const res = await API.get('/messages?limit=100');
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 ${darkMode ? 'dark' : ''}`}>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Broadcast Message Logs & Archives</h1>
            <p className="text-xs text-slate-400 mt-1">Full searchable history of all announcements, registration links, PDFs, and media sent over LAN</p>
          </div>

          <MessageHistoryTable
            messages={messages}
            onDeleteMessage={fetchMessages}
            openQRModal={(url) => setQrUrl(url)}
          />
        </main>
      </div>

      {qrUrl && <QRCodeModal url={qrUrl} onClose={() => setQrUrl(null)} />}
    </div>
  );
};

export default Messages;
