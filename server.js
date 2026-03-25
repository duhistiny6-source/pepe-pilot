const { Telegraf, Markup } = require('telegraf');
const http = require('http');

// Твой токен уже вставлен
const bot = new Telegraf('8463237050:AAHzx0IFrrqaJ14mxj17xmhJIOr3P7eLfQ0');

// Ссылка на твое приложение в Render
const gameUrl = 'https://pepe-pilot.onrender.com'; 

bot.start((ctx) => {
  ctx.reply(
    'Привет! Готов к полету? Жми кнопку ниже!',
    Markup.inlineKeyboard([
      [Markup.button.webApp('Лететь! 🚀', gameUrl)]
    ])
  );
});

bot.launch().then(() => {
  console.log('Бот Pepe Pilot успешно запущен!');
}).catch((err) => {
  console.error('Ошибка запуска:', err);
});

// Заглушка сервера для Render (чтобы не было ошибки портов)
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Bot is live');
}).listen(process.env.PORT || 8080);
