import { parse } from '@ltd/j-toml';
import { REST, Routes } from 'discord.js';
import { readFileSync } from 'node:fs';

import { pluralize } from './helpers/formatter.js';
import loadModules from './helpers/loadModules.js';
import { logError, logReady } from './helpers/logger.js';

const commands = [];
const bot = parse(readFileSync('./config.toml'));
const rest = new REST({ version: '10' }).setToken(bot.token);

(async () => {
    await loadModules('commands', command => {
        commands.push(command.data.toJSON());
    });

    try {
        await Promise.all(bot.guilds.map(guild => {
            return rest.put(
                Routes.applicationGuildCommands(bot.id, guild.id),
                { body: commands },
            );
        }));

        logReady(`Reloaded ${pluralize(commands.length, 'command')} in ${pluralize(bot.guilds.length, 'guild')}`);
    } catch (error) {
        logError(error);
    }
})();
