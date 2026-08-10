document.addEventListener("DOMContentLoaded", () => {
  const statusBadge = document.getElementById("statusBadge");
  const feed = document.getElementById("feed");
  const toggleSettings = document.getElementById("toggleSettings");
  const settingsPanel = document.getElementById("settingsPanel");
  const urlInput = document.getElementById("urlInput");
  const saveUrlBtn = document.getElementById("saveUrlBtn");

  // Load current URL into settings input
  chrome.storage.local.get(["custom_ws_url", "active_ws_url"], (data) => {
    urlInput.value = data.custom_ws_url || data.active_ws_url || "https://campusmessenger-backend.onrender.com";
  });

  toggleSettings.addEventListener("click", () => {
    settingsPanel.classList.toggle("open");
  });

  saveUrlBtn.addEventListener("click", () => {
    const val = urlInput.value.trim();
    if (!val) return;
    chrome.storage.local.set({ custom_ws_url: val }, () => {
      saveUrlBtn.textContent = "Connecting...";
      chrome.runtime.sendMessage({ action: "reconnect" }, () => {
        setTimeout(() => {
          saveUrlBtn.textContent = "Save & Connect Server";
          settingsPanel.classList.remove("open");
          updateUI();
        }, 1000);
      });
    });
  });

  function resolveMediaUrl(path) {
    if (!path) return '';
    if (path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) return path;
    const rawUrl = urlInput.value.trim() || "https://campusmessenger-backend.onrender.com";
    let baseUrl = rawUrl.replace("wss://", "https://").replace("ws://", "http://").replace(/\/ws$/, "");
    if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
    if (baseUrl.endsWith('/api/v1')) baseUrl = baseUrl.slice(0, -7);
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  function downloadFile(url, filename) {
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'download';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // Render status and messages
  function updateUI() {
    chrome.storage.local.get(["is_connected", "messages"], (data) => {
      if (data.is_connected) {
        statusBadge.textContent = "● Live";
        statusBadge.className = "badge badge-online";
      } else {
        statusBadge.textContent = "○ Connecting...";
        statusBadge.className = "badge badge-offline";
      }

      const msgs = data.messages || [];
      if (msgs.length === 0) {
        feed.innerHTML = `<div class="empty">📡 Waiting for announcements...</div>`;
        return;
      }

      feed.innerHTML = msgs.map((m, idx) => {
        const isEmergency = m.is_emergency;
        const priority = m.priority || 'normal';
        const timestamp = m.timestamp || new Date().toLocaleTimeString();

        let mediaHtml = '';
        if (m.image) {
          const mediaUrl = resolveMediaUrl(m.image);
          const isVideo = m.image.startsWith('data:video') || /\.(mp4|webm|ogg|mov|avi|mkv|m4v)($|\?)/i.test(m.image);
          if (isVideo) {
            mediaHtml = `<div class="media-box"><video controls src="${mediaUrl}"></video></div>`;
          } else {
            mediaHtml = `<div class="media-box"><img src="${mediaUrl}" alt="${escapeHtml(m.title)}" /></div>`;
          }
        }

        let urlBoxHtml = '';
        if (m.url) {
          urlBoxHtml = `
            <div class="url-box">
              <span class="url-tag">URL:</span>
              <input type="text" class="url-input" value="${escapeHtml(m.url)}" readonly onclick="this.select()" />
            </div>
          `;
        }

        let actionsHtml = `<div class="action-row">`;
        
        if (m.url) {
          actionsHtml += `<a href="${m.url}" target="_blank" class="btn btn-indigo">🔗 Open Link</a>`;
          actionsHtml += `<button class="btn btn-sky copy-url-btn" data-url="${escapeHtml(m.url)}">📋 Copy Link</button>`;
        }

        actionsHtml += `<button class="btn btn-slate copy-text-btn" data-text="${escapeHtml(m.title + '\n' + m.message + (m.url ? '\n' + m.url : ''))}">📝 Copy Text</button>`;

        if (m.image) {
          const mediaUrl = resolveMediaUrl(m.image);
          const isVideo = m.image.startsWith('data:video') || /\.(mp4|webm|ogg|mov|avi|mkv|m4v)($|\?)/i.test(m.image);
          const ext = isVideo ? '.mp4' : '.png';
          actionsHtml += `<a href="${mediaUrl}" target="_blank" class="btn btn-purple">${isVideo ? '🎬 View Video' : '🖼️ View Photo'}</a>`;
          actionsHtml += `<button class="btn btn-teal download-media-btn" data-url="${mediaUrl}" data-name="campus_media_${m.broadcast_id || idx}${ext}">${isVideo ? '📥 Download Video' : '📥 Download Photo'}</button>`;
        }

        if (m.file) {
          const fileUrl = resolveMediaUrl(m.file);
          const fileName = m.file_name || 'document';
          actionsHtml += `<button class="btn btn-emerald download-file-btn" data-url="${fileUrl}" data-name="${escapeHtml(fileName)}">📥 Download File</button>`;
        }

        actionsHtml += `</div>`;

        return `
          <div class="card ${isEmergency ? 'emergency' : ''}">
            <div class="card-header">
              <span class="prio-tag ${isEmergency ? 'prio-emergency' : 'prio-normal'}">
                ${isEmergency ? '🚨 EMERGENCY ALERT' : '[ ' + priority.toUpperCase() + ' PRIORITY ]'}
              </span>
              <span class="time-stamp">⏰ ${escapeHtml(timestamp)}</span>
            </div>
            <div class="card-title">${escapeHtml(m.title)}</div>
            <div class="card-msg">${escapeHtml(m.message)}</div>
            ${mediaHtml}
            ${urlBoxHtml}
            ${actionsHtml}
          </div>
        `;
      }).join('');

      // Add event listeners for dynamic copy & download buttons
      document.querySelectorAll(".copy-url-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const url = e.currentTarget.getAttribute("data-url");
          navigator.clipboard.writeText(url);
          const orig = e.currentTarget.textContent;
          e.currentTarget.textContent = "✓ Copied!";
          setTimeout(() => { e.currentTarget.textContent = orig; }, 1500);
        });
      });

      document.querySelectorAll(".copy-text-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const text = e.currentTarget.getAttribute("data-text");
          navigator.clipboard.writeText(text);
          const orig = e.currentTarget.textContent;
          e.currentTarget.textContent = "✓ Copied!";
          setTimeout(() => { e.currentTarget.textContent = orig; }, 1500);
        });
      });

      document.querySelectorAll(".download-media-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const url = e.currentTarget.getAttribute("data-url");
          const name = e.currentTarget.getAttribute("data-name");
          downloadFile(url, name);
        });
      });

      document.querySelectorAll(".download-file-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const url = e.currentTarget.getAttribute("data-url");
          const name = e.currentTarget.getAttribute("data-name");
          downloadFile(url, name);
        });
      });
    });
  }

  function escapeHtml(text) {
    if (!text) return "";
    return text.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));
  }

  updateUI();
  setInterval(updateUI, 1500);
});
