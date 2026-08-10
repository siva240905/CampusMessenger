const { app, BrowserWindow, Notification, ipcMain, shell } = require('electron');
const path = require('path');
const os = require('os');
const WebSocket = require('ws');

let mainWindow = null;
let ws = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 440,
    height: 600,
    title: "CampusLink LAN Notification Center",
    frame: true,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC Handler to open external link
ipcMain.handle('open-url', async (event, url) => {
  if (url) shell.openExternal(url);
});

// IPC Handler for WebSocket Connect from UI
ipcMain.handle('connect-server', async (event, serverIp) => {
  const computerName = os.hostname();
  const osInfo = `${os.type()} ${os.release()}`;
  const clientId = `client_${computerName}_electron`;
  
  const wsUrl = `ws://${serverIp}:8000/ws?client_id=${clientId}&computer_name=${encodeURIComponent(computerName)}&ip_address=127.0.0.1&os_info=${encodeURIComponent(osInfo)}&client_version=1.0.0`;

  if (ws) {
    ws.close();
  }

  try {
    ws = new WebSocket(wsUrl);

    ws.on('open', () => {
      mainWindow.webContents.send('connection-status', { connected: true, ip: serverIp });
    });

    ws.on('message', (data) => {
      try {
        const packet = JSON.parse(data.toString());
        if (packet.type === 'broadcast') {
          // Send native OS notification
          if (Notification.isSupported()) {
            const notif = new Notification({
              title: packet.title || 'Campus Announcement',
              body: packet.message || (packet.url ? `URL: ${packet.url}` : ''),
              urgent: packet.is_emergency,
              timeoutType: 'never',
              requireInteraction: true
            });

            notif.on('click', () => {
              if (mainWindow) {
                if (mainWindow.isMinimized()) mainWindow.restore();
                mainWindow.focus();
              }
            });

            notif.show();
          }

          // Forward to renderer UI
          mainWindow.webContents.send('new-broadcast', packet);
        } else if (packet.type === 'remote_command') {
          const { command_type, url } = packet;
          const { exec } = require('child_process');
          
          if ((command_type === 'open_url' || command_type === 'open_pdf') && url) {
            shell.openExternal(url);
          } else if (command_type === 'open_chrome') {
            if (process.platform === 'win32') {
              exec(url ? `start chrome "${url}"` : 'start chrome');
            } else if (url) {
              shell.openExternal(url);
            }
          } else if (command_type === 'lock') {
            if (process.platform === 'win32') {
              exec('rundll32.exe user32.dll,LockWorkStation');
            }
          } else if (command_type === 'restart') {
            if (process.platform === 'win32') {
              exec('shutdown /r /t 5 /c "Faculty Remote Command"');
            }
          } else if (command_type === 'shutdown') {
            if (process.platform === 'win32') {
              exec('shutdown /s /t 5 /c "Faculty Remote Command"');
            }
          }
        }
      } catch (e) {
        console.error("Error handling WS packet:", e);
      }
    });

    ws.on('close', () => {
      mainWindow.webContents.send('connection-status', { connected: false });
    });

    ws.on('error', (err) => {
      mainWindow.webContents.send('connection-status', { connected: false, error: err.message });
    });

  } catch (err) {
    return { success: false, error: err.message };
  }

  return { success: true };
});
