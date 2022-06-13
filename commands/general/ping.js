import { SlashCommandBuilder } from '@discordjs/builders';

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
        .addField('API', `${client.ws.ping}ms`)
        .addField('Latency', `${reply.createdTimestamp - interaction.createdTimestamp}ms`);

    interaction.editReply({ embeds: [replyEmbed] });
};
