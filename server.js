const { Telegraf, Markup } = require('telegraf');
const http = require('http');

// 1. Твой токен
const bot = new Telegraf('8463237050:AAHzx0IFrrqaJ14mxj17xmhJIOr3P7eLfQ0');

// 2. Твоя РЕАЛЬНАЯ ссылка из BotFather (теперь точно правильная)
const gameUrl = 'https://duhistiny6-source.github.io/pepe-pilot/'; 

bot.start((ctx) => {
  ctx.reply(
    'Привет! Pepe Pilot готов к взлету. Жми на кнопку ниже, чтобы запустить игру!',
    Markup.inlineKeyboard([
      [Markup.button.webApp('Лететь! 🚀', gameUrl)]
    ])
  );
});

bot.launch().then(() => {
  console.log('Бот Pepe Pilot успешно запущен!');
}).catch((err) => {
  console.error('Ошибка запуска бота:', err);
});

// 3. Сервер для Render (чтобы всё работало стабильно)
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Bot is working perfectly');
}).listen(process.env.PORT || 8080);
