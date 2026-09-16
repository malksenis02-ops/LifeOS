const translations = {
  ru: {
    // Меню
    dashboard: 'Дашборд', daily: 'Ежедневник', finance: 'Финансы', schedule: 'Рабочий календарь',
    dates: 'Важные даты', habits: 'Привычки', library: 'Библиотека', analytics: 'Аналитика', settings: 'Настройки',
    // Общее
    save: 'Сохранить', cancel: 'Отмена', delete: 'Удалить', edit: 'Редактировать',
    user: 'Пользователь', close: 'Закрыть', click_to_select: 'нажмите чтобы выбрать ▼',
    loading: 'Загрузка…', no_data: 'Нет данных', all: 'Все',
    // Приветствия
    morning: 'Доброе утро', day: 'Добрый день', evening: 'Добрый вечер', night: 'Доброй ночи',
    // Дашборд
    tasks_today: 'Задачи на сегодня', habits_today: 'Привычки на сегодня',
    wallet: 'Кошелёк', balance_all: 'Баланс за всё время', savings_label: 'Накопления',
    upcoming_events: 'Ближайшие события', no_events: 'Нет ближайших событий',
    carried_over: 'Перенесено с прошлых дней', all_dates: 'Все важные даты',
    no_tasks: 'Нет задач', no_habits: 'Нет привычек', done: 'Выполнено', remaining: 'Осталось',
    // Ежедневник
    add_task: 'ЗАДАЧА +', today: 'Сегодня', tomorrow: 'Завтра', yesterday: 'Вчера',
    tasks_on: 'Задачи на', no_tasks_day: 'Нет задач на этот день',
    new_task: 'Новая задача', edit_task: 'Редактировать задачу',
    title_label: 'Название', category_label: 'Категория', priority_label: 'Приоритет',
    date_label: 'Дата', time_start: 'Время начала', time_end: 'Время окончания',
    // Категории задач
    cat_home: 'Дом', cat_work: 'Работа', cat_study: 'Учеба', cat_health: 'Здоровье',
    cat_family: 'Семья', cat_dev: 'Развитие', cat_finance: 'Финансы', cat_personal: 'Личное', cat_other: 'Прочее',
    // Приоритет
    priority_high: 'Высокий', priority_medium: 'Средний', priority_low: 'Низкий',
    // Финансы
    income: 'Доходы', expense: 'Расходы', balance_all_label: 'Баланс (всего)',
    operations: 'Операции', add_operation: 'Операция +', budget_planning: 'Планирование бюджета',
    add_savings: 'Накопления +', no_ops_month: 'Нет операций за этот месяц', no_savings: 'Нет накоплений',
    new_operation: 'Новая операция', edit_operation: 'Редактировать операцию',
    operation_type: 'Тип', amount_rub: 'Сумма', note: 'Примечание',
    income_type: 'Доход', expense_type: 'Расход',
    // Финансовые категории
    fin_salary: 'Зарплата', fin_side: 'Подработка', fin_gift: 'Подарок',
    fin_housing: 'Жилье', fin_transport: 'Транспорт', fin_food: 'Еда', fin_health: 'Здоровье',
    fin_fun: 'Развлечение', fin_obligatory: 'Обязательный платеж', fin_connection: 'Связь', fin_other: 'Прочее',
    // Накопления
    new_saving: 'Новое накопление', edit_saving: 'Редактировать накопление',
    start_date: 'Дата начала', deadline: 'Дедлайн', accumulated: 'Накоплено', target_amount: 'Необходимо накопить',
    // График
    hours: 'Часов', night_hours: 'Ночных', shifts: 'Смен',
    templates: 'Шаблоны смен', add_template: 'ШАБЛОН +', calendar_click: 'Календарь (нажмите на день)',
    no_templates: 'Нет шаблонов', recalc_all: '🔄 Пересчитать все часы',
    new_template: 'Новый шаблон смены', edit_template: 'Редактировать шаблон',
    shift_name: 'Название', shift_start: 'Время начала', shift_end: 'Время окончания',
    shifts_for: 'Смены', planned: 'Запланировано', no_shifts_day: 'Нет смен на этот день',
    add_from_template: 'Добавить из шаблона', recalc_hours: 'Пересчитать часы',
    // Привычки
    habit: 'Привычка', add_habit: 'ПРИВЫЧКА +', no_habits_list: 'Нет привычек. Добавьте первую!',
    new_habit: 'Новая привычка', edit_habit: 'Редактировать привычку',
    icon: 'Иконка (эмодзи)',
    // Библиотека
    books: 'Книги', movies: 'Фильмы', search_placeholder: '🔍 Поиск по названию или автору…',
    add_book: 'Добавить книгу', add_movie: 'Добавить фильм',
    found: 'Найдено', nothing_found: 'Ничего не найдено', empty_library: 'Пусто. Добавьте первую',
    new_item: 'Добавить', edit_item: 'Редактировать',
    cover_url: 'URL обложки', author_director: 'Автор / Режиссёр', status: 'Статус', rating: 'Рейтинг',
    want_to_read: 'Хочу прочитать', reading: 'Читаю', read_done: 'Прочитано',
    want_to_watch: 'Хочу посмотреть', watching: 'Смотрю', watched: 'Просмотрено',
    // Даты
    add_date: 'Добавить важную дату', upcoming: 'Предстоящие', past: 'Прошедшие',
    no_dates: 'Нет важных дат', new_date: 'Новая важная дата', edit_date: 'Редактировать дату',
    repeat_yearly: '🔄 Повторять ежегодно',
    cat_birthday: 'День рождения', cat_holiday: 'Праздник', cat_anniversary: 'Годовщина', cat_other_date: 'Прочее',
    through: 'через', days_ago: 'дн. назад',
    // Аналитика
    analytics_tasks: 'Задачи', analytics_habits: 'Привычки', analytics_hours: 'Рабочие часы',
    analytics_finance: 'Финансы', analytics_books: 'Книг', analytics_movies: 'Фильмов',
    // Настройки
    profile: 'Профиль', your_name: 'Ваше имя (для приветствия)', name_placeholder: 'Например: Анна',
    language: 'Язык', currency: 'Валюта', save_profile: 'Сохранить профиль',
    theme: 'Тема оформления', user_id: 'ID пользователя', clear_all: 'Очистить все данные',
    theme_classic: 'Классическая', theme_soft_poppy: 'Мягкий лён', theme_cloudy_mint: 'Облачная мята',
    theme_midnight: 'Полночная мгла', theme_forest_noir: 'Лесной нудр',
    // Подтверждения
    confirm_delete: 'Подтвердите действие', confirm_msg: 'Вы уверены?',
    del_task_title: 'Удалить задачу?', del_task_msg: 'Задача будет удалена безвозвратно. Продолжить?',
    del_op_title: 'Удалить операцию?', del_op_msg: 'Операция будет удалена безвозвратно. Продолжить?',
    del_saving_title: 'Удалить накопление?', del_saving_msg: 'Накопление будет удалено безвозвратно. Продолжить?',
    del_shift_title: 'Удалить смену?', del_shift_msg: 'Смена будет удалена из календаря. Продолжить?',
    del_template_title: 'Удалить шаблон?', del_template_msg: 'Шаблон будет удалён. Уже добавленные смены останутся. Продолжить?',
    del_habit_title: 'Удалить привычку?', del_habit_msg: 'Привычка и все её отметки будут удалены. Продолжить?',
    del_book_title: 'Удалить книгу?', del_book_msg: 'Книга будет удалена из библиотеки. Продолжить?',
    del_movie_title: 'Удалить фильм?', del_movie_msg: 'Фильм будет удалён из библиотеки. Продолжить?',
    del_date_title: 'Удалить дату?', del_date_msg: 'Дата будет удалена безвозвратно. Продолжить?',
    recalc_title: 'Пересчитать часы?', recalc_msg: 'Пересчитать часы всех смен месяца?',
    // Тосты
    saved: 'Сохранено', deleted: 'Удалено', updated: 'Обновлено', added: 'Добавлено',
    task_added: 'Задача добавлена', task_updated: 'Задача обновлена', task_deleted: 'Задача удалена',
    enter_title: 'Введите название', enter_amount: 'Введите сумму', enter_date: 'Выберите дату',
    budget_saved: 'Бюджет сохранён', op_deleted: 'Операция удалена', saving_deleted: 'Накопление удалено',
    shift_added: 'Смена добавлена', shift_deleted: 'Смена удалена', template_saved: 'Шаблон сохранён',
    template_deleted: 'Шаблон удалён', recalc_shift: 'Пересчитано', habit_added: 'Привычка добавлена',
    habit_updated: 'Привычка обновлена', habit_deleted: 'Привычка удалена',
    book_deleted: 'Книга удалена', movie_deleted: 'Фильм удалён',
    date_added: 'Дата добавлена', date_updated: 'Дата обновлена', date_deleted: 'Дата удалена',
    profile_saved: 'Профиль сохранён', theme_changed: 'Тема изменена', data_cleared: 'Все данные удалены',
    // Месяцы/дни
    choose_month: 'Выберите месяц', choose_year: 'Выберите год', choose_day: 'Выберите день',
    error: 'Ошибка'
  },
  en: {
    // Menu
    dashboard: 'Dashboard', daily: 'Daily', finance: 'Finance', schedule: 'Work Calendar',
    dates: 'Important Dates', habits: 'Habits', library: 'Library', analytics: 'Analytics', settings: 'Settings',
    // Common
    save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit',
    user: 'User', close: 'Close', click_to_select: 'click to select ▼',
    loading: 'Loading…', no_data: 'No data', all: 'All',
    // Greetings
    morning: 'Good morning', day: 'Good afternoon', evening: 'Good evening', night: 'Good night',
    // Dashboard
    tasks_today: 'Tasks for today', habits_today: 'Habits for today',
    wallet: 'Wallet', balance_all: 'Balance (all time)', savings_label: 'Savings',
    upcoming_events: 'Upcoming events', no_events: 'No upcoming events',
    carried_over: 'Carried over from previous days', all_dates: 'All important dates',
    no_tasks: 'No tasks', no_habits: 'No habits', done: 'Done', remaining: 'Remaining',
    // Daily
    add_task: 'TASK +', today: 'Today', tomorrow: 'Tomorrow', yesterday: 'Yesterday',
    tasks_on: 'Tasks for', no_tasks_day: 'No tasks for this day',
    new_task: 'New task', edit_task: 'Edit task',
    title_label: 'Title', category_label: 'Category', priority_label: 'Priority',
    date_label: 'Date', time_start: 'Start time', time_end: 'End time',
    // Task categories
    cat_home: 'Home', cat_work: 'Work', cat_study: 'Study', cat_health: 'Health',
    cat_family: 'Family', cat_dev: 'Development', cat_finance: 'Finance', cat_personal: 'Personal', cat_other: 'Other',
    // Priority
    priority_high: 'High', priority_medium: 'Medium', priority_low: 'Low',
    // Finance
    income: 'Income', expense: 'Expenses', balance_all_label: 'Balance (total)',
    operations: 'Operations', add_operation: 'Operation +', budget_planning: 'Budget planning',
    add_savings: 'Savings +', no_ops_month: 'No operations for this month', no_savings: 'No savings',
    new_operation: 'New operation', edit_operation: 'Edit operation',
    operation_type: 'Type', amount_rub: 'Amount', note: 'Note',
    income_type: 'Income', expense_type: 'Expense',
    // Finance categories
    fin_salary: 'Salary', fin_side: 'Side job', fin_gift: 'Gift',
    fin_housing: 'Housing', fin_transport: 'Transport', fin_food: 'Food', fin_health: 'Health',
    fin_fun: 'Entertainment', fin_obligatory: 'Obligatory payment', fin_connection: 'Communication', fin_other: 'Other',
    // Savings
    new_saving: 'New saving', edit_saving: 'Edit saving',
    start_date: 'Start date', deadline: 'Deadline', accumulated: 'Accumulated', target_amount: 'Target amount',
    // Schedule
    hours: 'Hours', night_hours: 'Night', shifts: 'Shifts',
    templates: 'Shift templates', add_template: 'TEMPLATE +', calendar_click: 'Calendar (click a day)',
    no_templates: 'No templates', recalc_all: '🔄 Recalculate all hours',
    new_template: 'New shift template', edit_template: 'Edit template',
    shift_name: 'Name', shift_start: 'Start time', shift_end: 'End time',
    shifts_for: 'Shifts', planned: 'Planned', no_shifts_day: 'No shifts for this day',
    add_from_template: 'Add from template', recalc_hours: 'Recalculate hours',
    // Habits
    habit: 'Habit', add_habit: 'HABIT +', no_habits_list: 'No habits. Add the first one!',
    new_habit: 'New habit', edit_habit: 'Edit habit',
    icon: 'Icon (emoji)',
    // Library
    books: 'Books', movies: 'Movies', search_placeholder: '🔍 Search by title or author…',
    add_book: 'Add book', add_movie: 'Add movie',
    found: 'Found', nothing_found: 'Nothing found', empty_library: 'Empty. Add the first one',
    new_item: 'Add', edit_item: 'Edit',
    cover_url: 'Cover URL', author_director: 'Author / Director', status: 'Status', rating: 'Rating',
    want_to_read: 'Want to read', reading: 'Reading', read_done: 'Read',
    want_to_watch: 'Want to watch', watching: 'Watching', watched: 'Watched',
    // Dates
    add_date: 'Add important date', upcoming: 'Upcoming', past: 'Past',
    no_dates: 'No important dates', new_date: 'New important date', edit_date: 'Edit date',
    repeat_yearly: '🔄 Repeat annually',
    cat_birthday: 'Birthday', cat_holiday: 'Holiday', cat_anniversary: 'Anniversary', cat_other_date: 'Other',
    through: 'in', days_ago: 'days ago',
    // Analytics
    analytics_tasks: 'Tasks', analytics_habits: 'Habits', analytics_hours: 'Working hours',
    analytics_finance: 'Finance', analytics_books: 'Books', analytics_movies: 'Movies',
    // Settings
    profile: 'Profile', your_name: 'Your name (for greeting)', name_placeholder: 'For example: Anna',
    language: 'Language', currency: 'Currency', save_profile: 'Save profile',
    theme: 'Theme', user_id: 'User ID', clear_all: 'Clear all data',
    theme_classic: 'Classic', theme_soft_poppy: 'Soft Linen', theme_cloudy_mint: 'Cloudy Mint',
    theme_midnight: 'Midnight', theme_forest_noir: 'Forest Noir',
    // Confirmations
    confirm_delete: 'Confirm action', confirm_msg: 'Are you sure?',
    del_task_title: 'Delete task?', del_task_msg: 'Task will be permanently deleted. Continue?',
    del_op_title: 'Delete operation?', del_op_msg: 'Operation will be permanently deleted. Continue?',
    del_saving_title: 'Delete saving?', del_saving_msg: 'Saving will be permanently deleted. Continue?',
    del_shift_title: 'Delete shift?', del_shift_msg: 'Shift will be removed from calendar. Continue?',
    del_template_title: 'Delete template?', del_template_msg: 'Template will be deleted. Existing shifts stay. Continue?',
    del_habit_title: 'Delete habit?', del_habit_msg: 'Habit and all its marks will be deleted. Continue?',
    del_book_title: 'Delete book?', del_book_msg: 'Book will be removed from library. Continue?',
    del_movie_title: 'Delete movie?', del_movie_msg: 'Movie will be removed from library. Continue?',
    del_date_title: 'Delete date?', del_date_msg: 'Date will be permanently deleted. Continue?',
    recalc_title: 'Recalculate hours?', recalc_msg: 'Recalculate hours for all shifts of the month?',
    // Toasts
    saved: 'Saved', deleted: 'Deleted', updated: 'Updated', added: 'Added',
    task_added: 'Task added', task_updated: 'Task updated', task_deleted: 'Task deleted',
    enter_title: 'Enter a title', enter_amount: 'Enter amount', enter_date: 'Pick a date',
    budget_saved: 'Budget saved', op_deleted: 'Operation deleted', saving_deleted: 'Saving deleted',
    shift_added: 'Shift added', shift_deleted: 'Shift deleted', template_saved: 'Template saved',
    template_deleted: 'Template deleted', recalc_shift: 'Recalculated', habit_added: 'Habit added',
    habit_updated: 'Habit updated', habit_deleted: 'Habit deleted',
    book_deleted: 'Book deleted', movie_deleted: 'Movie deleted',
    date_added: 'Date added', date_updated: 'Date updated', date_deleted: 'Date deleted',
    profile_saved: 'Profile saved', theme_changed: 'Theme changed', data_cleared: 'All data cleared',
    // Months/days
    choose_month: 'Choose month', choose_year: 'Choose year', choose_day: 'Choose day',
    error: 'Error'
  }
};

const MONTHS = {
  ru: ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
  en: ['January','February','March','April','May','June','July','August','September','October','November','December']
};
const MONTHS_SHORT = {
  ru: ['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'],
  en: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
};
const DAYS = {
  ru: ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'],
  en: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
};
const DAYS_SHORT = {
  ru: ['ПН','ВТ','СР','ЧТ','ПТ','СБ','ВС'],
  en: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
};
const CURRENCY_SYMBOLS = { RUB: '₽', USD: '$', EUR: '€' };

let currentLang = 'ru';
let currentCurrency = 'RUB';

export function setLang(lang) { currentLang = lang || 'ru'; }
export function setCurrency(curr) { currentCurrency = curr || 'RUB'; }
export function getLang() { return currentLang; }
export function getCurrency() { return currentCurrency; }

export function t(key) {
  return translations[currentLang]?.[key] || translations.ru[key] || key;
}

export function getMonths() { return MONTHS[currentLang] || MONTHS.ru; }
export function getMonthsShort() { return MONTHS_SHORT[currentLang] || MONTHS_SHORT.ru; }
export function getDays() { return DAYS[currentLang] || DAYS.ru; }
export function getDaysShort() { return DAYS_SHORT[currentLang] || DAYS_SHORT.ru; }
export function getLocale() { return currentLang === 'en' ? 'en-US' : 'ru-RU'; }

export function formatMoney(amount) {
  const num = Number(amount || 0);
  const symbol = CURRENCY_SYMBOLS[currentCurrency] || '₽';
  return num.toLocaleString(getLocale()) + ' ' + symbol;
}

export function formatNumber(amount) {
  return Number(amount || 0).toLocaleString(getLocale());
}