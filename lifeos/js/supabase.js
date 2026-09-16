import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://vxhpitfsspywyeihzttn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Sa0k4K5yvJQc4a886vRB_g_fcrW_glC';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Получить текущую сессию
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// Регистрация
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

// Вход
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

// Выход
export async function signOut() {
  await supabase.auth.signOut();
}

// Привязка email к анонимному аккаунту (сохраняет user_id и данные!)
export async function linkEmailToAnonymous(email, password) {
  const { data, error } = await supabase.auth.updateUser({ email, password });
  if (error) throw error;
  return data;
}

// Загрузка аватара в Storage
export async function uploadAvatar(userId, file) {
  const ext = file.name.split('.').pop();
  const filePath = `${userId}/avatar.${ext}`;
  const { error } = await supabase.storage.from('avatars').upload(filePath, file, {
    cacheControl: '3600',
    upsert: true
  });
  if (error) throw error;
  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
  // Добавляем timestamp чтобы сбросить кэш браузера
  return data.publicUrl + '?t=' + Date.now();
}