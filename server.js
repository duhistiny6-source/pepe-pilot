const { Telegraf, Markup } = require('telegraf');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- НАСТРОЙКИ ---
const botToken = '8463237050:AAHzx0IFrrqaJ14mxj17xmhJIOr3P7eLfQ0';
const gameUrl = 'https://duhistiny6-source.github.io/pepe-pilot/'; 
const MONGO_URI = "mongodb+srv://duhistiny6_db_user:N8ub2EJ8UMTFACaM@cluster0.wegdg5f.mongodb.net/pepe_game?retryWrites=true&w=majority";

const app = express();
app.use(cors());
app.use(express.json());
const bot = new Telegraf(botToken);

// --- МОДЕЛЬ ДАННЫХ ---
const userSchema = new mongoose.Schema({
    tgId: { type: String, unique: true },
    balancePLT: { type: Number, default: 0 },
    referredBy: { type: String, default: null },
    friendsCount: { type: Number, default: 0 }
});
const User = mongoose.model('User', userSchema);

// --- ЛОГИКА БОТА ---
bot.start(async (ctx) => {
    const tgId = ctx.from.id.toString();
    const startPayload = ctx.payload; // параметр из ссылки ?start=refXXX

    let user = await User.findOne({ tgId });
    if (!user) {
        let refId = (startPayload && startPayload.startsWith('ref')) ? startPayload.replace('ref', '') : null;
        // Нельзя пригласить самого себя
        if (refId === tgId) refId = null;

        user = await User.create({ tgId, referredBy: refId });
        
        if (refId) {
            await User.findOneAndUpdate({ tgId: refId }, { $inc: { friendsCount: 1 } });
        }
    }

    ctx.reply('🚀 Добро пожаловать в Pepe Pilot!\n\nЗа каждого друга ты получаешь 10% от его заработка пожизненно!',
        Markup.inlineKeyboard([[Markup.button.webApp('Играть! 🎮', gameUrl)]])
    );
});

// --- API ДЛЯ ИГРЫ ---
// 1. Получить данные игрока при входе
app.get('/api/user/:tgId', async (req, res) => {
    try {
        let user = await User.findOne({ tgId: req.params.tgId });
        if (!user) user = { balancePLT: 0, friendsCount: 0 };
        res.json(user);
    } catch (e) { res.status(500).json(e); }
});

// 2. Сохранить улов + 10% рефереру
app.post('/api/collect', async (req, res) => {
    const { tgId, amount } = req.body;
    try {
        const user = await User.findOne({ tgId });
        if (user) {
            user.balancePLT += amount;
            await user.save();

            if (user.referredBy) {
                const bonus = amount * 0.1;
                await User.findOneAndUpdate({ tgId: user.referredBy }, { $inc: { balancePLT: bonus } });
            }
        }
        res.json({ success: true });
    } catch (e) { res.status(500).json(e); }
});

// --- ЗАПУСК ---
const PORT = process.env.PORT || 8080;
mongoose.connect(MONGO_URI).then(() => {
    console.log("MongoDB connected!");
    bot.launch();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
