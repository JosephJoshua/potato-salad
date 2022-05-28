module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        client.logger.log(`Logged in as ${client.user.tag}.`, client.logger.logTypes.ready);
    },
};
