const { Client, Collection, Intents } = require('discord.js');

const dotenv = require('dotenv');

dotenv.config();
const { DISCORD_TOKEN, npm_package_version } = process.env;

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES] });

const loadCommands = async () => {
    client.bot.commands = new Collection();

    await client.bot.requireFiles('commands', (command, { dir: category }) => {
        client.bot.commands.set(command.data.name, { ...command, category });
    });
};

const loadEvents = async () => {
    client.bot.events = new Collection();

    await client.bot.requireFiles('events', event => {
        client.bot.events.set(event.name, event);

        if (event.once)
            client.once(event.name, (...args) => event.execute(...args));
        else
            client.on(event.name, (...args) => event.execute(...args));

    });

    client.on('warn', info => client.bot.logger.logWarn(info));
    client.on('error', error => client.bot.logger.logError(error));

    process.on('unhandledRejection', error => {
        // 10008: Unknown Message
        // The message has been deleted so we can just ignore it.
        if (error.code == 10008) return;
        client.bot.logger.logError(error);
    });
};

(async () => {
    client.bot = {};

    await require('./helpers/requireFiles')('helpers', (helper, { name }) => {
        client.bot[name] = helper;
    });

    await loadEvents();
    await loadCommands();

    client.bot.version = npm_package_version ?? '1.0.0';
    if (npm_package_version == null) {
        client.bot.logger.logWarn('Missing bot version, start with `npm start` instead');
        client.bot.logger.logWarn(`Using v${client.bot.version} as fallback`);
    }
})();

client.login(DISCORD_TOKEN);
