module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (interaction.isCommand()) {
            const { client } = interaction;
            const command = client.bot.commands.get(interaction.commandName);

            if (!command) return;

            try {
                await command.execute(interaction);
                client.bot.logger.log(`${interaction.user.tag} executed /${interaction.commandName} in #${interaction.channel.name}`);
            } catch (error) {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                throw error;
            }
        } else if (interaction.isAutocomplete()) {
            const { client } = interaction;
            const command = client.bot.commands.get(interaction.commandName);

            if (!command) return;

            if (typeof command.handleAutocomplete === 'function') {
                await command.handleAutocomplete(interaction);
            }
        }
    },
};
