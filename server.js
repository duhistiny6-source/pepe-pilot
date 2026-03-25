const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf('8463237050:AAEY_6qMWI8aw5Uxo3j4wP_ikAov-L65Qm0');
const ADMIN_ID = 'ТВОЙ_ЛИЧНЫЙ_ID'; // Узнай свой ID в боте @userinfobot и вставь сюда цифры

let users = {}; 

bot.start((ctx) => {
    const userId = ctx.from.id;
    const refId = ctx.startPayload; 

    if (!users[userId]) {
        users[userId] = { balance: 0, totalRef: 0, invitedBy: refId || null };
    }

    ctx.reply('🚀 Pepe Pilot: Готов к полету?', Markup.inlineKeyboard([
        [Markup.button.webApp('🎮 Играть', 'https://duhistiny6.github.io/pepe-pilot/')],
        [Markup.button.callback('🤝 Партнёрка', 'partner')],
        [Markup.button.callback('💎 Пополнить баланс', 'deposit')]
    ]));
});

// Кнопка ПОПОЛНИТЬ
bot.action('deposit', (ctx) => {
    ctx.reply('Выберите валюту для пополнения:', Markup.inlineKeyboard([
        [Markup.button.callback('🔹 TON', 'pay_ton'), Markup.button.callback('💵 USDT (TRC20)', 'pay_usdt')],
        [Markup.button.callback('⬅️ Назад', 'back')]
    ]));
});

// Вывод реквизитов TON
bot.action('pay_ton', (ctx) => {
    ctx.reply(`📍 **Ваш адрес для пополнения TON:**\n\n\`UQBZ-j9v-Y20h8yrtlahvFOTvaTK8rR1577NBZjK1GKE16_V\`\n\n⚠️ После оплаты нажмите кнопку ниже и пришлите скриншот транзакции.`, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([[Markup.button.callback('✅ Я оплатил', 'confirm_pay')]])
    });
});

// Вывод реквизитов USDT
bot.action('pay_usdt', (ctx) => {
    ctx.reply(`📍 **Ваш адрес для пополнения USDT (TRC20):**\n\n\`TLYUsaC4wUJyDvvHkTqHFTNw4KUvzAAsYN\`\n\n⚠️ После оплаты нажмите кнопку ниже и пришлите скриншот транзакции.`, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([[Markup.button.callback('✅ Я оплатил', 'confirm_pay')]])
    });
});

// Подтверждение оплаты
bot.action('confirm_pay', (ctx) => {
    ctx.reply('Пожалуйста, отправьте скриншот чека/транзакции в ответ на это сообщение. Админ проверит его и начислит баланс!');
    // Здесь можно добавить логику ожидания фото, но для начала хватит и этого
});

// Партнерка
bot.action('partner', (ctx) => {
    const user = users[ctx.from.id] || { balance: 0, totalRef: 0 };
    const refLink = `https://t.me/duhistiny6_bot?start=${ctx.from.id}`;
    
    ctx.reply(`🤝 **Партнёрка (10% с пополнений)**\n\n💰 Заработано: ${user.totalRef} руб.\n🔗 Ссылка: ${refLink}`, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([[Markup.button.switchToChat('✉️ Позвать друга', refLink)]])
    });
});

bot.action('back', (ctx) => {
    ctx.reply('Главное меню:', Markup.inlineKeyboard([
        [Markup.button.webApp('🎮 Играть', 'https://duhistiny6.github.io/pepe-pilot/')],
        [Markup.button.callback('🤝 Партнёрка', 'partner')],
        [Markup.button.callback('💎 Пополнить баланс', 'deposit')]
    ]));
});

bot.launch();
