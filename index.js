import { parse } from '@ltd/j-toml';
import { Client, Collection, GatewayIntentBits, version as djsVersion } from 'discord.js';
import { readFileSync } from 'node:fs';

import loadModules from './helpers/loadModules.js';
import { logError, logWarn } from './helpers/logger.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });
client.bot = parse(readFileSync('./config.toml'));

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

const loadVersion = () => {

    client.bot.libraryVersion = djsVersion;

    if (!client.bot.version) {
        client.bot.version = '1.0.1';
        logWarn('Missing bot version, set the version in config.toml');
        logWarn(`Using v${client.bot.version} as fallback`);
    }
};

loadCommands();
loadEvents();
loadVersion();

client.login(client.bot.token);
