import { supabase } from './supabase.js';
import { openShiftTemplateModal, openDayShiftsModal } from './modals.js';
import { t, getMonths, getDaysShort } from './i18n.js';

let currentMonth = new Date().toISOString().slice(0, 7);

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]));
}
function getMonthName() { return getMonths()[Number(currentMonth.split('-')[1]) - 1]; }
function getYear() { return currentMonth.split('-')[0]; }

function calcShiftHours(dateStr, startTime, endTime) {
  const start = new Date(`${dateStr}T${startTime}`);
  let end = new Date(`${dateStr}T${endTime}`);
  if (end <= start) end = new Date(end.getTime() + 86400000);
  const hours = (end - start) / 3600000;
  let nightH = 0;
  let cur = new Date(start);
  while (cur < end) {
    const h = cur.getHours();
    if (h >= 22 || h < 6) nightH += 1/60;
    cur = new Date(cur.getTime() + 60000);
  }
  return { hours, nightHours: nightH };
}

export async function renderSchedule(user) {
  const [y, m] = currentMonth.split('-').map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const firstDay = new Date(y, m - 1, 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const monthStart = currentMonth + '-01';
  const monthEnd = new Date(y, m, 0).toISOString().slice(0, 10);

  const [shiftsRes, templatesRes] = await Promise.all([
    supabase.from('time_log').select('*').eq('user_id', user.id).gte('date', monthStart).lte('date', monthEnd),
    supabase.from('time_templates').select('*').eq('user_id', user.id)
  ]);
  const shifts = shiftsRes.data || [];
  const templates = templatesRes.data || [];

  let totalHours = 0, nightHours = 0;
  shifts.forEach(s => { totalHours += Number(s.hours || 0); nightHours += Number(s.night_hours || 0); });

  let calendarHtml = '';
  getDaysShort().forEach(d => calendarHtml += `<div class="calendar-header">${d}</div>`);
  for (let i = 0; i < startOffset; i++) calendarHtml += '<div class="calendar-day empty"></div>';

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentMonth}-${String(day).padStart(2, '0')}`;
    const dayShifts = shifts.filter(s => s.date === dateStr);
    const isToday = dateStr === new Date().toISOString().slice(0, 10);
    let shiftHtml = '';
    if (dayShifts.length > 0) shiftHtml = dayShifts.map(s => `<div class="shift-label">${escapeHtml(s.shift_name || '•')}</div>`).join('');
    calendarHtml += `
      <div class="calendar-day ${isToday ? 'today' : ''}" onclick="openDayShifts('${dateStr}')">
        <div>${day}</div>${shiftHtml}
      </div>
    `;
  }

  return `
    <div class="month-year-nav">
      <div class="month-year-center">
        <button class="month-btn" onclick="openScheduleMonthPicker()"><span>${getMonthName()}</span><span class="arrow">▼</span></button>
        <button class="year-btn" onclick="openScheduleYearPicker()"><span>${getYear()}</span><span class="arrow">▼</span></button>
      </div>
    </div>

    <div class="widget mb-12">
      <div class="widget-title mb-12">${t('templates')}</div>
      <div class="grid-3">
        <div style="text-align:center;"><div class="text-sm text-muted">${t('hours')}</div><div style="font-weight:700;">${totalHours.toFixed(1)}</div></div>
        <div style="text-align:center;"><div class="text-sm text-muted">${t('night_hours')}</div><div style="font-weight:700;">${nightHours.toFixed(1)}</div></div>
        <div style="text-align:center;"><div class="text-sm text-muted">${t('shifts')}</div><div style="font-weight:700;">${shifts.length}</div></div>
      </div>
      ${shifts.some(s => Number(s.hours) === 0) ? `<button class="btn btn-secondary mt-8" onclick="recalcAllShifts()" style="font-size:13px;padding:10px;">${t('recalc_all')}</button>` : ''}
    </div>

    <div class="widget mb-12">
      <div class="flex-between mb-12">
        <div class="widget-title" style="margin:0;">${t('templates')}</div>
        <button class="action-btn" style="width:auto;margin:0;padding:6px 12px;font-size:12px;" onclick="openShiftTemplateModal()">➕ ${t('add_template')}</button>
      </div>
      ${templates.length ? templates.map(tpl => `
        <div class="card flex-between" style="padding:10px;margin-bottom:8px;">
          <div>
            <div style="font-weight:600;font-size:13px;">${escapeHtml(tpl.name)}</div>
            <div class="text-sm text-muted">${(tpl.start_time||'').slice(0,5)} — ${(tpl.end_time||'').slice(0,5)}</div>
          </div>
          <div style="display:flex;gap:4px;">
            <button class="btn-icon" onclick="editShiftTemplate('${tpl.id}')">✏️</button>
            <button class="btn-icon" onclick="deleteShiftTemplate('${tpl.id}')">✕</button>
          </div>
        </div>
      `).join('') : `<div class="text-sm text-muted" style="text-align:center;padding:8px 0;">${t('no_templates')}</div>`}
    </div>

    <div class="widget">
      <div class="widget-title mb-12">${t('calendar_click')}</div>
      <div class="calendar-grid">${calendarHtml}</div>
    </div>
  `;
}

window.openScheduleMonthPicker = () => {
  const currentM = Number(currentMonth.split('-')[1]);
  document.getElementById('pickerTitle').textContent = t('choose_month');
  document.getElementById('pickerContent').innerHTML = `<div class="grid-3" style="gap:8px;">
    ${getMonths().map((name, i) => `<div class="picker-month ${i + 1 === currentM ? 'active' : ''}" onclick="selectScheduleMonth(${i + 1})">${name}</div>`).join('')}
  </div>`;
  document.getElementById('pickerModal').classList.remove('hidden');
};
window.selectScheduleMonth = (m) => {
  const [y] = currentMonth.split('-');
  currentMonth = `${y}-${String(m).padStart(2, '0')}`;
  window.closePicker();
  window.refresh();
};
window.openScheduleYearPicker = () => {
  const currentY = Number(currentMonth.split('-')[0]);
  const nowY = new Date().getFullYear();
  document.getElementById('pickerTitle').textContent = t('choose_year');
  let html = '';
  for (let year = nowY + 10; year >= nowY - 10; year--) {
    html += `<div class="picker-year ${year === currentY ? 'active' : ''}" onclick="selectScheduleYear(${year})">${year}</div>`;
  }
  document.getElementById('pickerContent').innerHTML = `<div class="picker-years-scroll">${html}</div>`;
  document.getElementById('pickerModal').classList.remove('hidden');
  setTimeout(() => {
    const active = document.getElementById('pickerContent').querySelector('.picker-year.active');
    if (active) active.scrollIntoView({ block: 'center' });
  }, 50);
};
window.selectScheduleYear = (year) => {
  const [, m] = currentMonth.split('-');
  currentMonth = `${year}-${m}`;
  window.closePicker();
  window.refresh();
};
window.openDayShifts = async (dateStr) => {
  const { data: { user } } = await supabase.auth.getUser();
  await openDayShiftsModal(dateStr, user.id);
};
window.applyTemplateToDate = async (templateId, dateStr) => {
  const { data: tpl } = await supabase.from('time_templates').select('*').eq('id', templateId).single();
  if (!tpl) return;
  const { hours, nightHours } = calcShiftHours(dateStr, tpl.start_time, tpl.end_time);
  await window.__saveWithUser('time_log', {
    date: dateStr, shift_name: tpl.name, start_time: tpl.start_time, end_time: tpl.end_time,
    hours: Number(hours.toFixed(2)), night_hours: Number(nightHours.toFixed(2))
  });
  window.showToast(`${t('shift_added')}: ${hours.toFixed(1)} ${t('hours').toLowerCase()}`);
  window.closeModal();
  window.refresh();
};
window.recalcShift = async (id, dateStr) => {
  const { data: shift } = await supabase.from('time_log').select('*').eq('id', id).single();
  if (!shift) return;
  const { hours, nightHours } = calcShiftHours(dateStr, shift.start_time, shift.end_time);
  await supabase.from('time_log').update({ hours: Number(hours.toFixed(2)), night_hours: Number(nightHours.toFixed(2)) }).eq('id', id);
  window.showToast(`${t('recalc_shift')}: ${hours.toFixed(1)} ${t('hours').toLowerCase()}`);
  const { data: { user } } = await supabase.auth.getUser();
  await openDayShiftsModal(dateStr, user.id);
  window.refresh();
};
window.recalcAllShifts = async () => {
  const ok = await window.confirmAction(t('recalc_msg'), { titleText: t('recalc_title'), iconEmoji: '🔄', okText: t('save'), danger: false });
  if (!ok) return;
  const { data: { user } } = await supabase.auth.getUser();
  const monthStart = currentMonth + '-01';
  const monthEnd = new Date(new Date(monthStart).getFullYear(), new Date(monthStart).getMonth() + 1, 0).toISOString().slice(0, 10);
  const { data: shifts } = await supabase.from('time_log').select('*').eq('user_id', user.id).gte('date', monthStart).lte('date', monthEnd);
  if (!shifts) return;
  for (const s of shifts) {
    const { hours, nightHours } = calcShiftHours(s.date, s.start_time, s.end_time);
    await supabase.from('time_log').update({ hours: Number(hours.toFixed(2)), night_hours: Number(nightHours.toFixed(2)) }).eq('id', s.id);
  }
  window.showToast(`${t('recalc_shift')}: ${shifts.length}`);
  window.refresh();
};
window.deleteShiftFromModal = async (id, dateStr) => {
  const ok = await window.confirmAction(t('del_shift_msg'), { titleText: t('del_shift_title'), iconEmoji: '⏱️', okText: t('delete') });
  if (!ok) return;
  await supabase.from('time_log').delete().eq('id', id);
  window.showToast(t('shift_deleted'));
  const { data: { user } } = await supabase.auth.getUser();
  await openDayShiftsModal(dateStr, user.id);
  window.refresh();
};
window.saveShiftTemplate = async (id) => {
  const name = document.getElementById('st_name').value.trim();
  if (!name) { window.showToast(t('enter_title')); return; }
  const payload = {
    name,
    start_time: document.getElementById('st_start').value,
    end_time: document.getElementById('st_end').value,
  };
  const result = id ? await window.__updateWithUser('time_templates', id, payload) : await window.__saveWithUser('time_templates', payload);
  if (result.error) { window.showToast(t('error') + ': ' + result.error.message); return; }
  window.closeModal();
  window.showToast(t('template_saved'));
  window.refresh();
};
window.editShiftTemplate = async (id) => {
  const { data } = await supabase.from('time_templates').select('*').eq('id', id).single();
  if (data) openShiftTemplateModal(data);
};
window.deleteShiftTemplate = async (id) => {
  const ok = await window.confirmAction(t('del_template_msg'), { titleText: t('del_template_title'), iconEmoji: '📋', okText: t('delete') });
  if (!ok) return;
  await supabase.from('time_templates').delete().eq('id', id);
  window.showToast(t('template_deleted'));
  window.refresh();
};