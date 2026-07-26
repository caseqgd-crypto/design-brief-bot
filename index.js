require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const TOKEN = process.env.BOT_TOKEN;
const GEMINI_KEY = process.env.GEMINI_API_KEY;

if (!TOKEN) {
  console.error("❌ BOT_TOKEN не найден");
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, { polling: true });
let genAI = null;
let critiqueModel = null;

if (GEMINI_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_KEY);
  critiqueModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  console.log("🧠 Gemini подключён — критика дизайна доступна");
} else {
  console.log("⚠️ GEMINI_API_KEY не задан — /critique недоступен");
}

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

const startText =
  "🎨 <b>Design Brief Bot</b>\n\n" +
  "Привет! Я помогаю дизайнерам прокачиваться.\n\n" +
  "Что умею:\n" +
  "• Случайное ТЗ → /brief\n" +
  "• Junior / Middle / Senior → кнопки\n" +
  "• Анализ дизайна → отправь фото или /critique\n\n" +
  "<i>Нажми кнопку или просто отправь скриншот своей работы 👇</i>";

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, startText, {
    parse_mode: "HTML",
    ...keyboard("middle"),
  });
});

bot.onText(/\/brief(.+)?/, (msg, match) => {
  const chatId = msg.chat.id;
  const arg = (match[1] || "").trim().toLowerCase();
  let diff = "middle";
  if (["junior", "middle", "senior"].includes(arg)) diff = arg;
  bot.sendMessage(chatId, generateBrief(diff), {
    parse_mode: "HTML",
    ...keyboard(diff),
  });
});

bot.onText(/\/critique/, async (msg) => {
  const chatId = msg.chat.id;

  if (!critiqueModel) {
    return bot.sendMessage(
      chatId,
      "❌ Анализ дизайна отключён. Администратор не добавил GEMINI_API_KEY.\n\n" +
        "Запроси бесплатный ключ: https://aistudio.google.com/apikey",
    );
  }

  if (msg.reply_to_message && msg.reply_to_message.photo) {
    await analyzePhoto(chatId, msg.reply_to_message.photo);
  } else {
    bot.sendMessage(
      chatId,
      "📸 Отправь мне скриншот или фото дизайна, и я проанализирую его.\n\n" +
        "Или ответь этой командой на уже отправленное изображение.",
    );
  }
});

bot.on("photo", async (msg) => {
  if (!critiqueModel) return;

  const chatId = msg.chat.id;
  const waitMsg = await bot.sendMessage(chatId, "🔍 Анализирую дизайн...");

  try {
    const analysis = await analyzeImage(msg.photo);
    await bot.deleteMessage(chatId, waitMsg.message_id);
    bot.sendMessage(chatId, analysis, { parse_mode: "HTML" });
  } catch (err) {
    await bot.deleteMessage(chatId, waitMsg.message_id);
    bot.sendMessage(chatId, `❌ Ошибка анализа: ${err.message}`);
  }
});

async function analyzeImage(photos) {
  const photo = photos[photos.length - 1];
  const file = await bot.getFile(photo.file_id);
  const fileUrl = `https://api.telegram.org/file/bot${TOKEN}/${file.file_path}`;
  const resp = await axios.get(fileUrl, { responseType: "arraybuffer" });
  const base64 = Buffer.from(resp.data).toString("base64");
  const mimeType = file.file_path.endsWith(".png") ? "image/png" : "image/jpeg";

  const prompt =
    "Ты — senior дизайнер с 10-летним опытом. Проанализируй этот дизайн и дай структурированную обратную связь на русском языке.\n\n" +
    "📊 <b>СТРУКТУРА ОТВЕТА:</b>\n\n" +
    "✅ <b>Что сделано хорошо</b> (3-5 пунктов)\n" +
    "• напиши конкретные сильные стороны: композиция, цвета, типографика, иерархия, отступы\n\n" +
    "⚠️ <b>Что можно улучшить</b> (2-4 пункта)\n" +
    "• конкретные ошибки и зоны роста\n\n" +
    "💡 <b>Рекомендации</b> (2-3 пункта)\n" +
    "• конкретные шаги что исправить прямо сейчас\n\n" +
    "🎯 <b>Оценка</b> (от 1 до 10)\n\n" +
    "Будь конструктивным. Пиши по делу, без воды. Если дизайн отличный — похвали, но всё равно найди что улучшить.";

  const result = await critiqueModel.generateContent([
    prompt,
    { inlineData: { data: base64, mimeType } },
  ]);

  return result.response.text();
}

bot.on("callback_query", (query) => {
  const data = query.data;
  const chatId = query.message.chat.id;
  const messageId = query.message.message_id;

  bot.answerCallbackQuery(query.id);

  if (data === "new") {
    bot.editMessageText(generateBrief("middle"), {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: "HTML",
      ...keyboard("middle"),
    });
  } else if (data.startsWith("diff_")) {
    const diff = data.split("_")[1];
    bot.editMessageText(generateBrief(diff), {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: "HTML",
      ...keyboard(diff),
    });
  } else if (data === "start") {
    bot.editMessageText(startText, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: "HTML",
      ...keyboard("middle"),
    });
  }
});

console.log("🤖 Design Brief Bot запущен");
