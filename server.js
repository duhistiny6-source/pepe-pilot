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
    balanceUSDT: { type: Number, default: 0 }
});
const User = mongoose.model('User', userSchema);

bot.start((ctx) => {
    ctx.reply('Добро пожаловать в Pepe Pilot! 🚀', {
        reply_markup: {
            inline_keyboard: [[{ text: "Играть 🎮", web_app: { url: WEB_APP_URL } }]]
        }
    });
});

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер работает на порту ${PORT}`);
    bot.launch();
});
