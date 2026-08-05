// CampusLink Chrome Extension Background Service Worker
let socket = null;
let serverUrl = "wss://campuslink-backend.onrender.com/ws"; // Default live server

function connectWebSocket() {
  chrome.storage.local.get(["custom_ws_url"], (res) => {
    let targetUrl = res.custom_ws_url || serverUrl;
    const clientId = `chrome_ext_${Math.random().toString(36).substring(7)}`;
    const fullWsUrl = `${targetUrl}?client_id=${clientId}&computer_name=ChromeExtension&ip_address=127.0.0.1&os_info=ChromeExt_v3&client_version=1.0.0`;

    try {
      socket = new WebSocket(fullWsUrl);

      socket.onopen = () => {
        console.log("⚡ CampusLink Chrome Extension connected to WebSocket");
        chrome.storage.local.set({ is_connected: true });
      };

      socket.onmessage = (event) => {
        try {
          const packet = JSON.parse(event.data);
          if (packet.type === 'broadcast') {
            // Store message in extension storage
            chrome.storage.local.get(["messages"], (data) => {
              const existing = data.messages || [];
              const updated = [packet, ...existing.slice(0, 49)];
              chrome.storage.local.set({ messages: updated, unread_count: (data.unread_count || 0) + 1 });
            });

            // Trigger Chrome Rich System Notification
            chrome.notifications.create(`broadcast_${Date.now()}`, {
              type: 'basic',
              iconUrl: 'icon.png',
              title: packet.is_emergency ? '🚨 EMERGENCY: ' + packet.title : '📢 ' + packet.title,
              message: packet.message,
              priority: packet.is_emergency ? 2 : 1,
              requireInteraction: packet.is_emergency || packet.priority === 'high'
            });

            // Send acknowledgment back to server
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
        setTimeout(connectWebSocket, 5000);
      };

      socket.onerror = (err) => {
        if (socket) socket.close();
      };
    } catch (err) {
      console.error("WebSocket init error:", err);
    }
  });
}

// Keep-alive alarm every 1 minute
chrome.alarms.create("keepAlive", { periodInMinutes: 1 });
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
