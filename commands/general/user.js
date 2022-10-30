import { SlashCommandBuilder } from 'discord.js';

import DefaultEmbed from '../../helpers/embeds.js';
import { formatDate } from '../../helpers/formatter.js';

export const data = new SlashCommandBuilder()
    .setName('user')
    .setDescription('Shows a user\'s information')
    .addUserOption(option =>
        option.setName('username')
            .setDescription('Select a user'),
    );

export const execute = interaction => {

    const { client } = interaction;
    const member = interaction.options.getMember('username') ?? interaction.member;

    const boostingSince = member.premiumSince ? formatDate(member.premiumSince) : 'Not Boosting';
    const isInVoice = member.voice.channel ? 'Yes' : 'No';

    const EMBED_FIELD_LIMIT = 1024;
    const ROLE_LENGTH = 22;
    const ellipses = '...';
    const separator = ' ';

    const maxRoleCount = Math.floor((EMBED_FIELD_LIMIT - ellipses.length) / (ROLE_LENGTH + separator.length));

    const roles = member.roles.cache;
    let roleNames = roles
        .filter(r => r.position) // Exclude @everyone at position 0.
        .map(r => r.toString());

    const roleCount = roleNames.length;
    if (roleCount > maxRoleCount) {
        roleNames = roleNames.slice(0, maxRoleCount);
        roleNames.push(ellipses);
    }

    const embed = new DefaultEmbed(client)
        .setTitle(`User information - ${member.displayName}`)
        .setThumbnail(member.displayAvatarURL())
        .addFields([
            { name: 'Username', value: member.user.tag, inline: true },
            { name: 'Joined Server', value: formatDate(member.joinedAt), inline: true },
            { name: 'ID', value: member.id, inline: true },
            { name: 'Created At', value: formatDate(member.user.createdAt), inline: true },
            { name: 'Boosting Since', value: boostingSince, inline: true },
            { name: 'In Voice', value: isInVoice, inline: true },
            { name: `Roles (${roleCount})`, value: roleNames.join(' '), inline: true },
        ]);

    interaction.reply({ embeds: [embed] });
};
