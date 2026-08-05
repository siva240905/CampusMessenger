// CampusLink Chrome Extension Background Service Worker
let socket = null;
let defaultServerUrl = "wss://campuslink-backend.onrender.com/ws";

function formatWsUrl(raw) {
  if (!raw) return defaultServerUrl;
  let cleaned = raw.trim();
  if (cleaned.endsWith('/')) cleaned = cleaned.slice(0, -1);
  if (cleaned.endsWith('/ws')) cleaned = cleaned.slice(0, -3);
  if (cleaned.endsWith('/api/v1')) cleaned = cleaned.slice(0, -7);

  if (cleaned.startsWith('https://')) {
    cleaned = 'wss://' + cleaned.substring(8);
  } else if (cleaned.startsWith('http://')) {
    cleaned = 'ws://' + cleaned.substring(7);
  } else if (!cleaned.startsWith('ws://') && !cleaned.startsWith('wss://')) {
    cleaned = 'wss://' + cleaned;
  }

  return `${cleaned}/ws`;
}

function connectWebSocket() {
  if (socket) {
    try { socket.close(); } catch(e) {}
  }

  chrome.storage.local.get(["custom_ws_url"], (res) => {
    let targetUrl = formatWsUrl(res.custom_ws_url);
    const clientId = `chrome_ext_${Math.random().toString(36).substring(7)}`;
    const fullWsUrl = `${targetUrl}?client_id=${clientId}&computer_name=ChromeExtension&ip_address=127.0.0.1&os_info=ChromeExt_v3&client_version=1.0.0`;

    console.log("Connecting Extension WebSocket to:", fullWsUrl);

    try {
      socket = new WebSocket(fullWsUrl);

      socket.onopen = () => {
        console.log("⚡ CampusLink Chrome Extension connected successfully");
        chrome.storage.local.set({ is_connected: true });
      };

      socket.onmessage = (event) => {
        try {
          const packet = JSON.parse(event.data);
          if (packet.type === 'broadcast') {
            chrome.storage.local.get(["messages"], (data) => {
              const existing = data.messages || [];
              const updated = [packet, ...existing.slice(0, 49)];
              chrome.storage.local.set({ messages: updated, unread_count: (data.unread_count || 0) + 1 });
            });

            chrome.notifications.create(`broadcast_${Date.now()}`, {
              type: 'basic',
              iconUrl: 'icon.png',
              title: packet.is_emergency ? '🚨 EMERGENCY: ' + packet.title : '📢 ' + packet.title,
              message: packet.message,
              priority: packet.is_emergency ? 2 : 1,
              requireInteraction: packet.is_emergency || packet.priority === 'high'
            });

            if (socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify({
                type: 'ack',
                broadcast_id: packet.broadcast_id,
                client_id: clientId
              }));
            }
          }
        } catch (e) {
          console.error("Packet parse error:", e);
        }
      };

      socket.onclose = () => {
        chrome.storage.local.set({ is_connected: false });
      };

      socket.onerror = (err) => {
        chrome.storage.local.set({ is_connected: false });
        if (socket) socket.close();
      };
    } catch (err) {
      console.error("WebSocket init error:", err);
      chrome.storage.local.set({ is_connected: false });
    }
  });
}

// Reconnect message listener from popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "reconnect") {
    connectWebSocket();
    sendResponse({ status: "reconnecting" });
  }
});

// Alarm for Keep Alive and Auto-Reconnect every 30 seconds
chrome.alarms.create("keepAlive", { periodInMinutes: 0.5 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "keepAlive") {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      connectWebSocket();
    } else {
      socket.send(JSON.stringify({ type: "ping" }));
    }
  }
});

connectWebSocket();
