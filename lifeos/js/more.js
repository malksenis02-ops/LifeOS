import { t } from './i18n.js';

export async function renderMore(user) {
  const items = [
    { tab: 'daily', icon: '📅', key: 'daily' },
    { tab: 'finance', icon: '💰', key: 'finance' },
    { tab: 'schedule', icon: '⏱️', key: 'schedule' },
    { tab: 'dates', icon: '📌', key: 'dates' },
    { tab: 'habits', icon: '🌱', key: 'habits' },
    { tab: 'library', icon: '📚', key: 'library' },
    { tab: 'analytics', icon: '📊', key: 'analytics' },
    { tab: 'settings', icon: '⚙️', key: 'settings' },
  ];
  return `
    <h3 style="margin:0 0 12px;font-size:16px;">${t('all')}</h3>
    ${items.map(i => `
      <div class="card" onclick="switchTab('${i.tab}')" style="cursor:pointer;display:flex;align-items:center;gap:12px;">
        <div style="font-size:22px;">${i.icon}</div>
        <div style="flex:1;font-weight:600;">${t(i.key)}</div>
        <div style="color:var(--text-muted);">›</div>
      </div>
    `).join('')}
  `;
}