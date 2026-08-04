import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [onlineCount, setOnlineCount] = useState(0);
  const [liveClients, setLiveClients] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [recentBroadcasts, setRecentBroadcasts] = useState([]);
  const wsRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const hostname = window.location.hostname || '127.0.0.1';
    const wsUrl = `ws://${hostname}:8000/ws?role=faculty_dashboard`;

    const connectWS = () => {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        console.log("⚡ Connected to CampusLink Dashboard WebSocket");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'dashboard_init') {
            setOnlineCount(data.online_count || 0);
            setLiveClients(data.clients || []);
          } else if (data.type === 'client_connected') {
            setOnlineCount(data.online_count);
            setLiveClients((prev) => {
              const exists = prev.some(c => c.client_id === data.client_id);
              if (exists) return prev;
              return [...prev, data];
            });
          } else if (data.type === 'client_disconnected') {
            setOnlineCount(data.online_count);
            setLiveClients((prev) => prev.filter(c => c.client_id !== data.client_id));
          } else if (data.type === 'broadcast_sent') {
            setRecentBroadcasts((prev) => [data, ...prev.slice(0, 19)]);
          }
        } catch (e) {
          console.error("Error parsing WS packet:", e);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Auto-reconnect after 3 seconds
        setTimeout(connectWS, 3000);
      };

      ws.onerror = (err) => {
        console.error("WS Error:", err);
        ws.close();
      };
    };

    connectWS();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider value={{ isConnected, onlineCount, liveClients, recentBroadcasts }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
