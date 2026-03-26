const { Telegraf, Markup } = require('telegraf');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// 1. Настройки
const botToken = '8463237050:AAHzx0IFrrqaJ14mxj17xmhJIOr3P7eLfQ0';
const gameUrl = 'https://duhistiny6-source.github.io/pepe-pilot/'; 
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://admin:pass@cluster.mongodb.net/pepegame"; // Сюда потом вставишь ссылку из Atlas

const app = express();
app.use(cors());
app.use(express.json());

const bot = new Telegraf(botToken);

// 2. Модель данных (База данных)
const userSchema = new mongoose.Schema({
    tgId: { type: String, unique: true },
    balancePLT: { type: Number, default: 0 },
    referredBy: { type: String, default: null },
    friends: [{ type: String }]
});
const User = mongoose.model('User', userSchema);

// 3. Логика бота (Команда /start с рефералом)
bot.start(async (ctx) => {
    const startPayload = ctx.payload; // Это то, что идет после ?start=
    const tgId = ctx.from.id.toString();

    // Если зашел по рефералке (например /start ref123)
    if (startPayload && startPayload.startsWith('ref')) {
        const referrerId = startPayload.replace('ref', '');
        
        let user = await User.findOne({ tgId });
        if (!user) {
            // Создаем нового игрока и связываем с пригласителем
            await User.create({ tgId, referredBy: referrerId });
            await User.findOneAndUpdate({ tgId: referrerId }, { $addToSet: { friends: tgId } });
        }
    }

    ctx.reply(
        'Привет! Pepe Pilot готов к взлету. Собирай PLT и приглашай друзей (10% бонус)! 🚀',
        Markup.inlineKeyboard([
            [Markup.button.webApp('Лететь! 🚀', gameUrl)]
        ])
    );
});

// 4. API для Игры (Сохранение баланса)
app.post('/api/collect', async (req, res) => {
    const { tgId, amount } = req.body;
    const user = await User.findOne({ tgId });

    if (user) {
        user.balancePLT += amount;
        await user.save();

        // Начисляем 10% пригласившему (Реферальный бонус)
        if (user.referredBy) {
            const bonus = amount * 0.1;
            await User.findOneAndUpdate({ tgId: user.referredBy }, { $inc: { balancePLT: bonus } });
        }
    }
    res.json({ success: true });
});

// Получение данных игрока (Баланс и друзья)
app.get('/api/user/:tgId', async (req, res) => {
    const user = await User.findOne({ tgId: req.params.tgId });
    if (user) {
        res.json({ balance: user.balancePLT, friendsCount: user.friends.length });
    } else {
        res.json({ balance: 0, friendsCount: 0 });
    }
});

// 5. Запуск всего вместе
const PORT = process.env.PORT || 8080;
mongoose.connect(MONGO_URI).then(() => {
    console.log('База данных подключена');
    bot.launch();
    app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
});
