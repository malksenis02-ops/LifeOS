import { supabase } from './supabase.js';
import { openLibraryModal } from './modals.js';
import { t } from './i18n.js';

let currentType = 'Книга';
let searchQuery = '';

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]));
}

function renderStars(rating) {
  const r = Number(rating || 0);
  let html = '';
  for (let i = 1; i <= 5; i++) {
    let cls = 'star';
    if (r >= i) cls += ' filled';
    else if (r >= i - 0.5) cls += ' half';
    html += `<span class="${cls}">★</span>`;
  }
  return `<div class="stars-container">${html}</div>`;
}

export async function renderLibrary(user) {
  const { data: items } = await supabase.from('library').select('*').eq('user_id', user.id).eq('type', currentType).order('created_at', { ascending: false });
  const all = items || [];
  const q = searchQuery.trim().toLowerCase();
  const list = q ? all.filter(it => (it.title || '').toLowerCase().includes(q) || (it.author || '').toLowerCase().includes(q)) : all;
  const emoji = currentType === 'Книга' ? '📚' : '🎬';

  return `
    <div class="grid-2 mb-12">
      <button class="btn ${currentType === 'Книга' ? 'btn-primary' : 'btn-secondary'}" onclick="switchLibType('Книга')" style="margin-top:0;">📚 ${t('books')}</button>
      <button class="btn ${currentType === 'Фильм' ? 'btn-primary' : 'btn-secondary'}" onclick="switchLibType('Фильм')" style="margin-top:0;">🎬 ${t('movies')}</button>
    </div>

    <div class="input-group mb-12" style="position:relative;">
      <input id="libSearch" type="text" placeholder="${t('search_placeholder')}" value="${escapeHtml(searchQuery)}" oninput="onLibSearch(this.value)" style="padding-left:14px;">
      ${searchQuery ? `<button class="btn-icon" onclick="clearLibSearch()" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);">✕</button>` : ''}
    </div>

    <button class="action-btn" onclick="openLibraryModal('${currentType}')">➕ ${currentType === 'Книга' ? t('add_book') : t('add_movie')}</button>

    ${q ? `<div class="text-sm text-muted mb-12" style="text-align:center;">${t('found')}: ${list.length} / ${all.length}</div>` : ''}

    ${list.length ? list.map(item => `
      <div class="card" style="display:flex;gap:12px;align-items:flex-start;">
        <div style="width:70px;height:100px;border-radius:8px;overflow:hidden;background:rgba(0,0,0,0.08);flex-shrink:0;">
          ${item.cover_url ? `<img src="${escapeHtml(item.cover_url)}" style="width:100%;height:100%;object-fit:cover;">` : `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:28px;">${emoji}</div>`}
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:600;">${escapeHtml(item.title)}</div>
          ${item.author ? `<div class="text-sm text-muted">${escapeHtml(item.author)}</div>` : ''}
          ${item.status ? `<div class="text-sm text-muted" style="margin-top:6px;">${t(item.status) || item.status}</div>` : ''}
          <div style="margin-top:6px;">${renderStars(item.rating)}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:4px;">
          <button class="btn-icon" onclick="editLibraryItem('${currentType}', '${item.id}')">✏️</button>
          <button class="btn-icon" onclick="deleteLibraryItem('${item.id}')">✕</button>
        </div>
      </div>
    `).join('') : `<div class="empty"><div class="empty-icon">${q ? '🔍' : emoji}</div><div>${q ? t('nothing_found') : t('empty_library')}</div></div>`}
  `;
}

let searchTimer = null;
window.onLibSearch = (value) => {
  searchQuery = value;
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    const input = document.getElementById('libSearch');
    const pos = input ? input.selectionStart : 0;
    window.refresh().then(() => {
      const newInput = document.getElementById('libSearch');
      if (newInput) { newInput.focus(); newInput.setSelectionRange(pos, pos); }
    });
  }, 300);
};
window.clearLibSearch = () => { searchQuery = ''; window.refresh(); };
window.switchLibType = (type) => { currentType = type; searchQuery = ''; window.refresh(); };

window.saveLibraryItem = async (type, id) => {
  const title = document.getElementById('l_title').value.trim();
  if (!title) { window.showToast(t('enter_title')); return; }
  const payload = {
    type, title,
    author: document.getElementById('l_author').value || null,
    url: document.getElementById('l_url').value || null,
    cover_url: document.getElementById('l_url').value || null,
    status: document.getElementById('l_status').value,
    rating: Number(document.getElementById('l_rating').value),
  };
  const result = id ? await window.__updateWithUser('library', id, payload) : await window.__saveWithUser('library', payload);
  if (result.error) { window.showToast(t('error') + ': ' + result.error.message); return; }
  window.closeModal();
  window.showToast(t('saved'));
  window.refresh();
};
window.editLibraryItem = async (type, id) => {
  const { data } = await supabase.from('library').select('*').eq('id', id).single();
  if (data) openLibraryModal(type, data);
};
window.deleteLibraryItem = async (id) => {
  const isBook = currentType === 'Книга';
  const ok = await window.confirmAction(isBook ? t('del_book_msg') : t('del_movie_msg'), {
    titleText: isBook ? t('del_book_title') : t('del_movie_title'),
    iconEmoji: isBook ? '📚' : '🎬',
    okText: t('delete')
  });
  if (!ok) return;
  await supabase.from('library').delete().eq('id', id);
  window.showToast(isBook ? t('book_deleted') : t('movie_deleted'));
  window.refresh();
};