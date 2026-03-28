const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Telegraf } = require('telegraf');

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = "mongodb+srv://duhistiny6_db_user:0fsJo3M5NzKksZvV@cluster0.wegdg5f.mongodb.net/?appName=Cluster0";
const BOT_TOKEN = "8463237050:AAHzx0IFrrqaJ14mxj17xmhJIOr3P7eLfQ0";
const WEB_APP_URL = "https://duhistiny6-source.github.io/pepe-pilot/"; 

const bot = new Telegraf(BOT_TOKEN);

mongoose.connect(MONGO_URI)
    .then(() => console.log("MongoDB подключена успешно!"))
    .catch(err => console.error("Ошибка базы:", err));

const userSchema = new mongoose.Schema({
    tgId: { type: String, unique: true },
    balancePLT: { type: Number, default: 0 },
    balanceUSDT: { type: Number, default: 0 },
    energy: { type: Number, default: 100 },
    lastEnergyUpdate: { type: Number, default: Date.now } // Время последнего обновления
});
const User = mongoose.model('User', userSchema);

bot.start((ctx) => {
    ctx.reply('Добро пожаловать в Pepe Pilot! 🚀', {
        reply_markup: {
            inline_keyboard: [[{ text: "Играть 🎮", web_app: { url: WEB_APP_URL } }]]
        }
    });
});

// Загрузка данных (с расчетом восстановления энергии)
app.get('/api/user/:id', async (req, res) => {
    try {
        let user = await User.findOne({ tgId: req.params.id });
        if (!user) {
            user = await User.create({ tgId: req.params.id });
        } else {
            // ЛОГИКА ВОССТАНОВЛЕНИЯ: 1 ед. каждые 72 секунды (100 ед за 2 часа)
            const now = Date.now();
            const secondsPassed = Math.floor((now - user.lastEnergyUpdate) / 1000);
            const energyToAdd = Math.floor(secondsPassed / 72);
            
            if (energyToAdd > 0 && user.energy < 100) {
                user.energy = Math.min(100, user.energy + energyToAdd);
                user.lastEnergyUpdate = now;
                await user.save();
            }
        }
        res.json(user);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Сохранение энергии
app.post('/api/energy', async (req, res) => {
    const { tgId, energy } = req.body;
    try {
        await User.findOneAndUpdate(
            { tgId: tgId },
            { energy: energy, lastEnergyUpdate: Date.now() }
        );
        res.json({ success: true });
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер работает на порту ${PORT}`);
    bot.launch();
});
