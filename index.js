const { Client, Collection, Intents } = require('discord.js');

const dotenv = require('dotenv');

dotenv.config();
const { DISCORD_TOKEN, npm_package_version } = process.env;

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES] });

const loadCommands = () => {
    client.bot.commands = new Collection();

    client.bot.requireFiles('./commands', command => {
        client.bot.logger.log(`Loading command: /${command.data.name}.`);
        client.bot.commands.set(command.data.name, command);
    });

    client.bot.logger.log(`Loaded a total of ${client.bot.commands.size} commands.`);
};

const loadEvents = () => {
    client.bot.events = new Collection();

    client.bot.requireFiles('./events', event => {
        client.bot.logger.log(`Loading event: ${event.name}.`);
        client.bot.events.set(event.name, event);

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    });

    client.bot.logger.log(`Loaded a total of ${client.bot.events.size} events.`);

    client.on('warn', info => client.bot.logger.log(info, client.bot.logger.logTypes.warn));
    client.on('error', error => client.bot.logger.log(error, client.bot.logger.logTypes.error));

    process.on('unhandledRejection', error => {
        client.bot.logger.log(error, client.bot.logger.logTypes.error);
    });
};

client.bot = {};

client.bot.colors = require('./helpers/colors');
client.bot.date = require('./helpers/date');
client.bot.logger = require('./helpers/logger');
client.bot.pagination = require('./helpers/pagination');
client.bot.embeds = require('./helpers/embeds');
client.bot.requireFiles = require('./helpers/requireFiles');

loadCommands();
loadEvents();

client.bot.version = npm_package_version ?? '1.0.0';
if (npm_package_version == null) {
    client.bot.logger.log('Missing bot version, start with `npm start` instead', client.bot.logger.logTypes.warn);
    client.bot.logger.log(`Using v${client.bot.version} as fallback`, client.bot.logger.logTypes.warn);
}

client.login(DISCORD_TOKEN);
