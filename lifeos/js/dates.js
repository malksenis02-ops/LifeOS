import { supabase } from './supabase.js';
import { openDateModal } from './modals.js';
import { t, getMonthsShort } from './i18n.js';

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]));
}
function daysUntil(dateStr, repeatAnnually = false) {
  const today = new Date(); today.setHours(0,0,0,0);
  let target = new Date(dateStr);
  if (repeatAnnually) {
    target.setFullYear(today.getFullYear());
    if (target < today) target.setFullYear(today.getFullYear() + 1);
  }
  target.setHours(0,0,0,0);
  return Math.round((target - today) / 864e5);
}
function daysLabel(n) {
  if (n === 0) return t('today');
  if (n === 1) return t('tomorrow');
  if (n < 0) return `${Math.abs(n)} ${t('days_ago')}`;
  return `${t('through')} ${n} дн.`;
}

export async function renderDates(user) {
  const { data: items, error } = await supabase.from('external_data').select('*').eq('user_id', user.id).order('date', { ascending: true });
  if (error) return `<div class="empty"><div class="empty-icon">⚠️</div><div>${error.message}</div></div>`;
  const list = items || [];
  const withDays = list.map(item => ({ ...item, daysLeft: daysUntil(item.date, item.repeat_annually) }));
  const upcoming = withDays.filter(i => i.daysLeft >= 0).sort((a, b) => a.daysLeft - b.daysLeft);
  const past = withDays.filter(i => i.daysLeft < 0).sort((a, b) => b.daysLeft - a.daysLeft);

  return `
    <button class="action-btn" onclick="openDateModal()">➕ ${t('add_date')}</button>
    ${upcoming.length ? `
      <div class="text-sm text-muted" style="margin:12px 0 8px;font-weight:700;">🎯 ${t('upcoming')}</div>
      ${upcoming.map(d => dateCard(d)).join('')}
    ` : ''}
    ${past.length ? `
      <div class="text-sm text-muted" style="margin:20px 0 8px;font-weight:700;">📁 ${t('past')}</div>
      ${past.map(d => dateCard(d)).join('')}
    ` : ''}
    ${!list.length ? `<div class="empty"><div class="empty-icon">📌</div><div>${t('no_dates')}</div></div>` : ''}
  `;
}
function dateCard(d) {
  const n = d.daysLeft;
  const color = n < 0 ? 'var(--text-muted)' : n === 0 ? 'var(--accent)' : n <= 7 ? 'var(--accent2)' : 'var(--text-muted)';
  const dateObj = new Date(d.date);
  return `
    <div class="card flex-between gap-12" style="${n === 0 ? 'border:2px solid var(--accent);' : ''}">
      <div style="text-align:center;min-width:56px;">
        <div style="font-size:22px;font-weight:700;color:${color};">${dateObj.getDate()}</div>
        <div class="text-sm text-muted" style="text-transform:uppercase;font-size:10px;">${getMonthsShort()[dateObj.getMonth()]}</div>
      </div>
      <div style="flex:1;min-width:0;">
        <div style="font-weight:600;">${escapeHtml(d.title)} ${d.repeat_annually ? '🔄' : ''}</div>
        <div class="text-sm text-muted" style="margin-top:2px;">${t(d.category) || d.category || ''} · ${d.date}</div>
        <div class="text-sm" style="color:${color};margin-top:4px;font-weight:600;">${daysLabel(n)}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:2px;">
        <button class="btn-icon" onclick="editDate('${d.id}')">✏️</button>
        <button class="btn-icon" onclick="deleteDate('${d.id}')">✕</button>
      </div>
    </div>
  `;
}
window.saveDate = async (id) => {
  const title = document.getElementById('d_title').value.trim();
  if (!title) { window.showToast(t('enter_title')); return; }
  const dateVal = document.getElementById('d_date').value;
  if (!dateVal) { window.showToast(t('enter_date')); return; }
  const payload = {
    title,
    date: dateVal,
    category: document.getElementById('d_category').value,
    repeat_annually: document.getElementById('d_repeat').checked,
  };
  const result = id ? await window.__updateWithUser('external_data', id, payload) : await window.__saveWithUser('external_data', payload);
  if (result.error) { window.showToast(t('error') + ': ' + result.error.message); return; }
  window.closeModal();
  window.showToast(id ? t('date_updated') : t('date_added'));
  window.refresh();
};
window.editDate = async (id) => {
  const { data } = await supabase.from('external_data').select('*').eq('id', id).single();
  if (data) openDateModal(data);
};
window.deleteDate = async (id) => {
  const ok = await window.confirmAction(t('del_date_msg'), { titleText: t('del_date_title'), iconEmoji: '📌', okText: t('delete') });
  if (!ok) return;
  await supabase.from('external_data').delete().eq('id', id);
  window.showToast(t('date_deleted'));
  window.refresh();
};