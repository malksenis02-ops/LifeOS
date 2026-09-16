import { supabase } from './supabase.js';
import { openFinanceOpModal, openSavingsModal } from './modals.js';
import { t, formatMoney, getMonths } from './i18n.js';

let currentMonth = new Date().toISOString().slice(0, 7);

function getMonthName() {
  const m = Number(currentMonth.split('-')[1]);
  return getMonths()[m - 1];
}
function getYear() { return currentMonth.split('-')[0]; }

export async function renderFinance(user) {
  const monthStart = currentMonth + '-01';
  const monthEnd = new Date(new Date(monthStart).getFullYear(), new Date(monthStart).getMonth() + 1, 0).toISOString().slice(0, 10);

  const [opsRes, budgetsRes, savingsRes, allOpsRes] = await Promise.all([
    supabase.from('finance_ops').select('*').eq('user_id', user.id).gte('date', monthStart).lte('date', monthEnd).order('date', { ascending: false }),
    supabase.from('finance_budgets').select('*').eq('user_id', user.id).eq('month', currentMonth),
    supabase.from('finance_savings').select('*').eq('user_id', user.id),
    supabase.from('finance_ops').select('type, amount').eq('user_id', user.id)
  ]);

  const ops = opsRes.data || [];
  const budgets = budgetsRes.data || [];
  const savings = savingsRes.data || [];
  const allOps = allOpsRes.data || [];

  const monthIncome = ops.filter(o => o.type === 'Доход').reduce((s, o) => s + Number(o.amount), 0);
  const monthExpense = ops.filter(o => o.type === 'Расход').reduce((s, o) => s + Number(o.amount), 0);
  const totalIncome = allOps.filter(o => o.type === 'Доход').reduce((s, o) => s + Number(o.amount), 0);
  const totalExpense = allOps.filter(o => o.type === 'Расход').reduce((s, o) => s + Number(o.amount), 0);
  const totalBalance = totalIncome - totalExpense;
  const totalSavings = savings.reduce((s, it) => s + Number(it.current_amount || 0), 0);

  const budgetCats = ['fin_housing','fin_transport','fin_food','fin_health','fin_fun','fin_obligatory','fin_connection','fin_other'];

  return `
    <div class="month-year-nav">
      <div class="month-year-center">
        <button class="month-btn" onclick="openFinanceMonthPicker()"><span>${getMonthName()}</span><span class="arrow">▼</span></button>
        <button class="year-btn" onclick="openFinanceYearPicker()"><span>${getYear()}</span><span class="arrow">▼</span></button>
      </div>
    </div>

    <div class="grid-2 mb-12">
      <div class="widget" style="text-align:center;"><div class="widget-title">${t('income')}</div><div style="font-size:18px;font-weight:700;color:var(--accent2);">+${formatMoney(monthIncome)}</div></div>
      <div class="widget" style="text-align:center;"><div class="widget-title">${t('expense')}</div><div style="font-size:18px;font-weight:700;color:var(--accent);">−${formatMoney(monthExpense)}</div></div>
      <div class="widget" style="text-align:center;"><div class="widget-title">${t('savings_label')}</div><div style="font-size:18px;font-weight:700;">${formatMoney(totalSavings)}</div></div>
      <div class="widget" style="text-align:center;"><div class="widget-title">${t('balance_all_label')}</div><div style="font-size:18px;font-weight:700;color:${totalBalance >= 0 ? 'var(--accent2)' : 'var(--accent)'};">${formatMoney(totalBalance)}</div></div>
    </div>

    <div class="flex-between mb-12">
      <div style="font-weight:700;">${t('operations')}</div>
      <button class="action-btn" style="width:auto;margin:0;padding:8px 16px;font-size:14px;" onclick="openFinanceOpModal()">➕ ${t('add_operation')}</button>
    </div>
    ${ops.length ? ops.map(o => `
      <div class="card flex-between gap-8">
        <div style="flex:1;">
          <div style="font-weight:600;font-size:14px;">${t(o.category) || o.category}</div>
          <div class="text-sm text-muted">${o.date}</div>
        </div>
        <div style="font-weight:700;color:${o.type === 'Доход' ? 'var(--accent2)' : 'var(--accent)'};">
          ${o.type === 'Доход' ? '+' : '−'}${formatMoney(o.amount)}
        </div>
        <button class="btn-icon" onclick="editFinanceOp('${o.id}')">✏️</button>
        <button class="btn-icon" onclick="deleteFinanceOp('${o.id}')">✕</button>
      </div>
    `).join('') : `<div class="empty" style="padding:20px;">${t('no_ops_month')}</div>`}

    <div class="flex-between mb-12 mt-12">
      <div style="font-weight:700;">${t('budget_planning')}</div>
      <button class="btn-icon" onclick="saveBudget()">💾</button>
    </div>
    <div class="card">
      ${budgetCats.map(cat => {
        const b = budgets.find(bb => bb.category === cat);
        const planned = b ? b.amount : 0;
        return `
          <div class="flex-between gap-8 mb-12">
            <div style="flex:1;font-size:14px;">${t(cat)}</div>
            <input type="number" id="budget_${cat}" value="${planned}" style="width:100px;padding:8px;text-align:right;" placeholder="0">
          </div>
        `;
      }).join('')}
    </div>

    <div class="flex-between mb-12 mt-12">
      <div style="font-weight:700;">${t('savings_label')}</div>
      <button class="action-btn" style="width:auto;margin:0;padding:8px 16px;font-size:14px;" onclick="openSavingsModal()">➕ ${t('add_savings')}</button>
    </div>
    ${savings.length ? savings.map(s => `
      <div class="card flex-between gap-8">
        <div style="flex:1;">
          <div style="font-weight:600;">${s.name}</div>
          <div class="text-sm text-muted">${formatMoney(s.current_amount)} / ${formatMoney(s.target_amount)}</div>
        </div>
        <button class="btn-icon" onclick="editSavings('${s.id}')">✏️</button>
        <button class="btn-icon" onclick="deleteSavings('${s.id}')">✕</button>
      </div>
    `).join('') : `<div class="empty" style="padding:20px;">${t('no_savings')}</div>`}
  `;
}

window.openFinanceMonthPicker = () => {
  const currentM = Number(currentMonth.split('-')[1]);
  document.getElementById('pickerTitle').textContent = t('choose_month');
  document.getElementById('pickerContent').innerHTML = `
    <div class="grid-3" style="gap:8px;">
      ${getMonths().map((name, i) => `
        <div class="picker-month ${i + 1 === currentM ? 'active' : ''}" onclick="selectFinanceMonth(${i + 1})">${name}</div>
      `).join('')}
    </div>
  `;
  document.getElementById('pickerModal').classList.remove('hidden');
};
window.selectFinanceMonth = (m) => {
  const [y] = currentMonth.split('-');
  currentMonth = `${y}-${String(m).padStart(2, '0')}`;
  window.closePicker();
  window.refresh();
};
window.openFinanceYearPicker = () => {
  const currentY = Number(currentMonth.split('-')[0]);
  const nowY = new Date().getFullYear();
  document.getElementById('pickerTitle').textContent = t('choose_year');
  let html = '';
  for (let year = nowY + 10; year >= nowY - 10; year--) {
    html += `<div class="picker-year ${year === currentY ? 'active' : ''}" onclick="selectFinanceYear(${year})">${year}</div>`;
  }
  document.getElementById('pickerContent').innerHTML = `<div class="picker-years-scroll">${html}</div>`;
  document.getElementById('pickerModal').classList.remove('hidden');
  setTimeout(() => {
    const active = document.getElementById('pickerContent').querySelector('.picker-year.active');
    if (active) active.scrollIntoView({ block: 'center' });
  }, 50);
};
window.selectFinanceYear = (year) => {
  const [, m] = currentMonth.split('-');
  currentMonth = `${year}-${m}`;
  window.closePicker();
  window.refresh();
};
window.closePicker = () => { document.getElementById('pickerModal').classList.add('hidden'); };
document.addEventListener('click', (e) => {
  const modal = document.getElementById('pickerModal');
  if (modal && !modal.classList.contains('hidden') && e.target === modal) window.closePicker();
});

window.saveBudget = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  const cats = ['fin_housing','fin_transport','fin_food','fin_health','fin_fun','fin_obligatory','fin_connection','fin_other'];
  for (const cat of cats) {
    const val = document.getElementById(`budget_${cat}`).value;
    await supabase.from('finance_budgets').upsert({ user_id: user.id, month: currentMonth, category: cat, amount: Number(val) || 0 }, { onConflict: 'user_id, month, category' });
  }
  window.showToast(t('budget_saved'));
};

window.saveFinanceOp = async (id) => {
  const amount = document.getElementById('f_amount').value;
  if (!amount) { window.showToast(t('enter_amount')); return; }
  const payload = {
    type: document.getElementById('f_type').value,
    amount: Number(amount),
    category: document.getElementById('f_category').value,
    date: document.getElementById('f_date').value,
    note: document.getElementById('f_note').value || null,
  };
  const result = id ? await window.__updateWithUser('finance_ops', id, payload) : await window.__saveWithUser('finance_ops', payload);
  if (result.error) { window.showToast(t('error') + ': ' + result.error.message); return; }
  window.closeModal();
  window.showToast(t('saved'));
  window.refresh();
};
window.editFinanceOp = async (id) => {
  const { data } = await supabase.from('finance_ops').select('*').eq('id', id).single();
  if (data) openFinanceOpModal(data);
};
window.deleteFinanceOp = async (id) => {
  const ok = await window.confirmAction(t('del_op_msg'), { titleText: t('del_op_title'), iconEmoji: '💸', okText: t('delete') });
  if (!ok) return;
  await supabase.from('finance_ops').delete().eq('id', id);
  window.showToast(t('op_deleted'));
  window.refresh();
};
window.saveSavings = async (id) => {
  const name = document.getElementById('s_name').value.trim();
  if (!name) { window.showToast(t('enter_title')); return; }
  const payload = {
    name,
    start_date: document.getElementById('s_start').value,
    deadline: document.getElementById('s_deadline').value || null,
    current_amount: Number(document.getElementById('s_current').value) || 0,
    target_amount: Number(document.getElementById('s_target').value) || 0,
  };
  const result = id ? await window.__updateWithUser('finance_savings', id, payload) : await window.__saveWithUser('finance_savings', payload);
  if (result.error) { window.showToast(t('error') + ': ' + result.error.message); return; }
  window.closeModal();
  window.showToast(t('saved'));
  window.refresh();
};
window.editSavings = async (id) => {
  const { data } = await supabase.from('finance_savings').select('*').eq('id', id).single();
  if (data) openSavingsModal(data);
};
window.deleteSavings = async (id) => {
  const ok = await window.confirmAction(t('del_saving_msg'), { titleText: t('del_saving_title'), iconEmoji: '🏦', okText: t('delete') });
  if (!ok) return;
  await supabase.from('finance_savings').delete().eq('id', id);
  window.showToast(t('saving_deleted'));
  window.refresh();
};