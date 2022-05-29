module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        client.bot.logger.logReady(`Loaded ${client.bot.commands.size} commands and ${client.bot.events.size} events`);
        client.bot.logger.logReady(`Logged in as ${client.user.tag}`);
    },
};
