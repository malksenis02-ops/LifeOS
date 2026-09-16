import { supabase } from './supabase.js';
import { t, formatMoney, getMonths } from './i18n.js';

let currentMonth = new Date().toISOString().slice(0, 7);

export async function renderAnalytics(user) {
  const monthStart = currentMonth + '-01';
  const monthEnd = new Date(new Date(monthStart).getFullYear(), new Date(monthStart).getMonth() + 1, 0).toISOString().slice(0, 10);

  const [tasksRes, habitsRes, habitLogRes, timeRes, financeRes, libRes] = await Promise.all([
    supabase.from('tasks').select('*').eq('user_id', user.id).gte('date', monthStart).lte('date', monthEnd),
    supabase.from('habits').select('*').eq('user_id', user.id),
    supabase.from('habit_log').select('*').eq('user_id', user.id).gte('date', monthStart).lte('date', monthEnd),
    supabase.from('time_log').select('*').eq('user_id', user.id).gte('date', monthStart).lte('date', monthEnd),
    supabase.from('finance_ops').select('*').eq('user_id', user.id).gte('date', monthStart).lte('date', monthEnd),
    supabase.from('library').select('*').eq('user_id', user.id),
  ]);

  const tasks = tasksRes.data || [];
  const habits = habitsRes.data || [];
  const habitLog = habitLogRes.data || [];
  const timeLog = timeRes.data || [];
  const finance = financeRes.data || [];
  const library = libRes.data || [];

  const tasksDone = tasks.filter(tk => tk.done).length;
  const tasksNot = tasks.length - tasksDone;
  const habitDoneIds = new Set(habitLog.filter(l => l.done).map(l => l.habit_id));
  const habitsDone = habitDoneIds.size;
  const habitsNot = habits.length - habitsDone;
  const dayHours = timeLog.reduce((s, l) => s + Number(l.hours || 0), 0);
  const nightHours = timeLog.reduce((s, l) => s + Number(l.night_hours || 0), 0);
  const income = finance.filter(f => f.type === 'Доход').reduce((s, f) => s + Number(f.amount), 0);
  const expense = finance.filter(f => f.type === 'Расход').reduce((s, f) => s + Number(f.amount), 0);
  const booksCount = library.filter(l => l.type === 'Книга').length;
  const moviesCount = library.filter(l => l.type === 'Фильм').length;

  setTimeout(() => initCharts({ tasksDone, tasksNot, habitsDone, habitsNot, dayHours, nightHours, income, expense }), 100);

  return `
    <div class="month-year-nav">
      <div class="month-year-center">
        <button class="month-btn" onclick="openAnalyticsMonthPicker()"><span>${getMonths()[new Date(currentMonth + '-01').getMonth()]}</span><span class="arrow">▼</span></button>
        <button class="year-btn" onclick="openAnalyticsYearPicker()"><span>${currentMonth.split('-')[0]}</span><span class="arrow">▼</span></button>
      </div>
    </div>

    <div class="grid-2 mb-12">
      <div class="widget"><div class="widget-title">${t('analytics_tasks')}</div><canvas id="chartTasks" height="140"></canvas></div>
      <div class="widget"><div class="widget-title">${t('analytics_habits')}</div><canvas id="chartHabits" height="140"></canvas></div>
      <div class="widget"><div class="widget-title">${t('analytics_hours')}</div><canvas id="chartHours" height="140"></canvas></div>
      <div class="widget"><div class="widget-title">${t('analytics_finance')}</div><canvas id="chartFinance" height="140"></canvas></div>
    </div>

    <div class="grid-2">
      <div class="widget"><div class="widget-title">${t('analytics_books')}</div><div class="widget-value">${booksCount}</div></div>
      <div class="widget"><div class="widget-title">${t('analytics_movies')}</div><div class="widget-value">${moviesCount}</div></div>
      <div class="widget"><div class="widget-title">${t('income')}</div><div class="widget-value" style="font-size:16px;">${formatMoney(income)}</div></div>
      <div class="widget"><div class="widget-title">${t('expense')}</div><div class="widget-value" style="font-size:16px;">${formatMoney(expense)}</div></div>
    </div>
  `;
}

window.openAnalyticsMonthPicker = () => {
  const currentM = Number(currentMonth.split('-')[1]);
  document.getElementById('pickerTitle').textContent = t('choose_month');
  document.getElementById('pickerContent').innerHTML = `<div class="grid-3" style="gap:8px;">
    ${getMonths().map((name, i) => `<div class="picker-month ${i + 1 === currentM ? 'active' : ''}" onclick="selectAnalyticsMonth(${i + 1})">${name}</div>`).join('')}
  </div>`;
  document.getElementById('pickerModal').classList.remove('hidden');
};
window.selectAnalyticsMonth = (m) => {
  const [y] = currentMonth.split('-');
  currentMonth = `${y}-${String(m).padStart(2, '0')}`;
  window.closePicker();
  window.refresh();
};
window.openAnalyticsYearPicker = () => {
  const currentY = Number(currentMonth.split('-')[0]);
  const nowY = new Date().getFullYear();
  document.getElementById('pickerTitle').textContent = t('choose_year');
  let html = '';
  for (let year = nowY + 10; year >= nowY - 10; year--) {
    html += `<div class="picker-year ${year === currentY ? 'active' : ''}" onclick="selectAnalyticsYear(${year})">${year}</div>`;
  }
  document.getElementById('pickerContent').innerHTML = `<div class="picker-years-scroll">${html}</div>`;
  document.getElementById('pickerModal').classList.remove('hidden');
  setTimeout(() => {
    const active = document.getElementById('pickerContent').querySelector('.picker-year.active');
    if (active) active.scrollIntoView({ block: 'center' });
  }, 50);
};
window.selectAnalyticsYear = (year) => {
  const [, m] = currentMonth.split('-');
  currentMonth = `${year}-${m}`;
  window.closePicker();
  window.refresh();
};

function initCharts(data) {
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#6B2737';
  const accent2 = getComputedStyle(document.documentElement).getPropertyValue('--accent2').trim() || '#B8925A';
  const muted = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#7A6A5C';
  const commonOpts = { responsive: true, maintainAspectRatio: true, cutout: '65%', plugins: { legend: { display: false } } };
  const mk = (id, labels, values, colors) => {
    const el = document.getElementById(id);
    if (!el) return;
    new Chart(el, { type: 'doughnut', data: { labels, datasets: [{ data: values, backgroundColor: colors, borderWidth: 0 }] }, options: commonOpts });
  };
  mk('chartTasks', [t('done'), t('no_tasks')], [data.tasksDone, data.tasksNot], [accent, muted]);
  mk('chartHabits', [t('done'), t('remaining')], [data.habitsDone, data.habitsNot], [accent2, muted]);
  mk('chartHours', ['Day', t('night_hours')], [Math.max(0, data.dayHours - data.nightHours), data.nightHours], [accent, accent2]);
  mk('chartFinance', [t('income'), t('expense')], [data.income, data.expense], [accent2, accent]);
}