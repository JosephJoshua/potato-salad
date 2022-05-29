const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const logger = require('./helpers/logger');
const requireFiles = require('./helpers/requireFiles');

const dotenv = require('dotenv');

dotenv.config();
const { CLIENT_ID, DISCORD_TOKEN, GUILD_ID } = process.env;

const commands = requireFiles('./commands', command => {
    logger.log(`Found command: /${command.data.name}.`);
    return command.data.toJSON();
});

const rest = new REST({ version: '9' }).setToken(DISCORD_TOKEN);

(async () => {
    try {
        logger.log(`Reloading ${commands.length} commands.`);

        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands },
        );

        logger.log(`Reloaded ${commands.length} commands.`);
    } catch (error) {
        logger.log(error, logger.logTypes.error);
    }
})();