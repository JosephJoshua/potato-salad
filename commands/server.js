const { SlashCommandBuilder } = require('@discordjs/builders');

const BOOST_TIERS = Object.freeze({
    'NONE': 'Level 0',
    'TIER_1': 'Level 1',
    'TIER_2': 'Level 2',
    'TIER_3': 'Level 3',
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Shows the server\'s information'),

    async execute(interaction) {
        const { client, guild } = interaction;
        const pluralize = client.bot.formatter.pluralize;

        const owner = await guild.fetchOwner();

        const channels = guild.channels.cache;
        const textCount = channels.filter(c => c.type === 'GUILD_TEXT').size;
        const voiceCount = channels.filter(c => c.type === 'GUILD_VOICE').size;

        const embed = new client.bot.embeds.DefaultEmbed(client)
            .setTitle(`Server information - ${guild.name}`)
            .setThumbnail(guild.iconURL())
            .addField('Owner', owner.user.toString(), true)
            .addField('Members', pluralize(guild.memberCount, 'member'), true)
            .addField('ID', guild.id, true)
            .addField('Created At', client.bot.formatter.formatDate(guild.createdAt), true)
            .addField('Boosts', `${guild.premiumSubscriptionCount} (${BOOST_TIERS[guild.premiumTier]})`, true)
            .addField('Channels', `${pluralize(textCount, 'text channel')}\n${pluralize(voiceCount, 'voice channel')}`, true);

        await interaction.reply({ embeds: [embed] });
    },
};
