import { SlashCommandBuilder } from 'discord.js';

import DefaultEmbed from '../../helpers/embeds.js';

export const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Shows the bot\'s ping');

export const execute = async interaction => {

    const { client } = interaction;

    const embed = new DefaultEmbed(client).setTitle('Pong!');
    const reply = await interaction.reply({ embeds: [embed], fetchReply: true });

    const replyEmbed = new DefaultEmbed(client)
        .setTitle('Pong!')
        .setBotThumbnail()
        .addFields([
            { name: 'API', value: `${client.ws.ping}ms` },
            { name: 'Latency', value: `${reply.createdTimestamp - interaction.createdTimestamp}ms` },
        ]);

    interaction.editReply({ embeds: [replyEmbed] });
};
