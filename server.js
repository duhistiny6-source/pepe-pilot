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

// Модель данных с USDT
const userSchema = new mongoose.Schema({
    tgId: { type: String, unique: true },
    balancePLT: { type: Number, default: 0 },
    balanceUSDT: { type: Number, default: 0 }, // Поле для USDT
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
    ctx.reply('🚀 Pepe Pilot! Собирай PLT и USDT.', 
        Markup.inlineKeyboard([[Markup.button.webApp('Играть! 🎮', gameUrl)]])
    );
});

// Сохранение результатов (PLT + USDT)
app.post('/api/collect', async (req, res) => {
    const { tgId, amount, amountUSDT } = req.body;
    console.log(`[SAVE] User: ${tgId} | PLT: ${amount} | USDT: ${amountUSDT}`);

    try {
        const user = await User.findOne({ tgId });
        if (user) {
            user.balancePLT += (Number(amount) || 0);
            user.balanceUSDT += (Number(amountUSDT) || 0); // Сохраняем USDT
            await user.save();

            if (user.referredBy) {
                await User.findOneAndUpdate(
                    { tgId: user.referredBy },
                    { $inc: { balancePLT: (amount || 0) * 0.1, balanceUSDT: (amountUSDT || 0) * 0.1 } }
                );
            }
        }
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/user/:tgId', async (req, res) => {
    try {
        const user = await User.findOne({ tgId: req.params.tgId });
        res.json(user || { balancePLT: 0, balanceUSDT: 0 });
    } catch (e) { res.status(500).send(e); }
});

const PORT = process.env.PORT || 8080;
mongoose.connect(MONGO_URI).then(() => {
    bot.launch();
    app.listen(PORT, "0.0.0.0", () => console.log(`Server on ${PORT}`));
});
