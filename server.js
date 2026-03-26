const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ВСТАВЬ СВОЮ ССЫЛКУ ИЗ MONGODB ATLAS НИЖЕ
const MONGO_URI = "mongodb+srv://твой_логин:твой_пароль@cluster.mongodb.net/myDatabase?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
    .then(() => console.log("MongoDB подключена"))
    .catch(err => console.error("Ошибка базы:", err));

const userSchema = new mongoose.Schema({
    tgId: { type: String, unique: true },
    balancePLT: { type: Number, default: 0 },
    balanceUSDT: { type: Number, default: 0 },
    friendsCount: { type: Number, default: 0 }
});

const User = mongoose.model('User', userSchema);

// Получение данных игрока
app.get('/api/user/:id', async (req, res) => {
    try {
        let user = await User.findOne({ tgId: req.params.id });
        if (!user) user = await User.create({ tgId: req.params.id });
        res.json(user);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Сохранение монет (то самое исправление)
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
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
