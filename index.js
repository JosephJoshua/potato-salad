const { Client, Collection, Intents } = require('discord.js');

const dotenv = require('dotenv');

dotenv.config();
const { DISCORD_TOKEN } = process.env;

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const loadHelpers = () => {
    client.logger = require('./helpers/logger');
    client.requireFiles = require('./helpers/requireFiles');
};

const loadCommands = () => {
    client.commands = new Collection();

    client.requireFiles('./commands', command => {
        client.logger.log(`Loading command: /${command.data.name}.`, client.logger.logTypes.log);
        client.commands.set(command.data.name, command);
    });

    client.logger.log(`Loaded a total of ${client.commands.size} commands.`, client.logger.logTypes.log);
};

const loadEvents = () => {
    client.events = new Collection();

    client.requireFiles('./events', event => {
        client.logger.log(`Loading event: ${event.name}.`, client.logger.logTypes.log);
        client.events.set(event.name, event);

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    });

    client.logger.log(`Loaded a total of ${client.events.size} events.`, client.logger.logTypes.log);
};

loadHelpers();
loadCommands();
loadEvents();

client.login(DISCORD_TOKEN);

client.on('error', error => client.logger.log(error, client.logger.logTypes.error))
    .on('warn', info => client.logger.log(info, client.logger.logTypes.warn));

process.on('unhandledRejection', error => {
    client.logger.log(error, client.logger.logTypes.error);
});
