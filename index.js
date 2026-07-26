require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const http = require("http");
const TOKEN = process.env.BOT_TOKEN;
if (!TOKEN) {
  console.error("❌ BOT_TOKEN не найден");
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, { polling: true });

const PORT = process.env.PORT || 10000;
http.createServer((_, res) => res.end("Bot is running")).listen(PORT, () => {
  console.log(`🌐 Health check server on port ${PORT}`);
});

const savedBriefs = new Map();
const lastBrief = new Map();
const quizSessions = new Map();
const userStats = new Map();
const userLang = new Map();

const LANG = {
  ru: {
    name: "Русский",
    start: "🎨 Design Brief Bot\n\nПривет! Я помогаю дизайнерам прокачиваться.\n\n/brief — ТЗ\n/palette — палитра\n/challenge — задание\n/quiz — квиз\n/stats — статистика\n/save — сохранить\n/saved — сохранёнки\n/language — сменить язык",
    brief: "📋 ТЗ",
    palette: "🎨 Палитра",
    challenge: "🎯 Челендж",
    quiz: "🧠 Квиз",
    stats: "📊 Статистика",
    saved: "📂 Сохранёнки",
    brief_btn: "📋 ТЗ",
    palette_btn: "🎨 Палитра",
    challenge_btn: "🎯 Челендж",
    quiz_btn: "🧠 Квиз",
    save: "Сохранить",
    new: "Новое ТЗ",
    home: "В начало",
    menu: "Меню",
    del: "Удалить",
    stats_btn: "📊 Статистика",
    saved_btn: "📂 Сохранёнки",
    saved_none: "📂 Сохранёнок нет. Сгенерируй ТЗ → /brief → 💾 Сохранить",
    saved_title: "📂 Мои сохранёнки",
    saved_max: "Максимум 20 сохранёнок",
    save_first: "Сначала сгенерируй ТЗ через /brief",
    saved_done: "✅ ТЗ сохранено!",
    saved_dup: "Уже сохранено",
    saved_del: "🗑 Удалено!",
    saved_notfound: "ТЗ не найдено",
    lang_choose: "🌐 Выбери язык / Choose language / Elige un idioma:",
    lang_changed: "✅ Язык изменён на русский",

    palette_send: "Скопируй hex и вставь в Figma!",
    challenge_title: "🎯 Челендж",
    challenge_hint: "Сделай и закрепи результат в портфолио!",
    quiz_question: "Вопрос",
    quiz_start: "🧠 Начинаем квиз!",
    quiz_correct: "✅ Верно!",
    quiz_wrong: "❌ Неверно. Правильный ответ:",
    grade_bot: "🤡",
    grade_god: "🏆 Дизайн-бог!",
    grade_awesome: "🔥 Отлично!",
    grade_good: "👍 Неплохо",
    grade_study: "📚 Учи матчасть",
    quiz_done: "🧠 Квиз завершён!",
    correct: "Правильно",
    no_stats: "• Пока нет",
    stats_title: "📊 Моя статистика",
    stats_total: "Всего ТЗ",
    stats_by_type: "📋 По типам",
    max_saved: "Максимум 20 сохранёнок. Удали одну через /saved",
  },
  en: {
    name: "English",
    start: "🎨 Design Brief Bot\n\nHi! I help designers level up.\n\n/brief — design brief\n/palette — color palette\n/challenge — task\n/quiz — quiz\n/stats — statistics\n/save — save brief\n/saved — my saved\n/language — change language",
    brief: "📋 Brief",
    palette: "🎨 Palette",
    challenge: "🎯 Challenge",
    quiz: "🧠 Quiz",
    stats: "📊 Stats",
    saved: "📂 Saved",
    brief_btn: "📋 Brief",
    palette_btn: "🎨 Palette",
    challenge_btn: "🎯 Challenge",
    quiz_btn: "🧠 Quiz",
    save: "Save",
    new: "New Brief",
    home: "Home",
    menu: "Menu",
    del: "Delete",
    stats_btn: "📊 Stats",
    saved_btn: "📂 Saved",
    saved_none: "📂 No saved briefs yet. Generate one → /brief → 💾 Save",
    saved_title: "📂 My saved briefs",
    saved_max: "Maximum 20 saved briefs",
    save_first: "Generate a brief first via /brief",
    saved_done: "✅ Brief saved!",
    saved_dup: "Already saved",
    saved_del: "🗑 Deleted!",
    saved_notfound: "Brief not found",
    lang_choose: "🌐 Choose language / Выбери язык / Elige un idioma:",
    lang_changed: "✅ Language changed to English",

    palette_send: "Copy hex codes and paste into Figma!",
    challenge_title: "🎯 Challenge",
    challenge_hint: "Complete it and add to your portfolio!",
    quiz_question: "Question",
    quiz_start: "🧠 Starting quiz!",
    quiz_correct: "✅ Correct!",
    quiz_wrong: "❌ Wrong. Correct answer:",
    grade_bot: "🤡",
    grade_god: "🏆 Design god!",
    grade_awesome: "🔥 Awesome!",
    grade_good: "👍 Not bad",
    grade_study: "📚 Study more",
    quiz_done: "🧠 Quiz complete!",
    correct: "Correct",
    no_stats: "• None yet",
    stats_title: "📊 My stats",
    stats_total: "Total briefs",
    stats_by_type: "📋 By type",
    max_saved: "Max 20 saved briefs. Delete one via /saved",
  },
  es: {
    name: "Español",
    start: "🎨 Design Brief Bot\n\n¡Hola! Ayudo a diseñadores a mejorar.\n\n/brief — briefing\n/palette — paleta\n/challenge — desafío\n/quiz — cuestionario\n/stats — estadísticas\n/save — guardar\n/saved — guardados\n/language — cambiar idioma",
    brief: "📋 Briefing",
    palette: "🎨 Paleta",
    challenge: "🎯 Desafío",
    quiz: "🧠 Quiz",
    stats: "📊 Stats",
    saved: "📂 Guardados",
    brief_btn: "📋 Briefing",
    palette_btn: "🎨 Paleta",
    challenge_btn: "🎯 Desafío",
    quiz_btn: "🧠 Quiz",
    save: "Guardar",
    new: "Nuevo Briefing",
    home: "Inicio",
    menu: "Menú",
    del: "Eliminar",
    stats_btn: "📊 Stats",
    saved_btn: "📂 Guardados",
    saved_none: "📂 Sin guardados. Genera un briefing → /brief → 💾 Guardar",
    saved_title: "📂 Mis briefings guardados",
    saved_max: "Máximo 20 briefings guardados",
    save_first: "Primero genera un briefing con /brief",
    saved_done: "✅ Briefing guardado!",
    saved_dup: "Ya guardado",
    saved_del: "🗑 Eliminado!",
    saved_notfound: "Briefing no encontrado",
    lang_choose: "🌐 Elige un idioma / Choose language / Выбери язык:",
    lang_changed: "✅ Idioma cambiado a Español",

    palette_send: "¡Copia los códigos hex y pégalos en Figma!",
    challenge_title: "🎯 Desafío",
    challenge_hint: "¡Complétalo y agrégalo a tu portafolio!",
    quiz_question: "Pregunta",
    quiz_start: "🧠 ¡Empezando cuestionario!",
    quiz_correct: "✅ ¡Correcto!",
    quiz_wrong: "❌ Incorrecto. Respuesta correcta:",
    grade_bot: "🤡",
    grade_god: "🏆 ¡Dios del diseño!",
    grade_awesome: "🔥 ¡Excelente!",
    grade_good: "👍 No está mal",
    grade_study: "📚 Estudia más",
    quiz_done: "🧠 ¡Cuestionario completado!",
    correct: "Correcto",
    no_stats: "• Ninguno aún",
    stats_title: "📊 Mis estadísticas",
    stats_total: "Total briefings",
    stats_by_type: "📋 Por tipo",
    max_saved: "Máximo 20 guardados. Elimina uno con /saved",
  },
};

const PROJECT_TYPES = [
  "Логотип", "Фирменный стиль", "Сайт (лендинг)", "Сайт (многостраничный)",
  "Мобильное приложение", "Упаковка", "Баннерная кампания",
  "Презентация", "UI Kit / Design System", "Инфографика",
  "Мерч / Apparel", "Instagram-шаблоны", "Email-рассылка",
  "Dashboard / Аналитика", "Книга / Журнал",
];

const BRANDS = [
  ["NovaFlow", "сервис для управления задачами"],
  ["GreenLeaf", "доставка экотоваров"],
  ["CodeCraft", "платформа для обучения программированию"],
  ["UrbanVibe", "стритвир-бренд"],
  ["PureWave", "приложение для медитации"],
  ["StarPulse", "лаборатория голосовых помощников"],
  ["ZenSpace", "коворкинг с дизайнерским уклоном"],
  ["BrightLab", "онлайн-школа для детей"],
  ["EcoSphere", "эко-приложение по сортировке отходов"],
  ["ArtNest", "маркетплейс современного искусства"],
  ["Moodly", "трекер эмоционального состояния"],
  ["FitMatrix", "фитнес-платформа с AI тренером"],
  ["DripDrop", "сервис доставки воды"],
  ["Planty", "подписка на комнатные растения"],
  ["Wanderly", "соцсеть для путешественников"],
];

const INDUSTRIES = [
  "EdTech", "FinTech", "FoodTech", "E-commerce",
  "Fashion", "Beauty", "Health & Wellness",
  "Образование", "Благотворительность", "Спорт",
  "Музыка", "Искусство", "Медиа", "Saas",
  "Крипто / Web3", "Логистика", "HoReCa",
];

const STYLES = [
  "Минимализм", "Брутализм", "Flat 2.0", "Neumorphism",
  "Glassmorphism", "Киберпанк", "Винтаж / Retro",
  "Japanese minimalism", "Memphis", "Organic / Biophilic",
  "Synthwave", "Grunge / Граффити", "Corporate",
  "Swiss Style", "Maximalism", "Gothic",
];

const COLORS = [
  "Монохром: оттенки синего",
  "Монохром: оттенки зелёного",
  "Контраст: фиолетовый + жёлтый",
  "Контраст: чёрный + белый + акцентный красный",
  "Пастельная гамма (розовый, голубой, лаванда)",
  "Землистые тона (оливковый, терракота, песочный)",
  "Неон: розовый + голубой + тёмный фон",
  "80х Synthwave (пурпурный, розовый, синий)",
  "Dark theme + акцентный зелёный",
  "Градиент: фиолетовый → оранжевый",
  "Полный ч/б без цвета",
  "Корпоративные цвета (сдержанно, дорого)",
];

const MOODS = [
  "Дружелюбный и открытый",
  "Строгий и премиальный",
  "Энергичный и дерзкий",
  "Спокойный и минималистичный",
  "Загадочный и глубокий",
  "Игривый и креативный",
  "Технологичный и футуристичный",
  "Надёжный и консервативный",
  "Экологичный и естественный",
  "Дерзкий и провокационный",
];

const DEADLINES = ["3 дня", "5 дней", "1 неделя", "10 дней", "2 недели", "до конца месяца"];

const REQUIREMENTS_POOL = [
  "Должен отлично выглядеть на чёрном фоне",
  "Анимированная версия обязательна (Lottie / JSON)",
  "Адаптация под печать (CMYK + Pantone)",
  "Нужны 3 варианта для A/B тестирования",
  "Должен масштабироваться от 16×16 до 1920×1080",
  "Формат 1:1 — адаптировать под квадрат",
  "Сделать акцент на экологичность",
  "Динамичный, с ощущением движения",
  "Обязательно фото-референсы в мудборде",
  "Нужен адаптив под тёмную и светлую тему",
  "Шрифт — только бесплатный / open-source",
  "Все иконки должны быть кастомными",
  "Сетка 8px, выравнивание строгое",
  "Главное — читаемость и доступность (WCAG)",
  "Должен подходить для Gen Z аудитории",
  "Ручная типографика / леттеринг",
  "Хай-концепт: нестандартная форма",
  "Строгий брендбук: никаких отклонений",
];

const BONUSES = [
  "🔥 Хардкор: дизайнить только в Figma, без плагинов",
  "💰 Бюджет: $500 — управиться за 2 дня",
  "🎯 Портфолио-кейс: сделать кейс для Behance",
  "🤝 Парный формат: работаешь с копирайтером",
  "⚡ Lightning round: 1 час на концепт",
  "🎲 Рандом: каждый день новый цветовой акцент",
];

const DIFFICULTIES = {
  junior: "🟢 Junior — можно использовать готовые компоненты",
  middle: "🟡 Middle — кастомный дизайн без шаблонов",
  senior: "🔴 Senior — полный бренд-дизайн + анимация + адаптация",
};

const CHALLENGES = [
  "Нарисуй иконку «настройки» в 3 разных стилях: flat, outline, filled.",
  "Сделай мудборд для финтех-стартапа — 10 референсов с описанием.",
  "Найди 3 плохих дизайна на сайтах и переделай один экран.",
  "Спроектируй страницу 404 для мобильного приложения.",
  "Выбери логотип известного бренда и перерисуй в своём стиле.",
  "Сделай 3 варианта визитки для себя в разных стилях.",
  "Нарисуй 10 иконок для погодного приложения.",
  "Создай UI экрана регистрации — минимум полей, максимум удобства.",
  "Переделай главный экран приложения, которое тебя бесит.",
  "Сделай анимацию загрузки (loader) в Figma — 3 варианта.",
  "Нарисуй паттерн для обоев телефона.",
  "Спроектируй карточку товара для маркетплейса.",
  "Выбери шрифт и сделай 5 постеров с цитатами.",
  "Сделай гайдлайн по иконкам для вымышленного бренда.",
  "Нарисуй дашборд для аналитики: 3 графика, 2 метрики, таблица.",
  "Разработай UI для экрана профиля пользователя.",
  "Сделай редизайн кнопки подписки на YouTube.",
  "Нарисуй 5 вариантов favicon для своего бренда.",
  "Создай мокап для наушников в Figma.",
  "Разработай сетку для Instagram-постов бренда.",
  "Сделай таблицу стилей для iOS приложения.",
  "Нарисуй иллюстрацию для пустого состояния (empty state).",
  "Спроектируй онбординг из 3 экранов для приложения.",
  "Сделай редизайн страницы логина Google.",
  "Нарисуй 3D-иконку «корзина» изометрически.",
  "Разработай дизайн email-рассылки для стартапа.",
  "Сделай UI для экрана чата в мессенджере.",
  "Нарисуй плашку для Twitch стримера.",
  "Спроектируй дизайн для страницы «О нас».",
  "Сделай 3 варианта лендинга для одной секции.",
  "Разработай дизайн системы уведомлений (toast, snackbar, alert).",
  "Нарисуй стикерпак из 6 стикеров для Telegram.",
  "Сделай редизайн карточки профиля LinkedIn.",
  "Спроектируй экран загрузки (splash screen) для приложения.",
  "Разработай UI для плеера подкастов.",
  "Сделай дизайн ценовой таблицы (pricing table).",
  "Нарисуй дашборд погоды — красиво и информативно.",
  "Спроектируй меню для ресторана (цифровое).",
  "Разработай UI для трекера привычек.",
  "Сделай редизайн главной страницы Wikipedia.",
  "Нарисуй 5 изометрических иконок для стартапа.",
  "Спроектируй страницу подтверждения заказа.",
  "Разработай дизайн для шаринга результатов (share card).",
  "Сделай UI для поиска с фильтрами и результатами.",
  "Нарисуй коллаж из 5 трендовых UI-элементов 2026 года.",
  "Спроектируй прототип приложения для заметок.",
  "Разработай дизайн Landing Page для курса по дизайну.",
  "Сделай UI панели администратора (stats + users + settings).",
  "Нарисуй тёмную и светлую тему для одного экрана.",
  "Спроектируй экран «Нет интернета» (offline state).",
  "Разработай мудборд для бренда одежды.",
  "Сделай редизайн экрана настроек в Telegram.",
  "Нарисуй анимированный баннер для соцсетей.",
];

const QUIZ_QUESTIONS = [
  { q: "Какой цвет получается при смешивании синего и жёлтого?", options: ["Зелёный", "Фиолетовый", "Оранжевый", "Коричневый"], answer: 0 },
  { q: "Что такое кернинг в типографике?", options: ["Расстояние между строками", "Расстояние между парами букв", "Размер шрифта", "Выравнивание текста"], answer: 1 },
  { q: "Какой формат поддерживает прозрачность?", options: ["JPEG", "PNG", "BMP", "GIF"], answer: 1 },
  { q: "Что такое Z-паттерн?", options: ["Движение взгляда слева-направо сверху-вниз", "Зигзагообразное расположение", "Анимация появления", "Тип сетки для галереи"], answer: 0 },
  { q: "Какой шрифт относится к гротескам?", options: ["Times New Roman", "Roboto", "Georgia", "Playfair Display"], answer: 1 },
  { q: "Сколько цветов в RGB?", options: ["2", "3", "4", "5"], answer: 1 },
  { q: "Что такое UI Kit?", options: ["Набор готовых компонентов", "Инструмент прототипирования", "Плагин Figma", "Шрифтовой набор"], answer: 0 },
  { q: "Что такое «воздух» в дизайне?", options: ["Анимация", "Пустое пространство между элементами", "Градиент", "Прозрачность"], answer: 1 },
  { q: "Какой принцип гештальта — «похожие элементы как группа»?", options: ["Близость", "Подобие", "Замыкание", "Фигура и фон"], answer: 1 },
  { q: "Какой формат лучше для логотипа?", options: ["JPG", "SVG", "PNG-8", "WEBP"], answer: 1 },
  { q: "Что измеряется в pt?", options: ["Размер шрифта", "Пиксели", "Длина линии", "Толщина обводки"], answer: 0 },
  { q: "Какой цветовой режим для печати?", options: ["RGB", "CMYK", "HEX", "HSL"], answer: 1 },
  { q: "Что такое F-pattern?", options: ["Сетка для форм", "Паттерн чтения F-образно", "Flexbox layout", "Анимация"], answer: 1 },
  { q: "Сколько px в 1pt?", options: ["1", "1.25", "1.333", "2"], answer: 2 },
  { q: "Кто создал грид-систему в веб-дизайне?", options: ["Дэн Браун", "Йозеф Мюллер-Брокман", "Дитер Рамс", "Пол Рэнд"], answer: 1 },
  { q: "Что означает HSL?", options: ["Hue, Saturation, Lightness", "Height, Size, Length", "High, Standard, Low", "Hex, Saturation, Line"], answer: 0 },
  { q: "Какой шрифт создан специально для экранов?", options: ["Arial", "Roboto", "Helvetica", "Garamond"], answer: 1 },
  { q: "Что такое авто-лейаут в Figma?", options: ["Расстановка элементов", "Адаптивный контейнер", "Сетка", "Плагин"], answer: 1 },
  { q: "Какая программа стандарт для векторной графики?", options: ["Photoshop", "Illustrator", "Lightroom", "After Effects"], answer: 1 },
  { q: "Что такое хедер (header)?", options: ["Подвал сайта", "Шапка сайта", "Боковое меню", "Фон"], answer: 1 },
  { q: "Что делает инструмент «Перо» в Figma?", options: ["Рисует кистью", "Создаёт кривые Безье", "Выделяет объекты", "Заливает цветом"], answer: 1 },
  { q: "Какой размер для иконок в Android?", options: ["24dp", "48dp", "32dp", "16dp"], answer: 0 },
  { q: "Кто придумал 10 принципов хорошего дизайна?", options: ["Стив Джобс", "Дитер Рамс", "Йозеф Мюллер-Брокман", "Пол Рэнд"], answer: 1 },
  { q: "Что такое компонент в Figma?", options: ["Скопированный блок", "Переиспользуемый элемент", "Плагин", "Шрифт"], answer: 1 },
  { q: "Сколько принципов дизайна у Дитера Рамса?", options: ["5", "10", "7", "12"], answer: 1 },
  { q: "Что такое футер (footer)?", options: ["Шапка", "Подвал", "Боковая панель", "Слайдер"], answer: 1 },
  { q: "Какой масштаб для иконок в iOS?", options: ["@1x", "@2x", "@3x", "Все"], answer: 3 },
  { q: "Что такое отзывчивый дизайн?", options: ["Фиксированная верстка", "Адаптация под экран", "Только мобильная версия", "Печатная версия"], answer: 1 },
  { q: "Какое разрешение у Full HD?", options: ["1280x720", "1920x1080", "2560x1440", "3840x2160"], answer: 1 },
  { q: "Что такое мокап?", options: ["Код сайта", "Макет в контексте", "Плагин", "Цветовая палитра"], answer: 1 },
  { q: "Какая программа для прототипирования?", options: ["Photoshop", "Figma", "Lightroom", "Premiere"], answer: 1 },
  { q: "Что такое контрастность в дизайне?", options: ["Разница между цветами", "Яркость экрана", "Прозрачность", "Толщина линии"], answer: 0 },
  { q: "Какая гарнитура у заголовков в большинстве сайтов?", options: ["Serif", "Sans-serif", "Script", "Display"], answer: 1 },
  { q: "Что такое ретинизация?", options: ["Удаление пикселей", "Адаптация под Retina-дисплеи", "Сжатие изображений", "Добавление текстуры"], answer: 1 },
  { q: "Кто основал Bauhaus?", options: ["Вальтер Гропиус", "Ле Корбюзье", "Пабло Пикассо", "Сальвадор Дали"], answer: 0 },
  { q: "Что делает блендинг-режим Multiply?", options: ["Осветляет", "Затемняет", "Добавляет прозрачность", "Инвертирует цвета"], answer: 1 },
  { q: "Какой тип кривой в easing-функции ease-out?", options: ["Быстрый старт медленный конец", "Медленный старт быстрый конец", "Равномерно", "Пружина"], answer: 1 },
  { q: "Сколько весит хороший логотип SVG?", options: ["~1-5 KB", "~100 KB", "~1 MB", "~10 MB"], answer: 0 },
  { q: "Что такое style guide?", options: ["Гайд по CSS", "Документация по визуальному стилю", "Книга по дизайну", "Курс"], answer: 1 },
  { q: "Какой шрифт создал Эрик Шпикерманн?", options: ["Futura", "FF Meta", "Helvetica", "Akzidenz Grotesk"], answer: 1 },
  { q: "Что такое вайрфрейм?", options: ["Схема расположения блоков", "Готовый дизайн", "Анимация", "Прототип"], answer: 0 },
  { q: "Какая горячая клавиша для группы в Figma?", options: ["Ctrl+G", "Ctrl+Shift+G", "Ctrl+K", "Ctrl+E"], answer: 0 },
  { q: "Что делает Auto Layout в Figma?", options: ["Рисует линии", "Автоматически располагает элементы", "Создаёт анимацию", "Меняет цвета"], answer: 1 },
  { q: "Какой принцип дизайна важнее всего для UX?", options: ["Эстетика", "Юзабилити", "Цвет", "Шрифт"], answer: 1 },
  { q: "Что такое итерация в дизайне?", options: ["Повторение узора", "Цикл улучшения через версии", "Копирование элемента", "Анимация"], answer: 1 },
  { q: "Какая цветовая модель у экранов?", options: ["CMYK", "RGB", "Pantone", "RAL"], answer: 1 },
  { q: "Что такое адаптивный дизайн?", options: ["Один макет на все экраны", "Подстройка под разные экраны", "Только десктоп", "Печатный макет"], answer: 1 },
  { q: "Кто создатель Apple Human Interface Guidelines?", options: ["Apple", "Google", "Microsoft", "Mozilla"], answer: 0 },
  { q: "Как называют пустое пространство в типографике?", options: ["Воздух", "Отступ", "Поля", "Интервал"], answer: 0 },
  { q: "Сколько оттенков серого в 8-битном изображении?", options: ["64", "128", "256", "512"], answer: 2 },
  { q: "Что делает эффект размытия в дизайне?", options: ["Ухудшает качество", "Создаёт глубину и фокус", "Удаляет объекты", "Меняет цвет"], answer: 1 },
  { q: "Какой Material Design язык у Google?", options: ["Flat Design", "Material Design", "Neumorphism", "Glassmorphism"], answer: 1 },
  { q: "Что такое компонентная система?", options: ["Набор переиспользуемых UI-элементов", "Железо компьютера", "Операционная система", "Язык программирования"], answer: 0 },
  { q: "Сколько принципов в Material Design?", options: ["3", "5", "7", "10"], answer: 0 },
  { q: "Какой стандартный размер холста для Instagram Stories?", options: ["1080x1080", "1080x1920", "1920x1080", "750x1334"], answer: 1 },
  { q: "Что такое easing в анимации?", options: ["Скорость анимации", "Сглаживание движения", "Повтор", "Задержка"], answer: 1 },
  { q: "Какой формат для анимированных иконок в iOS?", options: ["GIF", "Lottie (JSON)", "APNG", "SVG"], answer: 1 },
  { q: "Кто автор книги «Дизайн привычных вещей»?", options: ["Дон Норман", "Стив Круг", "Джейкоб Нильсен", "Брюс Тогнаццини"], answer: 0 },
  { q: "Что такое Microinteraction?", options: ["Маленькая анимация на действие", "Микросхема", "Маленькая иконка", "Плагин"], answer: 0 },
  { q: "Какая сетка чаще всего в вебе?", options: ["8-пиксельная", "4-пиксельная", "10-пиксельная", "6-пиксельная"], answer: 0 },
  { q: "Что такое JOMO в дизайне?", options: ["Joy of Missing Out — минимализм", "Градиент", "Шрифт", "Плагин"], answer: 0 },
  { q: "Какой лучший формат для фото на сайте?", options: ["PNG", "WEBP", "BMP", "TIFF"], answer: 1 },
  { q: "Что делает constraint в Figma?", options: ["Ограничивает размер", "Привязывает к родителю", "Добавляет тень", "Блокирует слой"], answer: 1 },
  { q: "Какая операционная система у Apple для дизайнеров?", options: ["iOS", "macOS", "iPadOS", "Все"], answer: 3 },
  { q: "Что такое UX-исследование?", options: ["Опрос пользователей", "Тестирование гипотез на пользователях", "Дизайн-ревью", "Кодинг"], answer: 1 },
  { q: "Какой главный принцип у Swiss Style?", options: ["Асимметрия и сетка", "Симметрия", "3D-эффекты", "Тени"], answer: 0 },
  { q: "Что такое design debt?", options: ["Накопленные дизайн-проблемы", "Долг за плагины", "Просрочка дедлайна", "Бюджет"], answer: 0 },
  { q: "Какой самый популярный шрифт 20 века?", options: ["Arial", "Helvetica", "Times New Roman", "Futura"], answer: 1 },
  { q: "Что такое visual hierarchy?", options: ["Порядок значимости элементов", "Сетка", "Цветовая палитра", "Иерархия папок"], answer: 0 },
  { q: "Как сделать темную тему правильно?", options: ["Инвертировать цвета", "Использовать тёмно-серый + акцентные", "Чёрный фон", "Белый текст"], answer: 1 },
  { q: "Что такое атомарный дизайн?", options: ["Дизайн по атомам-молекулам-организмам", "Минимализм", "Сетка", "Анимация"], answer: 0 },
  { q: "Сколько этапов в дизайн-мышлении?", options: ["3", "5", "7", "4"], answer: 1 },
  { q: "Кто создал брендбук IBM?", options: ["Пол Рэнд", "Дитер Рамс", "Милтон Глейзер", "Сол Басс"], answer: 0 },
  { q: "Что такое breakpoint в веб-дизайне?", options: ["Точка поломки", "Контрольная точка адаптива", "Размер шрифта", "Цвет"], answer: 1 },
  { q: "Какая программа для 3D-моделирования в дизайне?", options: ["Blender", "Figma", "Sketch", "Adobe XD"], answer: 0 },
  { q: "Кто создал первый смайлик :-)", options: ["Скотт Фалман", "Харви Болл", "Шигетака Курита", "Тим Бернерс-Ли"], answer: 0 },
  { q: "Что такое color theory?", options: ["Теория сочетания цветов", "Палитра", "Градиент", "Цветовой круг"], answer: 0 },
  { q: "Сколько базовых цветов в цветовом круге Иттена?", options: ["6", "8", "12", "3"], answer: 2 },
  { q: "Что такое accessibility в дизайне?", options: ["Доступность для всех пользователей", "Красивый дизайн", "Скорость загрузки", "Анимация"], answer: 0 },
  { q: "Какое минимальное соотношение контрастности для текста WCAG?", options: ["2:1", "4.5:1", "3:1", "7:1"], answer: 1 },
  { q: "Что делает опция «Clip Content» в Figma?", options: ["Обрезает контент по границе", "Копирует слой", "Вставляет", "Группирует"], answer: 0 },
  { q: "Какой формат у файлов Figma?", options: [".figma", ".fig", ".sketch", ".xd"], answer: 1 },
  { q: "Кто разработал шрифт Inter?", options: ["Google", "Rasmus Andersson", "Apple", "Adobe"], answer: 1 },
  { q: "Что такое storyboard?", options: ["Сценарий с раскадровкой", "Доска задач", "Список идей", "Презентация"], answer: 0 },
  { q: "Какая высота строки (line-height) оптимальна для текста?", options: ["100%", "120-140%", "150-170%", "200%"], answer: 1 },
  { q: "Что такое moodboard?", options: ["Коллаж референсов и вдохновения", "Инструмент для рисования", "Тип шрифта", "Плагин"], answer: 0 },
  { q: "Кто изобрёл CSS Grid?", options: ["Mozilla", "Google", "Apple", "Microsoft"], answer: 0 },
  { q: "Что делает эффект слоя Drop Shadow?", options: ["Добавляет тень", "Размывает слой", "Меняет цвет", "Удаляет"], answer: 0 },
  { q: "Какой стандарт диагонали для мобильных макетов в Figma?", options: ["375x812 (iPhone X)", "414x896", "360x640", "320x568"], answer: 0 },
  { q: "Что такое community в Figma?", options: ["Форум", "Библиотека публичных файлов", "Чат", "Блог"], answer: 1 },
  { q: "Что такое Design Tokens?", options: ["Переменные дизайна", "Жетоны", "Бейджи", "Плагины"], answer: 0 },
  { q: "Какова главная цель UX-дизайна?", options: ["Красота", "Удобство пользователя", "Скорость", "Цена"], answer: 1 },
  { q: "Кто написал книгу «Не заставляйте меня думать»?", options: ["Дон Норман", "Стив Круг", "Якоб Нильсен", "Брюс Ли"], answer: 1 },
  { q: "Что делает Variant в Figma?", options: ["Вариант компонента", "Смена цвета", "Анимация", "Размер"], answer: 0 },
  { q: "Сколько принципов в iOS Human Interface Guidelines?", options: ["5", "8", "10", "3"], answer: 2 },
  { q: "Что такое «скелетон» (skeleton screen)?", options: ["Загрузочное состояние", "Пустой экран", "Каркас сайта", "Макет"], answer: 0 },
  { q: "Какой год основания Figma?", options: ["2012", "2015", "2016", "2018"], answer: 2 },
  { q: "Что такое Boolean Group в Figma?", options: ["Группа с масками", "Объединение фигур", "Группа слоёв", "Авто-лейаут"], answer: 1 },
];

const PALETTES = [
  ["🌊 Океан", "#006d77", "#83c5be", "#edf6f9", "#ffddd2", "#e29578"],
  ["🌅 Закат", "#ff6b6b", "#ffa07a", "#ffd93d", "#6bcb77", "#4d96ff"],
  ["🌿 Лес", "#2d6a4f", "#40916c", "#52b788", "#95d5b2", "#d8f3dc"],
  ["🍂 Осень", "#5c4033", "#8b5a2b", "#d4a373", "#faedcd", "#fefae0"],
  ["🌸 Сакура", "#ffb7c5", "#ff8fab", "#fb6f92", "#c9184a", "#800f2f"],
  ["🌌 Космос", "#0b090a", "#161a1d", "#660708", "#a4161a", "#e5383b"],
  ["🍋 Цитрус", "#f9c74f", "#f9844a", "#f94144", "#90be6d", "#577590"],
  ["❄️ Арктика", "#caf0f8", "#ade8f4", "#48cae4", "#0077b6", "#03045e"],
  ["🍄 Земля", "#264653", "#2a9d8f", "#e9c46a", "#f4a261", "#e76f51"],
  ["💎 Сапфир", "#03045e", "#0077b6", "#00b4d8", "#90e0ef", "#caf0f8"],
  ["🌺 Тропики", "#f72585", "#b5179e", "#7209b7", "#560bad", "#480ca8"],
  ["🍯 Мёд", "#ffcdb2", "#ffb4a2", "#e5989b", "#b5828c", "#6d6875"],
  ["🌿 Мята", "#e8f5e9", "#c8e6c9", "#a5d6a7", "#81c784", "#66bb6a"],
  ["🏖️ Пляж", "#f6bd60", "#f7ede2", "#f5cac3", "#84a59d", "#f28482"],
  ["🍇 Вино", "#2d00f7", "#6a00f5", "#9d00f5", "#b100e8", "#bc00dd"],
  ["🌲 Хвоя", "#1b4332", "#2d6a4f", "#40916c", "#52b788", "#74c69d"],
  ["☕ Кофе", "#3e2723", "#4e342e", "#5d4037", "#6d4c41", "#795548"],
  ["🌈 Пастель", "#f8edeb", "#f9dcc4", "#fec89a", "#fcd5ce", "#e8e8e4"],
  ["🦩 Фламинго", "#ffeddf", "#ffc8bd", "#ff9f9b", "#fd7b7e", "#cd5c5c"],
  ["🏛️ Античный", "#e3d5ca", "#d6ccc2", "#c8b6a0", "#a4937c", "#7d6b55"],
  ["🔮 Неон", "#ff0054", "#ff6b35", "#ffd23f", "#06d6a0", "#118ab2"],
  ["🌾 Лаванда", "#e8daef", "#d7bde2", "#c39bd3", "#af7ac5", "#9b59b6"],
  ["🍎 Apple", "#f5f5f5", "#e0e0e0", "#9e9e9e", "#616161", "#212121"],
  ["🎮 Игровой", "#ff3366", "#ff6633", "#ffcc00", "#33cc66", "#3366ff"],
  ["🧀 Тёплый", "#fff3e0", "#ffe0b2", "#ffcc80", "#ffb74d", "#ffa726"],
  ["🌙 Ночь", "#0d1b2a", "#1b2838", "#1b3a4b", "#2d5a6b", "#4a8a9a"],
  ["🍑 Персик", "#ffdbd3", "#ffc8bd", "#ffb4a2", "#ff9f8c", "#ff8a75"],
  ["🌋 Лава", "#2b0000", "#4a0000", "#8b0000", "#cc0000", "#ff4500"],
  ["💐 Весна", "#fcf6f5", "#fde2e4", "#fad2e1", "#c5dedd", "#dbe7e4"],
  ["🧊 Лёд", "#e3f2fd", "#bbdefb", "#90caf9", "#64b5f6", "#42a5f5"],
  ["🌵 Пустыня", "#edd4b2", "#d0a98f", "#c38370", "#a35d4a", "#7a3b2e"],
  ["🎪 Цирк", "#ff0000", "#ffff00", "#0000ff", "#00ff00", "#ffffff"],
  ["🍬 Карамель", "#ffecd2", "#fcb69f", "#f8a07e", "#e8845a", "#d4684a"],
  ["🌴 Джунгли", "#004d40", "#00695c", "#00897b", "#26a69a", "#4db6ac"],
  ["🖤 Монохром", "#000000", "#333333", "#666666", "#999999", "#cccccc"],
  ["🥂 Шампань", "#f7e7ce", "#eedcc7", "#e4ceb5", "#d8bfa8", "#c9ad93"],
  ["🚀 Футуризм", "#0a0a23", "#1a1a4e", "#2a2a7e", "#3a3aaf", "#4a4adf"],
  ["🪸 Коралл", "#ff6f61", "#ff8a7a", "#ffa594", "#ffc1b0", "#ffdccd"],
  ["🌊 Бирюза", "#008080", "#20b2aa", "#48d1cc", "#7fffd4", "#b0e0e6"],
  ["🍫 Шоколад", "#3c1e0e", "#5c2e0e", "#7c3e0e", "#9c4e0e", "#bc5e0e"],
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function lang(chatId) {
  return LANG[userLang.get(chatId) || "ru"];
}

function langKeyboard(chatId) {
  const l = lang(chatId);
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: l.brief_btn, callback_data: "cb_brief" }, { text: l.palette_btn, callback_data: "cb_palette" }],
        [{ text: l.challenge_btn, callback_data: "cb_challenge" }, { text: l.quiz_btn, callback_data: "cb_quiz" }],
        [{ text: l.stats_btn, callback_data: "cb_stats" }, { text: l.saved_btn, callback_data: "saved_list" }],
      ],
    },
  };
}

function getStats(chatId) {
  if (!userStats.has(chatId)) {
    userStats.set(chatId, { total: 0, byType: {} });
  }
  return userStats.get(chatId);
}

function generateBrief(difficulty = "middle") {
  const [brandName, brandDesc] = pick(BRANDS);
  const project = pick(PROJECT_TYPES);
  const industry = pick(INDUSTRIES);
  const style = pick(STYLES);
  const colors = pick(COLORS);
  const mood = pick(MOODS);
  const deadline = pick(DEADLINES);
  const reqs = REQUIREMENTS_POOL.sort(() => Math.random() - 0.5).slice(0, 3);
  const bonus = pick(BONUSES);
  const diffText = DIFFICULTIES[difficulty];
  const now = new Date().toLocaleString("ru-RU");

  return {
    project,
    text:
      "📋 <b>ТЕХНИЧЕСКОЕ ЗАДАНИЕ</b>\n" +
      "━━━━━━━━━━━━━━━━━━━━━━\n\n" +
      `<b>Тип проекта:</b> ${project}\n` +
      `<b>Бренд:</b> ${brandName} — ${brandDesc}\n` +
      `<b>Индустрия:</b> ${industry}\n` +
      `<b>Сложность:</b> ${diffText}\n` +
      `<b>Срок:</b> ${deadline}\n\n` +
      "🎨 <b>СТИЛЬ И ВИЗУАЛ</b>\n" +
      `• Направление: ${style}\n` +
      `• Цвета: ${colors}\n` +
      `• Настроение: ${mood}\n\n` +
      "📝 <b>ТРЕБОВАНИЯ</b>\n" +
      `• ${reqs.join("\n• ")}\n\n` +
      "💎 <b>ОСОБЕННОСТЬ</b>\n" +
      `• ${bonus}\n\n` +
      `<b>Контекст:</b> Это реальный проект для вымышленного стартапа. Дизайн должен решать бизнес-задачу: привлечь ЦА и выделиться на рынке ${industry.toLowerCase()}.\n\n` +
      "<b>Подсказка:</b> Не бойся экспериментировать — это тренировка!\n\n" +
      "━━━━━━━━━━━━━━━━━━━━━━\n" +
      `🕒 Сгенерировано: ${now}`,
  };
}

function menuKeyboard(chatId) {
  const l = lang(chatId);
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📋 " + l.menu, callback_data: "start" }],
      ],
    },
  };
}

function briefKeyboard(chatId, difficulty) {
  const l = lang(chatId);
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "💾 " + l.save, callback_data: "save_last" }],
        [{ text: "🔄 " + l.new, callback_data: "new" }],
        [
          { text: "🟢 Junior", callback_data: "diff_junior" },
          { text: "🟡 Middle", callback_data: "diff_middle" },
          { text: "🔴 Senior", callback_data: "diff_senior" },
        ],
        [{ text: "📂 " + l.saved, callback_data: "saved_list" }],
        [{ text: "🏠 " + l.home, callback_data: "start" }],
      ],
    },
  };
}

const startText =
  "🎨 <b>Design Brief Bot</b>\n\nПривет! Я помогаю дизайнерам прокачиваться.\n\n" +
  "📋 /brief — случайное ТЗ\n" +
  "🎨 /palette — цветовая палитра\n" +
  "🎯 /challenge — задание\n" +
  "🧠 /quiz — проверить знания\n" +
  "📊 /stats — моя статистика\n" +
  "💾 /save — сохранить ТЗ\n" +
  "📂 /saved — мои сохранёнки\n\n" +
  "<i>Выбери что хочешь 👇</i>";

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  if (!userLang.has(chatId)) {
    return bot.sendMessage(chatId, "🌐 Выбери язык / Choose language / Elige un idioma:", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🇷🇺 Русский", callback_data: "lang_ru" }],
          [{ text: "🇬🇧 English", callback_data: "lang_en" }],
          [{ text: "🇪🇸 Español", callback_data: "lang_es" }],
        ],
      },
    });
  }
  const l = lang(chatId);
  bot.sendMessage(chatId, l.start, { parse_mode: "HTML", ...langKeyboard(chatId) });
});

bot.onText(/\/language/, (msg) => {
  bot.sendMessage(msg.chat.id, "🌐 Выбери язык / Choose language / Elige un idioma:", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🇷🇺 Русский", callback_data: "lang_ru" }],
        [{ text: "🇬🇧 English", callback_data: "lang_en" }],
        [{ text: "🇪🇸 Español", callback_data: "lang_es" }],
      ],
    },
  });
});

bot.onText(/\/brief(.+)?/, (msg, match) => {
  const chatId = msg.chat.id;
  const arg = (match[1] || "").trim().toLowerCase();
  let diff = "middle";
  if (["junior", "middle", "senior"].includes(arg)) diff = arg;
  const result = generateBrief(diff);
  const stats = getStats(chatId);
  stats.total++;
  stats.byType[result.project] = (stats.byType[result.project] || 0) + 1;

  lastBrief.set(chatId, result.text);
  bot.sendMessage(chatId, result.text, { parse_mode: "HTML", ...briefKeyboard(chatId, diff) });
});

bot.onText(/\/save/, (msg) => {
  const chatId = msg.chat.id;
  const l = lang(chatId);
  const brief = lastBrief.get(chatId);
  if (!brief) return bot.sendMessage(chatId, l.save_first, menuKeyboard(chatId));
  if (!savedBriefs.has(chatId)) savedBriefs.set(chatId, []);
  const list = savedBriefs.get(chatId);
  if (list.length >= 20) return bot.sendMessage(chatId, l.saved_max, menuKeyboard(chatId));
  if (list.includes(brief)) return bot.sendMessage(chatId, l.saved_dup, menuKeyboard(chatId));
  list.push(brief);
  bot.sendMessage(chatId, l.saved_done, menuKeyboard(chatId));
});

bot.onText(/\/saved/, (msg) => showSavedList(msg.chat.id));

bot.onText(/\/stats/, (msg) => showStats(msg.chat.id));

bot.onText(/\/palette/, (msg) => {
  const chatId = msg.chat.id;
  const [name, ...colors] = pick(PALETTES);
  const hex = colors.map((c) => `• <code>${c}</code>`).join("\n");
  bot.sendMessage(chatId, `🎨 <b>${name}</b>\n\n${hex}\n\n<i>${lang(chatId).palette_send}</i>`, { parse_mode: "HTML", ...menuKeyboard(chatId) });
});

bot.onText(/\/challenge/, (msg) => {
  const chatId = msg.chat.id;
  const l = lang(chatId);
  bot.sendMessage(chatId, `${l.challenge_title}\n\n${pick(CHALLENGES)}\n\n<i>${l.challenge_hint}</i>`, { parse_mode: "HTML", ...menuKeyboard(chatId) });
});

bot.onText(/\/quiz/, (msg) => startQuiz(msg.chat.id));





function startQuiz(chatId) {
  const shuffled = [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 6);
  quizSessions.set(chatId, { questions: shuffled, index: 0, correct: 0 });
  sendQuestion(chatId);
}

function sendQuestion(chatId) {
  const session = quizSessions.get(chatId);
  if (!session || session.index >= session.questions.length) return finishQuiz(chatId);

  const l = lang(chatId);
  const q = session.questions[session.index];
  const buttons = q.options.map((opt, i) => [{ text: opt, callback_data: `quiz_${session.index}_${i}` }]);

  bot.sendMessage(
    chatId,
    `🧠 <b>${l.quiz_question} ${session.index + 1}/${session.questions.length}</b>\n\n${q.q}\n\n${l.correct}: ${session.correct}/${session.index}`,
    { parse_mode: "HTML", reply_markup: { inline_keyboard: buttons } },
  );
}

function finishQuiz(chatId) {
  const session = quizSessions.get(chatId);
  const total = session ? session.questions.length : 0;
  const correct = session ? session.correct : 0;
  const l = lang(chatId);
  quizSessions.delete(chatId);

  let grade = l.grade_bot;
  if (correct === total) grade = l.grade_god;
  else if (correct >= total * 0.8) grade = l.grade_awesome;
  else if (correct >= total * 0.6) grade = l.grade_good;
  else if (correct >= total * 0.4) grade = l.grade_study;

  bot.sendMessage(chatId, `🧠 <b>${l.quiz_done}</b>\n\n${l.correct}: ${correct}/${total}\n\n${grade}`, { parse_mode: "HTML", ...menuKeyboard(chatId) });
}

function showSavedList(chatId) {
  const l = lang(chatId);
  const list = savedBriefs.get(chatId) || [];
  if (list.length === 0) return bot.sendMessage(chatId, l.saved_none, menuKeyboard(chatId));

  const buttons = list.map((_, i) => [{ text: `${l.brief} #${i + 1}`, callback_data: `saved_show_${i}` }]);
  buttons.push([{ text: "📋 " + l.menu, callback_data: "start" }]);
  bot.sendMessage(chatId, `📂 <b>${l.saved_title}</b> (${list.length}/20)`, {
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: buttons },
  });
}

function showStats(chatId) {
  const l = lang(chatId);
  const stats = getStats(chatId);
  const byType = Object.entries(stats.byType).sort((a, b) => b[1] - a[1]);
  const topTypes = byType.slice(0, 8).map(([type, count]) => `• ${type}: ${count}`).join("\n") || l.no_stats;

  bot.sendMessage(
    chatId,
    `📊 <b>${l.stats_title}</b>\n\n${l.stats_total}: <b>${stats.total}</b>\n\n📋 <b>${l.stats_by_type}:</b>\n${topTypes}`,
    { parse_mode: "HTML", ...menuKeyboard(chatId) },
  );
}

bot.on("callback_query", (query) => {
  const data = query.data;
  const chatId = query.message.chat.id;
  const msgId = query.message.message_id;

  bot.answerCallbackQuery(query.id);

  if (data === "lang_ru" || data === "lang_en" || data === "lang_es") {
    const code = data.split("_")[1];
    userLang.set(chatId, code);
    const l = lang(chatId);
    bot.editMessageText(l.start, { chat_id: chatId, message_id: msgId, parse_mode: "HTML", ...langKeyboard(chatId) });
  } else if (data === "start") {
    const l = lang(chatId);
    bot.editMessageText(l.start, { chat_id: chatId, message_id: msgId, parse_mode: "HTML", ...langKeyboard(chatId) });
  } else if (data === "cb_brief") {
    const result = generateBrief("middle");
    const stats = getStats(chatId);
    stats.total++;
    stats.byType[result.project] = (stats.byType[result.project] || 0) + 1;
    lastBrief.set(chatId, result.text);
    bot.editMessageText(result.text, { chat_id: chatId, message_id: msgId, parse_mode: "HTML", ...briefKeyboard("middle") });
  } else if (data === "cb_palette") {
    const l = lang(chatId);
    const [name, ...colors] = pick(PALETTES);
    const hex = colors.map((c) => `• <code>${c}</code>`).join("\n");
    bot.editMessageText(`🎨 <b>${name}</b>\n\n${hex}\n\n<i>${l.palette_send}</i>`,
      { chat_id: chatId, message_id: msgId, parse_mode: "HTML", ...menuKeyboard(chatId) });
  } else if (data === "cb_challenge") {
    const l = lang(chatId);
    bot.editMessageText(`${l.challenge_title}\n\n${pick(CHALLENGES)}\n\n<i>${l.challenge_hint}</i>`,
      { chat_id: chatId, message_id: msgId, parse_mode: "HTML", ...menuKeyboard(chatId) });
  } else if (data === "cb_quiz") {
    bot.editMessageText(lang(chatId).quiz_start, { chat_id: chatId, message_id: msgId });
    startQuiz(chatId);
  } else if (data === "cb_stats") {
    const l = lang(chatId);
    const stats = getStats(chatId);
    const byType = Object.entries(stats.byType).sort((a, b) => b[1] - a[1]);
    const topTypes = byType.slice(0, 8).map(([type, count]) => `• ${type}: ${count}`).join("\n") || l.no_stats;
    bot.editMessageText(
      `📊 <b>${l.stats_title}</b>\n\n${l.stats_total}: <b>${stats.total}</b>\n\n📋 <b>${l.stats_by_type}:</b>\n${topTypes}`,
      { chat_id: chatId, message_id: msgId, parse_mode: "HTML", ...menuKeyboard(chatId) },
    );
  } else if (data === "new") {
    const result = generateBrief("middle");
    const stats = getStats(chatId);
    stats.total++;
    stats.byType[result.project] = (stats.byType[result.project] || 0) + 1;
    lastBrief.set(chatId, result.text);
    bot.editMessageText(result.text, { chat_id: chatId, message_id: msgId, parse_mode: "HTML", ...briefKeyboard(chatId, "middle") });
  } else if (data.startsWith("diff_")) {
    const diff = data.split("_")[1];
    const result = generateBrief(diff);
    const stats = getStats(chatId);
    stats.total++;
    stats.byType[result.project] = (stats.byType[result.project] || 0) + 1;
    lastBrief.set(chatId, result.text);
    bot.editMessageText(result.text, { chat_id: chatId, message_id: msgId, parse_mode: "HTML", ...briefKeyboard(chatId, diff) });
  } else if (data === "save_last") {
    const l = lang(chatId);
    const brief = lastBrief.get(chatId);
    if (!brief) return bot.sendMessage(chatId, l.save_first);
    if (!savedBriefs.has(chatId)) savedBriefs.set(chatId, []);
    const list = savedBriefs.get(chatId);
    if (list.length >= 20) return bot.sendMessage(chatId, l.saved_max);
    if (list.includes(brief)) return bot.sendMessage(chatId, l.saved_dup);
    list.push(brief);
    bot.editMessageText(l.saved_done, { chat_id: chatId, message_id: msgId, ...menuKeyboard(chatId) });
  } else if (data === "saved_list") {
    const l = lang(chatId);
    const list = savedBriefs.get(chatId) || [];
    if (list.length === 0) {
      return bot.editMessageText(l.saved_none, { chat_id: chatId, message_id: msgId, ...menuKeyboard(chatId) });
    }
    const buttons = list.map((_, i) => [{ text: `${l.brief} #${i + 1}`, callback_data: `saved_show_${i}` }]);
    buttons.push([{ text: "📋 " + l.menu, callback_data: "start" }]);
    bot.editMessageText(`📂 <b>${l.saved_title}</b> (${list.length}/20)`, {
      chat_id: chatId, message_id: msgId, parse_mode: "HTML",
      reply_markup: { inline_keyboard: buttons },
    });
  } else if (data.startsWith("saved_show_")) {
    const l = lang(chatId);
    const idx = parseInt(data.split("_")[2]);
    const list = savedBriefs.get(chatId) || [];
    if (!list[idx]) return bot.editMessageText(l.saved_notfound, { chat_id: chatId, message_id: msgId, ...menuKeyboard(chatId) });
    bot.editMessageText(list[idx], {
      chat_id: chatId, message_id: msgId, parse_mode: "HTML",
      reply_markup: { inline_keyboard: [[{ text: "🗑 " + l.del, callback_data: `saved_del_${idx}` }], [{ text: "📋 " + l.menu, callback_data: "start" }]] },
    });
  } else if (data.startsWith("saved_del_")) {
    const l = lang(chatId);
    const idx = parseInt(data.split("_")[2]);
    const list = savedBriefs.get(chatId);
    if (!list || !list[idx]) return bot.editMessageText(l.saved_notfound, { chat_id: chatId, message_id: msgId, ...menuKeyboard(chatId) });
    list.splice(idx, 1);
    if (list.length === 0) savedBriefs.delete(chatId);
    bot.editMessageText(l.saved_del, { chat_id: chatId, message_id: msgId, ...menuKeyboard(chatId) });
  } else if (data.startsWith("quiz_")) {
    const parts = data.split("_");
    const qIdx = parseInt(parts[1]);
    const chosen = parseInt(parts[2]);
    const session = quizSessions.get(chatId);
    if (!session || session.index !== qIdx) return;

    const q = session.questions[qIdx];
    const isCorrect = chosen === q.answer;
    if (isCorrect) session.correct++;

    const l = lang(chatId);
    bot.sendMessage(chatId, (isCorrect ? l.quiz_correct : l.quiz_wrong + " " + q.options[q.answer]), menuKeyboard(chatId));
    session.index++;
    sendQuestion(chatId);
  }
});

console.log("🤖 Design Brief Bot запущен");
