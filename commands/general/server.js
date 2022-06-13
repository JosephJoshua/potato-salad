import { SlashCommandBuilder } from '@discordjs/builders';

import DefaultEmbed from '../../helpers/embeds.js';
import { formatDate, pluralize } from '../../helpers/formatter.js';

const BOOST_TIERS = Object.freeze({
    'NONE': 'Level 0',
    'TIER_1': 'Level 1',
    'TIER_2': 'Level 2',
    'TIER_3': 'Level 3',
});

export const data = new SlashCommandBuilder()
    .setName('server')
    .setDescription('Shows the server\'s information');

export const execute = async interaction => {

    const { client, guild } = interaction;

    const owner = await guild.fetchOwner();

    const channels = guild.channels.cache;
    const textCount = channels.filter(c => c.type === 'GUILD_TEXT').size;
    const voiceCount = channels.filter(c => c.type === 'GUILD_VOICE').size;

    const embed = new DefaultEmbed(client)
        .setTitle(`Server information - ${guild.name}`)
        .setThumbnail(guild.iconURL())
        .addField('Owner', owner.user.toString(), true)
        .addField('Members', pluralize(guild.memberCount, 'member'), true)
        .addField('ID', guild.id, true)
        .addField('Created At', formatDate(guild.createdAt), true)
        .addField('Boosts', `${guild.premiumSubscriptionCount} (${BOOST_TIERS[guild.premiumTier]})`, true)
        .addField('Channels', `${pluralize(textCount, 'text channel')}\n${pluralize(voiceCount, 'voice channel')}`, true);

    interaction.reply({ embeds: [embed] });
};
