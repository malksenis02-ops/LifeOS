import { signIn, signUp, linkEmailToAnonymous, getSession } from './supabase.js';

let currentMode = 'login'; // 'login' | 'register' | 'link'

export async function renderAuthScreen(container, onSuccess) {
  const session = await getSession();
  const isAnonymous = session?.user && !session.user.email;
  if (isAnonymous) currentMode = 'link';

  container.innerHTML = `
    <div class="auth-screen">
      <div class="auth-logo">🌿</div>
      <h1 class="auth-title">LifeOS</h1>
      <div class="auth-subtitle">Цифровой планер для жизни</div>

      <div class="auth-tabs">
        <button class="auth-tab ${currentMode === 'login' ? 'active' : ''}" data-mode="login">Вход</button>
        <button class="auth-tab ${currentMode === 'register' ? 'active' : ''}" data-mode="register">Регистрация</button>
      </div>

      <div class="auth-form">
        <div class="input-group">
          <label>Email</label>
          <input id="auth_email" type="email" placeholder="your@email.com" autocomplete="email">
        </div>
        <div class="input-group">
          <label>Пароль</label>
          <input id="auth_password" type="password" placeholder="Минимум 6 символов" autocomplete="current-password">
        </div>
        <div id="auth_error" class="auth-error hidden"></div>
        <button class="btn btn-primary" id="auth_submit">Войти</button>
      </div>

      <div class="auth-note">
        ${isAnonymous 
          ? '💡 Привяжите email — все ваши данные сохранятся!' 
          : 'Данные синхронизируются между всеми устройствами'}
      </div>
    </div>
  `;

  const emailInput = container.querySelector('#auth_email');
  const passwordInput = container.querySelector('#auth_password');
  const submitBtn = container.querySelector('#auth_submit');
  const errorBox = container.querySelector('#auth_error');
  const tabs = container.querySelectorAll('.auth-tab');

  function updateSubmitText() {
    if (currentMode === 'login') submitBtn.textContent = 'Войти';
    else if (currentMode === 'register') submitBtn.textContent = 'Создать аккаунт';
    else submitBtn.textContent = 'Привязать email';
  }
  updateSubmitText();

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      if (isAnonymous) return; // при анонимном сеансе вкладки не переключаем
      currentMode = tab.dataset.mode;
      tabs.forEach(t => t.classList.toggle('active', t.dataset.mode === currentMode));
      updateSubmitText();
      errorBox.classList.add('hidden');
    });
  });

  const showError = (msg) => {
    errorBox.textContent = msg;
    errorBox.classList.remove('hidden');
  };

  const handleSubmit = async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    errorBox.classList.add('hidden');
    if (!email) { showError('Введите email'); return; }
    if (!password) { showError('Введите пароль'); return; }
    if (password.length < 6) { showError('Пароль должен быть минимум 6 символов'); return; }

    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.6';

    try {
      if (currentMode === 'login') {
        await signIn(email, password);
      } else if (currentMode === 'register') {
        await signUp(email, password);
      } else if (currentMode === 'link') {
        await linkEmailToAnonymous(email, password);
      }
      window.showToast('Успешно!');
      onSuccess();
    } catch (e) {
      let msg = e.message || 'Ошибка';
      if (msg.includes('Invalid login')) msg = 'Неверный email или пароль';
      else if (msg.includes('already registered')) msg = 'Этот email уже зарегистрирован. Попробуйте войти.';
      else if (msg.includes('User already registered')) msg = 'Этот email уже зарегистрирован. Попробуйте войти.';
      showError(msg);
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
    }
  };

  submitBtn.addEventListener('click', handleSubmit);
  emailInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') passwordInput.focus(); });
  passwordInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSubmit(); });
}