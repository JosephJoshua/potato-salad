import { SlashCommandBuilder } from 'discord.js';

import DefaultEmbed from '../../helpers/embeds.js';

export const data = new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Shows a user\'s avatar')
    .addUserOption(option =>
        option.setName('username')
            .setDescription('Select a user'),
    );

export const execute = interaction => {

    const member = interaction.options.getMember('username') ?? interaction.member;

    const embed = new DefaultEmbed(interaction.client)
        .setTitle(`Avatar - ${member.displayName}`)
        .setImage(member.displayAvatarURL({ size: 4096 }));

    interaction.reply({ embeds: [embed] });
};
