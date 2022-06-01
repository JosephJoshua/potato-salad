const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const logger = require('./helpers/logger');
const requireFiles = require('./helpers/requireFiles');

const dotenv = require('dotenv');

dotenv.config();
const { CLIENT_ID, DISCORD_TOKEN, GUILD_ID } = process.env;

const rest = new REST({ version: '9' }).setToken(DISCORD_TOKEN);

(async () => {
    logger.logInit('Loading commands');

    const commands = [];
    await requireFiles('./commands', command => {
        commands.push(command.data.toJSON());
        return `/${command.data.name}`;
    });

    try {
        logger.logInit(`Reloading ${commands.length} commands`);

        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands },
        );

        logger.logReady(`Reloaded ${commands.length} commands`);
    } catch (error) {
        logger.logError(error);
    }
})();
