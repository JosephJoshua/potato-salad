const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');

const startMaintenance = async (client, interaction) => {
    client.bot.maintenance = true;

    const embed = new client.bot.embeds.DefaultEmbed(client)
        .setTitle('Bot maintenance')
        .setDescription(`
            I'm now in maintenance mode! 
            や、優しくしてね！`);

    await interaction.update({
        embeds: [embed],
        components: [],
    });
};

const sendConfirmationMessage = async interaction => {

    const { client } = interaction;
    const collectorDuration = 60_000;

    const embed = new client.bot.embeds.DefaultEmbed(client)
        .setTitle('Bot maintenance')
        .setDescription(`
            Are you sure you want to start a maintenance?
            This will disable the use of commands for all guilds I'm in!`);

    const actionRow = new MessageActionRow().setComponents([
        new MessageButton().setCustomId('yes').setLabel('Yes').setStyle('SUCCESS'),
        new MessageButton().setCustomId('no').setLabel('No').setStyle('DANGER'),
    ]);

    const message = await interaction.reply({
        embeds: [embed],
        components: [actionRow],
        fetchReply: true,
    });

    const collector = await message.createMessageComponentCollector({
        componentType: 'BUTTON',
        time: collectorDuration,
    });

    let finalButtonInteraction = null;

    collector.on('collect', i => {
        finalButtonInteraction = i;
        collector.stop(i.customId);
    });

    collector.on('end', (_, reason) => {
        if (reason == 'yes') startMaintenance(client, finalButtonInteraction);
        else interaction.deleteReply();
    });
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('maintenance')
        .setDescription('Signals to the bot that a maintenance is happening'),

    async execute(interaction) {
        if (!interaction.client.bot.authors.includes(interaction.user.id))
            return interaction.reply({ content: 'Only my creators can do maintenance on me!', ephemeral: true });

        sendConfirmationMessage(interaction);
    },
};
