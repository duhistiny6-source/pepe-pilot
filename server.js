require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Telegraf } = require('telegraf');

const app = express();
app.use(cors());
app.use(express.json());

// --- ДАННЫЕ ИЗ ПЕРЕМЕННЫХ ОКРУЖЕНИЯ ---
const MONGO_URI = process.env.MONGO_URI; 
const BOT_TOKEN = process.env.BOT_TOKEN;
const WEB_APP_URL = "https://duhistiny6-source.github.io/pepe-pilot/"; 

const bot = new Telegraf(BOT_TOKEN);

// Главная страница для Render
app.get('/', (req, res) => res.send('Pepe Pilot Server is Running!'));

// Подключение к MongoDB с обработкой ошибок, чтобы не "вешать" сервер
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB подключена!"))
    .catch(err => console.error("❌ Ошибка базы (но бот всё равно запустится):", err.message));

// Схема пользователя
const userSchema = new mongoose.Schema({
    tgId: { type: String, unique: true },
    balancePLT: { type: Number, default: 0 },
    balanceUSDT: { type: Number, default: 0 }
});
const User = mongoose.model('User', userSchema);

// --- КОМАНДЫ БОТА ---
bot.start((ctx) => {
    console.log(`Команда /start от: ${ctx.from.id}`);
    ctx.reply('Добро пожаловать в Pepe Pilot! 🚀\n\nНажми на кнопку ниже, чтобы запустить игру.', {
        reply_markup: {
            inline_keyboard: [[
                { text: "Играть 🎮", web_app: { url: WEB_APP_URL } }
            ]]
        }
    });
});

// --- API ДЛЯ ИГРЫ ---
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
            { tgId: tgId }, { $inc: updateField }, { new: true, upsert: true }
        );
        res.json(user);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- ЗАПУСК СЕРВЕРА И БОТА ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Сервер на порту ${PORT}`);
    
    bot.launch()
        .then(() => console.log("🤖 Бот запущен в Telegram!"))
        .catch(err => console.error("❌ Ошибка бота:", err));
});

// Мягкая остановка
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
         
