import { SlashCommandBuilder } from '@discordjs/builders';

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
        .addField('Username', member.user.tag, true)
        .addField('Joined Server', formatDate(member.joinedAt), true)
        .addField('ID', member.id, true)
        .addField('Created At', formatDate(member.user.createdAt), true)
        .addField('Boosting Since', boostingSince, true)
        .addField('In Voice', isInVoice, true)
        .addField(`Roles (${roleCount})`, roleNames.join(' '));

    interaction.reply({ embeds: [embed] });
};
