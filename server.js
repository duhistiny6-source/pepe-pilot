require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Telegraf } = require('telegraf');

const app = express();
app.use(cors());
app.use(express.json());

// Параметры берутся из переменных окружения (настроены в Render)
const MONGO_URI = process.env.MONGO_URI; 
const BOT_TOKEN = process.env.BOT_TOKEN;
const WEB_APP_URL = "https://duhistiny6-source.github.io/pepe-pilot/"; 

const bot = new Telegraf(BOT_TOKEN);

// Подключение к базе данных MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log("MongoDB подключена успешно!"))
    .catch(err => console.error("Ошибка подключения к MongoDB:", err));

// Модель пользователя
const userSchema = new mongoose.Schema({
    tgId: { type: String, unique: true },
    balancePLT: { type: Number, default: 0 },
    balanceUSDT: { type: Number, default: 0 }
});
const User = mongoose.model('User', userSchema);

// Команды телеграм-бота
bot.start((ctx) => {
    ctx.reply('Добро пожаловать в Pepe Pilot! 🚀\n\nНажми на кнопку ниже, чтобы начать игру.', {
        reply_markup: {
            inline_keyboard: [[
                { text: "Играть 🎮", web_app: { url: WEB_APP_URL } }
            ]]
        }
    });
});

// API Эндпоинты
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

// Запуск сервера на порту из конфига Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    bot.launch().catch(err => console.error("Ошибка запуска бота:", err));
});

// Корректное завершение работы
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
