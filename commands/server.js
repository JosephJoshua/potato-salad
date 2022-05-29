const { SlashCommandBuilder } = require('@discordjs/builders');

const boostTiers = {
    'NONE': 'Level 0',
    'TIER_1': 'Level 1',
    'TIER_2': 'Level 2',
    'TIER_3': 'Level 3',
};

const pluralize = (count, word, suffix = 's') => {
    if (count === 1) {
        return word;
    } else {
        return word + suffix;
    }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Shows the server\'s information'),

    async execute(interaction) {
        const { client, guild } = interaction;

        const owner = await guild.fetchOwner();

        const memberCount = guild.memberCount;
        const membersText = `${memberCount} ${pluralize(memberCount, 'member')}`;

        const channels = guild.channels.cache;
        const tcCount = channels.filter(c => c.type === 'GUILD_TEXT').size;
        const vcCount = channels.filter(c => c.type === 'GUILD_VOICE').size;
        const channelsText =
            `${tcCount} text ${pluralize(tcCount, 'channel')}\n` +
            `${vcCount} voice ${pluralize(vcCount, 'channel')}`;

        const boostTier = boostTiers[guild.premiumTier];
        const boostsText = `${guild.premiumSubscriptionCount} (${boostTier})`;

        const embed = new client.bot.embeds.DefaultEmbed(client)
            .setTitle(`Server information - ${guild.name}`)
            .setThumbnail(guild.iconURL())
            .addField('ID', guild.id, true)
            .addField('Owner', owner.user.tag, true)
            .addField('Members', membersText, true)
            .addField('Created At', client.bot.date.formatDate(guild.createdAt), true)
            .addField('Boosts', boostsText, true)
            .addField('Channels', channelsText, true);

        await interaction.reply({ embeds: [embed] });
    },
};
