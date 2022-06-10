const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Shows a user\'s information')
        .addUserOption(option =>
            option.setName('username')
                .setDescription('Select a user'),
        ),

    async execute(interaction) {
        const { client } = interaction;
        const member = interaction.options.getMember('username') ?? interaction.member;

        const boostingSince = member.premiumSince ? client.bot.formatter.formatDate(member.premiumSince) : 'Not Boosting';
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

        const embed = new client.bot.embeds.DefaultEmbed(client)
            .setTitle(`User information - ${member.displayName}`)
            .setThumbnail(member.displayAvatarURL())
            .addField('Username', member.toString(), true)
            .addField('Joined Server', client.bot.formatter.formatDate(member.joinedAt), true)
            .addField('ID', member.id, true)
            .addField('Created At', client.bot.formatter.formatDate(member.user.createdAt), true)
            .addField('Boosting Since', boostingSince, true)
            .addField('In Voice', isInVoice, true)
            .addField(`Roles (${roleCount})`, roleNames.join(' '));

        await interaction.reply({ embeds: [embed] });
    },
};
