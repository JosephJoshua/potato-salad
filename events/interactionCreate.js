import DefaultEmbed from '../helpers/embeds.js';
import { logCommand } from '../helpers/logger.js';
import time from '../helpers/time.js';

const generateMaintenanceEmbed = client => {
    return new DefaultEmbed(client)
        .setTitle('Maintenance break')
        .setDescription('I\'m currently under maintenance! I know you\'ll miss me a lot so I\'ll come back as soon as possible!')
        .setBotThumbnail();
};

export default async interaction => {

    if (interaction.isCommand()) {

        const { client } = interaction;
        const command = client.bot.commands.get(interaction.commandName);

        if (!command) return;

        if (client.bot.maintenance)
            return interaction.reply({ embeds: [generateMaintenanceEmbed(client)] });

        try {
            const runtime = await time(async () => await command.execute(interaction));
            logCommand(`${interaction.user.tag} executed /${interaction.commandName} in #${interaction.channel.name}`, runtime);
        } catch (error) {
            interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            throw error;
        }

    } else if (interaction.isAutocomplete()) {

        const { client } = interaction;
        const command = client.bot.commands.get(interaction.commandName);

        if (!command) return;

        if (typeof command.handleAutocomplete === 'function')
            command.handleAutocomplete(interaction);
    }
};
