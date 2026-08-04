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
  
  if (packet.url) {
    html += `
      <div class="url-container">
        <input type="text" class="url-input" value="${packet.url}" readonly onclick="this.select()" />
      </div>
      <div class="action-row">
        <button class="link-btn" onclick="window.electronAPI.openUrl('${packet.url}')">🔗 Open Link</button>
        <button class="copy-btn" onclick="copyToClipboard('${packet.url}', this)">📋 Copy Link</button>
        <button class="copy-btn secondary" onclick="copyToClipboard(\`${packet.title}\\n${packet.message}\\n${packet.url}\`, this)">📝 Copy Text</button>
      </div>
    `;
  } else {
    html += `
      <div class="action-row">
        <button class="copy-btn secondary" onclick="copyToClipboard(\`${packet.title}\\n${packet.message}\`, this)">📝 Copy Text</button>
      </div>
    `;
  }

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

