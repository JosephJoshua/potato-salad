const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const logger = require('./helpers/logger');
const requireFiles = require('./helpers/requireFiles');

const dotenv = require('dotenv');

dotenv.config();
const { CLIENT_ID, DISCORD_TOKEN, GUILD_ID } = process.env;
const rest = new REST({ version: '9' }).setToken(DISCORD_TOKEN);

const commands = [];

(async () => {
    await requireFiles('commands', command => {
        commands.push(command.data.toJSON());
    });

    try {
        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands },
        );

        logger.logReady(`Reloaded ${commands.length} commands`);
    } catch (error) {
        logger.logError(error);
    }
})();
