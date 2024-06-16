require('dotenv').config();
const { Telegraf } = require('telegraf');
const fs = require('fs');
const path = require('path');

const bot = new Telegraf(process.env.BOT_TOKEN);

const loadPlugins = (bot, pluginsPath) => {
    fs.readdirSync(pluginsPath).forEach((file) => {
        const pluginPath = path.join(pluginsPath, file);
        if (fs.lstatSync(pluginPath).isFile() && path.extname(pluginPath) === '.js') {
            const plugin = require(pluginPath);
            plugin(bot);
        }
    });
};

loadPlugins(bot, path.join(__dirname, 'plugins'));

bot.launch().then(() => {
    console.log('👏 Bot Online! @cloudcaptcha');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
