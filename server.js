const { Telegraf, Markup } = require('telegraf');

// Твой токен, который я увидел на скрине
const bot = new Telegraf('8463237050:AAEY_6qMWI8aw5Uxo3j4wP_ikAov-L65Qm0');

// База данных (в памяти сервера)
let users = {}; 

bot.start((ctx) => {
    const userId = ctx.from.id;
    const refId = ctx.startPayload; 

    if (!users[userId]) {
        users[userId] = { balance: 0, totalRef: 0, invitedBy: refId || null };
        if (refId && users[refId]) {
            ctx.telegram.sendMessage(refId, "🔔 По твоей ссылке зашел новый пилот!");
        }
    }

    ctx.reply('Добро пожаловать в Pepe Pilot!', Markup.inlineKeyboard([
        [Markup.button.webApp('🚀 Играть', 'https://duhistiny6.github.io/pepe-pilot/')],
        [Markup.button.callback('🤝 Партнёрка', 'partner')]
    ]));
});

bot.action('partner', (ctx) => {
    const user = users[ctx.from.id] || { balance: 0, totalRef: 0 };
    const botUsername = ctx.botInfo.username;
    const refLink = `https://t.me/${botUsername}?start=${ctx.from.id}`;
    
    ctx.reply(`🤝 **Партнёрская программа**\n\n💰 Твой доход (10%): ${user.totalRef} руб.\n🔗 Твоя ссылка: ${refLink}`, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
            [Markup.button.switchToChat('✉️ Пригласить друга', refLink)],
            [Markup.button.callback('⬅️ Назад', 'back')]
        ])
    });
});

bot.action('back', (ctx) => {
    ctx.reply('Главное меню:', Markup.inlineKeyboard([
        [Markup.button.webApp('🚀 Играть', 'https://duhistiny6.github.io/pepe-pilot/')],
        [Markup.button.callback('🤝 Партнёрка', 'partner')]
    ]));
});

bot.launch();
console.log("Бот запущен!");
