module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        client.bot.logger.log(`Logged in as ${client.user.tag}.`, client.bot.logger.logTypes.ready);
    },
};
