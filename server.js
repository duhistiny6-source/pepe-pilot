require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Telegraf } = require('telegraf');

const app = express();
app.use(cors());
app.use(express.json());

// --- ДАННЫЕ ИЗ .ENV ---
const MONGO_URI = process.env.MONGO_URI; 
const BOT_TOKEN = process.env.BOT_TOKEN;
const WEB_APP_URL = "https://duhistiny6-source.github.io/pepe-pilot/"; 

// Проверка наличия токена в логах (для отладки)
if (!BOT_TOKEN) {
    console.error("ОШИБКА: BOT_TOKEN не найден в переменных окружения!");
}

const bot = new Telegraf(BOT_TOKEN);

// Чтобы Render не выключал сервер, добавим главную страницу
app.get('/', (req, res) => {
    res.send('Сервер Pepe Pilot запущен и работает!');
});

// Подключение к MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB подключена успешно!"))
    .catch(err => console.error("❌ Ошибка базы:", err));

// Схема пользователя
const userSchema = new mongoose.Schema({
    tgId: { type: String, unique: true },
    balancePLT: { type: Number, default: 0 },
    balanceUSDT: { type: Number, default: 0 }
});
const User = mongoose.model('User', userSchema);

// --- КОМАНДЫ БОТА ---
bot.start((ctx) => {
    console.log(`Получена команда /start от пользователя: ${ctx.from.id}`);
    ctx.reply('Добро пожаловать в Pepe Pilot! 🚀\n\nНажми на кнопку ниже, чтобы запустить игру.', {
        reply_markup: {
            inline_keyboard: [[
                { text: "Играть 🎮", web_app: { url: WEB_APP_URL } }
            ]]
        }
    });
});

// --- API ЭНДПОИНТЫ ---
app.get('/api/user/:id', async (req, res) => {
    try {
        let user = await User.findOne({ tgId: req.params.id });
        if (!user) user = await User.create({ tgId: req.params.id });
        res.json(user);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/collect', async (req, res) => {
    const { tgId, amount, type } = req.body;
    try {
        let updateField = (type === 'usdt') ? { balanceUSDT: amount } : { balancePLT: amount };
        const user = await User.findOneAndUpdate(
            { tgId: tgId },
            { $inc: updateField },
            { new: true, upsert: true }
        );
        res.json(user);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- ЗАПУСК ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    
    // Запуск бота
    bot.launch()
        .then(() => console.log("🤖 Телеграм бот запущен и слушает сообщения!"))
        .catch(err => console.error("❌ Ошибка запуска бота:", err));
});

// Остановка
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));


