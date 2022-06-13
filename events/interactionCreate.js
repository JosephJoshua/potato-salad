module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (interaction.isCommand()) {
            const { client } = interaction;
            const command = client.bot.commands.get(interaction.commandName);

            if (!command) return;
            if (client.bot.maintenance)
                return await interaction.reply('I\'m currently under maintenance! I know you\'ll miss me a lot so I\'ll try my best to come back as quick as possible!');

            try {
                const runtime = await client.bot.time(async () => await command.execute(interaction));
                client.bot.logger.logCommand(`${interaction.user.tag} executed /${interaction.commandName} in #${interaction.channel.name}`, runtime);
            } catch (error) {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                throw error;
            }
        } else if (interaction.isAutocomplete()) {
            const { client } = interaction;
            const command = client.bot.commands.get(interaction.commandName);

            if (!command) return;

            if (typeof command.handleAutocomplete === 'function')
                command.handleAutocomplete(interaction);
        }
    },
};
