const { SlashCommandBuilder } = require('@discordjs/builders');

const boostTiers = {
    'NONE': 'Level 0',
    'TIER_1': 'Level 1',
    'TIER_2': 'Level 2',
    'TIER_3': 'Level 3',
};

const pluralize = (count, word, suffix = 's') => {
    if (count === 1) return `${count} ${word}`;
    return `${count} ${word}${suffix}`;
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Shows the server\'s information'),

    async execute(interaction) {
        const { client, guild } = interaction;

        const owner = await guild.fetchOwner();

        const channels = guild.channels.cache;
        const textCount = channels.filter(c => c.type === 'GUILD_TEXT').size;
        const voiceCount = channels.filter(c => c.type === 'GUILD_VOICE').size;

        const embed = new client.bot.embeds.DefaultEmbed(client)
            .setTitle(`Server information - ${guild.name}`)
            .setThumbnail(guild.iconURL())
            .addField('ID', guild.id, true)
            .addField('Owner', owner.user.tag, true)
            .addField('Members', pluralize(guild.memberCount, 'member'), true)
            .addField('Created At', client.bot.date.formatDate(guild.createdAt), true)
            .addField('Boosts', `${guild.premiumSubscriptionCount} (${boostTiers[guild.premiumTier]})`, true)
            .addField('Channels', `${pluralize(textCount, 'text channel')}\n${pluralize(voiceCount, 'voice channel')}`, true);

        await interaction.reply({ embeds: [embed] });
    },
};
