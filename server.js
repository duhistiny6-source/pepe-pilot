const { Telegraf, Markup } = require('telegraf');

// Токен твоего бота
const bot = new Telegraf( 8463237050:AAHzx0IFrrqaJ14mxj17xmhJIOr3P7eLfQ0 );

// Твой ID для уведомлений
const ADMIN_ID = '8559465665'; 

// Временная база данных (пока сервер запущен)
let users = {}; 

bot.start((ctx) => {
    const userId = ctx.from.id;
    const username = ctx.from.username || "Пилот";
    const refId = ctx.startPayload; 

    if (!users[userId]) {
        users[userId] = { balance: 0, totalRef: 0, invitedBy: refId || null };
        if (refId && users[refId]) {
            bot.telegram.sendMessage(refId, `🔔 По твоей ссылке зашел новый игрок: @${username}!`);
        }
    }

    ctx.reply(`🚀 Добро пожаловать в Pepe Pilot, @${username}!`, Markup.inlineKeyboard([
        [Markup.button.webApp('🎮 Играть', 'https://duhistiny6.github.io/pepe-pilot/')],
        [Markup.button.callback('🤝 Партнёрка', 'partner')],
        [Markup.button.callback('💎 Пополнить баланс', 'deposit')]
    ]));
});

// Меню пополнения
bot.action('deposit', (ctx) => {
    ctx.reply('Выберите валюту для оплаты напрямую мне:', Markup.inlineKeyboard([
        [Markup.button.callback('🔹 TON', 'pay_ton'), Markup.button.callback('💵 USDT (TRC20)', 'pay_usdt')],
        [Markup.button.callback('⬅️ Назад', 'back')]
    ]));
});

bot.action('pay_ton', (ctx) => {
    ctx.reply(`📍 **Мой TON адрес:**\n\n\`UQBZ-j9v-Y20h8yrtlahvFOTvaTK8rR1577NBZjK1GKE16_V\`\n\n⚠️ Переведи монеты и нажми кнопку ниже:`, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([[Markup.button.callback('✅ Я оплатил', 'confirm_pay')]])
    });
});

bot.action('pay_usdt', (ctx) => {
    ctx.reply(`📍 **Мой USDT (TRC20) адрес:**\n\n\`TLYUsaC4wUJyDvvHkTqHFTNw4KUvzAAsYN\`\n\n⚠️ Переведи USDT и нажми кнопку ниже:`, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([[Markup.button.callback('✅ Я оплатил', 'confirm_pay')]])
    });
});

// Уведомление админу
bot.action('confirm_pay', (ctx) => {
    const user = ctx.from.username || ctx.from.id;
    bot.telegram.sendMessage(ADMIN_ID, `💰 ИГРОК @${user} НАЖАЛ "Я ОПЛАТИЛ"!\nПроверь кошелек и начисли баланс.`);
    ctx.reply('✅ Уведомление отправлено админу! Ожидайте зачисления в течение 10-15 минут.');
});

// Партнерка
bot.action('partner', (ctx) => {
    const user = users[ctx.from.id] || { balance: 0, totalRef: 0 };
    const botUser = ctx.botInfo.username;
    const refLink = `https://t.me/${botUser}?start=${ctx.from.id}`;
    
    ctx.reply(`🤝 **Партнёрка (10% тебе)**\n\n💰 Твой доход: ${user.totalRef} руб.\n🔗 Ссылка для друзей:\n${refLink}`,  
    Markup.inlineKeyboard([
        [Markup.button.switchToChat('✉️ Позвать друга', refLink)],
        [Markup.button.callback('⬅️ Назад', 'back')]
    ]));
});

bot.action('back', (ctx) => {
    ctx.reply('Главное меню:', Markup.inlineKeyboard([
        [Markup.button.webApp('🎮 Играть', 'https://duhistiny6.github.io/pepe-pilot/')],
        [Markup.button.callback('🤝 Партнёрка', 'partner')],
        [Markup.button.callback('💎 Пополнить баланс', 'deposit')]
    ]));
});

bot.launch();
console.log("Бот Pepe Pilot успешно запущен!");.


const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Bot is running');
}).listen(process.env.PORT || 8080);

