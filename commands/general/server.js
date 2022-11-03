import { SlashCommandBuilder } from 'discord.js';

import DefaultEmbed from '../../helpers/embeds.js';
import { formatDate, pluralize } from '../../helpers/formatter.js';

export const data = new SlashCommandBuilder()
    .setName('server')
    .setDescription('Shows the server\'s information');

export const execute = async interaction => {

    const { client, guild } = interaction;

    const owner = await guild.fetchOwner();

    const channels = guild.channels.cache;
    const textCount = channels.filter(c => c.isTextBased()).size;
    const voiceCount = channels.filter(c => c.isVoiceBased()).size;

    const embed = new DefaultEmbed(client)
        .setTitle(`Server information - ${guild.name}`)
        .setThumbnail(guild.iconURL())
        .addFields([
            { name: 'Owner', value: owner.user.toString(), inline: true },
            { name: 'Members', value: pluralize(guild.memberCount, 'member'), inline: true },
            { name: 'ID', value: guild.id, inline: true },
            { name: 'Created At', value: formatDate(guild.createdAt), inline: true },
            { name: 'Boosts', value: `${guild.premiumSubscriptionCount} (Level ${guild.premiumTier})`, inline: true },
            { name: 'Channels', value: `${pluralize(textCount, 'text channel')}\n${pluralize(voiceCount, 'voice channel')}`, inline: true },
        ]);

    interaction.reply({ embeds: [embed] });
};
