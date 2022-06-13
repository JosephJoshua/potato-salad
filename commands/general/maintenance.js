import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageActionRow, MessageButton } from 'discord.js';

import DefaultEmbed from '../../helpers/embeds.js';

const startMaintenance = (client, interaction) => {

    client.bot.maintenance = true;

    const embed = new DefaultEmbed(client)
        .setTitle('Maintenance break')
        .setDescription(`
            I'm now in maintenance mode!
            や、優しくしてね！`);

    interaction.update({ embeds: [embed], components: [] });
};

const sendConfirmationMessage = async interaction => {

    const { client } = interaction;
    const collectorDuration = 60_000;

    const embed = new DefaultEmbed(client)
        .setTitle('Maintenance break')
        .setDescription(`
            Are you sure you want to start a maintenance break?
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

        if (i.user.id != interaction.user.id) {
            return i.reply({
                embeds: [
                    new client.bot.embeds.DefaultEmbed(client)
                        .setTitle('Maintenance break')
                        .setDescription('Who are you?! A-an enemy?!'),
                ], ephemeral: true,
            });
        }

        finalButtonInteraction = i;
        collector.stop(i.customId);
    });

    collector.on('end', (_, reason) => {
        if (reason == 'yes') return startMaintenance(client, finalButtonInteraction);
        if (reason == 'no') finalButtonInteraction.deferUpdate(); // Prevent interaction failed error.
        interaction.deleteReply();
    });
};

export const data = new SlashCommandBuilder()
    .setName('maintenance')
    .setDescription('Starts a maintenance break');

export const execute = interaction => {

    const { client } = interaction;

    if (!client.bot.authors.includes(interaction.user.id)) {
        return interaction.reply({
            embeds: [
                new client.bot.embeds.DefaultEmbed(client)
                    .setTitle('Maintenance break')
                    .setDescription('Only my creators can do maintenance on me!'),
            ], ephemeral: true,
        });
    }

    sendConfirmationMessage(interaction);
};
