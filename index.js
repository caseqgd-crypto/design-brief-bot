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
  "Нарисуй иконку «настройки» в 3 разных стилях: flat, outline, filled. Экспортируй в SVG.",
  "Сделай мудборд для финтех-стартапа. 10 референсов, опиши почему каждый подходит.",
  "Найди 3 плохих дизайна на реальных сайтах и переделай их (один экран).",
  "Спроектируй страницу 404 для мобильного приложения. Оригинально + полезно.",
  "Выбери логотип известного бренда и перерисуй его в своём стиле.",
  "Сделай 3 варианта визитки для себя. Разные стили, один макет.",
  "Нарисуй 10 иконок для погодного приложения (солнце, дождь, снег и т.д.).",
  "Создай UI для экрана регистрации. Минимум полей, максимум удобства.",
  "Переделай главный экран любого приложения, которое тебя бесит.",
  "Сделай анимацию загрузки (loader) в Figma. 3 варианта.",
  "Нарисуй паттерн/текстуру для обоев телефона. Ручная работа.",
  "Спроектируй карточку товара для маркетплейса. Выдели CTA.",
  "Выбери шрифт и сделай 5 постеров с цитатами. Играй с типографикой.",
  "Сделай гайдлайн по иконкам для вымышленного бренда (стиль, сетка, цвета).",
  "Нарисуй дашборд для аналитики. 3 графика, 2 метрики, 1 таблица.",
];

const QUIZ_QUESTIONS = [
  {
    q: "Какой цвет получается при смешивании синего и жёлтого?",
    options: ["Зелёный", "Фиолетовый", "Оранжевый", "Коричневый"],
    answer: 0,
  },
  {
    q: "Что такое кернинг в типографике?",
    options: [
      "Расстояние между строками",
      "Расстояние между конкретными парами букв",
      "Размер шрифта",
      "Выравнивание текста",
    ],
    answer: 1,
  },
  {
    q: "Какой формат изображения поддерживает прозрачность?",
    options: ["JPEG", "PNG", "BMP", "GIF"],
    answer: 1,
  },
  {
    q: "Что такое Z-паттерн в веб-дизайне?",
    options: [
      "Схема движения взгляда слева-направо сверху-вниз",
      "Зигзагообразное расположение блоков",
      "Анимация появления элементов",
      "Тип сетки для галереи",
    ],
    answer: 0,
  },
  {
    q: "Какой шрифт относится к гротескам (без засечек)?",
    options: ["Times New Roman", "Roboto", "Georgia", "Playfair Display"],
    answer: 1,
  },
  {
    q: "Сколько цветов в цветовой модели RGB?",
    options: ["2", "3", "4", "5"],
    answer: 1,
  },
  {
    q: "Что такое UI Kit?",
    options: [
      "Набор готовых компонентов интерфейса",
      "Инструмент для прототипирования",
      "Плагин для Figma",
      "Шрифтовой набор",
    ],
    answer: 0,
  },
  {
    q: "Какой масштаб используется в дизайне интерфейсов для iOS?",
    options: ["1x", "2x", "@1x и @2x", "@1x, @2x и @3x"],
    answer: 3,
  },
  {
    q: "Что такое «воздух» в дизайне?",
    options: [
      "Анимация элементов",
      "Пустое пространство между элементами",
      "Градиентная заливка",
      "Прозрачность слоя",
    ],
    answer: 1,
  },
  {
    q: "Какой принцип гештальта гласит «похожие элементы воспринимаются как группа»?",
    options: ["Близость", "Подобие", "Замыкание", "Фигура и фон"],
    answer: 1,
  },
  {
    q: "Какой формат лучше всего подходит для логотипа?",
    options: ["JPG", "SVG", "PNG-8", "WEBP"],
    answer: 1,
  },
  {
    q: "Что измеряется в pt (пунктах)?",
    options: ["Размер шрифта", "Размер пикселя", "Длина линии", "Толщина обводки"],
    answer: 0,
  },
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
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

  return (
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
    `🕒 Сгенерировано: ${now}`
  );
}

function briefKeyboard(difficulty) {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "💾 Сохранить", callback_data: "save_last" }],
        [{ text: "🔄 Новое ТЗ", callback_data: "new" }],
        [
          { text: "🟢 Junior", callback_data: "diff_junior" },
          { text: "🟡 Middle", callback_data: "diff_middle" },
          { text: "🔴 Senior", callback_data: "diff_senior" },
        ],
        [{ text: "📂 Мои сохранёнки", callback_data: "saved_list" }],
        [{ text: "🏠 В начало", callback_data: "start" }],
      ],
    },
  };
}

function startKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📋 ТЗ", callback_data: "cb_brief" }, { text: "🎯 Челендж", callback_data: "cb_challenge" }],
        [{ text: "🧠 Квиз", callback_data: "cb_quiz" }, { text: "📂 Сохранёнки", callback_data: "saved_list" }],
        [{ text: "🔄 Новое ТЗ", callback_data: "new" }],
      ],
    },
  };
}

const startText =
  "🎨 <b>Design Brief Bot</b>\n\nПривет! Я помогаю дизайнерам прокачиваться.\n\n" +
  "📋 /brief — случайное ТЗ\n" +
  "🎯 /challenge — задание на сегодня\n" +
  "🧠 /quiz — проверить знания\n" +
  "💾 /save — сохранить ТЗ\n" +
  "📂 /saved — мои сохранёнки\n\n" +
  "<i>Выбери что хочешь 👇</i>";

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, startText, {
    parse_mode: "HTML",
    ...startKeyboard(),
  });
});

bot.onText(/\/brief(.+)?/, (msg, match) => {
  const chatId = msg.chat.id;
  const arg = (match[1] || "").trim().toLowerCase();
  let diff = "middle";
  if (["junior", "middle", "senior"].includes(arg)) diff = arg;
  const brief = generateBrief(diff);
  lastBrief.set(chatId, brief);
  bot.sendMessage(chatId, brief, { parse_mode: "HTML", ...briefKeyboard(diff) });
});

bot.onText(/\/save/, (msg) => {
  const chatId = msg.chat.id;
  const brief = lastBrief.get(chatId);
  if (!brief) {
    return bot.sendMessage(chatId, "Сначала сгенерируй ТЗ через /brief");
  }
  if (!savedBriefs.has(chatId)) savedBriefs.set(chatId, []);
  const list = savedBriefs.get(chatId);
  if (list.length >= 20) {
    return bot.sendMessage(chatId, "Максимум 20 сохранёнок. Удали одну через /saved");
  }
  if (list.includes(brief)) {
    return bot.sendMessage(chatId, "Это ТЗ уже сохранено");
  }
  list.push(brief);
  bot.sendMessage(chatId, "✅ ТЗ сохранено!");
});

bot.onText(/\/saved/, (msg) => showSavedList(msg.chat.id));

bot.onText(/\/challenge/, (msg) => {
  const chatId = msg.chat.id;
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const challenge = CHALLENGES[dayOfYear % CHALLENGES.length];
  bot.sendMessage(
    chatId,
    `🎯 <b>Челендж дня</b>\n\n${challenge}\n\n<i>Сделай и закрепи результат в портфолио!</i>`,
    { parse_mode: "HTML" },
  );
});

bot.onText(/\/quiz/, (msg) => startQuiz(msg.chat.id));

function startQuiz(chatId) {
  const shuffled = [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 6);
  quizSessions.set(chatId, { questions: shuffled, index: 0, correct: 0 });
  sendQuestion(chatId);
}

function sendQuestion(chatId) {
  const session = quizSessions.get(chatId);
  if (!session || session.index >= session.questions.length) {
    return finishQuiz(chatId);
  }

  const q = session.questions[session.index];
  const buttons = q.options.map((opt, i) => [
    { text: opt, callback_data: `quiz_${session.index}_${i}` },
  ]);

  bot.sendMessage(
    chatId,
    `🧠 <b>Вопрос ${session.index + 1}/${session.questions.length}</b>\n\n${q.q}\n\nПравильно: ${session.correct}/${session.index}`,
    {
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: buttons },
    },
  );
}

function finishQuiz(chatId) {
  const session = quizSessions.get(chatId);
  const total = session ? session.questions.length : 0;
  const correct = session ? session.correct : 0;
  quizSessions.delete(chatId);

  let grade = "🤡";
  if (correct === total) grade = "🏆 Дизайн-бог!";
  else if (correct >= total * 0.8) grade = "🔥 Отлично!";
  else if (correct >= total * 0.6) grade = "👍 Неплохо";
  else if (correct >= total * 0.4) grade = "📚 Учи матчасть";

  bot.sendMessage(
    chatId,
    `🧠 <b>Квиз завершён!</b>\n\nПравильно: ${correct}/${total}\n\n${grade}`,
    { parse_mode: "HTML" },
  );
}

bot.on("callback_query", (query) => {
  const data = query.data;
  const chatId = query.message.chat.id;
  const msgId = query.message.message_id;

  bot.answerCallbackQuery(query.id);

  if (data === "start") {
    bot.editMessageText(startText, {
      chat_id: chatId,
      message_id: msgId,
      parse_mode: "HTML",
      ...startKeyboard(),
    });
  } else if (data === "cb_brief") {
    const brief = generateBrief("middle");
    lastBrief.set(chatId, brief);
    bot.editMessageText(brief, {
      chat_id: chatId,
      message_id: msgId,
      parse_mode: "HTML",
      ...briefKeyboard("middle"),
    });
  } else if (data === "cb_challenge") {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const challenge = CHALLENGES[dayOfYear % CHALLENGES.length];
    bot.editMessageText(
      `🎯 <b>Челендж дня</b>\n\n${challenge}\n\n<i>Сделай и закрепи результат в портфолио!</i>`,
      { chat_id: chatId, message_id: msgId, parse_mode: "HTML" },
    );
  } else if (data === "cb_quiz") {
    bot.editMessageText("🧠 Начинаем квиз!", { chat_id: chatId, message_id: msgId });
    startQuiz(chatId);
  } else if (data === "new") {
    const brief = generateBrief("middle");
    lastBrief.set(chatId, brief);
    bot.editMessageText(brief, {
      chat_id: chatId,
      message_id: msgId,
      parse_mode: "HTML",
      ...briefKeyboard("middle"),
    });
  } else if (data.startsWith("diff_")) {
    const diff = data.split("_")[1];
    const brief = generateBrief(diff);
    lastBrief.set(chatId, brief);
    bot.editMessageText(brief, {
      chat_id: chatId,
      message_id: msgId,
      parse_mode: "HTML",
      ...briefKeyboard(diff),
    });
  } else if (data === "save_last") {
    const brief = lastBrief.get(chatId);
    if (!brief) return bot.sendMessage(chatId, "Нет ТЗ для сохранения");
    if (!savedBriefs.has(chatId)) savedBriefs.set(chatId, []);
    const list = savedBriefs.get(chatId);
    if (list.length >= 20) return bot.sendMessage(chatId, "Максимум 20 сохранёнок. Удали одну через /saved");
    if (list.includes(brief)) return bot.sendMessage(chatId, "Уже сохранено");
    list.push(brief);
    bot.sendMessage(chatId, "✅ ТЗ сохранено!");
  } else if (data === "saved_list") {
    showSavedList(chatId);
  } else if (data.startsWith("saved_show_")) {
    const idx = parseInt(data.split("_")[2]);
    const list = savedBriefs.get(chatId) || [];
    if (!list[idx]) return bot.sendMessage(chatId, "ТЗ не найдено");
    bot.sendMessage(chatId, list[idx], {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "🗑 Удалить", callback_data: `saved_del_${idx}` }],
        ],
      },
    });
  } else if (data.startsWith("saved_del_")) {
    const idx = parseInt(data.split("_")[2]);
    const list = savedBriefs.get(chatId);
    if (!list || !list[idx]) return bot.sendMessage(chatId, "ТЗ не найдено");
    list.splice(idx, 1);
    if (list.length === 0) savedBriefs.delete(chatId);
    bot.sendMessage(chatId, "🗑 Удалено!");
  } else if (data.startsWith("quiz_")) {
    const parts = data.split("_");
    const qIdx = parseInt(parts[1]);
    const chosen = parseInt(parts[2]);
    const session = quizSessions.get(chatId);
    if (!session || session.index !== qIdx) return;

    const q = session.questions[qIdx];
    const isCorrect = chosen === q.answer;
    if (isCorrect) session.correct++;

    bot.sendMessage(chatId, isCorrect ? "✅ Верно!" : `❌ Неверно. Правильный ответ: ${q.options[q.answer]}`);

    session.index++;
    sendQuestion(chatId);
  }
});

function showSavedList(chatId) {
  const list = savedBriefs.get(chatId) || [];
  if (list.length === 0) {
    return bot.sendMessage(chatId, "📂 Сохранёнок нет. Сгенерируй ТЗ → /brief → 💾 Сохранить");
  }

  const buttons = list.map((_, i) => [
    { text: `ТЗ #${i + 1}`, callback_data: `saved_show_${i}` },
  ]);

  bot.sendMessage(chatId, `📂 <b>Мои сохранёнки</b> (${list.length}/20)`, {
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: buttons },
  });
}

console.log("🤖 Design Brief Bot запущен");
