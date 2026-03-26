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

// Схема данных
const userSchema = new mongoose.Schema({
    tgId: { type: String, unique: true, required: true },
    balancePLT: { type: Number, default: 0 },
    balanceUSDT: { type: Number, default: 0 },
    referredBy: { type: String, default: null },
    friendsCount: { type: Number, default: 0 }
});
const User = mongoose.model('User', userSchema);

// Команды бота
bot.start(async (ctx) => {
    const tgId = ctx.from.id.toString();
    const startPayload = ctx.payload; 
    try {
        let user = await User.findOne({ tgId });
        if (!user) {
            let refId = (startPayload && startPayload.startsWith('ref')) ? startPayload.replace('ref', '') : null;
            if (refId === tgId) refId = null;
            user = await User.create({ tgId, referredBy: refId });
            if (refId) await User.findOneAndUpdate({ tgId: refId }, { $inc: { friendsCount: 1 } });
        }
        ctx.reply('🚀 Pepe Pilot готов! Собирай PLT и USDT.',
            Markup.inlineKeyboard([[Markup.button.webApp('Играть! 🎮', gameUrl)]])
        );
    } catch (e) { console.error("Start error:", e); }
});

bot.command('ref', (ctx) => {
    ctx.reply(`Твоя ссылка:\nhttps://t.me/PepePilot_bot?start=ref${ctx.from.id}`);
});

// API: Получение данных
app.get('/api/user/:tgId', async (req, res) => {
    try {
        let user = await User.findOne({ tgId: req.params.tgId });
        if (!user) {
            user = await User.create({ tgId: req.params.tgId });
        }
        res.json(user);
    } catch (e) { res.status(500).send(e.message); }
});

// API: Сохранение (ИСПРАВЛЕНО)
app.post('/api/collect', async (req, res) => {
    const { tgId, amount, amountUSDT } = req.body;
    console.log(`Запрос на сохранение: ID ${tgId}, PLT ${amount}, USDT ${amountUSDT}`);

    if (!tgId) return res.status(400).json({ error: "No tgId" });

    try {
        let user = await User.findOne({ tgId });
        if (!user) user = new User({ tgId });

        // Важно: используем Number() чтобы избежать ошибок формата
        const addPLT = Number(amount) || 0;
        const addUSDT = Number(amountUSDT) || 0;

        user.balancePLT += addPLT;
        user.balanceUSDT += addUSDT;
        await user.save();

        // Бонус пригласившему
        if (user.referredBy) {
            await User.findOneAndUpdate(
                { tgId: user.referredBy },
                { $inc: { balancePLT: addPLT * 0.1, balanceUSDT: addUSDT * 0.1 } }
            );
        }

        res.json({ success: true, balancePLT: user.balancePLT, balanceUSDT: user.balanceUSDT });
    } catch (e) {
        console.error("Save error details:", e);
        res.status(500).json({ error: e.message });
    }
});

const PORT = process.env.PORT || 8080;
mongoose.connect(MONGO_URI).then(() => {
    console.log("MongoDB Connected");
    bot.launch();
    app.listen(PORT, "0.0.0.0", () => console.log(`Server on ${PORT}`));
}).catch(err => console.error("Mongo Connect Error:", err));
