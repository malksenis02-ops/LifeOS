import { supabase } from './supabase.js';
import { openTaskModal } from './modals.js';
import { t } from './i18n.js';

let currentDate = new Date().toISOString().slice(0, 10);

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]));
}
function formatDayLabel(dateStr) {
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  if (dateStr === today) return t('today');
  if (dateStr === tomorrow) return t('tomorrow');
  if (dateStr === yesterday) return t('yesterday');
  return dateStr;
}
function formatDateRu(dateStr) {
  const [y, m, d] = dateStr.split('-');
  return `${parseInt(d)}.${m}.${y}`;
}

export async function renderDaily(user) {
  const { data: tasks } = await supabase.from('tasks').select('*').eq('user_id', user.id).lte('date', currentDate).order('date', { ascending: false }).order('time_start', { ascending: true, nullsFirst: false });
  const list = (tasks || []).filter(tk => tk.date === currentDate || !tk.done);
  const doneCount = list.filter(tk => tk.done).length;
  const todayTasks = list.filter(tk => tk.date === currentDate);
  const carriedTasks = list.filter(tk => tk.date !== currentDate);

  return `
    <div class="card" style="padding:12px 14px;">
      <div class="flex-between" style="margin-bottom:10px;">
        <button class="btn-icon" onclick="changeDay(-1)" style="font-size:22px;">‹</button>
        <div style="text-align:center;">
          <div class="text-sm text-muted">${formatDayLabel(currentDate)}</div>
          <div style="font-size:17px;font-weight:700;">${formatDateRu(currentDate)}</div>
        </div>
        <button class="btn-icon" onclick="changeDay(1)" style="font-size:22px;">›</button>
      </div>
      <input type="date" id="jumpDate" value="${currentDate}" onchange="jumpToDate(this.value)" style="font-size:14px;padding:10px 14px;">
    </div>

    <button class="action-btn" onclick="openTaskModal()">➕ ${t('add_task')}</button>

    <div class="widget-grid">
      <div class="widget"><div class="widget-title">${t('done')}</div><div class="widget-value">${doneCount}/${list.length}</div></div>
      <div class="widget"><div class="widget-title">${t('remaining')}</div><div class="widget-value">${list.length - doneCount}</div></div>
    </div>

    ${carriedTasks.length ? `
      <div class="text-sm text-muted" style="margin:12px 0 8px;font-weight:700;">⚠️ ${t('carried_over')} (${carriedTasks.length})</div>
      ${carriedTasks.map(tk => taskCard(tk, true)).join('')}
    ` : ''}

    ${todayTasks.length ? `
      <div class="text-sm text-muted" style="margin:12px 0 8px;font-weight:700;">📌 ${t('tasks_on')} ${formatDayLabel(currentDate).toLowerCase()}</div>
      ${todayTasks.map(tk => taskCard(tk, false)).join('')}
    ` : ''}

    ${!list.length ? `<div class="empty"><div class="empty-icon">📝</div><div>${t('no_tasks_day')}</div></div>` : ''}
  `;
}

function taskCard(tk, isCarried) {
  const [y, m, d] = tk.date.split('-');
  return `
    <div class="card" style="display:flex;gap:12px;align-items:flex-start;${isCarried ? 'border-left:4px solid var(--accent2);' : ''}">
      <div class="checkbox ${tk.done ? 'done' : ''}" onclick="toggleDailyTask('${tk.id}', ${!tk.done})"></div>
      <div style="flex:1;min-width:0;">
        <div style="${tk.done ? 'text-decoration:line-through;opacity:0.5;' : ''}">${escapeHtml(tk.title)}</div>
        <div class="text-sm text-muted" style="margin-top:4px;">
          ${tk.time_start ? `⏰ ${tk.time_start.slice(0,5)}` : ''}
          ${tk.time_end ? ` – ${tk.time_end.slice(0,5)}` : ''}
          ${tk.category ? ` · ${t(tk.category) || tk.category}` : ''}
          ${tk.priority ? ` · ${t(tk.priority) || tk.priority}` : ''}
          ${isCarried ? ` · <span style="color:var(--accent2);">${parseInt(d)}.${m}</span>` : ''}
        </div>
      </div>
      <button class="btn-icon" onclick="editTask('${tk.id}')">✏️</button>
      <button class="btn-icon" onclick="deleteDailyTask('${tk.id}')">✕</button>
    </div>
  `;
}

window.changeDay = (delta) => {
  const d = new Date(currentDate);
  d.setDate(d.getDate() + delta);
  currentDate = d.toISOString().slice(0, 10);
  window.refresh();
};
window.jumpToDate = (date) => { if (date) { currentDate = date; window.refresh(); } };
window.toggleDailyTask = async (id, done) => {
  await supabase.from('tasks').update({ done }).eq('id', id);
  window.refresh();
};
window.deleteDailyTask = async (id) => {
  const ok = await window.confirmAction(t('del_task_msg'), { titleText: t('del_task_title'), iconEmoji: '🗑️', okText: t('delete') });
  if (!ok) return;
  await supabase.from('tasks').delete().eq('id', id);
  window.showToast(t('task_deleted'));
  window.refresh();
};
window.editTask = async (id) => {
  const { data } = await supabase.from('tasks').select('*').eq('id', id).single();
  if (data) openTaskModal(data);
};
window.saveTask = async (id) => {
  const title = document.getElementById('t_title').value.trim();
  if (!title) { window.showToast(t('enter_title')); return; }
  const payload = {
    title,
    category: document.getElementById('t_category').value,
    priority: document.getElementById('t_priority').value,
    date: document.getElementById('t_date').value,
    time_start: document.getElementById('t_start').value || null,
    time_end: document.getElementById('t_end').value || null,
  };
  const result = id ? await window.__updateWithUser('tasks', id, payload) : await window.__saveWithUser('tasks', payload);
  if (result.error) { window.showToast(t('error') + ': ' + result.error.message); return; }
  window.closeModal();
  window.showToast(id ? t('task_updated') : t('task_added'));
  window.refresh();
};
export function getCurrentDate() { return currentDate; }