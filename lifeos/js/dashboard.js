import { supabase } from './supabase.js';
import { t, formatMoney, getMonthsShort, getDaysShort } from './i18n.js';
import { loadWidgets, setCurrentWidgets, currentWidgets } from './widgets.js';

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]));
}

const AFF = {
  ru: [
    "Я способен достичь всего, что задумал.", "Сегодня отличный день для новых начинаний.",
    "Я ценю каждый момент своей жизни.", "Мои усилия обязательно принесут плоды.",
    "Я выбираю быть счастливым сегодня.", "Я контролирую свои финансы и свое время.",
    "Маленькие шаги ведут к большим целям.", "Я достоин успеха и изобилия.",
    "Каждый день я становлюсь лучше.", "Моё спокойствие — моя суперсила."
  ],
  en: [
    "I can achieve everything I set my mind to.", "Today is a great day for new beginnings.",
    "I appreciate every moment of my life.", "My efforts will surely bear fruit.",
    "I choose to be happy today.", "I control my finances and my time.",
    "Small steps lead to big goals.", "I deserve success and abundance.",
    "I get better every day.", "My calm is my superpower."
  ]
};

function getDailyAffirmation() {
  const lang = document.documentElement.lang === 'en' ? 'en' : 'ru';
  const arr = AFF[lang];
  const day = new Date().getDate();
  return arr[day % arr.length];
}

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return t('morning');
  if (h >= 12 && h < 18) return t('day');
  if (h >= 18 && h < 23) return t('evening');
  return t('night');
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

// ==================== ГЕНЕРАТОРЫ ВИДЖЕТОВ ====================

function widgetGreeting(name) {
  return `
    <div class="widget mb-12" style="text-align:center;background:var(--accent-gradient);color:white;border:none;box-shadow:var(--shadow-md);">
      <div style="font-size:22px;font-weight:700;letter-spacing:-0.3px;">${getTimeGreeting()}, ${escapeHtml(name)}! 👋</div>
      <div style="font-size:13px;margin-top:10px;opacity:0.95;font-style:italic;line-height:1.5;">${getDailyAffirmation()}</div>
    </div>
  `;
}

function widgetCarriedTasks(tasks) {
  if (!tasks.length) return '';
  return `
    <div class="widget mb-12" style="border-left:4px solid var(--accent2);">
      <div class="flex-between mb-12">
        <div class="widget-title" style="margin:0;color:var(--accent2);font-weight:700;">⚠️ ${t('carried_over')}</div>
        <div style="font-size:18px;font-weight:700;">${tasks.length}</div>
      </div>
      ${tasks.slice(0, 5).map(tk => {
        const [y, m, d] = tk.date.split('-');
        return `
          <div class="flex-between gap-8" style="padding:8px 0;border-bottom:1px solid var(--border-soft);">
            <div class="checkbox" onclick="toggleDashTask('${tk.id}', true)"></div>
            <div style="flex:1;min-width:0;">
              <div class="text-sm" style="font-weight:500;">${escapeHtml(tk.title)}</div>
              <div class="text-sm text-muted" style="font-size:11px;">с ${parseInt(d)}.${m}</div>
            </div>
          </div>
        `;
      }).join('')}
      ${tasks.length > 5 ? `<div class="text-sm text-muted" style="text-align:center;padding-top:8px;">+${tasks.length - 5}…</div>` : ''}
    </div>
  `;
}

function widgetTasksToday(tasks) {
  const doneCount = tasks.filter(tk => tk.done).length;
  return `
    <div class="widget mb-12">
      <div class="flex-between mb-12">
        <div class="widget-title" style="margin:0;">📝 ${t('tasks_today')}</div>
        <div style="font-size:20px;font-weight:700;color:${doneCount === tasks.length && tasks.length > 0 ? 'var(--accent)' : 'var(--text)'};">${doneCount}/${tasks.length}</div>
      </div>
      ${tasks.length ? tasks.map(tk => `
        <div class="flex-between gap-8" style="padding:8px 0;border-bottom:1px solid var(--border-soft);">
          <div class="checkbox ${tk.done ? 'done' : ''}" onclick="toggleDashTask('${tk.id}', ${!tk.done})"></div>
          <div style="flex:1;min-width:0;">
            <div class="text-sm ${tk.done ? 'text-muted' : ''}" style="font-weight:500;${tk.done ? 'text-decoration:line-through;' : ''}">${escapeHtml(tk.title)}</div>
            ${tk.time_start ? `<div class="text-sm text-muted" style="font-size:11px;">⏰ ${tk.time_start.slice(0,5)}${tk.time_end ? ' – ' + tk.time_end.slice(0,5) : ''}</div>` : ''}
          </div>
        </div>
      `).join('') : `<div class="text-sm text-muted" style="text-align:center;padding:10px 0;">${t('no_tasks')}</div>`}
    </div>
  `;
}

function widgetHabitsToday(habits, doneHabits) {
  return `
    <div class="widget mb-12">
      <div class="flex-between mb-12">
        <div class="widget-title" style="margin:0;">🌱 ${t('habits_today')}</div>
        <div style="font-size:20px;font-weight:700;">${doneHabits.size}/${habits.length}</div>
      </div>
      ${habits.length ? habits.map(h => `
        <div class="flex-between gap-8" style="padding:8px 0;border-bottom:1px solid var(--border-soft);">
          <div style="font-size:20px;width:28px;text-align:center;">${h.icon || '✅'}</div>
          <div style="flex:1;" class="text-sm" style="font-weight:500;">${escapeHtml(h.title)}</div>
          <div class="checkbox ${doneHabits.has(h.id) ? 'done' : ''}" onclick="toggleDashHabit('${h.id}', '${new Date().toISOString().slice(0,10)}')"></div>
        </div>
      `).join('') : `<div class="text-sm text-muted" style="text-align:center;padding:10px 0;">${t('no_habits')}</div>`}
    </div>
  `;
}

function widgetWallet(balance, totalSavings) {
  return `
    <div class="widget mb-12">
      <div class="widget-title mb-12">💰 ${t('wallet')}</div>
      <div style="text-align:center;padding:8px 0;margin-bottom:10px;border-bottom:1px solid var(--border-soft);">
        <div class="text-sm text-muted">${t('balance_all')}</div>
        <div style="font-size:30px;font-weight:700;letter-spacing:-1px;color:${balance >= 0 ? 'var(--accent2)' : 'var(--accent)'};margin-top:6px;">
          ${formatMoney(balance)}
        </div>
      </div>
      <div style="text-align:center;padding:10px 0;background:var(--accent-soft);border-radius:12px;">
        <div class="text-sm text-muted">💰 ${t('savings_label')}</div>
        <div style="font-size:20px;font-weight:700;color:var(--accent);margin-top:4px;">
          ${formatMoney(totalSavings)}
        </div>
      </div>
    </div>
  `;
}

function widgetScheduleChart(shifts) {
  const now = new Date();
  const monthStart = now.toISOString().slice(0, 7) + '-01';
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

  const monthShifts = shifts.filter(s => s.date >= monthStart && s.date <= monthEnd);
  let totalHours = 0, totalNight = 0;
  monthShifts.forEach(s => {
    totalHours += Number(s.hours || 0);
    totalNight += Number(s.night_hours || 0);
  });

  // Последние 7 дней — часы + список смен
  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayShifts = shifts.filter(s => s.date === dateStr);
    const hours = dayShifts.reduce((sum, s) => sum + Number(s.hours || 0), 0);
    last7.push({
      date: d.getDate(),
      day: getDaysShort()[(d.getDay() + 6) % 7],
      hours,
      shiftNames: dayShifts.map(s => s.shift_name).filter(Boolean)
    });
  }
  const maxHours = Math.max(...last7.map(d => d.hours), 1);

  // Предстоящие смены (3 ближайшие)
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = shifts
    .filter(s => s.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  return `
    <div class="widget mb-12">
      <div class="flex-between mb-12">
        <div class="widget-title" style="margin:0;">📊 ${t('schedule')}</div>
        <div class="text-sm text-muted" style="font-size:11px;">${getMonthsShort()[now.getMonth()]}</div>
      </div>

      <!-- Статистика -->
      <div class="grid-3 mb-12" style="gap:6px;">
        <div style="text-align:center;padding:8px 4px;background:var(--accent-soft);border-radius:10px;">
          <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;font-weight:600;">${t('hours')}</div>
          <div style="font-size:17px;font-weight:700;margin-top:2px;">${totalHours.toFixed(1)}</div>
        </div>
        <div style="text-align:center;padding:8px 4px;background:var(--accent-soft);border-radius:10px;">
          <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;font-weight:600;">${t('night_hours')}</div>
          <div style="font-size:17px;font-weight:700;margin-top:2px;">${totalNight.toFixed(1)}</div>
        </div>
        <div style="text-align:center;padding:8px 4px;background:var(--accent-soft);border-radius:10px;">
          <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;font-weight:600;">${t('shifts')}</div>
          <div style="font-size:17px;font-weight:700;margin-top:2px;">${monthShifts.length}</div>
        </div>
      </div>

      <!-- Мини-график за 7 дней с названиями смен -->
      <div class="text-sm text-muted" style="font-size:11px;margin-bottom:8px;">Последние 7 дней:</div>
      <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:4px;min-height:110px;padding:4px 0;border-bottom:1px solid var(--border-soft);">
        ${last7.map(d => {
          const h = Math.max(4, (d.hours / maxHours) * 60);
          const hasShift = d.hours > 0;
          const shortName = d.shiftNames[0] || '';
          const displayName = shortName.length > 6 ? shortName.slice(0, 6) + '…' : shortName;
          return `
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;height:100%;justify-content:flex-end;min-width:0;">
              <div style="font-size:10px;font-weight:700;color:${hasShift ? 'var(--accent)' : 'var(--text-muted)'};opacity:${hasShift ? 1 : 0.4};">
                ${hasShift ? d.hours.toFixed(0) : ''}
              </div>
              <div style="width:100%;max-width:26px;height:${h}px;background:${hasShift ? 'var(--accent-gradient)' : 'var(--border-soft)'};border-radius:6px 6px 0 0;transition:var(--transition);" title="${d.hours} ч ${d.shiftNames.join(', ')}"></div>
              ${hasShift && displayName ? `
                <div style="font-size:9px;font-weight:600;color:var(--accent);max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:center;line-height:1.1;margin-top:2px;" title="${d.shiftNames.join(', ')}">
                  ${displayName}
                </div>
              ` : '<div style="height:11px;"></div>'}
              <div style="font-size:10px;color:var(--text-muted);font-weight:600;">${d.day}</div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Ближайшие смены -->
      ${upcoming.length ? `
        <div class="text-sm text-muted" style="font-size:11px;margin:12px 0 6px;">${t('upcoming')}:</div>
        ${upcoming.map(s => {
          const [y, m, d] = s.date.split('-');
          return `
            <div class="flex-between gap-8" style="padding:6px 0;font-size:12px;border-bottom:1px solid var(--border-soft);">
              <div style="font-weight:600;color:var(--accent);">${escapeHtml(s.shift_name || '•')}</div>
              <div class="text-muted" style="font-size:11px;">${parseInt(d)}.${m} · ${(s.start_time||'').slice(0,5)}–${(s.end_time||'').slice(0,5)} · ${Number(s.hours).toFixed(0)} ч</div>
            </div>
          `;
        }).join('')}
      ` : ''}

      <button class="btn btn-secondary mt-8" onclick="switchTab('schedule')" style="font-size:13px;padding:10px;">
        ${t('schedule')} →
      </button>
    </div>
  `;
}

function widgetUpcomingEvents(events) {
  return `
    <div class="widget mb-12">
      <div class="widget-title mb-12">📌 ${t('upcoming_events')}</div>
      ${events.length ? events.map(d => {
        const n = d.daysLeft;
        const color = n === 0 ? 'var(--accent)' : n <= 7 ? 'var(--accent2)' : 'var(--text-muted)';
        const dateObj = new Date(d.date);
        return `
          <div class="flex-between gap-8" style="padding:8px 0;border-bottom:1px solid var(--border-soft);">
            <div style="text-align:center;min-width:48px;">
              <div style="font-size:18px;font-weight:700;color:${color};">${dateObj.getDate()}</div>
              <div class="text-sm text-muted" style="text-transform:uppercase;font-size:10px;">${getMonthsShort()[dateObj.getMonth()]}</div>
            </div>
            <div style="flex:1;min-width:0;">
              <div class="text-sm font-bold">${escapeHtml(d.title)} ${d.repeat_annually ? '🔄' : ''}</div>
              <div class="text-sm text-muted" style="font-size:11px;">${t(d.category) || d.category || ''}</div>
            </div>
            <div class="text-sm font-bold" style="color:${color};font-size:12px;">${daysLabel(n)}</div>
          </div>
        `;
      }).join('') : `<div class="text-sm text-muted" style="text-align:center;padding:10px 0;">${t('no_events')}</div>`}
      <button class="btn btn-secondary mt-8" onclick="switchTab('dates')" style="font-size:13px;padding:10px;">
        ${t('all_dates')} →
      </button>
    </div>
  `;
}

// ==================== ГЛАВНЫЙ РЕНДЕР ====================

export async function renderDashboard(user) {
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow30 = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);

  // Загружаем конфиг виджетов
  const widgetsCfg = await loadWidgets(user.id);
  setCurrentWidgets(widgetsCfg);

  // Загружаем все данные параллельно
  const [settingsRes, todayTasksRes, carriedRes, habitsRes, walletRes, savingsRes, datesRes, shiftsRes] = await Promise.all([
    supabase.from('user_settings').select('name').eq('user_id', user.id).maybeSingle(),
    supabase.from('tasks').select('*').eq('user_id', user.id).eq('date', today).order('time_start', { nullsFirst: false }),
    supabase.from('tasks').select('*').eq('user_id', user.id).lt('date', today).eq('done', false).order('date', { ascending: false }).limit(10),
    supabase.from('habits').select('*').eq('user_id', user.id).limit(5),
    supabase.from('finance_ops').select('type, amount').eq('user_id', user.id),
    supabase.from('finance_savings').select('current_amount').eq('user_id', user.id),
    supabase.from('external_data').select('*').eq('user_id', user.id),
    supabase.from('time_log').select('*').eq('user_id', user.id).gte('date', new Date(Date.now() - 30 * 864e5).toISOString().slice(0,10)).order('date', { ascending: false })
  ]);

  const name = settingsRes.data?.name || t('user');
  const todayTasks = todayTasksRes.data || [];
  const carriedTasks = carriedRes.data || [];
  const habits = habitsRes.data || [];
  const wallet = walletRes.data || [];
  const savings = savingsRes.data || [];
  const allDates = datesRes.data || [];
  const shifts = shiftsRes.data || [];

  const totalIncome = wallet.filter(w => w.type === 'Доход').reduce((s, w) => s + Number(w.amount), 0);
  const totalExpense = wallet.filter(w => w.type === 'Расход').reduce((s, w) => s + Number(w.amount), 0);
  const balance = totalIncome - totalExpense;
  const totalSavings = savings.reduce((s, it) => s + Number(it.current_amount || 0), 0);

  let habitLog = [];
  if (habits.length) {
    const { data } = await supabase.from('habit_log').select('*').in('habit_id', habits.map(h => h.id)).eq('date', today);
    habitLog = data || [];
  }
  const doneHabits = new Set(habitLog.filter(l => l.done).map(l => l.habit_id));

  const upcomingEvents = allDates
    .map(d => ({ ...d, daysLeft: daysUntil(d.date, d.repeat_annually) }))
    .filter(d => d.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 5);

  // Собираем HTML по конфигу
  const enabledWidgets = widgetsCfg.filter(w => w.enabled);

  const widgetHtmlMap = {
    'carried_tasks': () => widgetCarriedTasks(carriedTasks),
    'tasks_today': () => widgetTasksToday(todayTasks),
    'habits_today': () => widgetHabitsToday(habits, doneHabits),
    'wallet': () => widgetWallet(balance, totalSavings),
    'schedule_chart': () => widgetScheduleChart(shifts),
    'upcoming_events': () => widgetUpcomingEvents(upcomingEvents),
  };

  const widgetsHtml = enabledWidgets
    .map(w => widgetHtmlMap[w.id] ? widgetHtmlMap[w.id]() : '')
    .filter(Boolean)
    .join('');

  return `
    ${widgetGreeting(name)}
    ${widgetsHtml}
    <button class="btn btn-secondary mt-8" onclick="openWidgetsSettings()" style="font-size:13px;padding:12px;opacity:0.7;">
      ⚙️ Настроить дашборд
    </button>
  `;
}

// ==================== ОБРАБОТЧИКИ ====================

window.toggleDashTask = async (id, done) => {
  await supabase.from('tasks').update({ done }).eq('id', id);
  window.refresh();
};

window.toggleDashHabit = async (habitId, date) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data: existing } = await supabase.from('habit_log').select('*').eq('habit_id', habitId).eq('date', date).maybeSingle();
  if (existing) await supabase.from('habit_log').update({ done: !existing.done }).eq('id', existing.id);
  else await supabase.from('habit_log').insert({ habit_id: habitId, date, done: true, user_id: user.id });
  window.refresh();
};