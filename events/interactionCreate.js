module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isCommand()) return;

        const { client } = interaction;
        const command = client.bot.commands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute(interaction);
            client.bot.logger.log(`${interaction.user.tag} executed /${interaction.commandName} in #${interaction.channel.name}.`, client.bot.logger.logTypes.command);
        } catch (error) {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            throw error;
        }
    },
};
