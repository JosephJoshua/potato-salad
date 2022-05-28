const fs = require('node:fs');
const path = require('node:path');

const { Client, Collection, Intents } = require('discord.js');

const dotenv = require('dotenv');

dotenv.config();

const { DISCORD_TOKEN } = process.env;

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
client.commands = new Collection();

function loadHelpers() {
    client.logger = require('./helpers/logger');
}

function loadCommands() {
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    client.logger.log(`Loading a total of ${commandFiles.length} commands.`, client.logger.logTypes.log);

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        client.logger.log(`Loading command: /${command.data.name}.`, client.logger.logTypes.log);
        client.commands.set(command.data.name, command);
    }
}

function loadEvents() {
    const eventsPath = path.join(__dirname, 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    client.logger.log(`Loading a total of ${eventFiles.length} events.`, client.logger.logTypes.log);

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);

        client.logger.log(`Loading event: ${event.name}.`, client.logger.logTypes.log);

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
}

loadHelpers();
loadCommands();
loadEvents();

client.login(DISCORD_TOKEN);

client.on('error', error => client.logger.log(error, client.logger.logTypes.error))
    .on('warn', info => client.logger.log(info, client.logger.logTypes.warn));

process.on('unhandledRejection', error => {
    client.logger.log(error, client.logger.logTypes.error);
});