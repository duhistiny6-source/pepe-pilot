const { Telegraf, Markup } = require('telegraf');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const botToken = '8463237050:AAHzx0IFrrqaJ14mxj17xmhJIOr3P7eLfQ0';
const gameUrl = 'https://duhistiny6-source.github.io/pepe-pilot/'; 
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://duhistiny6_db_user:N8ub2EJ8UMTFACaM@cluster0.wegdg5f.mongodb.net/pepe_game?retryWrites=true&w=majority";

const app = express();
app.use(cors());
app.use(express.json());
const bot = new Telegraf(botToken);

// Модель данных с поддержкой обеих валют
const userSchema = new mongoose.Schema({
    tgId: { type: String, unique: true },
    balancePLT: { type: Number, default: 0 },
    balanceUSDT: { type: Number, default: 0 },
    referredBy: { type: String, default: null },
    friendsCount: { type: Number, default: 0 }
});
const User = mongoose.model('User', userSchema);

bot.start(async (ctx) => {
    const tgId = ctx.from.id.toString();
    const startPayload = ctx.payload; 
    let user = await User.findOne({ tgId });
    if (!user) {
        let refId = (startPayload && startPayload.startsWith('ref')) ? startPayload.replace('ref', '') : null;
        user = await User.create({ tgId, referredBy: refId });
        if (refId) await User.findOneAndUpdate({ tgId: refId }, { $inc: { friendsCount: 1 } });
    }
    ctx.reply('🚀 Летим! Собирай монеты.', 
        Markup.inlineKeyboard([[Markup.button.webApp('Играть! 🎮', gameUrl)]])
    );
});

// Эндпоинт для сохранения
app.post('/api/collect', async (req, res) => {
    const { tgId, amount, amountUSDT } = req.body;
    
    // Логирование в Render, чтобы вы видели, приходят ли USDT
    console.log(`[LOG] Сохранение для ${tgId}: PLT=${amount}, USDT=${amountUSDT}`);

    try {
        const user = await User.findOne({ tgId });
        if (user) {
            // Превращаем в числа и прибавляем
            user.balancePLT += (Number(amount) || 0);
            user.balanceUSDT += (Number(amountUSDT) || 0);
            await user.save();

            // Реферальный бонус 10% на обе валюты
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
        console.error("Ошибка сохранения:", e);
        res.status(500).json({ error: e.message });
    }
});

// Эндпоинт для загрузки баланса в игру
app.get('/api/user/:tgId', async (req, res) => {
    try {
        const user = await User.findOne({ tgId: req.params.tgId });
        res.json(user || { balancePLT: 0, balanceUSDT: 0 });
    } catch (e) { res.status(500).send(e); }
});

const PORT = process.env.PORT || 8080;
mongoose.connect(MONGO_URI).then(() => {
    bot.launch();
    app.listen(PORT, "0.0.0.0", () => console.log(`Работаем на порту ${PORT}`));
});
