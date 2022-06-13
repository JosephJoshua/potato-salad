import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { config } from 'dotenv';

import loadModules from './helpers/loadModules.js';
import { logError, logReady } from './helpers/logger.js';

config();
const { CLIENT_ID, DISCORD_TOKEN, GUILD_ID } = process.env;
const rest = new REST({ version: '9' }).setToken(DISCORD_TOKEN);

const commands = [];

(async () => {
    await loadModules('commands', command => {
        commands.push(command.data.toJSON());
    });

    try {
        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands },
        );

        logReady(`Reloaded ${commands.length} commands`);
    } catch (error) {
        logError(error);
    }
})();
