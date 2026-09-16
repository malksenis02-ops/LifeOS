import { supabase } from './supabase.js';
import { t } from './i18n.js';

export function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  document.getElementById('modalContent').innerHTML = '';
}

// ==================== ЗАДАЧИ ====================
export function openTaskModal(task = null) {
  const isEdit = !!task;
  const title = isEdit ? task.title : '';
  const category = isEdit ? task.category : 'cat_home';
  const priority = isEdit ? task.priority : 'priority_medium';
  const date = isEdit ? task.date : new Date().toISOString().slice(0,10);
  const timeStart = isEdit && task.time_start ? task.time_start.slice(0,5) : '';
  const timeEnd = isEdit && task.time_end ? task.time_end.slice(0,5) : '';

  const cats = ['cat_home','cat_work','cat_study','cat_health','cat_family','cat_dev','cat_finance','cat_personal','cat_other'];
  const prios = ['priority_high','priority_medium','priority_low'];

  document.getElementById('modalContent').innerHTML = `
    <div class="flex-between mb-12">
      <div style="font-size:18px;font-weight:700;">${isEdit ? t('edit_task') : t('new_task')}</div>
      <button class="btn-icon" onclick="closeModal()">✕</button>
    </div>
    <div class="input-group"><label>${t('title_label')}:</label><input id="t_title" value="${title}" required></div>
    <div class="input-group">
      <label>${t('category_label')}:</label>
      <select id="t_category">${cats.map(c => `<option value="${c}" ${c===category?'selected':''}>${t(c)}</option>`).join('')}</select>
    </div>
    <div class="input-group">
      <label>${t('priority_label')}:</label>
      <select id="t_priority">${prios.map(p => `<option value="${p}" ${p===priority?'selected':''}>${t(p)}</option>`).join('')}</select>
    </div>
    <div class="input-group"><label>${t('date_label')}:</label><input id="t_date" type="date" value="${date}"></div>
    <div class="grid-2">
      <div class="input-group"><label>${t('time_start')}:</label><input id="t_start" type="time" value="${timeStart}"></div>
      <div class="input-group"><label>${t('time_end')}:</label><input id="t_end" type="time" value="${timeEnd}"></div>
    </div>
    <button class="btn btn-primary mt-8" onclick="saveTask('${isEdit ? task.id : ''}')">${t('save')}</button>
  `;
  document.getElementById('modal').classList.remove('hidden');
}

// ==================== ФИНАНСЫ ====================
export function openFinanceOpModal(op = null) {
  const isEdit = !!op;
  const type = isEdit ? op.type : 'expense_type';
  const amount = isEdit ? op.amount : '';
  const category = isEdit ? op.category : 'fin_food';
  const date = isEdit ? op.date : new Date().toISOString().slice(0,10);
  const note = isEdit ? (op.note || '') : '';

  const incomeCats = ['fin_salary','fin_side','fin_gift','fin_other'];
  const expenseCats = ['fin_housing','fin_transport','fin_food','fin_health','fin_fun','fin_obligatory','fin_connection','fin_other'];
  const currentCats = (type === 'Доход' || type === 'income_type') ? incomeCats : expenseCats;

  document.getElementById('modalContent').innerHTML = `
    <div class="flex-between mb-12">
      <div style="font-size:18px;font-weight:700;">${isEdit ? t('edit_operation') : t('new_operation')}</div>
      <button class="btn-icon" onclick="closeModal()">✕</button>
    </div>
    <div class="input-group"><label>${t('date_label')}:</label><input id="f_date" type="date" value="${date}"></div>
    <div class="input-group">
      <label>${t('operation_type')}:</label>
      <select id="f_type" onchange="updateFinanceCategories()">
        <option value="Доход" ${type==='Доход'?'selected':''}>${t('income_type')}</option>
        <option value="Расход" ${type==='Расход'?'selected':''}>${t('expense_type')}</option>
      </select>
    </div>
    <div class="input-group">
      <label>${t('category_label')}:</label>
      <select id="f_category">${currentCats.map(c => `<option value="${c}" ${c===category?'selected':''}>${t(c)}</option>`).join('')}</select>
    </div>
    <div class="input-group"><label>${t('amount_rub')}:</label><input id="f_amount" type="number" value="${amount}" inputmode="decimal"></div>
    <div class="input-group"><label>${t('note')}:</label><textarea id="f_note" rows="2">${note}</textarea></div>
    <button class="btn btn-primary mt-8" onclick="saveFinanceOp('${isEdit ? op.id : ''}')">${t('save')}</button>
  `;
  document.getElementById('modal').classList.remove('hidden');
}

window.updateFinanceCategories = () => {
  const type = document.getElementById('f_type').value;
  const select = document.getElementById('f_category');
  const cats = type === 'Доход' ? ['fin_salary','fin_side','fin_gift','fin_other'] : ['fin_housing','fin_transport','fin_food','fin_health','fin_fun','fin_obligatory','fin_connection','fin_other'];
  select.innerHTML = cats.map(c => `<option value="${c}">${t(c)}</option>`).join('');
};

// ==================== НАКОПЛЕНИЯ ====================
export function openSavingsModal(savings = null) {
  const isEdit = !!savings;
  const name = isEdit ? savings.name : '';
  const target = isEdit ? savings.target_amount : '';
  const current = isEdit ? savings.current_amount : '';
  const startDate = isEdit ? savings.start_date : new Date().toISOString().slice(0,10);
  const deadline = isEdit ? (savings.deadline || '') : '';

  document.getElementById('modalContent').innerHTML = `
    <div class="flex-between mb-12">
      <div style="font-size:18px;font-weight:700;">${isEdit ? t('edit_saving') : t('new_saving')}</div>
      <button class="btn-icon" onclick="closeModal()">✕</button>
    </div>
    <div class="input-group"><label>${t('title_label')}:</label><input id="s_name" value="${name}"></div>
    <div class="input-group"><label>${t('start_date')}:</label><input id="s_start" type="date" value="${startDate}"></div>
    <div class="input-group"><label>${t('deadline')}:</label><input id="s_deadline" type="date" value="${deadline}"></div>
    <div class="input-group"><label>${t('accumulated')}:</label><input id="s_current" type="number" value="${current}"></div>
    <div class="input-group"><label>${t('target_amount')}:</label><input id="s_target" type="number" value="${target}"></div>
    <button class="btn btn-primary mt-8" onclick="saveSavings('${isEdit ? savings.id : ''}')">${t('save')}</button>
  `;
  document.getElementById('modal').classList.remove('hidden');
}

// ==================== ШАБЛОН СМЕНЫ ====================
export function openShiftTemplateModal(template = null) {
  const isEdit = !!template;
  const name = isEdit ? template.name : '';
  const start = isEdit && template.start_time ? template.start_time.slice(0,5) : '09:00';
  const end = isEdit && template.end_time ? template.end_time.slice(0,5) : '18:00';

  document.getElementById('modalContent').innerHTML = `
    <div class="flex-between mb-12">
      <div style="font-size:18px;font-weight:700;">${isEdit ? t('edit_template') : t('new_template')}</div>
      <button class="btn-icon" onclick="closeModal()">✕</button>
    </div>
    <div class="input-group"><label>${t('shift_name')}:</label><input id="st_name" value="${name}"></div>
    <div class="grid-2">
      <div class="input-group"><label>${t('shift_start')}:</label><input id="st_start" type="time" value="${start}"></div>
      <div class="input-group"><label>${t('shift_end')}:</label><input id="st_end" type="time" value="${end}"></div>
    </div>
    <button class="btn btn-primary mt-8" onclick="saveShiftTemplate('${isEdit ? template.id : ''}')">${t('save')}</button>
  `;
  document.getElementById('modal').classList.remove('hidden');
}

// ==================== ДЕНЬ СМЕН ====================
export async function openDayShiftsModal(dateStr, userId) {
  const [shiftsRes, templatesRes] = await Promise.all([
    supabase.from('time_log').select('*').eq('user_id', userId).eq('date', dateStr),
    supabase.from('time_templates').select('*').eq('user_id', userId)
  ]);
  const shifts = shiftsRes.data || [];
  const templates = templatesRes.data || [];

  document.getElementById('modalContent').innerHTML = `
    <div class="flex-between mb-12">
      <div style="font-size:18px;font-weight:700;">${t('shifts_for')}: ${dateStr}</div>
      <button class="btn-icon" onclick="closeModal()">✕</button>
    </div>
    ${shifts.length ? `
      <div style="font-weight:700;margin-bottom:8px;">${t('planned')}:</div>
      ${shifts.map(s => `
        <div class="card flex-between mb-12" style="margin-bottom:8px;">
          <div style="flex:1;">
            <div style="font-weight:600;">${s.shift_name}</div>
            <div class="text-sm text-muted">${(s.start_time||'').slice(0,5)} — ${(s.end_time||'').slice(0,5)} · ${Number(s.hours).toFixed(1)} ${t('hours').toLowerCase()}</div>
          </div>
          <div style="display:flex;gap:4px;">
            <button class="btn-icon" onclick="recalcShift('${s.id}', '${dateStr}')" title="${t('recalc_hours')}">🔄</button>
            <button class="btn-icon" onclick="deleteShiftFromModal('${s.id}', '${dateStr}')">✕</button>
          </div>
        </div>
      `).join('')}
    ` : `<div class="text-sm text-muted mb-12">${t('no_shifts_day')}</div>`}
    <div style="font-weight:700;margin:16px 0 8px;">${t('add_from_template')}:</div>
    <div class="grid-2">
      ${templates.length ? templates.map(tpl => `
        <div class="card" style="padding:10px;text-align:center;cursor:pointer;margin-bottom:8px;" onclick="applyTemplateToDate('${tpl.id}', '${dateStr}')">
          <div style="font-weight:600;font-size:13px;">${tpl.name}</div>
          <div class="text-sm text-muted">${(tpl.start_time||'').slice(0,5)} - ${(tpl.end_time||'').slice(0,5)}</div>
        </div>
      `).join('') : `<div class="text-sm text-muted" style="grid-column:span 2;">${t('no_templates')}</div>`}
    </div>
  `;
  document.getElementById('modal').classList.remove('hidden');
}

// ==================== ПРИВЫЧКИ ====================
export function openHabitModal(habit = null) {
  const isEdit = !!habit;
  const title = isEdit ? habit.title : '';
  const icon = isEdit ? habit.icon : '✅';
  document.getElementById('modalContent').innerHTML = `
    <div class="flex-between mb-12">
      <div style="font-size:18px;font-weight:700;">${isEdit ? t('edit_habit') : t('new_habit')}</div>
      <button class="btn-icon" onclick="closeModal()">✕</button>
    </div>
    <div class="input-group"><label>${t('title_label')}:</label><input id="h_title" value="${title}"></div>
    <div class="input-group"><label>${t('icon')}:</label><input id="h_icon" value="${icon}"></div>
    <button class="btn btn-primary mt-8" onclick="saveHabit('${isEdit ? habit.id : ''}')">${t('save')}</button>
  `;
  document.getElementById('modal').classList.remove('hidden');
}

// ==================== БИБЛИОТЕКА ====================
export function openLibraryModal(type, item = null) {
  const isEdit = !!item;
  const title = isEdit ? item.title : '';
  const author = isEdit ? (item.author || '') : '';
  const url = isEdit ? (item.url || '') : '';
  const status = isEdit ? item.status : (type === 'Книга' ? 'want_to_read' : 'want_to_watch');
  const rating = isEdit ? item.rating : 0;

  const statuses = type === 'Книга'
    ? ['want_to_read','reading','read_done']
    : ['want_to_watch','watching','watched'];

  document.getElementById('modalContent').innerHTML = `
    <div class="flex-between mb-12">
      <div style="font-size:18px;font-weight:700;">${isEdit ? t('edit_item') : t('new_item')} ${type === 'Книга' ? t('books').toLowerCase() : t('movies').toLowerCase()}</div>
      <button class="btn-icon" onclick="closeModal()">✕</button>
    </div>
    <div class="input-group"><label>${t('cover_url')}:</label><input id="l_url" value="${url}"></div>
    <div class="input-group"><label>${t('author_director')}:</label><input id="l_author" value="${author}"></div>
    <div class="input-group"><label>${t('title_label')}:</label><input id="l_title" value="${title}"></div>
    <div class="input-group">
      <label>${t('status')}:</label>
      <select id="l_status">${statuses.map(s => `<option value="${s}" ${s===status?'selected':''}>${t(s)}</option>`).join('')}</select>
    </div>
    <div class="input-group">
      <label>${t('rating')}: <span id="rateVal">${rating}</span></label>
      <input id="l_rating" type="range" min="0" max="5" step="0.5" value="${rating}" oninput="document.getElementById('rateVal').textContent = this.value">
    </div>
    <button class="btn btn-primary mt-8" onclick="saveLibraryItem('${type}', '${isEdit ? item.id : ''}')">${t('save')}</button>
  `;
  document.getElementById('modal').classList.remove('hidden');
}

// ==================== ВАЖНЫЕ ДАТЫ ====================
export function openDateModal(dateItem = null) {
  const isEdit = !!dateItem;
  const title = isEdit ? dateItem.title : '';
  const date = isEdit ? dateItem.date : new Date().toISOString().slice(0,10);
  const category = isEdit ? dateItem.category : 'cat_birthday';
  const repeat = isEdit ? dateItem.repeat_annually : false;

  const cats = ['cat_birthday','cat_holiday','cat_anniversary','cat_other_date'];

  document.getElementById('modalContent').innerHTML = `
    <div class="flex-between mb-12">
      <div style="font-size:18px;font-weight:700;">${isEdit ? t('edit_date') : t('new_date')}</div>
      <button class="btn-icon" onclick="closeModal()">✕</button>
    </div>
    <div class="input-group"><label>${t('title_label')}:</label><input id="d_title" value="${title}"></div>
    <div class="input-group">
      <label>${t('category_label')}:</label>
      <select id="d_category">${cats.map(c => `<option value="${c}" ${c===category?'selected':''}>${t(c)}</option>`).join('')}</select>
    </div>
    <div class="input-group"><label>${t('date_label')}:</label><input id="d_date" type="date" value="${date}"></div>
    <div class="flex-between gap-12" style="margin-bottom:16px;">
      <label style="font-size:14px;">${t('repeat_yearly')}</label>
      <input id="d_repeat" type="checkbox" ${repeat ? 'checked' : ''} style="width:24px;height:24px;">
    </div>
    <button class="btn btn-primary" onclick="saveDate('${isEdit ? dateItem.id : ''}')">${t('save')}</button>
  `;
  document.getElementById('modal').classList.remove('hidden');
}

// ==================== ГЛОБАЛЬНЫЕ ПРИВЯЗКИ ====================
window.openTaskModal = openTaskModal;
window.openFinanceOpModal = openFinanceOpModal;
window.openSavingsModal = openSavingsModal;
window.openShiftTemplateModal = openShiftTemplateModal;
window.openDayShiftsModal = openDayShiftsModal;
window.openHabitModal = openHabitModal;
window.openLibraryModal = openLibraryModal;
window.openDateModal = openDateModal;
window.openWidgetsSettings = window.openWidgetsSettings || openWidgetsSettings;