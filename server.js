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

// --- МОДЕЛЬ ДАННЫХ (ИСПРАВЛЕНО: Добавлен balanceUSDT) ---
const userSchema = new mongoose.Schema({
    tgId: { type: String, unique: true },
    balancePLT: { type: Number, default: 0 },
    balanceUSDT: { type: Number, default: 0 }, // Теперь USDT будут сохраняться
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

    ctx.reply('🚀 Добро пожаловать в Pepe Pilot!\n\nЗа каждого друга ты получаешь 10% от его заработка пожизненно!',
        Markup.inlineKeyboard([[Markup.button.webApp('Играть! 🎮', gameUrl)]])
    );
});

// --- API ДЛЯ ИГРЫ ---
// 1. Получить данные игрока (теперь возвращает и USDT)
app.get('/api/user/:tgId', async (req, res) => {
    try {
        let user = await User.findOne({ tgId: req.params.tgId });
        if (!user) user = { balancePLT: 0, balanceUSDT: 0, friendsCount: 0 };
        res.json(user);
    } catch (e) { res.status(500).json(e); }
});

// 2. Сохранить улов PLT и USDT + 10% рефереру
app.post('/api/collect', async (req, res) => {
    const { tgId, amount, amountUSDT } = req.body; // Принимаем оба типа монет
    try {
        const user = await User.findOne({ tgId });
        if (user) {
            // Прибавляем PLT и USDT
            user.balancePLT += (amount || 0);
            user.balanceUSDT += (amountUSDT || 0);
            await user.save();

            // Бонус рефереру (10% от обоих валют)
            if (user.referredBy) {
                const bonusPLT = (amount || 0) * 0.1;
                const bonusUSDT = (amountUSDT || 0) * 0.1;
                await User.findOneAndUpdate(
                    { tgId: user.referredBy }, 
                    { $inc: { balancePLT: bonusPLT, balanceUSDT: bonusUSDT } }
                );
            }
        }
        res.json({ success: true });
    } catch (e) { res.status(500).json(e); }
});

// --- ЗАПУСК (Настройки для Render) ---
const PORT = process.env.PORT || 8080; 

mongoose.connect(MONGO_URI).then(() => {
    console.log("MongoDB connected!");
    bot.launch();
    
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(err => {
    console.error("MongoDB connection error:", err);
});
