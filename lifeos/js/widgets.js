import { supabase } from './supabase.js';

// Все доступные виджеты (порядок по умолчанию)
export const WIDGET_REGISTRY = [
  { id: 'carried_tasks',   icon: '⚠️', title: 'Перенесённые задачи',    desc: 'Незавершённые с прошлых дней' },
  { id: 'tasks_today',     icon: '📝', title: 'Задачи на сегодня',        desc: 'Список задач с чекбоксами' },
  { id: 'habits_today',    icon: '🌱', title: 'Привычки на сегодня',      desc: 'Отметки привычек за сегодня' },
  { id: 'wallet',          icon: '💰', title: 'Кошелёк',                 desc: 'Баланс и накопления' },
  { id: 'schedule_chart',  icon: '📊', title: 'График смен',             desc: 'Отработанные часы и статистика' },
  { id: 'upcoming_events', icon: '📌', title: 'Ближайшие события',        desc: 'Важные даты и праздники' },
];

export function getDefaultWidgets() {
  return WIDGET_REGISTRY.map(w => ({ id: w.id, enabled: true }));
}

// Загрузка настроек виджетов из БД
export async function loadWidgets(userId) {
  const { data } = await supabase
    .from('user_settings')
    .select('dashboard_widgets')
    .eq('user_id', userId)
    .maybeSingle();

  let cfg = data?.dashboard_widgets;
  // Если пусто или невалидно — берём дефолт
  if (!Array.isArray(cfg) || cfg.length === 0) {
    cfg = getDefaultWidgets();
  } else {
    // Добавляем новые виджеты, которых ещё нет в конфиге (на случай обновлений)
    const existingIds = new Set(cfg.map(w => w.id));
    for (const reg of WIDGET_REGISTRY) {
      if (!existingIds.has(reg.id)) cfg.push({ id: reg.id, enabled: true });
    }
    // Удаляем устаревшие (которых больше нет в реестре)
    const validIds = new Set(WIDGET_REGISTRY.map(w => w.id));
    cfg = cfg.filter(w => validIds.has(w.id));
  }
  return cfg;
}

// Сохранение конфига
export async function saveWidgets(userId, widgets) {
  await supabase
    .from('user_settings')
    .upsert({ user_id: userId, dashboard_widgets: widgets }, { onConflict: 'user_id' });
}

// Глобальное хранилище текущего конфига (для рендера)
export let currentWidgets = getDefaultWidgets();
export function setCurrentWidgets(cfg) { currentWidgets = cfg; }

// Управление порядком и видимостью в модалке
window.toggleWidget = (id) => {
  const w = currentWidgets.find(x => x.id === id);
  if (w) w.enabled = !w.enabled;
  renderWidgetSettingsList();
};

window.moveWidget = (id, direction) => {
  const idx = currentWidgets.findIndex(x => x.id === id);
  if (idx < 0) return;
  const newIdx = idx + direction;
  if (newIdx < 0 || newIdx >= currentWidgets.length) return;
  [currentWidgets[idx], currentWidgets[newIdx]] = [currentWidgets[newIdx], currentWidgets[idx]];
  renderWidgetSettingsList();
};

window.resetWidgetsToDefault = () => {
  currentWidgets = getDefaultWidgets();
  renderWidgetSettingsList();
};

export function renderWidgetSettingsList() {
  const container = document.getElementById('widgetsList');
  if (!container) return;

  container.innerHTML = currentWidgets.map((w, idx) => {
    const reg = WIDGET_REGISTRY.find(r => r.id === w.id);
    if (!reg) return '';
    const isFirst = idx === 0;
    const isLast = idx === currentWidgets.length - 1;
    return `
      <div class="widget-item ${w.enabled ? '' : 'disabled'}" style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;margin-bottom:8px;background:${w.enabled ? 'var(--accent-soft)' : 'var(--card-hover)'};border:1px solid ${w.enabled ? 'var(--border)' : 'var(--border-soft)'};">
        <div style="font-size:22px;opacity:${w.enabled ? 1 : 0.4};">${reg.icon}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:600;font-size:14px;opacity:${w.enabled ? 1 : 0.5};">${reg.title}</div>
          <div class="text-sm text-muted" style="font-size:11px;opacity:${w.enabled ? 1 : 0.5};">${reg.desc}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:2px;">
          <button class="btn-icon" style="padding:2px 6px;font-size:14px;${isFirst ? 'opacity:0.3;pointer-events:none;' : ''}" onclick="moveWidget('${w.id}', -1)">▲</button>
          <button class="btn-icon" style="padding:2px 6px;font-size:14px;${isLast ? 'opacity:0.3;pointer-events:none;' : ''}" onclick="moveWidget('${w.id}', 1)">▼</button>
        </div>
        <div class="checkbox ${w.enabled ? 'done' : ''}" onclick="toggleWidget('${w.id}')" style="margin-left:4px;"></div>
      </div>
    `;
  }).join('');
}

// Открыть модалку настройки
window.openWidgetsSettings = () => {
  document.getElementById('modalContent').innerHTML = `
    <div class="flex-between mb-12">
      <div style="font-size:18px;font-weight:700;">🎨 Настройка дашборда</div>
      <button class="btn-icon" onclick="closeModal()">✕</button>
    </div>
    <div class="text-sm text-muted mb-12" style="line-height:1.5;">
      Включайте нужные виджеты галочкой, меняйте порядок стрелками ▲ ▼.
    </div>
    <div id="widgetsList"></div>
    <div class="grid-2 mt-12">
      <button class="btn btn-secondary" onclick="resetWidgetsToDefault()" style="margin-top:0;">↺ Сброс</button>
      <button class="btn btn-primary" onclick="applyWidgets()" style="margin-top:0;">Сохранить</button>
    </div>
  `;
  renderWidgetSettingsList();
  document.getElementById('modal').classList.remove('hidden');
};

window.applyWidgets = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  await saveWidgets(user.id, currentWidgets);
  window.closeModal();
  window.showToast('Дашборд обновлён');
  window.refresh();
};