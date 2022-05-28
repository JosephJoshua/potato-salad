module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isCommand()) return;

        const client = interaction.client;
        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute(interaction);
            client.logger.log(`${interaction.user.tag} executed /${interaction.commandName} in #${interaction.channel.name}.`, client.logger.logTypes.command);
        } catch (error) {
            client.logger.log(error, client.logger.logTypes.error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    },
};
