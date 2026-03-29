require('dotenv').config(); // Это позволяет коду видеть твой секретный файл .env
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Telegraf } = require('telegraf');

const app = express();
app.use(cors());
app.use(express.json());

// --- НАСТРОЙКИ (БЕРУТСЯ ИЗ СЕКРЕТНОГО ФАЙЛА) ---
const MONGO_URI = process.env.MONGO_URI; 
const BOT_TOKEN = process.env.BOT_TOKEN;
const WEB_APP_URL = "https://duhistiny6-source.github.io/pepe-pilot/"; 

const bot = new Telegraf(BOT_TOKEN);

// Подключение к MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log("MongoDB подключена успешно!"))
    .catch(err => console.error("Ошибка базы:", err));

// Схема пользователя
const userSchema = new mongoose.Schema({
    tgId: { type: String, unique: true },
    balancePLT: { type: Number, default: 0 },
    balanceUSDT: { type: Number, default: 0 }
});
const User = mongoose.model('User', userSchema);

// --- КОМАНДЫ БОТА ---
bot.start((ctx) => {
    ctx.reply('Добро пожаловать в Pepe Pilot! 🚀\n\nНажми на кнопку ниже, чтобы запустить игру.', {
        reply_markup: {
            inline_keyboard: [[
                { text: "Играть 🎮", web_app: { url: WEB_APP_URL } }
            ]]
        }
    });
});

// --- API ДЛЯ ИГРЫ ---

// Загрузка данных пользователя
app.get('/api/user/:id', async (req, res) => {
    try {
        let user = await User.findOne({ tgId: req.params.id });
        if (!user) user = await User.create({ tgId: req.params.id });
        res.json(user);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Сохранение монет
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

// Запуск
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер работает на порту ${PORT}`);
    bot.launch().catch(err => console.error("Ошибка запуска бота:", err)); 
});

// Плавная остановка
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
