const { Telegraf, Markup } = require('telegraf');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- НАСТРОЙКИ ---
const botToken = '8463237050:AAHzx0IFrrqaJ14mxj17xmhJIOr3P7eLfQ0';
const gameUrl = 'https://duhistiny6-source.github.io/pepe-pilot/'; 
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://duhistiny6_db_user:N8ub2EJ8UMTFACaM@cluster0.wegdg5f.mongodb.net/pepe_game?retryWrites=true&w=majority";

const app = express();
app.use(cors());
app.use(express.json());
const bot = new Telegraf(botToken);

// --- МОДЕЛЬ ДАННЫХ ---
const userSchema = new mongoose.Schema({
    tgId: { type: String, unique: true },
    balancePLT: { type: Number, default: 0 },
    balanceUSDT: { type: Number, default: 0 }, // Поле для USDT
    referredBy: { type: String, default: null },
    friendsCount: { type: Number, default: 0 }
});
const User = mongoose.model('User', userSchema);

// --- ЛОГИКА БОТА ---
bot.start(async (ctx) => {
    const tgId = ctx.from.id.toString();
    const startPayload = ctx.payload; 

    let user = await User.findOne({ tgId });
    if (!user) {
        let refId = (startPayload && startPayload.startsWith('ref')) ? startPayload.replace('ref', '') : null;
        if (refId === tgId) refId = null;

        user = await User.create({ tgId, referredBy: refId });
        if (refId) {
            await User.findOneAndUpdate({ tgId: refId }, { $inc: { friendsCount: 1 } });
        }
    }

    ctx.reply('🚀 Pepe Pilot запущен!\n\nПриглашай друзей через /ref и получай 10% от их сборов!',
        Markup.inlineKeyboard([[Markup.button.webApp('Играть! 🎮', gameUrl)]])
    );
});

// Команда для получения ссылки
bot.command('ref', (ctx) => {
    const refLink = `https://t.me/PepePilot_bot?start=ref${ctx.from.id}`; 
    ctx.reply(`Твоя реферальная ссылка:\n${refLink}`);
});

// --- API ДЛЯ ИГРЫ ---

// 1. Получить данные игрока
app.get('/api/user/:tgId', async (req, res) => {
    try {
        let user = await User.findOne({ tgId: req.params.tgId });
        if (!user) {
            user = await User.create({ tgId: req.params.tgId });
        }
        res.json({
            balancePLT: user.balancePLT || 0,
            balanceUSDT: user.balanceUSDT || 0,
            friendsCount: user.friendsCount || 0
        });
    } catch (e) { res.status(500).json(e); }
});

// 2. Сохранить монеты (PLT и USDT)
app.post('/api/collect', async (req, res) => {
    const { tgId, amount, amountUSDT } = req.body;
    
    // Лог для проверки в Render Logs
    console.log(`[SAVE] User: ${tgId} | PLT: +${amount} | USDT: +${amountUSDT}`);

    try {
        const user = await User.findOne({ tgId });
        if (user) {
            // Прибавляем оба значения
            user.balancePLT = (user.balancePLT || 0) + (Number(amount) || 0);
            user.balanceUSDT = (user.balanceUSDT || 0) + (Number(amountUSDT) || 0);
            await user.save();

            // Реферальный бонус 10%
            if (user.referredBy) {
                await User.findOneAndUpdate(
                    { tgId: user.referredBy }, 
                    { $inc: { 
                        balancePLT: (Number(amount) || 0) * 0.1, 
                        balanceUSDT: (Number(amountUSDT) || 0) * 0.1 
                    }}
                );
            }
        }
        res.json({ success: true });
    } catch (e) { 
        console.error("Save error:", e);
        res.status(500).json(e); 
    }
});

// --- ЗАПУСК ---
const PORT = process.env.PORT || 8080; 
mongoose.connect(MONGO_URI).then(() => {
    console.log("MongoDB connected!");
    bot.launch();
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
