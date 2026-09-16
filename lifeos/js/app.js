import { supabase, getSession } from './supabase.js';
import { renderAuthScreen } from './auth.js';
import { setLang, setCurrency, t, getDays, getMonths } from './i18n.js';
import { renderDashboard } from './dashboard.js';
import { renderDaily } from './daily.js';
import { renderFinance } from './finance.js';
import { renderSchedule } from './schedule.js';
import { renderLibrary } from './library.js';
import { renderAnalytics } from './analytics.js';
import { renderDates } from './dates.js';
import { renderSettings, applyTheme } from './settings.js';
import { renderHabits } from './habits.js';
import { renderMore } from './more.js';
import { closeModal } from './modals.js';
import './widgets.js';

const routes = {
  dashboard: renderDashboard, daily: renderDaily, finance: renderFinance,
  schedule: renderSchedule, dates: renderDates, habits: renderHabits,
  library: renderLibrary, analytics: renderAnalytics, settings: renderSettings, more: renderMore,
};

let currentUser = null;
let currentTab = 'dashboard';

// ==================== ГЛОБАЛЬНЫЕ УТИЛИТЫ ====================
window.showToast = (msg) => {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
};

window.closeModal = closeModal;
window.t = t;

// CONFIRM
window.confirmAction = (message, options = {}) => {
  return new Promise((resolve) => {
    const modal = document.getElementById('confirmModal');
    const icon = document.getElementById('confirmIcon');
    const title = document.getElementById('confirmTitle');
    const msg = document.getElementById('confirmMessage');
    const okBtn = document.getElementById('confirmOk');
    const cancelBtn = document.getElementById('confirmCancel');

    const {
      titleText = t('confirm_delete'),
      iconEmoji = '⚠️',
      okText = t('delete'),
      cancelText = t('cancel'),
      danger = true
    } = options;

    icon.textContent = iconEmoji;
    title.textContent = titleText;
    msg.textContent = message;
    okBtn.textContent = okText;
    cancelBtn.textContent = cancelText;
    okBtn.className = 'confirm-btn confirm-btn-ok' + (danger ? ' danger' : '');

    modal.classList.remove('hidden');

    const cleanup = () => {
      modal.classList.add('hidden');
      okBtn.onclick = null; cancelBtn.onclick = null; modal.onclick = null;
    };
    okBtn.onclick = () => { cleanup(); resolve(true); };
    cancelBtn.onclick = () => { cleanup(); resolve(false); };
    modal.onclick = (e) => { if (e.target === modal) { cleanup(); resolve(false); } };
  });
};

// SAVE/UPDATE
window.__saveWithUser = async (table, payload) => {
  if (!currentUser) throw new Error('Not authorized');
  return await supabase.from(table).insert({ ...payload, user_id: currentUser.id }).select();
};
window.__updateWithUser = async (table, id, payload) => {
  if (!currentUser) throw new Error('Not authorized');
  return await supabase.from(table).update(payload).eq('id', id).eq('user_id', currentUser.id);
};

// NAV
window.switchTab = (tab) => {
  currentTab = tab;
  document.getElementById('burgerMenu').classList.remove('open');
  window.refresh();
};

window.refresh = async () => {
  const view = document.getElementById('view');
  if (!view) return;
  view.innerHTML = `<div class="empty"><div class="empty-icon">⏳</div><div>${t('loading')}</div></div>`;
  try {
    const fn = routes[currentTab];
    if (!fn) { view.innerHTML = '<div class="empty">Section not found</div>'; return; }
    const html = await fn(currentUser);
    view.innerHTML = html;
    document.querySelectorAll('.menu-link').forEach(b => b.classList.toggle('active', b.dataset.tab === currentTab));
  } catch (e) {
    console.error('render error:', e);
    view.innerHTML = `<div class="empty"><div class="empty-icon">⚠️</div><div>${e.message}</div></div>`;
  }
};

function updateHeaderDate() {
  const el = document.getElementById('headerDate');
  if (!el) return;
  const now = new Date();
  el.textContent = `${getDays()[now.getDay()]}, ${now.getDate()} ${getMonths()[now.getMonth()].toLowerCase()}`;
}

function updateMenuText() {
  const map = {
    dashboard: '🏠 ' + t('dashboard'), daily: '📅 ' + t('daily'), finance: '💰 ' + t('finance'),
    schedule: '⏱️ ' + t('schedule'), dates: '📌 ' + t('dates'), habits: '🌱 ' + t('habits'),
    library: '📚 ' + t('library'), analytics: '📊 ' + t('analytics'), settings: '⚙️ ' + t('settings'),
  };
  document.querySelectorAll('.menu-link').forEach(btn => {
    if (map[btn.dataset.tab]) btn.textContent = map[btn.dataset.tab];
  });
}

window.__updateHeaderAndMenu = () => { updateHeaderDate(); updateMenuText(); };

// ==================== ЗАГРУЗКА ПОЛЬЗОВАТЕЛЯ ====================
async function loadUser() {
  const session = await getSession();
  if (!session) return false;
  currentUser = session.user;

  try {
    const { data: settings } = await supabase.from('user_settings').select('*').eq('user_id', currentUser.id).maybeSingle();
    setLang(settings?.language || 'ru');
    setCurrency(settings?.currency || 'RUB');
    applyTheme(settings?.theme || 'classic');
    document.getElementById('burgerUserName').textContent = settings?.name || t('user');

    // Аватар
    const avatarEl = document.getElementById('burgerAvatar');
    if (avatarEl) {
      if (settings?.avatar_url) {
        avatarEl.innerHTML = `<img src="${settings.avatar_url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.parentElement.innerHTML='👤'">`;
      } else {
        avatarEl.innerHTML = '👤';
      }
    }
  } catch (e) {
    console.warn('Settings load error:', e.message);
  }

  updateHeaderDate();
  updateMenuText();
  return true;
}

// ==================== UI-НАСТРОЙКА ====================
function setupBurgerMenu() {
  const burgerBtn = document.getElementById('burgerBtn');
  const burgerMenu = document.getElementById('burgerMenu');
  
  // Убираем старые обработчики если есть
  const newBtn = burgerBtn.cloneNode(true);
  burgerBtn.parentNode.replaceChild(newBtn, burgerBtn);

  newBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    burgerMenu.classList.toggle('open');
  });

  document.querySelectorAll('.menu-link').forEach(btn => {
    const newLink = btn.cloneNode(true);
    btn.parentNode.replaceChild(newLink, btn);
    newLink.addEventListener('click', () => window.switchTab(newLink.dataset.tab));
  });

  document.addEventListener('click', (e) => {
    if (burgerMenu.classList.contains('open') && !burgerMenu.contains(e.target) && !newBtn.contains(e.target)) {
      burgerMenu.classList.remove('open');
    }
  });
}

// ==================== INIT ====================
async function init() {
  const appEl = document.querySelector('.app');
  const burgerEl = document.getElementById('burgerMenu');

  // Проверяем сессию
  const session = await getSession();
  if (!session) {
    // Показываем экран входа
    if (appEl) appEl.style.display = 'none';
    if (burgerEl) burgerEl.style.display = 'none';
    
    let authContainer = document.getElementById('authContainer');
    if (!authContainer) {
      authContainer = document.createElement('div');
      authContainer.id = 'authContainer';
      document.body.appendChild(authContainer);
    }
    authContainer.style.display = 'block';

    await renderAuthScreen(authContainer, async () => {
      // После успешного входа перезагружаем приложение
      setTimeout(() => window.location.reload(), 500);
    });
    return;
  }

  // Есть сессия → показываем приложение
  if (appEl) appEl.style.display = '';
  if (burgerEl) burgerEl.style.display = '';
  const authContainer = document.getElementById('authContainer');
  if (authContainer) authContainer.style.display = 'none';

  const ok = await loadUser();
  if (!ok) return;

  setupBurgerMenu();
  window.switchTab('dashboard');
}

document.addEventListener('DOMContentLoaded', init);