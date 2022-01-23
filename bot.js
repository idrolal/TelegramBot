require('dotenv').config();

const { Telegraf, Markup } = require('telegraf');

const zodiac = require('zodiac-signs')('en-US');
const aztroJs = require('aztro-js');
const translate = require('translate');

const COMM = require('./comm');

translate.engine = 'google';
translate.key = process.env.GOOGLE_KEY;

const sign = ['cancer', 'aries', 'taurus', 'gemini', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start((ctx) => ctx.reply(`Привет, ${ctx.message.from.first_name}!
Если хочешь по дате узнать знак зодиака, то введи дату в формате "ДД ММ", например "09 10".
А если хочешь узнать гороскоп твоего знака зодиака, то посмотри как он пишется в /help
`, Markup.keyboard([
  ['/cancer', '/aries', '/taurus', '/gemini'],
  ['/leo', '/virgo', '/libra', '/scorpio'],
  ['/sagittarius', '/capricorn', '/aquarius', '/pisces'],
  ['/help'],
]).resize()));
bot.help((ctx) => ctx.reply(`Список комманд: ${COMM}`));

bot.command(sign, (ctx) => {
  try {
    aztroJs.getTodaysHoroscope(ctx.message.text.substring(1), async (res) => {
      const text = `Date range: ${res.date_range}
Current date: ${res.current_date}
Compatibility: ${res.compatibility}
Mood: ${res.mood}
Color : ${res.color}
Lucky number: ${res.lucky_number}
Luckytime: ${res.lucky_time}

Daily forecast: ${res.description}
`;
      const trans = await translate(text, { to: 'ru' });
      ctx.reply(trans);
    });
  } catch {
    ctx.reply('Введите правильную комманду. Вам поможет \/help');
  }
});

bot.on('text', async (ctx) => {
  let data = {};
  try {
    data = await zodiac.getSignByDate({ day: ctx.message.text.substring(0, 2), month: ctx.message.text.substring(3, 5) }, 'ru');
    const formatData = `
  Название: ${data.name}
Камень: ${data.stone}
Символ: ${data.symbol}
Начало: ${data.dateMin.substring(5)}
Конец: ${data.dateMax.substring(5)}
  `;
    ctx.reply(formatData);
  } catch {
    ctx.reply('Введите правильную комманду. Вам поможет \/help');
  }
});

bot.hears('hi', (ctx) => ctx.reply('Hey there'));
bot.launch();
