import { supabase } from './supabase.js';
import { openHabitModal } from './modals.js';
import { t, getMonths, getDaysShort } from './i18n.js';

let currentWeekStart = getMonday(new Date());

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0,0,0,0);
  return monday;
}
function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export async function renderHabits(user) {
  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const startStr = formatDate(currentWeekStart);
  const endStr = formatDate(weekEnd);

  const [habitsRes, logRes] = await Promise.all([
    supabase.from('habits').select('*').eq('user_id', user.id).order('created_at'),
    supabase.from('habit_log').select('*').eq('user_id', user.id).gte('date', startStr).lte('date', endStr)
  ]);
  const habits = habitsRes.data || [];
  const logs = logRes.data || [];

  const days = getDaysShort();
  const dateHeaders = days.map((d, i) => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + i);
    const isToday = formatDate(date) === formatDate(new Date());
    return `<th style="${isToday ? 'color:var(--accent);' : ''}">${d}<br><span style="font-size:10px;font-weight:normal;">${date.getDate()}</span></th>`;
  }).join('');

  return `
    <div class="flex-between mb-12">
      <button class="btn-icon" onclick="changeWeek(-1)" style="font-size:22px;">‹</button>
      <div class="week-range" onclick="openWeekPicker()" style="cursor:pointer;text-align:center;padding:8px 14px;border-radius:10px;background:rgba(0,0,0,0.05);border:1px solid var(--border);">
        <div style="font-weight:700;font-size:14px;">${startStr} — ${endStr}</div>
        <div class="text-sm text-muted" style="font-size:10px;margin-top:2px;">${t('click_to_select')}</div>
      </div>
      <button class="btn-icon" onclick="changeWeek(1)" style="font-size:22px;">›</button>
    </div>

    <button class="action-btn" onclick="openHabitModal()">➕ ${t('add_habit')}</button>

    ${habits.length ? `
      <div style="overflow-x:auto;">
        <table class="habit-grid">
          <thead>
            <tr>
              <th style="text-align:left;">${t('habit')}</th>
              ${dateHeaders}
              <th>%</th>
            </tr>
          </thead>
          <tbody>
            ${habits.map(h => {
              let doneCount = 0;
              const row = days.map((_, i) => {
                const date = new Date(currentWeekStart);
                date.setDate(date.getDate() + i);
                const dateStr = formatDate(date);
                const log = logs.find(l => l.habit_id === h.id && l.date === dateStr);
                const isDone = log && log.done;
                if (isDone) doneCount++;
                return `<td><div class="habit-check ${isDone ? 'done' : ''}" onclick="toggleHabit('${h.id}', '${dateStr}', ${isDone})"></div></td>`;
              }).join('');
              const percent = Math.round((doneCount / 7) * 100);
              return `
                <tr>
                  <td>
                    <div style="display:flex;align-items:center;gap:4px;flex-wrap:nowrap;">
                      <span>${h.icon || '✅'}</span>
                      <span style="font-size:11px;">${h.title}</span>
                      <button class="btn-icon" style="padding:2px;font-size:11px;" onclick="editHabit('${h.id}')">✏️</button>
                      <button class="btn-icon" style="padding:2px;font-size:11px;" onclick="deleteHabit('${h.id}')">✕</button>
                    </div>
                  </td>
                  ${row}
                  <td>${percent}%</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    ` : `<div class="empty"><div class="empty-icon">🌱</div><div>${t('no_habits_list')}</div></div>`}
  `;
}

window.changeWeek = (delta) => { currentWeekStart.setDate(currentWeekStart.getDate() + delta * 7); window.refresh(); };

let wpYear = null, wpMonth = null;
window.openWeekPicker = () => {
  const year = currentWeekStart.getFullYear();
  const month = currentWeekStart.getMonth();
  document.getElementById('pickerTitle').textContent = t('choose_day');
  document.getElementById('pickerContent').innerHTML = `
    <div class="flex-between mb-12">
      <button class="btn-icon" onclick="weekPickerChangeMonth(-1)">‹</button>
      <div style="font-weight:700;" id="weekPickerHeader">${getMonths()[month]} ${year}</div>
      <button class="btn-icon" onclick="weekPickerChangeMonth(1)">›</button>
    </div>
    <div id="weekPickerCalendar"></div>
  `;
  renderWeekPickerCalendar(year, month);
  document.getElementById('pickerModal').classList.remove('hidden');
};
function renderWeekPickerCalendar(year, month) {
  wpYear = year; wpMonth = month;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const todayStr = formatDate(new Date());
  const weekStartStr = formatDate(currentWeekStart);
  const weekEndDate = new Date(currentWeekStart); weekEndDate.setDate(weekEndDate.getDate() + 6);
  const weekEndStr = formatDate(weekEndDate);

  let html = '<div class="calendar-grid">';
  getDaysShort().forEach(d => html += `<div class="calendar-header">${d}</div>`);
  for (let i = 0; i < startOffset; i++) html += '<div class="calendar-day empty"></div>';
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isToday = dateStr === todayStr;
    const inWeek = dateStr >= weekStartStr && dateStr <= weekEndStr;
    html += `<div class="calendar-day ${isToday ? 'today' : ''}" style="${inWeek ? 'background:rgba(108,140,255,0.15);' : ''}" onclick="selectWeekDay('${dateStr}')"><div>${day}</div></div>`;
  }
  html += '</div>';
  document.getElementById('weekPickerCalendar').innerHTML = html;
}
window.weekPickerChangeMonth = (delta) => {
  let newMonth = wpMonth + delta, newYear = wpYear;
  if (newMonth < 0) { newMonth = 11; newYear--; }
  if (newMonth > 11) { newMonth = 0; newYear++; }
  document.getElementById('weekPickerHeader').textContent = `${getMonths()[newMonth]} ${newYear}`;
  renderWeekPickerCalendar(newYear, newMonth);
};
window.selectWeekDay = (dateStr) => {
  const selected = new Date(dateStr + 'T12:00:00');
  currentWeekStart = getMonday(selected);
  window.closePicker();
  window.refresh();
};

window.toggleHabit = async (habitId, date, currentDone) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data: existing } = await supabase.from('habit_log').select('*').eq('habit_id', habitId).eq('date', date).maybeSingle();
  if (existing) await supabase.from('habit_log').update({ done: !currentDone }).eq('id', existing.id);
  else await supabase.from('habit_log').insert({ habit_id: habitId, date, done: true, user_id: user.id });
  window.refresh();
};
window.saveHabit = async (id) => {
  const title = document.getElementById('h_title').value.trim();
  if (!title) { window.showToast(t('enter_title')); return; }
  const payload = { title, icon: document.getElementById('h_icon').value || '✅' };
  const result = id ? await window.__updateWithUser('habits', id, payload) : await window.__saveWithUser('habits', payload);
  if (result.error) { window.showToast(t('error') + ': ' + result.error.message); return; }
  window.closeModal();
  window.showToast(id ? t('habit_updated') : t('habit_added'));
  window.refresh();
};
window.editHabit = async (id) => {
  const { data } = await supabase.from('habits').select('*').eq('id', id).single();
  if (data) openHabitModal(data);
};
window.deleteHabit = async (id) => {
  const ok = await window.confirmAction(t('del_habit_msg'), { titleText: t('del_habit_title'), iconEmoji: '🌱', okText: t('delete') });
  if (!ok) return;
  await supabase.from('habit_log').delete().eq('habit_id', id);
  await supabase.from('habits').delete().eq('id', id);
  window.showToast(t('habit_deleted'));
  window.refresh();
};