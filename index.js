require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");

const TOKEN = process.env.BOT_TOKEN;
if (!TOKEN) {
  console.error("❌ BOT_TOKEN не найден. Создай .env с BOT_TOKEN=твой_токен");
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, { polling: true });

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
    `📋 <b>ТЕХНИЧЕСКОЕ ЗАДАНИЕ</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `<b>Тип проекта:</b> ${project}\n` +
    `<b>Бренд:</b> ${brandName} — ${brandDesc}\n` +
    `<b>Индустрия:</b> ${industry}\n` +
    `<b>Сложность:</b> ${diffText}\n` +
    `<b>Срок:</b> ${deadline}\n\n` +
    `🎨 <b>СТИЛЬ И ВИЗУАЛ</b>\n` +
    `• Направление: ${style}\n` +
    `• Цвета: ${colors}\n` +
    `• Настроение: ${mood}\n\n` +
    `📝 <b>ТРЕБОВАНИЯ</b>\n` +
    `• ${reqs.join("\n• ")}\n\n` +
    `💎 <b>ОСОБЕННОСТЬ</b>\n` +
    `• ${bonus}\n\n` +
    `<b>Контекст:</b> Это реальный проект для вымышленного стартапа. Дизайн должен решать бизнес-задачу: привлечь ЦА и выделиться на рынке ${industry.toLowerCase()}.\n\n` +
    `<b>Подсказка:</b> Не бойся экспериментировать — это тренировка!\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `🕒 Сгенерировано: ${now}`
  );
}

function keyboard(difficulty) {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🔄 Новое ТЗ", callback_data: "new" }],
        [
          { text: "🟢 Junior", callback_data: "diff_junior" },
          { text: "🟡 Middle", callback_data: "diff_middle" },
          { text: "🔴 Senior", callback_data: "diff_senior" },
        ],
        [{ text: "🏠 В начало", callback_data: "start" }],
      ],
    },
  };
}

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "🎨 <b>Design Brief Bot</b>\n\nПривет! Я генерирую <b>технические задания на дизайн</b> для прокачки навыков и портфолио.\n\nЧто умею:\n• Случайное ТЗ → /brief\n• Junior / Middle / Senior → кнопки ниже\n• Бесконечные комбинации — каждый раз уникальное задание\n\n<i>Нажми «Новое ТЗ» или выбери уровень сложности 👇</i>",
    { parse_mode: "HTML", ...keyboard("middle") }
  );
});

bot.onText(/\/brief(.+)?/, (msg, match) => {
  const chatId = msg.chat.id;
  const arg = (match[1] || "").trim().toLowerCase();
  let diff = "middle";
  if (["junior", "middle", "senior"].includes(arg)) diff = arg;
  const text = generateBrief(diff);
  bot.sendMessage(chatId, text, { parse_mode: "HTML", ...keyboard(diff) });
});

bot.on("callback_query", (query) => {
  const data = query.data;
  const chatId = query.message.chat.id;
  const messageId = query.message.message_id;

  bot.answerCallbackQuery(query.id);

  if (data === "new") {
    const text = generateBrief("middle");
    bot.editMessageText(text, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: "HTML",
      ...keyboard("middle"),
    });
  } else if (data.startsWith("diff_")) {
    const diff = data.split("_")[1];
    const text = generateBrief(diff);
    bot.editMessageText(text, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: "HTML",
      ...keyboard(diff),
    });
  } else if (data === "start") {
    bot.editMessageText(
      "🎨 <b>Design Brief Bot</b>\n\nПривет! Я генерирую <b>технические задания на дизайн</b> для прокачки навыков и портфолио.\n\nЧто умею:\n• Случайное ТЗ → /brief\n• Junior / Middle / Senior → кнопки ниже\n• Бесконечные комбинации — каждый раз уникальное задание\n\n<i>Нажми «Новое ТЗ» или выбери уровень сложности 👇</i>",
      {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "HTML",
        ...keyboard("middle"),
      }
    );
  }
});

console.log("🤖 Бот запущен. Нажми Ctrl+C для остановки.");
