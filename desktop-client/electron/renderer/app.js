const btnConnect = document.getElementById('btn-connect');
const inputIp = document.getElementById('server-ip');
const badgeStatus = document.getElementById('status-badge');
const messageList = document.getElementById('message-list');

btnConnect.addEventListener('click', () => {
  const ip = inputIp.value.trim();
  if (ip) {
    window.electronAPI.connectServer(ip);
  }
});

window.electronAPI.onConnectionStatus((data) => {
  if (data.connected) {
    badgeStatus.textContent = 'Online (LAN Active)';
    badgeStatus.className = 'badge online';
  } else {
    badgeStatus.textContent = 'Disconnected';
    badgeStatus.className = 'badge offline';
  }
});

window.electronAPI.onNewBroadcast((packet) => {
  const placeholder = messageList.querySelector('.placeholder');
  if (placeholder) placeholder.remove();

  const card = document.createElement('div');
  card.className = `message-card ${packet.is_emergency ? 'emergency' : ''}`;
  
  let html = `<h4>${packet.title}</h4><p class="selectable-msg">${packet.message}</p>`;
  
  const serverIp = inputIp.value.trim() || '127.0.0.1';
  const serverBaseUrl = `http://${serverIp}:8000`;

  if (packet.image) {
    const mediaUrl = packet.image.startsWith('http') ? packet.image : `${serverBaseUrl}${packet.image}`;
    const isVideo = /\.(mp4|webm|ogg|mov|avi|mkv|m4v)($|\?)/i.test(packet.image);

    if (isVideo) {
      html += `
        <div class="media-container" style="margin: 10px 0; border-radius: 8px; overflow: hidden; background: #000;">
          <video controls src="${mediaUrl}" style="width: 100%; max-height: 200px;"></video>
        </div>
      `;
    } else {
      html += `
        <div class="media-container" style="margin: 10px 0; border-radius: 8px; overflow: hidden; background: #020617;">
          <img src="${mediaUrl}" alt="${packet.title}" style="width: 100%; max-height: 200px; object-fit: contain;" />
        </div>
      `;
    }
  }

  if (packet.url) {
    html += `
      <div class="url-container">
        <input type="text" class="url-input" value="${packet.url}" readonly onclick="this.select()" />
      </div>
    `;
  }

  html += `<div class="action-row" style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px;">`;

  if (packet.url) {
    html += `<button class="link-btn" onclick="window.electronAPI.openUrl('${packet.url}')">🔗 Open Link</button>`;
    html += `<button class="copy-btn" onclick="copyToClipboard('${packet.url}', this)">📋 Copy Link</button>`;
  }

  if (packet.image) {
    const mediaUrl = packet.image.startsWith('http') ? packet.image : `${serverBaseUrl}${packet.image}`;
    const isVideo = /\.(mp4|webm|ogg|mov|avi|mkv|m4v)($|\?)/i.test(packet.image);
    html += `<button class="link-btn" style="background: #9333ea;" onclick="window.electronAPI.openUrl('${mediaUrl}')">${isVideo ? '🎬 View Video' : '🖼️ View Photo'}</button>`;
  }

  if (packet.file) {
    const fileUrl = packet.file.startsWith('http') ? packet.file : `${serverBaseUrl}${packet.file}`;
    html += `<button class="link-btn" style="background: #059669;" onclick="window.electronAPI.openUrl('${fileUrl}')">📥 Download File</button>`;
  }

  html += `<button class="copy-btn secondary" onclick="copyToClipboard(\`${packet.title}\\n${packet.message}\`, this)">📝 Copy Text</button>`;
  html += `</div>`;

  card.innerHTML = html;
  messageList.prepend(card);
});

window.copyToClipboard = function(text, btnElement) {
  navigator.clipboard.writeText(text).then(() => {
    const originalText = btnElement.textContent;
    btnElement.textContent = "✓ Copied!";
    btnElement.style.background = "#10b981";
    setTimeout(() => {
      btnElement.textContent = originalText;
      btnElement.style.background = "";
    }, 2000);
  }).catch(err => {
    console.error("Failed to copy text: ", err);
  });
};

