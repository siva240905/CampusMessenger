document.addEventListener("DOMContentLoaded", () => {
  const statusBadge = document.getElementById("statusBadge");
  const feed = document.getElementById("feed");
  const toggleSettings = document.getElementById("toggleSettings");
  const settingsPanel = document.getElementById("settingsPanel");
  const urlInput = document.getElementById("urlInput");
  const saveUrlBtn = document.getElementById("saveUrlBtn");

  // Load current URL into settings input
  chrome.storage.local.get(["custom_ws_url"], (data) => {
    urlInput.value = data.custom_ws_url || "https://campuslink-backend.onrender.com";
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

      feed.innerHTML = msgs.map((m) => `
        <div class="card ${m.is_emergency ? 'emergency' : ''}">
          <div class="card-title">${m.is_emergency ? '🚨 ' : '📢 '}${escapeHtml(m.title)}</div>
          <div class="card-msg">${escapeHtml(m.message)}</div>
          <div class="card-actions">
            ${m.url ? `<a href="${m.url}" target="_blank" class="btn">🔗 Open Link</a>` : ''}
            <button class="btn btn-secondary copy-btn" data-text="${escapeHtml(m.url || m.message)}">📋 Copy</button>
          </div>
        </div>
      `).join('');

      document.querySelectorAll(".copy-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const text = e.target.getAttribute("data-text");
          navigator.clipboard.writeText(text);
          e.target.textContent = "✓ Copied";
          setTimeout(() => { e.target.textContent = "📋 Copy"; }, 1500);
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
