import { Client, Collection, Intents, version } from 'discord.js';
import { config } from 'dotenv';

import { logError, logWarn } from './helpers/logger.js';
import loadModules from './helpers/loadModules.js';

config();
const { DISCORD_TOKEN, npm_package_version } = process.env;

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES] });

const loadCommands = () => {

    client.bot.commands = new Collection();

    loadModules('commands', (command, { name, dir: category }) => {
        client.bot.commands.set(name, { ...command, category });
    });
};

const loadEvents = () => {

    loadModules('events', (event, { name }) => {

        if (name == 'ready')
            client.once(name, (...args) => event(...args));
        else
            client.on(name, (...args) => event(...args));
    });

    client.on('warn', info => logWarn(info));
    client.on('error', error => logError(error));

    process.on('unhandledRejection', error => {
        // 10008: Unknown Message
        // The message has been deleted so we can just ignore it.
        if (error.code == 10008) return;
        logError(error);
    });
};

client.bot = {};

loadEvents();
loadCommands();

client.bot.authors = [
    '694499855174992032',
    '217518123606081536',
];

client.bot.libraryVersion = version;

client.bot.version = npm_package_version ?? '1.0.0';
if (!npm_package_version) {
    logWarn('Missing bot version, start with `npm start` instead');
    logWarn(`Using v${client.bot.version} as fallback`);
}

client.login(DISCORD_TOKEN);
