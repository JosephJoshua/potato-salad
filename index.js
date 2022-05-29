const { Client, Collection, Intents } = require('discord.js');

const dotenv = require('dotenv');

dotenv.config();
const { DISCORD_TOKEN, npm_package_version } = process.env;

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES] });

const loadCommands = () => {
    client.bot.logger.logInit('Loading commands');
    client.bot.commands = new Collection();

    client.bot.requireFiles('./commands', command => {
        client.bot.logger.logLoad(`/${command.data.name}`);
        client.bot.commands.set(command.data.name, command);
    });
};

const loadEvents = () => {
    client.bot.logger.logInit('Loading events');
    client.bot.events = new Collection();

    client.bot.requireFiles('./events', event => {
        client.bot.logger.logLoad(`${event.name}`);
        client.bot.events.set(event.name, event);

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    });

    client.on('warn', info => client.bot.logger.logWarn(info));
    client.on('error', error => client.bot.logger.logError(error));

    process.on('unhandledRejection', error => client.bot.logger.logError(error));
};

client.bot = {};

client.bot.colors = require('./helpers/colors');
client.bot.formatter = require('./helpers/formatter');
client.bot.embeds = require('./helpers/embeds');
client.bot.logger = require('./helpers/logger');
client.bot.pagination = require('./helpers/pagination');
client.bot.requireFiles = require('./helpers/requireFiles');

client.bot.version = npm_package_version ?? '1.0.0';
if (npm_package_version == null) {
    client.bot.logger.logWarn('Missing bot version, start with `npm start` instead');
    client.bot.logger.logWarn(`Using v${client.bot.version} as fallback`);
}

loadCommands();
loadEvents();

client.login(DISCORD_TOKEN);
