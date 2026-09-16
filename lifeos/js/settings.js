import { supabase, uploadAvatar, signOut } from './supabase.js';
import { setLang, setCurrency, t } from './i18n.js';

const THEMES = {
  classic: { nameKey: 'theme_classic', color: '#FAF4E6' },
  'soft-poppy': { nameKey: 'theme_soft_poppy', color: '#F8F6F0' },
  'cloudy-mint': { nameKey: 'theme_cloudy_mint', color: '#F1F8F5' },
  midnight: { nameKey: 'theme_midnight', color: '#0D1224' },
  'forest-noir': { nameKey: 'theme_forest_noir', color: '#16201A' },
};

const LANGUAGES = { ru: 'Русский', en: 'English' };
const CURRENCIES = { RUB: '₽ Рубль', USD: '$ Доллар', EUR: '€ Евро' };

export async function loadUserTheme(userId) {
  const { data } = await supabase.from('user_settings').select('theme').eq('user_id', userId).maybeSingle();
  return data?.theme || 'classic';
}

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta && THEMES[theme]) meta.content = THEMES[theme].color;
  localStorage.setItem('lifeos_theme', theme);
}

export async function renderSettings(user) {
  const { data } = await supabase.from('user_settings').select('*').eq('user_id', user.id).maybeSingle();
  const s = data || {};
  const isAnonymous = !user.email;

  const avatarContent = s.avatar_url
    ? `<img src="${s.avatar_url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.parentElement.innerHTML='👤'">`
    : '👤';

  return `
    <h3 class="mb-12">${t('settings')}</h3>

    <!-- ПРОФИЛЬ -->
    <div class="card mb-12">
      <div style="font-weight:700;margin-bottom:16px;">👤 ${t('profile')}</div>

      <!-- АВАТАР -->
      <div style="display:flex;flex-direction:column;align-items:center;margin-bottom:20px;">
        <div class="avatar-edit" onclick="document.getElementById('avatarInput').click()" style="position:relative;width:100px;height:100px;border-radius:50%;background:var(--accent-soft);border:2px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:40px;cursor:pointer;overflow:hidden;transition:var(--transition);">
          ${avatarContent}
          <div style="position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,0.6);color:white;font-size:10px;text-align:center;padding:4px 0;font-weight:600;">ИЗМЕНИТЬ</div>
        </div>
        <input type="file" id="avatarInput" accept="image/*" style="display:none;" onchange="handleAvatarUpload(this)">
        ${s.avatar_url ? `<button class="btn-icon" onclick="removeAvatar()" style="margin-top:8px;font-size:12px;color:var(--accent);">🗑 Удалить фото</button>` : ''}
      </div>

      <!-- EMAIL статус -->
      <div class="card" style="background:var(--accent-soft);padding:12px;margin-bottom:14px;">
        ${isAnonymous ? `
          <div class="text-sm" style="line-height:1.5;">⚠️ <b>Анонимный режим.</b> Данные хранятся только на этом устройстве. Чтобы войти с другого устройства — привяжите email.</div>
        ` : `
          <div class="text-sm" style="line-height:1.5;">✅ Вы вошли как <b>${user.email}</b></div>
        `}
      </div>

      <div class="input-group">
        <label>${t('your_name')}</label>
        <input id="set_name" value="${s.name || ''}" placeholder="${t('name_placeholder')}">
      </div>
      <div class="input-group">
        <label>${t('language')}</label>
        <select id="set_lang">${Object.entries(LANGUAGES).map(([k, v]) => `<option value="${k}" ${s.language === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
      </div>
      <div class="input-group">
        <label>${t('currency')}</label>
        <select id="set_currency">${Object.entries(CURRENCIES).map(([k, v]) => `<option value="${k}" ${s.currency === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
      </div>
      <button class="btn btn-primary" onclick="saveProfile()">💾 ${t('save_profile')}</button>
    </div>

    <!-- ТЕМА -->
    <div class="card mb-12">
      <div style="font-weight:700;margin-bottom:12px;">🎨 ${t('theme')}</div>
      ${Object.entries(THEMES).map(([key, th]) => `
        <div class="flex-between" style="padding:10px 0;cursor:pointer;border-bottom:1px solid var(--border-soft);" onclick="changeTheme('${key}')">
          <div class="flex-center gap-8">
            <div style="width:22px;height:22px;border-radius:50%;background:${th.color};border:1px solid var(--border);"></div>
            <div>${t(th.nameKey)}</div>
          </div>
          ${s.theme === key ? '<span style="color:var(--accent);font-size:18px;">✓</span>' : ''}
        </div>
      `).join('')}
    </div>

    <!-- ID -->
    <div class="card mb-12">
      <div style="font-weight:700;margin-bottom:8px;">🆔 ${t('user_id')}</div>
      <div class="text-sm text-muted" style="word-break:break-all;font-size:11px;">${user.id}</div>
    </div>

    <!-- ВЫХОД -->
    <div class="card mb-12" onclick="handleSignOut()" style="cursor:pointer;color:var(--accent);text-align:center;font-weight:600;">
      🚪 Выйти из аккаунта
    </div>

    <!-- ОЧИСТКА -->
    <div class="card" onclick="resetAllData()" style="cursor:pointer;color:var(--accent);text-align:center;font-weight:600;">
      🗑 ${t('clear_all')}
    </div>
  `;
}

// ==================== АВАТАР ====================
window.handleAvatarUpload = async (input) => {
  const file = input.files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    window.showToast('Максимум 2 МБ');
    return;
  }
  if (!file.type.startsWith('image/')) {
    window.showToast('Только изображения');
    return;
  }

  try {
    window.showToast('Загрузка...');
    const { data: { user } } = await supabase.auth.getUser();
    const url = await uploadAvatar(user.id, file);
    await supabase.from('user_settings').upsert({ user_id: user.id, avatar_url: url }, { onConflict: 'user_id' });

    // Обновляем аватар в бургере
    const burgerAvatar = document.getElementById('burgerAvatar');
    if (burgerAvatar) burgerAvatar.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;

    window.showToast('Аватар обновлён ✓');
    window.refresh();
  } catch (e) {
    window.showToast('Ошибка: ' + e.message);
  }
};

window.removeAvatar = async () => {
  const ok = await window.confirmAction('Удалить фото профиля?', { titleText: 'Удалить аватар?', iconEmoji: '🖼️', okText: 'Удалить' });
  if (!ok) return;
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from('user_settings').upsert({ user_id: user.id, avatar_url: null }, { onConflict: 'user_id' });
  document.getElementById('burgerAvatar').innerHTML = '👤';
  window.showToast('Аватар удалён');
  window.refresh();
};

// ==================== ПРОФИЛЬ ====================
window.saveProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  const name = document.getElementById('set_name').value.trim();
  const language = document.getElementById('set_lang').value;
  const currency = document.getElementById('set_currency').value;
  const theme = localStorage.getItem('lifeos_theme') || 'classic';

  const { data: existing } = await supabase.from('user_settings').select('avatar_url').eq('user_id', user.id).maybeSingle();

  const { error } = await supabase.from('user_settings').upsert(
    { user_id: user.id, name, language, currency, theme, avatar_url: existing?.avatar_url || null },
    { onConflict: 'user_id' }
  );
  if (error) { window.showToast('Ошибка: ' + error.message); return; }

  setLang(language);
  setCurrency(currency);
  document.getElementById('burgerUserName').textContent = name || t('user');
  if (window.__updateHeaderAndMenu) window.__updateHeaderAndMenu();
  window.showToast(t('profile_saved'));
  window.refresh();
};

window.changeTheme = async (theme) => {
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from('user_settings').upsert({ user_id: user.id, theme }, { onConflict: 'user_id' });
  applyTheme(theme);
  window.showToast(t('theme_changed'));
  window.refresh();
};

// ==================== ВЫХОД ====================
window.handleSignOut = async () => {
  const ok = await window.confirmAction('Вы уверены что хотите выйти?', { titleText: 'Выход', iconEmoji: '🚪', okText: 'Выйти' });
  if (!ok) return;
  await signOut();
  window.location.reload();
};

// ==================== ОЧИСТКА ДАННЫХ ====================
window.resetAllData = async () => {
  const ok = await window.confirmAction(t('clear_all') + '?', {
    titleText: t('clear_all'), iconEmoji: '🗑️', okText: t('delete')
  });
  if (!ok) return;
  const { data: { user } } = await supabase.auth.getUser();
  const tables = ['tasks','finance_ops','finance_budgets','finance_savings','habits','habit_log','time_log','time_templates','library','external_data'];
  for (const tbl of tables) await supabase.from(tbl).delete().eq('user_id', user.id);
  window.showToast(t('data_cleared'));
  window.refresh();
};