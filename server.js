const { Telegraf, Markup } = require('telegraf');
const http = require('http');

// 1. Твой токен (уже вставлен)
const bot = new Telegraf('8463237050:AAHzx0IFrrqaJ14mxj17xmhJIOr3P7eLfQ0');

// 2. Ссылка на игру в GitHub Pages (замени 'ИМЯ_АККАУНТА' на свой логин GitHub)
// Если твой логин duhistiny6, то ссылка будет: https://duhistiny6.github.io/pepe-pilot/
const gameUrl = 'https://duhistiny6.github.io/pepe-pilot/'; 

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

// 3. Мини-сервер для Render, чтобы он не отключал бота
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Server is running');
}).listen(process.env.PORT || 8080);
